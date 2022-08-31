<template>
  <div class="calendar-slot-tasks">
    <el-dialog v-model="visible" append-to-body :title="title" width="30%" :before-close="beforeClose">
      <div class="calendar-slot-tasks">
        <p @click="handleItem(item)" class="calendar-slot-tasks__item" v-for="item in list" :key="item.id">
          <span class="calendar-slot-tasks__item-span" :class="`calendar-slot-tasks__item-${dialogType[item.type - 1]}`">{{ textArr[item.type - 1] }}</span
          ><span :class="item.status === 3 ? 'calendar-slot-tasks__item-pass' : ''">{{
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
import type { DialogType } from "@/composables/useDashboard";
import dayjs from "dayjs";
import { defineProps, defineEmits, computed, PropType, ref } from "vue";
import { useRouter } from "vue-router";
export default {
  name: "calendar-slot-tasks"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:tasksVisible", "handleItem"]);
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
const textArr = ref(["迭代", "任务", "bug", "待办"]);
const dialogType: DialogType[] = ["iteration", "task", "bug", "abeyancen"];
const router = useRouter();

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

const handleItem = async (item: CalendarItemInter) => {
  if (!productList.length && item.type !== 4) {
    const isSucc = await useHandleProductCache(item.product_id);
    if (!isSucc) return;
  }
  switch (item.type) {
    case 1: // 迭代
      {
        router.push({ name: "homepage", query: { productId: item.product_id } });
      }
      break;
    case 2: // 任务
      {
        router.push({
          name: "exploitation",
          query: {
            productId: item.product_id
          }
        });
      }
      break;
    case 3: // bug
      {
        router.push({
          name: "bugDetail",
          query: { bugId: item.target_id, product_id: item.product_id }
        });
      }
      break;
    case 4: // 待办
      emit("handleItem", item);
      break;
  }

  beforeClose();
};
</script>
<style scoped lang="less">
.calendar-slot-tasks {
  &__item {
    cursor: pointer;
    &-span {
      display: inline-block;
      background-color: #016ffc;
      font-size: 12px;
      color: #fff;
      padding: 0 3px;
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
      background-color: #1f9f85;
    }
    &-iteration {
      background-color: #344844;
    }
    &-bug {
      background-color: red;
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
