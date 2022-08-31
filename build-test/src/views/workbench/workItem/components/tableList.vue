<template>
  <Fragment>
    <page-table
      :tableData="tableData.list"
      :currentPage="page"
      @handlePagationChange="getData"
      :total="tableData.total"
      ref="pageTableRef"
      :stopAutoGetData="stopAutoGetData"
    >
      <template #main>
        <el-table-column prop="name" class-name="table-column-left table-title" label="名称">
          <template #default="scope">
            <span class="type-status-tag" :style="statusType(scope.row.type, 1)">{{ statusType(scope.row.type, 0) }}</span>
            <span class="project-title" @click="handleBtn(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" width="220" label="状态">
          <template #default="scope">
            <span :style="typeShow(scope.row.status, 1)">{{ typeShow(scope.row.status, 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="role" width="280" label="预计完成时间">
          <template #default="scope">
            <span :style="stypeStatus(scope.row)"
              >{{ dayjs(scope.row.start_time).format("YYYY-MM-DD HH:mm") }}
              {{ scope.row.end_time ? "- " + dayjs(scope.row.end_time).format("YYYY-MM-DD HH:mm") : "" }}</span
            >
          </template>
        </el-table-column>
      </template>
    </page-table>
    <HandleWaitDialog :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" @show="onShow" @updateData="onUpdateData" v-model:visible="visible" />
    <CalendarSlotTips :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" :type="4" @updateData="onUpdateData" v-model:tipsVisible="tipsVisible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
  </Fragment>
</template>
<script lang="ts">
import { ref, defineProps, PropType, watch, reactive, defineEmits } from "vue";
export default {
  name: "tableList"
};
</script>

<script lang="ts" setup>
import { WORK_STATUS, WORK_TYPE } from "@/utils/index";
import type { WorkItemForm } from "@/types/interface";
import type { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "../composables/useFetchSearch";
import type { TableList } from "../../useMixin";
// import { updateInterId } from "../../useMixin";
import CalendarSlotTips from "../../work/calendar-slot-dialog.vue";
import HandleWaitDialog from "../../work/handle-wait-dialog.vue";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import useDashboard from "@/composables/useDashboard";
import dayjs from "dayjs";
import type { BackLogItemInter, BugItemInter, CalendarItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";
import VueEvent from "@/utils/mitt";

const emit = defineEmits(["updateData", "lookDetail"]);
const props = defineProps({
  formParams: {
    // @ts-ignore
    type: Object as PropType<WorkItemForm>
  },
  defaultMenu: {
    type: String,
    default: ""
  }
});
const visible = ref(false);
const personVisible = ref(false);
const tipsVisible = ref(false);
const tipsItem = ref<IterationItemInter | BackLogItemInter | BugItemInter | TaskItemInter>();
const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  day: {},
  type: 4,
  abeyancenEditItem: {} // 待办编辑item
});

const page = ref(1);

// 列表数据
const tableData = reactive<{ list: TableList[]; total: number }>({
  list: [],
  total: 0
});
const pageTableRef = ref<any>();
const stopAutoGetData = ref<boolean>(false);
// 分页以及获取数据
const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
  stopAutoGetData.value = flag == undefined ? false : true;
  page.value = (pagationParams && pagationParams.pageIndex) || 1;

  const { response } = useRequest(useFetchSearch, params || props.formParams);
  const { pagation } = useRenderTable(response);
  let {
    data: { list, count }
  } = await pagation(pagationParams);
  tableData.total = count;
  tableData.list = list;
};
let timer: ReturnType<typeof setTimeout>;
const handleConditionSearch = async () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (props.formParams?.is_drawer) {
      await getData(pageTableRef.value?.getCurrentPage(), true, props.formParams);
    } else {
      pageTableRef.value.setCurrentPage();
      page.value = 1;
      await getData({ pageIndex: 1, pageSize: 20 }, true, props.formParams);
    }
    stopAutoGetData.value = false;
  }, 300);
};
// 监听父组件formParams
watch(
  () => props.formParams,
  () => {
    handleConditionSearch();
  },
  { deep: true, immediate: true }
);
// 监听父组件defaultMenu
watch(
  () => props.defaultMenu,
  () => {
    handleConditionSearch();
  },
  { deep: true, immediate: true }
);

// 工作项时间判断是否延迟
const stypeStatus = (it: Record<string, any>) => {
  if (it.is_delay) return { color: "#ff777e" };
  return { color: "#000" };
};

// 获取工作项状态数据 type存在则返回颜色
const statusType = (status: number, type: number) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (type) {
    return { background: list?.color, color: "#fff", fontSize: "12px", marginRight: "10px" };
  } else {
    return list?.label;
  }
};
// 获取工作项类别数据 type存在则返回颜色
const typeShow = (status: number, type: number) => {
  const typeVal = WORK_STATUS.find((v: { value: number; label: string; color: string }) => v.value === status);
  if (type) {
    return { color: typeVal?.color };
  } else {
    return typeVal?.label || "-";
  }
};
const { useGetBackLogDetail } = useDashboard();
// 获取待办详情
const getBackLogDetail = async (params: { id: number; month?: string }) => {
  const data = await useGetBackLogDetail(params);
  return data;
};
// 列表跳转
const handleBtn = async (item: Record<string, any>) => {
  if (item.type === 4) {
    const data = await getBackLogDetail({ id: item.target_id, month: dayjs(item.start_time).format("YYYY-MM-DD") });
    if (data) {
      curInfo.abeyancenEditItem = data;
      curInfo.day = { day: item.start_time };
      tipsItem.value = data;
      tipsVisible.value = true;
    }
  } else {
    // updateInterId(item);
    emit("lookDetail", item);
  }
};
const onUpdateData = () => {
  emit("updateData");
  tipsVisible.value = false;
  handleConditionSearch();
};

// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  if (!val) handleConditionSearch();
});

// 处理待办
const handleItem = async (item: CalendarItemInter) => {
  visible.value = true;
};

const onShow = (show: boolean) => {
  personVisible.value = show;
};

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.department = department as any;
  curInfo.team_worker = team_worker as any;
  curInfo.selectPerson = selectPerson as any;
};
</script>
<style lang="less" scoped>
.container {
  padding: 0;
}
.project-title {
  color: "#333";
  font-size: 14px;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
}

.project-status {
  width: 30px;
  text-align: center;
  display: inline-block;
  height: 16px;
  line-height: 16px;
  padding: 3px;
  border-radius: 3px;
}
.type-status-tag {
  display: inline-block;
  padding: 0 7px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  border-radius: 10px;
  line-height: 18px;
  margin-right: 10px;
  color: #fff;
  margin-left: 2px;
}
</style>
