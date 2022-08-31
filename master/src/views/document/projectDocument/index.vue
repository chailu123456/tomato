<template>
  <div>
    <DocComponent oneClassifyName="项目文档"></DocComponent>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DocComponent from "../components/docComponent.vue";
export default defineComponent({
  name: "knowledgeBase",
  components: {
    DocComponent
  },
  setup() {
    return {};
  }
});
</script>
<style scoped lang="less"></style>
