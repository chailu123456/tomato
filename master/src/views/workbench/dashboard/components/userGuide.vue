<template>
  <div class="dashboard-head">
    <div class="head-tip">
      <h3>{{ currentDate }}，{{ user && user.name }}，欢迎使用Tomato</h3>
      <div class="tip-guide">
        <div class="guide-img">
          <img src="@/assets/use-guide-card-retina.png" alt="" />
        </div>
        <ul class="tip-guide-btn">
          <li>
            <span>办公指引：</span>
            <a target="_blank" class="table-link" href="https://tomato.petrvet.com/document/padIframe?5TrAozCng">给新员工的一封信</a>
          </li>
          <li>
            <span>操作说明：</span>
            <a target="_blank" class="table-link" href="https://tomato.petrvet.com/document/padIframe?5L6pZSU7g">番茄操作说明</a>
          </li>
          <li>
            <span>员工须知：</span>
            <a class="table-link" target="_blank" href="https://tomato.petrvet.com/document/padIframe?xkmoZIU7R"> 迭代流程 <em>|</em> </a>
            <a class="table-link" target="_blank" href="https://tomato.petrvet.com/document/documentCenter?name=guifan"> 开发规范 </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed } from "vue";
import { useStore } from "@/store/index";

export default {
  name: "userGuide"
};
</script>
<script lang="ts" setup>
const currentDate = computed(() => {
  const timeRang: Record<string, any> = {
    早上好: { min: 5, max: 12 },
    中午好: { min: 12, max: 14 },
    下午好: { min: 14, max: 18 },
    晚上好: [
      { min: 0, max: 5 },
      { min: 18, max: 25 }
    ]
  };
  const date = +new Date().getHours();
  function getText() {
    for (let key in timeRang) {
      if (Array.isArray(timeRang[key])) {
        for (let i = 0; i < timeRang[key].length; i++) {
          if (isRang(timeRang[key][i])) {
            return key;
          }
        }
      } else {
        if (isRang(timeRang[key])) {
          return key;
        }
      }
    }
  }
  function isRang(rule: Record<string, any>) {
    if (date >= rule.min && date < rule.max) {
      return true;
    }
  }
  return getText();
});

const { getters } = useStore();
// 获取用户信息
const user = computed(() => getters.user);
</script>

<style lang="less" scoped>
.dashboard-head {
  display: flex;
  width: 100%;
  height: 180px;
  min-height: 180px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 8px 0 rgba(0, 0, 0, 0.02);
  .head-tip {
    padding: 10px;
    h3 {
      margin: 10px;
      color: @rp-color-text-title;
    }
    .tip-guide {
      display: flex;
      justify-content: space-around;
      .guide-img {
        width: 224px;
        margin-right: 10px;
        img {
          width: 70%;
          // height: 110px;
          margin-left: 10%;
        }
      }
      ul.tip-guide-btn {
        width: 60%;

        li {
          margin: 10px 0;
          font-size: 14px;
          list-style: disc;
          em {
            font-style: normal;
            display: inline-block;
            color: @rp-color-text-title;
          }

          span:first-child {
            color: @rp-color-text-title;
          }
        }
      }
    }
    .dashboard-line {
      float: right;
      height: 130px;
      margin-top: -30px;
      border-right: 2px dashed #d3d0d0;
    }
  }

  .head-work-statistics {
    width: calc(60% - 20px);
    border-radius: 8px;
    background: #fff;
    padding: 10px;
    .work-statistics-title {
      font-size: 12px;
    }
    .work-statistics-list {
      display: flex;
      li {
        width: 20%;
        text-align: center;
        h3 {
          color: @rp-color-text-title;
          font-size: 30px;
          margin-top: 18px;
          margin-bottom: 0px;
        }
        h3.statistics-num {
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        }
        p {
          font-size: 14px;
          margin-bottom: 0;
          margin-top: 26px;
        }
        .work-delay {
          display: inline;
          color: @rp-color-danger;
          font-size: 12px;
          padding: 2px 6px;
          border: 1px solid @rp-color-danger;
          border-radius: 4px;
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
