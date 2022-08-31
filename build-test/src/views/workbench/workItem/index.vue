<template>
  <div class="rp-content-workItem">
    <div class="rp-work-header">
      <search-form
        ref="searchform"
        :currentActive="currentActive"
        :searchArray="searchArray"
        @quickSeacrh="quickSeacrh"
        @changeSearch="changeSearch"
      ></search-form>
      <div class="header-form-opation">
        <!-- <el-button @click="handleAddWorkItem">新增待办</el-button> -->
        <span class="switch-view">视图：</span>
        <el-dropdown trigger="click" @command="handleSwitch">
          <span class="el-dropdown-link">
            {{ defaultMenu }}
            <i class="iconfont icon-xiasanjiaoxing"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in switchMenu" :key="index" :command="index">{{ item }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="rp-work-content">
      <transition mode="out-in" appear name="zoom-fade">
        <component class="content" @lookDetail="lookDetail" :is="defaultComponents" :formParams="formParams" :defaultMenu="defaultMenu" />
      </transition>
    </div>
    <HandleWaitDialog @show="onShow" :personInfo="curInfo" @updateData="onUpdatedCalendar" v-model:visible="visible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
    <WorkDrawer :type="typeDrawer" :targetId="targetId" ref="workDrawer"></WorkDrawer>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineAsyncComponent, markRaw, onActivated } from "vue";
import WorkDrawer from "@/businessComponents/workDrawer/index.vue";
import VueEvent from "@/utils/mitt";

import { WORK_STATUS, WORK_TYPE } from "@/utils/index";
import { useRoute } from "vue-router";
import { setSession, getSession } from "@/utils";
import type { SearchArray } from "@/types/interface";

export default {
  name: "workItem"
};
</script>

<script lang="ts" setup>
import HandleWaitDialog from "../work/handle-wait-dialog.vue";
import useDashboard from "@/composables/useDashboard";
import HandlePerson from "@/components/handle-person/handle-person.vue";
const route = useRoute();
const { calendar, useGetCarlenderInfo } = useDashboard();
const cont = ref<number>(1);
// 组件名称
const componentArr = [
  markRaw(defineAsyncComponent(() => import("./components/tableList.vue"))),
  markRaw(defineAsyncComponent(() => import("./components/calendarList.vue"))),
  markRaw(defineAsyncComponent(() => import("./components/todoList.vue")))
];
const visible = ref(false);
const personVisible = ref(false);
// 工作项视图菜单
const switchMenu = ["列表", "日历", "TODO"];

const currentActive = ref("-1");

const workDrawer = ref();
const typeDrawer = ref(0);
const targetId = ref(0);

const searchArray: SearchArray = reactive({
  btnArray: [
    { id: "-1", label: "所有", key: "all" },
    { id: "1, 2", label: "未完成", key: "status" },
    { id: "3", label: "已完成", key: "status" },
    { id: "5", label: "需求", key: "type" },
    { id: "2", label: "任务", key: "type" },
    { id: "333", label: "缺陷", key: "type" }
  ],
  searchForm: [
    {
      type: "input",
      label: "名称",
      key: "name",
      val: "",
      placeholder: "请输入需求名称"
    },
    {
      type: "select",
      label: "类别",
      val: [],
      multiple: true,

      key: "type",
      valueKey: ["value", "label"],
      listData: WORK_TYPE
    },
    {
      type: "select",
      label: "状态",
      multiple: true,
      val: [],
      key: "status",
      valueKey: ["value", "label"],
      listData: WORK_STATUS
    },
    {
      type: "daterange",
      label: "完成时间",
      val: [],
      key: "times",
      format: "YYYY-MM-DD",
      hasShortcuts: true,
      valueKey: []
    }
  ]
});

// 工作项视图菜单默认展示
const defaultMenu = getSession("workItemDefauldTab") ? ref(switchMenu[Number(getSession("workItemDefauldTab"))]) : ref("列表");

// 默认展示组件
const defaultComponents = getSession("workItemDefauldTab") ? ref(componentArr[Number(getSession("workItemDefauldTab"))]) : ref(componentArr[0]);
// 搜索参数
const formParams = reactive<{
  page_index: number;
  page_size: number;
  name: string | undefined;
  end_time: string | undefined;
  start_time: string | undefined;
  times: string[] | undefined;
  type: number[] | undefined;
  sort_name: string | undefined;
  sort_by: number | undefined;
  status: number[] | undefined;
  is_drawer: number;
}>({
  page_index: 1,
  page_size: 30,
  status: undefined,
  name: "",
  times: undefined,
  end_time: "",
  start_time: "",
  type: [],
  sort_name: "",
  sort_by: 1,
  is_drawer: 0
});

const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  abeyancenEditItem: {} // 待办编辑item
});

onActivated(() => {
  formParams.sort_name = "";
  // 缺陷数
  if (route.params && route.params.where === "dashboard") {
    currentActive.value = "-10";
    searchArray.searchForm[1].val = [3];
    searchArray.searchForm[2].val = [1, 2];
    formParams.status = [1, 2];
    formParams.type = [3];
    // 任务+需求
  } else if (route.params && route.params.where === "dashboardWork") {
    currentActive.value = "-10";
    searchArray.searchForm[1].val = [2, 5];
    searchArray.searchForm[2].val = Number(route.params.type) ? [6] : [];
    formParams.type = [2, 5];
    formParams.status = Number(route.params.type) ? [6] : [];
  }
});

const lookDetail = (val: Record<string, any>) => {
  workDrawer.value.handleDrawerVisble(true);
  typeDrawer.value = val.type;
  targetId.value = Number(val.target_id);
};

// 监听抽屉组件状态
VueEvent.on("drawStatus", (val) => {
  if (!val) {
    formParams.page_size = 0;
    formParams.page_size = 20;
    formParams.is_drawer = 2;
  }
});

// 快速搜索
const quickSeacrh = (val: Record<string, any>) => {
  // 先把form 所有的数据清空
  Object.keys(formParams)
    .filter((i) => !["page_index", "page_size"].includes(i))
    .forEach((key) => {
      // @ts-ignore
      formParams[key as keyof typeof formParams] = undefined;
    });

  if (val.key === "status") {
    formParams.status = val.id === "3" ? [3] : [1, 2];
  } else if (val.key === "type") {
    formParams.type = [Number(val.id)];
    if (val.id === "333") formParams.type = [3];
  }
};

// 筛选
const changeSearch = (val: Record<string, any>) => {
  Object.keys(formParams).forEach((key: string) => {
    if (val.times && (key === "start_time" || key === "end_time")) {
      formParams["start_time"] = val.times[0];
      formParams["end_time"] = val.times[1];
    } else {
      // @ts-ignore
      formParams[key as keyof typeof formParams] = val[key] || undefined;
    }
  });
};

const onShow = (show: boolean) => {
  personVisible.value = show;
};

// 新增待办
// const handleAddWorkItem = () => {
//   visible.value = true;
// };

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.department = department as any;
  curInfo.team_worker = team_worker as any;
  curInfo.selectPerson = selectPerson as any;
};

// 视图切换
const handleSwitch = (val: number) => {
  defaultMenu.value = switchMenu[val];
  defaultComponents.value = componentArr[val];
  setSession("workItemDefauldTab", val + "");
};

// 更新日历状态
const onUpdatedCalendar = () => {
  const c = calendar.value || getSession("calendar", true);
  if (c) {
    useGetCarlenderInfo({ month: c.curMonthDatePrefix });
  }
  visible.value = false;
  // 更新工作项列表和todo列表
  formParams.sort_name = "" + cont.value++;
};
</script>

<style lang="less">
.rp-content-workItem {
  height: calc(100% - 10px) !important;
  background: #fff;
  padding: 10px !important;
  .rp-work-header {
    display: flex;
    height: 34px;
    align-items: center;
    .icon-xiasanjiaoxing {
      float: right;
      color: #8c8b8b;

      font-size: 14px;
      margin-left: 4px;
    }
    .header-form-search {
      width: 80%;
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .header-form-opation {
      width: 20%;
      text-align: right;
      margin-right: 20px;
      flex: 1;
      line-height: 29px;
      span.switch-view {
        font-size: 14px;
      }
      .el-dropdown {
        float: right;
        margin-top: 9px;
        &:hover {
          cursor: pointer;
        }
        .el-dropdown-link {
          cursor: pointer;
          display: flex;
          align-items: center;
        }
      }
      .el-button {
        margin: 0 10px;
      }
    }
  }
}
.rp-select-workItem {
  .el-input {
    width: 140px;
  }

  .el-select__tags {
    max-width: 120px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
  }
  .el-date-editor {
    width: 240px;
  }
}

.rp-work-content {
  margin-top: 10px;
  height: calc(100% - 45px);
  overflow: hidden;
  .container {
    height: 100% !important;
    padding: 0;
  }
}
</style>
