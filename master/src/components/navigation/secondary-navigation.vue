<template>
  <div style="height: calc(100% - 20px); border-radius: 6px; overflow: hidden; padding: 10px">
    <div class="secondary__nav">
      <div class="secondary__nav__iteration__select">
        <el-form v-show="isShowIteration" :inline="true" :model="searchParams" class="iteration__select">
          <el-form-item label="迭代名称:">
            <el-select
              :disabled="disableIterationSelect"
              @change="handleConditionSearch"
              value-key="id"
              v-model="searchParams.demand"
              filterable
              placeholder="请输入迭代"
            >
              <el-option v-for="item in demandList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-divider v-show="isShowIteration" direction="vertical"></el-divider>
        <ul class="router-navigation" v-if="!isHideTwoNav">
          <li
            v-for="(item, index) in childRouter"
            :key="index"
            @click="handleActiviteRouter(item, index)"
            :class="[index === activiteIndex ? `activite-index` : ``]"
          >
            {{ item.meta.title }}
          </li>
        </ul>
      </div>
      <el-form :inline="true" class="createIteration__btn" v-if="router.currentRoute.value.path === '/project/iteration/homepage'">
        <el-form-item>
          <el-button type="primary" @click="handleChangeDialogStatus(0)">新增迭代</el-button>
        </el-form-item>
      </el-form>
    </div>

    <router-view v-slot="{ Component }">
      <transition mode="out-in" appear name="zoom-fade">
        <iframe ref="iframeYapiRef" :src="src" frameborder="0" class="yapi-iframe" v-show="isShowYapiIframe"></iframe>
      </transition>
      <div v-if="isJurisdiction" style="margin-top: 14%">
        <el-result :title="route.name === 'projectEnv' ? '暂无权限查看' : '暂无数据或暂无权限，请添加项目成员后重试'">
          <template #icon>
            <i style="font-size: 50px; color: rgb(165 165 165)" class="el-icon-lock"></i>
          </template>
        </el-result>
      </div>
      <transition mode="out-in" appear name="zoom-fade">
        <keep-alive :max="100" :include="include">
          <component class="content" :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>
<script lang="ts">
import { yapiCheckPermission, yapiEnvUpload } from "@/api/request-modules/common";
import { useStore } from "@/store";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import useMixin from "@/views/iteration/useMixin";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { ResponseParams } from "@/types/response";
import { getSession, setSession } from "@/utils";
import routes from "./routeMap";
import { DemandItemResp, ProjectItem } from "@/composables/useCommon";
import { MutationType } from "@/store/mutation-types";
export default defineComponent({
  name: "navigation",
  components: {},
  setup() {
    const route = useRoute();
    const router = useRouter();
    const childRouter = ref<Array<Record<string, any>>>();
    const isShowIteration = ref(false);
    const isShowAddIteration = ref(false);
    const isJurisdiction = ref(false);
    const isHideTwoNav = ref(false);

    const disableIterationSelect = ref(false);
    const store = useStore();
    const include: string[] = store.state.include;
    const activiteIndex = ref(Number(getSession("currentActiviteRoute")) || 0);
    const isShowYapiIframe = ref(false);
    const iframeYapiRef = ref();
    const { searchParams, handleConditionSearch, handleChangeDialogStatus, demandList, dialogRef } = useMixin(true);
    const src = ref();

    if (process.env.NODE_ENV === "development") {
      src.value = "https://yapi.rvet.cn/group";
    } else {
      src.value = "https://yapi.petrvet.com/group";
    }
    // 是否展示iframe
    window.onload = () => {
      watch(
        () => route.path,
        () => {
          isShowAddIteration.value = route.path === "/project/iteration/homepage" ? true : false;
          isJurisdiction.value = false;
          childRouter.value = route.matched[2]?.children ? route.matched[2]?.children : [];
          childRouter.value = childRouter.value.filter((item) => item.meta?.hidden !== false);
          // 是否展示迭代筛选框
          isShowIteration.value = route.meta.isShowIterationSelect as boolean;
          // 是否展示二级菜单(主要在批量新增任务要隐藏二级菜单)
          isHideTwoNav.value = route.meta.isHideTwoNav as boolean;
          disableIterationSelect.value = route.meta.disabledIterationSelect as boolean;
          childRouter.value.forEach((itemRoute: Record<string, any>, index: number) => {
            if (route.path.includes(itemRoute.path)) {
              activiteIndex.value = index;
            }
          });
          // yapi显示相关，如果当前route.path可以从routeMap.ts文件中找到,就展示iframe
          setTimeout(async () => {
            const item = routes.find((v) => v.tomatoRouteName === route.name);
            if (item) {
              const { _cache, productId, iterateId } = getProductIdCache();
              const defaultActivePath = route.path;
              let yapiProjectId = 0;
              if (iterateId.value) {
                // 迭代的接口
                yapiProjectId = store.getters.iterateList?.find((i: DemandItemResp) => i.id === iterateId.value)?.yapi_iteration_id;
              } else {
                // 项目下的接口
                const yapiProject = _cache.value.find((item: ProjectItem) => item.id === productId.value);
                yapiProjectId = yapiProject?.yapi_default_iteration_id;
              }

              // 获取yapi接口权限参数
              if (defaultActivePath === "/project/iteration") {
                const yapiIteration = demandList.value.find((item: Record<string, any>) => item.id === iterateId.value);
                // 如果项目下有迭代
                if (yapiIteration) yapiProjectId = yapiIteration?.yapi_iteration_id || 0;
              }
              checkPermiss();

              const yapiPath = ["/project/interfaceDoc", "/project/iteration/interface"];
              // 判断
              if (yapiPath.indexOf(route.path) != -1) {
                if (route.path === "/project/interfaceDoc") {
                  // 项目下的接口
                  const yapiProject = _cache.value.find((item: ProjectItem) => item.id === productId.value);
                  yapiProjectId = yapiProject?.yapi_default_iteration_id;
                }
                item.params.path = `/project/${yapiProjectId}/interface/api`; // 线上
              } else {
                item.params.path = `/project/${yapiProjectId}/env`; // 线上
              }

              iframeYapiRef.value?.contentWindow.postMessage(item.params, "*");
            } else {
              isShowYapiIframe.value = false;
            }
          }, 300);
        },
        {
          immediate: true,
          deep: true
        }
      );
    };

    watch(
      () => route.path,
      () => {
        isShowIteration.value = route.meta.isShowIterationSelect as boolean;
        childRouter.value = route.matched[2]?.children ? route.matched[2]?.children : [];
        childRouter.value = childRouter.value.filter((item) => item.meta?.hidden !== false);
        isHideTwoNav.value = route.meta.isHideTwoNav as boolean;
        // console.log(isHideTwoNav.value);
        childRouter.value.forEach((itemRoute: Record<string, any>, index: number) => {
          if (route.path.includes(itemRoute.path)) {
            activiteIndex.value = index;
          }
        });
      },
      {
        immediate: true
      }
    );

    // 监听yapi子页面发送过来的数据
    window.addEventListener("message", async (params) => {
      try {
        const type = Object.prototype.toString.call(params.data);
        if (type === "[object Object]" && Object.keys(params) && !params.data.payload) {
          // 有无权限   406=无权限
          if (params.data.errcode === 406) {
            isShowYapiIframe.value = false;
          } else {
            const routeNameArr = ["interface", "interfaceDoc", "projectEnv"];
            const routeName = route.name as string;
            if (routeNameArr.includes(routeName)) {
              isShowYapiIframe.value = true;
            }
            // 设置-测试环境 同步项目下所有迭代测试环境数据
            if (params.data && params.data.msg === "测试环境") {
              const productId = (getSession("productInfo", true) as Record<string, any>)?.id;
              const envParams: any = {
                product_id: productId,
                env: params.data.env.env
              };
              await yapiEnvUpload(envParams);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
    const getProductIdCache = () => {
      const _cache = computed(() => store.getters.productList);
      const productId = computed(() => store.getters.productId);
      const iterateId = computed(() => store.getters.iterateId);
      return {
        _cache,
        productId,
        iterateId
      };
    };
    // 迭代模块--接口模块的接口
    const interfaceFun = () => {
      let params = {
        path: "",
        query: {
          title: "接口"
        }
      };

      if (route.name === "interface") {
        checkPermiss();
        const yapiIteration = computed(() => store.getters.currentIter);
        if (!yapiIteration.value) {
          // 当前项目没有迭代
          const { _cache, productId } = getProductIdCache();
          const yapiProject = _cache.value.find((item: ProjectItem) => item.id === productId.value);
          let yapiProjectId = yapiProject?.yapi_default_iteration_id || 0;
          params.path = `/project/${yapiProjectId}/interface/api`;
        } else {
          params.path = `/project/${yapiIteration.value.yapi_iteration_id}/interface/api`;
        }
        iframeYapiRef.value?.contentWindow.postMessage(params, "*");
      }
    };

    // 检查是否有权限查看yapi文档
    const checkPermiss = async () => {
      isJurisdiction.value = false;
      const { _cache, productId, iterateId } = getProductIdCache();
      const defaultActivePath = route.path as string;
      const yapiProject = _cache.value.find((item: ProjectItem) => item.id === productId.value);

      // 获取yapi接口权限参数
      let yapiPermiss = {
        product_id: yapiProject?.id,
        iteration_id: 0
      };
      if (defaultActivePath === "/project/iteration/interface") {
        if (!iterateId.value) {
          isShowYapiIframe.value = false;
          isJurisdiction.value = true;
          return;
        }
        yapiPermiss.iteration_id = iterateId.value || 0;
      }
      // console.log("获取yapi接口权限参数" + yapiPermiss);
      // console.log(yapiPermiss);
      if (yapiPermiss.product_id) {
        // 是否显示iframe
        const res: ResponseParams.ResponsePermissionSuccess = await yapiCheckPermission(yapiPermiss);
        if (res.data && res.data.has_premission) {
          isShowYapiIframe.value = true;
          isJurisdiction.value = false;
        } else {
          const routeNameArr = ["interface", "interfaceDoc", "projectEnv"];
          const routeName = route.name as string;
          if (routeNameArr.includes(routeName)) {
            isJurisdiction.value = true;
          }
          isShowYapiIframe.value = false;
        }
      }
    };
    // 监听迭代id
    watch(
      () => searchParams.demand,
      (newVal) => {
        newVal && store.commit(MutationType.updateIterateId, newVal);
        interfaceFun();
      },
      {
        immediate: true
      }
    );

    // 项目名称监听
    useWatchChangeProduct(handleConditionSearch, async () => {
      const { _cache, productId } = getProductIdCache();
      if (!_cache || !productId) return;
      const yapiProject = _cache.value.find((item: ProjectItem) => item.id === productId.value);
      let yapiProjectId = yapiProject?.yapi_default_iteration_id || 0;
      if (route.name === "interfaceDoc") {
        checkPermiss();
        const params = {
          // 需要yapi跳转的路径
          path: `/project/${yapiProjectId}/interface/api`, // 线上
          // path: "/project/11/interface/api", // 本地调试
          query: {
            title: "接口文档"
          }
        };
        if (yapiProjectId) {
          iframeYapiRef.value?.contentWindow.postMessage(params, "*");
        }
      }
      if (route.name === "projectEnv") {
        checkPermiss();

        const params = {
          // 需要yapi跳转的路径
          path: `/project/${yapiProjectId}/env`, // 线上
          // path: "/project/11/interface/api", // 本地调试
          query: {
            title: "设置"
          }
        };
        iframeYapiRef.value?.contentWindow.postMessage(params, "*");
      }
    });

    const handleActiviteRouter = (item: Record<string, any>, index: number) => {
      setSession("currentActiviteRoute", index.toString());
      activiteIndex.value = index;
      router.push({
        name: item.name,
        query: { ...router.currentRoute.value.query }
      });
    };
    router.beforeResolve((to) => {
      const queryId = to.query.id;
      if (queryId) {
        searchParams.demand = parseInt(queryId as string);
        store.commit(MutationType.updateIterateId, queryId);
      }
    });
    return {
      router,
      route,
      include,
      childRouter,
      handleActiviteRouter,
      activiteIndex,
      handleConditionSearch,
      demandList,
      searchParams,
      isShowIteration,
      handleChangeDialogStatus,
      dialogRef,
      disableIterationSelect,
      isShowYapiIframe,
      src,
      isJurisdiction,
      iframeYapiRef,
      isShowAddIteration,
      isHideTwoNav
    };
  }
});
</script>
<style lang="less" scoped>
.router-navigation {
  margin-left: 15px;
  background: #ebf8f6;
  border-radius: 5px;

  li {
    display: inline-block;
    width: 90px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    user-select: none;
    color: rgba(0, 0, 0, 0.4);
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0);
  }
  .activite-index {
    margin: 0 5px 4px 5px;
    width: 80px;
    height: 26px;
    line-height: 26px;
    border-radius: 5px;
    background: #fff;
    color: rgba(31, 159, 133);
    transition: background-color 0.8s;
  }
}
.secondary__nav {
  max-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}
.iteration__select {
  margin-top: 16px;
  margin-right: -8px;
}
.secondary__nav__iteration__select {
  display: flex;
  align-items: center;
}
.content {
  height: 100%;
  padding: 0px;
  // border-radius: 8px;
  overflow: auto;
}
.createIteration__btn {
  margin-top: 24px;
  float: right;
  margin-right: 8px;

  :deep(.el-form-item) {
    margin-right: 0;
  }
}
.yapi-iframe {
  width: 100%;
  height: 100%;
}
</style>
