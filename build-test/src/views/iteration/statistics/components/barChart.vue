<template>
  <div class="statistics-bar-chart">
    <div v-if="data.xData && data.xData.length" :id="id" style="width: 100%; height: 350px"></div>
    <el-empty v-else description="暂无数据"></el-empty>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, PropType, watch } from "vue";
import echarts from "@/utils/echarts";
import getChartOption from "../composables/chartOption";
interface FilterProps {
  xName: string;
  yName: string;
  xData: Array<string>;
  list: Array<{ label: string; data: [] }>;
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
      type: Object as PropType<FilterProps>,
      default: () => {
        return {
          xName: "",
          yName: "",
          xData: [],
          list: []
        };
      }
    }
  },
  setup(props) {
    const initChart = () => {
      const chartRef = document.getElementById(props.id);
      let myEcharts = echarts.getInstanceByDom(chartRef as HTMLElement);
      if (!myEcharts) {
        myEcharts = echarts.init(chartRef as HTMLElement);
      }
      const option: any = getChartOption("bar", props.type);
      option.xAxis[0].name = props.data.xName;
      option.yAxis[0].name = props.data.yName;
      option.xAxis[0].data = props.data.xData;
      // 数据超过15条，添加滚动条
      if (props.data.xData && props.data.xData.length > 15) {
        const { length } = props.data.xData;
        option.grid.bottom = 60;
        option.dataZoom = [
          {
            show: true,
            height: 12,
            xAxisIndex: [0],
            bottom: 8,
            start: 0,
            end: length > 25 ? 40 : 60,
            zoomLock: false,
            brushSelect: false,
            borderColor: "#90979c"
          },
          {
            type: "inside",
            show: true,
            height: 12,
            zoomLock: false
          }
        ];
      } else {
        option.grid.bottom = 35;
        option.dataZoom = [];
      }
      if (props.id === "bar2") {
        option.yAxis[0].minInterval = 1;
      }
      if (props.data?.list.length) {
        option.series[0].data = props.data.list[0].data;
        option.series[1].data = props.data.list[1].data;
        props.type === 2 ? (option.series[2].data = props.data.list[2].data) : "";
      }
      myEcharts.setOption(option, true);
    };
    watch(
      () => props.data,
      (newVal) => {
        if (newVal.xData && newVal.xData.length) {
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
  }
});
</script>
<style lang="less" scoped>
.statistics-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
