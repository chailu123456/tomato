import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { TransitionRouter } from "@/components/transition/index";
import { SecondaryNavigation } from "@/components/navigation/index";
import Login from "../views/login/index.vue";
import { hasPermission } from "@/utils/permission";
import { setSession } from "@/utils";
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      title: "登录",
      requiresAuth: false
    }
  },
  {
    path: "/",
    redirect: "/workbench/dashboard",
    name: "layout",
    component: () => import(/* webpackChunkName: "layout" */ "@/layout/index.vue"),
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: "/workbench",
        name: "workbench",
        redirect: "/workbench/dashboard",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "工作台",
          icon: "icon-gongzuotai2",
          disabledProjectSelect: true,
          isDocument: "工作台",
          excludeProductId: true
        },
        children: [
          {
            path: "/workbench/dashboard",
            name: "dashboard",
            component: () => import(/* webpackChunkName: "dashboard" */ "@/views/workbench/dashboard/index.vue"),
            meta: {
              hidden: false, // 是否加入缓存
              requiresAuth: false,
              title: "仪表盘",
              excludeProductId: true
            }
          },
          {
            path: "/workbench/workItem",
            name: "workItem",
            component: () => import(/* webpackChunkName: "workItem" */ "@/views/workbench/workItem/index.vue"),
            meta: {
              // hidden: false, // 是否加入缓存
              requiresAuth: false,
              title: "工作项",
              excludeProductId: true
            }
          },
          {
            path: "/workbench/projectDynamics",
            name: "projectDynamics",
            component: () => import(/* webpackChunkName: "projectDynamics" */ "@/views/workbench/projectDynamics/index.vue"),
            meta: {
              requiresAuth: false,
              title: "动态",
              excludeProductId: true
            }
          }
        ]
      },
      {
        path: "/project",
        name: "project",
        redirect: "/project/home",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "项目",
          icon: "icon-gongzuotai4"
        },
        children: [
          {
            path: "/project/home",
            name: "projectHome",
            component: () => import(/* webpackChunName: "projectHome" */ "@/views/project/home/index.vue"),
            meta: {
              requiresAuth: false,
              title: "主页"
            }
          },
          {
            path: "/project/product",
            name: "product",
            component: TransitionRouter,
            redirect: "/project/product/demandPool",
            meta: {
              requiresAuth: false,
              title: "设置"
            },
            children: [
              {
                path: "demandPool",
                name: "demandPool",
                component: () => import(/* webpackChunkName: "demandPool" */ "@/views/product/demandPool/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "需求池",
                  onIteration: true,
                  inIteration: false
                }
              },

              {
                path: "planManagement",
                name: "planManagement",
                component: () => import(/* webpackChunkName: "planManagement" */ "@/views/product/planManagement/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "计划"
                }
              },
              {
                path: "planDetail",
                name: "planDetail",
                component: () => import(/* webpackChunkName: "planDetail" */ "@/views/product/planManagement/planDetail.vue"),
                meta: {
                  requiresAuth: false,
                  title: "计划详情",
                  disabledProjectSelect: true,
                  hidden: false
                }
              },
              {
                path: "approval",
                name: "approval",
                component: () => import(/* webpackChunkName: "approval" */ "@/views/product/approval/index.vue"),
                meta: {
                  hidden: false,
                  requiresAuth: false,
                  title: "审批单列表",
                  disabledProject: true,
                  disabledProjectSelect: true
                }
              },
              {
                path: "demandDoc",
                name: "demandDoc",
                component: () => import(/* webpackChunkName: "demandDoc" */ "@/views/product/demandDoc/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "需求文档"
                }
              }
            ]
          },
          {
            path: "/project/iteration",
            name: "iteration",
            redirect: "/project/iteration/homepage",
            component: TransitionRouter,
            meta: {
              requiresAuth: false,
              title: "迭代",
              isShowIterationSelect: false,
              showHeader2: true
            },
            children: [
              {
                path: "homepage",
                name: "homepage",
                component: () => import(/* webpackChunkName: "homepage" */ "@/views/iteration/homePage/index.vue"),
                beforeEnter: (): void => {
                  setSession("currentActiviteRoute", "0");
                },
                meta: {
                  requiresAuth: false,
                  title: "主页",
                  showIteration: true
                }
              },
              {
                path: "exploitation",
                name: "exploitation",
                component: () => import(/* webpackChunkName: "exploitation" */ "@/views/iteration/exploitation/index.vue"),
                meta: {
                  requiresAuth: false,

                  title: "任务",
                  onIteration: false,
                  iterHight: true,
                  inIteration: true,
                  showIteration: true
                }
              },

              {
                path: "useCaseAdd",
                name: "useCaseAdd",
                component: () => import(/* webpackChunkName: "useCaseAdd" */ "@/views/iteration/useCase/add.vue"),
                meta: {
                  hidden: false,
                  requiresAuth: false,
                  title: "新增",
                  isHideTwoNav: true,
                  disabledIterationSelect: true,
                  disabledProjectSelect: true,
                  iterHight: true,
                  showIteration: true
                }
              },
              {
                path: "test",
                name: "test2",
                component: () => import(/* webpackChunkName: "test" */ "@/views/iteration/test/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "BUG",
                  iterHight: true,
                  onIteration: false,
                  inIteration: true,
                  showIteration: true
                }
              },
              {
                path: "useCase",
                name: "useCase",
                component: () => import(/* webpackChunkName: "usecase" */ "@/views/iteration/useCase/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "用例",
                  iterHight: true,
                  onIteration: false,
                  inIteration: true,
                  showIteration: true
                }
              },
              {
                path: "interface",
                name: "interface",
                component: () => import(/* webpackChunkName: "interface" */ "@/views/iteration/interface/doc/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "接口",
                  iterHight: true,
                  showIteration: true
                }
              },
              {
                path: "exploitationAdd",
                name: "exploitationAdd",
                component: () => import(/* webpackChunkName: "exploitationAdd" */ "@/views/iteration/exploitation/add.vue"),
                meta: {
                  hidden: false,
                  requiresAuth: false,
                  title: "批量添加",
                  isHideTwoNav: true,
                  disabledIterationSelect: true,
                  disabledProjectSelect: true,
                  showIteration: true
                }
              },
              {
                path: "statistics",
                name: "statistics",
                component: () => import(/* webpackChunkName: "statistics" */ "@/views/iteration/statistics/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "统计",
                  iterHight: true,
                  showIteration: true
                }
              },
              {
                path: "reports",
                name: "reports",
                component: () => import(/* webpackChunkName: "statistics" */ "@/views/iteration/reports/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "周报",
                  iterHight: true,
                  showIteration: true
                }
              }
            ]
          },
          {
            path: "/project/test",
            name: "test",
            component: () => import(/* webpackChunkName: "test" */ "@/views/iteration/test/index.vue"),
            meta: {
              requiresAuth: false,
              title: "BUG",
              showHeader2: true,
              inIteration: false
            }
          },
          {
            path: "/project/exploitation",
            name: "projectExploitation",
            component: () => import(/* webpackChunkName: "projectExploitation" */ "@/views/iteration/exploitation/index.vue"),
            meta: {
              requiresAuth: false,
              title: "任务",
              showHeader2: true,
              onIteration: true,
              inIteration: false
            }
          },
          {
            path: "/project/interfaceDoc",
            name: "interfaceDoc",
            component: () => import(/* webpackChunkName: "test" */ "@/views/overview/interface/doc/index.vue"),
            meta: {
              requiresAuth: false,
              title: "线上接口"
            }
          },
          {
            path: "/project/overview",
            name: "overview",
            redirect: "/project/overview/allOverview",
            component: TransitionRouter,
            meta: {
              requiresAuth: false,
              title: "统计视图",
              icon: "icon-kanban3x"
            },
            children: [
              {
                path: "allOverview",
                name: "allOverview",
                component: () => import(/* webpackChunkName: "allOverview" */ "@/views/overview/allOverview/index.vue"),
                beforeEnter: (): void => {
                  setSession("currentActiviteRoute", "0");
                },
                meta: {
                  requiresAuth: false,
                  title: "迭代一览"
                }
              },
              {
                path: "overviewCalendar",
                name: "overviewCalendar",
                component: () => import(/* webpackChunkName: "calendar" */ "@/views/overview/calendar/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "迭代日历"
                }
              }
              // {
              //   path: "testOverview",
              //   name: "testOverview",
              //   component: () => import(/* webpackChunkName: "testOverview" */ "@/views/overview/testOverview/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "测试概览"
              //   }
              // },
              // {
              //   path: "staffOverview",
              //   name: "staffOverview",
              //   component: () => import(/* webpackChunkName: "staffOverview" */ "@/views/overview/staffOverview/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "人员视图"
              //   }
              // }
              // {
              //   path: "personnelArrangument",
              //   name: "personnelArrangument",
              //   component: () => import(/* webpackChunkName: "personnelArrangument" */ "@/views/overview/personnelArrangument/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "人员排布",
              //     isShowIterationSelect: false
              //   }
              // }
            ]
          },
          {
            path: "/project/member",
            name: "member",
            component: () => import(/* webpackChunkName: "member" */ "@/views/iteration/member/index.vue"),
            meta: {
              requiresAuth: false,
              title: "成员"
            }
          },
          {
            path: "/project/settingProject",
            name: "settingProject",
            component: TransitionRouter,
            redirect: "/project/settingProject/baseInfo",
            meta: {
              requiresAuth: false,
              title: "设置",
              showHeader2: true
            },
            children: [
              {
                path: "baseInfo",
                name: "baseInfo",
                component: () => import(/* webpackChunkName: "baseInfo" */ "@/views/overview/setting/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "基本信息",
                  showHeader2: true
                }
              },
              // {
              //   path: "moduleManage",
              //   name: "moduleManage",
              //   component: () => import(/* webpackChunkName: "moduleManage" */ "@/views/overview/moduleManage/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "模块管理",
              //     showHeader2: true
              //   }
              // },
              {
                path: "projectEnv",
                name: "projectEnv",
                component: () => import(/* webpackChunkName: "baseInfo" */ "@/views/overview/projectEnv/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "测试环境",
                  showHeader2: true
                }
              }
            ]
          },
          {
            path: "testBill",
            name: "testBill",
            component: () => import(/* webpackChunkName: "testBill" */ "@/views/product/testBill/index.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "提测单",
              showHeader2: true,
              onIteration: true,
              inIteration: false
            }
          }
        ]
      },
      {
        path: "/document",
        name: "document",
        redirect: "/document/documentCenter",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "文档",
          icon: "icon-wendang",
          disabledProjectSelect: true,
          isDocument: "文档管理",
          excludeProductId: true
        },
        children: [
          {
            path: "/document/documentCenter",
            name: "documentCenter",
            component: () => import(/* webpackChunkName: "documentCenter" */ "@/views/document/documentCenter/index.vue"),
            meta: {
              requiresAuth: false,
              title: "文档中心",
              englishName: "documentCenter",
              excludeProductId: true
            }
          },
          {
            path: "/document/mySpace",
            name: "mySpace",
            component: () => import(/* webpackChunkName: "mySpace" */ "@/views/document/mySpace/index.vue"),
            meta: {
              requiresAuth: false,
              title: "我的空间",
              englishName: "spaceMe",
              excludeProductId: true
            }
          },
          {
            path: "/document/padIframe",
            name: "padIframe",
            component: () => import(/* webpackChunkName: "padIframe" */ "@/views/document/padIframe.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "文本编辑器",
              excludeProductId: true
            }
          }
        ]
      },
      {
        path: "/lookBoard",
        name: "lookBoard",
        redirect: "/lookBoard/monthOverview",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "看板",
          icon: "icon-kanban3x",
          // disabledProjectSelect: true,
          isDocument: "项目月度统计",
          excludeProductId: true
        },
        children: [
          {
            path: "/lookBoard/monthOverview",
            name: "lookBoard",
            component: () => import(/* webpackChunkName: "monthOverview" */ "@/views/lookBoard/monthOverview/index.vue"),
            meta: {
              requiresAuth: false,
              title: "月度总览",
              excludeProductId: true,
              showIteration: false
            }
          },
          {
            path: "/lookBoard/project",
            name: "lookBoarPproject",
            redirect: "/lookBoard/project/pmo",
            component: TransitionRouter,
            meta: {
              requiresAuth: false,
              title: "项目",
              excludeProductId: true
            },
            children: [
              {
                path: "pmo",
                name: "pmo",
                component: () => import(/* webpackChunkName: "pmo" */ "@/views/lookBoard/project/pmo/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "PMO",
                  excludeProductId: true,
                  showProductCollect: true // 显示项目集
                }
              },
              {
                path: "qualityOverview",
                name: "qualityOverview",
                component: () => import(/* webpackChunkName: "qualityOverview" */ "@/views/lookBoard/project/qualityOverview/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "质量概览",
                  excludeProductId: true,
                  showProductCollect: true // 显示项目集
                }
              }
              // {
              //   path: "publishCalendar",
              //   name: "publishCalendar",
              //   component: () => import(/* webpackChunkName: "publishCalendar" */ "@/views/lookBoard/project/calendar/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "发布日历"
              //   }
              // }
            ]
          },
          {
            path: "/lookBoard/personal",
            name: "personal",
            redirect: "/lookBoard/personal/jobEvaluation",
            component: TransitionRouter,
            meta: {
              requiresAuth: false,
              title: "人员",
              icon: "icon-kanban3x"
            },
            children: [
              {
                path: "jobEvaluation",
                name: "jobEvaluation",
                component: () => import(/* webpackChunkName: "jobEvaluation" */ "@/views/lookBoard/personal/jobEvaluation/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "工作评估"
                }
              },
              {
                path: "peopleOverview",
                name: "peopleOverview",
                component: () => import(/* webpackChunkName: "peopleOverview" */ "@/views/lookBoard/personal/peopleOverview/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "忙闲日历"
                }
              }
              // {
              //   path: "peopleArrangument",
              //   name: "peopleArrangument",
              //   component: () => import(/* webpackChunkName: "peopleArrangument" */ "@/views/lookBoard/personal/peopleArrangument/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "人员排布",
              //     isShowIterationSelect: false
              //   }
              // }
            ]
          }
        ]
      },
      {
        path: "/configure",
        name: "configure",
        redirect: "/configure/environmentVariable",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "配置",
          icon: "icon-shezhi2",
          disabledProjectSelect: true,
          isDocument: "配置"
        },
        children: [
          {
            path: "/configure/environmentVariable",
            name: "environmentVariable",
            component: () => import(/* webpackChunkName: "environmentVariable" */ "@/views/configure/environmentVariable/index.vue"),
            meta: {
              requiresAuth: false,
              title: "环境变量"
            }
          },
          {
            path: "/configure/applicationVariable",
            name: "applicationVariable",
            component: () => import(/* webpackChunkName: "applicationVariable" */ "@/views/configure/applicationVariable/index.vue"),
            meta: {
              requiresAuth: false,
              title: "应用设置"
            }
          },
          {
            path: "/configure/appDetail",
            name: "appDetail",
            component: () => import(/* webpackChunkName: "appDetail" */ "@/views/configure/applicationVariable/appDetail.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "应用详情"
            }
          },
          {
            path: "/configure/globalVariable",
            name: "globalVariable",
            component: () => import(/* webpackChunkName: "globalVariable" */ "@/views/configure/globalVariable/index.vue"),
            meta: {
              requiresAuth: false,
              title: "全局变量"
            }
          },
          {
            path: "/configure/globalVariableDetail",
            name: "globalVariableDetail",
            component: () => import(/* webpackChunkName: "globalVariableDetail" */ "@/views/configure/globalVariable/appDetail.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "应用详情"
            }
          }
        ]
      }
    ]
  },
  {
    path: "/preview", // rp文件承接
    name: "preview",
    component: () => import("@/views/preview.vue")
  },
  {
    path: "/noAccess",
    name: "page-not-access",
    component: () => import("@/views/noAccess.vue"),
    meta: { title: "暂无权限", requiresAuth: false }
  },
  {
    path: "/:catchAll(.*)",
    name: "page-not-found",
    component: () => import("@/views/404.vue"),
    meta: { title: "找不到网页", requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory("/"),
  routes
});
hasPermission(router);
export default router;
