import { setSession, getSession, clearSession } from "./sesssion";
import { STATUS, ENVIRONMENT_VARIABLE, TYPE_STATUS, BUG_STATUS, TASK_TYPE, BUG_LEVEL, RUN_ENV, LANGUAGE } from "./contantOptions";
import MESSAGE_TIP from "./tipMessage";
/**
 *
 * @return {object}
 * @description 获取地址栏参数拼装为对象返回
 */
function getLocalhrefParams(): Record<string, any> {
  const href = location.href;
  const res: Record<string, any> = {};
  try {
    const URI = href.split("?")[1];
    if (URI) {
      const params = URI.split("&");
      params.forEach((v) => {
        const variables = v.split("=");
        const key = variables[0];
        const value = variables[1];
        res[key] = value;
      });
    }
  } catch (err) {
    console.log(err);
  }
  return res;
}
/**
 *
 * @param {value} any
 * @returns {boolean} 布尔值
 * @description 判断是否为普通对象
 */
function isPlainObject(value: unknown): boolean {
  return Object.prototype.toString.call(value) === "[object Object]";
}
export { setSession, getSession, clearSession, STATUS, ENVIRONMENT_VARIABLE, getLocalhrefParams, isPlainObject, MESSAGE_TIP, TYPE_STATUS, BUG_STATUS, TASK_TYPE, BUG_LEVEL, RUN_ENV, LANGUAGE };
