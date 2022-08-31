import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { TransitionRouter } from "@/components/transition/index";
import { SecondaryNavigation } from "@/components/navigation/index";
import Login from "../views/login/index.vue";
import { hasPermission } from "@/utils/permission";
import { setSession } from "@/utils";
export const routes: Array<RouteRecordRaw> = [
  // {
  //   path: "/:(.*)*",
  //   redirect: "/project"
  // },
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
    path: "/:catchAll(.*)",
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
          isDocument: "工作台"
        },
        children: [
          {
            path: "/workbench/dashboard",
            name: "dashboard",
            component: () => import(/* webpackChunkName: "dashboard" */ "@/views/workbench/dashboard/index.vue"),
            meta: {
              requiresAuth: false,
              title: "仪表盘"
            }
          },
          {
            path: "/workbench/workItem",
            name: "workItem",
            component: () => import(/* webpackChunkName: "workItem" */ "@/views/workbench/workItem/index.vue"),
            meta: {
              requiresAuth: false,
              title: "工作项"
            }
          },
          {
            path: "/workbench/projectDynamics",
            name: "projectDynamics",
            component: () => import(/* webpackChunkName: "projectDynamics" */ "@/views/workbench/projectDynamics/index.vue"),
            meta: {
              requiresAuth: false,
              title: "动态"
            }
          }
        ]
      },
      {
        path: "/project",
        name: "project",
        redirect: "/project/iteration/homepage",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "项目",
          icon: "icon-gongzuotai4"
        },
        children: [
          {
            path: "/project/demandPool",
            name: "demandPool",
            component: () => import(/* webpackChunkName: "demandPool" */ "@/views/product/demandPool/index.vue"),
            meta: {
              requiresAuth: false,
              title: "需求池"
            }
          },
          {
            path: "/project/editDemandPool",
            name: "editDemandPool",
            component: () => import(/* webpackChunkName: "editDemandPool" */ "@/views/product/demandPool/editDemandPool.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "新增需求",
              disabledProject: true,
              disabledProjectSelect: true
            }
          },
          {
            path: "/project/demandPoolDetail",
            name: "demandPoolDetail",
            component: () => import(/* webpackChunkName: "demandPoolDetail" */ "@/views/product/demandPool/demandPoolDetail.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "需求池详情",
              disabledProject: true,
              disabledProjectSelect: true
            }
          },
          {
            path: "/project/approval",
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
            path: "/project/planManagement",
            name: "planManagement",
            component: () => import(/* webpackChunkName: "planManagement" */ "@/views/product/planManagement/index.vue"),
            meta: {
              requiresAuth: false,
              title: "计划管理"
            }
          },
          {
            path: "/project/iteration",
            name: "iteration",
            redirect: "/project/iteration/homepage",
            component: TransitionRouter,
            meta: {
              requiresAuth: false,
              title: "迭代",
              isShowIterationSelect: true
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
                  title: "迭代概览"
                }
              },
              {
                path: "exploitation",
                name: "exploitation",
                component: () => import(/* webpackChunkName: "exploitation" */ "@/views/iteration/exploitation/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "任务"
                }
              },
              {
                path: "useCase",
                name: "useCase",
                component: () => import(/* webpackChunkName: "usecase" */ "@/views/iteration/useCase/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "用例"
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
                  disabledIterationSelect: true,
                  disabledProjectSelect: true
                }
              },

              {
                path: "interface",
                name: "interface",
                component: () => import(/* webpackChunkName: "interface" */ "@/views/iteration/interface/doc/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "迭代接口"
                }
              },
              {
                path: "applyTest",
                name: "applyTest",
                component: () => import(/* webpackChunkName: "applyTest" */ "@/views/iteration/test/applyTest.vue"),
                meta: {
                  requiresAuth: false,
                  title: "工单"
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
                  disabledIterationSelect: true,
                  disabledProjectSelect: true
                }
              },
              // {
              //   path: "applyTest",
              //   name: "applyTest",
              //   component: () => import(/* webpackChunkName: "applyTest" */ "@/views/iteration/test/applyTest.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     hidden: false,
              //     title: "提测申请",
              //     isShowProjectSelect: false,
              //     isShowIterationSelect: true,
              //     disabledIterationSelect: true,
              //     disabledProjectSelect: true
              //   }
              // },
              {
                path: "statistics",
                name: "statistics",
                component: () => import(/* webpackChunkName: "statistics" */ "@/views/iteration/statistics/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "统计"
                }
              },
              {
                path: "reports",
                name: "reports",
                component: () => import(/* webpackChunkName: "statistics" */ "@/views/iteration/reports/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "周报"
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
              title: "BUG"
              // isShowProjectSelect: false,
              // isShowIterationSelect: false
            }
          },
          {
            path: "bugEdit",
            name: "bugEdit",
            component: () => import(/* webpackChunkName: "edit" */ "@/views/iteration/test/edit.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "测试/编辑",
              disabledProjectSelect: true
              // isShowProjectSelect: false,
              // isShowIterationSelect: false
            }
          },
          {
            path: "bugDetail",
            name: "bugDetail",
            component: () => import(/* webpackChunkName: "test" */ "@/views/iteration/test/detail.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "测试/查看",
              disabled: true,
              disabledProjectSelect: true
            }
          },
          {
            path: "/project/interfaceDoc",
            name: "interfaceDoc",
            component: () => import(/* webpackChunkName: "test" */ "@/views/overview/interface/doc/index.vue"),
            meta: {
              requiresAuth: false,
              title: "线上接口"
              // isShowProjectSelect: false,
              // isShowIterationSelect: false
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
              // disabledProjectSelect: true
              // isShowProjectSelect: true,
              // isShowIterationSelect: false
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
              },
              {
                path: "testOverview",
                name: "testOverview",
                component: () => import(/* webpackChunkName: "testOverview" */ "@/views/overview/testOverview/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "测试概览"
                }
              },
              {
                path: "staffOverview",
                name: "staffOverview",
                component: () => import(/* webpackChunkName: "staffOverview" */ "@/views/overview/staffOverview/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "人员视图"
                }
              },
              {
                path: "personnelArrangument",
                name: "personnelArrangument",
                component: () => import(/* webpackChunkName: "personnelArrangument" */ "@/views/overview/personnelArrangument/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "人员排布",
                  isShowIterationSelect: false
                }
              }
            ]
          },
          {
            path: "/project/member",
            name: "member",
            component: () => import(/* webpackChunkName: "member" */ "@/views/iteration/member/index.vue"),
            meta: {
              requiresAuth: false,
              title: "成员"
              // isShowProjectSelect: false,
              // isShowIterationSelect: false
            }
          },
          {
            path: "/project/settingProject",
            name: "settingProject",
            component: TransitionRouter,
            redirect: "/project/settingProject/baseInfo",
            meta: {
              requiresAuth: false,
              title: "设置"
            },
            children: [
              {
                path: "baseInfo",
                name: "baseInfo",
                component: () => import(/* webpackChunkName: "baseInfo" */ "@/views/overview/setting/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "基本信息"
                }
              },
              {
                path: "moduleManage",
                name: "moduleManage",
                component: () => import(/* webpackChunkName: "moduleManage" */ "@/views/overview/moduleManage/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "模块管理"
                }
              },
              {
                path: "projectEnv",
                name: "projectEnv",
                component: () => import(/* webpackChunkName: "baseInfo" */ "@/views/overview/projectEnv/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "测试环境"
                }
              }
            ]
          }

          // {
          //   path: "/document/test",
          //   name: "test",
          //   component: () => import(/* webpackChunkName: "test" */ "@/views/document/test.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "测试",
          //     isShowProjectSelect: false,
          //     isShowIterationSelect: true
          //   }
          // }
        ]
      },
      {
        path: "/document",
        name: "document",
        redirect: "/document/documentCenter",
        component: SecondaryNavigation,
        meta: {
          requiresAuth: false,
          title: "文档管理",
          icon: "icon-wendang",
          disabledProjectSelect: true,
          isDocument: "文档管理"
        },
        children: [
          {
            path: "/document/documentCenter",
            name: "documentCenter",
            component: () => import(/* webpackChunkName: "documentCenter" */ "@/views/document/documentCenter/index.vue"),
            meta: {
              requiresAuth: false,
              title: "文档中心",
              englishName: "documentCenter"
            }
          },
          // {
          //   path: "/document/knowledgeBase",
          //   name: "knowledgeBase",
          //   component: () => import(/* webpackChunkName: "knowledgeBase" */ "@/views/document/knowledgeBase/index.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "知识库",
          //     englishName: "knowledge"
          //   }
          // },
          // {
          //   path: "/document/projectDocument",
          //   name: "projectDocument",
          //   component: () => import(/* webpackChunkName: "projectDocument" */ "@/views/document/projectDocument/index.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "项目文档",
          //     englishName: "projectDoc"
          //   }
          // },
          {
            path: "/document/mySpace",
            name: "mySpace",
            component: () => import(/* webpackChunkName: "mySpace" */ "@/views/document/mySpace/index.vue"),
            meta: {
              requiresAuth: false,
              title: "我的空间",
              englishName: "spaceMe"
            }
          },
          {
            path: "/document/padIframe",
            name: "padIframe",
            component: () => import(/* webpackChunkName: "padIframe" */ "@/views/document/padIframe.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "文本编辑器"
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
          disabledProjectSelect: true,
          isDocument: "项目月度统计"
        },
        children: [
          {
            path: "/lookBoard/monthOverview",
            name: "lookBoard",
            component: () => import(/* webpackChunkName: "monthOverview" */ "@/views/lookBoard/monthOverview/index.vue"),
            meta: {
              requiresAuth: false,
              title: "月度总览"
            }
          },
          {
            path: "/lookBoard/project",
            redirect: "/lookBoard/project/qualityOverview",
            component: TransitionRouter,
            name: "lookBoarPproject",
            meta: {
              requiresAuth: false,
              title: "项目"
            },
            children: [
              // {
              //   path: "pmo",
              //   name: "pmo",
              //   component: () => import(/* webpackChunkName: "pmo" */ "@/views/lookBoard/project/pmo/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "PMO"
              //   }
              // },
              {
                path: "qualityOverview",
                name: "qualityOverview",
                component: () => import(/* webpackChunkName: "qualityOverview" */ "@/views/lookBoard/project/qualityOverview/index.vue"),
                meta: {
                  requiresAuth: false,
                  title: "质量概览"
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
              }
              // {
              //   path: "peopleOverview",
              //   name: "peopleOverview",
              //   component: () => import(/* webpackChunkName: "peopleOverview" */ "@/views/lookBoard/personal/peopleOverview/index.vue"),
              //   meta: {
              //     requiresAuth: false,
              //     title: "任务日历"
              //   }
              // },
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
  }

  // {
  //   path: "/:catchAll(.*)",
  //   name: "page-not-found",
  //   component: () => import("@/views/404.vue"),
  //   meta: { title: "找不到网页", requiresAuth: false }
  // }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
hasPermission(router);
export default router;
