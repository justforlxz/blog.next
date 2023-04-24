---
title: docker-buildx-multi-arch-images
tags:
  - docker
categories:
  - Linux
date: 2022-08-25 13:32:03
---


最近一直在搞 github 的 ci，为了方便公司的开发快速修复其他发行版上的构建问题，我研究了一下 distrobox 启动容器来作为本地验证环境的可行性，结果发现还不错，就顺手做了几个镜像。

v23 的仓库是支持多个架构的，想着顺手做一份 v23 的镜像提交到 docker hub 上，结果遇到了一点多平台的坑。

## docker buildx

Docker Buildx是一个CLI插件，它扩展了Docker命令，完全支持 Moby BuildKit 构建工具包提供的特性。它提供了与docker 构建相同的用户体验，提供了许多新特性，比如创建作用域的构建器实例和同时针对多个节点构建。

Moby BuildKit 构建工具提供了一些诸如跨平台启动的功能。

## 首次尝试

最开始我是打算使用 docker import 直接把 base.tgz 导入进去的，docker import 支持 --platform 参数指定架构，我就跑了两遍，生成了 linux/arm64 和 linux/amd64 两个架构的。

结果我看到 docker images 里只有一份，而且用 docker image inspect beige:base 查看发现里面的 Architecuture 只有 amd64，推送到 docker hub 后也只有一份，这显然是不正确的。

## 使用 dockerfile

经过我一番的搜索，我看到了一种使用 docker buildx 配合 dockerfile 的多架构构建方式，然后我就快速的写了一份 dockerfile。

```dockerfile
FROM --platform=$TARGETPLATFORM scratch

ARG TARGETARCH

ADD beige-${TARGETARCH}.tgz /

CMD [ "sh" ]
```

dockerfile 需要注意的是，变量需要先使用 ARG 声明，在 build 阶段，遇到变量会产生一次分叉，这样就会在不同的架构里继续运行了（这也是坑我很长的时间，最终我将文件名修改为方便获取的方式……）。

接下来需要创建一份构建环境。

```shell
docker buildx create --use
```

这条命令可以创建一个基本环境，可以使用 `docker buildx ls` 查看当前的环境，可以看到默认就支持的有很多种架构。

然后使用 build 命令开始构建：

```shell
docker buildx build --platform=linux/amd64,linux/arm64 -t linuxdeepin/beige:base --push .
```

简单说一下参数，platform 参数负责控制本次 build 传入架构，t 参数设置 tag 名称，这里我用了 --push 直接推送上去了，它默认用的 docker-compose 处理，构建产物不会出现在 docker images 里，所以就直接推送了。

现在我就有一份 v23 的 docker base 可用了，很开心。

点击前往：
[https://hub.docker.com/repository/docker/linuxdeepin/beige](https://hub.docker.com/repository/docker/linuxdeepin/beige)
