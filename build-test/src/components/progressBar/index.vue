<script lang="tsx">
import { defineComponent, PropType, computed, ref, onBeforeUpdate, Ref, ComponentInternalInstance, watchEffect } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "progressBar",
  props: {
    width: {
      type: String as PropType<string>,
      default: "500px"
    },
    status: {
      type: Number as PropType<number>,
      default: null
    },
    dataTime: {
      type: Array as PropType<Array<Record<string, any>>>,
      default: () => [
        // realTime 下面的时间  time 上面的时间
        // { time: "2006-01-02", realTime: "2006-01-02" },
        // { time: "2006-01-02", realTime: "2006-01-03" },
        // { time: "2006-01-02", realTime: "2006-01-03" },
        // { time: "2006-01-02", realTime: "2006-01-05" }
      ]
    },
    // 是否展示需求时间
    isShowStart: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  },
  setup(props) {
    //!! setup函数只会执行一次，如果临时保存在return函数外面就不会实时变化
    // const { data } = toRefs(props);
    const data = computed(() => {
      const progressData = {
        step: -1,
        isShowStart: true,
        // start: {
        //   name: "需求",
        //   status: 0,
        //   time: "",
        //   realTime: ""
        // },
        // status
        // 0 提前 1正常 2延期
        lists: [
          {
            name: "开发",
            status: 1,
            time: "",
            realTime: ""
          },
          {
            name: "联调",
            status: 1,
            time: "",
            realTime: ""
          },
          {
            name: "测试",
            status: 1,
            time: "",
            realTime: ""
          },
          {
            name: "发布",
            status: 1,
            time: "",
            realTime: ""
          }
        ]
      };
      // 是否展示需求虚线部分
      progressData.isShowStart = props.isShowStart;
      // progressData.start = Object.assign(progressData.start, props.dataTime[0]);
      // 当前阶段
      progressData.step = props.status <= 0 ? 0 : props.status;
      // 计算是否落后或者提前
      progressData.lists.forEach((list, i) => {
        list = Object.assign(list, props.dataTime[i + 1]);
        const timeDiff = +new Date(list.realTime === "" ? list.time : list.realTime) - +new Date(list.time);
        if (timeDiff > 0) {
          // 落后
          list.status = 2;
        } else if (timeDiff < 0) {
          // 提前
          list.status = 0;
        } else if (timeDiff === 0) {
          // 正常
          list.status = 1;
        }
      });
      return progressData;
    });

    // 展示对应的阶段
    const isShowaHead = (item: Record<string, any>, index: number) => {
      if (item.status === 0) {
        // 如果状态是提前
        if (index < data.value.step) {
          // 并且data.value.step超出当前
          return "visiable-visible-normal";
        } else {
          return "visiable-visible";
        }
      } else {
        return "visiable-hidden";
      }
    };
    const isShowLate = (item: Record<string, any>, index: number) => {
      if (item.status === 2) {
        // 如果状态是延期
        if (index < data.value.step) {
          // 并且data.value.step超出当前
          return "visiable-visible-normal";
        } else {
          return "visiable-visible";
        }
      } else {
        // 如果状态是其他
        return "visiable-hidden";
      }
    };
    const isActive = (item: Record<string, any>, index: number) => {
      if (data.value.step <= 0) {
        // 如果step小于0，未开始
        return "time-radius--plain";
      } else if (index > data.value.step - 1) {
        // 节点超出了当前的step
        return "time-radius--plain";
      } else if (data.value.step >= 1 && index === 0) {
        // 如果index状态是第一个节点，并且step大于等于1 active
        if (item.status === 1) return "time-radius--active";
        return "time-radius--plain";
      } else if (item.status === 1) {
        // 如果当前节点没有延迟或者提前，active
        return "time-radius--active";
      } else if (item.status !== 1) {
        // 如果当前节点有延迟或者提前，active plain
        return "time-radius--plain";
      }
    };
    let aheadRef = ref([]) as Ref<Array<any>>;
    let normalRef = ref([]) as Ref<Array<any>>;
    let lateRef = ref([]) as Ref<Array<any>>;
    let wrapperRef = ref();
    const setAheadRef = (ref: ComponentInternalInstance | Element | null) => {
      aheadRef.value.push(ref);
    };
    const setNormalRef = (ref: ComponentInternalInstance | Element | null) => {
      normalRef.value.push(ref);
    };
    const setLateRef = (ref: ComponentInternalInstance | Element | null) => {
      lateRef.value.push(ref);
    };
    onBeforeUpdate(() => {
      aheadRef.value = [];
      normalRef.value = [];
      lateRef.value = [];
    });
    // const style = ref();
    // 计算真实进度条长度

    // const realWidth = () => {
    const lineWidth = ref();
    const nodeBlock = ref([]) as Ref<Array<any>>;
    const nodeBlockFn = (node: ComponentInternalInstance | Element | null) => {
      nodeBlock.value.push(node);
    };
    onBeforeUpdate(() => {
      nodeBlock.value = [];
    });
    // 进度条的几条线段,用于计算真实长度
    // 预测的真实时间（深色线条）
    const planRealLineRef = ref();
    // 预测时间(浅灰色线条)
    const planLineRef = ref();
    // nextTick(() => {
    watchEffect(
      () => {
        if (!lineWidth.value) return;
        const CURRENT = data.value?.lists[data.value?.step - 1 <= 0 ? 0 : data.value?.step - 1];
        // if (data.value.step >= 4 && CURRENT.status !== 0) {
        //   lineWidth.value.style.width = "100%";
        //   return;
        // }
        const wrapperPosition = wrapperRef.value?.getBoundingClientRect();
        let percent = `0%`;
        if (CURRENT.status === 0 && data.value.step === 1) {
          percent = getPosition(normalRef.value[data.value.step - 1]);
          lineWidth.value.style.width = percent;
          return;
        }

        if (CURRENT.status === 0) {
          // 提前的话，并且节点已经发布
          percent = getPosition(aheadRef.value[Math.max(data.value.step - 1, 0)]);
        } else if (CURRENT.status === 1) {
          percent = getPosition(normalRef.value[data.value.step - 1]);
        } else if (CURRENT.status === 2 && data.value.step !== 0) {
          percent = getPosition(lateRef.value[Math.max(data.value.step - 1, 0)]);
        }

        lineWidth.value.style.width = `${Math.max(parseFloat(percent), 0).toFixed(2)}%`;
        // // 计算实际进度深绿色线条起始点偏移位置
        if (data.value.lists[0].status === 2) {
          // 真实开发起始时间存在延迟
          // 获取当前延迟的dom位置
          const lateDomPos = getPosition(nodeBlock.value[0]?.getElementsByTagName("div")[2]);
          lineWidth.value.style.left = `${Math.max(parseFloat(lateDomPos), 0) + 1}%`;
          // 1是开发阶段
          if (data.value.step > 1) {
            lineWidth.value.style.width = `${parseFloat(percent) - parseFloat(lateDomPos)}%`;
          } else if (data.value.step <= 1) {
            lineWidth.value.style.width = `0%`;
          }
        } else if (data.value.lists[0].status === 1 || data.value.lists[0].status === 0) {
          // 正常进度和提前进度
          lineWidth.value.style.left = `0`;
          lineWidth.value.style.width = percent;
        } else {
          lineWidth.value.style.width = percent;
        }
        function getPosition(dom: HTMLElement) {
          if (!dom) {
            return "";
          }
          const position = dom.getBoundingClientRect();
          return `${((position.left - wrapperPosition.left) / wrapperPosition.width) * 100}%`;
        }
        // 计算真实节点深灰色线和计划节点浅灰色线位置
        // 1.获取真实节点起始位置，每一个块都最多展示两个节点，如果有节点上有两个dom，获取除了中间以外的另外一个
        // const realTimeStart =
        const getNodePos = (node: HTMLElement) => {
          return `${(parseFloat(getPosition(node)) + 1).toFixed(2)}%`;
        };
        nodeBlock.value.forEach((node, parentIndex: number) => {
          const childNodes = node.getElementsByTagName("div");
          const nodeStatus = data.value.lists[parentIndex].status;
          childNodes.forEach((childNode: HTMLElement, childIndex: number) => {
            const isVisibleStr = window.getComputedStyle(childNode).visibility;

            // 判断是否存在开始计划时间和开始真实开始时间重合
            if (nodeStatus === 1 && parentIndex === 0) {
              planRealLineRef.value.style.left = 0;
            } else if (nodeStatus === 1 && parentIndex === 3) {
              if (data.value.lists[3].realTime === data.value.lists[3].time) planRealLineRef.value.style.width = lineWidth.value.style.width;
              else planRealLineRef.value.style.width = `100%`;
              planLineRef.value.style.width = `100%`;
            } else if (isVisibleStr === "visible" && childIndex !== 1) {
              // 获取到当前正在展示的几个节点，并且排除掉中间始终展示的预计时间，得到真实开发时间的4个节点
              // 获取真实开发节点的第一个dom起始位置
              if (parentIndex === 0) {
                planRealLineRef.value.style.left = getNodePos(childNode);
              } else if (parentIndex === 3) {
                // 计算结束位置，根据开始和结束位置计算长度
                const startPos = parseFloat(planRealLineRef.value.style.left);
                if (startPos > 0) {
                  planRealLineRef.value.style.width = `${parseFloat(getNodePos(childNode)) - startPos}%`;
                } else if (startPos < 0) {
                  planRealLineRef.value.style.width = `${parseFloat(getNodePos(childNode)) + startPos}%`;
                } else if (startPos === 0) {
                  planRealLineRef.value.style.width = `${parseFloat(getNodePos(childNode))}%`;
                }
              }
            } else {
              // 得到预计时间的4个节点,计算下面浅色线段长度
              // 浅色线段开始位置一定，计算结束位置即可
              if (parentIndex === 3 && childIndex === 1) {
                planLineRef.value.style.width = `${parseFloat(getNodePos(childNode))}%`;
              }
            }
          });
        });
      },
      {
        flush: "post"
      }
    );
    // });
    // };
    // realWidth();
    // 计算真实进度文字位置
    const realTextPosition = (item: Record<string, any>) => {
      const POSITION = [
        {
          left: `-30px!important`
        },
        {
          left: `0px!important`
        },
        {
          left: `30px!important`
        }
      ];
      return POSITION[item.status];
    };
    const realTimeTextColor = (item: Record<string, any>, index: number) => {
      if (index === 0 && data.value.step >= 1) {
        return {
          color: "#1f9f85"
        };
      }
      if (index < data.value.step) {
        return {
          color: "#1f9f85"
        };
      } else {
        // index超出data.value.step
        if (item.status === 0) {
          // 提前
          return {
            color: "#80ad0a"
          };
        } else if (item.status === 1) {
          if (index > data.value.step) {
            // 还没有到当前阶段
            return {
              color: "rgba(0, 0, 0, 0.45)"
            };
          } else if (data.value.step === 0 && index === 0) {
            // 未开始
            return {
              color: "rgba(0, 0, 0, 0.45)"
            };
          } else if (index > data.value.step - 1) {
            // 超出进行阶段
            return {
              color: "rgba(0, 0, 0, 0.45)"
            };
          } else {
            return {
              color: "red"
            };
          }
        } else if (item.status === 2) {
          // 超期
          return {
            color: "red"
          };
        } else {
          return { color: "#1f9f85" };
        }
      }
    };
    // 设置最后一个节点的位置
    const setLastOrFirstPosition = (item: Record<string, any>, index: number) => {
      if (index === 3) {
        if (item.status === 0 || item.status === 1) {
          // 提前和正常，需要偏移节点位置
          return {
            left: `40px`
          };
        }
      } else if (index === 0) {
        if (item.status === 1 || item.status === 2) {
          // 落后和正常，需要偏移节点位置
          return {
            left: `-40px`
          };
        }
      }
    };
    // 延期和提前是否绿色点状态
    // const isActiveStyle = (item: Record<string, any>, index: number) => {
    //   if (index <= data.value.step) {
    //     console.log(item, "item", index);
    //     return {
    //       color: `blue!important`
    //     };
    //   }
    // };
    const cutoutYear = (time: string) => {
      if (!time) return;
      const now = dayjs(time).format("MM-DD");
      return now;
    };

    return () => {
      // 保存临时变量要放在return函数里面
      return (
        <div class="rp-progressBar" style={{ width: props.width }}>
          <div class="rp-progressBar__radius">
            <div class="time-line">
              <div class="time-line__flex--wrapper" ref={wrapperRef}>
                {data.value.lists.map((item, index) => {
                  return (
                    <div class="time-radiusWrapper" style={setLastOrFirstPosition(item, index)}>
                      <div class="time-radiusWrapper__flex" ref={() => nodeBlockFn}>
                        {<div ref={() => setAheadRef} class={[isShowaHead(item, index), "time-radius--ahead"]}></div>}
                        <div ref={() => setNormalRef} class={[isActive(item, index)]}></div>
                        {<div ref={() => setLateRef} class={[isShowLate(item, index), "time-radius--late"]}></div>}
                      </div>
                      {/**实际进度-上面 */}
                      <div style={(realTextPosition(item), realTimeTextColor(item, index))} class={["time-text__real"]}>
                        <p>{item.name}</p>
                        <p>{cutoutYear(item.realTime)}</p>
                      </div>
                      {/**计划进度-下面 */}
                      <div class={["time-text__plan"]}>
                        <p>{item.name}</p>
                        <p>{cutoutYear(item.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/**真实进度深绿色线条 */}
              <div ref={lineWidth} class="time-line__flex--real"></div>
              {/**真实进度深灰色线条 */}
              <div class="time-line__flex--realBottom" ref={planRealLineRef}></div>
              {/**计划进度浅灰色线条 */}
              <div class="time-line__flex--plan" ref={planLineRef}></div>
            </div>
          </div>
        </div>
      );
    };
  }
});
</script>

<style lang="less">
.rp-progressBar {
  // min-width: 500px;
  min-height: 140px;
  // width: 90%;
  margin: 0 auto;
  padding-top: 50px;
  .rp-progressBar__radius {
    display: flex;
    align-items: center;
    .time-line {
      // left: 50%;
      // transform: translateX(-50%);
      position: relative;
      width: 90%;
      height: 10px;
      .time-line__flex--wrapper {
        position: relative;
        // top: 5px;
        // height: 5px;
        width: 100%;
        display: flex;

        align-items: center;
        justify-content: space-between;
        .time-radius:last-child {
          position: relative;
          left: 3px;
        }
      }
      .time-line__flex--real {
        z-index: 29;
        position: absolute;
        top: 0;
        left: 0%;
        height: 5px;
        // width: 64%;
        display: flex;
        background: rgba(31, 159, 133);
        align-items: center;
        justify-content: space-between;
      }
      .time-line__flex--realBottom {
        z-index: 28;
        position: absolute;
        top: 0;
        left: 0%;
        height: 5px;
        // width: 100%;
        display: flex;
        background: rgba(0, 0, 0, 0.3);
        align-items: center;
        justify-content: space-between;
      }
      // 浅灰色线条
      .time-line__flex--plan {
        position: absolute;
        background: rgba(223, 219, 219);
        width: 100%;
        top: 5px;
        height: 5px;
      }
    }
    .time-start {
      position: relative;
      flex: 0 0 25%;
      height: 8px;
      border: 1px dashed rgba(223, 219, 219);
      display: flex;
      align-items: center;
      justify-content: left;
      .time-start-text {
        text-align: center;
        position: absolute;
        bottom: -50px;
        left: -26px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        p {
          line-height: 0;
        }
        p:nth-child(2) {
          font-size: 10px;
        }
      }
    }
    .time-radius {
      border-radius: 50%;
      background: rgba(223, 219, 219);
      .time-radius-common;
    }
  }
  .time-radius-common {
    z-index: 30;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: relative;
    left: -3px;
  }
  // 进度正常并且激活
  .time-radius--active {
    background: #1f9f85;
    .time-radius-common;
  }
  // 进度不正常
  .time-radius--plain {
    background: rgba(223, 219, 219);
    .time-radius-common;
  }
  .time-radius--ahead {
    background: rgba(128, 173, 10, 1);
    .time-radius-common;
  }
  .time-radius--late {
    background: red;
    .time-radius-common;
  }
  .time-radiusWrapper {
    position: relative;
    // min-width: 9%;
    min-width: 80px;
    margin-top: -5px;
    .time-radiusWrapper__flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .time-radiusWrapper:last-child {
    left: 20px;
  }
  .time-text-common {
    text-align: center;
    position: absolute;
    left: 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    p {
      line-height: 0;
    }
    p:nth-child(2) {
      font-size: 10px;
    }
  }
  // 计划进度
  .time-text__plan {
    width: 80px;
    bottom: -42px;
    .time-text-common;
  }
  // 实际进度正常
  .time-text__real {
    width: 80px;
    bottom: 34px;
    .time-text-common;
  }
  // 实际进度提前
  .time-text__real--ahead {
    bottom: 34px;
    left: -25px !important;
    .time-text-common;
  }
  // 实际进度落后
  .time-text__real--late {
    bottom: 34px;
    right: -46px !important;
    .time-text-common;
  }
  // 开发时间
  .time-dev {
    left: -24px !important;
  }
  // 元素隐藏
  .visiable-hidden {
    visibility: hidden;
  }
  // 元素显示
  .visiable-visible {
    visibility: visible;
  }
  .visiable-visible-normal {
    background: #1f9f85;
  }
}
</style>
