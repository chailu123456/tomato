<template>
  <div class="approval-edit" v-show="showContainer">
    <el-dialog
      custom-class="approval-edit__dialog"
      v-model="visible"
      width="80%"
      :close-on-click-modal="false"
      :before-close="onBeforeClose"
      @close="$emit('update:visible', false)"
    >
      <!-- title -->
      <template #title>
        <span class="edit-title">{{ isCopy || 0 >= id ? "新增" : "编辑" }}需求审批单</span>
        <el-button-group>
          <el-button :disabled="!btnProcess.includes('save')" @click="handleBtn('save')">保存</el-button>
          <el-button :disabled="!btnProcess.includes('submit')" @click="handleBtn('submit')">提交</el-button>
          <el-button :disabled="!btnProcess.includes('notice')" @click="handleBtn('notice')">提醒审批</el-button>
          <el-button :disabled="!btnProcess.includes('process')" @click="handleBtn('process')">流程</el-button>
          <el-button :disabled="!btnProcess.includes('withDraw')" @click="handleBtn('withDraw')">撤回</el-button>
        </el-button-group>
      </template>

      <!-- 内容区 -->
      <div class="edit-body">
        <!-- 标题 -->
        <EditTitle ref="editTitle" :isCopy="isCopy" :details="editDetails" />
        <!-- 插入需求 -->
        <EditTable ref="editTable" :canEdit="canEdit" @changeTableForm="changeTable" :demandList="editDetails?.demand_list" />
        <!-- 插入file -->
        <EditFile ref="editFile" @changeTableForm="changeTable" :canEdit="canEdit" :attachment="editDetails?.attachment" />
        <!-- 插入审批记录 -->
        <EditRecord :logs="logs" :tipLogs="tipLogs" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
// 按钮提交类型
import { defineProps, defineEmits, ref, watch, computed, h } from "vue";
import { useRoute } from "vue-router";
import EditTitle, { EditTitleInter } from "./editTitle.vue";
import EditTable from "./editTable.vue";
import EditFile from "./editFile.vue";
import EditRecord from "./editRecord.vue";
import useApproval from "@/composables/useApproval";
import { ApprovalEditForm, DemandApprovalDetails, DemandApprovalItem, DemandApprovalLog, RequestInter } from "@/types/interface";
import { cloneDeep } from "lodash";
import useMessageTip from "@/composables/useMessageTip";
import MESSAGE_TIP from "@/utils/tipMessage";
import { ElMessage, ElMessageBox } from "element-plus";
import { getSession } from "@/utils/sesssion";
import dayjs from "dayjs";

type BtnType = "save" | "submit" | "notice" | "process" | "withDraw";
export default {
  name: "edit"
};
</script>

<script lang="ts" setup>
import { USER } from "@/store/state";
const emit = defineEmits(["updateList", "update:visible", "update:isCopy"]);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  id: {
    type: Number,
    default: 0
  },
  isCopy: {
    type: Boolean,
    default: false
  }
});
const route = useRoute();
const session = getSession("user", true) as USER;
const productName = getSession("productName") as string;
// 是否显示容器
const showContainer = ref(false);
// editTitle 元素
const editTitle = ref<EditTitleInter>();
// editFile 元素
const editFile = ref<any>();
// editTable 元素
const editTable = ref<any>();
// 编辑详情
const editDetails = ref<DemandApprovalDetails>();
// 按钮权限
const btnProcess = ref(["save"]);
// 审批流程记录
const logs = ref<DemandApprovalLog[]>([]);
// 审批流程节点负责人
const tipLogs = ref("");
// 关闭弹窗时，是否需要提示toast
const hasShowTips = ref(true);
// 是否为新增
const isAdd = ref(false);

const { useAddForm, useGetDemandDetails, useEditForm, useRemindApproval, useGetLog, useSubmitForm, useWithDrawForm } = useApproval();
const { tipMessage } = useMessageTip();

// 是否可以编辑状态
const canEdit = computed(() => {
  if (editId.value <= 0 || props.isCopy || !editDetails.value) return true;
  const { create_by, next_approve_no, status } = editDetails.value;
  /**
   * 创建人自己，并且当前登录人是自己
   * 1. status === 1 保存状态
   * 2. status === 2 审核中，但下一个节点自己是审核人
   */
  if (create_by === session?.staff_no && (status === 1 || (status === 2 && create_by === next_approve_no))) {
    return true;
  }
  // 只有下一个节点是自己才可以编辑;
  return false;
});

const editId = computed(() => {
  return editDetails.value ? editDetails.value.id : 0;
});

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal && props.id > 0) {
      // props.is 大于0 为编辑
      if (!props.isCopy) {
        isAdd.value = false;
      }
      handleInit(props.id);
    } else {
      isAdd.value = true;
      showContainer.value = true;
      btnProcess.value = ["save"];
      tipLogs.value = "";
      logs.value.length = 0;
      editDetails.value = {
        approval_no: "",
        attachment: [],
        create_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        create_name: session!.name,
        demand_list: [],
        id: props.id,
        product_id: 0,
        product_name: productName,
        status: -1,
        submit_by: "",
        submit_name: "",
        title: "",
        create_by: "",
        next_approve_no: "",
        next_approve_name: "",
        approve_user: {
          submit_user: "",
          step_one_user: "",
          step_two_first_user: "",
          step_two_second_user: ""
        }
      };
    }
  }
);

// 处理初始化事件
const handleInit = async (id: number) => {
  await getDetails(id);
  showContainer.value = true;
  // 如果是复制，就不需要填充数据了
  if (props.isCopy) return;
  await getLog(id);
  if (editDetails.value?.approve_user) {
    const { step_one_user, step_two_first_user, step_two_second_user, submit_user } = editDetails.value.approve_user;
    tipLogs.value = `流程：${submit_user} -> ${step_one_user} -> ${step_two_first_user}和${step_two_second_user}`;
  }
};

// 获取详情
const getDetails = async (id: number) => {
  const data = await useGetDemandDetails(id, false);

  if (data) {
    editDetails.value = data;
    // 控制按钮状态
    const { status, create_by, next_approve_no } = editDetails.value;
    if (props.isCopy) {
      btnProcess.value = ["save"];
      return;
    } else if (session?.staff_no !== create_by || status === 3 || status === 4) {
      btnProcess.value = [];
      return;
    } else if (status === 1 || (status === 2 && create_by === next_approve_no)) {
      btnProcess.value = ["submit"];
      return;
    } else {
      btnProcess.value = ["notice", "process", "withDraw"];
    }
  }
};

// 获取审批单记录
const getLog = async (id: number) => {
  const data = await useGetLog(id);
  if (data) {
    logs.value = data;
  }
};
// 校验填写的字段是否有空的
const checkDemandList = (demandList: RequestInter[]) => {
  const hasEmpty = demandList.every((item) => {
    const { name, type, target_value, description, estimate, level } = item;
    return name && type && target_value && description && estimate && level;
  });

  return hasEmpty;
};
// 校验表单是否有填写
const checkForm = (title: string, demand_list: RequestInter[]) => {
  if (!title.length) {
    ElMessage.error("请填写标题");
    return false;
  } else if (!demand_list.length || (demand_list.length && !checkDemandList(demand_list))) {
    ElMessage.error("请填写完整需求");
    return false;
  }

  return true;
};

// 保存表单
const saveForm = async (isSubmit = false) => {
  const { productId } = route.query as Record<string, any>;
  const { title } = editTitle.value!;
  const { getOutPutFileList } = editFile.value!;
  const { tableData, demendOpts } = editTable.value!;
  const attachment = getOutPutFileList();
  const demand_list = getOutPutTableList(tableData, demendOpts);
  const isPass = checkForm(title, demand_list);
  if (!isPass) return;
  const params: ApprovalEditForm = {
    title,
    attachment,
    demand_list,
    product_id: parseInt(productId)
  };
  let result;

  // 编辑
  if (!isAdd.value && !props.isCopy) {
    params.id = editId.value;
    if (isSubmit) {
      params.product_id = undefined;
      // 提交
      result = await useSubmitForm(params);
    } else {
      // 编辑
      result = await useEditForm(params);
    }
  } else {
    // 新增
    result = await useAddForm(params);
    // 新增完成之后为编辑
    isAdd.value = false;
  }
  if (!result) return;
  hasShowTips.value = true;
  tipMessage(200, MESSAGE_TIP.success);
  getCallback(false, typeof result === "number" ? result : editId.value);
};

// 处理请求后的回调
const getCallback = (isLeave = false, id: number) => {
  if (isLeave) {
    emit("update:visible", false);
  } else {
    handleInit(id);
  }
  // 去掉copy状态
  if (props.isCopy) emit("update:isCopy", false);
  emit("updateList");
};
// 监听编辑时 是否有更改form表单
const changeTable = (val: boolean) => {
  if (editId.value && canEdit.value && !props.isCopy) {
    if (val) {
      if (!btnProcess.value.includes("save")) {
        btnProcess.value.push("save");
      }
      hasShowTips.value = false;
    } else {
      btnProcess.value = btnProcess.value.filter((i) => i !== "save");
      hasShowTips.value = true;
    }
  }
};

// 出去多于的换行符
const handleText = (item: RequestInter) => {
  item.target_value = item.target_value.trim().replace(/\n+/g, "\n");
  item.description = item.description.trim().replace(/\n+/g, "\n");
  item.estimate = item.estimate.trim().replace(/\n+/g, "\n");

  return item;
};

// 获取输出数据
const getOutPutTableList = (tableData: RequestInter[], demendOpts: DemandApprovalItem[]): RequestInter[] => {
  const ids = demendOpts.map((i) => i.id);
  return cloneDeep(tableData).map((item: RequestInter) => {
    const curId = editId.value > 0 ? item.id : item.name;
    if (ids.includes(Number(curId))) {
      const _ = demendOpts.find((n) => n.id === Number(curId));
      if (_) {
        item.name = _.name;
        item.id = _.id;
        handleText(item);
      }
      return item;
    }
    handleText(item);
    return item;
  });
};

// 提醒审批人
const noticeApproval = async () => {
  const isTrue = await useRemindApproval(editId.value);
  if (!isTrue) return;
  tipMessage(200, "提醒成功");
};

// 撤回流程
const onWithDraw = async () => {
  // 确认是否清理所有的未读消息
  const isClear = await ElMessageBox.confirm("撤回后，单据将变为待保存状态，所有流程需重新审批，是否确认？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  });

  if (!isClear) return;
  const data = await useWithDrawForm(editId.value);
  if (data) {
    tipMessage(200, MESSAGE_TIP.success);
    getCallback(false, editId.value);
  }
};

// 操作按钮
const handleBtn = (type: BtnType) => {
  switch (type) {
    case "save":
      saveForm();
      break;
    case "submit":
      saveForm(true);
      break;
    case "notice":
      noticeApproval();
      break;
    case "process":
      ElMessageBox({
        message: h("p", null, [
          h("span", null, `当前${tipLogs.value}`),
          h("p", { style: "color: teal" }, `当前审批人：${editDetails.value?.next_approve_name}`)
        ])
      });
      break;
    case "withDraw":
      onWithDraw();
      break;
  }
};

const onBeforeClose = async (done: () => void) => {
  // if (!hasShowTips.value) {
  //   const isLeave = await ElMessageBox.confirm("您还有未保存的内容，请确认是否离开？", {
  //     confirmButtonText: "确认离开",
  //     cancelButtonText: "暂不离开"
  //   });
  //   if (isLeave === "close") return;
  //   done();
  // }
  emit("update:visible", false);
};
</script>

<style lang="less" scoped>
.edit {
  &-title {
    display: flex;
    padding-bottom: 10px;
    font-size: 15px;
    color: #606266;
  }
}
</style>

<style scoped lang="less">
.approval-edit {
  :deep(.el-overlay) {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000 !important;
  }
  :deep(.el-dialog) {
    // margin: 0 auto 20px !important;
    min-height: 680px;
    .el-dialog__header {
      padding-top: 10px;
    }
    .el-dialog__headerbtn {
      top: 10px;
      right: 10px;
    }
    &__body {
      overflow-y: scroll;
      max-height: 75vh;
      margin: 0 !important;
    }
  }
}
</style>
