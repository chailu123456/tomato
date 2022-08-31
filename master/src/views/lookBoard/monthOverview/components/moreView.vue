<template>
  <ul class="rp-view">
    <li v-for="item in viewData" :key="item.img">
      <img :src="item.img" alt="" />
      <div class="view-msg">
        <p>
          <router-link class="jump-page" :to="item.url">{{ item.title }}</router-link>
        </p>
        <span>{{ item.content }}</span>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { reactive } from "vue";

const viewData = reactive([
  {
    img: "https://img02.mockplus.cn/image/2022-04-11/0c10e9f0-b975-11ec-a90c-1d0858756c4d.png",
    title: "PMO汇报",
    url: "/lookBoard/project/pmo",
    content: "当前项目下迭代一览表，包含迭代内容、状态、进度、成员、排期节点、周报等内容"
  },
  {
    img: "https://img02.mockplus.cn/image/2022-04-11/3dbc3720-b975-11ec-b0df-b5b841111e2d.png",
    title: "质量概览",
    url: "/lookBoard/project/qualityOverview",

    content: "当前项目下迭代一览表，包含迭代内容、状态、进度、成员、排期节点、周报等内容"
  },

  {
    img: "https://img02.mockplus.cn/image/2022-04-11/ac08e8e0-b975-11ec-8bfd-59f5943617ce.png",
    title: "发布日历",
    url: "/lookBoard/project/publishCalendar",

    content: "当前项目迭代节点日历，将排期中的开始开发、开始联调、提交测试、上线发布等日期在日历中显示"
  },
  {
    img: "https://img02.mockplus.cn/image/2022-04-11/0c10e9f0-b975-11ec-a90c-1d0858756c4d.png",
    title: "工作评估",
    url: "/lookBoard/personal/jobEvaluation",

    content: "所有员工工作量和工作质量显示，支持查看任务量、任务颗粒度、准点率、BUG量、缺陷密度等"
  },
  {
    img: "https://img02.mockplus.cn/image/2022-04-12/83788a30-ba14-11ec-b8ba-579e3ae7d513.png",
    title: "任务日历",
    url: "/lookBoard/personal/peopleOverview",

    content: "所有员工每日忙闲状态显示，支持查看员工的每日任务量、进度、质量情况"
  },
  {
    img: "https://img02.mockplus.cn/image/2022-04-11/ac08e8e0-b975-11ec-8bfd-59f5943617ce.png",
    title: "计划排布",
    url: "/lookBoard/personal/peopleArrangument",

    content: "当前项目迭代节点日历，将排期中的开始开发、开始联调、提交测试、上线发布等日期在日历中显示"
  }
]);
</script>
<style scoped lang="less">
.rp-view {
  display: flex;
  flex-wrap: wrap;
  color: #fff;
  margin-top: 6px;
  li {
    width: 33%;
    display: flex;
    margin: 18px 0;

    img {
      width: 150px;
    }
    .view-msg {
      width: calc(100% - 180px);
      margin-left: 10px;
      p {
        margin: 6px;
        margin-left: 0;
        .jump-page {
          color: #fff;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      span {
        font-size: 12px;
      }
    }
  }
}
</style>
