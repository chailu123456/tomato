<template>
  <div class="dashboard-conntainer">
    <div class="dashboard">
      <div class="dashboard-left">
        <panel-project></panel-project>
      </div>
      <div class="dashboard-right">
        <user-guide></user-guide>
        <my-todo></my-todo>
        <participate></participate>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UserGuide from "./components/userGuide.vue";
import Participate from "./components/participate.vue";
import PanelProject from "./components/panelProject.vue";
import MyTodo from "./components/myTodo.vue";

export default {
  name: "dashboard",
  components: {
    UserGuide,
    Participate,
    PanelProject,
    MyTodo
  }
};
</script>

<style lang="less" scoped>
.dashboard-conntainer {
  height: calc(100% + 10px) !important;
  overflow: hidden;
  .dashboard {
    height: 100%;
    display: flex;
    justify-content: space-between;
    .dashboard-left {
      height: 100%;
      width: calc(68% - 10px);
      border-radius: 8px;
      background: #fff;
      display: flex;
      flex-direction: column;
      min-width: 500px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 8px 0 rgba(0, 0, 0, 0.02);
    }
    .dashboard-right {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 0px;
      width: 32%;
    }
  }
}
</style>
