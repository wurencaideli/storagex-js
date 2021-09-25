> **storagex-js 1.4.8**

## 首先需要安装引入 storagex-js
```js
//使用npm安装
npm install storagex-js
//导入 需要什么就导入什么 所有方法皆是同步方法
import {
    handleTasks,  //执行所有的任务
    removeStorageItem,
    storageX,
    StorageX,
    localStorageX,
    LocalStorageX,
    sessionStorageX,
    SessionStorageX,
    uniStorageX,
    UniStorageX,
    wxStorageX,
    WxStorageX,
    deepRemoveProxy,
} from "storagex-js";
```
## 储存模式（下面会用到）
mode :可选值 local,session,uni,wx
local：localStorage,session:sessionStorage,uni:uniApp的本地储存,wx:微信小程序的本地储存

## 操作方式
皆是使用以上引入的方法生成代理对象，对代理对象的操作会相应的将该代理的对象储存到本地，操作该代理对象有两种模式
##### 1：只是对键值进行操作
```javascript
const storageObj= <调用方法生成代理对象>;  //下面会详细说明如何生成
storageObj.a = {b:1};  //'a' 对应的值 {'b':'1'}
storageObj.a.b = 2  //无效，不允许深度修改
//需要这样
storageObj.a = {b:2};
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
const storageObj = <调用方法生成可深度代理对象>;
//当storageObj的属性发生变化时会相应的将state存储到本地。
storageObj.a = 1;
storageObj.a = {b:{c:{d:2}}};
storageObj.a.c.d = 3;
console.log(storageObj.a.c.d);  //打印 3
//只针对值为对象时，而且只会对该对象属性进行修改添加，也就是说像下面这样不管用
storageObj = null;
storageObj = 1;
storageObj = {a:1};
//了解js基础都知道，这样只是改变该变量的指向，并不是对原对象进行修改。
//如果想修改键的值请使用上面的那种方式。
```

> ## 各种方法的说明，相似的跳过
## 一：removeStorageItem 的使用方法
```javascript
//key :需要删除数据的键，mode：储存模式（默认:local）
removeStorageItem(<key>,<mode>);
```
## 二：storageX 的使用方法
##### 1：生成对键值进行操作的代理对象
```javascript
const storageObj= storageX(undefined,undefined,<mode>);  //mode必填
```
##### 2：生成可深度操作的代理对象
```javascript
let state = {
    a:1,
    b:{
        c:3,
    },
};
const storageObj = storageX(
    "state",  //储存所对应的键
    state,  //初始化的值，如果该键有数据且为对象时优先代理
    <mode>,  //存储模式
);
```
##### 3：删除
```javascript
storageObj.removeItem(<key>,<mode>);
```

## 三：StorageX 的使用方法（对象式创建）
##### 1：生成对键值进行操作的代理对象
```javascript
const storageObj= new StorageX({
    mode:<mode>,  //必填
});
```
##### 2：生成可深度操作的代理对象
```javascript
let state = {
    a:1,
    b:{
        c:3,
    },
};
const storageObj = new StorageX({
    key:'state',
    target:state,
    mode:<mode>,
});
```
## 四：localStorageX 的使用方法
##### 1：生成对键值进行操作的代理对象
```javascript
const storageObj= localStorageX();
```
##### 2：生成可深度操作的代理对象
```javascript
let state = {
    a:1,
    b:{
        c:3,
    },
};
const storageObj = localStorageX(
    "state",  //储存所对应的键
    state,  //初始化的值，如果该键有数据且为对象时优先代理
);
```

## 五：LocalStorageX 的使用方法（对象式创建）
##### 1：生成对键值进行操作的代理对象
```javascript
const storageObj= new LocalStorageX();
```
##### 2：生成可深度操作的代理对象
```javascript
let state = {
    a:1,
    b:{
        c:3,
    },
};
const storageObj = new LocalStorageX({
    key:'state',
    target:state,
});
```
##### 3：删除
```javascript
LocalStorageX.removeItem(<key>);
```
## handleTasks 的使用方法（执行任务列表里的所有任务）
```javascript
//导入后直接使用
handleTasks();
```
## deepRemoveProxy 的使用方法（清除已有的代理写入）
```javascript
//导入后直接使用
deepRemoveProxy(target);
```

##其他几种模式的方法都差不多了，这里就不一一赘述了。

**皆不支持函数式储存，因为函数无法JSON化，既然是数据的话为什么要存函数呢？**

**可能遇到的问题：因为深度对象化代理难免遇到大数据量的循环修改，每修改一次就存一次太消耗性能，所以一次任务有多次修改的话，那么最多会存两次，一是第一次修改存一次，二是创建了一个宏任务等待被执行后保存（跟js写的防抖函数类似）。**

> ## 开发日志
#### 1.4.8 优化BUG。

#### 1.4.6 优化BUG，代理对象属性值发生改变只触发一个写入函数，也就是说如果一个代理对象的一个属性值是一个对象且赋值到另一个代理对象上，则该对象修改属性值时只会触发后者代理对象写入本地，之前的就不管用了。建议从之前的代理对象上重新读取一次（读取时会重新分配写入函数）。

#### 1.4.5 在使用过程中已加入代理的直接写入，已放弃的代理对象使用 deepRemoveProxy 方法深层清除代理写入。

#### 1.4.4 （已修复）使用过程中的性能问题，之前监听的时候每次都会获取本地数据进行判断该键是否被手动删除，发现这样会有性能问题，现在已经删除。修改了写入数据的防抖设置，之前是执行第一次和最后一次，现在是只执行最后一次，性能最重要。

#### 1.4.3 （已修复）在使用npm引入后使用webpack打包时报错，因为有个文件使用了class且没有constructor()方法初始化属性，直接给一个属性赋了值，这样webpack loder会报错，不晓得为什么。

#### 1.4.2 新加 handleTasks 方法，执行所有的任务，使用深层次的代理对象修改时最后一次是放在下一个微任务（使用的 queueMicrotask Api，如果浏览器不支持则使用setTimeout）中修改，所以 handleTasks 方法是会直接执行添加进的那个宏任务。

#### 1.4.1 对不是深层次的代理对象修改后立即更新到本地储存

#### 1.4 添加类的形式引入

#### 1.3 修复BUG
存储字符串的情况下会多出两个冒号（致命错误）

#### 1.2 修复BUG
1：储存的是数组时，取出来重新赋值会丢失map,filter等自带的方法。原因：json化数据时触发了代理的set属性，会调用clone方法，因为当时考虑到数据的储存简单clone一下就行，现在删除了clone。bug解决。
2：直接调用localStorageX()生成对象从而控制键值，以及更深层次的值，我认为这样不好。解决：取消深层代理。
