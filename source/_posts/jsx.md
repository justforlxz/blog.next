---
title: 使用 React 的 JSX
date: 2022-07-02 00:11:59
tags:
  - javascript
  - jsx
categories:
  - Web
---

# jsx

JSX 是 javascript XML 的缩写，可以在 javascript 代码中书写 HTML 结构的一种方式。

## 优点

采用类似于 HTML 语法

充分利用 js 自身的可编程能力创建 HTML 结构

## 使用

### 基本说明

需要使用 babel 进行语法转换，对于 react 而言，以下代码是等价的。

```jsx
function render() {
    return (<div id='d'>
                 <p>hello world</p>
            </div>)
}
```

```jsx
function render() {
    return ReactDOM.createElement('div',
                                  { id: 'd' },
                                  ReactDOM.createElement('p',
                                                         null,
                                                         'hello world'));
}
```

### 表达式

可以在 JSX 中使用表达式，表达式使用一对花括号对表达式进行标记。

```jsx
const text = 'hello';
const html = <div>{ text }</div>;
const flag = false;
function test() {
    return 'test function';
}
const newHtml = <div>{ flag ? test() : 'no' }</div>;
```

通过上面的例子可以看出，JSX 的表达式支持以下几种方式：

1. 识别常规变量
2. 原生 js 方法调用
3. 三元运算符

**特别注意**

JSX 中无法使用 if/switch/变量声明等语句，他们不是表达式，不支持在 jsx 中使用。

### 列表渲染

在 vue 中，我们可以使用 v-for 对一个列表数据进行遍历，可以在模板中实现元素的重复生成。在 angular 中可以使用 *ngFor 实现相同的事情，在 JSX 中我们也可以做到相同的事情。

可以使用 map 方法返回包含 jsx 的表达式

```jsx
const songs = [
  { id: 1, name: '可惜没如果' },
  { id: 3, name: '我继续' },
  { id: 2, name: '黑夜问白天' },
];

function App() {
    return (
				<div className='App'>
						<ul>
								{
										songs.map(item => <li key={ item.id} >{ item.name }</li>)
								}
						</ul>
				</div>
		);
}

export default App;
```

**注意事项**

由于是重复元素渲染，需要为生成的元素分配一个 key，否则会影响 virtual dom 的性能。

key 只能使用 number/string 类型，key 属性不会出现在真实的 dom 属性上，进在内部使用。

### 条件渲染

JSX 支持满足条件生成对应的 HTML 结构，可以使用 `三元运算符` 实现。

```jsx
const flag = true;
function App() {
		return (
				<div className="App">
						{ flag ? 'flag is true' : 'flag is false' }
						{ flag ? <div>flag is true</div> : null }
				</div>
		);
}
```

### 样式处理

JSX 支持 css 样式处理

- 行内样式 - style - 在元素属性上绑定 style 属性

```jsx
function App() {
		return (
				<div className="App">
						<div style={{ color: red }}>here is a div</div>
				</div>
		);
}
```

- 行内样式 - style - 更优写法

```jsx
const styleObj = {
		color: 'red'
};

function App() {
		return (
				<div className="App">
						<div style={ styleObj }>here is a div</div>
				</div>
		);
}
```

- 类名样式 - 在元素身上绑一个 className 属性

```css
.active {
    color: red;
}
```

```jsx
import './app.css'

function App() {
		return (
				<div className="App">
						<div className="active">here is a div</div>
				</div>
		);
}
```

**注意事项**

在第一个例子中，由于 style 属性需要的是一个对象，所以第一层 `{}` 是表达式，第二层 `{}` 是对象的定义括号，所以通常会写成 Object 的方式，这样控制也更加方便。

### 动态类名控制

在上面的例子中，已经使用 css 中的类名样式进行了样式设置，但是有时候我们会希望控制一个元素的样式在某些场景下，会发生改变，这个时候就需要使用动态类名控制了。

```jsx
import './app.css'

const flag = false;

function App() {
		return (
				<div className="App">
						<div className={ flag ? "activate" : "" }>here is a div</div>
				</div>
		);
}
```

## 注意事项

JSX 在实际应用时的注意事项

1. JSX 必须有一个根结点，也就是说 React 无法使用 jsx 创建最顶层的 html 元素，我们必须先提供一个空的元素作为 React 的根节点。（或者使用幽灵节点 `<></>` 创建）
2. 所有标签必须形成闭合，成对闭合或者自闭合均可。
3. JSX 中的语法更贴近 javascript 的语法，属性采用小驼峰命名法 `class -> className` `for -> htmlFor` 。
4. JSX 支持多行（换行），如果需要换行，可以使用 `()` 进行包裹。
