<!--
 * @Author: 宋绍华
 * @Date: 2022-02-10 12:22:45
 * @LastEditTime: 2022-05-29 15:20:12
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\handleProduct.vue
-->
<template>
  <el-dialog
    :title="dialogParams.id ? '编辑项目' : '新增项目'"
    :close-on-press-escape="false"
    v-model="visible"
    width="40%"
    center
    :append-to-body="true"
    @close="cancel"
  >
    <el-form :model="formData" :rules="rules" id="productRef" ref="productRef" label-width="100px" class="product-form">
      <el-form-item label="项目logo" name="logo">
        <el-upload
          accept=".jpg,.jpeg,.png"
          list-type="picture"
          v-loading="loading"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleSuccessFiles"
          :action="api.uploadAssets"
        >
          <div class="wrap">
            <span class="wrap-text">点击更换</span>
            <img class="logo" :src="formData.logo || CONSTVAR.LOGO" />
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="项目名称" prop="name">
        <el-input placeholder="请输入2-20字项目名称" type="text" v-model="formData.name" maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="项目代号" prop="code">
        <el-input placeholder="部门中的项目序号，如番茄：NRPD-21" type="text" v-model="formData.code"></el-input>
      </el-form-item>
      <el-form-item class="product-form__special" label="提醒地址" prop="notify_url">
        <div>
          <el-input placeholder="请输入企业微信群机器人地址，系统会在22:00推送项目进度汇报" type="text" v-model="formData.notify_url"></el-input>
          <span class="product-form__special-text"
            >企业微信群机器人地址，多个地址用“,”隔开；填写后番茄会在每天22:00将项目下各迭代情况发送到企业微信机器人所在群聊，便于项目汇报；</span
          >
        </div>
      </el-form-item>
      <el-form-item label="项目备注">
        <el-input show-word-limit placeholder="请输入备注" type="textarea" :autosize="{ minRows: 4 }" v-model="formData.remark" maxlength="500"></el-input>
      </el-form-item>
      <el-form-item label="需求审批" prop="is_approval">
        <el-switch :active-value="1" :inactive-value="0" v-model="formData.is_approval" />
        <span style="margin-left: 10px" v-if="formData.is_approval === 1">需求池内的需求需要提交审批单，领导审批通过后才可以排期迭代</span>
        <span style="margin-left: 10px" v-else>需求池内的需求无需提交审批单，可以直接进行排期迭代</span>
      </el-form-item>
      <el-form-item label="邮件汇报" prop="is_report">
        <el-switch :active-value="1" :inactive-value="0" v-model="formData.is_report" />
        <span style="margin-left: 10px" v-if="formData.is_report === 1">每周通过邮件向领导汇报项目进度时，需要统计本项目</span>
        <span style="margin-left: 10px" v-else>每周通过邮件向领导汇报项目进度时，无需统计本项目</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" v-debounce @click="handleConfirmSave">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineProps, ref, defineEmits, watch, nextTick } from "vue";
import useCerateOrEditProduct, { rules } from "../composables/useCeateOrEditProduct";
import api from "@/api/dict";
import { UploadFile } from "@/types/upload";
import { ElMessage, UploadRawFile } from "element-plus";
import { CONSTVAR } from "@/utils/enum";

export default {
  name: "handleProduct"
};
</script>

<script lang="ts" setup>
const { dialogParams: formData, resetDialogParams, confirmSave } = useCerateOrEditProduct();
const productRef = ref<(HTMLElement & { resetFields: () => void; clearValidate: () => void; validate: (...args: Array<any>) => void }) | null>(null);
const emit = defineEmits(["update:visible", "updateInfo"]);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dialogParams: {
    type: Object,
    default: () => ({})
  }
});

const loading = ref(false);

watch(
  () => props.visible,
  () => {
    Object.keys(formData).forEach((key) => {
      formData[key] = props.dialogParams[key];
    });
  },
  {
    deep: true,
    immediate: true
  }
);

const handleConfirmSave = () => {
  confirmSave(productRef.value, Object.keys(props.dialogParams).length ? formData : null, () => {
    cancel();
    emit("updateInfo");
  });
};

const cancel = () => {
  resetDialogParams(productRef.value);
  emit("update:visible", false);
};

const beforeUpload = (rawFile: UploadRawFile) => {
  if (rawFile.type !== "image/jpeg" && rawFile.type !== "image/png") {
    ElMessage.error("jpeg/png类型");
    return false;
  }

  loading.value = true;
  return true;
};

// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: UploadFile, fileList: UploadFile[]) => {
  // 七牛上传成功后有时候返回url为空
  formData.logo = response.url;
  nextTick(() => {
    loading.value = false;
  });
};
</script>

<style lang="less" scoped>
.product-form {
  .logo {
    width: 50px;
    height: 50px;
    border-radius: 5px;
  }

  .wrap {
    position: relative;

    &-text {
      position: absolute;
      bottom: 5px;
      color: #fff;
      font-size: 12px;
      background-color: #222;
      opacity: 0.7;
      transform: scale(0.8);
      width: 130%;
      left: -14%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  :deep(.el-form-item) {
    display: flex;
  }
  :deep(.el-form-item__content) {
    flex-grow: 1;
  }

  &__special {
    :deep(.el-form-item__content) {
      flex: 1;
    }

    &-text {
      display: inline-block;
      line-height: 1.5;
      font-size: 12px;
      margin: 5px 0;
      color: #999;
    }
  }
}
</style>
