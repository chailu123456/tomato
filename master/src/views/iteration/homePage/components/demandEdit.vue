<!--
 * @Author: 宋绍华
 * @Date: 2022-05-30 18:07:31
 * @LastEditTime: 2022-07-12 16:23:31
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\iteration\homePage\components\demandEdit.vue
-->
<template>
  <el-dialog v-model="visible" :title="titleDoc" width="50%" :before-close="beforeClose">
    <ul class="plan-file-list">
      <li class="file-list-show">
        <span>链接</span>
        <el-input class="file-url" v-model="demand_docs.url" placeholder="请输入http:或https://开头网址链接"></el-input>
        <span>标题</span>
        <el-input class="file-remark" v-model="demand_docs.title" maxlength="50" placeholder="请输入1-50字以内的标题"></el-input>
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
import { defineProps, ref, defineEmits, watch } from "vue";

export default {
  name: "demandEdit"
};
</script>

<script lang="ts" setup>
import { store } from "@/store";
import { computed } from "@vue/reactivity";
import { ResponseParams } from "@/types/response";
import { ElMessage } from "element-plus";
import { checkURL } from "@/utils";
import { updateUi, addUi } from "@/api/request-modules/iteration";

const emit = defineEmits(["submit", "update:visible2"]);

const props = defineProps({
  visible2: {
    type: Boolean,
    default: true
  },
  type: {
    type: Number,
    default: 1
  },
  docUiDetail: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {}
  }
});
const iterateId = computed(() => store?.getters?.iterateId);

const demand_docs = ref<any>({
  title: "",
  id: 0,
  url: ""
});

const visible = computed(() => props.visible2);
const titleDoc = ref("新增UI图");
watch(
  () => props.visible2,
  (newVal) => {
    console.log(props);

    if (props.type === 1) {
      titleDoc.value = "新增UI图";
      demand_docs.value.title = "";
      demand_docs.value.url = "";
      demand_docs.value.id = 0;
    } else {
      let { title, url, id } = props.docUiDetail;

      titleDoc.value = "编辑UI图";
      demand_docs.value.title = title;
      demand_docs.value.url = url;
      demand_docs.value.id = id;
    }
  }
);

const beforeClose = () => {
  emit("update:visible2", false);
};

// 更新
const submitData = () => {
  if (demand_docs.value.title && demand_docs.value.url) {
    if (!checkURL(demand_docs.value.url)) return ElMessage.error(`请输入http://或https://开头正确的链接地址`);

    if (props.type === 2) {
      updateUi<ResponseParams.ResponseDataSuccess>({
        iteration_id: iterateId.value,
        docs: demand_docs.value
      }).then((res: any) => {
        if (res.code === 200) {
          emit("submit");
          emit("update:visible2", false);
        }
      });
    } else {
      addUi<ResponseParams.ResponseDataSuccess>({
        iteration_id: iterateId.value,
        docs: [demand_docs.value]
      }).then((res: any) => {
        if (res.code === 200) {
          emit("submit");
          emit("update:visible2", false);
        }
      });
    }
  } else {
    ElMessage.warning("请输入UI地址和标题");
  }
};

const submit = () => {
  submitData();
  // emit("submit", demand_docs.value);
};
</script>
<style lang="less" scoped>
.plan-file-list {
  min-height: 70px;
  max-height: 260px;
  overflow: scroll;
  .file-list-show {
    display: flex;
    align-items: center;

    margin-top: 10px;
    span {
      margin: 0 10px;
    }
    .file-select {
      width: 18%;
    }
    .file-url {
      width: 50%;
    }
    .file-remark {
      width: 35%;
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
