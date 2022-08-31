import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";

/**
 * @description  获取配置模块权限
 * @returns {Promise<T>}
 */
export function getPermission<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getPermission);
}

/**
 * @param code_language 源码语言
 * @param git_url gitlab URL
 * @param id 主键ID 传0创建，否则编辑
 * @param name 项目名称
 * @param remark 备注
 * @param run_env 寄宿运行环境,1:宿主机,2:docker,3:k8s
 * @description  应用创建/更新
 * @returns {Promise<T>}
 */
export function createAndUpdateAppList<T>(params: RequestParams.CreateAndUpdateAppList): Promise<T> {
  return axiosInstance.post<T>(api.createSettingApp, params);
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param name 名字
 * @description  应用列表
 * @returns {Promise<T>}
 */
export function getSettingAppList<T>(params: RequestParams.GetAppList): Promise<T> {
  return axiosInstance.get<T>(api.getSettingAppList, params);
}

/**
 * @param name 名字/环境代码
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @description  环境变量列表   配置-->环境变量
 * @returns {Promise<T>}
 */
export function getEnvirmentList<T>(params: RequestParams.GetEnvList): Promise<T> {
  return axiosInstance.get<T>(api.getEnvirmentList, params);
}

/**
 * @description  环境变量列表
 * @returns {Promise<T>}
 */
export function getEnvirmentSelectList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getEnvirmentSelectList, "");
}

/**
 * @param id id
 * @description  删除应用
 * @returns {Promise<T>}
 */
export function deleteCurrentAppVar<T>(params: RequestParams.DeleteCurrentApp): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteCurrentAppVar + "/" + params.id}`, "");
}

/**
 * @param code code
 * @param id 主键ID 传0创建，否则编辑
 * @param name 环境名称
 * @param remark 备注
 * @description  编辑/新增 环境变量列表   配置-->环境变量
 * @returns {Promise<T>}
 */
export function createAndUpdateEnvirmentList<T>(params: RequestParams.CreateAndUpdateEnvList): Promise<T> {
  return axiosInstance.post<T>(api.createEnvirmentList, params);
}

/**
 * @param id 环境id
 * @description  删除应用环境
 * @returns {Promise<T>}
 */
export function deleteEnvirmentList<T>(params: RequestParams.DeleteEnvirmentList): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteEnvirmentList + "/" + params.id}`, "");
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param appId appId
 * @param envId 环境id
 * @param keyword 关键词
 * @param type 类型
 * @param name 名字
 * @description  应用配置
 * @returns {Promise<T>}
 */
export function getConfigTabList<T>(params: RequestParams.GetConfigTabList): Promise<T> {
  return axiosInstance.get<T>(`${api.getConfigDetail + "/" + params.appId + "/env/" + params.envId}`, params);
}

/**
 * @param appId appId
 * @description  应用详情-环境tab
 * @returns {Promise<T>}
 */
export function getTabCount<T>(params: RequestParams.GetConfigTab): Promise<T> {
  return axiosInstance.get<T>(`${api.getConfigTab + "/" + params.appId + "/tab-list"} `, "");
}

/**
 * @param id 主键ID 传0创建，否则编辑
 * @param name 项目名称
 * @param remark 备注
 * @param appId appId
 * @param envId 环境id
 * @param value 值
 * @param key 键
 * @description  应用创建/更新
 * @returns {Promise<T>}
 */
export function createAndUpdateConfigTabList<T>(params: RequestParams.CreateAndUpdateConfigList): Promise<T> {
  return axiosInstance.post<T>(`${api.createConfigEnv + "/" + params.appId + "/env/" + params.envId}`, params);
}

/**
 * @param id 环境配置id
 * @param appId appId
 * @param envId 环境id
 * @description  删除应用配置
 * @returns {Promise<T>}
 */
export function deleteConfigEnv<T>(params: RequestParams.deleteSyncConfigList): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteConfigEnv + "/" + params.appId + "/env/" + params.envId + "/" + params.id}`, "");
}

/**
 * @param appId appId
 * @param envId 环境id
 * @description  删除应用环境
 * @returns {Promise<T>}
 */
export function deleteCurrentConfigEnv<T>(params: RequestParams.deleteSyncConfigList): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteConfigEnv + "/" + params.appId + "/env/" + params.envId}`, "");
}

/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param appId appId
 * @param envId 环境id
 * @param type 同步范围
 * @param env 当前环境
 * @param name 当前应用
 * @param src_env_id 同步环境
 * @description  应用配置
 * @returns {Promise<T>}
 */
export function getConfigSync<T>(params: RequestParams.CreateSyncConfigList): Promise<T> {
  return axiosInstance.post<T>(`${api.getConfigDetail + "/" + params.appId + "/env/" + params.envId + "/sync"}`, params);
}

/**
 * @param appId appId
 * @param env_id 环境id
 * @param name 当前应用
 * @description  新增应用环境
 * @returns {Promise<T>}
 */
export function createEnvirment<T>(params: RequestParams.AddEnvirment): Promise<T> {
  return axiosInstance.post<T>(`${api.createAppEnvirment + "/" + params.appId + "/create-env"}`, params);
}

/**
 * @description  应用详情-环境tab
 * @returns {Promise<T>}
 */
export function getEnvList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.envVarList, "");
}

/**
 * @param keyword 关键字
 * @param envId 环境id
 * @description  全局变量列表
 * @returns {Promise<T>}
 */
export function getGlobalList<T>(params: RequestParams.GlobalVar): Promise<T> {
  return axiosInstance.get<T>(api.getGlobalList, params);
}

/**
 * @param id 配置项ID
 * @param key 键(全局变量)
 * @param remark 备注
 * @description  编辑/新增全局变量
 * @returns {Promise<T>}
 */
export function createOrAddGlobalList<T>(params: RequestParams.CreateAndUpdateGlobalList): Promise<T> {
  return axiosInstance.post<T>(api.createGlobalConfig, params);
}

/**
 * @param globalKey 全局配置key
 * @description  删除全局变量
 * @returns {Promise<T>}
 */
export function deleteGlobalVar<T>(params: RequestParams.DeleteGlobalList): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteGlobalVar + "/" + params.globalKey + "/delete"}`, "");
}

/**
 * @param key  全局变量键名
 * @description  删除全局变量
 * @returns {Promise<T>}
 */
export function getGlobalTab<T>(params: RequestParams.GetGlobalTabList): Promise<T> {
  return axiosInstance.get<T>(`${api.getGlobalTabList + "/" + params.key + "/tab-list"}`, "");
}

/**
 * @param globalId  全局变量ID
 * @param value 值
 * @param is_encryption 加密
 * @description  编辑全局环境配置
 * @returns {Promise<T>}
 */
export function updateGlobalEnv<T>(params: RequestParams.UpdateGlobalEnv): Promise<T> {
  return axiosInstance.put<T>(`${api.updateOrAddGlobalEnvirment + "/" + params.globalId}`, params);
}

/**
 * @param env_ids 环境ID
 * @param key 键(全局变量)
 * @param value 值
 * @param is_encryption 加密
 * @description  编辑/新增全局环境
 * @returns {Promise<T>}
 */
export function createOrAddGlobalEnv<T>(params: RequestParams.CreateAndUpdateGlobalEnv): Promise<T> {
  return axiosInstance.post<T>(`${api.createGlobalEnvirment + "/:" + params.key + "/create-env"}`, params);
}

/**
 * @param globalKey 全局配置key
 * @param envId  环境ID
 * @description  删除全局变量->>全局环境
 * @returns {Promise<T>}
 */
export function deleteGlobalVarEnv<T>(params: RequestParams.DeleteGlobalEnvList): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteGlobalEnvirment + "/" + params.globalKey + "/env/" + params.envId}`, "");
}

/**
 * @param text  值
 * @description  加解密
 * @returns {Promise<T>}
 */
export function decryptGlobalVal<T>(params: RequestParams.DecryptGlobalVal): Promise<T> {
  return axiosInstance.post<T>(api.decryptGlobalVal, params);
}
