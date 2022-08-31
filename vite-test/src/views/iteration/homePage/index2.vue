<template>
  <div class="container">
    <!-- 流程进度 -->
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="handleChangeDialogStatus(0)">新增迭代</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleChangeDialogStatus(1)">修改迭代</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="changeUpdateIterationStatus">修改迭代状态</el-button>
      </el-form-item>
    </el-form>

    <el-card>
      <template #header>
        <div class="card__header__left">
          <span>流程进度</span>
        </div>
        <div class="card__header__right">
          <div>
            <span>总体进度:</span><span class="card__header__progress">{{ result.complete_percent }}%</span>
          </div>
          <div>
            <span>时间进度:</span><span class="card__header__time">{{ result.time_percent }}%</span>
          </div>
        </div>
      </template>
      <div class="flow-schedule">
        <progress-bar :status="result.stage" :dataTime="result.progressData"></progress-bar>
      </div>
    </el-card>
    <!-- 产品计划 -->
    <el-card>
      <template #header>
        <div class="card__header__left">
          <span>产品计划</span>
        </div>
        <div class="card__header__right product-plan">
          <div>
            <span> <a :href="result.demand_doc" target="_black">需求</a></span> |
            <span><a :href="result.prototype_doc" target="_black">文档</a></span>
          </div>
        </div>
      </template>
      <div class="productManager">
        <div v-for="(item, index) in productPlanResult" :key="item.name" class="productManager__item__wrapper">
          <div class="productManager__title">{{ item.name }}</div>
          <div class="productManager__body">
            <el-input :disabled="!item.isEdit" v-model="productPlanResult[index].link" class="productManager__body__input"></el-input>
            <el-button type="primary" plain @click="changeProductDiasbleStatus(item, index, tipMessage)" v-show="!item.isEdit">编辑</el-button>
            <el-button type="primary" plain @click="changeProductDiasbleStatus(item, index, tipMessage)" v-show="item.isEdit">确定</el-button>
            <a :href="item.link" target="_black" class="productManager__body__showBtn">
              <el-button type="primary" plain>查看 </el-button>
            </a>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 修改迭代状态 -->
    <div>
      <el-dialog title="提示" v-model="updateStatusDialog" width="30%">
        <el-form :inline="true">
          <el-form-item label="迭代状态">
            <el-select v-model="status" placeholder="请选择">
              <el-option v-for="item in REAL_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <!-- status -->
          <span class="dialog-footer">
            <el-button @click="updateStatusDialog = false">取 消</el-button>
            <el-button type="primary" @click="handleConfirmChange">确 定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <createIterationDialog ref="dialogRef" />
    <employee-management :list="result.user_list" @refresh="getIterationDetail" />
    <projectManagement :list="result.app_list" @refresh="getIterationDetail" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EmployeeManagement from "./components/employeeManagement.vue";
import projectManagement from "./components/projectManagement.vue";
import createIterationDialog from "./components/createIterationDialog.vue";
import useMixin from "../useMixin";
import useMessageTip from "@/composables/useMessageTip";
import useUpdateIterationStatus from "./hooks/useUpdateIterationStatus";
export default defineComponent({
  components: {
    EmployeeManagement,
    projectManagement,
    createIterationDialog
  },
  setup() {
    const { tipMessage } = useMessageTip();
    // 修改迭代状态弹窗数据
    const { searchParams, result, handleChangeDialogStatus, dialogRef, productPlanResult, changeProductDiasbleStatus, getIterationDetail, handleChangeIterationStatus } = useMixin(true);
    const { changeUpdateIterationStatus, updateStatusDialog, handleConfirmChange, status, REAL_STATUS } = useUpdateIterationStatus(tipMessage);
    return {
      REAL_STATUS,
      status,
      updateStatusDialog,
      handleChangeIterationStatus,
      dialogRef,
      result,
      searchParams,
      handleChangeDialogStatus,
      changeProductDiasbleStatus,
      productPlanResult,
      tipMessage,
      getIterationDetail,
      changeUpdateIterationStatus,
      handleConfirmChange
    };
  }
});
</script>

<style scoped lang="less">
.container {
  ::v-deep(.el-card__header) {
    overflow: hidden; // BFC
  }
  .el-card {
    margin-bottom: 20px;
    .product-plan {
      font-size: 14px;
      color: rgba(24, 144, 255, 1);
      div {
        span {
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .flow-schedule {
    padding-top: 50px;
    padding-bottom: 50px;
    position: relative;
    left: 50%;
    transform: translateX(-45%);
  }
  .productManager {
    display: flex;
    flex-wrap: wrap;
    .productManager__item__wrapper {
      box-sizing: border-box;
      padding-right: 100px;
      flex: 0 0 50%;
      margin-bottom: 20px;
    }
    .productManager__title {
      margin-bottom: 10px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }
    .productManager__body {
      display: flex;
      .productManager__body__input {
        margin-right: 20px;
      }
    }
  }
  .card__employee {
    ::v-deep(.container) {
      padding: 0;
      .main {
        padding: 0;
      }
    }
  }
  .productManager__body__showBtn {
    margin-left: 10px;
  }
}
</style>
