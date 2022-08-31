export const STATUS = [
  {
    value: -1,
    label: "全部"
  },
  {
    value: 0,
    label: "未开始"
  },
  {
    value: 1,
    label: "设计中"
  },
  {
    value: 2,
    label: "开发中"
  },
  {
    value: 3,
    label: "联调中"
  },
  {
    value: 4,
    label: "测试中"
  },
  {
    value: 5,
    label: "待发版"
  },
  {
    value: 6,
    label: "已发版"
  },
  {
    value: 999,
    label: "已废弃"
  }
];

export const TYPE_STATUS = [
  {
    value: -1,
    label: "全部"
  },
  {
    value: 0,
    label: "其他"
  },
  {
    value: 1,
    label: "设计"
  },
  {
    value: 2,
    label: "开发"
  },
  {
    value: 3,
    label: "联调"
  },
  {
    value: 4,
    label: "测试"
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
    color: "#000"
  },
  {
    value: 1,
    label: "进行中",
    color: "#6CBC01"
  },
  {
    value: 2,
    label: "已解决",
    color: "#F8982D"
  },
  {
    value: 3,
    label: "已关闭",
    color: "#AEAEAE"
  },
  {
    value: 999,
    label: "已作废",
    color: "#AEAEAE"
  }
];

export const TASK_TYPE = [
  {
    value: -1,
    label: "全部"
  },
  {
    value: 0,
    label: "未开始"
  },
  {
    value: 1,
    label: "进行中"
  },
  {
    value: 2,
    label: "已完成"
  },
  {
    value: 3,
    label: "已关闭"
  },
  {
    value: 4,
    label: "已延期"
  },
  {
    value: 5,
    label: "已搁置"
  },
  {
    value: 999,
    label: "已删除"
  }
];

export const BUG_LEVEL = [
  {
    value: 1,
    label: "一般"
  },
  {
    value: 2,
    label: "中等"
  },
  {
    value: 3,
    label: "严重"
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

export const TEST_STATUS = [
  {
    id: 0,
    value: "待提测"
  },
  {
    id: 1,
    value: "提测驳回"
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
