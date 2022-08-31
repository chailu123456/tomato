/*
 * @Author: 宋绍华
 * @Date: 2021-10-30 16:26:32
 * @LastEditTime: 2022-05-24 21:04:52
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\utils\enum.ts
 */
// 消息提醒，跳转类型
export enum LinkType {
  //任务模块
  TASKMODULE = "task",
  //Bug模块
  BUGMODULE = "bug",
  //提测模块
  APPLYTESTMODULE = "applyTest",
  // 文档可读权限模块
  WIKIREADPERMISSION = "wikiReadPermission",
  // 文档可写权限模块
  WIKIWRITEPERMISSION = "wikiWritePermission",
  // 文档允许可读权限模块
  WIKIAGREEREADPERMISSION = "wikiAgreeReadPermission",
  // 文档允许编辑权限模块
  WIKIAGREEWRITEPERMISSION = "wikiAgreeWritePermission",
  // 审批单消息类型
  DEMANDAPPROVAL = "demandApproval",
  // 提测单
  APPLYTEST = "applyTest"
}

// 浏览器消息通知状态
export enum NotificationType {
  DENIED = "denied", // 被拒绝
  DEFAULT = "default", // 默认
  GRANTED = "granted" // 被授予
}

// 常量
export enum CONSTVAR {
  LOGO = "http://file.vetscloud.com/7b524c4b300fe6c55cd9a6d064abff2a.png"
}
