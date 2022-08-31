import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { TransitionRouter } from "@/components/transition/index";
import Login from "../views/login/index.vue";
import { hasPermission } from "@/utils/permission";
export const routes: Array<RouteRecordRaw> = [
  // {
  //   path: "/:(.*)*",
  //   redirect: "/login"
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
    // path: "/home",
    path: "/:(.*)*",
    redirect: "/overview/allOverview",
    name: "layout",
    component: () => import(/* webpackChunkName: "layout" */ "@/layout/index.vue"),
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: "/home",
        name: "home",
        component: () => import(/* webpackChunkName: "home" */ "@/views/home/index.vue"),
        meta: {
          requiresAuth: false,
          title: "主页",
          icon: "icon-zhuomian",
          hidden: false
        }
      },
      {
        path: "/overview",
        name: "overview",
        redirect: "/overview/allOverview",
        component: TransitionRouter,
        meta: {
          requiresAuth: false,
          title: "看板",
          icon: "icon-kanban3x"
        },
        children: [
          {
            path: "allOverview",
            name: "allOverview",
            component: () => import(/* webpackChunkName: "allOverview" */ "@/views/overview/allOverview/index.vue"),
            meta: {
              requiresAuth: false,
              title: "所有迭代"
            }
          }
          // {
          //   path: "overviewCalendar",
          //   name: "overviewCalendar",
          //   component: () => import(/* webpackChunkName: "calendar" */ "@/views/overview/calendar/index.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "迭代日历"
          //   }
          // }
        ]
      },
      {
        path: "/product",
        name: "product",
        redirect: "/product/productList",
        component: TransitionRouter,
        meta: {
          requiresAuth: false,
          title: "产品",
          icon: "icon-chanpin3x"
        },
        children: [
          {
            path: "productList",
            name: "productList",
            component: () => import(/* webpackChunkName: "productList" */ "@/views/product/productList/index.vue"),
            meta: {
              requiresAuth: false,
              title: "项目管理"
            }
          },
          {
            path: "demandPool",
            name: "demandPool",
            component: () => import(/* webpackChunkName: "demandPool" */ "@/views/product/demandPool/index.vue"),
            meta: {
              requiresAuth: false,
              title: "需求池"
            }
          },
          {
            path: "planManagement",
            name: "planManagement",
            component: () => import(/* webpackChunkName: "planManagement" */ "@/views/product/planManagement/index.vue"),
            meta: {
              requiresAuth: false,
              title: "计划管理"
            }
          }
        ]
      },
      {
        path: "/iteration", //迭代
        name: "iteration",
        redirect: "/iteration/test",
        component: TransitionRouter,
        meta: {
          requiresAuth: false,
          title: "迭代",
          icon: "icon-diedai3x"
        },
        children: [
          {
            path: "homepage",
            name: "homepage",
            component: () => import(/* webpackChunkName: "homepage" */ "@/views/iteration/homePage/index.vue"),
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
            path: "test",
            name: "test",
            component: () => import(/* webpackChunkName: "test" */ "@/views/iteration/test/index.vue"),
            meta: {
              requiresAuth: false,
              title: "测试"
            }
          },
          {
            path: "applyTest",
            name: "applyTest",
            component: () => import(/* webpackChunkName: "applyTest" */ "@/views/iteration/test/applyTest.vue"),
            meta: {
              requiresAuth: false,
              hidden: false,
              title: "提测申请"
            }
          },
          {
            path: "exploitationAdd",
            name: "exploitationAdd",
            component: () => import(/* webpackChunkName: "exploitationAdd" */ "@/views/iteration/exploitation/add.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "批量添加"
            }
          },
          {
            path: "edit",
            name: "edit",
            component: () => import(/* webpackChunkName: "edit" */ "@/views/iteration/test/edit.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "测试/编辑"
            }
          },
          {
            path: "detail",
            name: "detail",
            component: () => import(/* webpackChunkName: "test" */ "@/views/iteration/test/detail.vue"),
            meta: {
              hidden: false,
              requiresAuth: false,
              title: "测试/查看"
            }
          }
        ]
      },
      // {
      //   path: "/team",
      //   name: "team",
      //   redirect: "/team/project",
      //   component: TransitionRouter,
      //   meta: {
      //     requiresAuth: false,
      //     title: "配置",
      //     icon: "icon-tuandui3x"
      //   },
      //   children: [
      //     {
      //       path: "project",
      //       name: "project",
      //       component: () => import(/* webpackChunkName: "project" */ "@/views/team/project/index.vue"),
      //       meta: {
      //         requiresAuth: false,
      //         title: "应用列表"
      //       }
      //     },
      //     {
      //       path: "user",
      //       name: "user",
      //       component: () => import(/* webpackChunkName: "user" */ "@/views/team/user/index.vue"),
      //       meta: {
      //         requiresAuth: false,
      //         title: "人员",
      //         hidden: false
      //       }
      //     }
      //   ]
      // }
      {
        path: "/setting",
        name: "setting",
        redirect: "/setting/project",
        component: TransitionRouter,
        meta: {
          requiresAuth: false,
          title: "设置",
          icon: "icon-tuandui3x"
        },
        children: [
          // {
          //   path: "environmentVariable",
          //   name: "environmentVariable",
          //   component: () => import(/* webpackChunkName: "environmentVariable" */ "@/views/setting/environmentVariable/index.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "环境变量"
          //   }
          // },
          {
            path: "project",
            name: "project",
            component: () => import(/* webpackChunkName: "project" */ "@/views/team/project/index.vue"),
            meta: {
              requiresAuth: false,
              title: "应用列表"
            }
          }
          // detail.vue
          // {
          //   path: "appListsDetail",
          //   name: "appListsDetail",
          //   component: () => import(/* webpackChunkName: "environmentVariable" */ "@/views/setting/appLists/detail.vue"),
          //   meta: {
          //     requiresAuth: false,
          //     title: "应用详情/新增项目",
          //     hidden: false
          //   }
          // }
        ]
      }
    ]
  },
  {
    path: "/:catchAll(.*)",
    name: "page-not-found",
    component: () => import("@/views/404.vue"),
    meta: { title: "找不到网页", requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
hasPermission(router);
export default router;
