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
      <Demand comePlan="comePlan" class="demand-relative-list table-auto-plan-height" :id="planMsg.id"></Demand>
    </div>
    <div class="plan-relative-demand plan-doc">
      <div class="demand-title">
        需求说明
        <i @click="handleAdd" class="iconfont icon-doc-add"></i>
      </div>
      <div></div>
      <DemandDoc ref="docRef" class="table-auto-plan-height" :planId="planMsg.id"></DemandDoc>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive, ref, onBeforeUnmount } from "vue";
import { ResponseParams } from "@/types/response";
import Demand from "../demandPool/index.vue";
import DemandDoc from "../demandDoc/index.vue";
import { detailPlan } from "@/api/request-modules/product";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "planDetail"
};
</script>
<script lang="ts" setup>
const docRef = ref();
const router = useRouter();
const route = useRoute();
const planMsg = reactive({
  create_by: "",
  creator: "",
  end_time: "",
  id: 0,
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

const handleAdd = () => {
  docRef.value.addDoc(1);
};

planMsg.id = Number(route.query.planId);
getData(route.query.planId as any);

onBeforeUnmount(() => {
  const { productId } = route.query as Record<string, any>;

  // 去掉路由的参数
  setTimeout(() => {
    router.replace({
      path: route.path,
      query: { productId, planId: undefined }
    });
  }, 1100);
});
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
    .demand-relative-list {
      // height: 300px !important;
      // height: fit-content !important;
      overflow-y: scroll;
    }

    .demand-title {
      margin-bottom: 10px;
      i {
        margin-left: 6px;
        &:hover {
          cursor: pointer;
        }
      }
    }

    :deep(.container) {
      padding: 0 !important;
    }
  }
  .plan-doc {
    :deep(.rp-demand-doc) {
      min-height: 500px !important;
      overflow-y: scroll;
    }
  }
}
</style>
<style lang="less">
.table-auto-plan-height {
  .el-table,
  .el-table__body-wrapper,
  .el-scrollbar__wrap {
    width: 101%;
    overflow: hidden;
    height: fit-content !important;
    overflow-y: scroll;
  }
}
</style>
