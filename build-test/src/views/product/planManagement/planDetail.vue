<template>
  <div class="rp-plan-detail">
    <div class="plan-detail-list">
      <div class="detail-title">计划详情</div>
      <div class="detail-basic">
        <p>基本信息</p>
        <ul>
          <li>
            <span>计划名称</span>
            <span>{{ planMsg.name }}</span>
          </li>
          <li>
            <span>计划时间</span>
            <span>{{ planMsg.start_time ? planMsg.start_time : "待定" }} - {{ planMsg.end_time ? planMsg.end_time : "待定" }}</span>
          </li>
          <li>
            <span>负责人</span>
            <span>{{ planMsg.staff_name }}</span>
          </li>
          <li>
            <span>创建人</span>
            <span>{{ planMsg.creator }}</span>
          </li>
          <li>
            <span>备注</span>
            <span>{{ planMsg.remark }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="plan-relative-demand">
      <div class="demand-title">关联需求</div>
      <Demand comePlan="comePlan" :id="planMsg.id"></Demand>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive } from "vue";
import { ResponseParams } from "@/types/response";
import Demand from "../demandPool/index.vue";
import { detailPlan } from "@/api/request-modules/product";
import { useRoute } from "vue-router";
export default {
  name: "planDetail"
};
</script>
<script lang="ts" setup>
const route = useRoute();
const planMsg = reactive({
  create_by: "",
  creator: "",
  end_time: "",
  id: null,
  name: "",
  remark: "",
  staff_name: "",
  staff_no: "",
  start_time: ""
});
const getData = (planId: number | null) => {
  detailPlan<ResponseParams.ResponseDataSuccess>({ id: planId }).then((res) => {
    if (res.code === 200) {
      const { staff_name, creator, end_time, id, start_time, name, remark } = res.data;
      planMsg.creator = creator;
      planMsg.end_time = end_time;
      planMsg.start_time = start_time;
      planMsg.staff_name = staff_name;
      planMsg.name = name;
      planMsg.remark = remark;
    }
  });
};

planMsg.id = route.query.planId;
getData(route.query.planId as any);
</script>
<style scoped lang="less">
.rp-plan-detail {
  width: calc(100% - 70px);
  height: calc(100% - 70px) !important;
  background-color: #fff;
  overflow: scroll;
  padding: 20px;
  position: absolute;
  top: 52px;
  right: -60px;
  left: 61px;
  .plan-detail-list {
    .detail-title {
      color: #000;
    }
    .detail-basic {
      p {
        font-size: 14px;
      }
      ul {
        li {
          display: flex;
          line-height: 30px;
          span:first-child {
            display: inline-block;
            width: 70px;
            color: #747474;
            font-size: 14px;
            text-align: right;
          }
          span:last-child {
            display: inline-block;
            font-size: 14px;

            width: calc(100% - 90px);
            margin-left: 20px;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow: hidden;
          }
        }
      }
    }
  }
  .plan-relative-demand {
    margin-top: 10px;
    .demand-title {
      margin-bottom: 10px;
    }
    :deep(.container) {
      padding: 0 !important;
    }
  }
}
</style>
