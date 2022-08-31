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
        <ul class="router-navigation">
          <!-- <router-link :to="item.path" v-for="(item, index) in childRouter" :key="item"> -->
          <li
            v-for="(item, index) in childRouter"
            :key="item"
            @click="handleActiviteRouter(item, index)"
            :class="[index === activiteIndex ? `activite-index` : ``]"
          >
            {{ item.meta.title }}
          </li>
          <!-- </router-link> -->
        </ul>
      </div>
      <el-form :inline="true" v-if="isShowIteration" class="createIteration__btn">
        <el-form-item v-if="isShowAddIteration">
          <el-button type="primary" @click="handleChangeDialogStatus(0)">新增迭代</el-button>
        </el-form-item>
      </el-form>
    </div>

    <router-view v-slot="{ Component }">
      <!-- <component :is="Component" /> -->

      <!-- in-out: 新元素先进行过渡，完成之后当前元素过渡离开。
      out-in: 当前元素先进行过渡，完成之后新元素过渡进入。 -->
      <transition mode="out-in" appear name="zoom-fade">
        <iframe ref="iframeYapiRef" :src="src" frameborder="0" class="yapi-iframe" v-show="isShowYapiIframe"></iframe>
      </transition>
      <div v-if="isJurisdiction" style="margin-top: 14%">
        <el-result :title="route.name === 'projectEnv' ? '暂无权限查看' : '暂无权限查看，请先添加迭代成员'">
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
    <createIterationDialog @refresh="getIterationDetail" ref="dialogRef" />
  </div>
</template>
+
<script lang="ts">
import { yapiCheckPermission, yapiEnvUpload } from "@/api/request-modules/common";
import { useStore } from "@/store";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import useMixin from "@/views/iteration/useMixin";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { ResponseParams } from "@/types/response";
import { getSession, setSession } from "@/utils";
import createIterationDialog from "@/views/iteration/homePage/components/createIterationDialog.vue";
import routes from "./routeMap";
// import useMessageTip from "@/composables/useMessageTip";
export default defineComponent({
  name: "navigation",
  components: {
    createIterationDialog
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const childRouter = ref<Array<Record<string, any>>>();
    const isShowIteration = ref(false);
    const isShowAddIteration = ref(false);
    const isJurisdiction = ref(false);
    const disableIterationSelect = ref(false);
    const store = useStore();
    const include: string[] = store.state.include;
    const activiteIndex = ref(Number(getSession("currentActiviteRoute")) || 0);
    const isShowYapiIframe = ref(false);
    const iframeYapiRef = ref();
    const { searchParams, handleConditionSearch, handleChangeDialogStatus, demandList, dialogRef, getIterationDetail } = useMixin(true);
    // yapi postmessage
    // const src = ref("");
    const src = ref();

    if (process.env.NODE_ENV === "development") {
      console.log("测试");

      src.value = "https://yapi.rvet.cn/group";
    } else {
      console.log("生产");
      src.value = "https://yapi.petrvet.com/group";
    }
    // 是否展示iframe
    window.onload = () => {
      // yapi postmessage
      // isShowYapiIframe.value = true;
      watch(
        () => route.path,
        () => {
          isShowAddIteration.value = route.path === "/project/iteration/homepage" ? true : false;
          isJurisdiction.value = false;
          childRouter.value = route.matched[2]?.children ? route.matched[2]?.children : [];
          childRouter.value = childRouter.value.filter((item) => item.meta?.hidden !== false);
          // 是否展示迭代筛选框
          isShowIteration.value = route.meta.isShowIterationSelect as boolean;
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
              const { _cache, productId } = getProductIdCache();
              const defaultActivePath = getSession("defaultActivePath", false) as string;
              const yapiProject = _cache.find((item) => item.projectId === productId);
              let yapiProjectId = yapiProject.yapi_default_iteration_id || 0;
              // 获取yapi接口权限参数
              if (defaultActivePath === "/project/iteration") {
                const yapiIteration = demandList.value.find((item: Record<string, any>) => item.id === searchParams.demand);
                // 如果项目下有迭代
                if (yapiIteration) yapiProjectId = yapiIteration?.yapi_iteration_id || 0;
              }
              checkPermiss();

              const yapiPath = ["/project/interfaceDoc", "/project/iteration/interface"];
              // 判断
              if (yapiPath.indexOf(route.path) != -1) {
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
    // const { tipMessage } = useMessageTip();

    // yapi_default_iteration_id
    // yapi_iteration_id
    // 监听yapi子页面发送过来的数据
    window.addEventListener("message", async (params) => {
      try {
        const type = Object.prototype.toString.call(params.data);
        if (type === "[object Object]" && Object.keys(params) && !params.data.payload) {
          // console.log(params.data, "params.data");
          if (params.data && params.data.errcode === 40011) {
            // yapi cookie失效重新登录
            // await autoLoginYapiFn();
            // src.value = "";
            // src.value = "https://yapi.rvet.cn/group";
            // window.location.reload();
            // iframeYapiRef.value.contentWindow.postMessage(
            //   {
            //     tomatoRouteName: "",
            //     params: {
            //       action: "reload"
            //     }
            //   },
            //   "*"
            // );
          }
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
              const productId = getSession("productId", true) as string;
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
      const _cache = getSession("cacheProject", true) as Array<any>;
      const productId = getSession("productId", true) as string;
      return {
        _cache,
        productId
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
        const yapiIteration = computed(() => {
          return demandList.value;
        });
        if (!yapiIteration.value.length) {
          // 当前项目没有迭代
          const { _cache, productId } = getProductIdCache();
          const yapiProject = _cache.find((item) => item.projectId === productId);
          let yapiProjectId = yapiProject.yapi_default_iteration_id || 0;
          params.path = `/project/${yapiProjectId}/interface/api`;
        } else {
          const yapiIteration = demandList.value.find((item: Record<string, any>) => item.id === searchParams.demand);
          params.path = `/project/${yapiIteration.yapi_iteration_id}/interface/api`;
        }
        iframeYapiRef.value?.contentWindow.postMessage(params, "*");
      }
    };

    // 检查是否有权限查看yapi文档
    const checkPermiss = async () => {
      isJurisdiction.value = false;
      const { _cache, productId } = getProductIdCache();
      const defaultActivePath = getSession("defaultActivePath", false) as string;
      const yapiProject = _cache.find((item) => item.projectId === productId);
      // 获取yapi接口权限参数
      let yapiPermiss = {
        product_id: yapiProject.projectId,
        iteration_id: 0
      };
      if (defaultActivePath === "/project/iteration") {
        yapiPermiss.iteration_id = searchParams.demand || 0;
      }
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
        // return tipMessage(406, "暂无权限查看");
      }
    };

    // 监听迭代id
    watch(
      () => searchParams.demand,
      () => {
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

      const yapiProject = _cache.find((item) => item.projectId === productId);
      let yapiProjectId = yapiProject.yapi_default_iteration_id || 0;
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
        iframeYapiRef.value?.contentWindow.postMessage(params, "*");
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
      // interfaceFun();
      activiteIndex.value = index;
      router.push({
        name: item.name,
        query: { ...router.currentRoute.value.query }
      });
    };
    router.beforeResolve((to) => {
      const queryId = to.query.id;
      // activiteIndex.value = Number(getSession("currentActiviteRoute")) || 0;
      if (queryId) {
        searchParams.demand = parseInt(queryId as string);
      }
    });
    return {
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
      getIterationDetail,
      disableIterationSelect,
      isShowYapiIframe,
      src,
      isJurisdiction,
      iframeYapiRef,
      isShowAddIteration
    };
  }
});
</script>
<style lang="less" scoped>
.router-navigation {
  // margin-left: 15px;
  li {
    display: inline-block;
    width: 100px;
    height: 35px;
    text-align: center;
    line-height: 35px;
    cursor: pointer;
    user-select: none;
    color: rgba(0, 0, 0, 0.4);
    font-size: 14px;
    background: rgba(0, 0, 0, 0.1);
  }
  li:first-child {
    // li {
    border-top-left-radius: 5px;
    // }
  }
  li:last-child {
    // li {
    border-top-right-radius: 5px;
    // }
  }
  .activite-index {
    background: #fff;
    color: rgba(31, 159, 133);
  }
  // }
}
.secondary__nav {
  // margin-left: 10px;
  max-height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ebf8f6;
}
.iteration__select {
  margin-top: 16px;
  margin-right: -8px;
  // width: 290px;
}
.secondary__nav__iteration__select {
  // margin-left: 8px;
  display: flex;
  align-items: center;
}
.content {
  height: calc(100% - 0px);
  /* margin: 5px; */
  // background: #fff;
  /* box-sizing: border-box; */
  padding: 0px;
  border-radius: 8px;
  /* padding-left: 10px; */
  overflow: auto;
  // overflow-y: scroll;
}
.createIteration__btn {
  margin-top: 16px;
  float: right;
  margin-right: 6px;

  :deep(.el-form-item) {
    margin-right: 0;
  }
}
.yapi-iframe {
  width: 100%;
  height: 100%;
}
</style>
