<template>
  <div class="calendar-slot-tasks">
    <el-dialog v-model="visible" append-to-body :title="title" width="30%" :before-close="beforeClose">
      <div class="calendar-slot-tasks">
        <p @click="handleItem(item)" class="calendar-slot-tasks__item" v-for="item in list" :key="item.id">
          <span class="calendar-slot-tasks__item-span type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
          <span :class="item.status === 3 ? 'calendar-slot-tasks__item-pass' : ''">{{
            item.type === 1 ? `${item.name}-${item?.iteration_node}` : item.name
          }}</span>
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import useDashboard from "@/composables/useDashboard";
import { CalendarItemInter } from "@/composables/useDashboard";
// import type { DialogType } from "@/composables/useDashboard";
import dayjs from "dayjs";
import { defineProps, defineEmits, computed, PropType } from "vue";
// import { updateInterId } from "../useMixin";
import { WORK_TYPE } from "@/utils/index";

export default {
  name: "calendar-slot-tasks"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:tasksVisible", "handleItem", "lookDetail"]);

const props = defineProps({
  tasksVisible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  },
  list: {
    type: Array as PropType<CalendarItemInter[]>,
    default: () => []
  }
});
// const textArr = ref(["迭代", "任务", "bug", "待办"]);
// const dialogType: DialogType[] = ["iteration", "task", "bug", "abeyancen"];

const { useHandleProductCache, productList } = useDashboard();
// 不要删掉这个，如果这样转，生产会报错
const visible = computed(() => props.tasksVisible);

const title = computed(() => {
  const { day } = props.data;

  return `${dayjs(day).format("YYYY[年]M[月]D[日]工作项")}`;
});

const beforeClose = () => {
  emit("update:tasksVisible", false);
};

const statusType = (status: number, type: number) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (type) {
    return { background: list?.color };
  } else {
    return list?.label;
  }
};

const handleItem = async (item: CalendarItemInter) => {
  if (!productList.length && item.type !== 4) {
    const isSucc = await useHandleProductCache(item.product_id);
    if (!isSucc) return;
  }
  if (item.type === 4) {
    emit("handleItem", item);
  } else {
    emit("lookDetail", item);
    // updateInterId(item);
  }
  beforeClose();
};
</script>
<style scoped lang="less">
.type-status-tag {
  display: inline-block;
  padding: 0 7px;
  font-size: 10px;
  line-height: 18px;
  white-space: nowrap;
  border-radius: 3px;
  line-height: 18px;
  margin-right: 10px;
  float: left;
  color: #fff;
}
.calendar-slot-tasks {
  &__item {
    cursor: pointer;
    &-span {
      // display: inline-block;
      // background-color: #6890ec;
      // font-size: 12px;
      // color: #fff;
      // padding: 0 3px;
      // margin-right: 10px;
      background-color: #6890ec;
      display: inline-block;
      padding: 0 7px;
      font-size: 12px;
      line-height: 18px;
      white-space: nowrap;
      border-radius: 10px;
      line-height: 18px;
      color: #fff;
      margin-right: 10px;
    }
    &-name {
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }

    &-pass {
      color: #999;
    }

    &-task {
      background-color: #7fad0a;
    }
    &-iteration {
      background-color: #344844;
    }
    &-bug {
      background-color: #ff777e;
    }
  }
}
</style>

<style lang="less">
.calendar-slot-tasks {
  max-height: 500px;
  overflow-y: scroll;
  .el-dialog__body {
    padding: 0 20px 10px;
  }
  .el-dialog__header {
    padding: 10px 20px 10px;
  }
  .el-dialog__headerbtn {
    top: 15px;
  }
}
</style>
