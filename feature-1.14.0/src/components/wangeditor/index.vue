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
<style lang="less" scoped></style>
