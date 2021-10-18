> **storagex-js 1.4.9**

## 介绍

storagex-js是什么？

在开发web网页的时候，难免会操作本地缓存数据，最常用的就是localStorage，sessionStorage，在uniapp中的uniStorage，在微信小程序中的wxStorage。而storagex-js是用对象化代理来简化操作本地数据的，举个简单的例子。

```javascript
//使用localStorage
localStorage.setItem('test',123);  //写入数据
let test = localStorage.getItem('test',123);  //获取数据
//使用storagex-js
let localServe = localStorageX();
localServe.test = 123;  //写入数据
let test = localServe.test  //获取数据
```

这是一个简单的使用方法，操作本地数据就跟操作一个对象一样简单， 但是这样也方便不到那里去，storagex-js方便的是对数据深层次的访问操作。下面开始使用。

## 安装和导入

```js
//使用npm安装
npm install storagex-js
```
```javascript
//需要什么就导入什么 (所有方法皆是同步方法)
import {
    storageX,  //根据模式生成代理对象 参数(key,target,mode)
    StorageX,  //参数({key,target,mode})
    localStorageX,  //生成localStorage代理对象 参数(key,target)
    LocalStorageX,  //参数({key,target})
    sessionStorageX,
    SessionStorageX,
    uniStorageX,
    UniStorageX,
    wxStorageX,
    WxStorageX,
    handleTasks,  //执行所有的任务
    deepRemoveProxy,  //深度取消代理写入 参数(target)
    removeStorageItem,  //根据键名清除本地数据 参数(key,mode)
} from "storagex-js";
```

## 参数定义，以及参数名及意义

参数名及含义

1. key : 写入本地数据的键名
2. target : 代理对象（就是需要保存在本地的初始化数据对象）
3. mode : 模式（可选值 local,session,uni,wx）

模式的含义

 local: localStorage,session: sessionStorage,uni: uniStorage,wx: wxStorage

## 使用storageX() 方法

> 参数 key,target,mode

生成代理对象，对代理对象的操作会相应的将该代理的对象储存到本地，操作该代理对象有两种模式

##### 1：只是对键值进行操作
```javascript
const storageServe= storageX(undefined,undefined,'local');
storageServe.test = 123; //localStorage 'test'键 对应的值 '123'
storageServe.a = {b:1};  //localStorage 'a'键 对应的值 {'b':'1'}
storageServe.a.b = 2  //无效，不允许深度修改
//需要这样
storageServe.a = {b:2};
```
##### 2：深度的对象化存储（单纯的只对值进行操作）
```javascript
//因为考虑到如果需要深度代理那么值一定是个对象
let state = {  //需要初始化的值
    a:1,
    b:{
        c:3,
    },
};
const storageServe= storageX('state',state,'local');
storageObj.a = 2;
storageObj.a = {b:{c:{d:2}}};
storageObj.a.c.d = 3;
console.log(storageObj.a.c.d);  //打印 3
//只针对值为对象时，而且只会对该对象属性进行修改添加，也就是说像下面这样不管用
storageObj = null;
storageObj = 1;
storageObj = {a:1};
//如果想修改键的值请使用上面的那种方式。也就是说，该方式永远只会对 储存中的'test'键的值进行操作。
//如果该 'test'键 中本来就有一个对象则以该对象为代理对象。
```



## 使用StorageX（跟storageX方法一样，只是创建方法不同）
```javascript
const storageServe= new StorageX({
    key:'state',
    state:state,
    mode:'local',
});
```
## 使用localStorageX

> 参数 key,target

相比storageX方法而言呢只是少了一个mode的参数，根据语义可以判断出，该方法操作的数据是保存在localStorage储存中的。

##### 1：只是对键值进行操作

```javascript
const storageServe= localStorageX();
storageServe.test = 123; //localStorage 'test'键 对应的值 '123'
storageServe.a = {b:1};  //localStorage 'a'键 对应的值 {'b':'1'}
storageServe.a.b = 2  //无效，不允许深度修改
//需要这样
storageServe.a = {b:2};
```

##### 2：深度的对象化存储（单纯的只对值进行操作）

```javascript
//因为考虑到如果需要深度代理那么值一定是个对象
let state = {  //需要初始化的值
    a:1,
    b:{
        c:3,
    },
};
const storageServe= localStorageX('state',state);
storageObj.a = 2;
storageObj.a = {b:{c:{d:2}}};
storageObj.a.c.d = 3;
console.log(storageObj.a.c.d);  //打印 3
```

##### 3：删除

```javascript
//参数 key
LocalStorageX.removeItem('state');
```
## handleTasks 的使用方法（执行任务列表里的所有任务）

如果是深度代理的话频繁操作数据则会创建多个任务且取最后的一个任务，跟普通的防抖函数类似。

```javascript
//导入后直接使用
handleTasks();
```
## deepRemoveProxy 的使用方法（清除已有的代理写入）
```javascript
//参数 target
deepRemoveProxy(target);
```

## 其他方法

其他几种模式的方法都差不多了，这里就不一一赘述了。

皆不支持函数式储存，因为函数无法JSON化，既然是数据的话为什么要存函数呢？

可能遇到的问题：因为深度对象化代理难免遇到大数据量的循环修改，每修改一次就存一次太消耗性能，所以一次任务有多次修改的话，那么最多会存一次，就是创建了一个宏任务等待被执行后保存（跟js写的防抖函数类似）。

### 小妙招

有时会遇到这样的情况，当本地数据对象需要再加一个键时，而StorageX会使用储存中已有的值，所以需要清空缓存在刷新一遍，其实不需要这么做。看下面的例子

```javascript
let state = {
    a:1,
};
const storageServe= localStorageX('state',state);
storageObj.a = 2;
console.log(storageObj.a);  //打印 2
```

修改state

```javascript
let state = {
    a:1,
    b:3,
};
const storageServe= localStorageX('state',state);
console.log(storageObj.b);  //打印 undefind
```

改进

```javascript
let state = {
    a:1,
    b:3,
};
const storageServe= localStorageX('state',state);
for(let index in state){
    if(storageServe.hasOwnProperty(index)) continue;
	storageServe[index] = state[index];
}
console.log(storageObj.b);  //打印 3
```

## 开发日志

#### 1.4.8 优化。

#### 1.4.6 优化

代理对象属性值发生改变只触发一个写入函数，也就是说如果一个代理对象的一个属性值是一个对象且赋值到另一个代理对象上，则该对象修改属性值时只会触发后者代理对象写入本地，之前的就不管用了。建议从之前的代理对象上重新读取一次（读取时会重新分配写入函数）。

#### 1.4.5  优化

在使用过程中已加入代理的直接写入，已放弃的代理对象使用 deepRemoveProxy 方法深层清除代理写入。

#### 1.4.4  BUG（已修复）

使用过程中的性能问题，之前监听的时候每次都会获取本地数据进行判断该键是否被手动删除，发现这样会有性能问题，现在已经删除。修改了写入数据的防抖设置，之前是执行第一次和最后一次，现在是只执行最后一次，性能最重要。

#### 1.4.3  BUG（已修复）

在使用npm引入后使用webpack打包时报错，因为有个文件使用了class且没有constructor()方法初始化属性，直接给一个属性赋了值，这样webpack loder会报错，不晓得为什么。

#### 1.4.2 

新加 handleTasks 方法，执行所有的任务，使用深层次的代理对象修改时最后一次是放在下一个微任务（使用的 queueMicrotask Api，如果浏览器不支持则使用setTimeout）中修改，所以 handleTasks 方法是会直接执行添加进的那个宏任务。

#### 1.4.1 

对不是深层次的代理对象修改后立即更新到本地储存

#### 1.4 

添加类的形式引入

#### 1.3 修复BUG
存储字符串的情况下会多出两个冒号（致命错误）

#### 1.2 修复BUG
1：储存的是数组时，取出来重新赋值会丢失map,filter等自带的方法。原因：json化数据时触发了代理的set属性，会调用clone方法，因为当时考虑到数据的储存简单clone一下就行，现在删除了clone。bug解决。
2：直接调用localStorageX()生成对象从而控制键值，以及更深层次的值，我认为这样不好。解决：取消深层代理。
