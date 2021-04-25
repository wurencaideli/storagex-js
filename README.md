> **storageX 1.3**

## 1.4 添加类的形式引入
存储字符串的情况下会多出两个冒号（致命错误）

## 1.3 修复BUG
存储字符串的情况下会多出两个冒号（致命错误）

## 1.2 修复BUG
1：储存的是数组时，取出来重新赋值会丢失map,filter等自带的方法。原因：json化数据时触发了代理的set属性，会调用clone方法，因为当时考虑到数据的储存简单clone一下就行，现在删除了clone。bug解决。
2：直接调用localStorageX()生成对象从而控制键值，以及更深层次的值，我认为这样不好。解决：取消深层代理。

## 使用方法。
##### 1：只是对键值进行操作
```javascript
const localStorage= localStorageX();
localStorage.a = {b:1};  //'a' 对应的值 {'b':'1'}
//旧版：localStorage.a.b = 2  'a' 对应的值 {'b':'2'}
localStorage.a.b = 2  //无效，不允许深度修改
//需要这样
localStorage.a = {b:2};
```
##### 2：深度的对象化存储（单纯的只对值进行操作）
```javascript
//因为考虑到如果需要深度代理那么值一定是个对象
let state = {
	a:1,
	b:{
		c:3,
	},
};
state = localStorageX(
	"state",  //本地储存对应的键
	state,  //初始化的值，如果该键有数据且为对象时优先代理
);
//当state的属性发生变化时会相应的将state存储到本地。
state.a = 1;
state.a = {b:{c:{d:2}}};
state.a.c.d = 3;
console.log(state.a.c.d);  //打印 3
//只针对值为对象时，而且只会对该对象属性进行修改添加，也就是说像下面这样不管用
state = null;
state = 1;
state = {a:1};
//了解js基础都知道，这样只是改变该变量的指向，并不是对原对象进行修改。
//如果想修改键的值请使用上面的那种方法。
```

**皆不支持函数式储存，因为函数无法JSON化，既然是数据的话为什么要存函数呢？**
