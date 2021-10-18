/*jshint esversion: 9 */
/* eslint-disable */

/**
 任务类
 */
class MyTask{
    constructor(){
        this.taskList={};
    }
    /**
     @param 回调函数
     */
    create(fn){
        if(window.queueMicrotask){
            const sign = Symbol();
            this.taskList[sign] = fn;
            queueMicrotask(()=>{
                if(!this.taskList[sign]) return;
                this.taskList[sign]();
            });
            return sign;
        }else{
            return setTimeout(fn,0);
        }
    }
    /**
     @param 唯一标识
     */
    clear(sign){
        if(typeof sign !== "symbol"){  //表示不是微任务而是宏任务
            clearTimeout(sign);
        }
        delete this.taskList[sign];
    }
}
/**
 字符串转化为对象
 @param 字符串
 */
export function myParse(value){
    try {
        return JSON.parse(value);
    } catch(e) {
        if(value === 'undefined') return undefined; 
        return value;
    }
}
/**
 判断目标是否是对象
 @param 目标
 */
export function isObject(target){
    return target !== null && typeof target === 'object';
}
/**
 获取缓存中的值
 @param 键
 @param 模式
 */
export function getItem(key,mode){
    switch(mode){
        case 'local':
            return myParse(localStorage.getItem(key));
        case 'session':
            return myParse(sessionStorage.getItem(key));
        case 'uni':
            return myParse(uni.getStorageSync(key));
        case "wx":
            return myParse(wx.getStorageInfoSync(key));
        default:
            throw mode + "没有此模式。已有模式local,session,uni,wx";
    }
}
/**
 清空缓存中的值
 @param 键
 @param 模式
 */
export function removeItem(key,mode){
    switch(mode){
        case 'local':
            localStorage.removeItem(key);
            break;
        case 'session':
            sessionStorage.removeItem(key);
            break;
        case 'uni':
            uni.removeStorageSync(key);
            break;
        case "wx":
            wx.removeStorageSync(key);
            break;
        default:
            throw mode + "没有此模式。已有模式local,session,uni,wx";
    }
}
const myTask = new MyTask();
const taskSignList = {};  //任务标识列表
export const taskList = {};  //任务列表（用于记录所有产生的任务执行函数）
/**
 写入数据之前(用于写入优化)
 @param 键
 @param 值
 @param 模式
 @param 是否放到下一个任务中执行
 */
export function beforeSetItem(key,value,mode,debounce=true){
    if(typeof key !== "string" || !key) throw "key 必须是字符串 && key 不能为空";
    if(debounce){
        myTask.clear(taskSignList[key+mode]);
        taskList[key+mode] = ()=>{
            setItem(key,value,mode);
            delete taskSignList[key+mode];
            delete taskList[key+mode];
        };
        taskSignList[key+mode] = myTask.create(taskList[key+mode]);
    }else{
        setItem(key,value,mode);
    }
}
/**
 写入数据到缓存中
 @param 键
 @param 值
 @param 模式
 */
function setItem(key,value,mode){
    if(isObject(value)){
        value = JSON.stringify(value);
    }
    switch(mode){
        case 'local':
            localStorage.setItem(key,value);
            break;
        case 'session':
            sessionStorage.setItem(key,value);
            break;
        case 'uni':
            uni.setStorageSync(key,value);
            break;
        case "wx":
            wx.setStorageSync(key,value);
            break;
        default:
            throw mode + "没有此模式。已有模式local,session,uni,wx";
    }
}
/**
 深层对象代理
 @param 代理目标
 @param set 回调函数
 */
const setFnKey = Symbol();
export function deepProxy(target,setFn){
    if(!isObject(target)) return target;
    for(let index in target){
        Reflect.set(target,index,deepProxy(target[index],setFn));
    }
    if(target[setFnKey]){
        target[setFnKey] = setFn;
        return target;
    }
    target = new Proxy(
        target,
        {
            set(_target,_key,_value){
                let isSame = false;
                if(isObject(_value)?(_target[_key] === _value && _target[setFnKey] === _value[setFnKey]):(_target[_key] === _value)){
                    isSame = true;
                }
                _value = deepProxy(_value,_target[setFnKey]);
                let r = Reflect.set(_target, _key, _value);
                if(
                    _key != setFnKey
                        && typeof _target[setFnKey] == 'function'
                        && !isSame
                ){
                    _target[setFnKey]();
                }
                return r;
            },
            get(_target,_key){
                if(isObject(_target[_key]) && _target[_key][setFnKey] != _target[setFnKey]){
                    Reflect.set(_target[_key],setFnKey,_target[setFnKey]);
                }
                return Reflect.get(_target,_key);
            },
            deleteProperty(_target, _key) {
                let r = Reflect.deleteProperty(_target, _key);
                if(typeof _target[setFnKey] == 'function'){
                    _target[setFnKey]();
                }
                return r;
            }
        },
    );
    Object.defineProperty(target, setFnKey, {
        configurable: false,
        enumerable: false,
        writable: true,
        value: setFn,
    });
    return target;
}
/**
 深度取消代理
 @param 代理目标
 */
export function deepRemoveProxy(target){
    if(!isObject(target)) return target;
    for(let index in target){
        target[index] = deepRemoveProxy(target[index]);
    }
    if(typeof target[setFnKey] == 'function'){
        target[setFnKey] = true;
    }
}
