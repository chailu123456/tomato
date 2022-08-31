<template>
  <div class="calendar-title">
    <i @click="handleTimer('up')" class="calendar-title__icon iconfont icon-arrowup"></i>
    <span class="calendar-title__text">{{ timer }}</span>
    <i @click="handleTimer('down')" class="calendar-title__icon iconfont icon-arrowdown"></i>
  </div>
</template>

<script lang="ts">
import { defineProps, computed } from "vue";
import { useStore } from "@/store/index";
export default {
  name: "calendar-title"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  workRefs: {
    type: Object,
    default: () => ({})
  }
});
const { getters } = useStore();

const timer = computed(() => getters.workCalendarDay);

const handleTimer = (dir: string) => {
  if (dir === "down") {
    props.workRefs?.changeMonth("next-month");
  } else if (dir === "up") {
    props.workRefs?.changeMonth("prev-month");
  }
};
</script>

<style lang="less">
.calendar-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &__text {
    padding: 0 10px;
  }

  svg {
    cursor: pointer;
  }

  &__icon {
    position: relative;
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
