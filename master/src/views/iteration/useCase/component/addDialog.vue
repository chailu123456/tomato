<template>
  <el-dialog title="快捷导入" custom-class="rp-usacase-upload" v-model="exportShow" @close="dialogClose" width="30%">
    <div>
      <p style="margin-top: 0">1、下载模板</p>
      <span style="color: #989797">
        下载测试用例模板，并按照规则填写内容
        <a href="#" style="color: #1f9f85" @click="downLoad">下载模板</a>
      </span>
    </div>
    <div>
      <p>2、上传内容</p>
      <el-upload
        class="upload-demo"
        ref="fileList"
        drag
        action="alert"
        :auto-upload="false"
        multiple
        :on-change="uploadChange"
        :limit="1"
        :on-exceed="handleExceed"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          <div>
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          </div>
          将文件拖到此处，或<em>点击选择文件上传</em>
        </div>
      </el-upload>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" v-debounce @click="handleExportData">开始导入</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog title="导入结果" custom-class="rp-usacase-upload" v-model="exportResoult" width="30%">
    <div>
      <p>导入失败！</p>
      <div>失败原因已标识在表格中<span class="table-link file-download-btn" @click="handleDownload">下载表格</span></div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps } from "vue";
import { useCaseImport } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { ElLoading } from "element-plus";
import { useStore } from "@/store";
import { setObjStringify } from "@/utils";
import useMessageTip from "@/composables/useMessageTip";
import { genFileId } from "element-plus";
import type { UploadProps, UploadRawFile } from "element-plus";
import { UploadFile } from "@/types/upload";
import { UploadFilled } from "@element-plus/icons-vue";
import fileSave from "@/utils/fileSave";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["update:visible", "update"]);
const excalUrl = ref("");
const fileName = ref("");

const exportResoult = ref(false);

// 控制显示隐藏弹框
const exportShow = computed({
  get: () => props.visible,
  set: (val) => {
    emit("update:visible", val);
  }
});
const store = useStore();

const fileList = ref();
const { tipMessage } = useMessageTip();

const curProductInfo = computed(() => store?.getters?.productInfo);
const iterateId = computed(() => store?.getters?.iterateId);

const handleCancel = () => {
  fileList.value.clearFiles();
  fileName.value = "";
  exportShow.value = false;
  exportResoult.value = false;
};

const handleExceed: UploadProps["onExceed"] = (files) => {
  fileList.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  fileList.value!.handleStart(file);
};

const dialogClose = () => {
  fileList.value.clearFiles();
  fileName.value = "";
};

let formData = new FormData();
const uploadChange = async (file: UploadFile) => {
  formData = new FormData();
  if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
    fileList.value.clearFiles();
    fileName.value = "";
    return tipMessage(400, `上传格式不正确，请上传xls或者xlsx格式`);
  }
  fileName.value = file.name;

  formData.append("file", file.raw);
  formData.append("iteration_id", iterateId.value);
};

const handleExportData = () => {
  if (!fileName.value) return tipMessage(400, `请上传xls或者xlsx格式文件`);
  let loading = ElLoading.service({ lock: true, text: "导入中...", background: "rgba(0, 0, 0, 0.7)" });
  useCaseImport<ResponseParams.ResponseDataSuccess>(formData).then((res: any) => {
    if (res.data && res.data.success) {
      exportShow.value = false;
      emit("update");
      loading.close();
    } else {
      loading.close();
      console.log(res);
      if (res.code === 400) {
        return;
      }
      exportShow.value = false;
      exportResoult.value = true;
      excalUrl.value = res.data.url;
    }
  });
};
const downLoad = () => {
  setObjStringify({ product_id: curProductInfo.value.id, type: [] }, "/api/tomato/test-case/download-template");
};

const handleDownload = () => {
  fileSave("导入失败", excalUrl.value);
};
</script>
<style lang="less">
.rp-usacase-upload {
  .el-upload-list__item-name {
    text-align: left;
  }
  .file-download-btn {
    margin-left: 10px;
  }
}
</style>
