/*jshint esversion: 9 */
import {
    isObject,
    taskList,
    getItem,
    removeItem,
    beforeSetItem,
    deepProxy,
} from "./common/Tools";
/**
 storagex工具对象
 */
class StorageXTool{
    /**
     字符串转化为对象
     @param 数据对象 key:键 target:目标 mode:模式
     */
    constructor({key,target={},mode}={}){
        if(arguments.length>0 && !isObject(arguments[0])){
            throw "参数只能是一个对象";
        }
        if(!mode) throw "mode 不能为空";
        if(!key){  //表示代理所有键（不深度代理）
            return new Proxy(
                {},
                {
                    get(_target,_key){
                        if(typeof _key !== "string") throw "key 必须是字符串";
                        _target[_key] = getItem(_key,mode);
                        return _target[_key];
                    },
                    set(_target,_key,_value){
                        let r = Reflect.set(
                            _target, 
                            _key, 
                            _value,
                        );
                        beforeSetItem(_key,_value,mode,false);
                        return r;
                    },
                },
            );
        }else{
            if(typeof key !== "string") throw "key 必须是字符串";
            if(!isObject(target) || (typeof target === "function")) throw "target 必须是对象,且不能是函数";
            let oldTarget = getItem(key,mode);  //以已有数据为准
            if(!oldTarget){
                beforeSetItem(key,target,mode,false);
            }else{
                target = oldTarget;
                if(!isObject(target)) throw  `发现 ${key} 中有原始值且不能转化为对象`;
            }
            return deepProxy(
                target,
                function(){
                    beforeSetItem(key,target,mode,true);
                },
            );
        }
    }
}
/**
 执行现有列表里所有的任务
 */
export function handleTasks(){
    for(let index in taskList){
        if(!taskList[index]) break;
        taskList[index]();
    }
}
/**
 根据键名清除缓存
 @param 键
 @param 模式
 */
export function removeStorageItem(key,mode='local'){
    removeItem(key,mode);
}
/**
 生成代理对象
 @param 键
 @param 目标
 @param 模式
 */
export function storageX(key,target,mode){
    return new StorageXTool({key,target,mode});
}
storageX.removeItem = removeItem;
/**
 参数及作用参考上文，或根据语义判断
 */
export class StorageX{
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
export function localStorageX(key,target){
    return new StorageXTool({key,target,mode:'local'});
}
localStorageX.removeItem = function(key){
    return removeItem(key,'cocal');
};
export class LocalStorageX{ 
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
export function sessionStorageX(key,target){
    return new StorageXTool({key,target,mode:'session'});
}
sessionStorageX.removeItem = function(key){
    return removeItem(key,'session');
};
export class SessionStorageX{ 
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
export function uniStorageX(key,target){
    return new StorageXTool({key,target,mode:'uni'});
}
uniStorageX.removeItem = function(key){
    return removeItem(key,'uni');
};
export class UniStorageX{ 
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
export function wxStorageX(key,target){
    return new StorageXTool({key,target,mode:'wx'});
}
wxStorageX.removeItem = function(key){
    return removeItem(key,'wx');
};
export class WxStorageX{ 
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
