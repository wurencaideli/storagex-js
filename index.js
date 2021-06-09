/*
    storageX storage对象化储存
    不支持function的储存
    不支持对象的循环迭代
    支持的储存模式 local(默认) session uni(uniapp) wx(微信小程序)
    https://www.dumogu.top/bloginfo/8661a212e0
*/
/*jshint esversion: 9 */
//可以根据自己的需求导出那些函数
import {
    handleTasks,
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
} from "./src/StorageX";
export {
    handleTasks,
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