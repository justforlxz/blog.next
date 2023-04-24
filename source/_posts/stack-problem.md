---
title: 栈分配问题
date: 2022-06-24 16:44:30
tags:
  - Linux
categories:
  - 技术
---

前阵子在写一个新的项目，为了提升一些速度，所以没有使用 Qt 之类的大型库，在做进程管理的时候，遇到了奇怪的崩溃问题。

因为平时很少写这样的代码，所以觉得出问题很正常，但是排查了很久，都没有找到问题所在。

在 @black-desk 大佬的帮助下，重新复习了一遍操作系统如何管理进程，找到了问题所在。

先来一份简单的例子：

```cpp
#include <iostream>
#include <unistd.h>
#include <sys/types.h>

int child()
{
    int pid = fork();
    switch (pid) {
        case 0:
          std::cout << "[child] I'm child." << std::endl;
          sleep(5);
          std::cout << "[child] I'm quit." << std::endl;
          break;
        case -1:
          std::cout << "fork() failed." << std::endl;
          break;
        default:
          std::cout << "[parent] I'm meself." << std::endl;
          std::cout << "[parent] I will wait child." << std::endl;
          wait(nullptr);
          std::cout << "[parent] I'm quit." << std::endl;
          break;
    }

    return pid;
}

int main(int argc, char *argv[])
{
    child();
    return 0;
}
```

我们来跑一下这段代码，可以看到进程的输出。

```shell
g++ child.cpp
```

```shell
$ ./a.out
[parent] I'm meself.
[parent] I will wait child.
[child] I'm child.
[child] I'm quit.
[parent] I'm quit.
```

上面是一个非常简单和基本的 fork() 系统调用的用法，目前为止这里是没有问题的。

除了 fork() 系统调用，还有 clone() 系统调用，他们的作用分别是：

fork 会创建一个父进程的完整副本，复制父进程所有的资源。

clone 也可以创建一个新的进程，但是它可以比 fork 更加精细的控制与子进程共享的资源，因此参数会更加复杂一些，通常我们可以用它来实现线程。

在我的需求中，我需要控制子进程运行在一个新的 proc namespace 中，所以我会选择使用 clone() 系统调用控制子进程所属的 namespace。

大概的代码如下：

```cpp
#include <sched.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>

#include <iostream>

#define CHILD_STACK 8192

int count = 0;

int child_run(void *arg)
{
    printf("count in child: %d\n", ++count);
    return 0;
}

int main(int argc, char *argv[])
{
    int   pid;
    int   status;
    void *child_stack = malloc(CHILD_STACK);
    if (!child_stack) {
        fprintf(stderr, "failed to allocate child stack\n");
        exit(1);
    }

    printf("count before clone: %d\n", count);
    /* Simulate vfork */
    pid = clone(child_run, (void *) ((char *) child_stack + CHILD_STACK),
                CLONE_NEWPID, 0);

    if (pid == -1) {
        fprintf(stderr, "failed to clone\n");
        perror("clone failed: ");
        exit(2);
    }
    else {
        waitpid(pid, &status, 0);
        printf("count after clone: %d\n", count);
    }
    return 0;
}
```

这是一份很常见的 clone() 使用方法，作为一个例子，它没毛病，直到我运行了大量的函数，它崩溃了。

gdb 跟踪了一下，崩溃在了 std 的函数调用中，看起来很奇怪，我并没有写什么特别奇怪的代码，然后我开始精简代码，用二分简单定位了一下，发现有一个函数不调用，就不会崩溃，然后我就跟进去看代码，也没发现里面有什么奇怪的，就是一些 std 的代码。

正当我发愁怎么处理这个问题的时候， @black-desk 大佬来我旁边看我在干啥，我就给他看了一下代码和问题，他也觉得奇怪，就挺有兴趣的来帮我检查了。

经过一波 debug，最后定位可能是 stack 空间不够用了，然后被操作系统干掉了，最终将 stack 调大了一些，发现可以正常运行了，这说明问题确实是这里。

然后我就去复习 linux 进程内存分配的知识了。

进程地址空间中最顶部的段是栈，大多数编程语言将之用于存储函数参数和局部变量。调用一个方法或函数会将一个新的栈帧（stack frame）压入到栈中，这个栈帧会在函数返回时被清理掉。由于栈中数据严格的遵守FIFO的顺序，这个简单的设计意味着不必使用复杂的数据结构来追踪栈中的内容，只需要一个简单的指针指向栈的顶端即可，因此压栈（pushing）和退栈（popping）过程非常迅速、准确。进程中的每一个线程都有属于自己的栈。

通过不断向栈中压入数据，超出其容量就会耗尽栈所对应的内存区域，这将触发一个页故障（page fault），而被 Linux 的 expand_stack() 处理，它会调用 acct_stack_growth() 来检查是否还有合适的地方用于栈的增长。如果栈的大小低于 RLIMIT_STACK（通常为8MB），那么一般情况下栈会被加长，程序继续执行，感觉不到发生了什么事情。这是一种将栈扩展到所需大小的常规机制。然而，如果达到了最大栈空间的大小，就会栈溢出（stack overflow），程序收到一个段错误（segmentation fault）。

> **动态栈增长是唯一一种访问未映射内存区域而被允许的情形，其他任何对未映射内存区域的访问都会触发页错误，从而导致段错误。一些被映射的区域是只读的，因此企图写这些区域也会导致段错误。**

最终我没有再使用这套方案，所以问题也就不需要解决了，但是这个问题让我对 Linux 进程的内存布局有了更加深刻的了解。