<template>
  <div class="statistics-pie-chart">
    <div v-if="data && data.length" :id="id" style="width: 100%; height: 350px"></div>
    <el-empty v-else description="暂无数据"></el-empty>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, watch, nextTick, reactive } from "vue";
import echarts from "@/utils/echarts";
import getChartOption from "../composables/chartOption";
interface pieParams {
  name: string;
  value: string | number;
}
export default defineComponent({
  props: {
    id: {
      type: String as PropType<string>,
      default: ""
    },
    type: {
      type: Number as PropType<number>
    },
    data: {
      type: Array as PropType<Array<pieParams>>,
      default: () => []
    }
  },
  setup(props) {
    // 设置图例是否勾选
    let selectOption: any = reactive({});
    const initChart = () => {
      const chartRef = document.getElementById(props.id);
      let myEcharts = echarts.getInstanceByDom(chartRef as HTMLElement);
      if (!myEcharts) {
        myEcharts = echarts.init(chartRef as HTMLElement);
      }
      let option: any = getChartOption("pie");
      option.series[0].data = props.data;
      props.data.forEach((i) => {
        selectOption[i.name] = true;
        if (!Number(i.value)) {
          selectOption[i.name] = false;
        }
      });
      option.legend.selected = selectOption;
      myEcharts.setOption(option, true);
    };
    watch(
      () => props.data,
      (newVal) => {
        if (newVal && newVal.length) {
          nextTick(() => {
            initChart();
          });
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
    return {
      selectOption
    };
  }
});
</script>
<style lang="less" scoped>
.statistics-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
