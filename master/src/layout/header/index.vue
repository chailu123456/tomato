<template>
  <el-header class="header">
    <section class="header-left">
      <el-form v-if="!isDocument" :inline="true">
        <el-form-item style="margin-bottom: 0" label="项目名称:">
          <el-select :disabled="isDisableProjectSelect" @change="handleChangeProduct" value-key="id" v-model="productId" filterable placeholder="请选择">
            <el-option v-for="item in productLists" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="width: 200px; text-align: center" v-else>{{ isDocument }}</div>
      <el-divider direction="vertical" class="divider__margin"></el-divider>
    </section>
    <header class="header-center">
      <el-menu :router="true" :ellipsis="false" :default-active="defaultActivePath" class="header-center__ul" mode="horizontal">
        <el-menu-item :index="item.path" v-for="item in childRouter" :key="item.path">{{ item.meta.title }} </el-menu-item>
      </el-menu>
    </header>
    <section class="header-right">
      <ToolsNav />
    </section>
    <el-dialog title="添加成功" v-model="dialogVisibleBtn" width="40%" center :append-to-body="true">
      <div>
        项目 <span style="font-weight: 700; margin: 0 8px"> {{ dialogParams.name }} </span>添加成功，您还可以：
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleConfirmGo('demandPool')">管理需求</el-button>
          <el-button type="primary" v-debounce @click="handleConfirmGo('moduleManage')">维护模块</el-button>
          <el-button type="primary" v-debounce @click="handleConfirmGo('member')">添加成员</el-button>
          <el-button @click="handleConfirmGo('demandPool')">稍后设置</el-button>
        </span>
      </template>
    </el-dialog>

    <HandleProduct v-model:visible="dialogVisible" />
  </el-header>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed, toRefs, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import useMixin, { createWatch } from "@/views/iteration/useMixin";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { useStore } from "@/store/index";
import { clearSession, getDomain, updateProjectCache } from "@/utils";
import { selectProductList } from "@/api/request-modules/product";
import { getWorkerSetting, updateWorkerSetting } from "@/api/request-modules/common";
import { replaceProductId } from "@/views/iteration/useMixin";
import { ResponseParams } from "@/types/response";
import { getSession, setSession } from "@/utils/sesssion";
import useCeateOrEditProduct from "./composables/useCeateOrEditProduct";
import HandleProduct from "./components/handleProduct.vue";
import VueEvent from "@/utils/mitt";
import { shortCode } from "@/api/request-modules/document";
import ToolsNav from "./components/toolNav.vue";

export default defineComponent({
  data() {
    return {
      notices: 0,
      a: true
    };
  },
  components: {
    ToolsNav,
    HandleProduct
  },
  setup() {
    const { getters } = useStore();
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    const { searchParams, demandList, getIterationDetail } = useMixin(true);
    const childRouter = ref<Array<Record<string, any>>>();
    const defaultActivePath = ref<string>();
    const visible = ref(false);
    const isDisableProjectSelect = ref(false);
    const isDocument = ref("");

    // 控制消息框显示隐藏
    const show = (params: string) => {
      if (params === "show") visible.value = true;
      else visible.value = !visible.value;
    };
    watch(
      () => route.path,
      () => {
        if (route.path === "/project/iteration/interface" || route.path === "/project/interfaceDoc") {
          history.pushState(null, "", document.URL);
        }

        // 地址栏参数变化，设置迭代的列表
        // 获取当前路由下面的所有子路由
        childRouter.value = route.matched[1]?.children ? route.matched[1]?.children : [];
        childRouter.value = childRouter.value.filter((item) => item.meta?.hidden !== false);
        // 地址栏存在用地址栏的，否则用第一个子路由的
        isDisableProjectSelect.value = router.currentRoute.value.meta.disabledProjectSelect as boolean;
        isDocument.value = router.currentRoute.value.meta.isDocument as string;

        const currentRoute = route.path.split("/");
        if (route.meta.hidden === false) return; // 子页面不重新设置激活菜单
        if (currentRoute.length > 3) {
          currentRoute.pop();
        }

        defaultActivePath.value = currentRoute.join("/");
        setSession("defaultActivePath", defaultActivePath.value);
        setSession("defaultActiveTab", currentRoute[2] || "knowledgeBase");
      },
      {
        immediate: true
      }
    );
    // 监听我的工作台模块---未读消息事件点击
    VueEvent.on("tomsg", () => {
      show("show1");
    });
    // 保存header 当前tab路径,解决进入到子模块页面重新刷新ActivePath丢失，tab当前样式(下划线)丢失
    const ActivePath = getSession("defaultActivePath", false) as string;
    if (ActivePath) defaultActivePath.value = ActivePath;
    else defaultActivePath.value = "/project/iteration";

    //  获取dom,判断是否隐藏消息框
    const dom = document.getElementById("app") as HTMLDivElement;
    dom.addEventListener("click", function (e: any) {
      if (e.target.id != "icon") {
        if (e.target.nodeName != "H3") {
          visible.value = false;
        }
      }
    });

    const clearCookie = (sKey: string, sPath: string, sDomain: string) => {
      document.cookie =
        encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
      return true;
    };

    // 企业微信推送提醒
    const tipParams = reactive({
      bug_alert: true,
      task_alert: true
    });
    const getTip = () => {
      getWorkerSetting().then((res: any) => {
        if (res && res.data) {
          // tipParams
          const data = res.data;
          tipParams.bug_alert = data.bug_alert ? true : false;
          tipParams.task_alert = data.task_alert ? true : false;
        }
      });
    };
    getTip();
    // 企业微信提醒事件
    const handleTip = () => {
      const params = {
        bug_alert: tipParams.bug_alert ? "1" : "0",
        task_alert: tipParams.task_alert ? "1" : "0"
      };
      updateWorkerSetting(params).then(() => {
        getTip();
      });
    };

    const handleAddDoc = () => {
      const a = ("&type=update&origin=" + getSession("defaultActiveTab")) as string;
      shortCode<ResponseParams.ResponseDataSuccess>({ content: a }).then((res) => {
        if (res.code === 200) {
          window.open(window.location.origin + "/document/padIframe?" + res.data.code, "_self");
        }
      });
    };

    const handleLogout = () => {
      clearSession("user");
      clearSession("jumpUrl");
      clearSession("cacheProject");
      clearSession("defaultActivePath");
      clearCookie("_yapi_uid", "/", getDomain());
      clearCookie("_yapi_token", "/", getDomain());

      store.commit("USER", null);
      router.push({
        name: "login"
      });
    };
    //#region 获取迭代
    const getIteration = (id: number) => {
      // 先判断是否有缓存迭代id，如果当前项目下有缓存迭代id，用此迭代id
      const _cache = getSession("cacheProject", true) as Array<any>;
      return _cache.find((v) => v.projectId === id)?.iterationId;
    };
    //#endregion
    //#region 获取所有项目和迭代列表
    //获取迭代下拉列表
    const getDemandList = useGetDemandList();
    const getDemandListFn = (id: number) => {
      demandList.value = [];
      getDemandList(id).then((res) => {
        demandList.value = res;
        const iterationId = getIteration(id);
        if (iterationId) {
          searchParams.demand = Number(iterationId);
          return;
        }
        searchParams.demand = res.length ? res[0].id : null;
      });
    };
    createWatch(getIterationDetail);
    const { productLists, productId } = replaceProductId();
    // 手动下拉选择项目名称事件
    const handleChangeProduct = (id: number) => {
      const item = productLists.value.find((i: Record<string, any>) => i.id === id);

      // 设置项目缓存
      updateProjectCache(item);
      router.replace({
        query: Object.assign(
          { ...router.currentRoute.value.query },
          {
            productId: productId.value
          }
        )
      });
      getDemandListFn(id);
    };
    const getProductLists = () => {
      selectProductList<ResponseParams.ResponseDataSuccess>().then((res) => {
        if (!res.data) {
          // window.location.href = "/noAccess";
          return;
        }
        productLists.value = res.data;
        productId.value = productLists.value[0] ? productLists.value[0].id : [];
        const localProductId = (getSession("productInfo", true) as Record<string, any>)?.id;
        if (localProductId) productId.value = localProductId;
        // 地址栏没有productId就设置默认的第一个
        replaceProductId();
        getDemandListFn(productId.value);
        // 缓存当前项目和迭代的选择
        // 缓存不存在，设置,存在的话，根据项目id查找
        const cacheObj = [] as Array<any>;
        productLists.value.forEach((v: Record<string, any>) => {
          cacheObj.push({ projectId: v.id, iterationId: null, yapi_default_iteration_id: v.yapi_default_iteration_id });
        });
        setSession("cacheProject", JSON.stringify(cacheObj));
      });
    };
    getProductLists();
    //#endregion
    //#region 新增项目弹窗
    // 弹窗相关操作
    const { dialogParams, handleShowDialog, dialogVisible, dialogVisibleBtn, ConfirmGo } = useCeateOrEditProduct();
    // 弹窗点击确定
    const handleConfirmGo = (val: string) => ConfirmGo(val);
    //#endregion
    return {
      productLists,
      handleLogout,
      user: computed(() => getters.user),
      show,
      childRouter,
      defaultActivePath,
      visible,
      productId,
      handleChangeProduct,
      dialogVisible,
      dialogVisibleBtn,
      dialogParams,
      handleShowDialog,
      isDisableProjectSelect,
      ...toRefs(tipParams),
      handleTip,
      isDocument,
      handleAddDoc,
      handleConfirmGo
    };
  }
});
</script>

<style scoped lang="less">
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: left;
  line-height: 60px;
}

.header {
  position: relative;
  z-index: 99;
  user-select: none;
  background-color: #fff !important;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  box-shadow: 0 5px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 1px solid #ebeef5;
  height: 42px !important;

  &-left {
    display: flex;
    align-items: center;
    height: inherit;
  }

  &-center {
    flex: 1;
    overflow-x: scroll;
    overflow-y: hidden;
    height: 46px;

    &__ul {
      display: flex;
      flex-wrap: nowrap;
      border: none;
    }
  }

  &-right {
    width: 210px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :deep(.el-form--inline .el-form-item__content) {
    vertical-align: unset;
  }

  :deep(.el-cascader) {
    width: 260px;
  }

  :deep(.el-menu-item) {
    height: 42px;
    line-height: 42px;
    color: #909399;
  }

  .float-left {
    margin-left: 8px;
    display: flex;
    align-items: center;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-divider) {
      margin-left: 16px;
    }
  }

  .side-wrapper__notice {
    width: 80px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;

    &-circle {
      position: relative;
      z-index: 2;
      margin-left: 20px;
      margin-bottom: -8px;
      width: 18px;
      height: 18px;
      background-color: #999;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #fff;
    }

    &-icon {
      font-size: 25px;
      color: #999;
    }
  }

  // }
  .side-wrapper__notice-icon {
    font-size: 25px;
    color: #999;
  }

  .logo-wrapper__collapse {
    width: 30px;
  }

  .header-pageName {
    display: inline-block;
    width: 100px;
    text-align: center;
  }

  .header-pageName__profiles {
    cursor: pointer;

    img {
      margin-top: 24px;
      line-height: 60px;
    }
  }
}

.header-pageName__profiles--popover {
  div {
    text-align: center;
  }

  p {
    line-height: 2px;
    text-align: center;
  }
}

.header-pageName__avatar {
  margin: 0 auto;
  width: 50px;

  img {
    width: 100%;
  }
}

.header-pageName__logout {
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  background: rgb(247, 247, 247);
  color: red;
}

:deep(.el-divider--horizontal) {
  margin: 12px 0;
}

.header__right {
  display: flex;
  flex: 0 0 10%;
  justify-content: space-between;
  align-items: center;
}
</style>

<style lang="less">
.header {
  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 4px solid #1f9f85;
    color: #1f9f85 !important;

    background-color: #fff !important;
  }

  .el-menu--horizontal > .el-menu-item:not(.is-disabled) {
    &:hover {
      background-color: #fff !important;
    }
  }
}
</style>
