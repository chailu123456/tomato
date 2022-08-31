const base_url = "/api";
const plan = {
  getPlanLists: "/tomato/plan"
};
const test = {
  // 获取bug列表
  getBugList: "/tomato/bug",
  // 更新bug状态
  updateBugStatus: "/tomato/bug/status",
  // 更新bug
  updateBug: "/tomato/bug",
  // 创建bug
  createBug: "/tomato/bug",
  // 创建bug
  getApplyTestList: "/tomato/apply-test",
  // 编辑提测内容
  editTestContent: "/tomato/apply-test",
  // 申请提测
  applyTest: "/tomato/apply-test/do"
};
const product = {
  // 创建产品
  createProduct: "/tomato/product",
  // 编辑产品
  updateProduct: "/tomato/product",
  // 获取产品列表
  getProductList: "/tomato/product",
  // 更新产品状态
  updateStatus: "/tomato/product/update-status",
  // 产品下拉列表
  selectProductList: "/tomato/product/list",
  // 负责人下拉列表
  selectManagerList: "/tomato/product/manager",
  // 创建需求
  createDemand: "/tomato/demand",
  // 获取需求列表
  getDemandList: "/tomato/demand",
  // 需求作废
  deleteDemand: "/tomato/demand/trash/",
  // 维护需求
  putDemand: "/tomato/demand",
  // 计划列表
  getPlan: "/tomato/plan",
  // 编辑计划
  updatePlan: "/tomato/plan",
  // 创建计划
  createPlan: "/tomato/plan",
  // 更新计划状态
  updatePlanStatus: "/tomato/plan/update-status",
  // 作废计划
  deletePlan: "/tomato/plan/trash/",
  // 获取关联需求
  getRelevanceDemandList: "/tomato/demand/list"
};

const iteration = {
  // 迭代列表
  getIterationList: "/tomato/iteration",
  // 迭代详情
  getIterationDetail: "/tomato/iteration/",
  // 迭代需求下拉列表
  getDemandSelectList: "/tomato/iteration/list",
  // 更新维护成员
  updateEmployeeList: "/tomato/iteration/user",
  // 更新维护应用
  updateAppList: "/tomato/iteration/app",
  // 更新文档(UI设计图/详细设计/测试用例)
  updateDoc: "/tomato/doc",
  // 更新迭代状态
  updateIterationStatus: "/tomato/iteration/status",
  // 创建/更新迭代
  createIteration: "/tomato/iteration",
  // 开发-任务列表
  getTaskList: "/tomato/task",
  // 批量创建
  createTaskList: "/tomato/task",
  // 更新开发-任务列表状态
  updateTaskList: "/tomato/task/status",
  // 编辑任务
  updateTask: "/tomato/task",
  // 迭代日历
  getCalendarLists: "/tomato/iteration/calendar",
  // 获取产品级联选择器
  getPlanCascader: "/tomato/plan/cascader"
};

// 消息通知
const notices = {
  getSiteMessage: "/tomato/site-message", // 通知列表
  updateSideMessageStatus: "/tomato/site-message/read-status", // 更新已读状态
  updateSideMessageStatusAll: "/tomato/site-message/read-status/all" // 更新所有已读状态
};

const common = {
  getByUserId: "/data-api/qywx_user/getByUserId",
  // 获取技术部员工列表
  getEmployeeList: "/tomato/staff/it-staff",
  // 获取应用列表
  getAppList: "/tomato/apps/list",
  uploadAssets: "/upload/fss/up"
};
const setting = {
  getSettingAppList: "/tomato/apps",
  createSettingApp: "/tomato/apps"
};

const target = {
  ...iteration,
  ...plan,
  ...product,
  ...common,
  ...test,
  ...setting,
  ...notices
};
const api = new Proxy(target, {
  get(target, propKey) {
    if (Reflect.get(target, propKey)) {
      return propKey === "getByUserId" || propKey === "uploadAssets" ? Reflect.get(target, propKey) : base_url + Reflect.get(target, propKey);
    }
  },
  set() {
    return false;
  }
});
export default api;
