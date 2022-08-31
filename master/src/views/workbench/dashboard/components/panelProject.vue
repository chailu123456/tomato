<template>
  <div class="dashboard-filter">
    <div class="title">{{ panelOptions.value === 0 ? "待办工作" : "我的工作" }}</div>
    <div class="toolbar-list">
      <el-select :class="`appear-type select${panelOptions.value}`" v-model="panelOptions.value" @change="changePanel" placeholder="请选择">
        <el-option v-for="item in panelOptions.list" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
      <span v-show="panelOptions.value === 2" @click="handleJump" class="more">更多<i class="iconfont icon-shuangjiantou-you"></i></span>
    </div>
  </div>
  <div class="dashboard-panel">
    <panel-timeline @lookDetail="lookDetail" v-if="panelOptions.value === 0" :update="timelineCount"></panel-timeline>
    <panel-dynamics @lookDetail="lookDetail" v-else :type="panelOptions.value" :update="dynamicsCount"></panel-dynamics>
  </div>
  <WorkDrawer :type="typeDrawer" :targetId="targetId" :productId="productId" :iterationId="iterationId" ref="workDrawer" @refresh="refreshPanel"></WorkDrawer>
</template>

<script lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import panelTimeline from "./panelTimeline.vue";
import PanelDynamics from "./panelDynamics.vue";
import WorkDrawer from "@/businessComponents/workDrawer/index.vue";
import { useRouter } from "vue-router";

export default {
  name: "PanelProject"
};
</script>

<script lang="ts" setup>
import { setSession, getSession } from "@/utils";

const workDrawer = ref();
const typeDrawer = ref(0);
const targetId = ref(0);
const productId = ref(0);
const iterationId = ref(0);
const router = useRouter();

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
  const data = getSession("dashboardSelectTab");
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
  setSession("dashboardSelectTab", panelOptions?.list[value]?.label);
  const o: Record<string, string> = {
    日历: "1",
    列表: "0",
    看板: "2"
  };
  if (o[panelOptions?.list[value]?.label]) {
    setSession("workItemDefauldTab", o[panelOptions?.list[value]?.label]);
  }
};

const lookDetail = (val: Record<string, any>) => {
  workDrawer.value.handleDrawerVisble(true);
  // 点击同一条数据watch无法监听到变化，所以子组件抛出一个方法去调取
  // 这块这么做的原因是我把一个未完成的需求修改到一个已经上线的迭代,同时需求状态也要改成已完成，需要再次点击更新
  if (targetId.value === Number(val.target_id)) {
    workDrawer.value.getDetailData(Number(val.target_id));
  }
  typeDrawer.value = val.type;
  targetId.value = Number(val.target_id);
  productId.value = Number(val.product_id);
  iterationId.value = Number(val.iteration_id);
};

const timelineCount = ref(0);
const dynamicsCount = ref(0);
// 是否刷新时间轴数据列表
const refreshPanel = () => {
  if (panelOptions.value == 0) {
    timelineCount.value++;
  } else {
    dynamicsCount.value++;
  }
};

const handleJump = () => {
  router.push({
    name: "workItem",
    params: {
      type: 1
    }
  });
};

watch(
  () => panelOptions.value,
  (newVal, oldVal) => {
    if (newVal != oldVal) {
      if (newVal == 0) {
        timelineCount.value++;
      } else {
        dynamicsCount.value++;
      }
    }
  }
);
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
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
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
    background-size: 16px 16px;
    background-position: 0px 8px;
  }
}

.select1 {
  :deep(.el-input__inner) {
    background: url("~@/assets/calendar.png") no-repeat;
    background-size: 16px 16px;
    background-position: 0px 8px;
  }
}

.select2 {
  :deep(.el-input__inner) {
    background: url("~@/assets/list.png") no-repeat;
    background-size: 16px 16px;
    background-position: 0px 8px;
  }
}

.select3 {
  :deep(.el-input__inner) {
    background: url("~@/assets/three-columns.png") no-repeat;
    background-size: 16px 16px;
    background-position: 0px 8px;
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
