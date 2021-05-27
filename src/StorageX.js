/*jshint esversion: 9 */
import {
    getItem,
    removeItem,
    setItem,
    deepProxy,
} from "./common/Tools";
//storage本地储存对象化代理，只有两种模式(只针对数据)
class StorageXTool{
    constructor({key,target={},mode}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象,mode:模式}";
        }
        if(!mode) throw "mode 不能为空";
        if(!key){  //表示代理整个localStorage (key表示localStorage的key，不深度代理)
            return new Proxy(
                {},
                {
                    get(_target,_key){  //获取某个键的值
                        if(typeof _key !== "string") throw "key 必须是字符串";
                        _target[_key] = getItem(_key,mode);
                        return _target[_key];
                    },
                    set(_target,_key,_value){  //写入某个键的值
                        let r = Reflect.set(
                            _target, 
                            _key, 
                            _value,
                        );
                        setItem(_key,_value,mode,false);
                        return r;
                    },
                },
            );
        }else{  //表示代理一个键，对应一个对象（深度代理）
            if(typeof key !== "string") throw "key 必须是字符串";
            if(!(target instanceof Object) || (typeof target === "function")) throw "target 必须是对象,且不能是函数";
            let oldTarget = getItem(key,mode);
            if(!oldTarget){
                setItem(key,target,mode,false);  //初始化
            }else{
                target = oldTarget;  //如果键中有值则以该值为准
                if(!(target instanceof Object)) throw  `发现 ${key} 中有原始值且不能转化为对象`;
            }
            return deepProxy(
                target,
                function(){  //set 回调
                    setItem(key,target,mode,true);
                },
                function(){  //get 回调
                    setTimeout(()=>{  //防止存储时异步没有执行
                        if(!getItem(key,mode)){  //如果该键在使用过程中清空的话向外抛出异常
                            throw `发现 ${key} 在使用过程中已被清空，至少是一个空对象`;
                        }
                    },0);
                },
            );
        }
    }
}
//向外部暴露使用方法
function removeStorageItem(key,mode='local'){
    removeItem(key,mode);
}
function storageX(key,target,mode){
    return new StorageXTool({key,target,mode});
}
storageX.removeItem = removeItem;
class StorageX{  //类的方式使用
    static removeItem(key,mode){
        removeItem(key,mode);
    }
    constructor({key,target,mode}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象}";
        }
        return new StorageXTool({key,target,mode});
    }
}
//localStorage模式
function localStorageX(key,target){
    return new StorageXTool({key,target,mode:'local'});
}
localStorageX.removeItem = function(key){
    return removeItem(key,'cocal');
}
class LocalStorageX{ 
    static removeItem(key){
        removeItem(key,'local');
    }
    constructor({key,target}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象}";
        }
        return new StorageXTool({key,target,mode:'local'});
    }
}
//sessionStorage模式
function sessionStorageX(key,target){
    return new StorageXTool({key,target,mode:'session'});
}
sessionStorageX.removeItem = function(key){
    return removeItem(key,'session');
}
class SessionStorageX{ 
    static removeItem(key){
        removeItem(key,'session');
    }
    constructor({key,target}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象}";
        }
        return new StorageXTool({key,target,mode:'session'});
    }
}
//uniapp模式
function uniStorageX(key,target){
    return new StorageXTool({key,target,mode:'uni'});
}
uniStorageX.removeItem = function(key){
    return removeItem(key,'uni');
}
class UniStorageX{ 
    static removeItem(key){
        removeItem(key,'uni');
    }
    constructor({key,target}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象}";
        }
        return new StorageXTool({key,target,mode:'uni'});
    }
}
//wx模式
function wxStorageX(key,target){
    return new StorageXTool({key,target,mode:'wx'});
}
wxStorageX.removeItem = function(key){
    return removeItem(key,'wx');
}
class WxStorageX{ 
    static removeItem(key){
        removeItem(key,'wx');
    }
    constructor({key,target}={}){
        if(arguments.length>0 && !(arguments[0] instanceof Object)){
            throw "参数只能是一个对象 {key:键,target:对象}";
        }
        return new StorageXTool({key,target,mode:'wx'});
    }
}
export {
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
};