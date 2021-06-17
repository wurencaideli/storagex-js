/*jshint esversion: 9 */
/* eslint-disable */
//公共的工具函数
class MyTask{  //任务类
    constructor(){
        this.taskList={};
    }
    setMyTask(fn){  //创建任务(优先微任务)
        try{
            const sign = Symbol();  //唯一标识
            this.taskList[sign] = fn;
            queueMicrotask(()=>{
                if(!this.taskList[sign]) return;
                this.taskList[sign]();
            });
            return sign;
        }catch{
            return setTimeout(fn,0);
        }
    }
    clearMyTask(sign){  //清除该微任务
        if(typeof sign !== "symbol"){  //表示不是微任务而是宏任务
            clearTimeout(sign);
        }
        delete this.taskList[sign];
    }
}
export function stringToObject(value){  //字符串转化为对象
    try {
        return JSON.parse(value);
    } catch(e) {
        if(value === 'undefined') return undefined;  //排除无法转换undefined的情况
        return value;
    }
}
//全由外部调用，所以最顶层传默认值
//根据键名获取(转化为对象)
export function getItem(key,mode){
    switch(mode){
        case 'local':
            return stringToObject(localStorage.getItem(key));
        case 'session':
            return stringToObject(sessionStorage.getItem(key));
        case 'uni':
            return stringToObject(uni.getStorageSync(key));
        case "wx":
            return stringToObject(wx.getStorageInfoSync(key));
        default:
            throw mode + "没有此模式";
    }
}
export function removeItem(key,mode){  //根据键名清空  删除的话 mode不能有默认值
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
            throw mode + "没有此模式";
    }
}
const myTask = new MyTask();
export const taskTimerList = {};  //计时器任务列表
export const taskList = {};  //任务列表（用于记录所有产生的计时器执行函数）
export function setItem(key,value,mode,debounce=true){  //写入数据（包装优化）
    if(typeof key !== "string" || !key) throw "key 必须是字符串 || key 不能为空";
    if(debounce){  //性能优化，防止频繁操作 (针对大数据会有明显加快，小数据可能会花费更多的时间)
        if(!taskTimerList[key+mode]){
            _setItem(key,value,mode);
            taskList[key+mode] = function(){
                myTask.clearMyTask(taskTimerList[key+mode]);
                delete taskTimerList[key+mode];
                delete taskList[key+mode];
            }
            taskTimerList[key+mode] = myTask.setMyTask(taskList[key+mode]);
        }else{
            myTask.clearMyTask(taskTimerList[key+mode]);  //取消上一次任务
            taskList[key+mode] = function(){
                myTask.clearMyTask(taskTimerList[key+mode]);
                _setItem(key,value,mode);
                delete taskTimerList[key+mode];
                delete taskList[key+mode];
            }
            taskTimerList[key+mode] = myTask.setMyTask(taskList[key+mode]);
        }
    }else{
        _setItem(key,value,mode);
    }
}
function _setItem(key,value,mode){  //写入数据
    if(value instanceof Object){  //如果是对象，转化为字符串（字符串在转化会多两个引号）
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
            throw mode + "没有此模式";
    }
}
//深层对象代理(<目标对象>,<统一的set回调函数>)
export function deepProxy(target,setFn,getFn){
    if(!(target instanceof Object)) return target;
    for(let index in target){
        if(target[index] instanceof Object){  //如果是对象的话转成代理对象
            target[index] = deepProxy(target[index],setFn,getFn);
        }
    }
    return new Proxy(
        target,
        {
            set(_target,_key,_value){
                if(_value instanceof Object){  //如果是对象的话转成深度代理对象
                    _value = deepProxy(_value,setFn,getFn);
                }
                let r = Reflect.set(_target, _key, _value);
                setFn(_key);
                return r;
            },
            get(_target,_key){
                getFn(_key);
                return _target[_key];
            },
            deleteProperty(_target, _key) {
                let r = Reflect.deleteProperty(_target, _key);
                setFn(_key);
                return r;
            }
        },
    );
}