<script lang="tsx">
import { defineComponent, PropType, computed } from "vue";
// interface ProgressBar {
//   time:string
// }
export default defineComponent({
  name: "progressBar",
  props: {
    status: {
      type: Number as PropType<number>,
      default: 3
    },
    dataTime: {
      type: Array as PropType<Array<string>>,
      default: () => ["2006-01-02", "2006-01-02", "2006-01-02", "2006-01-02", "2006-01-02"]
    },
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
        step: 2,
        isShowStart: false,
        start: {
          name: "需求",
          date: "03-07"
        },
        // realDate
        // 0 提前 1正常 2延期
        lists: [
          {
            name: "开发",
            date: "03-07",
            realDate: 1
          },
          {
            name: "联调",
            date: "03-07",
            realDate: 0
          },
          {
            name: "测试",
            date: "03-07",
            realDate: 2
          },
          {
            name: "发布",
            date: "03-07",
            realDate: 2
          }
        ]
      };
      progressData.isShowStart = props.isShowStart;
      progressData.step = props.status;
      progressData.lists.forEach((list, i) => {
        list.date = props.dataTime[i];
      });
      return progressData;
    });
    const isActiveLine = (index: number) => {
      return index >= data.value.step ? "rp-progressBar__line--active" : "rp-progressBar__line";
    };
    const isActiveRadius = (index: number) => {
      return index <= data.value.step ? "rp-progressBar__radius--active" : "rp-progressBar__radius";
    };
    const isActiveText = (index: number) => {
      if (index <= data.value.step) {
        return {
          color: "rgba(31,159,133)",
          "font-weight": "700"
        };
      } else {
        return "";
      }
    };
    return () => {
      // 保存临时变量要放在return函数里面
      return (
        <div class="rp-progressBar">
          <ul class="rp-progressBar__wrapper">
            {data.value.isShowStart ? (
              <li>
                <div class="radiusAndLine___wrapper">
                  <div class="rp-progressBar__radius"></div>
                  <div class="rp-progressBar__dashedWrapper">
                    <div class="rp-progressBar__dashedWrapper--disable"></div>
                  </div>
                </div>
                <div class="rp-progressBar__wrapperDemand">
                  <p>{data.value.start.name}</p>
                  <p>{data.value.start.date}</p>
                </div>
              </li>
            ) : (
              ""
            )}

            {data.value.lists.map((v, index) => {
              return (
                <li>
                  {/**计划进度圆点和线条 */}
                  <div class="radiusAndLine___wrapper">
                    <div class={[isActiveLine(index)]}></div>
                    {/**提前进度圆点 */}
                    {index !== 0 && <div class="rp-progressBar__radius--ahead"></div>}

                    {/**正常计划进度圆点 */}
                    <div class={[isActiveRadius(index)]}></div>
                    {/**延期进度圆点 */}
                    {index !== 0 && <div class="rp-progressBar__radius--late"></div>}
                  </div>
                  {/**计划进度 */}
                  <div class="rp-progressBar__planProgressText">
                    <p style={isActiveText(index)}>{v.name}</p>
                    <p style={isActiveText(index)}>{v.date}</p>
                  </div>
                  {/**真实进度 */}
                  <div class={[index === 0 ? "rp-progressBar__realProgressText--normal rp-progressBar__realProgressText" : "rp-progressBar__realProgressText--late rp-progressBar__realProgressText"]}>
                    <p>{v.name}</p>
                    <p>{v.date}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    };
  }
});
</script>
<style lang="less">
.rp-progressBar {
  padding-top: 50px;
}
.rp-progressBar__radius__common {
  width: 10px;
  padding-top: 10px;
  border-radius: 50%;
  position: relative;
  z-index: 5;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
}
.rp-progressBar__wrapper {
  display: flex;
  width: 110%;
  justify-content: space-around;
  // padding-left: 15%;
  li {
    position: relative;
    flex: 1;
    height: 100%;
    p {
      color: rgba(0, 0, 0, 0.45);
      position: relative;
      right: 48%;
      line-height: 0;
    }
    p:nth-child(1) {
      font-size: 14px;
    }
    p:nth-child(2) {
      margin-top: 5px;
      font-size: 10px;
    }
    position: relative;
    height: 100%;

    .rp-progressBar__radius {
      .rp-progressBar__radius__common;
      background: #bfbfbf;
    }
    .rp-progressBar__radius--active {
      .rp-progressBar__radius__common;
      background: #1f9f85;
    }
    .progressBar__line__common {
      position: absolute;
      top: 3px;
      height: 2px;
      width: 100%;
    }
    .rp-progressBar__line {
      .progressBar__line__common;
      background: #1f9f85;
    }
    .rp-progressBar__line--active {
      .progressBar__line__common;
      background: #e9e9e9;
    }

    // &:not(:first-child) .rp-progressBar__line--active {
    //   right: 10px;
    // }

    // &:not(:last-child) .rp-progressBar__line {
    //   .progressBar__line__common;
    //   background: #1f9f85;
    // }
    // &:not(:last-child) .rp-progressBar__line--active {
    //   .progressBar__line__common;
    //   background: #e9e9e9;
    // }
    &:first-child {
      flex: 0 0 15%;
      .rp-progressBar__wrapperDemand {
        text-align: center;
        position: relative;
        top: 8px;
      }
    }
    &:last-child {
      .radiusAndLine___wrapper {
        width: 30px;
      }
    }
  }

  .radiusAndLine___wrapper {
    position: relative;
    display: flex;
    align-items: center;
    height: 10px;
  }
  .rp-progressBar__dashedWrapper {
    flex: 1;
    height: 2px;
    position: relative;
    .rp-progressBar__dashedWrapper--disable {
      width: 100%;
      height: 2px;
      background-image: linear-gradient(to right, #bfbfbf; 20%, #bfbfbf; 80%, transparent 50%);
      background-size: 5px 100%;
      background-repeat: repeat-x;
    }
  }
  .rp-progressBar__planProgressText {
    position: relative;
    top: -60px;
    text-align: center;
    position: relative;
  }
  .rp-progressBar__realProgressText {
    position: relative;
    right: -10px;
    position: relative;
    top: -20px;
    text-align: center;
  }
  .rp-progressBar__radius--late {
    right: -20px;
    position: relative;
    .rp-progressBar__radius__common;
    background: rgba(250, 19, 19, 1);
  }
  .rp-progressBar__radius--ahead {
    .rp-progressBar__radius__common;
    background: rgba(128, 173, 10, 1);
    position: absolute;
    left: -30px;
  }
  .rp-progressBar__realProgressText--late {
    position: relative;
    right: -30px;
  }
  .rp-progressBar__realProgressText--normal {
    right: 0px;
  }
  .rp-progressBar__realProgressText--ahead {
    right: 30px;
  }
}
</style>
