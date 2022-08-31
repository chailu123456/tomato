<template>
  <div style="height: 100%">
    <WorkCalendarTitle :workRefs="workRefs" />
    <WorkCalendar :formParams="formParams" ref="workRefs" />
  </div>
</template>

<script lang="ts">
import WorkCalendar from "../../work/index.vue";
export default {
  name: "calendarList",
  components: {
    WorkCalendar
  }
};
</script>

<script lang="ts" setup>
import WorkCalendarTitle from "../../dashboard/components/calendar-title.vue";
import { ref, defineProps } from "vue";
defineProps({
  formParams: {
    type: Object,
    default: () => ({})
  }
});

// carlendar refs
const workRefs = ref();
</script>
<style scoped lang="less"></style>
