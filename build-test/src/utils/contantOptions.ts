// 岗位类型
export const POST_TYPE = [
  {
    value: 1,
    label: "前端"
  },
  {
    value: 2,
    label: "后端"
  },
  {
    value: 3,
    label: "产品"
  },
  {
    value: 4,
    label: "测试"
  },
  {
    value: 5,
    label: "其他"
  }
];

// 计划状态
export const PLAN_STATUS = [
  // 0:待设计;1:设计中;2:待评审;3:待开发;4:开发中;5:测试中;6:待发版;7:已发版;998:未关联,999:已作废
  //0:待设计;1:设计中;2:待评审;3:待开发;4:开发中;5:测试中;6:待发布;7:已发布;8:已评审;997:待审核;998:未关联;999:已作废;1000:已审核
  // { value: -1, label: "全部", color: "#999" },
  { value: 997, label: "待审批", color: "#999999" },
  { value: 996, label: "审批中", color: "#999999" },
  { value: 998, label: "未关联", color: "#999999" },
  { value: 0, label: "待设计", color: "#49b513" },
  { value: 1, label: "设计中", color: "#49b513" },
  { value: 2, label: "待评审", color: "#e6a23c" },
  { value: 3, label: "待开发", color: "#e6a23c" },
  { value: 4, label: "开发中", color: "#49b513" },
  { value: 5, label: "测试中", color: "#1f9f85" },
  { value: 6, label: "待发布", color: "#e6a23c" },
  { value: 7, label: "已发布", color: "#666666" },
  { value: 8, label: "已评审", color: "#1f9f85" }
  // { value: 999, label: "已作废", color: "#999999" }
];

// 需求池模块状态
export const DEMAND_STATUS = [
  // 状态 1. 待审核  2.待开始  3.审批中, 4.设计中, 5.设计完成, 6.已评审, 7.开发中, 8.已上线
  // { value: -1, label: "全部", color: "#999" },
  // { value: "1", label: "待审核", color: "#49b513", disabled: true },
  { value: 2, label: "待开始", color: "#e6a23c" },
  // { value: "3", label: "审批中", color: "#e6a23c", disabled: true },
  { value: 4, label: "设计中", color: "#49b513" },
  { value: 5, label: "设计完成", color: "#1f9f85" },
  { value: 6, label: "已评审", color: "#e6a23c" },
  { value: 7, label: "开发中", color: "#666666" },
  { value: 8, label: "已上线", color: "#1f9f85" }
  // { value: 999, label: "已作废", color: "#999999" }
];
// 需求池优先级
export const DEMAND_PRIORITY = [
  {
    value: "1",
    label: "P0",
    color: "#dd0101"
  },
  {
    value: "2",
    label: "P1",
    color: "#f56c6c"
  },
  {
    value: "3",
    label: "P2",
    color: "#e6a23c"
  },
  {
    value: "4",
    label: "P3",
    color: "#6a7e02"
  }
];

// 工时
export const HOURS = [
  {
    value: "1",
    label: "1"
  },
  {
    value: "2",
    label: "2"
  },
  {
    value: "3",
    label: "3"
  },
  {
    value: "4",
    label: "4"
  },
  {
    value: "5",
    label: "5"
  },
  {
    value: "6",
    label: "6"
  },
  {
    value: "7",
    label: "7"
  },
  {
    value: "8",
    label: "8"
  },
  {
    value: "9",
    label: "9"
  },
  {
    value: "10",
    label: "10"
  }
];

// 迭代状态
export const STATUS = [
  {
    value: 0,
    label: "未开始",
    color: "#e6a23c"
  },
  {
    value: 1,
    label: "设计中",
    color: "#49b513"
  },
  {
    value: 2,
    label: "开发中",
    color: "#49b513"
  },
  {
    value: 3,
    label: "联调中",
    color: "#49b513"
  },
  {
    value: 4,
    label: "测试中",
    color: "#1f9f85"
  },
  {
    value: 5,
    label: "待发布",
    color: "#e6a23c"
  },
  {
    value: 6,
    label: "已发布",
    color: "#666666"
  },
  {
    value: 7,
    label: "已搁置",
    color: "#666666"
  },
  {
    value: 8,
    label: "待测试",
    color: "#e6a23c"
  }
];

export const OVERVIEW_CALENDAR_STATUS = [
  {
    value: -1,
    label: "全部",
    color: "#999"
  },
  {
    value: 1,
    label: "开发"
  },
  {
    value: 2,
    label: "联调"
  },
  {
    value: 3,
    label: "测试"
  },
  {
    value: 4,
    label: "发布"
  }
];

export const TEST_OVERVIEW_STATUS = [
  {
    value: 4,
    label: "测试中",
    color: "#999"
  },
  {
    value: 5,
    label: "待发布",
    color: "#999"
  },
  {
    value: 6,
    label: "已发布",
    color: "#000"
  }
];
// 类型：0其他；1设计；2后端开发；3联调；4测试；5沟通；6前端开发；7 产品；

export const TYPE_STATUS = [
  // {
  //   value: -1,
  //   label: "全部"
  // },
  {
    value: 5,
    label: "沟通"
  },
  {
    value: 1,
    label: "设计"
  },
  {
    value: 7,
    label: "产品"
  },
  {
    value: 6,
    label: "前端开发"
  },
  {
    value: 2,
    label: "后端开发"
  },
  {
    value: 3,
    label: "联调"
  },
  {
    value: 4,
    label: "测试"
  },
  {
    value: 0,
    label: "其它"
  }
];

// 我的工作台-工作项模块 类型 1.需求，2.任务，3.bug，4.待办
export const WORK_TYPE = [
  {
    value: 5,
    label: "需求",
    color: "#9e63fc"
  },
  {
    value: 2,
    label: "任务",
    color: "#80ad0a"
  },
  {
    value: 3,
    label: "缺陷",
    color: "#ff777e"
  }

  // {
  //   value: 4,
  //   label: "待办",
  //   color: "#6890ec"
  // }
];
// 我的工作台-工作项模块  状态 1.未开始，2.进行中，3.已完成，4.已删除
export const WORK_STATUS = [
  {
    value: 1,
    label: "未开始",
    color: "#333"
  },
  {
    value: 2,
    label: "进行中",
    color: "#80ad0a"
  },
  {
    value: 3,
    label: "已完成",
    color: "rgb(160, 160, 160)"
  },
  {
    value: 6,
    label: "延期",
    color: "#ff777e"
  }
];

// 我的工作台-动态模块 类型 1:项目,2:迭代,3:需求,4:计划,5:任务,6:bug
export const DYNAMICS_TYPE = [
  {
    value: 1,
    label: "项目",
    color: "#6890ec"
  },
  {
    value: 2,
    label: "迭代",
    color: "#6f6f6f"
  },
  {
    value: 3,
    label: "需求",
    color: "#ff777e"
  },
  {
    value: 4,
    label: "计划",
    color: "#a5a5a5"
  },
  {
    value: 5,
    label: "任务",
    color: "#a5a5a5"
  },
  {
    value: 6,
    label: "BUG",
    color: "#a5a5a5"
  }
];

export const ENVIRONMENT_VARIABLE = [
  {
    value: 0,
    label: "全部"
  },
  {
    value: 1,
    label: "开发"
  },
  {
    value: 2,
    label: "测试"
  },
  {
    value: 3,
    label: "压测"
  },
  {
    value: 4,
    label: "预发"
  },
  {
    value: 5,
    label: "生产"
  }
];

export const BUG_STATUS = [
  {
    value: -1,
    label: "全部"
  },
  {
    value: 0,
    label: "待解决",
    color: "#e6a23c"
  },
  {
    value: 1,
    label: "进行中",
    color: "#49b513"
  },
  {
    value: 2,
    label: "已解决",
    color: "#666666"
  },
  {
    value: 3,
    label: "已关闭",
    color: "#999999"
  },
  {
    value: 4,
    label: "延期处理",
    color: "#666666"
  },
  {
    value: 5,
    label: "不予处理",
    color: "#666666"
  },
  {
    value: 6,
    label: "重新打开",
    color: "#f56c6c"
  },
  {
    value: 999,
    label: "已作废",
    color: "#999999"
  }
];

export const TASK_TYPE = [
  {
    value: 0,
    label: "未开始",
    color: "#e6a23c"
  },
  {
    value: 1,
    label: "进行中",
    color: "#49b513"
  },
  {
    value: 2,
    label: "已完成",
    color: "#666666"
  },
  {
    value: 3,
    label: "已关闭",
    color: "#999999"
  },
  {
    value: 4,
    label: "已延期",
    color: "#f56c6c"
  },
  {
    value: 5,
    label: "已搁置",
    color: "#666666"
  }
];

export const BUG_LEVEL = [
  {
    value: 1,
    label: "一般",
    color: "#e6a23c"
  },
  {
    value: 2,
    label: "中等",
    color: "#f56c6c"
  },
  {
    value: 3,
    label: "严重",
    color: "#dd0101"
  }
];

export const BUG_TYPE = [
  {
    value: 1,
    label: "代码错误"
  },
  {
    value: 2,
    label: "设计缺陷"
  },
  {
    value: 3,
    label: "交互优化"
  },
  {
    value: 4,
    label: "配置相关"
  },
  {
    value: 5,
    label: "性能问题"
  },
  {
    value: 6,
    label: "校验规范"
  },
  {
    value: 7,
    label: "测试脚本"
  },
  {
    value: 8,
    label: "其他"
  }
];
export const LANGUAGE = [
  {
    id: 0,
    value: "Java"
  },
  {
    id: 1,
    value: "JavaScript"
  },
  {
    id: 2,
    value: "Golang"
  },
  {
    id: 3,
    value: "PHP"
  },
  {
    id: 4,
    value: ".NET"
  },
  {
    id: 5,
    value: "dart"
  },
  {
    id: 6,
    value: "Objective-C"
  },
  {
    id: 7,
    value: "Swift"
  },
  {
    id: 8,
    value: "Kotlin"
  },
  {
    id: 9,
    value: "C/C++"
  }
];

export const RUN_ENV = [
  {
    id: 2,
    value: "Docker"
  },
  {
    id: 1,
    value: "宿主机"
  },
  {
    id: 3,
    value: "K8S"
  }
];

export const RANGE = [
  // 修改为多选，去除全部
  // {
  //   label: "全部",
  //   value: 0
  // },
  {
    label: "应用",
    value: 1
  },
  {
    label: "全局",
    value: 2
  }
];
export const TEST_STATUS = [
  {
    id: 0,
    value: "待提测"
  },
  {
    id: 1,
    value: "联调中"
  },
  {
    id: 2,
    value: "待测试"
  },
  {
    id: 3,
    value: "测试中"
  },
  {
    id: 4,
    value: "测试完成"
  },
  {
    id: 5,
    value: "待发布"
  },
  {
    id: 6,
    value: "已发布"
  }
];

// 需求池优先级
export const PRIORITY = [
  {
    id: 1,
    value: "P0",
    color: "#dd0101"
  },
  {
    id: 2,
    value: "P1",
    color: "#f56c6c"
  },
  {
    id: 3,
    value: "P2",
    color: "#e6a23c"
  },
  {
    id: 4,
    value: "P3",
    color: "#6a7e02"
  }
];

export const ENVLIST = [
  {
    id: 1,
    value: "测试"
  },
  {
    id: 2,
    value: "UAT"
  },
  {
    id: 3,
    value: "生产"
  }
];

// 文档模块
// 一级分类
export const CLASSIFY = [
  {
    value: "0",
    label: "知识库"
  },
  {
    value: "1",
    label: "项目文档"
  }
];
// 标注评论下拉
export const COMMONCLASSIFY = [
  {
    value: "1",
    label: "所有人可评论"
  },
  {
    value: "2",
    label: "仅编辑权限可评论"
  }
];
// 链接分享下拉
export const LINKSHARE = [
  {
    value: "1",
    label: "组织内获取链接的人可阅读"
  },
  {
    value: "2",
    label: "组织内获取链接的人可编辑"
  }
];
// 公开分享下拉
export const PUBLICSHARE = [
  {
    value: "1",
    label: "文档中心所有人可阅读"
  },
  {
    value: "2",
    label: "文档中心所有人可编辑"
  }
];

// 需求列表状态
export const APPROVALSTATUSLIST = [
  {
    id: 0,
    value: "全部"
  },
  {
    id: 1,
    value: "已保存"
  },
  {
    id: 2,
    value: "审批中"
  },
  {
    id: 3,
    value: "已通过"
  },
  {
    id: 4,
    value: "已终止"
  }
];

export const requireTypes = [
  {
    id: 1,
    value: "新增功能"
  },
  {
    id: 2,
    value: "产品优化"
  },
  {
    id: 3,
    value: "缺陷修复"
  },
  {
    id: 4,
    value: "政治项目"
  },
  {
    id: 5,
    value: "配合升级"
  }
];

// export const TASK_TYPE = [
//   {
//     value: 0,
//     label: "未开始",
//     color: "#e6a23c"
//   },
//   {
//     value: 1,
//     label: "进行中",
//     color: "#49b513"
//   },
//   {
//     value: 2,
//     label: "已完成",
//     color: "#666666"
//   },
//   {
//     value: 3,
//     label: "已关闭",
//     color: "#999999"
//   },
//   {
//     value: 4,
//     label: "已延期",
//     color: "#f56c6c"
//   },
//   {
//     value: 5,
//     label: "已搁置",
//     color: "#666666"
//   },
//   {
//     value: 999,
//     label: "已删除",
//     color: "#999999"
//   }
// ];

// 提测单status
export const TESTBILLTYPES = [
  {
    value: 1,
    label: "待提测",
    color: "#e6a23c"
  },
  {
    value: 2,
    label: "已驳回",
    color: "#f56c6c"
  },
  {
    value: 3,
    label: "待确认",
    color: "#49b513"
  },
  {
    value: 4,
    label: "测试中",
    color: "#49b513"
  },
  {
    value: 5,
    label: "测试完成",
    color: "#666666"
  },
  {
    value: 6,
    label: "待发布",
    color: "#666666"
  },
  {
    value: 7,
    label: "已发布",
    color: "#666666"
  }
];

// 不予处理、延期处理的原因
export const REJECTDEALREASON = [
  {
    value: 1,
    label: "设计如此"
  },
  {
    value: 2,
    label: "重复BUG"
  },
  {
    value: 3,
    label: "无法重现"
  },
  {
    value: 4,
    label: "外部原因"
  },
  {
    value: 5,
    label: "业务决策"
  },
  {
    value: 6,
    label: "时间不足"
  }
];
