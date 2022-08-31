<!--
 * @Author: 宋绍华
 * @Date: 2022-05-10 15:09:09
 * @LastEditTime: 2022-06-17 17:39:06
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\projectNav.vue
-->
<template>
  <div class="projectNav">
    <span><i @click="showClick" class="iconfont icon-nine-point"></i></span>
    <div class="projectNav-first">
      <el-dropdown ref="dropdown1" trigger="contextmenu" placement="bottom-start">
        <span class="projectNav-first" @click="showClick"> {{ projectReactive.navName }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              @click="linkToPage(n.path)"
              :class="{ 'projectNav-first-item-active': getCurrentActive(n) }"
              class="projectNav-first-item"
              v-for="n in menus"
              :key="n.icon"
              ><i :class="`${n.icon} iconfont`"></i>{{ n.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="projectNav-item" :class="[showAddTaskBtn ? 'no-click' : '', 'projectNav-second']" v-if="showProject">
      >
      <span class="projectNav-second-name" ref="outRef">{{ currentProject?.name }}</span>
      <ProjectNavSearch :list="productList" type="project" :currentId="currentProject?.id" @on-select="onSelect" :button-ref="outRef" ref="popoverRef" />
    </div>
    <div class="projectNav-item" :class="[showAddTaskBtn ? 'no-click' : '', 'projectNav-second']" v-show="showInter">
      >
      <span class="projectNav-second-name" ref="outRef2" v-click-outside="onClickOutside">{{ currentIter?.name }}</span>
      <ProjectNavSearch
        :list="iterateList"
        :currentId="iterateId"
        placeholder="迭代名称/版本号"
        @on-select="onSelect"
        :button-ref="outRef2"
        ref="popoverRef"
        type="iteration"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ProjectNavSearch, { ProjectNavSearchType } from "./projectNavSearch.vue";

export default {
  name: "projectNav",
  components: {
    ProjectNavSearch
  }
};
</script>

<script lang="ts" setup>
import { ClickOutside as vClickOutside } from "element-plus";
import { onMounted, unref } from "vue";
import useCommon, { ProjectItem } from "@/composables/useCommon";
import { reactive } from "vue";
import useMixin from "@/views/iteration/useMixin";
import router from "@/router";
import { store } from "@/store";
import { Iterate } from "@/composables/useBoardBase";
import { MutationType } from "@/store/mutation-types";
const route = useRouter();
const dropdown1 = ref();
const popoverRef = ref();
const outRef = ref();
const outRef2 = ref();

// nav是否可点击
const showAddTaskBtn = computed(() => route.currentRoute.value.meta.disabledProjectSelect);
// 项目or迭代列表
const projectReactive = reactive<{ isMounted: boolean; navName: string; iterList: Iterate[]; currentIter: Iterate | null }>({
  isMounted: true,
  iterList: [],
  navName: "",
  currentIter: null // 当前迭代
});

// 下拉选项
const menus = [
  {
    label: "工作台",
    sLabel: "工作台",
    icon: "icon-gongzuotai2",
    path: "/workbench/olddashboard",
    key: "workbench"
  },
  {
    label: "项目协作",
    sLabel: "项目",
    icon: "icon-gongzuotai4",
    path: "/project/iteration/homepage",
    key: "project"
  },
  {
    label: "文档中心",
    sLabel: "文档",
    icon: "icon-wendang",
    path: "/document/documentCenter",
    key: "document"
  },
  {
    label: "看板统计",
    sLabel: "看板",
    icon: "icon-kanban3x",
    path: "/lookBoard/monthOverview",
    key: "lookBoard"
  },
  {
    label: "配置中心",
    sLabel: "配置",
    icon: "icon-shezhi2",
    path: "/configure/environmentVariable",
    key: "configure"
  }
];

const { setProjectCache } = useCommon();
const { handleConditionSearch } = useMixin(true);

// 获取当前路由高亮，并获取当前导航名称
const getCurrentActive = (n: typeof menus[0]) => {
  if (n.key === navRoute.value) {
    projectReactive.navName = showInter.value || showProject.value ? n.sLabel : n.label;

    return true;
  }
  return false;
};

// 路由根名称
const navRoute = computed(() => {
  const firstName = router.currentRoute.value.path.match(/\/[A-Za-z]+/);
  const path = firstName ? firstName[0].replace(/\//, "") : "";
  return path;
});

const productList = computed(() => store.getters.productList);
const productId = computed(() => store.getters.productId);
const iterateList = computed(() => store.getters.iterateList);
const iterateId = computed(() => store.getters.iterateId);
const currentIter = computed(() => store.getters.currentIter);
const hasConfigOpts = computed(() => store.state.permission?.config_operation);

// 当前路径
const currentRoute = computed(() => route.currentRoute.value.path);
// 当前路由meta
const currentRouteMeta = computed(() => route.currentRoute.value.meta);
// 当前路由query
const currentRouteQuery = computed(() => router.currentRoute.value.query);

const showInter = computed(() => {
  const len = iterateList.value.length;
  const routeArr = ["/project/iteration/homepage", "/project/iteration/exploitationAdd"];
  if (len) {
    // 特殊情況
    if (routeArr.includes(currentRoute.value)) {
      // 特特殊情況， 迭代下任务的批量创建 type = 1需要展示迭代导航和任务下的批量创建type = 0不需要展示迭代导航
      if (currentRoute.value === "/project/iteration/exploitationAdd" && Number(currentRouteQuery.value.type) === 0) return false;
      return true;
    } else if (currentRouteMeta.value.iterHight) return true;
  }
  return false;
});
const showProject = computed(() => {
  // 允许项目展示的路由
  const backupArr = [""];
  return (productList.value.length && backupArr.includes(currentRoute.value)) || currentRoute.value.includes("/project/");
});

// 当前项目
const currentProject = computed(() => {
  const cacheProject = store?.getters?.productInfo;
  // 刷新初始化
  if (projectReactive.isMounted && cacheProject) return cacheProject;
  // 一般的时候，就是用当前数据
  const item = productList.value?.find((item: any) => item.id === productId.value);
  const curItem = item || productList.value[0];
  store.commit(MutationType.updateProductInfo, curItem);
  store.commit(MutationType.updateIterateId, curItem.id);
  // 如果没有找到对应的值，就默认去第一个
  return curItem;
});

onMounted(() => {
  const { iterateId } = currentRouteQuery.value;
  if (iterateId) {
    store.commit(MutationType.updateIterateId, parseInt(iterateId as string));
    router.replace({
      path: currentRoute.value,
      query: { ...currentRouteQuery.value, iterateId: undefined }
    });
  }
  // 判断有无权限访问配置模块，过滤掉路由configure
  if (!hasConfigOpts.value) {
    menus.splice(4, 1);
  }
});

// 获取迭代列表及设置设置当前id
const getIterInfoAndSetIterId = async (product_id: number) => {
  await store.dispatch("GETITERATELIST", product_id);
  if (iterateList.value.length) {
    const cacheIter = currentIter.value;
    // 看当前迭代list 是否有匹配缓存的数据，优先使用缓存数据，没有就默认一个
    const hasIter = cacheIter && iterateList.value.some((item: Iterate) => item.id === cacheIter.id);
    const newIter = hasIter ? cacheIter : iterateList.value[0];
    store.commit(MutationType.updateIterateId, newIter.id);
    // 有缓存优先使用缓存
    store.commit(MutationType.updateCurrentIter, newIter);
    // 再次更新下缓存
  } else {
    store.commit(MutationType.updateIterateId, 0);
    store.commit(MutationType.updateIterateList, null);
    store.commit(MutationType.updateCurrentIter, null);
    // 再次更新下缓存
  }
};

watch(
  () => productId.value,
  (newVal) => {
    newVal && getIterInfoAndSetIterId(newVal);
  },
  {
    immediate: true
  }
);

const showClick = () => {
  dropdown1.value.handleOpen();
};
// 路由跳转
const linkToPage = (path: string) => {
  route.push(path);
};

const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.();
};

// 下拉框回调
const onSelect = async (type: ProjectNavSearchType, data: Iterate | ProjectItem) => {
  onClickOutside();
  if (type === "iteration") {
    store.commit(MutationType.updateIterateId, data.id);
    store.commit(MutationType.updateCurrentIter, data);
    handleConditionSearch(iterateId.value);
    // 设置缓存
  } else if (type === "project") {
    // 设置缓存
    store.commit(MutationType.updateProductId, data.id);
    store.commit(MutationType.updateProductInfo);
    // 设置项目列表缓存
    setProjectCache(productList.value, iterateId.value);
    router.replace({
      query: Object.assign(
        { ...router.currentRoute.value.query },
        {
          productId: data.id
        }
      )
    });
  }
};
</script>
<style lang="less" scoped>
.projectNav {
  display: flex;
  font-size: 15px;
  flex: 3;

  &-item {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  &-first {
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  &-second {
    &-name {
      cursor: pointer;
      color: var(--el-color-primary-light-3);
      position: relative;
      padding: 0 20px 0 3px;
      margin-left: 4px;

      &:before {
        position: absolute;
        top: 50%;
        right: 5px;
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 5px 4px 0 4px;
        border-color: var(--el-color-primary-light-3) transparent transparent transparent;
      }
    }
  }
  .no-click {
    pointer-events: none;
    cursor: default;
    opacity: 0.6;
  }
  :global(.projectNav-first-item) {
    font-size: 15px !important;
    padding: 14px 30px !important;
  }

  :global(.projectNav-first-item-active) {
    background-color: var(--el-dropdown-menuItem-hover-fill);
    color: var(--el-dropdown-menuItem-hover-color);
  }
}
.icon-nine-point {
  color: #888;
  cursor: pointer;
  margin-right: 5px;
  padding: 4px;
  transition: background-color 0.3s ease, border 0.3s ease, color 0.3s ease;
  border-radius: 3px;
  &:hover {
    color: rgb(61, 168, 245);
    background: rgba(61, 168, 245, 0.09);
  }
}

.icon-shezhi2 {
  font-size: 20px;
  margin-left: -2px;
}
</style>
