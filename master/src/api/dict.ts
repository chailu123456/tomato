const base_url = "/api";
const plan = {
  getPlanLists: "/tomato/plan",
  // 计划列表分页
  getPlanListsTurnPage: "/tomato/plan/turn-page",
  // 计划管理查看需求详情
  getRelatedDemand: "/tomato/plan/related-demand",
  updateIterPlan: "/tomato/iteration/plan"
};

const workBench = {
  getDashboard: "/tomato/dashboard",
  getWorkTeam: "/tomato/work-team",
  getWorkTeamToDo: "/tomato/work-team/to-do",
  // 项目动态列表
  getProductDynamic: "/tomato/product-news",
  // 项目动态操作人下拉列表
  getProductPeople: "/tomato/product-news/list-creator",
  // 操作待办
  handleTomatoBackLog: "/tomato/backlog",
  // 删除待办
  delCalenderBackLog: "/tomato/backlog/calendar/del",
  // 工作项日历列表
  getCalenderList: "/tomato/work-team/calendar",
  // 获取参与的项目列表
  getListParticipate: "/tomato/product/list-participate",
  // 工作时间轴
  getTimeline: "/tomato/work-team/timeline"
};
const test = {
  // 获取bug列表
  getBugList: "/tomato/bug",
  // 更新bug状态
  updateBugStatus: "/tomato/bug/status",
  // 获取bug动态
  getBugDynamic: "/tomato/bug/state/",
  // 更新bug
  updateBug: "/tomato/bug",
  // 创建bug
  createBug: "/tomato/bug",
  // bug创建人
  createPeopleBug: "/tomato/bug/list-creator",
  // 创建bug
  getApplyTestList: "/tomato/apply-test",
  // 编辑提测内容
  editTestContent: "/tomato/apply-test",
  // 申请提测
  applyTest: "/tomato/apply-test/do",
  // 申请提测 -- 开始联调
  startUnion: "/tomato/iteration/start-union",
  // 申请提测 -- 更新测试进度
  updateTest: "/tomato/iteration/test-progress",
  // 申请提测 --  更新联调进度
  updateUnion: "/tomato/iteration/union-progress",

  // 获取bug详情
  getBugDetail: "/tomato/bug/",
  // 修改指派
  updateAssignTask: "/tomato/bug/assign-task",
  // 获取延期bug
  getDelayBug: "/tomato/bug/delay",
  // 提测单
  getTestBill: "/tomato/product-test",
  // 提测单已关联下拉列表
  getAssociatedSelect: "/tomato/product-test/associated-select",
  // 提测单创建人列表
  creatorList: "/tomato/product-test/list-creator",
  // 更改提测单状态
  modifyTestBillStatus: "/tomato/product-test/status",
  // 提测单关联下拉(未关联数据)
  availableTestBillList: "/tomato/product-test/available-select",
  availableIterationTestBillList: "/tomato/product-test/available-iteration"
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
  // 优先级修改
  updatePriority: "/tomato/demand/level",
  // 批量作废
  updateTrash: "/tomato/demand/trash",
  // 需求用户下拉列表
  demandUserList: "/tomato/demand/user",
  // 需求模块-计划下来选择列表
  demandPlanList: "/tomato/plan/select",
  // 获取需求列表
  getDemandList: "/tomato/demand",
  // 获取需求详情来源人、来源部门
  getDemandOriginList: "/tomato/demand/origin/search",

  // 获取需求列表-详情
  getDemandListDetail: "/tomato/demand",
  // 需求详情中的动态列表
  getDemandListDetailLog: "/tomato/demand/state",
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
  // 计划详情
  detailPlan: "/tomato/plan",
  // 计划详情-移除计划下的需求
  movePlanDemand: "/tomato/plan/move-demand",
  // 更新计划状态
  updatePlanStatus: "/tomato/plan/update-status",
  // 作废计划
  deletePlan: "/tomato/plan/trash/",
  // 获取关联需求
  getRelevanceDemandList: "/tomato/demand/list",
  // 获取需求池状态列表
  getDemandListStatus: "/tomato/demand/status",
  // 获取需求池状态列表翻页
  getDemandListPage: "/tomato/demand/status/page",
  // 获取员工详情（具体部门）
  getStaffDetail: "/tomato/staff/info",
  // 获取设置模块-模块列表
  getSettingModule: "/tomato/module/tree",
  // 获取得到模块详情
  getModuleDetail: "/tomato/module",
  // 移动模块
  moveModule: "/tomato/module/move",
  // 编辑设置模块-模块
  editSettingModule: "/tomato/module",
  // 编辑设置模块-模块
  deleteSettingModule: "/tomato/module",
  // 创建设置模块-模块
  createSettingModule: "/tomato/module",
  // 设置设置模块-模块-需求列表
  settingModuleDemand: "/tomato/demand/module",
  // 成员模块-列表
  memberList: "/tomato/product",
  // 添加项目成员
  addMember: "/tomato/product",
  // 设置项目负责人
  setManage: "/tomato/product",
  // 成员模块-列表
  deleteMember: "/tomato/product",
  // 迭代-迭代概览-添加成员
  getProductMember: "/tomato/product",
  // 成员模块-所有成员
  allMember: "/tomato/product",
  // 审批单列表
  getApproval: "/tomato/demand-approval",
  // 审批单产品经理下拉选择数据
  getApprovalUser: "/tomato/demand-approval/user",
  // 撤回审批单
  withdraw: "/tomato/demand-approval/",
  // 删除审批单
  deleteApproval: "/tomato/demand-approval/",
  // 提醒审批单
  remindApproval: "/tomato/demand-approval",
  // 获取审批单列表
  getDemandApprovalList: "/tomato/demand-approval/demand",
  // 获取审批记录接口
  getDemandApprovalLogList: "/tomato/demand-approval/log",
  // 多项目成员列表
  getMultipleProductList: "/tomato/product/staff/list",
  // 多项目下需求下拉选择
  getMultipleProductDemandList: "/tomato/demand/products/select",
  // 需求文档列表
  getDemandDocList: "/tomato/product/doc",
  // 新增需求文档
  addDemandDoc: "/tomato/product/doc",
  // 需求文档下拉列表tree
  demandDocSelectList: "/tomato/product/doc/select",
  // 删除需求文档
  removeDemandDoc: "/tomato/product/doc",
  // 更新编辑需求文档
  editDemandDoc: "/tomato/product/doc",
  // 新增文档合集子集
  addChildDemandDoc: "/tomato/product/doc/sub-doc",
  // 需求文档动态
  demandDocLog: "/tomato/product/doc/state",
  // 计划模块-解除文档关联计划
  removeRelativeDoc: "/tomato/product/doc/plan",
  // 计划模块-计划关联的需求文档树
  planRelativeDoc: "/tomato/plan/doc-tree",
  // 获取链接标题
  getUrlTitle: "/tomato/tools/metadata",
  // 计划详情-新增关联已上传文档
  demandPlanRelativeAdd: "/tomato/product/doc/union-plan"
};

const iteration = {
  // 迭代列表
  getIterationList: "/tomato/iteration",
  // 迭代详情
  getIterationDetail: "/tomato/iteration/",
  // 搁置迭代恢复
  reductionIterationStatus: "/tomato/iteration",
  // 迭代需求下拉列表
  getDemandSelectList: "/tomato/iteration/select",
  // 更新维护成员
  updateEmployeeList: "/tomato/iteration/user",
  // 员工迭代日历
  getEmployeeCalendarList: "/tomato/iteration/user-calendar",
  // 员工迭代详情
  getEmployeeCalendarDetails: "/tomato/iteration/user-calendar/details",
  // 测试概览列表
  getTestOverflowList: "/tomato/iteration/situation",
  // 测试概览列表
  editTestOverflowRemark: "/tomato/iteration/apply-test-remark",
  // 更新UI文档
  updateUi: "/tomato/iteration/ui-doc",
  // 新增UI文档
  addUi: "/tomato/iteration/ui-doc",
  // 迭代需求关联的文档树
  interDocTelativetree: "/tomato/iteration/doc-tree",
  // 更新迭代需求关联的文档树
  updateDocRelative: "/tomato/iteration/doc",

  // 解除文档关联
  removeDocRelative: "/tomato/iteration/doc",
  // 迭代文档列表
  docList: "/tomato/iteration/doc",
  // 人员排布列表
  getPeopleList: "/tomato/staff-arrange",
  // 人员排布列表--备注编辑
  editPeopleRemark: "/tomato/staff-arrange/remark",
  // 人员排布列表--关联计划列表
  relativePeoplePlan: "/tomato/staff-arrange/related-plan",
  // 人员排布列表--关联计划列表
  getPlanList: "/tomato/plan/select",
  // 人员排布列表--关联计划编辑
  editRelativePeoplePlan: "/tomato/staff-arrange/related-plan",
  // 更新维护应用
  updateAppList: "/tomato/iteration/app",
  // 更新文档(UI设计图/详细设计/测试用例)
  updateDoc: "/tomato/doc",
  // 批量更新需求説明
  updateDocBatch: "/tomato/doc/batch",
  // 更新迭代状态
  updateIterationStatus: "/tomato/iteration/status",
  // 创建/更新迭代
  createIteration: "/tomato/iteration",
  // 更新迭代关联需求
  updateIterationDemand: "/tomato/iteration/demand",
  // 开发-任务列表
  getTaskList: "/tomato/task",
  // 批量创建
  createTaskList: "/tomato/task",
  // 更新开发-任务列表状态
  updateTaskList: "/tomato/task/status",
  // 指派任务列表状态
  giveTaskList: "/tomato/task/assign-task",
  // 编辑任务
  updateTask: "/tomato/task",
  // 编辑任务 基础项编辑
  updateBasicTask: "/tomato/task/update",
  // 任务 创建人列表
  creatorTask: "/tomato/task/list-creator",
  // 任务-关联任务弹窗-确定
  relativeTaskIteration: "/tomato/task/related-iteration",
  // 关联任务弹窗列表
  relativeTask: "/tomato/task/select",
  // 获取任务详情
  detailTask: "/tomato/task",
  // 删除任务
  deleteTask: "/tomato/task",
  // 获取任务详情动态
  detailTaskLog: "/tomato/task",
  // 编辑任务-优先级
  updateTaskLevel: "/tomato/task/level",
  // 下拉列表任务
  getBugTaskList: "/tomato/task/select",
  // 迭代日历
  getCalendarLists: "/tomato/iteration/calendar",
  // // 获取可关联计划级联选择器
  // getPlanCascader: "/tomato/plan/cascader",
  // 获取可关联计划非级联选择器
  getIterationPlanList: "/tomato/plan/list",
  // 迭代员工列表
  getIterationEmployeeList: "/tomato/staff/iteration-user",
  // 需求下拉列表
  getIterationDemand: "/tomato/demand/select",
  // 风险备注
  updateRiskWarning: "/tomato/iteration/risk-warning",
  // 产品-迭代级联选择器
  getIterationCascader: "/tomato/iteration/cascader",
  // 统计视图数据
  getStatisticsData: "/tomato/chart",
  // 用例列表
  getUseCaseData: "/tomato/test-case",
  // 新增用例
  addUseCaseData: "/tomato/test-case",
  // 用例详情
  useCaseDetail: "/tomato/test-case",
  // 用例动态日志
  useCaseLog: "/tomato/test-case",
  // 用例模板下载
  useCaseTemplate: "/tomato/test-case/download-template",
  // 用例导入
  useCaseImport: "/tomato/test-case/import",
  // 编辑用例
  editUseCaseData: "/tomato/test-case",
  // 用例用户列表
  getUseCaseStaff: "/tomato/test-case/staff",
  // 更新用例状态
  updateUseCaseStatus: "/tomato/test-case/status",
  // 删除用例
  deleteUseCaseStatus: "/tomato/test-case/delete",
  // 更新用例备注
  updateUseCaseRemark: "/tomato/test-case/remark",
  // 测试用例下拉列表
  getUseCaseList: "/tomato/test-case/select",
  // 获取项目权限
  getProductPermission: "/tomato/product",
  // 处理周报
  handleWeekReport: "/tomato/iteration"
};

// 看板模块
const lookBoard = {
  montnlyStatistics: "/tomato/monthly-statistics/summary", // 月度总览 tab统计
  qualityOverflow: "/tomato/monthly-statistics/quality", // 质量概览
  iterationList: "/tomato/iteration", // 迭代列表
  staffWorkQuality: "/tomato/monthly-statistics/staff-criteria", // 成员工作质量
  iterateList: "/tomato/iteration/select", // 迭代列表
  teamList: "/tomato/team", // 团队列表
  teamProductList: "/tomato/team_product" // 团队项目列表
};

// 消息通知
const notices = {
  getSiteMessage: "/tomato/site-message", // 通知列表
  updateSideMessageStatusAll: "/tomato/site-message/read-status/all", // 更新所有已读状态
  updateSiteMsgStatusById: "/tomato/site-message/read-status" // 更新单个消息
};

// 文档
const doc = {
  getKnowledgeList: "/tomato/wiki/knowledge", // 知识库列表
  getClassify: "/tomato/wiki/staff/classify", // 一级分类
  updateCollection: "/tomato/wiki/collection", // 取消、收藏
  handleDoc: "/tomato/wiki", // 删除文档
  applyPermission: "/tomato/wiki/apply-permission", // 文档权限申请
  updatePermission: "/tomato/wiki/permission", // 更新文档权限
  getDocTitle: "/tomato/wiki/title", // 获取doc title
  topDoc: "/tomato/wiki/top", // 置顶文档
  tagList: "/tomato/wiki/tag", // 获取tag列表，下拉选项
  getProductList: "/tomato/wiki/product", // 项目文档列表
  getSpaceCollaboratList: "/tomato/wiki-space/collaboration", // 我的空间-协作列表
  getSpaceColllectList: "/tomato/wiki-space/collection", //  我的空间-收藏列表
  getSpaceDarftList: "/tomato/wiki-space/draft", //  我的空间-草稿列表
  getSpacePublishList: "/tomato/wiki-space/published", //  我的空间-已分享列表
  getShareList: "/tomato/wiki/classify", //  分享弹框-项目文档分类列表
  getTableData: "/tomato/wiki", //  文档中心-表格列表
  getClassifyTree: "/tomato/wiki-classify/tree", //  文档中心-分类列表
  updateClassifyName: "/tomato/wiki-classify/rename", //  文档中心-分类列表-重命名
  addClassify: "/tomato/wiki-classify", //  文档中心-分类列表-新增分类列表
  deleteClassify: "/tomato/wiki-classify/", //  文档中心-分类列表-删除分类
  getCrumbs: "/tomato/wiki-classify/", //  文档中心-表格列表-分类面包屑导航
  getWikiTree: "/tomato/wiki/tree/", // wiki 文档树
  delWikiDoc: "/tomato/wiki/", // 删除文档
  moveClassify: "/tomato/wiki-classify/move", //  文档中心-弹窗-分类移动
  shortCode: "/tomato/short-code", //  文档-链接转码
  getShortCode: "/tomato/short-code/", //  文档-获取链接转码
  createChildren: "/tomato/wiki/children", // 创建子文档
  modifyWikiPos: "/tomato/wiki/sort", // 调整文档位置
  getModifyWikiList: "/tomato/wiki/editable", // 可编辑权限文档列表
  moveWikiPos: "/tomato/wiki/move" // 文档移动
};

// 主页接口路径
const home = {
  staffList: "/tomato/product" // /tomato/product/{product_id}/staff
};

// 配置模块
const config = {
  // 获取配置模块访问权限
  getPermission: "/tomato/staff/permission",
  // 获取环境变量分页列表
  getEnvirmentList: "/tomato/env",
  // 环境变量列表
  getEnvirmentSelectList: "/tomato/env/list",
  // 创建、更新环境变量列表
  createEnvirmentList: "/tomato/env",
  // 删除环境变量 列表
  deleteEnvirmentList: "/tomato/env",

  // 环境变量筛选列表 下拉框
  envVarList: "/tomato/env/list",

  // 应用详情-配置分页列表
  getConfigDetail: "/tomato/app",
  createConfigEnv: "/tomato/app",
  // 删除应用环境
  deleteCurrentAppVar: "/tomato/apps",
  // 删除应用详情下的环境
  deleteConfigEnv: "/tomato/app",
  // 应用详情-环境tab
  getConfigTab: "/tomato/app",
  // 新增应用环境
  createAppEnvirment: "/tomato/app",

  // 全局变量分页列表
  getGlobalList: "/tomato/global-config",
  // 全局变量--变量详情tab页
  getGlobalTabList: "/tomato/global-config",
  // 新增/编辑全局变量
  createGlobalConfig: "/tomato/global-config",
  // 新增全局环境
  createGlobalEnvirment: "/tomato/global-config",
  // 新增/编辑全局变量环境配置
  updateOrAddGlobalEnvirment: "/tomato/global-config",
  // 删除全局变量
  deleteGlobalVar: "/tomato/global-config",
  // 删除全局环境
  deleteGlobalEnvirment: "/tomato/global-config",
  // 加解密
  decryptGlobalVal: "/tomato/global-config/decrypt"
};

const common = {
  // 登录
  getByUserId: "/tomato/auth/qr-login",

  // 获取技术部员工列表
  getEmployeeList: "/tomato/staff/it-staff",
  // 获取应用列表
  getAppList: "/tomato/apps/list",
  uploadAssets: "/upload/fss/up",
  // 部门组织架构
  getDepartmentList: "/tomato/staff/department-list",
  // 部门组织架构+成员列表
  getDepartmentListPeople: "/tomato/staff/department-tree",
  // yapi自动登录
  autoLoginYapi: "/tomato/staff/auto-login-yapi",
  // yapi接口权限
  yapiCheckPermission: "/tomato/yapi/check-permission",
  // yapi 更新设置-测试环境
  yapiUploadEnv: "/tomato/yapi/up-env",
  // 编辑员工企业微信消息设置详情
  editWorkerSetting: "/tomato/staff/message-alert",
  // 获取员工企业微信消息设置详情
  getWorkerSetting: "/tomato/staff/message-alert",
  // 获取新增迭代弹框员工列表(产品，前端，后端，测试负责人)
  getUserList: "/tomato/staff/it-staff-select",
  getProjectUserList: "/tomato/staff/staff-select",
  // 获取迭代弹框员工列表(产品，前端，后端，测试负责人)
  getIterationUserList: "/tomato/product",
  // 获取模块列表(需求池>所属模块, 模块管理)
  getModuleList: "/tomato/module"
};
const setting = {
  getSettingAppList: "/tomato/apps",
  createSettingApp: "/tomato/apps",
  unshelve: "/tomato/product" // 取消搁置
};

const targetObj = {
  ...iteration,
  ...plan,
  ...product,
  ...common,
  ...config,
  ...test,
  ...setting,
  ...notices,
  ...doc,
  ...workBench,
  ...lookBoard,
  ...home
};
const api = new Proxy(targetObj, {
  get(target, propKey) {
    if (Reflect.get(target, propKey)) {
      return propKey === "uploadAssets" ? Reflect.get(target, propKey) : base_url + Reflect.get(target, propKey);
    }
  },
  set() {
    return false;
  }
});
export default api;
