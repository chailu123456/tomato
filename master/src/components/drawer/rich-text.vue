<!--
 * @Author: 宋绍华
 * @Date: 2022-05-12 16:37:30
 * @LastEditTime: 2022-07-21 14:40:47
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\drawer\rich-text.vue
-->
<template>
  <div class="rich">
    <div class="rich-text">
      <span>{{ title }}</span>
      <div v-if="statusType === 'edit'">
        <el-button plain @click="cancel">取消</el-button>
        <el-button plain @click="$emit('handleRich', 'save', type, localHtml)" type="primary">保存</el-button>
      </div>
      <div v-if="statusType === 'view'">
        <el-button plain @click="$emit('handleRich', 'toggle', type)" type="primary">编辑</el-button>
      </div>
    </div>
    <WangEditor
      :height="300"
      @getWangEditorValue="callback"
      :placeholder="placeholder"
      :description="html"
      ref="editor"
      v-if="status !== 'view' && type === 'rich'"
    />
    <WangEditor
      :height="170"
      @getWangEditorValue="callback"
      :placeholder="placeholder"
      :description="html"
      ref="editorTwo"
      v-else-if="status !== 'view' && type === 'rich2'"
    />
    <div class="rich-content" id="rich-content" v-html="html" v-else></div>
  </div>
</template>

<script lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from "vue";
import WangEditor from "@/components/wangEditor/index.vue";
export default {
  name: "richText"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: "描述"
  },
  status: {
    // status：add，edit，view
    type: String,
    default: ""
  },
  type: {
    // 那个文本编辑器
    type: String,
    default: ""
  },
  html: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入正文"
  }
});

const emit = defineEmits(["handleRich"]);
const localHtml = ref();

const statusType = computed(() => props.status);

const callback = (data: string) => {
  localHtml.value = data;
  // 如果是编辑状态的书写，不直接更新到html
  if (props.status === "edit") return;
  emit("handleRich", "html", props.type, data);
};

const cancel = () => {
  emit("handleRich", props.status === "edit" ? "toggle" : "cancel", props.type);
};

watch(
  () => props.html,
  () => {
    setTimeout(() => {
      loadImg();
    }, 2000);
  },
  {
    immediate: true
  }
);

// 点击图片打开新窗口显示图片
const loadImg = () => {
  const wrapper = document.getElementsByClassName("rich-content")!;
  if (wrapper && !wrapper.length) return;
  // 描述
  [...wrapper[0].getElementsByTagName("img")].forEach((image) => {
    image.style.cursor = "pointer";
    image.onclick = () => {
      window.open(image.src);
    };
  });
  // 备注
  [...wrapper[1].getElementsByTagName("img")].forEach((image) => {
    image.style.cursor = "pointer";
    image.onclick = () => {
      window.open(image.src);
    };
  });
};
</script>
<style lang="less" scoped>
.rich {
  margin: 10px 0;
  &-text {
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 14px;
    margin-bottom: 10px;
    align-items: flex-end;
  }

  &-content {
    min-height: 50px;
    word-break: break-all;
    :deep(img) {
      max-width: 100%;
    }
    :deep(em) {
      font-style: italic;
    }
    :deep(i) {
      font-style: italic;
    }
    :deep(table) {
      padding: 10px;
      border: 1px dashed #ccc;
      border-radius: 5px;
      border-collapse: collapse;
      th {
        background-color: #f4f2f0;
        font-weight: 700;
        text-align: center;
        border: 1px solid #cccccc;
        box-sizing: border-box;
        border-right-width: 3px;
      }
      td {
        text-align: center;
        border: 1px solid #cccccc;
        padding: 3px 5px;
        text-align: left;
        box-sizing: border-box;
      }
    }
    :deep(video) {
      width: auto;
      max-width: 100%;
    }
  }
}
</style>
