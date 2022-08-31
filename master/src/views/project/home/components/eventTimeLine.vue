<!--
 * @Author: 宋绍华
 * @Date: 2022-05-13 16:58:54
 * @LastEditTime: 2022-07-25 15:18:11
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\project\home\components\eventTimeLine.vue
-->
<template>
  <div class="timeLine">
    <span class="timeLine-title">事件时间轴 </span>

    <el-scrollbar ref="scrollbar" class="timeLine-scrollbar">
      <div class="timeLine-line" :style="`width: ${timelinesWidth}px`">
        <div class="timeLine-line-item" :class="{ 'timeLine-line-item-last': idx === timelines.length - 1 }" v-for="(item, idx) in timelines" :key="idx">
          <el-tooltip v-if="![1, 2, 3, 5].includes(item.type)" :offset="10" effect="light" placement="top" :content="contentHtml(item)" raw-content>
            <span class="timeLine-line-item-dolt"></span>
          </el-tooltip>
          <span v-else class="timeLine-line-item-dolt"></span>
          <div class="timeLine-line-item-content">
            <span>{{ ![1, 2, 3, 5].includes(item.type) && !item.title.includes("v") ? "v" : "" }}{{ item.title }}</span>
            <span>{{ item.datetime }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { TimelineResp } from "@/composables/useHomePage";
import { PropType, defineProps, computed, ref, watch } from "vue";

export default {
  name: "eventTimeLine"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  timelines: {
    type: Array as PropType<TimelineResp[]>,
    default: () => []
  }
});
const scrollbar = ref();
let timer: ReturnType<typeof setTimeout>;
// 当前切换个数
// timeliness总宽度
const timelinesWidth = computed(() => 270 * (props.timelines.length - 1) || 1);

watch(
  () => props.timelines,
  (newVal) => {
    if (newVal) {
      if (timer) clearTimeout(timer);
      // 滚动到最右边
      timer = setTimeout(() => {
        scrollbar.value.setScrollLeft(1000000);
      }, 300);
    }
  },
  {
    immediate: true,
    deep: true
  }
);
const contentHtml = (row: TimelineResp) => {
  const { title, manager_name, start_time, end_time, real_end_time, real_start_time } = row;
  return `
    <span>${!title.includes("v") ? `v${title}` : title}</span><br/>
    <span>预计：${start_time ? `${start_time} - ${end_time}` : "暂无排期"}</span><br/>
    <span>实际：${real_start_time} - ${real_end_time}</span><br/>
    <span>负责人：${manager_name}</span>
  `;
};
</script>
<style lang="less" scoped>
.timeLine {
  margin-top: 10px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  position: relative;

  &-title {
    font-size: 14px;
    color: #444;
  }

  &-icon {
    &-arrow {
      font-size: 24px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: #666;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
    }
    &-left {
      left: 10px;
    }
    &-right {
      right: 10px;
    }
  }

  &:hover {
    .timeLine-icon-arrow {
      opacity: 1;
      z-index: 1;
    }
  }

  &-scrollbar {
    padding: 20px 0;
  }

  &-line {
    display: flex;
    padding-left: 20px;
    // overflow-x: scroll;

    &-item {
      width: 270px;
      border-top: 3px solid #ddd;
      position: relative;
      margin-top: 10px;

      &-last {
        border-color: transparent;
        min-width: 70px;
        max-width: 100px;
      }

      &-dolt {
        cursor: pointer;
        position: absolute;
        top: -9px;
        left: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: var(--el-color-primary-light-3);
        transition: background-color 0.3s;

        &:hover {
          background-color: #87e1cf;
        }
      }

      &-content {
        margin-top: 10px;
        display: flex;
        flex-direction: column;

        span {
          font-size: 14px;
          line-height: 1.5;
          &:last-child {
            font-size: 12px;
            color: #444;
          }
        }
      }
    }
  }
}
</style>
