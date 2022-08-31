<!--
 * @Author: 宋绍华
 * @Date: 2022-01-20 10:11:17
 * @LastEditTime: 2022-04-16 16:30:10
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\approval\editRecord.vue
-->
<template>
  <div class="record">
    <span
      >审批记录<span style="margin-left: 10px; color: #999; font-size: 12px"> {{ tipLogs }}</span></span
    >
    <div class="record-body">
      <span v-if="!logs.length" class="record-text">暂无记录</span>
      <div class="record-list" v-else>
        <div class="record-list__item" v-for="item in logs" :key="item.id">
          <p class="record-list__item-p">
            <el-avatar class="record-list__item-inner" :src="item.staff_avatar"></el-avatar>
            <span class="record-list__item-inner record-list__item-inner2">{{ item.staff_name }}</span>
            <span class="record-list__item-inner record-list__item-inner2">{{ statusVal(item.status) }}</span>
            <span class="record-list__item-inner record-list__item-inner2">{{ item.create_at }}</span>
          </p>
          <p class="record-list__item-p">{{ item.advice }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DemandApprovalLog } from "@/types/interface";
import { computed, defineProps, withDefaults } from "vue";
export default {
  name: "editRecord"
};
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    logs: DemandApprovalLog[];
    tipLogs: string;
  }>(),
  {
    logs: () => [],
    tipLogs: ""
  }
);

const statusVal = computed(() => (status: number) => {
  const arr = ["审批中", "已通过", "已终止", "不同意", "已撤回"];
  return arr[status - 2];
});
</script>

<style lang="less" scoped>
.record {
  margin-top: 10px;

  &-body {
    padding: 10px 15px;
  }

  &-text {
    font-size: 14px;
    color: #999;
  }

  &-list {
    &__item {
      border: 1px solid #ddd;
      padding: 10px;
      display: flex;
      align-items: center;
      flex-direction: column;
      border-radius: 4px;
      margin-bottom: 10px;

      &-p {
        padding: 0;
        margin: 0;
        width: 100%;
        display: flex;
        align-items: center;
        &:first-child {
          margin-bottom: 5px;
        }
        &:last-child {
          margin-left: 115px;
          margin-left: 60px;
          width: 96%;
        }
      }

      &-inner {
        &2 {
          width: 80px;
        }
        &:first-child {
          margin-right: 20px;
        }
        &:last-child {
          width: 200px;
        }

        &:nth-child(3) {
          color: #000;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
