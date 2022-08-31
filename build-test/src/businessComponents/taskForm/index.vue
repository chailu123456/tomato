<template>
  <div class="rp-form-content">
    <el-form :model="demandForm" ref="ruleFormRef" :rules="rules" label-position="left" label-width="100px">
      <el-form-item label="任务类型" prop="type">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'type')"
          filterable
          v-model="demandForm.type"
          placeholder="请选择"
        >
          <el-option v-for="it in TYPE_STATUS" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'status')"
          filterable
          :disabled="!props.demandForm.id"
          v-model="demandForm.status"
          placeholder="请选择"
        >
          <el-option v-for="it in task_select" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="指派给" prop="name">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'staff_no')"
          filterable
          v-model="demandForm.staff_name"
          placeholder="请选择"
        >
          <el-option-group v-for="group in userList" :key="group.staff_no" :label="group.label">
            <el-option v-for="i in group.options" :key="i.staff_no" :label="i.staff_name" :value="i.staff_no"></el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="level">
        <div style="display: flex; align-items: center; margin-left: 10px">
          <em
            :style="{
              width: '8px',
              height: '8px',
              marginRight: '4px',
              display: 'inline-block',
              borderRadius: '5px',
              background: getStatus(demandForm.level)
            }"
          ></em>
          <el-select
            :style="{
              display: 'flex',
              flex: 1
            }"
            :teleported="false"
            @change="(value:number) => handleChangeForm(value, 'level')"
            class="reset-select"
            filterable
            v-model="demandForm.level"
            placeholder="请选择"
          >
            <el-option v-for="it in DEMAND_PRIORITY" :key="it.value" :label="it.label" :value="it.value"></el-option>
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="所属项目" prop="name">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'product_id')"
          class="reset-select"
          filterable
          :disabled="!showAddTaskBtn && !demandForm.id"
          v-model="demandForm.product_id"
          placeholder="请选择"
        >
          <el-option v-for="it in productList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属迭代">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'iteration_id')"
          class="reset-select"
          filterable
          clearable
          :disabled="!showAddTaskBtn && !demandForm.id"
          v-model="demandForm.iteration_id"
          placeholder="请选择"
        >
          <el-option v-for="it in iterationList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联需求">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'demand_id')"
          class="reset-select"
          filterable
          clearable
          v-model="demandForm.demand_name"
          placeholder="请选择需求"
        >
          <el-option v-for="it in demandData" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="计划开始时间">
        <div class="default-form-item">
          <el-date-picker
            value-format="YYYY-MM-DD"
            @change="(value:number) => handleChangeForm(value, 'begin_time')"
            v-model="demandForm.begin_time"
            type="date"
            size="default"
            :clearable="false"
            placeholder="请选择日期"
            style="width: 100%"
            popper-class="js-drawer-uncloseable"
          />
        </div>
      </el-form-item>
      <el-form-item label="计划完成时间">
        <div class="default-form-item">
          <el-date-picker
            value-format="YYYY-MM-DD"
            @change="(value:number) => handleChangeForm(value, 'end_time')"
            v-model="demandForm.end_time"
            type="date"
            size="default"
            :clearable="false"
            placeholder="请选择日期"
            style="width: 100%"
            popper-class="js-drawer-uncloseable"
          />
        </div>
      </el-form-item>
      <el-form-item label="预计工时">
        <div class="default-form-item" style="display: flex; align-items: center; width: 70%">
          <el-input type="number" @change="(value:number) => handleChangeForm(value, 'hours')" v-model="demandForm.hours" />
          <i style="width: 30px; position: absolute; right: 10px">小时</i>
        </div>
      </el-form-item>
      <el-form-item label="实际工时" v-if="demandForm.id">
        <div class="default-form-item" style="display: flex; align-items: center; width: 70%">
          <el-input type="number" @change="(value:number) => handleChangeForm(value, 'real_hours')" v-model="demandForm.real_hours" />
          <i style="width: 30px; position: absolute; right: 10px">小时</i>
        </div>
      </el-form-item>
    </el-form>
    <div class="file-list">
      <div class="file-title">附件</div>
      <div>
        <el-upload
          :show-file-list="false"
          v-loading="loadingUpload"
          :before-upload="onBeforeUpload"
          :on-success="handleSuccessFiles"
          :action="api.uploadAssets"
          :multiple="false"
        >
          <span class="upload-icon">
            <el-icon>
              <Plus />
            </el-icon>
          </span>
        </el-upload>
        <ul class="list-detail">
          <li v-for="(item, index) in fileArr" :key="item.addr" @click="handleDownload(item)">
            <el-icon class="list-detail-icon"><Document /></el-icon>
            <div class="detail-right">
              <el-icon class="icon-remove" @click.stop="handleRemove(index)"><Close /></el-icon>
              <p>{{ item.name }}</p>
              <p>{{ item.creator }} {{ item.create_time }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref, reactive, onMounted, defineEmits, computed, watch } from "vue";
import { DEMAND_PRIORITY, TYPE_STATUS, TASK_TYPE } from "@/utils/contantOptions";
import { ResponseParams } from "@/types/response";
import type { FormInstance, FormRules } from "element-plus";
import { useStore } from "@/store";
import { useRouter } from "vue-router";

import { updateBasicTask, getIterationDemand } from "@/api/request-modules/iteration";
import { isNumber } from "lodash";
import { UploadFile } from "@/types/upload";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import useMessageTip from "@/composables/useMessageTip";
import api from "@/api/dict";
import { Plus, Close, Document } from "@element-plus/icons-vue";
import fileSave from "@/utils/fileSave";
import dayjs from "dayjs";

import useGetDemandList from "@/views/iteration/useGetDemandList";
interface Staff {
  staff_name: string;
  staff_no: string;
}
const store = useStore();

const props = defineProps({
  userList: {
    type: Array,
    default: () => []
  },
  iterationList: {
    type: Array,
    default: () => []
  },
  demandForm: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  }
});
const router = useRouter();
// 任务在项目下不可新增,任务在迭代模块下可以新增任务
const showAddTaskBtn = ref(router.currentRoute.value.meta.onIteration);

const loadingUpload = ref(false);

const emit = defineEmits(["onChangeTask"]);
// const curProductInfo = ref(getSession("productInfo", true) as any);
const { tipMessage } = useMessageTip();
const user = getSession("user", true) as USER;
const task_select = JSON.parse(JSON.stringify(TASK_TYPE));
task_select.splice(-1, 1);
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  name: [
    { message: "Please input Activity name", trigger: "blur" },
    { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" }
  ],
  region: [
    {
      message: "Please select Activity zone",
      trigger: "change"
    }
  ],
  date1: [
    {
      type: "date",

      message: "Please pick a date",
      trigger: "change"
    }
  ],
  date2: [
    {
      type: "date",

      message: "Please pick a time",
      trigger: "change"
    }
  ]
});

const getStatus = (status: number) => {
  const list = DEMAND_PRIORITY.find((v: { value: string | number; label: string }) => v.value == status);
  return list?.color;
};

// 获取迭代下拉列表
const iterationList: any = ref([]);
const getIterationData = (params: number) => {
  const getDemandList = useGetDemandList();
  getDemandList(params).then((res) => {
    if (res && res.length) {
      iterationList.value = res;
    } else {
      iterationList.value = [];
    }
  });
};
// 保存初始值
let origindemandForm = ref({});

// 项目列表
const productList: any = computed(() => store.getters.productList);

// 项目列表

// 需求列表
const demandData = ref([]);
const iterationDemand = (product_id: number, id?: any) => {
  getIterationDemand<ResponseParams.ResponseDataSuccess>({ product_id: product_id, iteration_id: id || 0 }).then((res: any) => {
    demandData.value = res.data;
  });
};
// 需求列表

// 上传之前加载loading
const onBeforeUpload = () => {
  loadingUpload.value = true;
};

// 附件列表
const fileArr = computed(() => props.demandForm.attachment);
//#region 文件上传
// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: UploadFile, fileList: Array<UploadFile>) => {
  loadingUpload.value = false;
  // 七牛上传成功后有时候返回url为空
  if (response.url) {
    const file = fileList.slice().map((v: Record<string, any>) => {
      return {
        name: v.name,
        url: v.response ? v.response.url : v.url,
        size: v.response ? v.response.size : v.size,
        file_type: v.response ? v.response.file_type : "",
        creator: user?.name,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
      };
    });
    fileArr.value.unshift(file[file.length - 1]);
    props.demandForm.attachment = fileArr.value;
    if (!props.demandForm.id) return;
    const obj: Record<string, any> = {
      ids: [props.demandForm.id],
      attachment: fileArr.value,
      field: "attachment"
    };
    updateData(obj);
  }
};

// 将原始值保存 预计工时和实际工时
let originHours = props.demandForm?.hours || 0;
let originActualHours = props.demandForm?.real_hours || 0;

// 监听demandForm，更新迭代列表(这块监听原因是迭代列表默认在父组件传入，如果在子组件修改项目，则需要更新迭代列表)
watch(
  () => props.demandForm,
  (val, oldVal) => {
    if (oldVal) {
      origindemandForm.value = JSON.parse(JSON.stringify(props.demandForm));
      originHours = props.demandForm?.hours;
      originActualHours = props.demandForm?.real_hours;

      if (val.product_id) {
        // 判断需求所属项目id与上一次的需求所属项目id是否相同、迭代id同理，减少请求
        if (val.product_id === oldVal.product_id && val.iteration_id === oldVal.iteration_id) return;
        // 获取迭代列表
        if (val.product_id !== oldVal.product_id) {
          getIterationData(val.product_id);
        }
        // 获取需求列表
        iterationDemand(val.product_id, val.iteration_id);
      }
    }
  },
  {
    immediate: true
  }
);

// 表单更新   props.demandForm.id存在代表编辑，不存在代表创建。 编辑是实时的改一个请求一次，创建是全部填充数据后一次性请求
const handleChangeForm = async (val: any, key: string) => {
  // 如果是切换项目，则需要更新项目下的迭代
  if (key === "product_id") {
    props.demandForm.iteration_id = null;
    props.demandForm.demand_id = null;
    props.demandForm.demand_name = "";
    await getIterationData(val);
    await iterationDemand(val, props.demandForm.iteration_id);
  }
  if (key === "iteration_id") {
    props.demandForm.demand_id = null;
    props.demandForm.demand_name = "";

    if (!val) val = 0;
    if (!val) props.demandForm.iteration_id = null;
    await iterationDemand(props.demandForm.product_id, props.demandForm.iteration_id);
  }
  if (key === "demand_id") {
    if (!val) val = 0;
    props.demandForm.demand_id = val;
  }
  if (key === "hours" || key === "real_hours") {
    if (val === "") {
      if (key === "hours") props.demandForm.hours = originHours;
      if (key === "real_hours") props.demandForm.real_hours = originActualHours;
      return tipMessage(400, "请输入大于0的正整数");
    }

    if (isNumber(val * 1)) {
      const r = /^\+?[0-9][0-9]*$/;
      if (!r.test(val)) {
        if (key === "hours") props.demandForm.hours = originHours;
        if (key === "real_hours") props.demandForm.real_hours = originActualHours;
        return tipMessage(400, "请输入大于0的正整数");
      }

      if (Number(val) <= 0) {
        if (key === "hours") {
          props.demandForm.hours = originHours;
          return tipMessage(400, "预计工时请输入大于0的正整数");
        }
        if (key === "real_hours") props.demandForm.real_hours = originActualHours;
        return tipMessage(400, "请输入大于0的正整数");
      }
      if (Number(val) > 999) {
        if (key === "hours") props.demandForm.hours = originHours;
        if (key === "real_hours") props.demandForm.real_hours = originActualHours;
        return tipMessage(400, "请输入0到999的正整数");
      }
    } else {
      return tipMessage(400, "请输入0到999的正整数");
    }
    originHours = props.demandForm?.hours;
    originActualHours = props.demandForm?.real_hours;
  }
  const obj: Record<string, any> = {
    ids: [props.demandForm.id]
  };
  if (key === "staff_no") {
    if (props.userList) {
      const op: any = props.userList[1];
      const userMsg = op.options.filter((item: Staff) => item.staff_no === val);
      obj.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_no = userMsg[0].staff_no;
    }
  }

  obj[key] = val;
  const keyArr = ["status", "level", "hours", "real_hours"];
  if (keyArr.includes(key)) {
    obj[key] = val * 1;
  }

  if (key === "hours" || key === "real_hours") {
    props.demandForm[key] = obj[key];
  }

  if (key === "begin_time" || key === "end_time") {
    if (props.demandForm.begin_time && props.demandForm.end_time) {
      if (props.demandForm.begin_time > props.demandForm.end_time) {
        tipMessage(400, "计划开始时间不能大于结束时间");
        props.demandForm.begin_time = origindemandForm.value?.begin_time;
        props.demandForm.end_time = origindemandForm.value.end_time;
        return;
      }
    }
  }

  obj.field = key;
  if (!props.demandForm.id) return;

  if (key === "status") {
    if (props.demandForm.status === 2 && !props.demandForm.real_hours) {
      props.demandForm.real_hours = props.demandForm.hours;
      obj.real_hours = props.demandForm.real_hours;
    }
  }
  updateData(obj);
};

// 编辑更新
const updateData = (params: any) => {
  updateBasicTask<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      emit("onChangeTask", props.demandForm.id);
      if (params.status && params.real_hours) tipMessage(200, "保存成功，实际工时的值已默认填充预计工时。");
      else return tipMessage(200, "成功");
    }
  });
};

// 删除附件
const handleRemove = (val: number) => {
  fileArr.value.splice(val, 1);
  if (!props.demandForm.id) return;
  const obj: any = {
    ids: [props.demandForm.id],
    attachment: fileArr.value,
    field: "attachment"
  };
  if (props.demandForm.id) {
    updateData(obj);
  }
};

onMounted(() => {
  // 判断负责人是不是在该任务下
  // const op: any = props.userList[1];
  // if (op) {
  //   const userMsg = op.options.filter((item: Staff) => item.staff_no === props.demandForm.staff_no) || [];
  //   if (!userMsg.length) {
  //     props.demandForm.staff_no = "";
  //     // props.demandForm.staff_name = "";
  //   }
  // } else {
  //   props.demandForm.staff_no = "";
  //   // props.demandForm.staff_name = "";
  // }
  // origindemandForm.value = JSON.parse(JSON.stringify(props.demandForm));
  // iterationDemand(props.demandForm.product_id, props.demandForm.iteration_id);
  // moduleData();
});
// 下载附件
const handleDownload = (val: Record<string, any>) => {
  fileSave(val.name || val.title, val.url);
};
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

  // .origin_path_name {
  //   &:hover {
  //     cursor: pointer;
  //     .el-input__wrapper {
  //       border: 1px solid red;
  //       box-shadow: 0 0 0 1px #777, #898989 inset;
  //     }
  //   }
  // }

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
</style>
