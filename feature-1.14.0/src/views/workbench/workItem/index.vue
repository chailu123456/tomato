<template>
  <div class="rp-content-workItem">
    <div class="rp-work-header">
      <el-form :inline="true" :model="formParams" class="header-form-search">
        <el-form-item>
          <el-input v-model.trim.lazy="formParams.name" placeholder="名称搜索"></el-input>
        </el-form-item>
        <el-form-item label="类别" class="rp-select-workItem">
          <el-select v-model="formParams.type" placeholder="--所有--" clearable>
            <el-option v-for="item in WORK_TYPE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" class="rp-select-workItem">
          <el-select v-model="formParams.status" placeholder="--所有--" multiple collapse-tags clearable>
            <el-option v-for="item in WORK_STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="defaultMenu !== '日历'" label="时间" class="rp-select-workItem" prop="end_time">
          <el-date-picker
            v-model="formParams.times"
            @change="handleEndTime"
            type="daterange"
            value-format="YYYY-MM-DD"
            end-placeholder="请选择日期"
            start-placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div class="header-form-opation">
        <el-button @click="handleAddWorkItem">新增待办</el-button>
        <span class="switch-view">视图：</span>
        <el-dropdown trigger="click" @command="handleSwitch">
          <span class="el-dropdown-link">
            {{ defaultMenu }}
            <i class="iconfont icon-xiasanjiaoxing"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu v-for="(item, index) in switchMenu" :key="index">
              <el-dropdown-item :command="index">{{ item }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="rp-work-content">
      <transition mode="out-in" appear name="zoom-fade">
        <component class="content" :is="defaultComponents" :formParams="formParams" :defaultMenu="defaultMenu" />
      </transition>
    </div>
    <HandleWaitDialog @show="onShow" :personInfo="curInfo" @updateData="onUpdatedCalendar" v-model:visible="visible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineAsyncComponent, markRaw, onActivated } from "vue";
import { WORK_STATUS, WORK_TYPE } from "@/utils/index";
import type { WorkItemForm } from "@/types/interface";
import { useRoute } from "vue-router";
import { setSession, getSession } from "@/utils";

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
// 工作项视图菜单默认展示
const defaultMenu = getSession("workItemDefauldTab") ? ref(switchMenu[Number(getSession("workItemDefauldTab"))]) : ref("列表");

// 默认展示组件
const defaultComponents = getSession("workItemDefauldTab") ? ref(componentArr[Number(getSession("workItemDefauldTab"))]) : ref(componentArr[0]);
// 搜索参数
const formParams: WorkItemForm = reactive({
  page_index: 1,
  page_size: 30,
  name: "",
  times: [],
  end_time: "",
  start_time: "",
  type: null,
  sort_name: "",
  sort_by: 1
});

const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  abeyancenEditItem: {} // 待办编辑item
});

onActivated(() => {
  formParams.sort_name = "11";
  if (route.query.type) {
    const type = Number(route.query.type);
    formParams.type = type;
    formParams.status = [1, 2];
  } else {
    formParams.sort_name = "";
  }
});

const onShow = (show: boolean) => {
  personVisible.value = show;
};

// 新增待办
const handleAddWorkItem = () => {
  visible.value = true;
};

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.department = department as any;
  curInfo.team_worker = team_worker as any;
  curInfo.selectPerson = selectPerson as any;
};

// 时间选择时间
const handleEndTime = (val: string[]) => {
  if (val && val.length) {
    formParams.start_time = val[0];
    formParams.end_time = val[1];
  } else {
    formParams.start_time = "";
    formParams.end_time = "";
  }
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
