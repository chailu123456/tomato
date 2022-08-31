import * as echarts from "echarts/core";

import { BarChart, LineChart, PieChart } from "echarts/charts";

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  AriaComponent,
  ParallelComponent,
  LegendComponent,
  DataZoomComponent
} from "echarts/components";

import { SVGRenderer } from "echarts/renderers";

echarts.use([
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PolarComponent,
  AriaComponent,
  ParallelComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  PieChart,
  SVGRenderer
]);

export default echarts;
