<template>
  <div style="height: 100%">
    <router-view v-slot="{ Component }">
      <!-- in-out: 新元素先进行过渡，完成之后当前元素过渡离开。
      out-in: 当前元素先进行过渡，完成之后新元素过渡进入。 -->
      <transition mode="out-in" appear name="zoom-fade">
        <keep-alive :include="[]" :max="10">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Transition"
});
</script>

<style></style>
