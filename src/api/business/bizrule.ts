import { defHttp } from '@/utils/http';
//类型
export interface LoginData {
  username: string;
  password: string;
}
enum Api {
    getList = '/business/bizrule/get_list',
    getParent = '/business/bizrule/get_parent',
    save = '/business/bizrule/save',
    upStatus = '/business/bizrule/upStatus',
    del = '/business/bizrule/del',
}

//菜单选择菜单
export function getList(params: object) {
  return defHttp.get({ url: Api.getList, params:params }, { errorMessageMode: 'none' });
}
//菜单选择菜单
export function getParent() {
  return defHttp.get({ url: Api.getParent }, { errorMessageMode: 'none' });
}
//提交菜单
export function save(params: object) {
    return defHttp.post({ url: Api.save, params:params}, { errorMessageMode: 'message' });
}
//更新状态
export function upStatus(params: object) {
    return defHttp.post({ url: Api.upStatus, params:params}, { errorMessageMode: 'message' });
}
//删除数据
export function del(params: object) {
    return defHttp.delete({ url: Api.del, params:params}, { errorMessageMode: 'message' });
}
/**数据类型 */
export interface RuleItem {
    id:number,
    pid:number,
    locale: string;
    title: string;
  }