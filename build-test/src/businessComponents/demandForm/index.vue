<template>
  <div class="rp-form-content">
    <el-form :model="demandForm" ref="ruleFormRef" :rules="rules" label-position="left" label-width="100px">
      <el-form-item label="需求类型" prop="type">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'type')"
          filterable
          v-model="demandForm.type"
          placeholder="请选择"
        >
          <el-option v-for="it in requireTypes" :key="it.value" :label="it.value" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <span style="margin-left: 10px; color: #606266" v-if="demandForm.demand_status == 1">待审核</span>
        <span style="margin-left: 10px; color: #606266" v-else-if="demandForm.demand_status == 3">审批中</span>
        <div v-else>
          <el-select
            :teleported="false"
            :disabled="!demandForm.id"
            class="reset-select"
            @change="(value:number) => handleChangeForm(value, 'demand_status')"
            filterable
            v-model="demandForm.demand_status"
            placeholder="请选择"
          >
            <el-option v-for="it in DEMAND_STATUS" :key="it.value" :label="it.label" :disabled="it.disabled" :value="it.value"></el-option>
          </el-select>
        </div>
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
          <div
            :style="{
              width: '8px',
              height: '8px',
              marginRight: '4px',
              display: 'inline-block',
              borderRadius: '50%',
              background: getStatus(demandForm.level)
            }"
          ></div>
          <el-select
            :teleported="false"
            @change="(value:number) => handleChangeForm(value, 'level')"
            class="reset-select"
            :style="{
              display: 'flex',
              flex: 1
            }"
            filterable
            v-model="demandForm.level"
            placeholder="请选择"
          >
            <el-option v-for="it in DEMAND_PRIORITY" :key="it.value" :label="it.label" :value="it.value"></el-option>
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="归属项目" prop="name">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'product_id')"
          class="reset-select"
          filterable
          v-model="demandForm.product_id"
          placeholder="请选择"
        >
          <el-option v-for="it in productList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属模块">
        <div class="default-form-item">
          <el-popover placement="bottom" ref="popover" :width="300" trigger="click">
            <template #reference>
              <el-input
                v-model="demandForm.product_module_name"
                readonly
                class="origin_path_name"
                suffix-icon="el-icon-arrow-down"
                placeholder="请选择所属模块"
              ></el-input>
            </template>
            <el-tree :data="moduleList" :expand-on-click-node="false" default-expand-all @node-click="handleModuleClick"></el-tree>
          </el-popover>
        </div>
      </el-form-item>
      <el-form-item label="迭代">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'iteration_id')"
          class="reset-select"
          filterable
          clearable
          @visible-change="visibleChange"
          v-model="demandForm.iteration_name"
          placeholder="请选择"
        >
          <el-option v-for="it in iterationList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="来源人">
        <div class="default-form-item" style="width: 100%; height: 30px">
          <demand-origin @updateOrigin="updateOrigin" :val="demandForm.origin_staff"></demand-origin>
        </div>
      </el-form-item>
      <el-form-item label="收集时间">
        <div class="default-form-item">
          <el-date-picker
            value-format="YYYY-MM-DD"
            @change="(value:number) => handleChangeForm(value, 'collect_time')"
            v-model="demandForm.collect_time"
            type="date"
            size="default"
            placeholder="请选择日期"
            style="width: 100%"
            popper-class="js-drawer-uncloseable"
          />
        </div>
      </el-form-item>
      <el-form-item label="计划开始时间">
        <div class="default-form-item">
          <el-date-picker
            value-format="YYYY-MM-DD"
            @change="(value:number) => handleChangeForm(value, 'start_time')"
            v-model="demandForm.start_time"
            type="date"
            size="default"
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
            placeholder="请选择日期"
            size="default"
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
          <el-input type="number" @change="(value:number) => handleChangeForm(value, 'actual_hours')" v-model="demandForm.actual_hours" />
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
              <p>{{ item.title }}</p>
              <p>{{ item.creator }} {{ item.create_time }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref, reactive, computed, defineEmits, watch } from "vue";
import { DEMAND_PRIORITY, requireTypes, DEMAND_STATUS } from "@/utils/contantOptions";
import { ResponseParams } from "@/types/response";
import type { FormInstance, FormRules } from "element-plus";
import { getSettingModule, editDemand, allMember } from "@/api/request-modules/product";
import { useRouter } from "vue-router";
// import peopleTree from "@/components/peopleTree/index.vue";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import useMessageTip from "@/composables/useMessageTip";
import api from "@/api/dict";
import { Plus, Close, Document } from "@element-plus/icons-vue";
import fileSave from "@/utils/fileSave";
import dayjs from "dayjs";
import { isNumber } from "lodash";
import { UploadFile } from "@/types/upload";
import demandOrigin from "@/businessComponents/demandOrigin/index.vue";
import { useStore } from "@/store";

import useGetDemandList from "@/views/iteration/useGetDemandList";
interface Staff {
  staff_name: string;
  staff_no: string;
}

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
const { tipMessage } = useMessageTip();
const user = getSession("user", true) as USER;
const store = useStore();
const emit = defineEmits(["onChangeTask"]);
// 保存初始值
let origindemandForm = ref({});

const popover = ref();
const router = useRouter();
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  name: [
    { message: "请输入长度在 4 到 100 个字符", trigger: "blur" },
    { min: 4, max: 100, message: "请输入长度在 4 到 100 个字符", trigger: "blur" }
  ],
  region: [
    {
      message: "Please select Activity zone",
      trigger: "change"
    }
  ],
  hours: [
    {
      type: "number",
      message: "请输入0-100之间的数字",
      trigger: "change"
    },
    { min: 0, max: 100, message: "请输入0-100之间的数字", trigger: "blur" }
  ],
  actual_hours: [
    {
      type: "number",
      message: "请输入0-100之间的数字",
      trigger: "change"
    },
    { min: 0, max: 100, message: "请输入0-100之间的数字", trigger: "blur" }
  ]
});
// 对数据进行转换
const dataReverse = (people: Array<Record<string, any>>) => {
  let newArr = [];
  for (let i = 0; i < people.length; i += 1) {
    let obj: Record<string, any> = {};
    obj.value = people[i].id;
    obj.label = people[i].name;
    obj.level = people[i].level;
    obj.parent_id = people[i].parent_id;
    obj.product_id = people[i].product_id;
    if (people[i].children && people[i].children.length) obj.children = dataReverse(people[i].children);

    newArr.push(obj);
  }
  return newArr;
};

const getStatus = (status: number) => {
  const list = DEMAND_PRIORITY.find((v: { value: string | number; label: string }) => v.value == status);
  return list?.color;
};

// 获取迭代下拉列表
const iterationList: any = ref(props.iterationList);
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

// 获取用户下拉列表
const userList: any = ref([]);
const basicUserList: any = ref([]);
const getUserList = (pId: number) => {
  allMember<ResponseParams.ResponseDataSuccess>({ product_id: pId }).then((res: any) => {
    if (res.data && res.data.length) {
      userList.value = res.data;
      basicUserList.value = res.data[1].options.map((o: Record<string, any>) => {
        return { value: o.staff_no, label: o.staff_name };
      });
    } else {
      userList.value = [];
      basicUserList.value = [];
    }
  });
};
// 获取用户下拉列表

// 此处主要是用户点击过快导致迭代数据还没返回，则需要重写请求一次
const visibleChange = (val: boolean) => {
  if (!iterationList.value.length && val) {
    getIterationData(props.demandForm.product_id);
  }
};

// 所属模块事件
const handleModuleClick = (data: Record<string, any>) => {
  if (data.value < 0) {
    router.push({ name: "moduleManage" });
    return;
  }
  popover.value.hide();

  props.demandForm.product_module_id = data.value;
  props.demandForm.product_module_name = data.label;
  if (!props.demandForm.id) return;
  const obj: Record<string, any> = {
    id: [props.demandForm.id],
    product_module_id: data.value,
    product_module_name: data.label,
    field: "product_module_id"
  };
  updateData(obj);
};

// 项目列表
const productList: any = computed(() => store.getters.productList);
// 所属模块
const moduleList: any = ref([]);
const moduleData = () => {
  if (props.demandForm.product_id) {
    getSettingModule({ product_id: props.demandForm.product_id }).then(async (res: any) => {
      if (res.data && res.data.length) {
        moduleList.value = res.data;
        moduleList.value.unshift({ id: 0, name: "主干" });
        moduleList.value.unshift({ id: -1, name: "+ 添加模块" });
        moduleList.value = dataReverse(moduleList.value);
      } else {
        moduleList.value = [];
        moduleList.value.unshift({ id: 0, name: "主干" });
        moduleList.value.unshift({ id: -1, name: "+ 添加模块" });
        moduleList.value = dataReverse(moduleList.value);
      }
    });
  }
};

const loadingUpload = ref(false);
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
        title: v.name,
        addr: v.response ? v.response.url : v.url,
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
      id: [props.demandForm.id],
      attachment: fileArr.value,
      field: "attachment"
    };

    updateData(obj);
  }
};
let originHours = props.demandForm.hours || 0;
let originActualHours = 0;

// 将原始值保存 预计工时和实际工时
originActualHours = props.demandForm?.actual_hours || 0;

// 监听demandForm，更新迭代列表(这块监听原因是迭代列表默认在父组件传入，如果在子组件修改项目，则需要更新迭代列表)
watch(
  () => props.demandForm,
  (val, oldVal) => {
    if (oldVal) {
      // 判断需求所属项目id与上一次的需求所属项目id是否相同、迭代id同理，减少请求
      if (val.product_id !== oldVal.product_id) {
        if (val.product_id !== oldVal.product_id) {
          getIterationData(val.product_id);
          moduleData();
        }
        getUserList(val.product_id);
      }
      origindemandForm.value = JSON.parse(JSON.stringify(props.demandForm));
      originHours = props.demandForm.hours || 0;
      originActualHours = props.demandForm.actual_hours ? props.demandForm.actual_hours : 0;
    }
  },
  { immediate: true }
);

// 表单更新   props.demandForm.id存在代表编辑，不存在代表创建。 编辑是实时的改一个请求一次，创建是全部填充数据后一次性请求
const handleChangeForm = async (val: any, key: string) => {
  // 如果是切换项目，则需要更新项目下的迭代
  if (key === "product_id") {
    props.demandForm.iteration_id = null;
    props.demandForm.product_module_id = 0;
    props.demandForm.product_module_name = "主干";
    await getIterationData(val);
    await moduleData();
  }
  const obj: Record<string, any> = {
    id: [props.demandForm.id]
  };
  if (key === "hours" || key === "actual_hours") {
    if (val === "") {
      if (key === "hours") props.demandForm.hours = originHours;
      if (key === "actual_hours") props.demandForm.actual_hours = originActualHours;
      return tipMessage(400, "请输入大于0的正整数");
    }

    if (isNumber(val * 1)) {
      if (Number(val) < 0) {
        if (key === "hours") props.demandForm.hours = originHours;
        if (key === "actual_hours") props.demandForm.actual_hours = originActualHours;
        return tipMessage(400, "请输入大于0的正整数");
      }
      const r = /^\+?[0-9][0-9]*$/;
      if (key === "hours") {
        if (!r.test(props.demandForm.hours)) {
          props.demandForm.hours = originHours;
          return tipMessage(400, "请输入大于0的正整数");
        }
        if (Number(val) > 1000) {
          props.demandForm.hours = originHours;
          return tipMessage(400, "请输入0-1000之间的正整数");
        }
      }
      if (key === "actual_hours") {
        if (!r.test(props.demandForm.actual_hours)) {
          props.demandForm.actual_hours = originActualHours;
          return tipMessage(400, "请输入大于0的正整数");
        }
        if (Number(val) > 1000) {
          props.demandForm.actual_hours = originActualHours;
          return tipMessage(400, "请输入0-1000之间的正整数");
        }
      }
    } else {
      return tipMessage(400, "请输入大于0的正整数");
    }
  }
  if (props.demandForm.name) {
    if (props.demandForm.name.length < 3 || props.demandForm.name.length > 100) return tipMessage(400, "请输入长度在 4 到 100 个字符");
  }
  if (key === "staff_no") {
    if (props.userList) {
      const op: any = props.userList[1];
      const userMsg = op.options.filter((item: Staff) => item.staff_no === val);
      obj.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_no = userMsg[0].staff_no;
    }
  }
  if (key === "iteration_id") {
    if (!val) val = 0;
  }

  obj[key] = val;
  const keyArr = ["demand_status", "level", "hours", "actual_hours"];
  if (keyArr.includes(key)) {
    obj[key] = val * 1;
  }

  if (key === "hours" || key === "actual_hours") {
    props.demandForm[key] = obj[key];
  }

  if (key === "start_time" || key === "end_time") {
    if (props.demandForm.start_time && props.demandForm.end_time) {
      if (props.demandForm.start_time > props.demandForm.end_time) {
        tipMessage(400, "计划开始时间不能大于结束时间");
        props.demandForm.start_time = origindemandForm.value.start_time;
        props.demandForm.end_time = origindemandForm.value.end_time;
        return;
      }
    }
  }
  if (!props.demandForm.id) return;
  obj.field = key;
  updateData(obj);
};

// 编辑更新
const updateData = (params: any) => {
  editDemand<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      emit("onChangeTask", props.demandForm.id);
      if (params.demand_status && params.demand_status == 5) return tipMessage(200, "修改成功，请填写消耗工时，以便记录工作情况");
      return tipMessage(200, "成功");
    }
  });
};

// 删除附件
const handleRemove = (val: number) => {
  fileArr.value.splice(val, 1);
  const obj: any = {
    id: [props.demandForm.id],
    attachment: fileArr.value,
    field: "attachment"
  };
  if (props.demandForm.id) {
    updateData(obj);
  }
};
// 更新来源人
const updateOrigin = (val: string) => {
  props.demandForm.origin = val;
  if (!props.demandForm.id) return;
  const obj: any = {
    id: [props.demandForm.id],
    origin: val,
    field: "origin"
  };
  updateData(obj);
};
// 更新来源人

// 下载附件
const handleDownload = (val: Record<string, any>) => {
  fileSave(val.title, val.addr);
};
</script>
<style lang="less" scoped>
.rp-form-content {
  .reset-select {
    width: 100%;
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

          p {
            .table-link;
            text-decoration: underline;
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
