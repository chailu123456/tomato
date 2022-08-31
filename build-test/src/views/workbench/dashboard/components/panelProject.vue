<template>
  <div class="dashboard-filter">
    <div class="title">我参与的项目</div>
    <div class="toolbar-list">
      <el-select :class="`appear-type select${panelOptions.value}`" v-model="panelOptions.value" @change="changePanel" placeholder="请选择">
        <el-option v-for="item in panelOptions.list" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
      <router-link class="more" to="/workbench/workItem"> 更多<i class="iconfont icon-shuangjiantou-you"></i></router-link>
    </div>
  </div>
  <div class="dashboard-panel">
    <panel-timeline @lookDetail="lookDetail" v-if="panelOptions.value === 0"></panel-timeline>
    <panel-dynamics @lookDetail="lookDetail" v-else :type="panelOptions.value"></panel-dynamics>
  </div>
  <WorkDrawer :type="typeDrawer" :targetId="targetId" ref="workDrawer"></WorkDrawer>
</template>
<script lang="ts">
import { onMounted, reactive, ref } from "vue";
import panelTimeline from "./panelTimeline.vue";
import PanelDynamics from "./panelDynamics.vue";
import WorkDrawer from "@/businessComponents/workDrawer/index.vue";

export default {
  name: "PanelProject"
};
</script>

<script lang="ts" setup>
import { setSession, getSession } from "@/utils";

const workDrawer = ref();
const typeDrawer = ref(0);
const targetId = ref(0);

const panelOptions = reactive({
  value: 0,
  list: [
    {
      value: 0,
      label: "时间轴"
    },
    {
      value: 1,
      label: "日历"
    },
    {
      value: 2,
      label: "列表"
    },
    {
      value: 3,
      label: "看板"
    }
  ]
});

onMounted(() => {
  getDefaultPanel();
});
const getDefaultPanel = () => {
  const data = getSession("dashboardDefauldTab");
  if (data) {
    if (data === "时间轴") {
      panelOptions.value = 0;
    } else if (data === "日历") {
      panelOptions.value = 1;
    } else if (data === "列表") {
      panelOptions.value = 2;
    } else if (data === "TODO" || data === "看板") {
      panelOptions.value = 3;
    }
  }
};
const changePanel = (value: number) => {
  setSession("dashboardDefauldTab", panelOptions?.list[value]?.label);
};

const lookDetail = (val: Record<string, any>) => {
  workDrawer.value.handleDrawerVisble(true);
  typeDrawer.value = val.type;
  targetId.value = Number(val.target_id);
};
</script>

<style lang="less" scoped>
.dashboard-filter {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding-left: 10px;
  padding-right: 20px;
  box-sizing: border-box;
  font-size: 14px;
  color: #444;
}
.title {
  font-size: 14px;
  color: #444;
  line-height: 56px;
}

.more {
  line-height: 56px;
  display: inline-flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  color: #444;
  font-size: 12px;
}

.appear-type {
  width: 120px;
  margin-right: 10px;
  margin-left: 10px;

  :deep(.el-input__inner) {
    padding: 0 12px 0 24px;
    box-sizing: border-box;
  }
}

.select0 {
  :deep(.el-input__inner) {
    background: url("~@/assets/alarm.png") no-repeat;
    background-size: 20px 20px;
    background-position: 0px 6px;
  }
}

.select1 {
  :deep(.el-input__inner) {
    background: url("~@/assets/calendar.png") no-repeat;
    background-size: 18px 18px;
    background-position: 0px 6px;
  }
}

.select2 {
  :deep(.el-input__inner) {
    background: url("~@/assets/list.png") no-repeat;
    background-size: 20px 20px;
    background-position: 0px 6px;
  }
}

.select3 {
  :deep(.el-input__inner) {
    background: url("~@/assets/three-columns.png") no-repeat;
    background-size: 18px 18px;
    background-position: 0px 6px;
  }
}

.dashboard-panel {
  width: 100%;
  height: 100%;
  padding: 0px 10px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
