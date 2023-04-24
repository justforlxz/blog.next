---
title: How to use cuda with deepin
date: 2022-02-25 10:06:05
tags: Linux
categories:
  - Solution
---


CUDA（Compute Unified Device Architecture，统一计算架构）是由NVIDIA所推出的一种集成技术，是该公司对于GPGPU的正式名称。通过这个技术，用户可利用NVIDIA的GeForce 8以后的GPU和较新的Quadro GPU进行计算。亦是首次可以利用GPU作为C-编译器的开发环境。NVIDIA营销的时候，往往将编译器与架构混合推广，造成混乱。实际上，CUDA可以兼容OpenCL或者自家的C-编译器。无论是CUDA C-语言或是OpenCL，指令最终都会被驱动程序转换成PTX代码，交由显示核心计算。

在论坛上看到有些用户希望在 deepin 下使用 CUDA，但是他们采取的做法往往是手动下载nvidia的二进制文件，直接进行安装。

但是这样会破坏一部分的 glx 链接，导致卸载的时候无法彻底恢复，结果就是系统因为卸载nvidia驱动而废掉，所以我强烈推荐使用包管理器的方式安装 nvidia 驱动和 CUDA 相关的东西，尽量不要手动修改。

在其他发行版，例如 arch，安装 NVIDIA 包会提供一个配置文件自动加载对应的内核模块，而 deepin 的包是来自 debian，debian 并没有做这个事情，这就导致在 deepin 上安装 NVIDIA 驱动后，
显示相关的内核模块会被 X 加载，而 CUDA 相关的内核模块并不会被加载，所以我们对包进行了修改，添加了自动加载内核模块的配置文件。

## 安装依赖

如果想要直接使用 CUDA 的开发头文件，那么需要安装以下的包，不过会依赖很多nvidia的库，总量还是有一些的。

```shell
sudo apt install nvidia-cuda-dev nvidia-cuda-toolkit
```

现在，重启一下系统就可以正常使用了。如果不想重启系统，可以手动执行命令加载内核模块。

```shell
sudo modprobe nvidia_uvm
```

## CUDA 小例子

[这里有个小栗子，可以用来测试 CUDA 是否能够成功编译和运行](https://bingliu221.gitbooks.io/learn-cuda-the-simple-way/content/chapter2.html/)

**将以下代码保存为 main.cu**

```c++
#include <stdio.h>

__global__ void vector_add(const int *a, const int *b, int *c) {
    *c = *a + *b;
}

int main(void) {
    const int a = 2, b = 5;
    int c = 0;

    int *dev_a, *dev_b, *dev_c;

    cudaMalloc((void **)&dev_a, sizeof(int));
    cudaMalloc((void **)&dev_b, sizeof(int));
    cudaMalloc((void **)&dev_c, sizeof(int));

    cudaMemcpy(dev_a, &a, sizeof(int), cudaMemcpyHostToDevice);
    cudaMemcpy(dev_b, &b, sizeof(int), cudaMemcpyHostToDevice);

    vector_add<<<1, 1>>>(dev_a, dev_b, dev_c);

    cudaMemcpy(&c, dev_c, sizeof(int), cudaMemcpyDeviceToHost);

    printf("%d + %d = %d, Is that right?\n", a, b, c);

    cudaFree(dev_a);
    cudaFree(dev_b);
    cudaFree(dev_c);

    return 0;
}
```

编译:

```
nvcc main.cu
```

运行:

```
./a.out
```

如果一切顺利，在编译的时候就不会有报错，不过在我的环境下nvcc会有架构被弃用的警告，本着只要不error就算没事的原则，我们无视这条警告即可。

输出结果:

```
2 + 5 = 0, Is that right?
```

## Machine Learning 测试

既然都用上 Nvidia 显卡和 CUDA 驱动了，那肯定是要炼一个丹呀。

先安装 Anaconda，这是一个 python 的发行版，提供了一个完整的科学计算环境，包括 NumPy、SciPy 等常用科学计算库。当然，你有权选择自己喜欢的 Python 环境。

可以根据 anaconda 官方教程来安装 [https://docs.conda.io/en/latest/miniconda.html#linux-installers](https://docs.conda.io/en/latest/miniconda.html#linux-installers)

创建一个存放 tensorflow demo 的目录。

```shell
mkdir tensorflow
```

使用 conda 创建一个新的环境。

```shell
cd tensorflow
conda create --name tf2 python=3.7      # “tf2”是你建立的conda虚拟环境的名字
conda activate tf2                      # 进入名为“tf2”的conda虚拟环境
```

这时候我们就会看到shell中会提示一个 `(tf2)`，说明当前 shell 使用的是 conda venv 环境，我们可以在当前环境中安装各种依赖包。

为了能正常使用 tensorflow，我们还需要安装 cudnn，可以通过 anaconda 来安装。

```shell
(tf2) $ conda install -c anaconda cudnn tensorflow-gpu
```

当环境准备就绪，我们创建一个 tf.py 文件，将测试代码写入：

```python
#!/usr/bin/env python3

import tensorflow as tf

mnist = tf.keras.datasets.mnist

(x_train, y_train),(x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

model.fit(x_train, y_train, epochs=5)
model.evaluate(x_test, y_test)
```

执行这个 py 文件，就可以看到开始自动炼丹。

```shell
(tf2) ~/tensorflow$ python tf.py
2022-01-06 22:12:31.752249: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcuda.so.1
2022-01-06 22:12:31.787298: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.787645: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1561] Found device 0 with properties:
pciBusID: 0000:01:00.0 name: NVIDIA GeForce RTX 3070 computeCapability: 8.6
coreClock: 1.815GHz coreCount: 46 deviceMemorySize: 7.79GiB deviceMemoryBandwidth: 417.29GiB/s
2022-01-06 22:12:31.788616: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcudart.so.10.1
2022-01-06 22:12:31.802163: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcublas.so.10
2022-01-06 22:12:31.811230: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcufft.so.10
2022-01-06 22:12:31.813348: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcurand.so.10
2022-01-06 22:12:31.832304: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcusolver.so.10
2022-01-06 22:12:31.837966: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcusparse.so.10
2022-01-06 22:12:31.874633: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcudnn.so.7
2022-01-06 22:12:31.874864: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.875707: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.876401: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1703] Adding visible gpu devices: 0
2022-01-06 22:12:31.877075: I tensorflow/core/platform/cpu_feature_guard.cc:143] Your CPU supports instructions that this TensorFlow binary was not compiled to use: SSE4.1 SSE4.2 AVX AVX2 FMA
2022-01-06 22:12:31.903636: I tensorflow/core/platform/profile_utils/cpu_utils.cc:102] CPU Frequency: 3609600000 Hz
2022-01-06 22:12:31.906524: I tensorflow/compiler/xla/service/service.cc:168] XLA service 0x559ed2e8b830 initialized for platform Host (this does not guarantee that XLA will be used). Devices:
2022-01-06 22:12:31.906581: I tensorflow/compiler/xla/service/service.cc:176]   StreamExecutor device (0): Host, Default Version
2022-01-06 22:12:31.907492: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.908582: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1561] Found device 0 with properties:
pciBusID: 0000:01:00.0 name: NVIDIA GeForce RTX 3070 computeCapability: 8.6
coreClock: 1.815GHz coreCount: 46 deviceMemorySize: 7.79GiB deviceMemoryBandwidth: 417.29GiB/s
2022-01-06 22:12:31.908632: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcudart.so.10.1
2022-01-06 22:12:31.908655: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcublas.so.10
2022-01-06 22:12:31.908674: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcufft.so.10
2022-01-06 22:12:31.908695: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcurand.so.10
2022-01-06 22:12:31.908714: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcusolver.so.10
2022-01-06 22:12:31.908732: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcusparse.so.10
2022-01-06 22:12:31.908751: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcudnn.so.7
2022-01-06 22:12:31.908855: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.909548: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.910177: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1703] Adding visible gpu devices: 0
2022-01-06 22:12:31.910430: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcudart.so.10.1
2022-01-06 22:12:31.964445: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1102] Device interconnect StreamExecutor with strength 1 edge matrix:
2022-01-06 22:12:31.964465: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1108]      0
2022-01-06 22:12:31.964468: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1121] 0:   N
2022-01-06 22:12:31.964586: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.964866: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.965060: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:981] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-01-06 22:12:31.965367: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1247] Created TensorFlow device (/job:localhost/replica:0/task:0/device:GPU:0 with 4626 MB memory) -> physical GPU (device: 0, name: NVIDIA GeForce RTX 3070, pci bus id: 0000:01:00.0, compute capability: 8.6)
2022-01-06 22:12:31.966801: I tensorflow/compiler/xla/service/service.cc:168] XLA service 0x559ed4798980 initialized for platform CUDA (this does not guarantee that XLA will be used). Devices:
2022-01-06 22:12:31.966811: I tensorflow/compiler/xla/service/service.cc:176]   StreamExecutor device (0): NVIDIA GeForce RTX 3070, Compute Capability 8.6
2022-01-06 22:15:23.414471: W tensorflow/core/framework/cpu_allocator_impl.cc:81] Allocation of 188160000 exceeds 10% of free system memory.
Epoch 1/5
2022-01-06 22:15:23.672182: I tensorflow/stream_executor/platform/default/dso_loader.cc:44] Successfully opened dynamic library libcublas.so.10
1875/1875 [==============================] - 3s 2ms/step - loss: 0.2967 - accuracy: 0.9131
Epoch 2/5
1875/1875 [==============================] - 3s 2ms/step - loss: 0.1440 - accuracy: 0.9578
Epoch 3/5
1875/1875 [==============================] - 3s 2ms/step - loss: 0.1097 - accuracy: 0.9670
Epoch 4/5
1875/1875 [==============================] - 2s 1ms/step - loss: 0.0881 - accuracy: 0.9732
Epoch 5/5
1875/1875 [==============================] - 2s 966us/step - loss: 0.0751 - accuracy: 0.9768
2022-01-06 22:16:32.382922: W tensorflow/core/framework/cpu_allocator_impl.cc:81] Allocation of 31360000 exceeds 10% of free system memory.
313/313 [==============================] - 1s 2ms/step - loss: 0.0716 - accuracy: 0.9781
```
