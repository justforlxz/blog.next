---
title: fix h5py build failed on m1
date: 2022-01-05 11:12:36
tags:
categories:
---

今天在 m1 mbp 上安装 tensorflow-metal 遇到了依赖无法安装的问题，错误的原因是 h5py 这个包无法编译。

在 h5py 的项目里看到了已经解决了，但是仍然需要从源码构建。

> [https://github.com/h5py/h5py/issues/1810](https://github.com/h5py/h5py/issues/1810)

```shell
$ brew install hdf5
$ export HDF5_DIR=/opt/homebrew/Cellar/hdf5/
$ pip install --no-binary=h5py h5py
```

测试代码：

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

运行结果:

```text
$ python demo.py
Downloading data from https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz
11493376/11490434 [==============================] - 7s 1us/step
11501568/11490434 [==============================] - 7s 1us/step
Metal device set to: Apple M1

systemMemory: 16.00 GB
maxCacheSize: 5.33 GB

2022-01-05 11:20:21.920404: I tensorflow/core/common_runtime/pluggable_device/pluggable_device_factory.cc:305] Could not identify NUMA node of platform GPU ID 0, defaulting to 0. Your kernel may not have been built with NUMA support.
2022-01-05 11:20:21.920545: I tensorflow/core/common_runtime/pluggable_device/pluggable_device_factory.cc:271] Created TensorFlow device (/job:localhost/replica:0/task:0/device:GPU:0 with 0 MB memory) -> physical PluggableDevice (device: 0, name: METAL, pci bus id: <undefined>)
2022-01-05 11:20:22.484838: W tensorflow/core/platform/profile_utils/cpu_utils.cc:128] Failed to get CPU frequency: 0 Hz
Epoch 1/5
2022-01-05 11:20:22.682840: I tensorflow/core/grappler/optimizers/custom_graph_optimizer_registry.cc:112] Plugin optimizer for device_type GPU is enabled.
1875/1875 [==============================] - 11s 5ms/step - loss: 0.2896 - accuracy: 0.9160
Epoch 2/5
1875/1875 [==============================] - 9s 5ms/step - loss: 0.1391 - accuracy: 0.9585
Epoch 3/5
1875/1875 [==============================] - 9s 5ms/step - loss: 0.1036 - accuracy: 0.9684
Epoch 4/5
1875/1875 [==============================] - 8s 4ms/step - loss: 0.0844 - accuracy: 0.9739
Epoch 5/5
1875/1875 [==============================] - 8s 4ms/step - loss: 0.0715 - accuracy: 0.9776
2022-01-05 11:21:07.206209: I tensorflow/core/grappler/optimizers/custom_graph_optimizer_registry.cc:112] Plugin optimizer for device_type GPU is enabled.
313/313 [==============================] - 2s 5ms/step - loss: 0.0738 - accuracy: 0.9784
```


> Apple 给的适配 tensorflow 的 metal 插件安装方案
https://developer.apple.com/metal/tensorflow-plugin/
