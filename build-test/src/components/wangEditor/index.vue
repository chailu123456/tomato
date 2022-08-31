<template>
  <div class="editor-w">
    <Toolbar class="editor-w-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor
      :style="`min-height:${height}px;`"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @customPaste="customPaste"
      @onChange="handleChange"
      @onCreated="handleCreated"
    />
  </div>
</template>
<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { videoUpload } from "@/api/request-modules/common";
import { onBeforeUnmount, ref, nextTick, defineProps, shallowRef, defineEmits } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { IDomEditor } from "@wangeditor/editor";
import VueEvent from "@/utils/mitt";

const props = defineProps({
  description: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入正文"
  },
  height: {
    type: Number
  }
});
const emit = defineEmits(["getWangEditorValue"]);
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const mode = ref("default");

// 内容 HTML
const valueHtml = ref("");

nextTick(() => {
  valueHtml.value = props.description;
});

// 监听抽屉组件状态
VueEvent.on("drawStatus", () => {
  setTimeout(() => {
    valueHtml.value = props.description;
  }, 500);
});

const toolbarConfig = ref({});

const editorConfig: any = ref({ MENU_CONF: { placeholder: props.placeholder } }); // 初始化 MENU_CONF 属性

// 去掉企业微信复制内容中的 html、body等标签格式
const customPaste = (editor: IDomEditor, event: any) => {
  const html = event.clipboardData.getData("text/html"); // 获取粘贴的 html
  const text = event.clipboardData.getData("text/plain"); // 获取粘贴的纯文本
  if (html && html.indexOf("<html>") !== -1) {
    editor.insertText(text);
    // 阻止默认的粘贴行为
    event.preventDefault();
    return false;
  } else {
    // 继续执行默认的粘贴行为
    return true;
  }
};

// 配置项
editorConfig.value.MENU_CONF["uploadImage"] = {
  // form-data fieldName ，默认值 'wangeditor-uploaded-image'
  fieldName: "file",
  // 单个文件的最大体积限制，默认为 2M
  maxFileSize: 2 * 1024 * 1024, // 2M

  // 最多可上传几个文件，默认为 100
  maxNumberOfFiles: 10,

  // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
  allowedFileTypes: [],

  // 超时时间，默认为 10 秒
  timeout: 5 * 10000 // 50 秒
};
editorConfig.value.MENU_CONF["uploadImage"] = {
  // 自定义图片上传功能
  customUpload: (resultFile: any, insertImgFn: any) => {
    const formData = new FormData();
    formData.append("file", resultFile);
    // 将文件上传至服务器，res.data返回服务器存放文件的url
    videoUpload(formData).then((res: any) => {
      // 插入图片，三个参数分别对应，url alt href
      insertImgFn(res.url, "", res.url);
    });
  }
};
editorConfig.value.MENU_CONF["uploadVideo"] = {
  // 自定义图片上传功能
  customUpload: (resultFile: any, insertImgFn: any) => {
    const formData = new FormData();
    formData.append("file", resultFile);
    // 将文件上传至服务器，res.data返回服务器存放文件的url
    videoUpload(formData).then((res: any) => {
      // 插入视频，三个参数分别对应，url alt href
      insertImgFn(res.url, "", res.url);
    });
  }
};
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const handleChange = () => {
  emit("getWangEditorValue", valueHtml.value);
};
</script>

<style lang="less" scoped>
.editor-w {
  border: 1px solid #ddd;

  &-toolbar {
    border-bottom: 1px solid #ddd;
  }
  :deep(em) {
    font-style: italic;
  }
  :deep(i) {
    font-style: italic;
  }

  :global(.w-e-bar-item) {
    height: 30px;
  }
  :deep(.w-e-bar-item-group) {
    &:hover {
      .w-e-bar-item-menus-container {
        top: -10px;
      }
    }
  }
  :global(.w-e-bar-divider) {
    height: 30px;
  }
}
</style>
