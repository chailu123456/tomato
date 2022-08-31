<template>
  <div class="week-items" v-if="item.start_date">
    <span class="week-items__title">{{ years }}第{{ week }}周（{{ item.start_date }}-{{ item.end_date }}）</span>
    <div class="week-items__body" v-if="item.is_fill">
      <div class="week-items__body-side">
        周计划：
        <div class="week-items__body-side__val" v-if="item.plan" v-html="item.plan"></div>
        <div class="week-items__body-side__empty" v-else>
          <el-empty description="未填写"></el-empty>
        </div>
      </div>
      <div class="week-items__body-side">
        周总结：
        <div class="week-items__body-side__val" v-if="item.summary" v-html="item.summary"></div>
        <div class="week-items__body-side__empty" v-else>
          <el-empty description="未填写"></el-empty>
        </div>
      </div>
    </div>
    <el-empty v-else description="未填写周报"></el-empty>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { WeekReportItemInter } from "@/composables/useIteration";
import { computed, defineProps, withDefaults } from "vue";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
export default {
  name: "week-items"
};
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    item: WeekReportItemInter;
  }>(),
  {
    // item: {
    //   end_date: '',
    //   is_fill: false,
    //   iteration_id: 0,
    //   plan: ''
    //   start_date: '',
    //   summary: '',
    //   week: 0
    // }
  }
);
const week = computed(() => {
  if (!props.item.start_date) return "";
  return (dayjs(props.item.start_date) as any).week();
});

const years = computed(() => {
  return dayjs(props.item.start_date).format("YYYY");
});
</script>
<style lang="less">
.week-items {
  margin-bottom: 20px;
  &__title {
    display: inline-block;
    margin: 10px 0;
  }
  &__body {
    display: flex;
    padding: 5px;
    position: relative;
    border: 1px solid #ddd;
    min-height: 100px;
    max-height: 200px;

    &::after {
      content: "";
      position: absolute;
      width: 1px;
      height: 100%;
      left: 50%;
      top: 0;
      background-color: #ddd;
    }

    &-side {
      width: 50%;
      height: inherit;

      &:last-child {
        padding-left: 10px;
      }

      &__empty {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      &__val {
        overflow-y: scroll;
        word-break: break-all;
        height: 90%;
        white-space: break-spaces;
      }
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
  }

  .el-empty {
    padding: 0;
  }
  .el-empty__image {
    width: 100px;
  }
  .el-empty__description {
    p {
      color: #9a9a9a;
    }
  }
}
</style>
