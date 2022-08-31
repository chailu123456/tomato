<!--
 * @Author: 宋绍华
 * @Date: 2022-02-10 12:22:45
 * @LastEditTime: 2022-02-21 11:40:35
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\layout\header\components\handleProduct.vue
-->
<template>
  <el-dialog title="新增" v-model="visible" width="40%" center :append-to-body="true" @close="cancel">
    <el-form :model="formData" :rules="rules" id="productRef" ref="productRef" label-width="100px" class="product-form">
      <el-form-item label="项目名称" prop="name">
        <el-input placeholder="请输入2-10字项目名称" type="text" v-model="formData.name" maxlength="10"></el-input>
      </el-form-item>
      <el-form-item label="项目编号" prop="code">
        <el-input
          oninput="value=value.replace(/[^\d]/g,'')"
          placeholder="请输入项目部门中项目序号，最大999"
          type="text"
          v-model="formData.code"
          maxlength="3"
        ></el-input>
      </el-form-item>
      <el-form-item class="product-form__special" label="提醒地址" prop="notify_url">
        <div>
          <el-input placeholder="请输入企业微信群机器人地址，系统会在22:00推送项目进度汇报" type="text" v-model="formData.notify_url"></el-input>
          <span class="product-form__special-text"
            >企业微信群机器人地址，多个地址用“,”隔开；填写后番茄会在每天22:00将项目下各迭代情况发送到企业微信机器人所在群聊，便于项目汇报；</span
          >
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input show-word-limit placeholder="请输入备注" type="textarea" :autosize="{ minRows: 4 }" v-model="formData.remark" maxlength="200"></el-input>
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
import { defineProps, ref, defineEmits, watch } from "vue";
import useCerateOrEditProduct, { rules } from "../composables/useCeateOrEditProduct";

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

const handleConfirmSave = () =>
  confirmSave(productRef.value, Object.keys(props.dialogParams).length ? formData : null, () => {
    cancel();
    emit("updateInfo");
  });
const cancel = () => {
  resetDialogParams(productRef.value);
  emit("update:visible", false);
};
</script>

<style lang="less" scoped>
.product-form {
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
