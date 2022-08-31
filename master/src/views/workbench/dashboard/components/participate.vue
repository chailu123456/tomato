<template>
  <div class="dashboard-foot">
    <div class="project-item" v-if="participates.length">
      <div class="title">我参与的项目</div>
      <div class="project-list" v-loading="pLoading">
        <span v-for="item in participates" :key="item.id" class="project-item" @click="gotoHome(item.id)">
          <img v-if="item.logo" :src="item.logo" :alt="item.name" />
          <img v-else src="@/assets/collapse-logo.png" :alt="item.name" />
          <el-tooltip effect="light" class="item" :content="item.name" placement="bottom">
            <span class="name">{{ item.name }}</span>
          </el-tooltip>
        </span>
      </div>
    </div>
    <div class="project-statistics">
      <div class="title">待办工作统计</div>
      <div class="statistics-list" v-loading="dLoading">
        <div class="statistics-item item-1">
          <span class="desc">迭代</span>
          <span class="number">{{ dashboard?.todo_iteration_num }}</span>
        </div>
        <div class="statistics-item item-2" @click="handleWork(0)">
          <span class="desc">工作项</span>
          <span class="number">{{ dashboard?.todo_work_num }}</span>
        </div>
        <div class="statistics-item item-3" @click="handleWork(1)">
          <span class="desc">延期工作项</span>
          <span class="number">{{ dashboard?.delay_work_num }}</span>
        </div>
        <div class="statistics-item item-4">
          <span class="desc">本月准时完成率</span>
          <span class="number">{{ dashboard?.on_time_complete_rate }}%</span>
        </div>
        <div class="statistics-item item-5" @click="handleBug">
          <span class="desc">缺陷数</span>
          <span class="number">{{ dashboard?.todo_bug_num }}</span>
        </div>
        <div class="statistics-item item-6">
          <span class="desc">本月缺陷密度</span>
          <span class="number">{{ dashboard?.defect_density }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "participate"
};
</script>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { getListParticipate, getDashboardList } from "@/api/request-modules/workbench";
import type { ResponseDataSuccess } from "@/types/interface";
import router from "@/router";
import VueEvent from "@/utils/mitt";
import { useRoute } from "vue-router";

interface Dashboard {
  defect_density?: number;
  delay_work_num?: number;
  on_time_complete_rate?: number;
  todo_bug_num?: number;
  todo_iteration_num?: number;
  todo_work_num?: number;
}

interface Project {
  code: string | number;
  id: number;
  logo: string;
  name: string;
}
const route = useRoute();

const pLoading = ref(false);
const participates = ref<Project[]>([]);
const getParticipates = async () => {
  pLoading.value = true;
  const res: ResponseDataSuccess = await getListParticipate();
  if (res.code === 200 && res.data) {
    participates.value = res.data;
  }
  pLoading.value = false;
};

const dLoading = ref(false);
const dashboard = ref<Dashboard>({});
const getDashboard = async () => {
  dLoading.value = true;
  const res: ResponseDataSuccess = await getDashboardList();
  if (res.code === 200 && res.data) {
    dashboard.value = res.data as Dashboard;
  }
  dLoading.value = false;
};

const handleBug = () => {
  router.push({
    name: "workItem",
    params: { where: "dashboard" }
  });
};

const handleWork = (type: number) => {
  router.push({
    name: "workItem",
    params: { where: "dashboardWork", type }
  });
};

const gotoHome = (id: number | string) => {
  router.push({
    name: "projectHome",
    query: { productId: id },
    params: { where: "dashboard" }
  });
};

// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  if (route.path === "/workbench/dashboard") {
    if (!val) {
      // getDashboard();
    }
  }
});

onMounted(() => {
  getDashboard();
  getParticipates();
});
</script>

<style lang="less" scoped>
.dashboard-foot {
  width: 100%;
  height: 380px;
  // min-height: 200px;
  overflow-x: hidden;
  overflow-y: scroll;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .title {
    padding-left: 10px;
    font-size: 14px;
    color: #444;
    width: 100%;
    line-height: 56px;
  }
  .project-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    overflow-x: scroll;
    margin-top: -10px;
    position: relative;
    &::-webkit-scrollbar-thumb {
      background-color: #fff;
    }
    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: #a5ccc4;
      }
    }
    .project-item {
      padding: 8px 0px 0px 0px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 110px;
      width: 110px;
      cursor: pointer;
      &:hover {
        background-color: #f2f5f9;
      }
      img {
        width: 54px;
        height: 54px;
        border-radius: 11px;
      }
      .name {
        font-size: 14px;
        color: #444;
        width: 85%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 12px 0px 10px 0px;
      }
    }
    // .project-item:last-child:nth-child(4n - 1) {
    //   margin-right: calc(24% + 4% / 3);
    // }
    // .project-item:last-child:nth-child(4n - 2) {
    //   margin-right: calc(48% + 8% / 3);
    // }
  }

  .project-statistics {
    padding-bottom: 0px;
    .title {
      line-height: 40px;
      padding-top: 8px;
    }
  }

  .statistics-list {
    display: grid;
    grid-template-rows: repeat(2, 80px);
    grid-template-columns: repeat(3, 30%);
    grid-gap: 0px;
    justify-content: center;
    // margin-bottom: 10px;
    .statistics-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    }
    .desc {
      padding-bottom: 10px;
      font-size: 14px;
    }
    .item-1 {
      border-bottom: 1px dashed #d3d0d0;
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #1f1f1f;
      }
    }
    .item-2 {
      border-left: 1px dashed #d3d0d0;
      border-bottom: 1px dashed #d3d0d0;
      cursor: pointer;
      &:hover {
        background-color: #f2f5f9;
      }
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #1f1f1f;
      }
    }
    .item-3 {
      border-left: 1px dashed #d3d0d0;
      border-bottom: 1px dashed #d3d0d0;
      cursor: pointer;
      &:hover {
        background-color: #f2f5f9;
      }
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
    .item-4 {
      border-right: 1px dashed #d3d0d0;
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #096;
      }
    }
    .item-5 {
      border-right: 1px dashed #d3d0d0;
      cursor: pointer;
      &:hover {
        background-color: #f2f5f9;
      }
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
    .item-6 {
      .number {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}
</style>
