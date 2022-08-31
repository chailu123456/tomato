<!--
 * @Author: 宋绍华
 * @Date: 2022-04-02 15:51:10
 * @LastEditTime: 2022-04-21 20:41:00
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\document\components\docHandleDialog.vue
-->
<template>
  <el-dialog :title="item.dialogTitle" v-model="visible" :close-on-press-escape="false" width="30%" :before-close="beforeClose">
    <el-form :model="formEditName" v-if="item.target === 'rename' || item.target === 'create'" @submit.prevent="handleConfirm">
      <el-form-item>
        <div>所属父文档</div>
        <span class="docHandle-title">{{ parentTitle }}</span>
      </el-form-item>
      <el-form-item label="">
        <div>子文档名称 ({{ formEditName.name.length }}/32)</div>
        <el-input autofocus v-trim ref="inputRef" v-model.trim="formEditName.name" placeholder="请输入" maxlength="32" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div v-else>删除文档会同时把其附件、子文档删除，并不可恢复，是否确认？</div>
    <template #footer>
      <span>
        <el-button @click="beforeClose">取 消</el-button>
        <el-button :loading="loading" :type="item.target === 'delete' ? 'danger' : 'primary'" @click="handleConfirm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import useDocument, { ParamsUpdateDocTitleInter } from "@/composables/useDocument";
import { ElMessage } from "element-plus";
import { reactive, watch, nextTick, defineEmits, withDefaults, defineProps, ref, computed } from "vue";
export default {
  name: ""
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:visible", "updateData"]);
const props = withDefaults(
  defineProps<{
    visible: boolean;
    item: Record<string, any>;
  }>(),
  {
    visible: false
  }
);
// form 表单
const formEditName = reactive({
  id: 0,
  name: "",
  parent_id: 0
});
const inputRef = ref(); // input ref

// 按钮loading
const loading = ref(false);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.item.target === "rename" || props.item.target === "create") {
        if (props.item.target === "rename") {
          formEditName.name = props.item.node?.label;
        }
        // 输入框自动focus
        nextTick(() => {
          inputRef.value.focus();
        });
      }
    } else {
      nextTick(() => {
        formEditName.name = "";
      });
    }
  }
);

const { useDelWikiDoc, useUpdateDocTitle } = useDocument();

const beforeClose = () => {
  loading.value = false;
  emit("update:visible", false);
};
// 删除文档
const delWikiDoc = async (id: number) => {
  return await useDelWikiDoc(id);
};

const parentTitle = computed(() => {
  const titles = getParentTitle(props.item.node);

  if (Array.isArray(titles) && titles.length) return titles.join(" > ");
  return "主文档";
});

// 获取父元素数组
const getParentTitle = (data: any) => {
  const arr: string[] = [];
  if (props.item.target === "rename") {
    if (data.parent && data.parent.label) {
      arr.unshift(data.parent.label);
      if (data.parent?.parent && data.parent?.parent.label) {
        let l = getParentTitle(data.parent);
        arr.unshift(...l);
      }
    }
  } else {
    arr.unshift(data.label);
    if (data.parent && data.parent.label) {
      let l = getParentTitle(data.parent);
      arr.unshift(...l);
    }
  }
  return arr;
};

// 更新title
const updateDocTitle = async (params: Omit<ParamsUpdateDocTitleInter, "parent_id">) => {
  return await useUpdateDocTitle(params);
};

const handleConfirm = async () => {
  const { node, target } = props.item;
  loading.value = true;
  let type = 5;
  // 删除
  if (target === "delete") {
    const { id } = node.data;
    const isSucc = await delWikiDoc(id);
    loading.value = false;
    if (!isSucc) return ElMessage.error("删除失败");
  } else if (target === "rename") {
    const { content_id, id } = node.data;
    const isSucc = await updateDocTitle({ content_id, id, title: formEditName.name });
    loading.value = false;
    type = 6; // 更新名称，不需要重新改变文档位置
    if (!isSucc) return ElMessage.error("更新标题失败");
  } else if (target === "create") {
    const { name: title } = formEditName;
    if (!title) {
      loading.value = false;
      return ElMessage.warning("请填写子文档名称");
    }
    const { id: parent_id } = node.data;

    emit("updateData", 1, { title, parent_id });
    loading.value = false;
    beforeClose();
    return;
  }

  emit("updateData", type);
  beforeClose();
};
</script>
<style lang="less">
.docHandle-title {
  width: 100%;
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  color: #666;
}
</style>
