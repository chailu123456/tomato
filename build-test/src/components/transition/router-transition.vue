<template>
  <div style="height: calc(100% - 10px); border-radius: 6px; overflow-y: hidden">
    <router-view v-slot="{ Component }">
      <transition mode="out-in" appear name="zoom-fade">
        <keep-alive :max="100" :include="include">
          <component class="content" :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
export default defineComponent({
  name: "Transition",
  setup() {
    const store = useStore();
    const include: string[] = store.state.include;
    return {
      include
    };
  }
});
</script>

<style scoped>
.content {
  overflow-x: scroll;
  min-width: 1220px;
  height: 100% !important;
  box-sizing: border-box;
}
</style>
