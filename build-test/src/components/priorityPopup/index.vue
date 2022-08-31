<!--
 * @Author: 宋绍华
 * @Date: 2022-01-13 14:46:21
 * @LastEditTime: 2022-05-22 20:19:48
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\priorityPopup\index.vue
-->
<template>
  <div class="rp-dropdown-select" tip="可编辑">
    <el-dropdown trigger="click" popper-class="dropdown-select" @command="onCommand">
      <div class="el-dropdown-link">
        <p class="index-priority" v-if="type" :style="{ color: userMsg?.name === item[keyVal] ? 'red' : '' }">{{ item[keyVal] }}</p>
        <div v-else>
          <p
            v-if="objIndex"
            class="index-priority"
            :style="{
              fontSize: '12px',
              color: filterPriority[item[keyVal] - 1]?.color ? filterPriority[item[keyVal] - 1].color : '#dd0101'
            }"
          >
            {{ item[keyVal] ? filterPriority[item[keyVal] - 1][slideKey] : "-" }}
          </p>
          <p
            v-else
            class="index-priority"
            :style="{
              fontSize: '12px',
              color: filterPriority[item[keyVal]]?.color ? filterPriority[item[keyVal]].color : '#dd0101'
            }"
          >
            {{ filterPriority[item[keyVal]][slideKey] || "-" }}
          </p>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="n" v-for="n in filterPriority" :key="n.id" :disabled="n.disabled">{{ n[slideKey] }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
export default {
  name: "PriorityPopup"
};
/**
 * 表格快速修改优先级、状态、指派人等等 已全局注册，直接使用即可
 * item: 当前表格行内容
 * slideData: 下拉选项列表
 * type: 类型判断(具体参考需求池,type值存在代表是指派给、工时操作)
 * keyVal: 当前字段key值
 * slideKey: 下拉列表读取当前字段key值
 * changePriority： 事件传递
 * objIndex 下来数据value（可以是id等等其它）从0开始还是1开始，如下a和b
 *  例如 a= [{
        value: 0,
        label: "未开始",
        color: "#e6a23c"
      },
      {
        value: 1,
        label: "进行中",
        color: "#49b513"
      }]
      b= [{
      {
        value: 1,
        label: "进行中",
        color: "#49b513"
      },{
        value: 1,
        label: "已上线",
        color: "#49b513"
      }]
 * 用法：<PriorityPopup :item="scoped.row" keyVal="demand_status" slideKey="label" :slideData="DEMAND_STATUS" @changePriority="onChangePriority" />
 *  可去需求池模块查看例子
 * */
</script>

<script lang="ts" setup>
import { defineProps, computed, defineEmits } from "vue";
import { PRIORITYINTER } from "@/types/interface";
import { getSession } from "@/utils";
import { USER } from "@/store/state";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  },
  slideData: {
    type: Array,
    default: () => []
  },
  objIndex: {
    type: String,
    default: () => "1"
  },
  keyVal: {
    type: String,
    default: () => ""
  },
  type: {
    type: String,
    default: () => ""
  },
  slideKey: {
    type: String,
    default: () => "value"
  }
});
const emit = defineEmits(["changePriority"]);
const userMsg = getSession("user", true) as USER;
// 过滤下当前值
const filterPriority: Record<string, any> = computed(() => props.slideData);

// 切换优先级
const onCommand = (val: PRIORITYINTER) => {
  emit("changePriority", val, props.item, props.type);
};
</script>

<style lang="less" scoped>
.el-dropdown-link {
  cursor: pointer;
}

.index-priority {
  position: relative;
  font-size: 12px;
  display: block;
  margin-left: -6px;
  :deep(.el-dropdown-menu__item) {
    padding: 2px 32px !important;
  }
}
.rp-dropdown-select {
  width: 80%;
  margin-left: 2%;
  border: 1px solid transparent;

  .el-dropdown {
    height: 26px;
    line-height: 4px;
  }
  &:hover {
    border-color: #dcdfe6;
    border-radius: 4px;
    background: #fff;
    .index-priority {
      // margin-left: -8px;
      &::before {
        content: "";
        width: 0;
        height: 0;
        border-top: 5px solid #605353;
        border-right: 4px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 4px solid transparent;
        position: absolute;
        right: -15px;
        top: 100%;
        transform: translateY(-50%);
      }
    }
  }
}

:global(.dropdown-select .el-dropdown__list) {
  max-height: 400px;
  overflow-y: scroll;
}
</style>
<style lang="less">
.dropdown-select {
  position: relative;
  display: block;
  .el-dropdown-menu__item {
    padding: 6px 32px !important;
  }
}
</style>
