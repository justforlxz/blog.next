---
title: 正常的流程在界面上却是bug
date: 2017-08-15 07:43:43
tags:
---

排查了一天，最后终于确认了流程，知道了问题所在，不得不说，dde-session-ui这个项目太需要一个文档了，要把工作流程写的非常详细才可以。

<!-- more -->

上午收到了一条新任务，是龙芯上新安装的系统需要输入两次密码才可以登录，没有错误提示。近期并没有什么太大的改动，无非是给龙芯也用上了简单重构过的dde-session-ui，怎么会导致这样的问题。

由于是新安装的系统才会发生，而且是现象一旦发生，就无法重现，这让我头有点大，怎么会有这样的神奇的事情，而且日志中很正常，没有收到message导致密码框被清空。我提交了一个添加了更多日志的，然后重装的龙芯的系统(龙芯重装一次要半个小时)，等重装完了，切换到tty去安装这个包，然后重启lightdm，让我输入密码回车以后，密码消失，我赶紧去看日志，但是日志中并没有我的输出，回车以后肯定会有的一行输出也没有(内心OS：What the fuck is that？)

我又回去看验证的流程，并没有发现有什么不对的地方，而且是近期才有的，我在自己电脑上使用了龙芯的编译参数，打了一个deb包，并没有发生和龙芯一样的情况（这里并不需要，既然是新安装的系统才会发生，在旧系统上是无法重现的）。

再然后我暂时没有管这个，先去修其他bug了。忙完以后，我去问了一下其他大佬，大佬给我提了几条让我去看看，是不是起了两个lightdm-deepin-greeter进程，确认一下使用的二进制是不是你加了log的。（然后我又重装龙芯了），之后确认了是我的二进制，也没有起两个进程。但是ps中有两行输出，我以为是起了两个，就让后端大佬看了一下，后端大佬告诉我说一个是shell的进程，一个是本体，还是只有一个进程存在的。我彻底懵逼了，然后后端大佬告诉我，是不是greeter进程写入什么了，之后的验证中内容已经存在，所以就不会重现了。

其实这个我也想过，但是没考虑太深，greeter并没有操作文件，但是大佬这么一说，我想到有一些dbus的调用，是有写入文件的，然后我把/var/lib/lightdm/lightdm-deepin-greeter目录给删除了，完美重现。

我的天啊，排查了快一天，居然是这个目录在新装的系统上没有，所以回车登录以后收到了来自dbus的switchToUser，界面重启导致的内容消失，根本不是收到了Message才被清空的，所以我的log也没有打印出来。

知道了如何重现，可是要怎么修复呢，似乎在greeter上并不能修复，只能去改dde-daemon中LockService，如果文件不存在，就不要发送userChanged的信号。（流程是读取这个文件的信息，和传入的参数进行对比，但是文件是空的，所以被认为不是同一个账户，就发送了信号，也导致了界面上重启，以后无法重现是因为里面已经有内容了）。

就这样，一个流程很正确，但是表现到界面上时就成了一个bug的问题被解决了。写下这篇内容是为了记录我如何解决对我来说很棘手的问题，其实这个问题并不是很困难，但是对整个工作的流程不是很熟悉，导致浪费了大量的时间在非关键点处理，有空要写一些文档了。