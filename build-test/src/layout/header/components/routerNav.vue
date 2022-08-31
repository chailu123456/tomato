<!--
 * @Author: 宋绍华
 * @Date: 2022-05-10 15:18:40
 * @LastEditTime: 2022-06-23 18:12:57
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\routerNav.vue
-->
<template>
  <div class="routerNav">
    <ul class="routerNav-ul">
      <li @click="linkToPage(n)" :class="{ 'routerNav-ul-li-active': getActive(n) }" class="routerNav-ul-li" v-for="n in routes" :key="n.id">
        {{ n.title }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "routerNav"
};
</script>

<script lang="ts" setup>
const router = useRouter();
const currentRt = reactive({
  routeMap: {
    workbench: [
      {
        title: "仪表盘",
        path: "/workbench/dashboard",
        id: 1
      },
      {
        title: "工作项",
        path: "/workbench/workItem",
        id: 2
      },
      {
        title: "动态",
        path: "/workbench/projectDynamics",
        id: 3
      }
    ],
    project: [
      {
        title: "主页",
        path: "/project/home",
        id: 0
      },
      {
        title: "产品",
        path: "/project/product/demandPool",
        id: 1
      },
      {
        title: "迭代",
        path: "/project/iteration/homepage",
        id: 2
      },
      {
        title: "任务",
        path: "/project/exploitation",
        id: 3
      },
      {
        title: "BUG",
        path: "/project/test",
        id: 4
      },
      {
        title: "提测单",
        path: "/project/testBill",
        id: 5
      }
      // {
      //   title: "统计视图",
      //   path: "/project/overview/allOverview",
      //   id: 6
      // }
    ],
    document: [
      {
        title: "文档中心",
        path: "/document/documentCenter",
        id: 0
      },
      {
        title: "我的空间",
        path: "/document/mySpace",
        id: 1
      }
    ],
    lookBoard: [
      {
        title: "月度总览",
        path: "/lookBoard/monthOverview",
        id: 0
      },
      {
        title: "项目",
        path: "/lookBoard/project/pmo",
        id: 1
      },
      {
        title: "人员",
        path: "/lookBoard/personal/jobEvaluation",
        id: 2
      }
    ],
    configure: [
      {
        title: "环境变量",
        path: "/configure/environmentVariable",
        id: 0
      },
      {
        title: "应用设置",
        path: "/configure/applicationVariable",
        id: 1
      },
      {
        title: "全局变量",
        path: "/configure/globalVariable",
        id: 3
      }
    ]
  }
});

const navRoute = computed(() => {
  const firstName = router.currentRoute.value.path.match(/\/[A-Za-z]+/);
  const path = firstName ? firstName[0].replace(/\//, "") : "";
  return path;
});

// 当前路由
const currentRoute = computed(() => router.currentRoute.value.path);
const currentRouteQuery = computed(() => router.currentRoute.value.query);

// 获取导航路由list
const routes = computed(() => {
  const p = navRoute.value as keyof typeof currentRt.routeMap;
  return currentRt.routeMap[p];
});

// 获取高亮颜色
const getActive = (route: typeof currentRt.routeMap.lookBoard[0]) => {
  // 任务的批量创建比较特殊，需要展示不同的 高亮颜色
  if (
    (currentRoute.value === "/project/iteration/exploitationAdd" && route.id === 3 && Number(currentRouteQuery.value.type) === 0) ||
    (currentRoute.value === "/project/product/planManagement" && route.id === 1) ||
    (currentRoute.value === "/lookBoard/project/pmo" && route.id === 1) ||
    (currentRoute.value === "/lookBoard/project/qualityOverview" && route.id === 1) ||
    (currentRoute.value === "/lookBoard/personal/peopleOverview" && route.id === 2)
  )
    return true;
  return (
    route.path === currentRoute.value ||
    (route.path === "/project/iteration/homepage" && (router.currentRoute.value.meta.iterHight || parseInt(currentRouteQuery.value.type as string) === 1))
  );
};

const linkToPage = (n: typeof currentRt.routeMap.lookBoard[0]) => {
  router.push(n.path);
};
</script>
<style lang="less" scoped>
.routerNav {
  display: flex;
  align-items: center;
  flex: 5;

  &-ul {
    display: flex;

    &-li {
      padding: 0 20px;
      cursor: pointer;
      color: #909399;
      transition: color 0.3s;
      border-bottom: 2px solid transparent;
      font-size: 14px;
      white-space: nowrap;

      &:hover {
        color: #333;
      }

      &-active {
        color: var(--el-color-primary);
        border-bottom: 4px solid var(--el-color-primary);
      }
    }
  }
}
</style>
