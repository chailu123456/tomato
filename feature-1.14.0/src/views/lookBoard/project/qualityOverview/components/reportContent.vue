<template>
  <el-dialog :title="iteration.name" v-model="isOpen" top="6vh" width="50%">
    <div class="rp-report-dialog">
      <div class="report-intertion">
        <p class="report-title">迭代内容</p>
        <div v-if="iterationList.length">
          <el-scrollbar max-height="240px">
            <ol class="iteration-list" v-for="item in iterationList" :key="item.name">
              <li style="color: #333">
                <span>{{ item.name }}</span>
                <ol v-for="childItem in item.child_list" :key="childItem.name">
                  <div class="a">
                    {{ childItem.name }}
                  </div>
                </ol>
              </li>
            </ol>
          </el-scrollbar>
        </div>
        <el-empty v-else description="暂无迭代内容"></el-empty>
      </div>

      <p class="report-title">迭代周报</p>
      <div class="report-week-list">
        <WeekItems v-for="n in weeks" :item="n" :key="n.iteration_id" />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isOpen = false">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import type { PropType } from "vue";
import type { WeekReportItemInter } from "@/composables/useIteration";

import { getIterationList } from "@/api/request-modules/lookboard";

import useIteration from "@/composables/useIteration";
import WeekItems from "@/views/iteration/reports/components/week-items.vue";
type Interation = {
  id: number;
  name: string;
};
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  iteration: {
    type: Object as PropType<Interation>,
    default: () => ({})
  }
});
const emit = defineEmits(["update:visible"]);
const weeks = ref<WeekReportItemInter[] | null>(null);
const iterationList: any = ref([]);
const { getWeekReportsList } = useIteration();
// 控制显示隐藏弹框
const isOpen = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
// 获取报告list
const getList = async (id: number) => {
  const data = await getWeekReportsList(id);
  if (data) {
    weeks.value = data;
  } else {
    weeks.value = [];
  }
  const IterationData: any = await getIterationList({ iteration_id: id });
  if (IterationData.data) {
    iterationList.value = IterationData.data;
  } else {
    iterationList.value = [];
  }
};
watch(
  () => props.iteration.id,
  () => {
    getList(props.iteration.id);
  },
  {
    immediate: true
  }
);
</script>
<style scoped lang="less">
.rp-report-dialog {
  .report-intertion {
    padding-bottom: 10px;
    border-bottom: 1px solid #cecece;
  }
  .report-title {
    color: #000;
    font-size: 14px;
    margin: 8px;
    margin-bottom: 0px;
  }
  .el-empty {
    padding: 0;
    .el-empty__image {
      width: 50px;
    }
  }
  .iteration-list {
    li {
      margin: 6px 0;
      list-style: disc;
    }
  }
  .report-week-list {
    padding: 0 10px;
    max-height: 360px;
    overflow-y: scroll;
  }
  @media screen and (min-width: 1920px) {
    .report-week-list {
      max-height: 560px;
    }
  }
}
</style>
<style>
.el-dialog__body {
  padding: 10px 20px;
}
.el-dialog__footer {
  border-top: 1px solid #ccc;
  padding: 16px 30px;
}
</style>
