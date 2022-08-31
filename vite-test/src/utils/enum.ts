// 消息提醒，跳转类型
export enum LinkType {
  //socket链接成功事件
  connectedEvent = "connected",
  //任务创建成功事件
  taskCreatedEvent = "task-created",
  //被指派bug
  bugAssignedEvent = "bug-assigned",
  //完成任务
  taskFinishedEvent = "task-finished",
  //完成bug
  bugFinishedEvent = "bug-finished",
  //提测申请
  applyTestEvent = "apply-test",
  //提测驳回
  rejectTestEvent = "reject-test",
  //发布申请
  applyReleaseEvent = "apply-release"
}
