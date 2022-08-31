<template>
  <div style="height: 100%">
    <WorkCalendarTitle :workRefs="workRefs" />
    <WorkCalendar @lookDetail="lookDetail" :formParams="formParams" ref="workRefs" />
  </div>
</template>

<script lang="ts">
import { defineEmits } from "vue";
import WorkCalendar from "../../work/index.vue";
import type { CalendarItemInter } from "@/composables/useDashboard";

export default {
  name: "calendarList",
  components: {
    WorkCalendar
  }
};
</script>

<script lang="ts" setup>
import WorkCalendarTitle from "../../dashboard/components/calendarTitle.vue";
import { ref, defineProps } from "vue";
const emit = defineEmits(["lookDetail"]);
defineProps({
  formParams: {
    type: Object,
    default: () => ({})
  }
});

// carlendar refs
const workRefs = ref();
const lookDetail = (item: CalendarItemInter) => {
  emit("lookDetail", item);
};
</script>
<style scoped lang="less"></style>
