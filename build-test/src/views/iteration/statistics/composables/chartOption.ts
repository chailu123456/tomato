import type { EChartsOption } from "echarts";
export default function getChartOption(type: string, barType?: number): any {
  const pieOption: EChartsOption = {
    tooltip: {
      trigger: "item"
    },
    legend: {
      orient: "horizontal",
      left: "center",
      top: 0
    },
    color: ["#507aff", "#dddddd", "#51d9a2", "#ffc371"],
    series: [
      {
        type: "pie",
        radius: "65%",
        top: -20,
        bottom: -30,
        label: {
          formatter: (val: Record<string, any>) => {
            return `${val?.name}(${val?.percent}%)`;
          },
          overflow: "break"
        },
        labelLine: {
          length: 10,
          length2: 10,
          smooth: true
        },
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };
  const lineOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      confine: true
    },
    legend: {
      top: 0,
      type: "plain",
      itemHeight: 4,
      icon: "path://M0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"
    },
    grid: {
      left: 50,
      right: 30,
      top: 35,
      bottom: 50
    },
    xAxis: [
      {
        name: "",
        type: "category",
        nameLocation: "middle",
        nameGap: 30,
        data: []
      }
    ],
    yAxis: [
      {
        name: "",
        type: "value",
        nameLocation: "middle",
        nameGap: 35,
        splitNumber: 6
      }
    ],
    animationDuration: 500,
    series: []
  };
  const barOption: EChartsOption = {
    tooltip: {
      trigger: "axis"
    },
    legend: {
      top: 0
    },
    grid: {
      left: 50,
      right: 30,
      top: 35,
      bottom: 35
    },
    xAxis: [
      {
        type: "category",
        data: [],
        name: "",
        nameLocation: "middle",
        nameGap: 50,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          rotate: 45
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "",
        nameLocation: "middle",
        nameGap: 35,
        splitLine: {
          lineStyle: {
            type: "dashed",
            opacity: 0.8,
            width: 1,
            color: "#dedede"
          }
        }
      }
    ],
    series: barSeries(barType as number)
  };
  if (type === "pie") {
    return pieOption;
  } else if (type === "line") {
    return lineOption;
  } else if (type === "bar") {
    return barOption;
  }
}
/*
 @params type 0:占比柱状图 1:常规柱状图 2:堆叠+占比柱状图
 return
*/
function barSeries(type: number) {
  let series: any[] = [];
  if (type === 0) {
    series = [
      {
        name: "总工时",
        type: "bar",
        barGap: "-100%",
        data: [],
        barWidth: 30,
        itemStyle: {
          color: "#1890ff"
        }
      },
      {
        name: "已完成工时",
        type: "bar",
        data: [],
        barWidth: 30,
        itemStyle: {
          color: "#91cc75"
        }
      }
    ];
  } else if (type === 1) {
    series = [
      {
        name: "平均存活时长",
        type: "bar",
        data: [],
        barWidth: 20,
        barGap: 0,
        itemStyle: {
          color: "#1890ff"
        }
      },
      {
        name: "平均响应时长",
        type: "bar",
        data: [],
        barWidth: 20,
        barGap: 0,
        itemStyle: {
          color: "#91cc75"
        }
      }
    ];
  } else if (type === 2) {
    series = [
      {
        name: "总BUG数",
        type: "bar",
        barGap: "-100%",
        data: [],
        barWidth: 30,
        itemStyle: {
          color: "#1890ff"
        }
      },
      {
        name: "已关闭BUG数",
        type: "bar",
        data: [],
        barGap: "-100%",
        z: 2,
        barWidth: 30,
        itemStyle: {
          color: "#91cc75"
        }
      },
      {
        name: "严重BUG数",
        type: "bar",
        data: [],
        barGap: "-100%",
        z: 3,
        barWidth: 30,
        itemStyle: {
          color: "#ffa566"
        }
      }
    ];
  }
  return series;
}
