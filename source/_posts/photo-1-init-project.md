---
title: 1. init project
tags:
  - typescript
  - react
  - react native
categories:
  - photos 开发笔记
date: 2022-11-07 16:38:31
---


这是一个系列的文章，用来记录我的相册应用的开发过程，内容可能会比较枯燥，还请读者见谅。

我使用  NextCloud 作为我的存储中心，但是当我备份相册的时候，我感到了莫名的蛋疼，实在是太难用了，不支持相册，不支持标记，不支持各种视图，所以我决定自己写一个新的客户端，只提供相册功能。

## 技术选型

我用的是 iPhone 12，理所当然我会选择 iOS 客户端开发，在我面前有这么几种方案可以选择：

1. object-c
2. swift
3. swiftui
4. flutter
5. qml
6. react-native

> 本着三短一长选最长的原则，我计划使用 react-native 作为项目的技术方案。

object-c 已经很老旧了，我只是想业余时间做一个应用满足自己的需求，排除。

swfit 和 swiftui 是苹果目前主推的，特别是 swfitui，用来写界面真的很方便，但是我不想学新的，排除。

flutter 是谷歌在推的一个框架，从我的研发角度来看，flutter 和 qml 没有什么本质区别，都是自己实现了绘制，在此基础上完善控件等高级功能，既然我是一个 Qt 开发者，我肯定不会选择再去学一套类似的技术了，排除。

qml，Qt 目前主推的界面开发框架，采用 JSON like 的方式描述界面，并且可以运行一部分的标准 js 语法，配合 C++ 在 native 端提供本地功能，Qt 自己是一套平台一样的框架，用起来很爽，但是我不想写 qml，排除。

最终就只能用 react native 了，我个人想学一下前端开发，使用相关的技术栈对我来说性价比最高，选择。

> ~~为了写 js 而找了这么多借口（~~

## 功能设计

确定了技术方案，就需要考虑实现哪些功能了，作为一个相册 App，它最基本的功能肯定是 ~~能启动~~,嗯，看图。

- 浏览服务器和本地的图片
- 上传和下载图片
- 相册分类
- 标记信息
- 查看文件详情

一开始先不考虑那么多，做一个基本的 TimeLine 样式就可以了。

## 界面设计

功能也已经确定了，先实现一个 TimeLine 的功能，那么就要确定界面的样式了，我个人比较欣赏 Google Photo 的设计，打算就按像素复制了。

## 初始化项目

现在可以考虑怎么写代码了，首先初始化一下项目。

```shell
npx react-native init photos --template react-native-template-typescript
```

初始化一个带有 typescript 的 react native 项目，然后在 vscode 里安装一些 react 和 react native 相关的插件就可以了。

删掉初始化项目的 App.tsx 和相关的文件，新建 src 目录和 App.tsx 文件，开始写新的界面。