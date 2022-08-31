<template>
  <div class="rp-doc-dialog">
    <el-dialog
      top="10vh"
      :title="dialogTitle"
      :close-on-press-escape="false"
      v-model="dialogDemand"
      :show-close="false"
      :close-on-click-modal="false"
      width="40%"
    >
      <div class="doc-dialog">
        <div class="radio-list">
          <div class="doc-title">
            <span>文档类型</span>
            <span>{{ titleArr[radio - 1] }}</span>
          </div>
          <el-radio-group v-model="radio" :disabled="disableRadio" @change="handleRadio">
            <el-radio :label="1">文件</el-radio>
            <el-radio :label="2">网址链接</el-radio>
            <el-radio v-if="demandDocForm.planId" :label="4">关联已上传文档</el-radio>
            <el-radio v-if="!type" :label="3">文档合集</el-radio>
            <el-radio v-else :label="4">关联已上传文档</el-radio>
          </el-radio-group>
        </div>
        <div class="tab-content-list">
          <div v-if="radio === 1" class="file-upload">
            <div class="file-select">
              <el-select v-model="selectValue" class="m-2" placeholder="Select">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <span class="select-tip">{{ fileTipArr[selectValue] }}</span>
            </div>
            <el-upload
              class="upload-demo"
              ref="upload"
              drag
              :show-file-list="false"
              :action="api.uploadAssets"
              :before-upload="uploadChange"
              :on-success="handleSuccessFiles"
              :on-exceed="handleExceed"
              :on-preview="handlePreview"
              :on-progress="handleProgress"
              :accept="fileAccept"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                <div>
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                </div>
                将文件拖到此处，或<em>点击选择文件上传</em>
              </div>
            </el-upload>
            <ul class="list-detail">
              <li v-for="(item, index) in fileList" :key="index" @click="handlePreview(item)">
                <div class="detail-right">
                  <el-icon class="icon-remove" @click.stop="handleRemove(index)"><Close /></el-icon>
                  <p>{{ item.name }}</p>
                </div>
              </li>
            </ul>
            <el-progress v-if="isProgress" :stroke-width="6" :percentage="uploadPercent" />
          </div>
          <div v-if="radio === 2" class="website-link">
            <el-input placeholder="请输入http:或https://开头网址链接" @blur="getTitle(linkVal)" maxlength="500" v-model.trim="linkVal" />
          </div>
          <div v-show="radio === 3" class="doc-arr">
            <DocTree @checkVal="checkVal" :dialogShow="dialogDemand" :treeDoc="treeDoc"></DocTree>
          </div>
          <div v-show="radio === 4" class="relative-doc">
            <DocTreeList @checkVal="checkVal" :dialogShow="dialogDemand" :demandDocForm="demandDocForm" :treeDoc="treeDoc"></DocTreeList>
          </div>
        </div>
        <div class="doc-input-title" v-if="radio != 4">
          <p>{{ radio != 3 ? "文档标题" : "文档集合标题" }}</p>
          <el-input v-model="paramsVal.title" v-trim placeholder="请输入标题" maxlength="50" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: "doc-dialog"
};
</script>
<script lang="ts" setup>
import { defineProps, ref, computed, defineEmits, watch } from "vue";
import DocTree from "./docTree.vue";
import DocTreeList from "./docTreeList.vue";
import { UploadFile } from "@/types/upload";
import { UploadFilled } from "@element-plus/icons-vue";
import useMessageTip from "@/composables/useMessageTip";
import type { UploadProps, UploadRawFile, UploadProgressEvent } from "element-plus";
import { genFileId, UploadUserFile } from "element-plus";
import useDemandDoc, { OptionDocParams } from "@/composables/useDemandDoc";
import api from "@/api/dict";
import { ElLoading } from "element-plus";
import { store } from "@/store";
import { downloadUrl } from "@/utils";
import { Close } from "@element-plus/icons-vue";

import { checkURL } from "@/utils";

const { tipMessage } = useMessageTip();
const { useAddDemandDoc, updateDemandDoc, useAddChildDemandDoc, useGetUrlTitle, useDemandPlanRelativeAdd } = useDemandDoc();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  demandDocForm: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  },
  type: {
    type: Number,
    default: 0
  }
});
const productId = computed(() => store.getters.productId);
const isProgress = ref(false);
const treeDoc = computed(() => {
  return { id: props.demandDocForm.parent_id ? 0 : props.demandDocForm.id };
});

const disableRadio = computed(() => {
  return props.demandDocForm.id ? true : false;
});

const uploadPercent = ref(0);

// 压缩格式数组
let arr = [".zip", ".rar", ".tar", ".7z", ".gz"];
const dialogTitle = ref("新增文档");
const emit = defineEmits(["update:visible", "updateVal"]);
const radio = ref(1);
const upload: any = ref();
const titleArr = ref([
  "上传文件将自动识别类型，html压缩包、rp文件支持在线查看，其他文件需下载后查看",
  "输入其他网站完整链接地址",
  "创建文档集合，可关联未关联过其他文档合集的文档",
  "可关联未关联过其他文档合集的文档"
]);
const fileTipArr = ref([
  "上传Axure RP文件，请勿将文件放到其他文件或压缩包中",
  "上传HTML 压缩包，需包含 index.html 或 start.html",
  "上传其他任意类型的文件，不支持在线预览，可下载后查看"
]);
const acceptArr = [".rp", ".zip, .rar, .tar, .7z, .gz", ""];
const fileAccept = ref(".rp");

const selectValue = ref(0);
const linkVal = ref("");
const fileVal = ref("");
// 类型  1.rp  2.未知  3.文件夹 4.html  5.url
const options = [
  {
    value: 0,
    label: "Axure RP"
  },
  {
    value: 1,
    label: "HTML 压缩包"
  },
  {
    value: 2,
    label: "其它文件"
  }
];
const fileList = ref<UploadUserFile[]>([]);

let originFileList: any = [];
// 控制显示隐藏弹框
const dialogDemand = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
const originParamsVal = ref<OptionDocParams>({
  children: [],
  plan_id: 0,
  product_id: productId.value,
  size: 0,
  title: "",
  type: 1,
  url: "",
  file_name: "",
  id: 0,
  parent_id: 0
});
const paramsVal = ref<OptionDocParams>({
  children: [],
  plan_id: 0,
  product_id: productId.value,
  size: 0,
  title: "",
  type: 1,
  url: "",
  file_name: "",
  id: 0,
  parent_id: 0
});

const handleProgress = (evt: UploadProgressEvent) => {
  if (evt.percent < 101 && evt.percent > 90) uploadPercent.value = 99;
  else uploadPercent.value = Number(evt.percent.toFixed(2));
};
let isUpload = true;
let loading: any = null;
const uploadChange = async (file: UploadFile) => {
  const type = file.name.substring(file.name.lastIndexOf("."));
  if (selectValue.value === 0) {
    if (!type.includes(".rp")) {
      // fileList.value = originFileList;
      isUpload = false;
      return tipMessage(400, `上传格式不正确，请上传.rp文件格式`);
    }
  } else if (selectValue.value === 1) {
    if (!arr.includes(type)) {
      // fileList.value = originFileList;
      isUpload = false;
      return tipMessage(400, `上传格式不正确，请上传正确的压缩文件格式`);
    }
  }
  const isLt500M = file.size / 1024 / 1024 < 200;
  if (!isLt500M) return tipMessage(400, `请上传小于200M文件`);
  isProgress.value = true;
  uploadPercent.value = 0;
  loading = ElLoading.service({ lock: true, text: "上传中...", background: "rgba(0, 0, 0, 0.7)" });
  isUpload = true;
};
const handlePreview = (file: any) => {
  if (file.url) downloadUrl(file.url, file.name);
};
// 文件上传
const handleSuccessFiles = (response: Record<string, any>) => {
  loading.close();
  if (isUpload) {
    upload.value.clearFiles();
    fileList.value = [];
    originFileList = [];
    // 七牛上传成功后有时候返回url为空
    if (response.url) {
      console.log(response);
      paramsVal.value.file_name = response.filename;
      paramsVal.value.size = response.size;
      let name = response.filename.split(".");
      name.pop();

      if (!paramsVal.value.title) paramsVal.value.title = name.join("") || "";

      fileVal.value = response.url;
      fileList.value = [
        {
          name: response.filename || "文件",
          url: response.url
        }
      ];
    }
  }
  isProgress.value = false;
  uploadPercent.value = 0;
};

const getTitle = async (url: string) => {
  // 只有在url存在并且文档标题不存在下才会请求
  if (!paramsVal.value.title && url) {
    let data = await useGetUrlTitle({ url });
    if (data) {
      paramsVal.value.title = data.title || "";
    }
  }
};

// 确定提交事件---请求方法
const submitData = async () => {
  if (paramsVal.value.parent_id) {
    const data = await useAddChildDemandDoc(paramsVal.value);
    if (data) {
      setTimeout(() => {
        emit("updateVal");
      }, 1000);
      // 清空数据
      handleClose();
    }
    return;
  }

  if (props.demandDocForm.planAdd && radio.value === 4) {
    if (paramsVal.value.children && paramsVal.value.children.length) {
      const obj = {
        plan_id: paramsVal.value.plan_id,
        children: paramsVal.value.children
      };
      const data = await useDemandPlanRelativeAdd(obj);
      if (data) {
        setTimeout(() => {
          emit("updateVal");
        }, 1000);
        // 清空数据
        handleClose();
      }
      return;
    }
    return tipMessage(400, `请选择关联已上传文档`);
  }
  if (paramsVal.value.id) {
    const data = await updateDemandDoc(paramsVal.value);
    if (!data) return;
  } else {
    const data = await useAddDemandDoc(paramsVal.value);
    if (!data) return;
  }
  dialogDemand.value = false;
  setTimeout(() => {
    if (paramsVal.value.type === 3) emit("updateVal");
    else {
      emit("updateVal", paramsVal.value.id);
    }
    // 清空数据
    handleClose();
  }, 1000);
};

// 删除附件
const handleRemove = (val: number) => {
  fileList.value.splice(val, 1);
};

// 确定  // 类型  1.rp  2.未知  3.文件夹 4.html  5.url
const handleConfirm = () => {
  if (radio.value != 4) {
    if (!paramsVal.value.title) return tipMessage(400, `请输入1-50字以内的标题`);
  }
  if (radio.value === 1) {
    paramsVal.value.url = fileVal.value;
    let obj: Record<number, number> = {
      0: 1,
      1: 4,
      2: 2
    };
    paramsVal.value.type = obj[selectValue.value];
    if (!fileList.value.length) return tipMessage(400, `请上传文件`);
    if (paramsVal.value.file_name) {
      const type = paramsVal.value.file_name.substring(paramsVal.value.file_name.lastIndexOf("."));
      if (selectValue.value === 0) {
        if (!type.includes(".rp")) {
          return tipMessage(400, `选择类型与上传格式不正确，请修改`);
        }
      } else if (selectValue.value === 1) {
        if (!arr.includes(type)) {
          return tipMessage(400, `选择类型与上传格式不正确，请修改`);
        }
      }
    }
  } else if (radio.value === 2) {
    if (!linkVal.value) return tipMessage(400, `请输入网址链接`);
    if (!checkURL(linkVal.value)) return tipMessage(400, `请输入http://或https://开头正确的链接地址`);
    paramsVal.value.url = linkVal.value;
  } else if (radio.value === 4) {
    if (!paramsVal.value.children || !paramsVal.value?.children.length) return tipMessage(400, `请选择要关联的文档`);
  }
  const curProductId = computed(() => store.getters.productId);
  paramsVal.value.product_id = curProductId.value;
  submitData();
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

// 类型  1.rp  2.未知  3.文件夹 4.html  5.url
const handleRadio = (val: number) => {
  if (val === 2) {
    paramsVal.value.type = 5;
  } else if (val === 3 || val === 4) {
    paramsVal.value.type = 3;
  } else {
    let obj: Record<number, number> = {
      0: 1,
      1: 4,
      2: 2
    };
    paramsVal.value.type = obj[selectValue.value];
  }
};

const checkVal = (val: number[]) => {
  paramsVal.value.children = val;
};

// 弹框关闭事件
const handleClose = () => {
  linkVal.value = "";
  fileVal.value = "";
  selectValue.value = 0;
  radio.value = 1;
  fileList.value = [];
  originFileList = [];
  paramsVal.value = originParamsVal.value;
  paramsVal.value.title = "";
  paramsVal.value.parent_id = 0;
  paramsVal.value.file_name = "";
  emit("update:visible", false);
};

const dataSet = (params: Record<string, any>) => {
  if (params.id && !params.parent_id) {
    const formData = params;
    if (formData.type === 5) {
      radio.value = 2;
      linkVal.value = formData.url;
      paramsVal.value.url = formData.url;
    } else if (formData.type === 3) {
      radio.value = 3;
    } else {
      let obj: Record<number, number> = {
        1: 0,
        4: 1,
        2: 2
      };
      radio.value = 1;
      selectValue.value = obj[formData.type];
      fileList.value.push({
        name: formData.file_name || "文件",
        url: formData.url
      });
      originFileList.push({
        name: formData.file_name || "文件",
        url: formData.url
      });
    }
    dialogTitle.value = "编辑文档";
    fileVal.value = formData.url;
    paramsVal.value.title = formData.title;
    paramsVal.value.id = formData.id;
    paramsVal.value.size = formData.size || 0;
    paramsVal.value.plan_id = formData.planId || 0;
    paramsVal.value.file_name = formData.file_name;
    paramsVal.value.type = formData.type;
    let ids: number[] = [];
    if (formData.children && formData.children.length) {
      formData.children.forEach((item: Record<string, any>) => {
        ids.push(item.id);
      });
    }
    paramsVal.value.children = ids;
  } else if (params.parent_id || params.planId) {
    paramsVal.value.parent_id = params.parent_id;
    paramsVal.value.plan_id = params.planId || 0;
    paramsVal.value.id = 0;

    dialogTitle.value = "新增文档";
  } else {
    paramsVal.value.id = 0;
    dialogTitle.value = "新增文档";
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      dataSet(props.demandDocForm);
    } else {
      upload.value?.clearFiles();
      fileList.value = [];
      originFileList = [];
    }
  },
  {
    immediate: true,
    deep: true
  }
);

watch(
  () => selectValue.value,
  () => {
    fileAccept.value = acceptArr[selectValue.value];
  },
  {
    immediate: true
  }
);
</script>
<style lang="less">
.rp-doc-dialog {
  .el-dialog__body {
    padding-bottom: 0;
    padding-top: 10px;
  }
  .el-dialog__footer {
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  .doc-dialog {
    min-height: 440px;
    max-height: 550px;
    // overflow: scroll;
    overflow-x: hidden;
    .radio-list {
      .doc-title {
        margin-top: 10px;

        display: flex;
        align-items: center;
        span:first-child {
          font-size: 14px;
          margin-right: 10px;
        }
        span:last-child {
          font-size: 12px;
          color: #999999;
        }
      }
      .el-radio-group {
        margin: 10px 0;
      }
    }
    .tab-content-list {
      .file-upload {
        .file-select {
          span.select-tip {
            margin-left: 10px;
            font-size: 12px;
            color: #999999;
          }
        }
        .upload-demo {
          margin: 10px 0;
          .el-upload-list__item-name {
            text-align: left;
          }
        }
      }
    }
    .doc-input-title {
      margin-bottom: 10px;
    }

    .content-body {
      margin-top: 10px;
      height: 0px;
      border: 1px solid #dddfe6;
    }
  }
  .list-detail {
    margin-top: 10px;
    li {
      display: flex;
      justify-content: space-between;
      height: 30px;
      line-height: 30px;
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
        width: 100%;
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
          top: 8px;
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
</style>
