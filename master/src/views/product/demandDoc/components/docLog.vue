<!--
 * @Author: 宋绍华
 * @Date: 2022-08-16 09:14:23
 * @LastEditTime: 2022-08-16 19:11:34
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\demandDoc\components\docLog.vue
-->
<template>
  <div class="dynamic-msg">
    <div>
      所属合集：
      <el-tooltip v-if="activities.folder_name" class="box-item" effect="dark" :content="activities.folder_name" placement="top-start">
        <span class="log-title">{{ activities.folder_name }}</span>
      </el-tooltip>
      <span v-else>无</span>
    </div>
    <div>
      关联计划：<el-tooltip v-if="activities.plan_names" class="box-item" effect="dark" :content="activities.plan_names" placement="top-start">
        <span class="log-title">{{ activities.plan_names }}</span>
      </el-tooltip>
      <span v-else>无</span>
    </div>
    <div>
      关联迭代：
      <el-tooltip v-if="activities.iteration_names" class="box-item" effect="dark" :content="activities.iteration_names" placement="top-start">
        <span class="log-title">{{ activities.iteration_names }}</span>
      </el-tooltip>
      <span v-else>无</span>
    </div>
  </div>
  <div class="dynamic-list">
    <span class="dynamic-name">动态</span>
    <div class="dynamic-log" v-if="activities.list && activities.list.length && len">
      <el-timeline>
        <el-timeline-item color="#d3dfdd" v-for="(activity, index) in activities.list" :key="index">
          {{ activity.create_time }}
          {{ activity.staff_name }}
          {{ activity.content }}
          <span class="more-dynamic-text" @click="handleMoreLog" v-if="index === 2 && len >= 4 && !showMore"
            >更多动态 <i class="iconfont icon-xiangxiajiantou"></i
          ></span>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div v-else>暂无动态数据</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineProps, defineEmits } from "vue";

export default defineComponent({
  name: "docLog"
});
</script>

<script lang="ts" setup>
const emit = defineEmits(["lookMore"]);
defineProps({
  showMore: {
    type: Boolean,
    default: false
  },
  activities: {
    type: Object,
    default: () => {
      return {};
    }
  },
  len: {
    type: Number,
    default: 0
  }
});

const handleMoreLog = () => {
  emit("lookMore", true);
};
</script>
<style scoped lang="less">
.more-dynamic-text {
  font-size: 14px;
  color: #1890ff;
  margin-left: 10px;

  i {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
