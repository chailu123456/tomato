<template>
  <Drawer
    v-model:drawer="drawer"
    :title="arrayForm[type]?.name"
    :headerTitle="headerTitle"
    :id="arrayForm[type]?.id"
    @onHandle="onHandle"
    :rich="arrayForm[type]?.description"
    :rich2="arrayForm[type]?.remark"
    :richStatus="richStatus"
    placeholder=""
    :rich2Status="rich2Status"
    :statusList="logData"
    :loading="loading"
  >
    <template #form>
      <template v-if="props.type === 5">
        <form-demand @onChangeTask="onChangeDate" :demandForm="arrayForm[type]"></form-demand>
      </template>
      <template v-else-if="props.type === 2">
        <form-task @onChangeTask="onChangeDate" :demandForm="arrayForm[type]"></form-task>
      </template>
      <template v-else-if="props.type === 3">
        <form-bug
          :drawerForm="arrayForm[type]"
          :bugTypeList="[]"
          :bugStatusList="[]"
          :staffList="[]"
          :levelList="[]"
          :priorityList="[]"
          :envList="[]"
          :iterationList="[]"
          :demandList="[]"
          :taskList="[]"
          :useCaseList="[]"
          :currIterateId="1"
          @onHandle="onChangeDate"
        ></form-bug>
      </template>
    </template>
  </Drawer>
</template>

<script lang="ts">
import { defineComponent, ref, defineExpose, defineProps, watch } from "vue";
import dayjs from "dayjs";
import { getSession } from "@/utils";
import useDashboard from "@/composables/useDashboard";

export default defineComponent({
  name: "workDrawer"
});
</script>
<script lang="ts" setup>
import { getDemandListDetailLog, editDemand } from "@/api/request-modules/product";
import { detailTaskLog, updateBasicTask } from "@/api/request-modules/iteration";
import { getBugDynamic } from "@/api/request-modules/test";
import useMessageTip from "@/composables/useMessageTip";

import Drawer from "@/components/drawer/index.vue";
import formDemand from "../demandForm/index.vue";
import formTask from "../taskForm/index.vue";
import formBug from "../bugForm/index.vue";
import { ResponseParams } from "@/types/response";
interface WangText {
  id?: number[];
  ids?: number[];
  description?: string;
  origin_remark?: string;
  field?: string;
  name?: string;
  content?: string;
  remark?: string;
}

interface LogType {
  create_time?: string;
  info?: string;
  id?: number;
  remark?: string;
}

interface CallBackDrawer {
  id: number;
  headerTitle?: string;
  placeholder?: string;
  rich?: string;
  rich2?: string;
  rich2Status?: string;
  richStatus?: string;
  status_list?: LogType[];
  title: string;
  who?: string;
}

const { tipMessage } = useMessageTip();

const { useGetDemandDetail, useGetTaskDetail, useGetBugDetail } = useDashboard();
// type: 5????????? 2????????? 3???bug
const props = defineProps({
  type: {
    type: Number,
    default: 1
  },
  targetId: {
    type: Number,
    default: 0
  }
});


const curProductInfo = ref(getSession("productInfo", true) as any);
const richStatus = ref("view");
const rich2Status = ref("view");
const loading = ref(false);
// ??????????????????
const headerTitleArr: Record<number, string> = {
  2: "????????????",
  3: "??????Bug",
  5: "????????????"
};

const headerTitle = ref("????????????");

// ????????????????????????
const drawer = ref(false);
const arrayForm = ref<Record<number, any>>({
  5: {
    attachment: [],
    id: undefined,
    collect_time: dayjs().format("YYYY-MM-DD"),
    create_by: "",
    create_time: "",
    creator: "",
    delete_time: "",
    demand_status: curProductInfo.value?.is_approval === 1 ? 1 : 2,
    description: "",
    end_time: "",
    hours: 0,
    iteration_id: null,
    iteration_name: "",
    level: "3",
    type: 1,
    name: "",
    origin: "",
    origin_remark: "",
    origin_staff: "",
    product_id: null,
    product_module_id: 0,
    product_module_name: "??????",
    product_name: "",
    staff_name: "",
    staff_no: "",
    start_time: "",
    status_list: []
  },
  3: {
    id: null,
    env: 1,
    type: 1,
    hours: null,
    level: 1,
    cause: null,
    status: 0,
    task_id: null,
    priority: 3,
    demand_id: null,
    test_case_id: null,
    name: "",
    remark: "",
    staff_no: "",
    task_name: "",
    staff_name: "",
    demand_name: "",
    product_name: "",
    test_case_name: "",
    description: "",
    iteration_id: "",
    iteration_name: "",
    list: [] as Array<Record<string, any>>,
    attachment: [] as Array<Record<string, any>>,
    product_id: null
  },
  2: {
    id: null,
    attachment: [],
    begin_time: dayjs().format("YYYY-MM-DD"),
    status: 0,
    content: "",
    end_time: dayjs().format("YYYY-MM-DD"),
    hours: 0,
    real_hours: 0,
    iteration_id: null,
    iteration_name: "",
    demand_id: null,
    level: "3",
    type: 2,
    name: "",
    product_id: null,
    product_name: "",
    staff_name: "",
    staff_no: "",
    remark: ""
  }
});

const resetDrawerForm = (data: any) => {
  const {
    id,
    env,
    type,
    hours,
    level,
    cause,
    status,
    task_id,
    priority,
    demand_id,
    test_case_id,
    name,
    remark,
    staff_no,
    task_name,
    staff_name,
    demand_name,
    product_name,
    test_case_name,
    iteration_id,
    iteration_name,
    attachment,
    description,
    product_id
  } = data as Record<string, any>;
  // ??????????????????????????????????????????
  arrayForm.value[props.type].env = env ? env : null;
  arrayForm.value[props.type].type = type ? type : null;
  arrayForm.value[props.type].id = id ? id : null;
  arrayForm.value[props.type].level = level ? level : null;
  arrayForm.value[props.type].cause = cause ? cause : null;
  arrayForm.value[props.type].task_id = task_id ? task_id : null;
  arrayForm.value[props.type].priority = priority ? priority : null;
  arrayForm.value[props.type].demand_id = demand_id ? demand_id : null;
  arrayForm.value[props.type].test_case_id = test_case_id ? test_case_id : null;
  arrayForm.value[props.type].iteration_id = iteration_id ? iteration_id : null;
  arrayForm.value[props.type].hours = hours;
  arrayForm.value[props.type].name = name;
  arrayForm.value[props.type].remark = remark;
  arrayForm.value[props.type].staff_no = staff_no;
  arrayForm.value[props.type].status = status;
  arrayForm.value[props.type].task_name = task_name;
  arrayForm.value[props.type].staff_name = staff_name;
  arrayForm.value[props.type].demand_name = demand_name;
  arrayForm.value[props.type].product_name = product_name;
  arrayForm.value[props.type].test_case_name = test_case_name;
  arrayForm.value[props.type].iteration_name = iteration_name;
  arrayForm.value[props.type].attachment = attachment;
  arrayForm.value[props.type].description = description;
  arrayForm.value[props.type].product_id = product_id;
};
// ??????????????????
const logRequest = [
  { type: 2, request: detailTaskLog },
  { type: 3, request: getBugDynamic },
  { type: 5, request: getDemandListDetailLog }
];
const logData = ref([]);
// ??????????????????
const getLog = (id: number) => {
  logRequest.forEach((item) => {
    if (item.type === props.type) {
      item.request(id).then((res: any) => {
        if (res.data && res.data.length) {
          logData.value = res.data;
        } else {
          logData.value = [];
        }
      });
    }
  });
};
// ????????????

const getDataDetial = async (id: number) => {
  // ????????????
  if (props.type === 5) {
    const data = await useGetDemandDetail({ id });
    loading.value = false;
    if (data) {
      arrayForm.value[props.type] = data;
      arrayForm.value[props.type].level = arrayForm.value[props.type].level + "";
      arrayForm.value[props.type].remark = arrayForm.value[props.type].origin_remark;
      arrayForm.value[props.type].iteration_id = arrayForm.value[props.type].iteration_id ? arrayForm.value[props.type].iteration_id : null;
    }
  } else if (props.type === 2) {
    // ????????????
    const data = await useGetTaskDetail(id);
    loading.value = false;
    if (data) {
      arrayForm.value[props.type] = data;
      arrayForm.value[props.type].level = arrayForm.value[props.type].level + "";
      arrayForm.value[props.type].description = arrayForm.value[props.type].content;
      arrayForm.value[props.type].iteration_id = arrayForm.value[props.type].iteration_id ? arrayForm.value[props.type].iteration_id : null;
      arrayForm.value[props.type].demand_id = arrayForm.value[props.type].demand_id ? arrayForm.value[props.type].demand_id : null;
    }
  } else {
    // bug??????
    const data = await useGetBugDetail(id);
    loading.value = false;
    if (data) {
      resetDrawerForm(data);
    }
  }
  await getLog(id);
};

watch(
  () => props.type,
  (newVal) => {
    console.log(newVal);
    console.log(arrayForm.value);
  }
);

// ????????????id,??????????????????
watch(
  () => props.targetId,
  (newVal) => {
    console.log(newVal);
    getDataDetial(newVal);
    loading.value = true;
    headerTitle.value = headerTitleArr[props.type];
  }
);

// ????????????
const handleDrawerVisble = (visible: boolean) => {
  drawer.value = visible;
};
// ??????????????????(????????????????????????)
const updateDemand = (params: WangText) => {
  editDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      getLog(props.targetId);
      return tipMessage(200, "??????");
    }
  });
};
// ??????--(????????????????????????)---??????
const demandOption = async (currentRt: CallBackDrawer, who: string) => {
  if (who === "title") {
    const obj: WangText = {
      id: [currentRt.id],
      field: "name",
      name: currentRt.title
    };
    if (currentRt.title.length < 4 || currentRt.title.length > 100) return tipMessage(400, "?????????4-100?????????????????????");
    arrayForm.value[props.type].name = currentRt.title;
    updateDemand(obj);
    return;
  }
  // who??????????????????????????????????????????
  if (currentRt.who) {
    const obj: WangText = {
      id: [currentRt.id]
    };
    if (currentRt.who === "rich") {
      obj.description = currentRt.rich;
      arrayForm.value[props.type].description = currentRt.rich;
      obj.field = "description";
    } else {
      obj.origin_remark = currentRt.rich2;
      arrayForm.value[props.type].remark = currentRt.rich2;
      obj.field = "origin_remark";
    }
    await updateDemand(obj);
  }
};

// ??????????????????(????????????????????????)
const editTask = async (params: WangText) => {
  updateBasicTask<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      getLog(props.targetId);
      return tipMessage(200, "??????");
    }
  });
};
// ??????--(????????????????????????)---??????
const taskOption = async (currentRt: CallBackDrawer, who: string) => {
  if (who === "title") {
    const obj: WangText = {
      ids: [currentRt.id],
      field: "name",
      name: currentRt.title
    };
    if (!currentRt.title) return tipMessage(400, "??????????????????");

    if (currentRt.title.length < 1 || currentRt.title.length > 50) return tipMessage(400, "?????????1-50?????????????????????");
    arrayForm.value[props.type].name = currentRt.title;
    editTask(obj);
    return;
  }
  // who??????????????????
  if (currentRt.who) {
    const obj: WangText = {
      ids: [currentRt.id]
    };
    if (currentRt.who === "rich") {
      obj.content = currentRt.rich;
      obj.field = "content";
      arrayForm.value[props.type].content = currentRt.rich;
    } else {
      obj.remark = currentRt.rich2;
      obj.field = "remark";
      arrayForm.value[props.type].remark = currentRt.rich2;
    }
    await editTask(obj);
  }
};

// bug--(????????????????????????)---??????
const bugOption = (currentRt: CallBackDrawer, who: string) => {
  console.log(currentRt);
};

// ??????-????????????(????????????????????????)
const onHandle = (type: "save" | "cancel" | "name", currentRt: CallBackDrawer, who: string) => {
  console.log(currentRt);
  if (type === "cancel") {
    return (drawer.value = false);
  }
  if (props.type === 5) {
    // ??????
    demandOption(currentRt, who);
  } else if (props.type === 2) {
    // ??????
    taskOption(currentRt, who);
  } else {
    // bug
    bugOption(currentRt, who);
  }
};

defineExpose({
  handleDrawerVisble: (visible: boolean) => handleDrawerVisble(visible)
});

// ???????????????
const onChangeDate = (id: number) => {
  getLog(id);
};
</script>
<style scoped lang="less"></style>
