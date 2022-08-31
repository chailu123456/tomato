<!--
 * @Author: 宋绍华
 * @Date: 2022-05-30 18:07:31
 * @LastEditTime: 2022-06-02 10:45:27
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\iteration\homePage\components\demandEdit.vue
-->
<template>
  <el-dialog v-model="visible" title="需求说明" width="50%" :before-close="beforeClose">
    <ul class="plan-file-list" v-loading="loading">
      <li class="file-list-show" v-for="(item, index) in demand_docs" :key="index">
        <el-select class="file-select" v-model="item.type" :disabled="props.type === 2" @change="handleSelect(item)" placeholder="请选择">
          <el-option v-for="item in fileList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <el-input :disabled="props.type === 2" v-if="item.type === 1" class="file-url" v-model="item.url" placeholder="请输入需求链接地址"></el-input>
        <div class="file-btn" v-else>
          <span class="file-btn-span" v-if="props.type === 2" @click="fileSave(item.name, item.url)">{{ item.name }}</span>
          <el-upload
            v-else
            :disabled="props.type === 2"
            :show-file-list="false"
            :on-success="(resp: UploadFile, file: UploadFile, files: UploadFile[]) => handleSuccessFiles(resp, file, files, index)"
            :action="api.uploadAssets"
            :limit="1"
            :on-remove="(file: UploadFile, files: UploadFile[]) => onRemove(file, index)"
          >
            <span class="file-btn-span2" v-if="item.url || item.name">{{ item.name }}</span>
            <el-button v-else icon="el-icon-plus" size="small">上传文件</el-button>
          </el-upload>
        </div>
        <el-input :disabled="props.type === 2" class="file-remark" v-model="item.remark" maxlength="10" placeholder="备注，10字内"></el-input>

        <el-icon class="file-action" @click="handleOperation(index, item.type)" v-if="props.type === 1 && index === 0">
          <circle-plus />
        </el-icon>
        <el-icon style="color: #f56c6c" class="file-action" @click="handleOperation(index, item.type)" v-if="props.type === 1 && index > 0">
          <Remove />
        </el-icon>
      </li>
    </ul>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible2', false)">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineProps, ref, defineEmits, PropType, watch } from "vue";
import { CirclePlus, Remove } from "@element-plus/icons";
import fileSave from "@/utils/fileSave";
import api from "@/api/dict";

export default {
  name: "demandEdit",
  components: {
    Remove
  }
};
</script>

<script lang="ts" setup>
import type { UploadFile } from "@/types/upload";
import { DemandReqItemsFile } from "@/composables/useIteration";
import { computed } from "@vue/reactivity";
const emit = defineEmits(["submit", "update:visible2"]);
const props = defineProps({
  visible2: {
    type: Boolean,
    default: true
  },
  files: {
    type: Array as PropType<DemandReqItemsFile[]>,
    default: () => []
  },
  type: {
    type: Number,
    default: 1
  }
});

const demand_docs = ref<DemandReqItemsFile[]>([
  {
    name: "",
    size: 0,
    type: 1,
    url: "",
    remark: ""
  }
]);

const fileList = [
  {
    value: 1,
    label: "需求链接"
  },
  {
    value: 2,
    label: "需求文件"
  }
];

const visible = computed(() => props.visible2);
const loading = ref(true);

watch(
  () => props.visible2,
  (newArr) => {
    setTimeout(() => {
      if (Array.isArray(props.files) && props.files.length) {
        demand_docs.value = Object.assign([], props.files);
      } else {
        demand_docs.value = [
          {
            name: "",
            size: 0,
            type: 1,
            url: "",
            remark: ""
          }
        ];
      }
      loading.value && (loading.value = false);
    }, 200);
  }
);

const beforeClose = () => {
  emit("update:visible2", false);
};

const handleSuccessFiles = (response: Record<string, any>, file: UploadFile, fileList: UploadFile[], index: number) => {
  // 七牛上传成功后有时候返回url为空
  const { size, url, filename: name } = response;
  if (response.url) {
    const type = 2;
    demand_docs.value[index] = {
      name,
      size,
      type,
      url,
      remark: props.files ? props.files[index].remark : demand_docs.value[index].remark
    };
  }
};

const handleSelect = (item: Record<string, any>) => {
  item.name = "";
  item.size = 0;
  item.url = "";
  item.remark = "";
};

const handleOperation = (index: number, type: number) => {
  if (index) {
    demand_docs.value.splice(index, 1);
  } else {
    demand_docs.value.splice(
      index + 1,
      0,
      Object.assign({
        name: "",
        type: type === 1 ? 1 : 2,
        url: "",
        size: 0,
        remark: ""
      })
    );
  }
};

const submit = () => {
  emit("submit", demand_docs.value);
};

const onRemove = (uploadFile: UploadFile, index: number) => {
  demand_docs.value[index].url = "";
  demand_docs.value[index].name = "";
  demand_docs.value[index].size = 0;
};
</script>
<style lang="less" scoped>
.plan-file-list {
  min-height: 70px;
  max-height: 260px;
  overflow: scroll;
  .file-list-show {
    display: flex;
    // align-items: center;
    margin-top: 10px;
    .file-select {
      width: 18%;
    }
    .file-url {
      width: 50%;
    }
    .file-btn {
      text-align: center;
      width: 50%;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
      white-space: nowrap;
      &-span {
        display: block;
        // color: var(--el-disabled-text-color);
        background-color: var(--el-disabled-bg-color);
        box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
        height: 100%;
        padding: 0 5px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 2.5;
        cursor: pointer;
        font-size: 12px;
        box-sizing: border-box;
        text-align: left;
      }

      &-span2 {
        text-align: left;
        width: 100%;
        flex-grow: 1;
        -webkit-appearance: none;
        font-size: inherit;
        height: 30px;
        line-height: 30px;
        padding: 0;
        outline: 0;
        border: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: 0 0;
      }

      :deep(.el-upload) {
        width: 100%;
        .el-button {
          width: 100%;
          color: #1f9f85;
        }
      }
      :deep(.el-upload-list) {
        margin-top: -40px;
        .el-upload-list__item:first-child {
          background: #fff;
          margin-top: 15px;
        }
      }
    }
    .file-remark {
      width: 28%;
    }
    .file-action {
      font-size: 20px;
      margin-left: 10px;
      color: #1f9f85;
      margin-top: 6px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}

:global(.plan-file-list .el-upload-list__item) {
  width: 98%;
  margin-left: 5px;
}
:global(.plan-file-list .el-upload-list__item-name) {
  display: block;
  width: 90%;
  text-align: left;
}
</style>
