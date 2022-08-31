/*
 * @Author: 柴璐
 * @Date: 2022-08-29 17:16:32
 * @LastEditTime: 2022-08-29 17:16:32
 * @LastEditors: 柴璐
 * @Description:
      封装element-plus消息提示组件
   使用方法：
  import { info, success, warning, error } from "@/utils/messages";
    info("测试", 2000);
    success("测试", 3000);
    warning("测试", 4000);
    error("测试", 4000);
 */

import { ElMessage } from "element-plus";
import { MESSAGE_TIP } from "@/utils";
export function info(message: string, duration: number) {
  ElMessage({
    message: message || MESSAGE_TIP.fail,
    type: "info",
    duration: duration || 1500
  });
}

export function success(message: string, duration: number) {
  ElMessage({
    message: message || MESSAGE_TIP.success,
    type: "success",
    duration: duration || 1500
  });
}

export function warning(message: string, duration: number) {
  ElMessage({
    message: message || MESSAGE_TIP.fail,
    type: "warning",
    duration: duration || 1500
  });
}

export function error(message: string, duration: number) {
  ElMessage({
    message: message || MESSAGE_TIP.fail,
    type: "error",
    duration: duration || 1500
  });
}
