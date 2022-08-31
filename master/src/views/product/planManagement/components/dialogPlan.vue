<template>
  <div class="rp-relative-dialog">
    <el-dialog top="8vh" :title="dialogForm.id ? '编辑计划' : '新增计划'" v-model="dialogRelative" @close="handleClose" width="40%">
      <div class="relative-dialog">
        <el-form label-position="top" :rules="rules" ref="ruleFormRef" :model="dialogForm" class="plan-form-inline">
          <el-form-item label="计划名称" prop="name">
            <el-input style="width: 92%" v-model="dialogForm.name" placeholder="计划名称，2-50字" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-select style="width: 92%" v-model="dialogForm.staff_no" clearable filterable placeholder="请选择负责人">
              <el-option v-for="item in planPeople" :label="item.staff_name" :value="item.staff_no" :key="item.staff_no" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              style="width: 92%"
              size="default"
              v-model="dialogForm.start_time"
              :teleported="false"
              value-format="YYYY-MM-DD"
              placeholder="结束时间"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              style="width: 92%"
              size="default"
              v-model="dialogForm.end_time"
              :teleported="false"
              value-format="YYYY-MM-DD"
              placeholder="结束时间"
            />
          </el-form-item>
        </el-form>
        <p>关联需求</p>
        <div class="content-demand-list">
          <el-tree
            :data="treeDataList"
            node-key="id"
            ref="classifyTree"
            :default-checked-keys="dialogForm.demand_ids"
            show-checkbox
            @check="handleCheckChange"
            :default-expand-all="true"
            :props="{ children: 'children', label: 'name' }"
          >
            <template #default="{ node }">
              <span style="font-size: 14px" class="el-tree-node__label node-name">{{ node.label }}</span>
            </template>
          </el-tree>
        </div>
        <p>备注</p>
        <el-input class="plan-remark" maxlength="500" show-word-limit :rows="4" v-model="dialogForm.remark" type="textarea" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRelative = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm(ruleFormRef)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: "dialog-plan"
};
</script>
<script lang="ts" setup>
import { reactive, defineProps, ref, computed, defineEmits } from "vue";
import type { PropType } from "vue";
import type { Tree } from "@/types/interface";
import type { FormInstance, FormRules } from "element-plus";
import { ResponseParams } from "@/types/response";
import { updatePlan, createPlan } from "@/api/request-modules/product";
import useMessageTip from "@/composables/useMessageTip";
import { TreeItem } from "@/composables/useDocument";
interface PlanPeople {
  staff_name: string;
  staff_no: string;
}
interface DialogForm {
  name: string;
  start_time: string;
  end_time: string;
  remark: string;
  create_by: string;
  staff_no: string;
  staff_name: string;
  creator: string;
  id?: number;
  demand_ids: string[];
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sortTreeDate: {
    type: Object as PropType<Tree[] | TreeItem[]>,
    default: () => ({})
  },
  defaultCheck: {
    type: Array,
    default: () => []
  },
  planPeople: {
    type: Array as PropType<PlanPeople[]>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: "计划名称，2-50字"
  },
  dialogForm: {
    type: Object as PropType<DialogForm>,
    default: () => ({})
  },
  planIds: {
    ype: Array as PropType<string[]>,
    default: () => []
  }
});
const { tipMessage } = useMessageTip();
const classifyTree = ref();
const emit = defineEmits(["update:visible", "update"]);
console.log(props.dialogForm);
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入计划名称", trigger: "blur" },
    { min: 2, max: 50, message: "请输入2-50个字符", trigger: "blur" }
  ]
});
// 控制显示隐藏弹框
const dialogRelative = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
// 确定
const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const user = props.planPeople.filter((item) => item.staff_no === props.dialogForm.staff_no);
      if (user && user.length) {
        props.dialogForm.staff_name = user[0].staff_name;
      } else {
        props.dialogForm.staff_no = "";
        props.dialogForm.staff_name = "";
      }
      // 将选中的需求赋值
      props.dialogForm.demand_ids = classifyTree.value!.getCheckedKeys(false);

      if (props.dialogForm.end_time && props.dialogForm.start_time) {
        if (props.dialogForm.end_time < props.dialogForm.start_time) return tipMessage(400, "开始时间不能大于结束时间");
      }

      if (props.dialogForm.id) {
        updatePlan<ResponseParams.ResponseDataSuccess>(props.dialogForm).then((res) => {
          if (res.code === 200) {
            emit("update");
          }
        });
      } else {
        createPlan<ResponseParams.ResponseDataSuccess>(props.dialogForm).then((res) => {
          if (res.code === 200) {
            emit("update");
          }
        });
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};

// tree点击选中值
const handleCheckChange = (data: any, status: Record<string, any>) => {
  props.dialogForm.demand_ids = status.checkedKeys;
};

const treeDataList = computed(() => props.sortTreeDate.map((data) => Object.assign(data, {})));
// 弹框关闭事件
const handleClose = () => {
  emit("update:visible", false);
};
</script>
<style lang="less">
.rp-relative-dialog {
  .plan-form-inline {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .el-form-item {
      width: 40%;
    }
  }
  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 20px;
  }
  .el-dialog__footer {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .relative-dialog {
    height: 500px;
    overflow: scroll;
    .relative-search {
      display: flex;
      align-items: center;
      .items-label {
        width: 80px;
      }
    }
    .content-demand-list {
      margin-top: 10px;
      min-height: 80px;
      border: 1px solid #dddfe6;
      overflow-x: scroll;
    }
    .plan-remark {
      margin-bottom: 10px;
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
