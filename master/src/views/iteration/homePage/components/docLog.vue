<template>
  <el-dialog v-model="visibleLog" title="更多信息" width="50%" :before-close="beforeClose">
    <div class="dynamic-msg">
      <span>所属合集：{{ activities.folder_name || "无" }}</span>
      <span>关联计划：{{ activities.plan_names || "无" }}</span>
      <span>关联迭代：{{ activities.iteration_names || "无" }}</span>
    </div>
    <div class="dynamic-list" :style="{ height: '340px', overflow: 'scroll' }">
      <span class="dynamic-name">动态</span>
      <div class="dynamic-log" v-if="activities.list && activities.list.length">
        <el-timeline>
          <el-timeline-item color="#d3dfdd" v-for="(activity, index) in activities.list" :key="index">
            {{ activity.create_time }}
            {{ activity.staff_name }}
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else>暂无动态数据</div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, ref, watch } from "vue";

export default defineComponent({
  name: "docLog"
});
</script>

<script lang="ts" setup>
import useDemandDoc, { DemandLog } from "@/composables/useDemandDoc";

const emit = defineEmits(["update:visibleLog"]);
const { useGetDocLog } = useDemandDoc();

const props = defineProps({
  showMore: {
    type: Boolean,
    default: false
  },
  visibleLog: {
    type: Boolean,
    default: false
  },
  docId: {
    type: Number,
    default: 0
  }
});

const activities = ref<DemandLog>({});

// 获取日志
const getDocLog = async (params: { id: number }) => {
  let data = await useGetDocLog(params);
  if (data) {
    activities.value = data;
  }
};

watch(
  () => props.visibleLog,
  (newVal) => {
    if (newVal) {
      getDocLog({ id: props.docId });
    }
  }
);
const beforeClose = () => {
  emit("update:visibleLog", false);
};
</script>
<style scoped lang="less">
.dynamic-msg {
  line-height: 26px;
  font-size: 14px;
  margin: 10px 0;
  overflow: hidden;
  span:first-child {
    display: inline-block;
    min-width: 220px;
  }
  span:last-child {
    margin-left: 50px;
  }
}
.dynamic-list {
  position: relative;
  height: 120px;
  // max-height: 300px;
  overflow: hidden;
  display: flex;
  .dynamic-name {
    width: 40px;
  }
  .dynamic-log {
    width: calc(100% - 50px);
    .el-timeline {
      margin-top: 6px;
    }
  }
  .more-dynamic {
    color: blue;
    position: absolute;
    right: 100px;
    top: 90px;
    i {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      transform: rotate(90deg);
    }
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
