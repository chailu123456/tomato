<template>
  <el-main class="el-main">
    <transition-router />
  </el-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TransitionRouter } from "@/components/transition/index";
export default defineComponent({
  components: {
    TransitionRouter
  }
});
</script>

<style lang="less" scoped>
.flip-list-move {
  transition: transform 1s;
}

.el-main {
  background: rgba(235, 248, 246, 1);
  padding: 0;
  .main-iterate {
    height: 100%;
    display: flex;
    li {
      flex: 1;
      border: 1px solid #999999;
      height: 100%;
      text-align: center;
      position: relative;
      div {
        cursor: move;
        user-select: none;
        background: rgba(0, 0, 0, 0.2);
        position: relative;
        width: 80%;
        height: 0;
        padding-bottom: 80%;
        margin-bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
      }
    }
  }
}
</style>
