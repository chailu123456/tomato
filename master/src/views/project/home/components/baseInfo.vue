·
<!--
 * @Author: 宋绍华
 * @Date: 2022-05-13 11:46:31
 * @LastEditTime: 2022-08-17 16:08:43
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\project\home\components\baseInfo.vue
-->
<template>
  <div class="baseInfo">
    <!-- 基本信息 -->
    <div class="baseInfo-left">
      <div class="baseInfo-left-top">
        <span class="baseInfo-text">基本信息</span>
        <div class="baseInfo-left-top-link">
          <span @click="linkToPage(0)"
            ><el-icon><document /></el-icon>接口文档</span
          >
          <span @click="linkToPage(1)"
            ><el-icon><Tools /></el-icon>模块管理</span
          >
          <span @click="linkToPage(2)"
            ><el-icon><setting /></el-icon>设置</span
          >
        </div>
      </div>

      <div class="baseInfo-left-center">
        <img :src="currentRt.info?.logo || currentRt.normalLogo" alt="log" />
        <div class="baseInfo-left-center-content">
          <div class="baseInfo-left-center-content-titles">
            <h3>{{ currentRt.info?.name }}</h3>
            <span v-for="n in currentRt.tips" :class="`${n.open ? 'baseInfo-left-center-content-s-highlight' : ''} baseInfo-left-center-content-s`" :key="n.id"
              >{{ n.label }}-{{ n.open ? "开" : "关" }}</span
            >
          </div>
          <div class="baseInfo-left-center-content-desc">
            {{ currentRt.info?.staff_name }} 创建于 {{ currentRt.info?.create_time }} · 项目负责人：{{ currentRt.info?.manager_staff_name }}
          </div>
        </div>
      </div>

      <div class="baseInfo-left-bottom">
        <span class="baseInfo-text">项目备注</span>
        <div class="baseInfo-left-bottom-desc">
          <div :class="{ 'empty-text': !currentRt.info?.remark }" v-html="currentRt.info?.remark || '暂无备注'"></div>
        </div>
      </div>
    </div>
    <!-- 进度信息 -->
    <div class="baseInfo-right">
      <div class="baseInfo-right-top">
        <span class="baseInfo-text">进度信息</span>
        <div class="baseInfo-right-content">
          <div class="baseInfo-right-content-item" v-for="n in currentRt.statistics" :key="n.id">
            <span>{{ n.label }}</span>
            <span @click="linkToPage(3, n)">{{ n.val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <module-manage-dialog v-model:moduleModal="moduleModal"></module-manage-dialog>
</template>

<script lang="ts">
import { ref } from "vue";
import { IndicatorsResp, ProductDetailsResp } from "@/composables/useHomePage";
import router from "@/router";
import { Setting, Document, Tools } from "@element-plus/icons";
import { PropType, reactive, defineProps, watch } from "vue";
export default {
  name: "baseInfo"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  detail: {
    type: Object as PropType<ProductDetailsResp | null>,
    default: null
  },
  indicators: {
    type: Object as PropType<IndicatorsResp | null>,
    default: null
  },
  productId: {
    type: Number,
    default: 0
  }
});

const moduleModal = ref(false);
const currentRt = reactive<{
  tips: { label: string; open: boolean; id: number }[];
  statistics: Record<string, any>[];
  normalLogo: string;
  info: ProductDetailsResp | null;
}>({
  tips: [
    {
      label: "需求审批",
      open: false,
      id: 0
    },
    {
      label: "邮件汇报",
      open: false,
      id: 1
    },
    {
      label: "机器人提醒",
      open: false,
      id: 2
    }
  ],
  statistics: [
    {
      label: "未完成任务数",
      val: 0,
      id: 0,
      path: "/project/exploitation",
      status: [0, 1], // 任务： 0未开始;1进行中， 4已延期
      type: "un_finished_task_hours"
    },
    {
      label: "未完成需求",
      val: 0,
      id: 1,
      path: "/project/product/demandPool",
      status: [2, 4, 5, 6, 7], // 2.已审核(待开始)   4.设计中, 5.设计完成(待评审), 6.已评审(待开发), 7.开发中
      type: "un_finished_demand_count"
    },
    {
      label: "进行中迭代",
      val: 0,
      id: 2,
      path: "/project/iteration/homepage",
      type: "doing_iteration_count"
      // status: [1, 2, 3, 4, 5, 8] // 1设计中，2开发中，3联调中，4测试中，5待发版，8待测试
    },
    {
      label: "未关闭缺陷",
      val: 0,
      id: 3,
      path: "/project/test",
      status: [0, 1, 2, 4, 5, 6], // 0待解决;1进行中;2已解决;4延期处理;5不予处理;6重新打开;
      type: "un_closed_bug_count"
    }
  ],
  normalLogo: require("@/assets/collapse-logo.png"),
  info: null
});

watch(
  () => props.indicators,
  () => {
    if (props.indicators) {
      currentRt.statistics.forEach((item) => {
        item.val = props.indicators![item.type as keyof IndicatorsResp] || 0;
      });
    }
  },
  {
    immediate: true,
    deep: true
  }
);

watch(
  () => props.detail,
  (newVal) => {
    currentRt.info = props.detail;
    if (props.detail) {
      const { is_approval, is_report, is_robot } = props.detail;
      const arr = [is_approval, is_report, is_robot];
      currentRt.tips.forEach((item) => {
        item.open = arr[item.id] === 1;
      });
    }
  },
  {
    deep: true,
    immediate: true
  }
);

// 跳转
const linkToPage = (index: number, item?: typeof currentRt.statistics[0]) => {
  if (index === 0) {
    window.open("/project/interfaceDoc?productId=" + props.productId, "_blank");
  } else if (index === 1) {
    moduleModal.value = true;
    // window.open("/project/settingProject/moduleManage?productId=" + props.productId, "_blank");
  } else if (index === 2) {
    window.open("/project/settingProject/baseInfo?productId=" + props.productId, "_blank");
  } else if (index === 3 && item) {
    router.push({
      path: item.path,
      query: {
        status: item.status?.toString(),
        where: "home"
      }
    });
  }
};
</script>
<style lang="less" scoped>
.baseInfo {
  display: flex;

  &-left {
    flex: 2;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    height: 220px;
    box-sizing: border-box;

    &-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 24px;
      line-height: 24px;

      &-link {
        color: #999;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        span {
          cursor: pointer;
          border-radius: 4px;
          border: 1px solid #ccc;
          height: 22px;
          line-height: 22px;
          padding: 0px 8px;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          &:first-child {
            margin-right: 10px;
          }
          &:last-child {
            margin-left: 10px;
          }
          i {
            margin-right: 4px;
          }
          &:hover {
            color: #333;
          }
        }
      }
    }

    &-center {
      display: flex;
      align-items: center;
      margin-top: 10px;

      &-content {
        display: flex;
        flex-direction: column;
        margin-left: 15px;

        &-titles {
          display: flex;
          align-items: center;

          h3 {
            margin: 0;
          }
        }

        &-s {
          font-size: 12px;
          padding: 4px 6px;
          border-radius: 2px;
          color: #666;
          background-color: #d3dfdd;
          margin-left: 5px;
          transform: scale(0.9);

          &-highlight {
            background-color: #f0f9eb;
          }
        }

        &-desc {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }
      }

      img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
      }
    }

    &-bottom {
      margin-top: 15px;

      &-desc {
        margin-top: 10px;
        max-height: 80px;
        overflow-y: scroll;
        word-break: break-all;
        font-size: 13px;
        color: #3a3636;
      }
    }
  }
  &-right {
    flex: 1;
    margin-left: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    height: 220px;
    box-sizing: border-box;

    &-content {
      display: grid;
      grid-template-rows: repeat(4, 80px);
      grid-template-columns: repeat(2, 170px);
      grid-gap: 10px;
      justify-content: center;
      margin-top: 10px;

      &-item {
        background-color: #ebf8f6;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        color: #666;
        font-size: 14px;

        span:last-child {
          font-size: 20px;
          color: #222;
          margin-top: 10px;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
            // text-decoration-color: @rp-color-text-link;
          }
        }
      }
    }
  }

  &-text {
    font-size: 14px;
    color: #444;
  }
}
</style>
