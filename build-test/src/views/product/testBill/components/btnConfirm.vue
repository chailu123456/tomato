<!--
 * @Author: 宋绍华
 * @Date: 2022-05-22 14:41:13
 * @LastEditTime: 2022-06-01 18:06:29
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\testBill\components\btnConfirm.vue
-->
<template>
  <div class="btnConfirm">
    <el-dialog title="状态变更" custom-class="btnConfirm-dialog" v-model="info.visible" width="40%">
      <el-form :model="formPrams" class="demand-form" label-width="68px" label-position="top">
        <div class="test-status-show">
          <div>
            <span>当前状态：</span>
            <span> {{ TESTBILLTYPES[info.curStatus - 1] ? TESTBILLTYPES[info.curStatus - 1].label : "-" }}</span>
          </div>
          <div>
            <span>当前操作：</span>
            <span style="font-weight: normal" v-if="currentRt.reject">待提测</span>
            <span v-else>
              <span style="font-weight: normal">{{ info.text }}</span>
            </span>
          </div>
        </div>
        <el-form-item label="备注">
          <WangEditor @getWangEditorValue="callback" :height="240" :description="currentRt.description" placeholder="请输入内容" ref="wangEditor" />
        </el-form-item>
        <el-form-item label="添加抄送">
          <el-button @click="handleAddPeople">添 加</el-button>
        </el-form-item>
        <div class="rp-people-list">
          <span v-for="(item, index) in currentRt.selectPerson" :class="item.is_sys ? 'people-check' : 'people-default-check'" :key="index">{{
            item.staff_name
          }}</span>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button type="primary" @click="submit">提 交</el-button>
        </span>
      </template>
    </el-dialog>
    <HandlePerson :item="currentRt.peoples" :checkStrictly="false" @submit="onSubmit" onlyEmployee v-model:visible="currentRt.visible" />
  </div>
</template>

<script lang="ts">
import { defineProps, reactive, defineEmits, watch } from "vue";
import { TESTBILLTYPES } from "@/utils/contantOptions";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import WangEditor from "@/components/wangEditor/index.vue";
import { TestBillNotifyItem } from "@/composables/useTestBill";

interface Rt {
  reject: boolean;
  visible: boolean;
  selectPerson: TestBillNotifyItem[];
  peoples: Record<string, any>;
  description: string;
}

export default {
  name: "btnConfirm"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["submit", "update:btVisible"]);
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        toStatus: 0,
        visible: false,
        id: 0,
        notify_list: []
      };
    }
  }
});

const currentRt = reactive<Rt>({
  reject: false,
  selectPerson: [],
  visible: false,
  peoples: {
    id: -1,
    participant: [],
    department: []
  },
  description: ""
});

const formPrams = reactive<{ id: number; remark: string; to_status: number; notify_list: TestBillNotifyItem[] }>({
  id: 0,
  remark: "",
  to_status: 0,
  notify_list: []
});

watch(
  () => props.info,
  (newVal) => {
    formPrams.notify_list = props.info.notify_list;
    currentRt.selectPerson = props.info.notify_list;
    currentRt.peoples.participant = props.info.notify_list;
  },
  {
    immediate: true,
    deep: true
  }
);

watch(
  () => props.info.visible,
  () => {
    currentRt.description = "";
  },
  {
    immediate: true
  }
);

const handleAddPeople = () => {
  currentRt.visible = true;
};

// 添加成员回调
const onSubmit = async (info: { department: number[]; team_worker: string[]; selectPerson: TestBillNotifyItem[] }) => {
  const { selectPerson, department } = info;
  // 原有的人员通知list
  const hasArr = props.info.notify_list.map((item: { staff_no: string }) => item.staff_no);
  selectPerson.forEach((item) => {
    // 如果原有的有，就不需要添加is_sys 字段
    if (hasArr.includes(item.staff_no)) {
      item.is_sys = !!props.info.notify_list.find((n: { staff_no: string }) => n.staff_no === item.staff_no)?.is_sys;
    }
  });

  currentRt.selectPerson = selectPerson;
  currentRt.peoples.department = department;
  currentRt.peoples.participant = selectPerson;
};

// 提交回调
const submit = () => {
  currentRt.description = "";
  emit("submit", { ...props.info, notify_list: currentRt.peoples.participant, remark: formPrams.remark });
};

// 关闭弹窗
const closeDialog = () => {
  emit("update:btVisible", false);
};

const callback = (data: string) => {
  formPrams.remark = data;
  currentRt.description = data;
};
</script>
<style lang="less" scoped>
.test-status-show {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  div {
    span:first-child {
      color: #606266;
      font-weight: 700;
      margin-right: 12px;
    }
  }
}

.rp-people-list {
  max-height: 140px;
  overflow-y: scroll;
  span {
    display: inline-block;
    padding: 4px 8px;
    margin: 2px 4px;
    font-size: 12px;
    border-radius: 4px;
    color: #606266;
    background: #f1f1f1;
  }
  span.people-default-check {
    background: #cfe8e3;
  }
}

:global(.btnConfirm-dialog .el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
