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
    :maxlength="100"
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
        <form-bug :drawerForm="arrayForm[type]" :currIterateId="iterationId" @onHandle="onChangeDate"></form-bug>
      </template>
      <template v-else-if="props.type === 9">
        <use-case @onChangeTask="onChangeDate" :demandForm="arrayForm[9]"></use-case>
      </template>
    </template>
  </Drawer>
</template>

<script lang="ts">
import { defineComponent, ref, defineExpose, defineProps, watch, computed, defineEmits } from "vue";
import dayjs from "dayjs";
import { getSession, removeIdFromRouter } from "@/utils";
import useDashboard from "@/composables/useDashboard";

export default defineComponent({
  name: "workDrawer"
});
</script>
<script lang="ts" setup>
import { getDemandListDetailLog, editDemand } from "@/api/request-modules/product";
import { detailTaskLog, updateBasicTask, editUseCaseData, addUseCaseData, useCaseDetail, getCaseLog } from "@/api/request-modules/iteration";
import { updateBug, createBug } from "@/api/request-modules/test";
import { getBugDynamic } from "@/api/request-modules/test";
import useMessageTip from "@/composables/useMessageTip";
import { useStore } from "@/store";
import { USER } from "@/store/state";

import Drawer from "@/components/drawer/index.vue";
import formDemand from "../demandForm/index.vue";
import formTask from "../taskForm/index.vue";
import formBug from "../bugForm/index.vue";
import useCase from "../useCaseForm/index.vue";
import { ResponseParams } from "@/types/response";
import { useRouter } from "vue-router";

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

const user = getSession("user", true) as USER;

const store = useStore();

const { tipMessage } = useMessageTip();
const router = useRouter();
console.log(router.currentRoute.value.name);
const emit = defineEmits(["refresh"]);

const { useGetDemandDetail, useGetTaskDetail, useGetBugDetail } = useDashboard();
// type: 5????????? 2????????? 3???bug 9?????????
const props = defineProps({
  type: {
    type: Number,
    default: 1
  },
  targetId: {
    type: Number,
    default: 0
  },
  productId: {
    type: Number,
    default: 0
  },
  iterationId: {
    type: Number,
    default: 0
  }
});
// ??????id??????
const iterateId = computed(() => store.getters.iterateId);
const currentIter = computed(() => store.getters.currentIter);

const curProductInfo = computed(() => store.getters.productInfo);
const richStatus = ref("view");
const rich2Status = ref("view");
const loading = ref(false);
// ??????????????????
const headerTitleArr: Record<number, string> = {
  2: "????????????",
  3: "??????Bug",
  5: "????????????",
  9: "????????????"
};

const headerTitle = ref("??????");

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
    test_case_name: "",
    description: "",
    iteration_id: "",
    iteration_name: "",
    list: [] as Array<Record<string, any>>,
    attachment: [] as Array<Record<string, any>>,
    product_name: "",
    product_id: props.productId
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
    remark: "",
    description: ""
  },
  9: {
    attachment: [],
    iteration_id: iterateId.value,
    iteration_name: currentIter.value?.name,
    product_id: curProductInfo.value?.id,
    level: 2,
    content: "",
    name: "",
    description: "<p><b>[??????]</b><br/><br/><br/><br/><b>[??????]<br/><br/></b><br/><br/><br/><b>[??????]<br/><br/><br/></b></p>",
    staff_name: user?.name,
    staff_no: user?.staff_no,
    remark: "",
    status: 5,
    type: 1,
    product_module_id: 0,
    product_module_name: curProductInfo.value?.name,
    demand_id: null,
    task_id: null
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
  { type: 5, request: getDemandListDetailLog },
  { type: 9, request: getCaseLog }
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
  } else if (props.type === 3) {
    // bug??????
    const data = await useGetBugDetail(id);
    loading.value = false;
    if (data) {
      resetDrawerForm(data);
    }
  } else if (props.type === 9) {
    const data: any = await useCaseDetail(id);
    loading.value = false;
    if (data.data) {
      arrayForm.value[props.type] = data?.data;
      arrayForm.value[props.type].description = arrayForm.value[props.type].content;
      arrayForm.value[props.type].iteration_id = arrayForm.value[props.type].iteration_id ? arrayForm.value[props.type].iteration_id : null;
      arrayForm.value[props.type].demand_id = arrayForm.value[props.type].demand_id ? arrayForm.value[props.type].demand_id : null;
      arrayForm.value[props.type].task_id = arrayForm.value[props.type].task_id ? arrayForm.value[props.type].task_id : null;
      arrayForm.value[props.type].product_module_id = arrayForm.value[props.type].product_module_id;
      arrayForm.value[props.type].product_module_name = arrayForm.value[props.type].product_module_name;
    }
  }
  await getLog(id);
};

// ??????????????????????????????
const resetUseCase = () => {
  arrayForm.value[9] = {
    attachment: [],
    iteration_id: iterateId.value,
    iteration_name: currentIter.value.name,
    product_id: curProductInfo.value?.id,
    level: 2,
    name: "",
    description: "<p><b>[??????]</b><br/><br/><br/><br/><b>[??????]<br/><br/></b><br/><br/><br/><b>[??????]<br/><br/><br/></b></p>",
    staff_name: user?.name,
    staff_no: user?.staff_no,
    remark: "",
    status: 5,
    type: 1,
    product_module_id: 0,
    product_module_name: curProductInfo.value?.name,
    demand_id: null,
    task_id: null
  };
};

const resetUseCaseBug = (param: { id: number; name: string }) => {
  arrayForm.value[3] = {
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
    name: "",
    remark: "",
    staff_no: "",
    task_name: "",
    description: "<p><b>[??????]</b><br/><br/><br/><b>[??????]<br/></b><br/><br/><b>[??????]<br/></b><br/><br/></p>",
    staff_name: "",
    demand_name: "",
    test_case_id: param.id,
    test_case_name: param.name,
    iteration_id: iterateId.value,
    iteration_name: currentIter.value.name,
    list: [] as Array<Record<string, any>>,
    attachment: [] as Array<Record<string, any>>,
    product_name: curProductInfo.value?.name,
    product_id: curProductInfo.value?.id
  };
};

// ????????????id,??????????????????
watch(
  () => props.targetId,
  (newVal, oldVal) => {
    if (newVal === -1) return;
    if (router.currentRoute.value.name === "useCase") {
      if (newVal <= 0 || !oldVal) {
        headerTitle.value = "??????";
        richStatus.value = "add";
        rich2Status.value = "add";
        logData.value = [];
        if (props.type === 9) resetUseCase();
        if (props.type === 3) {
          headerTitle.value = "??????BUG";
        }
      } else {
        editDrawer(newVal);
      }
    } else {
      editDrawer(newVal);
    }
  }
);
const editDrawer = (newVal: number) => {
  richStatus.value = "view";
  rich2Status.value = "view";
  getDataDetial(newVal);
  loading.value = true;
  headerTitle.value = headerTitleArr[props.type];
};

// ????????????
const handleDrawerVisble = (visible: boolean) => {
  drawer.value = visible;
};
// ??????????????????(????????????????????????)
const updateDemand = (params: WangText) => {
  editDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      getLog(props.targetId);
      setTimeout(() => emit("refresh"), 300);
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
  if (currentRt.id) {
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
      setTimeout(() => emit("refresh"), 300);
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
  if (currentRt.id) {
    const obj: WangText = {
      ids: [currentRt.id]
    };
    if (currentRt.who === "rich") {
      obj.content = currentRt.rich;
      obj.field = "content";
      arrayForm.value[props.type].content = currentRt.rich;
      arrayForm.value[props.type].description = currentRt.rich;
    } else {
      obj.remark = currentRt.rich2;
      obj.field = "remark";
      arrayForm.value[props.type].remark = currentRt.rich2;
    }
    await editTask(obj);
  }
};

// ??????BUG
const addBug = async (params: any) => {
  createBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
    if (res.code === 200) {
      drawer.value = false;
      emit("refresh");
      return tipMessage(200, "??????");
    }
  });
};

// ??????BUG??????(????????????????????????)
const editBug = async (params: WangText) => {
  updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
    if (res.code === 200) {
      getLog(props.targetId);
      setTimeout(() => emit("refresh"), 300);
      return tipMessage(200, "??????");
    }
  });
};
// bug--(????????????????????????)---??????
const bugOption = async (currentRt: CallBackDrawer, who: string) => {
  if (who === "title") {
    const obj: WangText = {
      id: [currentRt.id],
      field: "name",
      name: currentRt.title
    };
    if (currentRt.title.length < 4 || currentRt.title.length > 100) {
      return tipMessage(400, "?????????4-100?????????????????????");
    }
    arrayForm.value[props.type].name = currentRt.title;
    await editBug(obj);
    return;
  }
  // who??????????????????????????????????????????
  if (currentRt.who) {
    const obj: WangText = {
      id: [currentRt.id],
      field: ""
    };
    if (currentRt.who === "rich") {
      obj.field = "description";
      obj.description = currentRt.rich;
      arrayForm.value[props.type].description = currentRt.rich;
    } else {
      obj.field = "remark";
      obj.remark = currentRt.rich2;
      arrayForm.value[props.type].remark = currentRt.rich2;
    }
    if (currentRt.id) {
      await editBug(obj);
    } else {
      await addBug(obj);
    }
    return;
  } else {
    if (!currentRt.title) return tipMessage(400, "??????????????????");
    arrayForm.value[props.type].name = currentRt.title;
    arrayForm.value[props.type].description = currentRt.rich;
    arrayForm.value[props.type].remark = currentRt.rich2;
    const params = {
      name: arrayForm.value[props.type].name,
      description: arrayForm.value[props.type].description,
      remark: arrayForm.value[props.type].remark,
      attachment: arrayForm.value[props.type].attachment,
      type: arrayForm.value[props.type].type,
      status: arrayForm.value[props.type].status,
      staff_no: arrayForm.value[props.type].staff_no,
      level: arrayForm.value[props.type].level,
      priority: arrayForm.value[props.type].priority,
      env: arrayForm.value[props.type].env,
      product_id: arrayForm.value[props.type].product_id,
      iteration_id: arrayForm.value[props.type].iteration_id,
      demand_id: arrayForm.value[props.type].demand_id,
      task_id: arrayForm.value[props.type].task_id,
      test_case_id: arrayForm.value[props.type].test_case_id
    };
    if (!params.staff_no) {
      return tipMessage(400, "??????????????????");
    } else {
      addBug(params);
    }
  }
};
// ????????????????????? ??????(????????????????????????) type??????????????????
const updateUseCase = (params: any, type?: string) => {
  if (type) {
    addUseCaseData<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      if (res.code === 200) {
        drawer.value = false;
        emit("refresh");
        return tipMessage(200, "??????");
      }
    });
  } else {
    editUseCaseData<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      if (res.code === 200) {
        getLog(props.targetId);

        emit("refresh");
        return tipMessage(200, "??????");
      }
    });
  }
};
// ??????--(????????????????????????)---??????
const useCaseOption = async (currentRt: CallBackDrawer, who: string) => {
  if (who === "title") {
    const obj: WangText = {
      ids: [currentRt.id],
      field: "name",
      name: currentRt.title
    };
    if (!currentRt.title) return tipMessage(400, "??????????????????");

    if (currentRt.title.length < 1 || currentRt.title.length > 100) return tipMessage(400, "?????????1-100?????????????????????");
    arrayForm.value[props.type].name = currentRt.title;
    await updateUseCase(obj);
    return;
  }
  // who.id??????????????????
  if (currentRt.id) {
    const obj: WangText = {
      ids: [currentRt.id]
    };
    if (currentRt.who === "rich") {
      obj.content = currentRt.rich;
      obj.field = "content";
      arrayForm.value[props.type].content = currentRt.rich;
      arrayForm.value[props.type].description = currentRt.rich;
    } else {
      obj.remark = currentRt.rich2;
      obj.field = "remark";
      arrayForm.value[props.type].remark = currentRt.rich2;
    }
    console.log(obj);

    await updateUseCase(obj);
  } else {
    if (!currentRt.title) return tipMessage(400, "??????????????????");

    if (currentRt.title.length < 1 || currentRt.title.length > 100) return tipMessage(400, "?????????1-100?????????????????????");

    arrayForm.value[props.type].name = currentRt.title;
    arrayForm.value[props.type].content = currentRt.rich;
    arrayForm.value[props.type].remark = currentRt.rich2;

    // ????????????????????????????????????taskForm.value.demand_status???taskForm.value.level?????????number????????????element???select?????????????????????????????????????????????????????????????????????????????????????????????????????????
    const obj = JSON.parse(JSON.stringify(arrayForm.value[props.type]));
    obj.status = arrayForm.value[props.type].status * 1;
    obj.level = arrayForm.value[props.type].level * 1;
    obj.type = arrayForm.value[props.type].type * 1;
    obj.iteration_id = arrayForm.value[props.type].iteration_id ?? 0;
    updateUseCase([obj], "add");
  }
};

// ??????-????????????(????????????????????????)
const onHandle = (type: "save" | "cancel" | "name", currentRt: CallBackDrawer, who: string) => {
  if (type === "cancel") {
    return (drawer.value = false);
  }
  if (props.type === 5) {
    // ??????
    demandOption(currentRt, who);
  } else if (props.type === 2) {
    // ??????
    taskOption(currentRt, who);
  } else if (props.type === 3) {
    // bug
    bugOption(currentRt, who);
  } else if (props.type === 9) {
    useCaseOption(currentRt, who);
  }
};

defineExpose({
  handleDrawerVisble: (visible: boolean) => handleDrawerVisble(visible),
  resetUseCaseBug: (param: { id: number; name: string }) => resetUseCaseBug(param),
  getDetailData: (id: number) => editDrawer(id)
});

// ??????????????????????????????
watch(
  () => drawer.value,
  (newVal) => {
    if (!newVal) {
      if (router.currentRoute.value.name === "useCase") removeIdFromRouter();
    }
  }
);
// ??????????????????????????????

// ???????????????
const onChangeDate = (id: number) => {
  console.log("???? ~ file: index.vue ~ line 676 ~ onChangeDate ~ id", id);
  getLog(id);
  setTimeout(() => emit("refresh"), 300);
};
</script>
<style scoped lang="less"></style>
