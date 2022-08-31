<!--
 * @Author: 宋绍华
 * @Date: 2022-05-19 17:17:27
 * @LastEditTime: 2022-06-08 04:34:38
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\testBill\components\form.vue
-->
<template>
  <div class="form">
    <div style="text-align: right; margin-bottom: 10px"><Btns v-if="form.id" @onClick="btnCallback($event)" :status="Form.status" /></div>
    <el-form :model="Form" ref="ruleFormRef" label-position="left" label-width="100px">
      <el-form-item label="状态">
        <span class="form-status form-disable">{{ TESTBILLTYPES[Form.status - 1]?.label }}</span>
      </el-form-item>
      <el-form-item label="指派给" prop="staff_no">
        <el-select class="reset-select" filterable v-model="Form.staff_no" @change="changeProject('staff_no', Form.staff_no)">
          <el-option v-for="item in form.basicUser" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="归属项目">
        <span class="form-status form-disable">
          {{ productVal }}
        </span>
      </el-form-item>
      <el-form-item label="迭代">
        <el-select v-if="!hasIter" class="reset-select" filterable clearable v-model="Form.iteration_id" @change="changeProject('iterate', Form.iteration_id!)">
          <el-option v-for="item in form.iterate" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <span v-else class="form-status form-disable">{{ currentIter?.name }}</span>
      </el-form-item>
    </el-form>

    <div class="form-file">
      <div class="form-file-title">附件</div>
      <el-upload
        ref="upload"
        :show-file-list="false"
        @remove="removeFiles"
        :before-upload="onBeforeUpload"
        :on-success="handleSuccessFiles"
        :action="api.uploadAssets"
      >
        <span class="upload-icon">
          <el-icon>
            <Plus />
          </el-icon>
        </span>
      </el-upload>

      <ul class="list-detail" v-loading="uploadNum">
        <li v-for="item in fileArr" :key="item.addr" @click="handleDownload(item)">
          <el-icon class="list-detail-icon"><Document /></el-icon>
          <div class="detail-right">
            <el-icon class="icon-remove" @click.stop="handleRemove(item)"><Close /></el-icon>
            <p class="list-detail-p">{{ item.name }}</p>
            <p>{{ item.creator }} {{ item.create_time }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, reactive, defineEmits, ref, defineExpose, toRefs, watch, computed } from "vue";
import { dayjs } from "element-plus";
import api from "@/api/dict";
import { Plus, Document, Close } from "@element-plus/icons";
import { UploadFile } from "@/types/upload";
import { TESTBILLTYPES } from "@/utils/contantOptions";
import Btns from "../components/btns.vue";
import fileSave from "@/utils/fileSave";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import { store } from "@/store";

const emit = defineEmits(["change", "submit"]);
const props = defineProps({
  form: {
    type: Object,
    default: () => {
      return {};
    }
  },
  hasIter: {
    type: Boolean,
    default: false
  }
});
const ruleFormRef = ref();
const currentIter = computed(() => store.getters.currentIter);
// form 表单
const Form = reactive({
  status: 1,
  staff_no: "",
  product_id: undefined,
  iteration_id: undefined
});

// 附件列表
const fileArr = computed(() => fileList.value);

// 附件
const upload = ref();
const fileList = ref();
let uploadNum = ref(0);
const productVal = computed(() => {
  if (!Form.product_id) return "";
  return props.form.productLists.find((item: { id: number }) => item.id === Form.product_id)?.name;
});

watch(
  () => props.form,
  (newVal) => {
    Object.keys(Form).forEach((k) => {
      const d = k as keyof typeof Form;
      if (newVal?.id) {
        // @ts-ignore
        Form[d] = newVal[k] || undefined;
      } else {
        if (k !== "iteration_id") {
          // @ts-ignore
          Form[d] = k === "status" ? 1 : newVal[k];
        } else {
          // @ts-ignore
          Form[d] = undefined;
        }
      }
    });
    fileList.value = props.form.id ? newVal.attachment : [];
    // 过滤下该staff_no 是否存在列表中
    const hasStaff = props.form.basicUser.find((item: { value: string }) => item.value === Form.staff_no);
    if (!hasStaff) Form.staff_no = "";
  },
  {
    immediate: true,
    deep: true
  }
);

const user = getSession("user", true) as USER;

const getStaffName = () => {
  const item = props.form.basicUser.find((i: { label: string; value: string }) => i.value === Form.staff_no);
  return item?.label;
};

// 下载附件
const handleDownload = (val: Record<string, any>) => {
  fileSave(val.name, val.url || val.response?.url || "");
};

// 删除附件
const handleRemove = (val: Record<string, any>) => {
  fileArr.value.splice(val, 1);
  changeProject("files", 0, [...fileArr.value]);
};

// 暴露属性
defineExpose({
  files: fileList,
  formRef: ruleFormRef,
  formData: toRefs(Form),
  getStaffName: (() => getStaffName)(),
  clearFiles: () => {
    upload.value?.clearFiles();
    fileList.value = [];
  }
});

const changeProject = (type: "project" | "iterate" | "files" | "staff_no", val: number | string, uploadFiles?: UploadFile[]) => {
  emit("change", type, val, uploadFiles);
};

// 上传之前，统计有多少文件
const onBeforeUpload = () => {
  uploadNum.value++;
};

// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: UploadFile) => {
  const { name, size, url } = file;
  fileList.value.push({
    name,
    size,
    url: url || response?.url,
    creator: user?.name,
    create_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
  });

  // 编辑状态
  uploadNum.value--;
  if (props.form.id) {
    if (uploadNum.value === 0) {
      // @ts-ignore 查找重新上传的文件信息
      const files1 = fileList.value.filter((item) => !item?.id);
      // @ts-ignore, 查找接口返回的文件内容
      const files2 = fileList.value.filter((item) => item?.id);
      const arr = files1.map((item: UploadFile) => {
        const { name, url, size, response } = item;
        return {
          name,
          size,
          url: url || response?.url,
          creator: user?.name,
          create_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };
      });
      // @ts-ignore
      changeProject("files", 0, [...arr, ...files2]);
    }
  }
};

// 文件移除
const removeFiles = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  if (!props.form.id) return;
  changeProject("files", 0, uploadFiles);
};

//弹窗里的回调
const btnCallback = (params: { toStatus: number; curStatus: number }) => {
  const { id, notify_list } = props.form;
  emit("submit", { id, notify_list }, params);
};
</script>

<style lang="less" scoped>
.form {
  &-file {
    margin-top: 150px;
    .upload-icon {
      margin-top: 10px;
      display: inline-block;
      width: 50px;
      height: 50px;
      font-weight: 700;
      background: #e3e3e3;
      line-height: 50px;
      text-align: center;
      border-radius: 4px;
    }
  }

  &-status {
    color: var(--el-text-color-regular);
    // margin-left: 14px;
  }

  &-disable {
    background-color: var(--el-disabled-bg-color);
    box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
    cursor: not-allowed;
    padding: 0 12px;
    display: inline-flex;
    background-image: none;
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    transition: var(--el-transition-box-shadow);
    min-height: 32px;
    line-height: 32px;
    text-align: left;
    color: var(--el-disabled-text-color);
    width: 160px;
  }
}
.img-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  &-item {
    width: 100px;
    height: 100px;
    margin-left: 10px;
    margin-bottom: 10px;
    border-radius: 10px;

    &-file {
      height: 100%;
      width: 100%;
      background: #f5f7fa;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      flex-direction: column;
    }
  }
}

:global(.img-dialog .el-dialog__headerbtn) {
  top: -8px;
}

:global(.el-upload-list__item-name) {
  display: block;
  width: 84%;
  text-align: left;
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

    &:hover {
      .list-detail-p {
        .table-link;
        text-decoration: underline;
      }
    }

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
</style>
