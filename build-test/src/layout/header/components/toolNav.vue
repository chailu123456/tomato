<!--
 * @Author: 宋绍华
 * @Date: 2022-05-10 15:19:01
 * @LastEditTime: 2022-06-16 17:20:35
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\toolNav.vue
-->
<template>
  <div class="toolNav">
    <div class="toolNav-add">
      <el-dropdown @command="handleCommand" v-show="addColumnList.length">
        <el-icon class="toolNav-plus" color="#1f9f85" size="24px"><CirclePlusFilled /></el-icon>
        <template #dropdown>
          <el-dropdown-menu class="toolNav-menu">
            <el-dropdown-item
              :disabled="n.value === 1 && !permission?.create_product"
              class="toolNav-menu-item"
              v-for="n in addColumnList"
              :key="n.value"
              :command="n.value"
              >{{ n.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="side-wrapper__notice" @click="show">
      <el-popover placement="bottom-end" trigger="click" :width="900" v-model:visible="currentRt.visible">
        <template #reference>
          <el-badge :value="currentRt.notices" :hidden="currentRt.notices <= 0" type="danger" :max="99">
            <el-icon class="side-wrapper__notice-icon">
              <Bell id="icon" />
            </el-icon>
          </el-badge>
        </template>
        <Notices @update:show="show" v-model:notices="currentRt.notices" />
      </el-popover>
    </div>

    <!-- 消息通知模块 end -->
    <div class="header-pageName__profiles">
      <el-popover popper-class="header-pageName__profiles--popover" placement="bottom-end" :width="150" trigger="hover">
        <template #reference>
          <img class="logo-wrapper__collapse" :src="user?.avatar ?? '../../assets/collapse-logo.png'" alt="" />
        </template>
        <div>
          <div class="header-pageName__avatar" v-if="user?.avatar">
            <img :src="user?.avatar" alt="avatar" />
          </div>
          <p v-else>{{ user?.name }}</p>
          <p>{{ user?.job_name }}</p>
          <el-divider></el-divider>
          <div style="margin: 6px 0">
            <el-switch style="margin-bottom: 6px" v-model="currentRt.bug_alert" @change="handleTip" inactive-text="bug企微提醒"> </el-switch>
            <el-switch v-model="currentRt.task_alert" @change="handleTip" inactive-text="任务企微提醒"></el-switch>
          </div>

          <div class="header-pageName__logout" @click="handleLogout">退出登录</div>
        </div>
      </el-popover>
    </div>

    <!-- 新建项目 -->
    <HandleProduct v-model:visible="dialogVisible" @update-info="updateInfo" />
    <!-- 新建迭代 -->
    <CreateIterationDialog isAdd @refresh="getIterationDetail" ref="dialogRef" />
  </div>
</template>

<script lang="ts">
import { CirclePlusFilled, Bell } from "@element-plus/icons";
import Notices from "@/components/notices/index.vue";
import HandleProduct from "./handleProduct.vue";

import { computed, reactive } from "vue";
import { useStore } from "@/store/index";
import { getWorkerSetting, updateWorkerSetting } from "@/api/request-modules/common";
import { clearCookie, clearSession, getDomain, getSession } from "@/utils";
import { useRouter } from "vue-router";
import useCeateOrEditProduct from "../composables/useCeateOrEditProduct";
import CreateIterationDialog from "@/views/iteration/homePage/components/createIterationDialog.vue";
import useMixin from "@/views/iteration/useMixin";
import { ResponseParams } from "@/types/response";
import { shortCode } from "@/api/request-modules/document";
import { MutationType } from "@/store/mutation-types";
import VueEvent from "@/utils/mitt";
export default {
  name: "toolNav",
  components: {
    CirclePlusFilled,
    Notices,
    HandleProduct,
    CreateIterationDialog
  }
};
</script>

<script lang="ts" setup>
const { getters } = useStore();
const store = useStore();
const router = useRouter();

const currentRt = reactive({
  visible: false,
  show: false,
  notices: 0,
  bug_alert: true,
  task_alert: true,
  addList: [
    {
      value: 1,
      label: "新增项目"
    },
    {
      value: 2,
      label: "新增迭代"
    },
    {
      value: 3,
      label: "新增需求"
    },
    {
      value: 4,
      label: "新增任务"
    },
    {
      value: 5,
      label: "新增BUG"
    },
    {
      value: 6,
      label: "新增文档"
    }
  ]
});

// 路由的第一级
const navRoute = computed(() => {
  const firstName = router.currentRoute.value.path.match(/\/[A-Za-z]+/);
  const path = firstName ? firstName[0].replace(/\//, "") : "";
  return path;
});

const { dialogVisible } = useCeateOrEditProduct();
const { getIterationDetail, dialogRef, handleChangeDialogStatus } = useMixin(true);

const user = computed(() => getters.user);
const permission = computed(() => store.state.permission);

// 顶部显示新增项
const addColumnList = computed(() => {
  /**
   * 1. 在项目模块，显示项目按钮
   * 2. 在迭代模块展示迭代按钮、项目新增按钮
   * 3. 在任务和迭代-任务模块 展示新增项目、新增任务按钮
   * 4. 在产品需求页 展示新增项目、新增需求按钮
   * 5. 在bug 页 展示新增项目、新增bug按钮
   * 6. 在文档页 展示新增文档按钮
   */
  // 项目、迭代、需求、任务、bug、文档
  const [project, iter, demand, exploit, bug, doc] = currentRt.addList;
  if (navRoute.value === "document") {
    return [doc];
  } else if (navRoute.value === "project") {
    return [project, iter, demand, exploit, bug];
  }
  return [];
});

// 控制消息框显示隐藏
const show = (params: string) => {
  if (params === "show") currentRt.visible = true;
  else currentRt.visible = !currentRt.visible;
};

// 企业微信提醒事件
const handleTip = () => {
  const params = {
    bug_alert: currentRt.bug_alert ? "1" : "0",
    task_alert: currentRt.task_alert ? "1" : "0"
  };
  updateWorkerSetting(params).then(() => {
    getTip();
  });
};

// 监听我的工作台模块---未读消息事件点击
VueEvent.on("tomsg", () => {
  show("show1");
});

// tips 提示
const getTip = () => {
  getWorkerSetting().then((res: any) => {
    if (res && res.data) {
      const data = res.data;
      currentRt.bug_alert = !!data.bug_alert;
      currentRt.task_alert = !!data.task_alert;
    }
  });
};

//  获取dom,判断是否隐藏消息框
const dom = document.getElementById("app") as HTMLDivElement;
dom.addEventListener("click", function (e: any) {
  if (e.target.id != "icon") {
    if (e.target.nodeName != "H3") {
      currentRt.visible = false;
    }
  }
});

const handleCommand = (command: string | number) => {
  switch (command) {
    case 1:
      if (!permission.value?.create_product) return;
      dialogVisible.value = true;
      break;
    case 2:
      handleChangeDialogStatus(0);
      break;
    case 3: // 需求
      router.push({
        path: "/project/product/demandPool",
        query: {
          type: "add",
          where: "headerDemand"
        }
      });
      break;
    case 4:
      router.push({
        path: "/project/exploitation",
        query: {
          type: "add",
          where: "headerExploitation"
        }
      });
      break;
    case 5: // bug
      router.push({
        path: "/project/test",
        query: {
          type: "add",
          where: "headerTest"
        }
      });
      break;
    case 6: // 文档
      handleAddDoc();
      break;
  }
};

const handleAddDoc = () => {
  const a = ("&type=update&origin=" + getSession("defaultActiveTab")) as string;
  shortCode<ResponseParams.ResponseDataSuccess>({ content: a }).then((res) => {
    if (res.code === 200) {
      window.open(window.location.origin + "/document/padIframe?" + res.data.code, "_self");
    }
  });
};
// 登出
const handleLogout = () => {
  clearSession("user");
  clearSession("jumpUrl");
  clearSession("cacheProject");
  clearSession("productInfo");
  clearSession("currentIter");
  clearSession("iterateId");
  clearSession("iterateList");
  clearSession("productId");
  clearSession("productList");
  clearSession("defaultActivePath");
  clearCookie("_yapi_uid", "/", getDomain());
  clearCookie("_yapi_token", "/", getDomain());

  store.commit("USER", null);
  router.push({
    name: "login"
  });
  // window.location.reload();
};

const updateInfo = async () => {
  await store?.dispatch("GETPRODUCTLIST");
  store.commit(MutationType.updateProductId, store.getters.productList[0].id);
  router.replace({
    path: router.currentRoute.value.path,
    query: {
      ...router.currentRoute.value.query,
      productId: store.getters.productList[0].id
    }
  });
};
</script>
<style lang="less" scoped>
.toolNav {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
  margin-right: 20px;
  height: 100%;
  .header-pageName__profiles {
    cursor: pointer;
    display: flex;
    margin-left: 20px;
  }

  .logo-wrapper__collapse {
    width: 30px;
  }

  &-add {
    display: flex;
  }

  &-plus {
    cursor: pointer;
    margin-right: 10px;
  }

  &-menu {
    &-item {
      margin: 10px 0;
    }
  }

  :global(.toolNav .el-badge__content.is-fixed) {
    top: 7px;
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

.side-wrapper__notice {
  width: 60px;
  line-height: 16px;
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
    margin-top: 4px;
  }
}

&-icon {
  font-size: 25px;
  color: #999;
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

:global(.toolNav-menu-item) {
  padding: 7px 20px !important;
  font-size: 14px !important;
}
</style>
