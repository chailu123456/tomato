<template>
  <div class="rp-form-content">
    <el-form :model="drawerForm" :rules="formRules" ref="ruleFormRef" label-position="left" label-width="100px">
      <el-form-item label="类型" prop="type">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'type')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          v-model="drawerForm.type"
          placeholder="请选择类型"
        >
          <el-option v-for="it in BUG_TYPE" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          @change="(value: any) => handleChangeStatus(value, 'status')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          :disabled="!drawerForm.id"
          v-model="drawerForm.status"
          placeholder="请选择状态"
        >
          <el-option v-for="it in BUG_STATUS_DELETE" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="指派给" prop="staff_no">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'staff_no')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          v-model="drawerForm.staff_no"
          placeholder="请选择指派人"
        >
          <el-option-group v-for="group in staffList" :key="group.staff_no" :label="group.label">
            <el-option v-for="i in group.options" :key="i.staff_no" :label="i.staff_name" :value="i.staff_no"></el-option>
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="级别" prop="level">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'level')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          v-model="drawerForm.level"
          placeholder="请选择级别"
        >
          <el-option v-for="it in BUG_LEVEL" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <div style="display: flex; align-items: center; margin-left: 10px">
          <em
            :style="{
              width: '8px',
              height: '8px',
              marginRight: '4px',
              display: 'inline-block',
              borderRadius: '5px',
              background: getStatus(drawerForm.priority)
            }"
          ></em>
          <el-select
            :style="{
              display: 'flex',
              flex: 1
            }"
            :popperAppendToBody="false"
            @change="(value:number) => handleChangeForm(value, 'priority')"
            class="reset-select"
            filterable
            v-model="drawerForm.priority"
            placeholder="请选择优先级"
          >
            <el-option v-for="it in PRIORITY" :key="it.id" :label="it.value" :value="it.id"></el-option>
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="所属环境" prop="env">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'env')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.env"
          placeholder="请选择环境"
        >
          <el-option v-for="it in ENVLIST" :key="it.id" :label="it.value" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属项目" prop="product_id" required>
        <el-select
          @change="(value: any) => handleChangeForm(value, 'product_id')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          v-model="drawerForm.product_id"
          placeholder="请选择项目"
          :disabled="currentRoute.meta.inIteration"
        >
          <el-option v-for="it in productList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属迭代" prop="iteration_id">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'iteration_id')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.iteration_id"
          placeholder="请选择迭代"
          :disabled="currentRoute.meta.inIteration"
        >
          <el-option v-for="it in iterationList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联需求" prop="demand_id">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'demand_id')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.demand_id"
          placeholder="请选择需求"
        >
          <el-option v-for="it in demandList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联任务" prop="task_id">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'task_id')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.task_id"
          placeholder="请选择任务"
        >
          <el-option v-for="it in taskList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关联用例" prop="test_case_id">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'test_case_id')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.test_case_id"
          placeholder="请选择用例"
          :disabled="currentRoute.meta.inIteration && router.currentRoute.value.name === 'useCase'"
        >
          <el-option v-for="it in useCaseList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="解决方案" prop="cause" v-if="drawerForm.id">
        <el-select
          @change="(value: any) => handleChangeForm(value, 'cause')"
          :popperAppendToBody="false"
          class="reset-select"
          filterable
          clearable
          v-model="drawerForm.cause"
          placeholder="请选择解决方案"
        >
          <el-option v-for="item in REJECTDEALREASON" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="修复耗时" prop="hours" v-if="drawerForm.id">
        <div class="default-form-item" style="display: flex; align-items: center; width: 100px">
          <el-input type="number" @change="(value:number) => handleChangeForm(value, 'hours')" v-model="drawerForm.hours" />
          <i style="width: 30px; position: absolute; left: 110px">小时</i>
        </div>
      </el-form-item>
    </el-form>
    <!-- 附近信息 -->
    <div class="file-list">
      <div class="file-title">附件</div>
      <div>
        <el-upload
          v-loading="loadingUpload"
          :before-upload="onBeforeUpload"
          :show-file-list="false"
          :on-success="handleSuccessFiles"
          :action="api.uploadAssets"
          :multiple="false"
        >
          <span class="upload-icon">
            <el-icon><Plus /></el-icon>
          </span>
        </el-upload>
        <ul class="list-detail">
          <li v-for="item in fileArr" :key="item.addr" @click="handleDownload(item)">
            <el-icon class="list-detail-icon"><Document /></el-icon>
            <div class="detail-right">
              <el-icon class="icon-remove" @click.stop="handleRemove(item)"><Close /></el-icon>
              <p>{{ item.title }}</p>
              <p>{{ item.creator }} {{ item.create_time }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "FormBug"
};
</script>
<script lang="ts" setup>
import dayjs from "dayjs";
import api from "@/api/dict";
import { find } from "lodash";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import fileSave from "@/utils/fileSave";
import { ResponseParams } from "@/types/response";
import { getStaffList } from "@/api/request-modules/common";
import useMessageTip from "@/composables/useMessageTip";
import { Plus, Close, Document } from "@element-plus/icons-vue";
import { defineProps, ref, computed, watch, defineEmits } from "vue";
import { updateBug } from "@/api/request-modules/test";
import { getIterateList } from "@/api/request-modules/board";
import { getIterationDemand, getBugTaskList, getUseCaseList } from "@/api/request-modules/iteration";
import { UploadFile } from "@/types/upload";
import { REJECTDEALREASON, PRIORITY } from "@/utils/contantOptions";
import { BUG_STATUS, BUG_LEVEL, BUG_TYPE, ENVLIST } from "@/utils/index";
import router from "@/router";
import { useStore } from "@/store";
import { FormInstance } from "element-plus";

const inIteration = computed(() => router.currentRoute.value.meta.inIteration);
const store = useStore();

const emit = defineEmits(["onHandle"]);

const props = defineProps({
  drawerForm: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  },
  currIterateId: {
    type: Number,
    default: 0
  }
});

const { tipMessage } = useMessageTip();
const user = getSession("user", true) as USER;
const productList: any = computed(() => store.getters.productList);
const currentRoute = computed(() => router.currentRoute.value);
const iterationList: any = ref([]); // 迭代列表
const demandList: any = ref([]); // 需求列表
const taskList: any = ref([]); // 任务列表
const useCaseList: any = ref([]); // 任务列表
const staffList: any = ref([]); // 人员列表列表
const ruleFormRef = ref<FormInstance>(); // form 表单实例
const formRules = {
  staff_no: [{ required: true, message: "请选择指派人", trigger: "blur" }],
  level: [{ required: true, message: "请选择级别", trigger: "blur" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "blur" }],
  product_id: [{ required: true, message: "请选择项目", trigger: "blur" }]
};
const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);

const getStatus = (status: number) => {
  const list = PRIORITY.find((v) => v.id == status);
  return list?.color;
};

const dealStaffList = () => {
  if (staffList.value[1]) {
    const target = find(staffList.value[1]?.options, (o) => {
      return props.drawerForm?.staff_no === o.staff_no;
    });
    // 如果没有匹配上
    if (!target && props.drawerForm?.staff_no !== props.drawerForm?.staff_name) {
      props.drawerForm.staff_no = props.drawerForm?.staff_name;
    }
  }
};

const getEmployeeLists = (params: number) => {
  getStaffList<ResponseParams.ResponseDataSuccess>({
    product_id: params,
    iteration_id: props.currIterateId
  }).then((res) => {
    if (res.code === 200) {
      staffList.value = res.data;
    } else {
      staffList.value = [];
    }
    dealStaffList();
  });
};

// 获取迭代数据
const getIterationData = (params: number) => {
  getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: params }).then((res) => {
    if (res.code === 200) {
      iterationList.value = res.data;
    } else {
      iterationList.value = [];
    }
  });
};

// 获取需求列表
const getNewDemandData = (params: number) => {
  getIterationDemand<ResponseParams.ResponseDataSuccess>({
    product_id: params
  }).then((res: any) => {
    if (res.code === 200) {
      demandList.value = res.data;
    } else {
      demandList.value = [];
    }
  });
};

// 获取任务列表
const getBugTaskData = (params: number) => {
  const obj = {
    product_id: params,
    iteration_id: inIteration.value ? props.currIterateId : 0
  };
  getBugTaskList<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
    if (res.code === 200) {
      taskList.value = res.data;
    } else {
      taskList.value = [];
    }
  });
};

// 获取用例列表
const getUseCaseData = (params: number) => {
  const obj = {
    product_id: params,
    iteration_id: inIteration.value ? props.currIterateId : 0
  };
  getUseCaseList<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
    if (res.code === 200) {
      useCaseList.value = res.data;
    } else {
      useCaseList.value = [];
    }
  });
};

// 附件列表
const fileArr = computed(() => props.drawerForm.attachment);
//#region 文件上传
// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: UploadFile, fileList: UploadFile[]) => {
  loadingUpload.value = false;
  // 七牛上传成功后有时候返回url为空
  if (response.url) {
    const file = fileList.slice().map((v: UploadFile) => {
      return {
        title: v.name,
        addr: v.response ? v.response.url : v.url,
        size: v.response ? v.response.size : v.size,
        file_type: v.response ? v.response.file_type : "",
        creator: user?.name,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
      };
    });
    fileArr.value.unshift(file[file.length - 1]);
    props.drawerForm.attachment = fileArr.value;
    if (!props.drawerForm.id) return;
    const obj: Record<string, any> = {
      id: [props.drawerForm.id],
      attachment: fileArr.value,
      field: "attachment"
    };
    updateData(obj);
  }
};

const updateData = (params: any, msg?: string) => {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
        if (res.code === 200) {
          emit("onHandle", params.id[0]);
          return tipMessage(200, msg || "成功");
        }
      });
    }
  });
};

// 删除附件
const handleRemove = (val: Record<string, any>) => {
  fileArr.value.splice(val, 1);
  if (!props.drawerForm.id) return;
  const obj: any = {
    id: [props.drawerForm.id],
    attachment: fileArr.value,
    field: "attachment"
  };
  updateData(obj);
};

const loadingUpload = ref(false);
// 上传之前加载loading
const onBeforeUpload = () => {
  loadingUpload.value = true;
};

// 下载附件
const handleDownload = (val: Record<string, any>) => {
  fileSave(val.title, val.addr);
};

const handleChangeStatus = (val: any, key: string) => {
  if (!props.drawerForm.id) return;
  let msg = "";
  if ([4, 5].includes(val)) {
    msg = "状态修改成功，请填写解决方案。";
  }
  if ([2].includes(val)) {
    msg = "状态已修改为已解决，请填写修复耗时。";
  }
  const obj: Record<string, any> = {
    id: [props.drawerForm.id],
    field: `${key}`
  };
  obj[key] = val;
  updateData(obj, msg);
};

// 更新表单数据 props.demandForm.id 存在代表编辑，不存在代表创建。
const handleChangeForm = async (val: any, key: string) => {
  // 如果是切换项目，则需要更新项目下的数据
  if (key === "product_id") {
    props.drawerForm.task_id = null;
    props.drawerForm.demand_id = null;
    props.drawerForm.iteration_id = ""; // 默认显示主干
    props.drawerForm.test_case_id = null;
    await getEmployeeLists(val);
    await getIterationData(val);
    await getNewDemandData(val);
    await getBugTaskData(val);
    await getUseCaseData(val);
  }
  if (!props.drawerForm.id) return;
  const obj: Record<string, any> = {
    id: [props.drawerForm.id],
    field: `${key}`
  };
  if (key === "hours") {
    const r = /^\+?[0-9][0-9]*$/;
    if (!r.test(val)) return tipMessage(400, "请输入大于0的正整数");
    val = parseInt(val, 10);
    if (val > 999 || val <= 0) return tipMessage(400, "请输入0到999的正整数");
  }
  // 这里要转换下非必选数据的格式，不然接口会报错
  if (["env", "iteration_id", "demand_id", "task_id", "test_case_id", "cause"].includes(key) && !val) {
    obj[key] = 0;
  } else {
    obj[key] = val;
  }
  updateData(obj);
};

// 监听demandForm，更新迭代列表(这块监听原因是迭代列表默认在父组件传入，如果在子组件修改项目，则需要更新迭代列表)
watch(
  () => props.drawerForm.id,
  (val) => {
    const { product_id } = props.drawerForm;
    if (product_id) {
      getEmployeeLists(product_id);
      getIterationData(product_id);
      getNewDemandData(product_id);
      getBugTaskData(product_id);
      getUseCaseData(product_id);
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>
<style lang="less">
.rp-form-content {
  .reset-select {
    .el-input__wrapper {
      box-shadow: none;
      .el-input__suffix {
        opacity: 0;
      }
      &:hover {
        box-shadow: 0 0 0 1px #777, #898989 inset;
        .el-input__suffix {
          opacity: 1;
        }
      }
    }
  }
  .default-form-item {
    border: 1px solid transparent;
    &:hover {
      box-shadow: 0 0 0 1px #777, #898989 inset;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 4px;
    }
  }
  .el-input__wrapper {
    box-shadow: none;
    &:hover {
      box-shadow: 0 0 0 1px #777, #898989 inset;
      .el-input__suffix {
        opacity: 1;
      }
    }
  }
  .file-list {
    .file-title {
      font-size: 14px;
      margin: 10px 0;
    }
    .upload-icon {
      display: inline-block;
      width: 50px;
      height: 50px;
      font-weight: 700;
      background: #fafafa;
      line-height: 50px;
      text-align: center;
      &:hover {
        color: #1f9f85;
      }
    }
    .list-detail {
      margin-top: 10px;
      li {
        display: flex;
        justify-content: space-between;
        height: 50px;
        line-height: 50px;
        background: #fafafa;
        margin: 6px 0;
        .list-detail-icon {
          display: inline-block;
          font-size: 24px;
          margin: 13px 10px;
          color: #1f9f85;
        }
        .detail-right {
          position: relative;
          width: calc(100% - 50px);
          p {
            width: calc(100% - 10px);
            padding-right: 10px;
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            margin: 4px 0;
            overflow: hidden;
            text-overflow: ellipsis; /* 加省略号 */
            white-space: nowrap; /* 强制不换行 */
          }
          p:last-child {
            font-size: 12px;
            margin-top: 2px;
            color: #606266;
          }
          .icon-remove {
            position: absolute;
            right: 5px;
            top: 4px;
            font-size: 12px;
            opacity: 0;
            &:hover {
              color: #1f9f85;
            }
          }
        }
        &:hover {
          background: #f3f3f3;
          cursor: pointer;
          .icon-remove {
            opacity: 1;
          }
        }
      }
    }
  }
  .default-form-item {
    border: 1px solid transparent;
    &:hover {
      box-shadow: 0 0 0 1px #777, #898989 inset;
      border: 1px solid rgb(215, 215, 215);
      border-radius: 4px;
    }
  }
}
</style>
<style>
input[type="number"] {
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
i {
  font-style: normal;
}
</style>
