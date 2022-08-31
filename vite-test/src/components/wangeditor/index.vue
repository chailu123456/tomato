<template>
  <div class="editor" ref="editor"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import WangEditor from "wangeditor";

export default defineComponent({
  name: "wangEditor",
  setup(props, context) {
    const editor = ref();
    let instance: any = "";
    onMounted(() => {
      instance = new WangEditor(editor.value);
      // 配置项
      instance.config.showLinkImg = false;
      instance.config.showLinkImgAlt = false;
      instance.config.showLinkImgHref = false;
      instance.config.uploadImgMaxSize = 2 * 1024 * 1024; // 2M
      instance.config.uploadFileName = "file";
      Object.assign(instance.config, {
        onchange() {
          context.emit("getWangEditorValue", instance.txt.html());
        }
      });
      instance.create();
    });
    onBeforeUnmount(() => {
      instance.destroy();
      instance = null;
    });
    return {
      editor
    };
  }
});
</script>
<style lang="less" scoped>
// 数据回显时可能缺少样式
// table {
//   border-top: 1px solid #ccc;
//   border-left: 1px solid #ccc;
// }
// table td,
// table th {
//   border-bottom: 1px solid #ccc;
//   border-right: 1px solid #ccc;
//   padding: 3px 5px;
// }
// table th {
//   border-bottom: 2px solid #ccc;
//   text-align: center;
// }

// /* blockquote 样式 */
// blockquote {
//   display: block;
//   border-left: 8px solid #d0e5f2;
//   padding: 5px 10px;
//   margin: 10px 0;
//   line-height: 1.4;
//   font-size: 100%;
//   background-color: #f1f1f1;
// }

// /* code 样式 */
// code {
//   display: inline-block;
//   *display: inline;
//   *zoom: 1;
//   background-color: #f1f1f1;
//   border-radius: 3px;
//   padding: 3px 5px;
//   margin: 0 3px;
// }
// pre code {
//   display: block;
// }

// /* ul ol 样式 */
// ul, ol {
//   margin: 10px 0 10px 20px;
// }

// 重写editor样式
.editor {
  margin-top: 20px;
  /deep/ .w-e-text {
    ul li {
      list-style: disc;
    }
    ol li {
      list-style: decimal;
    }
  }
  /deep/ .w-e-toolbar {
    z-index: 1001 !important;
  }
  /deep/ .w-e-text-container {
    z-index: 1000 !important;
  }
  /deep/ .w-e-panel-container {
    margin-left: 0 !important;
  }
}
</style>
