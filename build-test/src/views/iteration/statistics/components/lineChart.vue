<template>
  <div class="statistics-line-chart">
    <!-- <div v-if="type === 1" class="select">
      <el-dropdown :hide-on-click="false">
        <span class="el-dropdown-link"><i class="el-icon-arrow-down"></i></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
              <el-checkbox-group v-model="selectList" @change="handleCheckedCitiesChange">
                <el-checkbox v-for="i in seriesNameList" :label="i" :key="i">{{ i }}</el-checkbox>
              </el-checkbox-group>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div> -->
    <div v-if="data.xData && data.xData.length" :id="id" style="width: 100%; height: 350px"></div>
    <el-empty v-else description="暂无数据"></el-empty>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, watch, nextTick, ref, Ref, reactive } from "vue";
import echarts from "@/utils/echarts";
import getChartOption from "../composables/chartOption";
/** 饼图数据结构 */
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
      type: Number as PropType<number>,
      default: 0
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
    let seriesNameList = ref([]) as Ref<Array<any>>;
    // 设置图例是否勾选
    let selectOption: any = reactive({});
    const initChart = () => {
      const chartRef = document.getElementById(props.id);
      let myEcharts = echarts.getInstanceByDom(chartRef as HTMLElement);
      if (!myEcharts) {
        myEcharts = echarts.init(chartRef as HTMLElement);
      }
      const option: any = getChartOption("line");
      const colorArr: Array<string> = ["#808080", "#1890ff"];
      const colorArr1: Array<string> = ["#1f9f85", "#009fff"];
      // type 0工时燃尽图 1成员工时燃尽图 2bug燃尽图
      option.xAxis[0].name = props.data.xName;
      option.yAxis[0].name = props.data.yName;
      option.xAxis[0].data = props.data.xData;
      props.data.list.forEach((i: any, index: number) => {
        const seriesObj: Record<string, any> = {
          name: "",
          showSymbol: true,
          symbol: "emptyCircle",
          symbolSize: 4,
          type: "line",
          smooth: true,
          lineStyle: {
            color: "",
            width: 1
          },
          data: []
        };
        seriesObj.name = i["label"];
        seriesObj.data = i["data"];
        seriesObj.color = props.type === 0 ? colorArr[index] : colorArr1[index];
        seriesObj.lineStyle.color = props.type === 0 ? colorArr[index] : colorArr1[index];
        option.series.push(seriesObj);
        // 设置前五个图例默认勾选
        selectOption[i.label] = false;
        if (index < 5) {
          selectOption[i.label] = true;
        }
      });
      // 成员工时燃尽图，legend设置成分页可滚动
      if (props.type === 1) {
        option.legend.type = "scroll";
        option.legend.pageIconSize = 12;
        option.legend.padding = [10, 0, 0, 90];
      }
      if (props.type === 0 && option.series.length) {
        option.series[0].showSymbol = false;
      }
      if (props.type === 2) {
        option.yAxis[0].minInterval = 1;
      }
      option.legend.selected = selectOption;
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
    return {
      seriesNameList,
      selectOption
    };
  }
});
</script>
<style lang="less" scoped>
.statistics-line-chart {
  width: 100%;
  height: 100%;
  .select {
    position: absolute;
    right: 45px;
    z-index: 999;
  }
}
</style>
