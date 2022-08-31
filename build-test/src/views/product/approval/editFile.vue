<!--
 * @Author: 宋绍华
 * @Date: 2022-01-20 09:46:24
 * @LastEditTime: 2022-04-16 16:26:50
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\approval\editFile.vue
-->

<template>
  <div class="file-content">
    <div class="file" style="margin-top: 20px; margin-bottom: 20px">
      <el-upload
        v-if="canEdit"
        limit="5"
        :file-list="attachmentList"
        :on-remove="handleRemoveFiles"
        :on-success="handleSuccessFiles"
        :action="api.uploadAssets"
        multiple
      >
        <span :class="{ text: canEdit }">上传附件</span>
      </el-upload>
      <div v-else>
        <span :class="{ text: canEdit }">上传附件</span>
        <ul class="file-ul" style="margin: 10px">
          <li @click="downloadFile(n.title, n.addr)" v-for="n in attachment" :key="n.addr">{{ n.title }}</li>
        </ul>
      </div>
    </div>
    <p v-if="canEdit ? !tempAttachment.length : !attachment?.length" style="font-size: 14px; color: #999; margin-left: 20px; margin-top: -8px" class="empty">
      暂无附件
    </p>
  </div>
</template>

<script lang="ts">
export interface EditFileInter {
  attachment: DementApprovalAttachment[];
}
import { ref, defineExpose, defineProps, withDefaults, watch, defineEmits } from "vue";
import { DementApprovalAttachment } from "@/types/interface";
import api from "@/api/dict";
import fileSave from "@/utils/fileSave";
import { cloneDeep } from "lodash";

export default {
  name: "editFile"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["changeTableForm"]);
const props = withDefaults(
  defineProps<{
    attachment: DementApprovalAttachment[];
    canEdit: boolean;
  }>(),
  {
    attachment: () => [],
    canEdit: false
  }
);
// file 上传文件
const attachmentList = ref<Array<Record<string, any>>>([]);
const tempAttachment = ref<Array<Record<string, any>>>([]);
const originAttachment = ref<Array<Record<string, any>>>([]);

watch(
  () => props.attachment,
  (newVal) => {
    if (newVal) {
      tempAttachment.value = newVal.map((v: Record<string, any>) => {
        const { addr: url, title: name, size } = v;
        return { name, url, size };
      });
      attachmentList.value = cloneDeep(tempAttachment.value);
      originAttachment.value = cloneDeep(tempAttachment.value);
    } else {
      attachmentList.value.length = 0;
      tempAttachment.value.length = 0;
      originAttachment.value.length = 0;
    }
  },
  { deep: true, immediate: true }
);
watch(
  () => tempAttachment.value,
  (newVal) => {
    if (newVal.length !== originAttachment.value.length) return emit("changeTableForm", true);
    let num = 0;
    for (let i = 0; i < newVal.length; i++) {
      let name, url;
      const item = newVal[i];
      const originItem = originAttachment.value[i];
      if (item.response) {
        name = item.response.filename;
        url = item.response.url;
      } else {
        name = item.name;
        url = item.url;
      }
      if (name !== originItem.name || url !== originItem.url) {
        emit("changeTableForm", true);
        break;
      } else {
        num += 1;
      }
    }
    // 如果每个都相同，说明没有变动
    if (num > 0 && num === newVal.length) emit("changeTableForm", false);
  },
  { deep: true, immediate: true }
);

const handleRemoveFiles = (_: any, fileList: Record<string, any>) => {
  tempAttachment.value = fileList.slice();
};

// 文件上传
const handleSuccessFiles = (response: Record<string, any>, file: Record<string, any>, fileList: Array<Record<string, any>>) => {
  // 七牛上传成功后有时候返回url为空
  if (response.url) {
    tempAttachment.value = fileList.slice();
  }
};

// 输出
const getOutPutFileList = () => {
  return tempAttachment.value.map((item) => {
    if (item.response) {
      const { filename: title, size, url: addr } = item.response as Record<string, any>;
      return { title, size, addr };
    }
    const { name: title, url: addr, size } = item;
    return { title, addr, size };
  });
};
// 下载文件
const downloadFile = (title: string, url: string) => {
  if (url) {
    fileSave(title, url);
  }
};

defineExpose({
  getOutPutFileList
});
</script>

<style lang="less" scoped>
.file-content {
  .file {
    margin-top: 20px;
    margin-bottom: 20px;

    &-ul {
      margin: 10px;
      li {
        cursor: pointer;
      }
    }
  }
  .text {
    .icon-circle();
  }

  .empty {
    font-size: 14px;
    color: #999;
    margin-left: 20px;
    margin-top: -8px;
  }
}
</style>
