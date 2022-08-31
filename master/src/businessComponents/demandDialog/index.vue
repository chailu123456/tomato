<template>
  <div class="rp-demand-dialog">
    <el-dialog top="10vh" :title="title" v-model="dialogDemand" @close="handleClose" width="30%">
      <div class="demand-dialog">
        <demandOrigin v-if="type === 1" @updateOrigin="updateOrigin" :val="selectVal"></demandOrigin>
        <el-select style="width: 100%" filterable v-else v-model="staff_value" clearable @change="selectPeople" placeholder="请选择指派给">
          <el-option-group v-for="group in userList" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no" />
          </el-option-group>
        </el-select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogDemand = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: "demand-dialog"
};
</script>
<script lang="ts" setup>
import { defineProps, ref, computed, defineEmits } from "vue";
import demandOrigin from "../demandOrigin/index.vue";
interface Staff {
  staff_name: string;
  staff_no: string;
}
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userList: {
    type: Array,
    default: () => []
  },
  type: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    default: "批量编辑"
  }
});

const emit = defineEmits(["update:visible", "updateVal"]);
// 选择来源人
const selectVal = ref("");
// 控制显示隐藏弹框
const dialogDemand = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
// 选择指派人
const staff_value = ref("");
let obj = {
  field: "staff_no",
  staff_no: "",
  staff_name: ""
};
const updateOrigin = (val: string) => {
  selectVal.value = val;
};
// 确定
const handleConfirm = () => {
  if (props.type === 1) {
    emit("updateVal", JSON.parse(JSON.stringify(selectVal.value)));
  } else {
    emit("updateVal", JSON.parse(JSON.stringify(obj)));
  }
  setTimeout(() => {
    selectVal.value = "";
    obj.staff_no = "";
    obj.staff_name = "";
    staff_value.value = "";
  }, 1000);
};

const selectPeople = (val: string) => {
  // 判断指派人是不是在该需求下
  const op: any = props.userList[1];
  if (op) {
    const userMsg = op.options.filter((item: Staff) => item.staff_no === val) || [];
    console.log(userMsg);
    if (!userMsg.length) {
      obj.staff_no = "";
      obj.staff_name = "";
    } else {
      obj.staff_no = userMsg[0].staff_no;
      obj.staff_name = userMsg[0].staff_name;
    }
  } else {
    obj.staff_no = "";
    obj.staff_name = "";
  }
  console.log(obj);
};

// 弹框关闭事件
const handleClose = () => {
  emit("update:visible", false);
  emit("updateVal", "no");
};
</script>
<style lang="less">
.rp-demand-dialog {
  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 10px;
  }
  .el-dialog__footer {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .demand-dialog {
    height: 60px;
    overflow: scroll;
    overflow-x: hidden;
    .el-select-v2__wrapper {
      border: 1px solid #ccc;
    }

    .content-body {
      margin-top: 10px;
      height: 0px;
      border: 1px solid #dddfe6;
    }
  }

  .drag-title {
    margin: -10px 0 10px;
    display: block;
    font-size: 13px;
    color: #999;
  }
}
</style>
