<template>
  <div class="rp-form-content">
    <el-form :model="demandForm" label-position="left" label-width="100px">
      <el-form-item label="类型" prop="type">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'type')"
          filterable
          v-model="demandForm.type"
          placeholder="请选择"
        >
          <el-option v-for="it in STATUS" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="结果">
        <el-select
          :teleported="false"
          class="reset-select"
          @change="(value:number) => handleChangeForm(value, 'status')"
          filterable
          :disabled="!props.demandForm.id"
          v-model="demandForm.status"
          placeholder="请选择"
        >
          <el-option v-for="it in RESOULT" :key="it.value" :label="it.label" :value="it.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="等级" prop="level">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'level')"
          class="reset-select"
          filterable
          v-model="demandForm.level"
          placeholder="请选择"
        >
          <el-option v-for="item in PRIORITY" :key="item.value" :label="item.value" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属项目" prop="name">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'product_id')"
          class="reset-select"
          filterable
          :disabled="true"
          v-model="demandForm.product_id"
          placeholder="请选择"
        >
          <el-option v-for="it in productList" :key="it.id" :label="it.name" :value="it.id"></el-option>
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
      <el-form-item label="关联模块">
        <div class="default-form-item">
          <module-select
            v-model:value="demandForm.product_module_id"
            :list="moduleTree"
            @updateUseCase="getModuleSelectTree"
            @change="handleChangeModule"
          ></module-select>
        </div>
      </el-form-item>

      <el-form-item label="所属迭代">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'iteration_id')"
          class="reset-select"
          filterable
          clearable
          :disabled="true"
          v-model="demandForm.iteration_name"
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
      <el-form-item label="关联任务">
        <el-select
          :teleported="false"
          @change="(value:number) => handleChangeForm(value, 'task_id')"
          class="reset-select"
          filterable
          clearable
          v-model="demandForm.task_name"
          placeholder="请选择任务"
        >
          <el-option v-for="it in taskList" :key="it.id" :label="it.name" :value="it.id"></el-option>
        </el-select>
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
import { defineProps, ref, defineEmits, computed, watch } from "vue";
import { PRIORITY, STATUS, RESOULT } from "@/views/iteration/useCase/contantOptions";
import { ResponseParams } from "@/types/response";
import { useStore } from "@/store";
import { allMember } from "@/api/request-modules/product";
import { editUseCaseData, getIterationDemand, getBugTaskList } from "@/api/request-modules/iteration";
import { UploadFile } from "@/types/upload";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import useMessageTip from "@/composables/useMessageTip";
import api from "@/api/dict";
import { Plus, Close, Document } from "@element-plus/icons-vue";
import fileSave from "@/utils/fileSave";
import dayjs from "dayjs";
import { StaffSelectResp, InterateList, FileUpload } from "@/composables/useCommon";
import { getModuleData, ModuleNode, ModuleObj } from "@/components/module-manage";

interface Staff {
  staff_name: string;
  staff_no: string;
}
interface Task {
  name: string;
  id: number;
}
interface Demand {
  name: string;
  id: number;
  iteration_id: number;
}

const store = useStore();

const props = defineProps({
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

const loadingUpload = ref(false);

const iterateId = computed(() => store.getters?.iterateId);
const curProductInfo = computed(() => store?.getters?.productInfo);

const emit = defineEmits(["onChangeTask"]);
const { tipMessage } = useMessageTip();
const user = getSession("user", true) as USER;

// 获取用户下拉列表
const userList = ref<StaffSelectResp[]>([]);
const getUserList = (pId: number) => {
  if (!pId) return;
  allMember<ResponseParams.ResponseDataSuccess>({ product_id: pId }).then((res) => {
    if (res.data && res.data.length) {
      userList.value = res.data;
    } else {
      userList.value = [];
    }
  });
};
// 获取用户下拉列表

// 获取任务列表
const taskList = ref<Task[]>([]);
const getBugTaskData = (product_id: number, id?: any) => {
  getBugTaskList<ResponseParams.ResponseDataSuccess>({ product_id: product_id, iteration_id: id || 0 }).then((res) => {
    if (res.code === 200) {
      taskList.value = res.data;
    } else {
      taskList.value = [];
    }
  });
};
const moduleTree = ref<ModuleNode[]>();

// 获取模块select树数据  id: 在新增模块弹窗中删除模块的id，回调与当前列表进去比较
const getModuleSelectTree = async (id?: number) => {
  if (id) {
    if (props.demandForm.product_module_id === id) props.demandForm.product_module_id = 0;
    const obj: ModuleObj = {
      ids: [props.demandForm.id],
      product_module_id: 0,
      product_module_name: moduleTree.value[0]?.name || "",
      field: "product_module_id"
    };
    if (props.demandForm.id) updateData(obj);
  }
  const data = await getModuleData({
    id: curProductInfo.value?.id,
    name: curProductInfo.value?.name
  });
  if (data?.length) {
    moduleTree.value = data;
    moduleTree.value.unshift({
      value: -1,
      label: "管理模块",
      level: -1,
      id: -1,
      name: "管理模块"
    });
  }
};

// 获取迭代下拉列表
const iterationList = ref<InterateList[]>([]);
const getIterationData = () => {
  const iterateList = getSession("iterateList", true) as InterateList[];
  if (iterateList && iterateList.length) {
    iterationList.value = iterateList;
  } else {
    iterationList.value = [];
  }
};

// 项目列表
const productList = computed(() => store.getters.productList);

// 项目列表

// 需求列表
const demandData = ref<Demand[]>([]);
const iterationDemand = (product_id: number, id?: number) => {
  getIterationDemand<ResponseParams.ResponseDataSuccess>({ product_id: product_id, iteration_id: id || 0 }).then((res) => {
    demandData.value = res.data;
  });
};
// 需求列表

// 上传之前加载loading
const onBeforeUpload = () => {
  loadingUpload.value = true;
};

// 附件列表
const fileArr = computed(() => props.demandForm.attachment) || ref<FileUpload[]>([]);
//#region 文件上传
// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: UploadFile, fileList: Array<UploadFile>) => {
  loadingUpload.value = false;
  console.log(file);
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

// 监听demandForm，更新迭代列表(这块监听原因是迭代列表默认在父组件传入，如果在子组件修改项目，则需要更新迭代列表)
watch(
  () => props.demandForm,
  (val) => {
    if (val) {
      // 获取迭代列表
      getIterationData();
      getModuleSelectTree();

      setTimeout(() => {
        if (!userList.value.length) getUserList(val.product_id);
        // 获取需求列表
        if (!demandData.value.length) iterationDemand(val.product_id, val.iteration_id);
        // 获取任务列表
        if (!taskList.value.length) getBugTaskData(val.product_id, val.iteration_id);
      }, 300);
    }
  },
  {
    immediate: true
  }
);

// 监听迭代变化,清空部分数据
watch(
  () => iterateId.value,
  () => {
    userList.value = [];
    demandData.value = [];
    taskList.value = [];
  }
);

// 表单更新   props.demandForm.id存在代表编辑，不存在代表创建。 编辑是实时的改一个请求一次，创建是全部填充数据后一次性请求
const handleChangeForm = async (val: any, key: string) => {
  if (key === "demand_id") {
    if (!val) val = 0;
    props.demandForm.demand_id = val;
  }

  if (key === "task_id") {
    if (!val) val = 0;
    props.demandForm.task_id = val;
  }

  const obj: Record<string, any> = {
    ids: [props.demandForm.id]
  };
  if (key === "staff_no") {
    if (userList.value) {
      const op: any = userList.value[1];
      const userMsg = op.options.filter((item: Staff) => item.staff_no === val);
      obj.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_name = userMsg[0].staff_name;
      props.demandForm.staff_no = userMsg[0].staff_no;
    }
  }

  obj[key] = val;
  const keyArr = ["status", "level", "type"];
  if (keyArr.includes(key)) {
    obj[key] = val * 1;
  }

  obj.field = key;
  if (!props.demandForm.id) return;
  updateData(obj);
};

const handleChangeModule = (data: any) => {
  props.demandForm.product_module_id = data.value;
  props.demandForm.product_module_name = data.label;
  if (!props.demandForm.id) return;
  const obj: ModuleObj = {
    ids: [props.demandForm.id],
    product_module_id: data.value,
    product_module_name: data.label,
    field: "product_module_id"
  };
  updateData(obj);
};

// 编辑更新
const updateData = (params: Record<string, any>) => {
  editUseCaseData<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    if (res.code === 200) {
      emit("onChangeTask", props.demandForm.id);
      if (params.field === "staff_no") {
        setTimeout(() => {
          getUserList(props.demandForm.product_id);
        }, 500);
      }
      return tipMessage(200, "成功");
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

// 下载附件
const handleDownload = (val: FileUpload) => {
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
