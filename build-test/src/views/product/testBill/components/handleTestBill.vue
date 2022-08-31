<template>
  <div class="handleTestBill">
    <Drawer
      v-model:drawer="currentRt.drawer"
      :id="currentRt.drawerForm.id"
      :title="currentRt.drawerForm.name"
      :headerTitle="currentRt.drawerForm.headerTitle"
      :rich="currentRt.drawerForm.content"
      :rich2="currentRt.drawerForm.remark"
      :richStatus="currentRt.drawerForm.richStatus"
      :rich2Status="currentRt.drawerForm.rich2Status"
      :statusList="currentRt.statusList"
      @onHandle="drawerCallback"
      :loading="loading"
    >
      <template #associate
        ><Associate ref="associate" :list="currentRt.associates" @submit="changeAssType" :data="currentRt.associateForm" @change="assChange"
      /></template>
      <template #form><From :hasIter="hasIter" :form="currentRt.form" ref="form" @change="onChange" @submit="showBtnConfirm" /></template>
      <template #btn="{ data }" v-if="!currentRt.form.id">
        <el-button @click="handleDrawer('cancel', data)" plain>取消</el-button>
        <el-button @click="handleDrawer('saveTest', data)" type="primary">保存并提测</el-button>
        <el-button @click="handleDrawer('save', data)" type="primary">仅保存</el-button>
      </template>
    </Drawer>

    <BtnConfirm
      v-if="currentRt.btnConfirmObj.visible"
      v-model:btVisible="currentRt.btnConfirmObj.visible"
      :info="currentRt.btnConfirmObj"
      @submit="btnConfirmSubmit"
    />
  </div>
</template>

<script lang="ts">
import Drawer, { DrawerRt } from "@/components/drawer/index.vue";
import Associate from "./associate.vue";
import From from "./form.vue";
import BtnConfirm from "./btnConfirm.vue";

import useTestBill, {
  AssociatedSelectResp,
  AvailableSelectReq,
  ListCreatorResp,
  LogsResp,
  ProductTestBillItem,
  TestBillAddReq,
  TestBillEditReq,
  TestBillNotifyItem,
  TestBillStatusReq
} from "@/composables/useTestBill";
import { store } from "@/store";
import { USER } from "@/store/state";
import { getSession } from "@/utils";
import { ElMessage, UploadFile } from "element-plus";
import { reactive, computed, defineProps, defineEmits, ref, unref, defineExpose, watch } from "vue";
import useCommon from "@/composables/useCommon";
const {
  useAvailableIterationTestBillList,
  useCreateTestBill,
  useAvailableTestBillList,
  useModifyTestBillStatus,
  useModifyTestBill,
  useGetTestBillDetail,
  useGetTestBillLogs,
  useGetUserList
} = useTestBill();
const { useGetProjectList } = useCommon();
interface TestBill {
  demands: AssociatedSelectResp[];
  iters: AssociatedSelectResp[];
  tasks: AssociatedSelectResp[];
  associates: AssociatedSelectResp[];
  creators: ListCreatorResp[];
  users: ListCreatorResp[];
  drawer: boolean;
  drawerForm: Record<string, any>;
  form: Record<string, any>;
  associateForm: Record<string, any>;
  statusList: LogsResp[];
  btnConfirmObj: {
    toStatus: number;
    curStatus: number;
    visible: boolean;
    text: string;
    id: number;
    notify_list: TestBillNotifyItem[];
  };
}

export default {
  name: "handleTestBill",
  components: {
    Drawer,
    BtnConfirm
  }
};
</script>

<script lang="ts" setup>
const props = defineProps({
  hasIter: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["updateInfo"]);
const user = getSession("user", true) as USER;
const associate = ref();
const form = ref();
const loading = ref(false);
const productId = computed(() => store.getters.productId);
const iterateId = computed(() => store.getters.iterateId);
const currentIter = computed(() => store.getters.currentIter);
const basicUser = computed(() => {
  if (!currentRt.users[1]) return [];
  return currentRt.users[1]?.options.map((item) => {
    return {
      value: item.staff_no,
      label: item.staff_name
    };
  });
});

const currentRt = reactive<TestBill>({
  statusList: [], // 动态详情
  drawer: false,
  form: {
    // 抽屉form 表单
    status: 1,
    product_id: productId.value,
    staff_no: user?.staff_no,
    basicUser: [],
    productLists: [],
    iterate: []
  },
  drawerForm: {
    id: 0,
    headerTitle: "新增提测单",
    name: "",
    content: "<p><b>需构建应用及分支</b><br/><br/><br/><b>注意事项说明<br/></b><br/><br/><b>影响范围说明<br/></b><br/><br/><b>参数及相关配置</b></p>",
    remark: "",
    richStatus: "add",
    rich2Status: "add"
  },
  associates: [],
  associateForm: {
    canEdit: false
  },
  demands: [], // 需求
  iters: [], // 迭代
  tasks: [], // 任务
  creators: [], // 创建人
  users: [], // 指派人
  btnConfirmObj: {
    toStatus: 0,
    curStatus: 0,
    visible: false,
    id: 0,
    notify_list: [],
    text: ""
  }
});

defineExpose({
  handleDrawerVisble: (visible: boolean, isAdd: boolean) => handleDrawerVisble(visible, isAdd),
  showEditDrawer: (row: ProductTestBillItem | number) => showEditDrawer(row),
  resetDrawerData: () => resetDrawerData(),
  getAssList: (params: AvailableSelectReq) => getAssList(params),
  showBtnConfirm: (row: ProductTestBillItem | number | Record<string, any>, params: { toStatus: number; curStatus: number; text: string }) =>
    showBtnConfirm(row, params),
  btnConfirmSubmit: (params: { toStatus: number; id: number; remark: string; notify_list: { staff_no: string; staff_name: string }[] }) =>
    btnConfirmSubmit(params)
});

watch(
  () => currentRt.drawer,
  async (newVal) => {
    if (newVal) {
      await getUserList();
      if (!currentRt.form.productLists?.length) {
        await getProjectList();
      }
    }
  }
);

const handleDrawerVisble = (visible: boolean, isAdd = false) => {
  currentRt.drawer = visible;
  if (isAdd) {
    resetDrawerData();
    currentRt.drawerForm.name = props.hasIter ? currentIter.value?.name + "提测单" : "";
    getAssList({ product_id: productId.value, type: 1, iteration_id: props.hasIter ? iterateId.value : undefined });
  }
};

// 获取指派人列表
const getUserList = async () => {
  const data = await useGetUserList({ product_id: productId.value });

  if (data) {
    currentRt.users = data;
    currentRt.form.basicUser = basicUser.value;
  }
};

// 获取项目列表
const getProjectList = async () => {
  const data = await useGetProjectList();
  if (data) currentRt.form.productLists = data;
};

// 弹出状态变更弹窗
const showBtnConfirm = (row: ProductTestBillItem | number | Record<string, any>, params: { toStatus: number; curStatus: number; text: string }) => {
  const { toStatus, curStatus, text } = params;

  currentRt.btnConfirmObj.visible = true;
  currentRt.btnConfirmObj.toStatus = toStatus;
  currentRt.btnConfirmObj.curStatus = curStatus;
  currentRt.btnConfirmObj.text = text;
  if (typeof row === "object") {
    currentRt.btnConfirmObj.notify_list = row.notify_list;
  }
  currentRt.btnConfirmObj.id = typeof row === "object" ? row.id : row;
};

// 项目和迭代切换
const onChange = async (type: "iterate" | "files" | "staff_no", val: number | string, files?: UploadFile[]) => {
  const { id } = currentRt.form;
  // 新增状态时，文件、员工的调整不请求接口
  if (type !== "iterate" && !id) return;
  if (type === "iterate") {
    // 选择迭代后，需要选择关联需求、任务、bug之类的
    const formData = form.value.formData;
    currentRt.associateForm.iteration_id = val || 0;
    getAssList({ type: associate.value.type, product_id: formData.product_id.value, iteration_id: (val as number) || 0, test_apply_id: id });
    if (currentRt.associateForm.canEdit) return;
    // 这里添加canEdit 字段 是切换迭代时，需要跟关联交互
    currentRt.associateForm.canEdit = true;
    // 记录下迭代id，后面关联编辑时需要用到
    return ElMessage.warning("请选择关联");
  } else if (type === "files") {
    await modifyTestBill({ id, attachment: files, field: "attachment" });
    showEditDrawer(id);
  } else if (type === "staff_no") {
    const staff_name = form.value.getStaffName();
    modifyTestBill({ id, staff_name, staff_no: val as string });
  }
};

// 编辑更改关联类型
const changeAssType = async (params: { type: number; quote_dis: number[]; id: number }) => {
  const param = {
    ...params,
    iteration_id: currentRt.associateForm.iteration_id || 0,
    test_apply_id: currentRt.associateForm.id || undefined
  };
  const isSucc = await modifyTestBill(param);
  // 保存后，更新编辑状态
  currentRt.associateForm.canEdit = false;
  if (isSucc) {
    showEditDrawer(params.id);
  }
};

// 抽屉弹窗回调
const drawerCallback = async (type: "save" | "cancel", ct: Record<string, any>, who: "rich" | "rich2" | "title") => {
  currentRt.associateForm.canEdit = false;
  if (type === "save") {
    const { id } = ct;
    const t = who === "rich" ? "content" : who === "rich2" ? "remark" : "name";
    if (!ct.title) return ElMessage.warning("请输入标题");
    const params = {
      id,
      [t]: ct[who]
    };
    await modifyTestBill(params);
    showEditDrawer(id);
  }
};

// 修改详情
const modifyTestBill = async (params: TestBillEditReq) => {
  const isSucc = await useModifyTestBill(params);
  if (isSucc) {
    ElMessage.success("更改成功");

    emit("updateInfo");
    return true;
  }
  return false;
};

const getTestBillDetail = async (id: number) => {
  const data = await useGetTestBillDetail(id);
  if (data) {
    await getLogs(id);
    return data;
  }
};

// 获取动态
const getLogs = async (id: number) => {
  const data = await useGetTestBillLogs(id);
  if (data) currentRt.statusList = data;
};

// 抽离弹窗回显数据
const showEditDrawer = async (row: ProductTestBillItem | number) => {
  currentRt.drawer = true;
  loading.value = true;
  const _id = typeof row === "object" ? row.id : row;
  const data = await getTestBillDetail(_id);
  loading.value = false;
  if (!data) return;
  const { id, name, content, remark, notify_list, quote_list, status, attachment, type, product_id, iteration_id, staff_no } = data;
  currentRt.drawerForm.id = id;
  currentRt.drawerForm.name = name;
  currentRt.drawerForm.headerTitle = "查看详情";
  currentRt.drawerForm.content = content;
  currentRt.drawerForm.remark = remark;
  currentRt.drawerForm.richStatus = "view";
  currentRt.drawerForm.rich2Status = "view";
  currentRt.associateForm.id = id;
  currentRt.associateForm.iteration_id = iteration_id;
  currentRt.associateForm.type = type;
  currentRt.associateForm.quote_list = quote_list;
  currentRt.form.attachment = attachment;
  currentRt.form.id = id;
  currentRt.form.product_id = product_id;
  currentRt.form.iteration_id = iteration_id;
  currentRt.form.staff_no = staff_no;
  currentRt.form.status = status;
  currentRt.form.attachment = attachment;
  currentRt.form.notify_list = notify_list;

  // 获取项目list
  product_id && getIterateList({ product_id, iteration_id, test_apply_id: id });
  // 获取对应迭代下的需求、bug、类型
  getAssList({ product_id: product_id as number, type: type as number, iteration_id, test_apply_id: id });
};

// 获取迭代list test_apply_id 提测单id
const getIterateList = async (params: { product_id: number; iteration_id?: number; test_apply_id?: number }) => {
  const data = await useAvailableIterationTestBillList(params);
  if (data) currentRt.form.iterate = data;
};
// 获取提测单关联下拉(未关联数据)
const getAssList = async (params: AvailableSelectReq) => {
  const data = await useAvailableTestBillList(params);

  if (data) currentRt.associates = data;
};

// 创建提测单
const createTestBill = async (params: TestBillAddReq) => {
  const isSucc = await useCreateTestBill(params);
  if (isSucc) {
    ElMessage.success("创建成功");
    return true;
  }
};

// 操作按钮保存
const handleDrawer = async (type: "save" | "saveTest" | "cancel", data: DrawerRt) => {
  if (type === "cancel") {
    currentRt.drawer = false;
    resetDrawerData();
  } else {
    // 校验是否有填写必选项
    const isFill = await form.value.formRef.validate();
    if (!isFill) return;
    const { files: attachment, formData } = form.value;
    const { checks: quote_ids, type: aType } = associate.value;
    const { rich: content, title: name, rich2: remark } = data;
    if (!name) return ElMessage.warning("标题不能为空");
    else if (!Array.isArray(quote_ids) || (Array.isArray(quote_ids) && !quote_ids.length)) return ElMessage.warning("关联内容不能为空");
    const staff_name = form.value.getStaffName();
    const tMap = {
      save: 1,
      saveTest: 3,
      cancel: 0
    };
    const params = {
      content,
      name,
      remark,
      type: aType,
      quote_ids,
      attachment,
      staff_name,
      iteration_id: props.hasIter ? iterateId.value : unref(formData.iteration_id) || undefined,
      product_id: unref(formData.product_id),
      staff_no: unref(formData.staff_no),
      status: tMap[type as keyof typeof tMap]
    };

    const isSucc = await createTestBill(params);
    if (isSucc) {
      currentRt.drawer = false;
      // getTestBillList(currentRt.searchForm!);
      emit("updateInfo");
    }
  }
};

// 重置抽屉数据
const resetDrawerData = () => {
  form.value?.clearFiles();
  currentRt.form.id = 0;

  // 需要重置的数据抽屉主体、关联需求、form表单
  Object.keys(currentRt.drawerForm).forEach((key) => {
    if (key === "id") {
      currentRt.drawerForm.id = 0;
    } else if (typeof currentRt.drawerForm[key] === "string") {
      if (key === "headerTitle") {
        currentRt.drawerForm.headerTitle = "新增提测单";
      } else if (key === "content") {
        currentRt.drawerForm.content =
          "<p><b>需构建应用及分支</b><br/><br/><br/><b>注意事项说明<br/></b><br/><br/><b>影响范围说明<br/></b><br/><br/><b>参数及相关配置</b></p>";
      } else if (key === "rich2Status" || key === "richStatus") {
        currentRt.drawerForm[key] = "add";
      } else {
        currentRt.drawerForm[key] = "";
      }
    } else {
      currentRt.drawerForm[key] = [];
    }
  });

  Object.keys(currentRt.form).forEach((k) => {
    if (k === "product_id") {
      currentRt.form.product_id = productId.value;
    } else if (k === "staff_no") {
      currentRt.form.staff_no = user?.staff_no;
    } else if (k === "iterate") {
      currentRt.form[k] = [];
      getIterateList({ product_id: productId.value });
    } else {
      if (typeof currentRt.form[k] === "string") {
        currentRt.form[k] = undefined;
      } else if (typeof currentRt.form[k] === "number") {
        currentRt.form[k] = 0;
      }
    }
  });
  currentRt.associateForm = {};
  currentRt.statusList = [];
};

const assChange = (type: number) => {
  const { id: test_apply_id, iteration_id } = currentRt.associateForm;
  getAssList({ type, product_id: productId.value, test_apply_id, iteration_id: props.hasIter ? iterateId.value : iteration_id });
};

// 状态变更弹窗按钮回调
const btnConfirmSubmit = async (params: { toStatus: number; id: number; remark: string; notify_list: { staff_no: string; staff_name: string }[] }) => {
  const { id, toStatus: to_status, remark, notify_list } = params;
  const param = {
    id,
    to_status,
    remark,
    notify_list
  };
  const isSucc = await modifyStatus(param);
  if (isSucc) {
    currentRt.btnConfirmObj.visible = false;
    // getTestBillList(currentRt.searchForm!);
    emit("updateInfo");
    if (currentRt.drawer) {
      showEditDrawer(id);
    }
  }
};

// 更改提测单状态
const modifyStatus = async (params: TestBillStatusReq) => {
  const isSucc = await useModifyTestBillStatus(params);
  if (isSucc) {
    ElMessage.success("操作成功");
    return true;
  }
  return false;
};
</script>
<style lang="less" scoped></style>
