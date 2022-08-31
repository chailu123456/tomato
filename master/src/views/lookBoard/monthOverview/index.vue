<template>
  <div class="rp-month-overflow">
    <div class="overflow-content">
      <div class="month-overflow-statistics">
        <div class="statistics-left">
          <el-form :inline="true" :model="searchCriteria">
            <el-form-item>
              <ProductCollect
                :prop-val="boardBaseRt.currentGroupIds"
                :list="boardBaseRt.teamProductList"
                @on-change="onProductChange"
                class="statistics-project"
                ref="productCollect"
              />
            </el-form-item>

            <el-form-item>
              <el-date-picker
                v-model="searchCriteria.month"
                class="statistics-project"
                :clearable="false"
                size="default"
                value-format="YYYY-MM"
                type="month"
                placeholder="选择月"
                :disabled-date="disabledDate"
                @focus="isReaonly = false"
                @change="isReaonly = true"
                ref="datePicker"
                :readonly="isReaonly"
              ></el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <div class="statistics-right">
          <ul class="statistics-tab-list">
            <li class="tab-detail">
              <div class="tab-detail-title">
                <span>发布需求数</span>
              </div>
              <div class="detail-num">{{ tabList.demand_num }}</div>
              <img src="@/assets/intertion.png" alt="" />

              <div class="detail-foot-num">
                <span>本月新增 {{ tabList.new_add_demand_num }} 个，</span>
                <span>开发中 {{ tabList.developing_demand_num }} 个</span>
              </div>
            </li>
            <li class="tab-detail">
              <div class="tab-detail-title">
                <img src="@/assets/demand.png" alt="" />
                <span>开发迭代数</span>
              </div>
              <div class="detail-num">{{ tabList.iteration_num }}</div>
              <div class="detail-foot-num">
                <span>准点率 {{ tabList.iteration_precision_rate }}%，</span>
                <span>已发布 {{ tabList.iteration_released_num }} 个</span>
              </div>
            </li>
            <li class="tab-detail">
              <div class="tab-detail-title">
                <img src="@/assets/task.png" alt="" />
                <span>完成任务工时</span>
              </div>
              <div class="detail-num">{{ tabList.task_hour_num }}</div>
              <div class="detail-foot-num">
                <span>按时完成率 {{ tabList.task_precision_rate }}%，</span>
                <span>延期任务数 {{ tabList.delay_task_num || 0 }} 个</span>
              </div>
            </li>
            <li class="tab-detail">
              <div class="tab-detail-title">
                <img src="@/assets/bug.png" alt="" />
                <span>新增BUG数</span>
              </div>
              <div class="detail-num">{{ tabList.bug_num }}</div>
              <div class="detail-foot-num">
                <span style="margin-left: 4px"> 未关闭 {{ tabList.un_closed_bug_num }} 个，</span>
                <span>严重 {{ tabList.serious_bug_num }} 个</span>
              </div>
            </li>
            <li class="tab-detail">
              <div class="tab-detail-title">
                <img src="@/assets/people.png" alt="" />
                <span>参与迭代成员数</span>
              </div>
              <div class="detail-num">{{ tabList.iteration_user_num }}</div>
              <div class="detail-foot-num">
                <span>项目共 {{ tabList.product_user_num }} 人，</span>
                <span>迭代参与率 {{ tabList.join_iteration_rate }}%</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <hr style="height: 5px; margin-top: 20px; color: #d3d3d3; border: none; border-top: 2px dashed" />
      <div class="month-table-content">
        <div class="overflow-title">
          <span class="title-name">本月迭代</span>
          <span class="right-jump">
            <router-link target="_blank" class="table-link jump-page" :to="`/lookBoard/project/qualityOverview?month=${searchCriteria.month}&where=monthAll`">
              在项目-质量概览中查看
            </router-link>
            <i class="iconfont icon-youjiantou"></i>
          </span>
        </div>
        <div class="month-overflow-iteration month-overflow-quility">
          <QualityOverview :head="false" @count="count" :searchCriteria="searchCriteria" :page="true"></QualityOverview>
        </div>
        <hr style="height: 5px; color: #d3d3d3; border: none; border-top: 2px dashed" />

        <div class="overflow-title">
          <span class="title-name">成员工作质量</span>
          <span class="right-jump">
            <router-link target="_blank" class="table-link jump-page" :to="`/lookBoard/personal/jobEvaluation?month=${searchCriteria.month}`"
              >在人员-工作评估中查看</router-link
            >
            <i class="iconfont icon-youjiantou"></i>
          </span>
        </div>
        <div class="month-overflow-iteration">
          <JobEvaluation :showForm="false" :searchParams="searchCriteria" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from "vue";
import { montnlyStatistics } from "@/api/request-modules/lookboard";
import QualityOverview from "../project/qualityOverview/index.vue";
import VueEvent from "@/utils/mitt";
import JobEvaluation from "../personal/jobEvaluation/index.vue";
import ProductCollect from "@/businessComponents/productCollect/index.vue";

import dayjs from "dayjs";
import useBoardBase from "@/composables/useBoardBase";

type SearchCriteria = {
  month: string;
  product_id: number[];
};
const { disabledDate, boardBaseRt } = useBoardBase();

const isReaonly = ref(false);
const productCollect = ref();
// 获取项目列表，当前项目id
const searchCriteria = reactive<SearchCriteria>({
  month: dayjs().format("YYYY-MM"),
  product_id: []
});

// 顶部tab
const tabList = ref({
  bug_num: 0,
  demand_num: 0,
  developing_demand_num: 0,
  iteration_num: 0,
  iteration_precision_rate: 0,
  iteration_released_num: 0,
  iteration_user_num: 0,
  join_iteration_rate: 0,
  new_add_demand_num: 0,
  product_user_num: 0,
  serious_bug_num: 0,
  task_hour_num: 0,
  task_precision_rate: 0,
  un_closed_bug_num: 0,
  un_fixed_bug_num: 0,
  un_fixed_task_hour_num: 0,
  delay_task_num: 0
});
// 监听项目跟日期进行数据更新
watch(
  () => searchCriteria,
  () => {
    getData();
  },
  {
    deep: true
  }
);

//本月迭代默认最大高度
const qualityHeight = ref(500);
const heightVal: number[] = [150, 128, 121, 118];
// 本月迭代总数 通过总数计算高度
const count = (val: number | null) => {
  if (!val) return (qualityHeight.value = 150);
  if (val && val < 5) {
    qualityHeight.value = heightVal[val - 1] * val;
  } else {
    qualityHeight.value = 578;
  }
};
//成员工作质量默认最大高度
const jobEvaluationVal = ref(840);

// 监听成员工作质量表格总数计算表格高度
VueEvent.on("total", (val: any) => {
  if (!val) {
    return (jobEvaluationVal.value = 150);
  } else {
    if (val < 10 && val > 5) {
      jobEvaluationVal.value = 50 * val;
    } else if (val < 5) {
      jobEvaluationVal.value = 300;
    } else {
      jobEvaluationVal.value = 840;
    }
  }
});

// 获取当前模块数据
const getData = async () => {
  // 获取顶部tab统计
  const { data } = await montnlyStatistics(searchCriteria);

  tabList.value = data;
};

// 筛选项目回调函数
const onProductChange = (vals: number[]) => {
  searchCriteria.product_id = vals;
  boardBaseRt.currentProIds = vals;
  getData();
};
onMounted(() => {
  setTimeout(async () => {
    searchCriteria.product_id = boardBaseRt.currentProIds;
    getData();
  }, 1000);
});
</script>
<style scoped>
:deep(.quality-table) {
  height: v-bind(qualityHeight + "px") !important;
}
</style>
<style scoped lang="less">
.overflow-title {
  display: flex;
  justify-content: space-between;
  height: 24px;
  line-height: 24px;
  position: relative;
  border-left: 6px solid #1f9f85;
  margin: 10px;
  margin-left: 0;
  .right-jump {
    display: inherit;
    .jump-page {
      font-size: 14px;
    }
    .icon-youjiantou {
      color: #409eff;
      display: inline-block;
      font-size: 17px;
    }
    &:hover {
      border-bottom: 1px solid #3370ff;
    }
  }

  span {
    font-size: 14px;
    color: #fff;
  }
  span.title-name {
    color: #000;
    margin-left: 4px;
  }
}
.rp-month-overflow {
  overflow: hidden;
  background: #fff;
  padding: 10px;

  .overflow-content {
    height: 100%;
    overflow-y: scroll;
  }

  .month-overflow-statistics {
    display: flex;
    .statistics-left {
      text-align: center;
      width: 260px;
      background: #e7f8f5;
      box-shadow: 0px 0px 10px #e4e4e4;
      // :deep(.statistics-project) {
      //   display: block;
      //   width: 200px;
      //   .el-input__wrapper {
      //     width: 176px;
      //   }
      // }
      .statistics-project-list {
        margin-left: 30px;
      }
      .el-form {
        margin-top: 14px;
      }
      :deep(.el-select) {
        margin-bottom: 10px;
      }
      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 0;
      }
    }

    .statistics-right {
      width: calc(100% - 280px);
      display: flex;
      margin-left: 20px;
      .statistics-tab-list {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .tab-detail {
          position: relative;
          width: 18%;
          margin: 0 6px;
          padding: 10px 8px;
          border-radius: 4px;
          box-shadow: 0px 0px 10px #e4e4e4;
          background: #e7f8f5;
          img {
            position: absolute;
            width: 45px;
            right: 16px;
            top: 6px;
          }

          .tab-detail-title {
            width: 100%;
            height: 22px;
            overflow: hidden;

            span {
              color: var(--font-color-gray2);

              font-size: 14px;
            }
          }
          .detail-num {
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            margin: 6px 0;
          }
          .detail-foot-num {
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;

            span:first-child {
              color: var(--font-color-gray2);
              font-size: 12px;
            }
            span:last-child {
              font-size: 12px;
              color: var(--font-color-gray2);
            }
          }
        }
      }
    }
    @media screen and (min-width: 1920px) {
      .statistics-left {
        width: 400px;
        :deep(.statistics-project) {
          display: block;
          width: 340px;
          .el-input__wrapper {
            width: 315px;
          }
        }
        .statistics-project-list {
          margin-left: 30px;
        }
      }

      .statistics-right {
        width: calc(100% - 420px);
      }
    }
  }
  .month-table-content {
    :deep(.container) {
      padding: 0 !important;
    }

    .more-view {
      padding: 10px;
      padding-top: 20px;
      position: relative;
      height: 300px;
      background-image: url("https://img02.mockplus.cn/image/2022-04-11/b03bf950-b977-11ec-9748-65122c209bc7.png");
      background-position: right bottom, left top;
      background-repeat: no-repeat, repeat;
      background-size: 100% 100%;
    }
  }
}
</style>
