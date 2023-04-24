---
title: hello-metal.4 动画
date: 2022-04-04 16:20:24
tags:
  - Metal
  - GameEngine
categories:
  - HelloMetal系列
---

这个系列是我用来学习 Metal API 的笔记，我的最终目的是希望实现一个基于 Metal 的游戏引擎。

目前系列有:

{% post_link hello-metal-1 %}

<br>

{% post_link hello-metal-2 %}

<br>

{% post_link hello-metal-3 %}

<br>

{% post_link hello-metal-4 %}

<br>

{% post_link hello-metal-5 %}

------

<div>

点击查看上一篇 {% post_link hello-metal-3 %}
<p>
</div>

在上一篇已经完成了四边形的绘制，这一篇我们来实现一个简单的动画效果。

## 动起来

现在我们需要增加一个结构体，用来保存画面的偏移，这样每次画面更新的时候，我们都可以使用偏移来控制顶点的坐标，达到动画的效果。

### 增加存储数据的结构体

在 Renderer 中增加一个结构体，用来保存动画的值，增加一个 Float 类型的变量，保存每帧时间。

```swift
struct Constants {
    var animateBy: Float = 0
}
var constants = Constants()
var time: Float = 0
```

### 计算每帧移动的距离

在 draw 函数中，我们使用画面的最佳刷新率作为累加值。

```swift
time += 1 / Float(view.preferredFramesPerSecond)

let animateBy = abs(sin(time) / 2 + 0.5)
constants.animateBy = animateBy
```

### 发送数据到 GPU

然后我们将结构体放进 GPU 中，MTLCommandEncoder 提供了 setVertexBytes 函数来保存数据。

```swift
commandEncoder?.setVertexBytes(&constants,
                               length: MemoryLayout<Constants>.stride,
                               index: 1)
```

我们为这个数据设置一个索引值 1，这样我们就可以在着色器代码中访问了。

### 修改着色器

```c++
struct Constants {
    float animateBy;
};

vertex float4 vertex_shader(const device packed_float3 *vertices [[ buffer(0) ]],
                            constant Constants &constants [[ buffer(1) ]],
                            uint vertexId [[ vertex_id ]]) {
    float4 position = float4(vertices[vertexId], 1);
    position.x += constants.animateBy;
    return position;
}
```

我们只需要在着色器代码中增加一个 struct，保持相同的内存布局，然后在函数参数中使用 `constant` 修饰结构体和buffer。

`const` 和 `constant` 的不同在于，`constant` 是地址空间，`const` 是类型限定符。

现在我们再跑一下，就可以看到一个动画效果了。

{% raw %}
<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
<iframe src="//player.bilibili.com/player.html?bvid=BV1e34y1x7qz" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; width: 100%; height: 100%; Left: 0; top: 0;" ></iframe></div>
{% endraw %}

## 完整代码

```swift
//
//  Renderer.swift
//  HelloMetal
//
//  Created by lxz on 2022/4/4.
//

import MetalKit

enum Colors {
    static let wenderlichGreen = MTLClearColor(red: 0.0,
                                               green: 0.4,
                                               blue: 0.21,
                                               alpha: 1.0)
}

class Renderer: NSObject {
    let device: MTLDevice
    let commandQueue: MTLCommandQueue
    var vertices: [Float] = [
        -1,  1, 0, // 左上角
        -1, -1, 0, // 左下角
         1, -1, 0, // 右下角
         1,  1, 0, // 右上角
    ]
    let indices: [UInt16] = [
        0, 1, 2, // 左边的三角形
        2, 3, 0  // 右边的三角形
    ]
    var pipelineState: MTLRenderPipelineState?
    var vertexBuffer: MTLBuffer?
    var indexBuffer: MTLBuffer?

    struct Constants {
        var animateBy: Float = 0
    }
    var constants = Constants()
    var time: Float = 0

    init(device: MTLDevice) {
        self.device = device
        commandQueue = device.makeCommandQueue()!
        super.init()
        buildModel()
        buildPipelineState()
    }

    private func buildModel() {
        vertexBuffer = device.makeBuffer(bytes: vertices,
                                         length: vertices.count * MemoryLayout<Float>.size,
                                         options: [])
        indexBuffer = device.makeBuffer(bytes: indices,
                                        length: indices.count * MemoryLayout<UInt16>.size,
                                        options: [])
    }

    private func buildPipelineState() {
        let library = device.makeDefaultLibrary()
        let vertexFunction = library?.makeFunction(name: "vertex_shader")
        let fragmentFunction = library?.makeFunction(name: "fragment_shader")

        let pipelineDescriptor = MTLRenderPipelineDescriptor()
        pipelineDescriptor.vertexFunction = vertexFunction
        pipelineDescriptor.fragmentFunction = fragmentFunction
        pipelineDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm

        do {
            pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        } catch let error as NSError {
            print("error: \(error.localizedDescription)")
        }
    }
}

extension Renderer: MTKViewDelegate {
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
    }
    func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let pipelineState = pipelineState,
              let indexBuffer = indexBuffer,
              let descriptor = view.currentRenderPassDescriptor
        else {
            return
        }

        time += 1 / Float(view.preferredFramesPerSecond)

        let animateBy = abs(sin(time) / 2 + 0.5)
        constants.animateBy = animateBy

        let commandBuffer = commandQueue.makeCommandBuffer()
        let commandEncoder = commandBuffer?.makeRenderCommandEncoder(descriptor: view.currentRenderPassDescriptor!)

        commandEncoder?.setRenderPipelineState(pipelineState)
        commandEncoder?.setVertexBuffer(vertexBuffer,
                                        offset: 0,
                                        index: 0)

        commandEncoder?.setVertexBytes(&constants,
                                       length: MemoryLayout<Constants>.stride,
                                       index: 1)

        commandEncoder?.drawIndexedPrimitives(type: .triangle,
                                              indexCount: indices.count,
                                              indexType: .uint16,
                                              indexBuffer: indexBuffer,
                                              indexBufferOffset: 0)

        commandEncoder?.endEncoding()
        commandBuffer?.present(view.currentDrawable!)
        commandBuffer?.commit()
    }
}
```

```c++
//
//  Shader.metal
//  HelloMetal
//
//  Created by lxz on 2022/4/4.
//

#include <metal_stdlib>
using namespace metal;

struct Constants {
    float animateBy;
};

vertex float4 vertex_shader(const device packed_float3 *vertices [[ buffer(0) ]],
                            constant Constants &constants [[ buffer(1) ]],
                            uint vertexId [[ vertex_id ]]) {
    float4 position = float4(vertices[vertexId], 1);
    position.x += constants.animateBy;
    return position;
}

fragment half4 fragment_shader() {
    return half4(1, 0, 0, 1);
}
```

```swift
//
//  ViewController.swift
//  HelloMetal
//
//  Created by lxz on 2022/4/4.
//

import UIKit
import MetalKit

class ViewController: UIViewController {
    var metalView: MTKView {
        return view as! MTKView
    }
    var renderer: Renderer!
    override func viewDidLoad() {
        super.viewDidLoad()
        metalView.device = MTLCreateSystemDefaultDevice()
        metalView.clearColor = Colors.wenderlichGreen
        renderer = Renderer(device: metalView.device!)
        metalView.delegate = renderer
    }
}
```
