<template>
  <div class="container planManagement">
    <div class="header">
      <el-form :inline="true" :model="formParams" class="demo-form-inline">
        <!-- <el-form-item label="迭代区间:">
          <el-date-picker v-model="formParams.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
        </el-form-item> -->

        <el-form-item>
          <el-button type="primary" @click="openDialog(0)">
            <i class="el-icon-plus"></i>
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- <div class="main"> -->
    <ul class="planManagement__main__columns">
      <li v-for="(item, index) in stepList" :key="item.titleName">
        <div class="header" :style="{ background: item.titleColor }">
          {{ item.titleName }}
        </div>
        <div class="body" @dragover.prevent="" @drop.stop="handleDrop($event, index)" @dragenter.prevent="handleDragenter($event, index)" @dragleave="handleDragleave">
          <el-scrollbar>
            <div
              @click="handleClickActive(index, key)"
              v-for="(block, key) in item.listData"
              :key="block.name"
              class="block"
              :style="{
                background: block.bgc,
                cursor: item.isDisable ? 'not-allowed' : 'move',
                border: block.isActive ? '1px solid #999' : 'unset'
              }"
              :draggable="!item.isDisable"
              @dragenter.prevent="handleDragenter($event, index, key)"
              @dragleave="handleDragleave"
              @dragstart="handleDragstart(index, key)"
              @drop.stop="handleDrop($event, index, key)"
            >
              {{ block.name }}
            </div>
          </el-scrollbar>
        </div>
      </li>
    </ul>
    <!-- </div> -->
    <teleport to=".layout-container" v-if="isReady">
      <div class="planManagement__side__wrapper">
        <div class="teleport__wrapper__sideHeader planManagement__sideHeader">
          <el-form :inline="true" class="planManagement__side__selectProduct">
            <el-form-item label="产品名称:">
              {{ productName }}
            </el-form-item>
            <el-form-item>
              <el-button type="primary" v-show="id" @click="openDialog(1, dialogEditData)"><i class="el-icon-edit"></i> 编辑 </el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" v-show="id" @click="handleDeletePlan"><i class="el-icon-delete"></i> 作废 </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="planManagement__side__sideBody">
          <div>
            <progress-bar :status="stage" class="planManagement__side__progressBar" :dataTime="dataTime"></progress-bar>
          </div>
          <div class="planManagement__side__tree">
            <el-scrollbar>
              <el-tree :data="demandLists" node-key="id" default-expand-all :props="defaultProps"> </el-tree>
            </el-scrollbar>
          </div>
          <div>
            <el-form label-width="100px">
              <el-form-item label="计划版本:">
                <span>{{ version }}</span>
              </el-form-item>
              <el-form-item label="计划简称:">
                <span>{{ name }}</span>
              </el-form-item>
              <el-form-item label="迭代负责人:" class="inline-form">
                <span>{{ manager_list.iteration_manager.staff_name }}</span>
              </el-form-item>
              <el-form-item label="后端负责人:" class="inline-form">
                <span>{{ manager_list.backend_manager.staff_name }}</span>
              </el-form-item>
              <el-form-item label="前端负责人:" class="inline-form">
                <span>{{ manager_list.frontend_manager.staff_name }}</span>
              </el-form-item>
              <el-form-item label="测试负责人:" class="inline-form">
                <span>{{ manager_list.test_manager.staff_name }}</span>
              </el-form-item>
              <el-form-item label="需求文档:">
                <el-input :disabled="false" v-model="demand_doc" class="inline-form"></el-input>

                <a :href="demand_doc" target="_blank" style="text-decoration: underline">
                  <el-button type="primary">查看</el-button>
                </a>
              </el-form-item>
              <el-form-item label="原型:">
                <el-input :disabled="false" v-model="prototype_doc" class="inline-form"></el-input>
                <a :href="prototype_doc" target="_blank" style="text-decoration: underline"><el-button type="primary">查看</el-button></a>
              </el-form-item>
              <el-form-item label="备注:">
                <div style="height: 20vh">
                  <el-scrollbar>
                    <el-input :autosize="{ minRows: 8, maxRows: 8 }" type="textarea" placeholder="请输入内容" v-model="remark"> </el-input>
                  </el-scrollbar>
                </div>
              </el-form-item>
              <div class="center">
                <el-button type="primary" @click="handleCreateOrEditPlan($event, tipMessage, planDetail)">确 定</el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </teleport>
    <el-dialog v-model="isShowEditModal" center>
      <dialog-plan-management></dialog-plan-management>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleCreateOrEditPlan($event, tipMessage)">确 定</el-button>
          <el-button @click="isShowEditModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, toRefs } from "vue";
import useDraggable from "./composables/useDraggable";
import dialogPlanManagement from "./dialog.vue";
import useShowPlanDetail from "./composables/useShowPlanDetail";
import useCreateAndEditPlan from "./composables/useCreateAndEditPlan";
import useMessageTip from "@/composables/useMessageTip";
import { deletePlan } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
export default defineComponent({
  components: {
    dialogPlanManagement
  },
  setup() {
    const defaultProps = {
      children: "child_list",
      label: "name"
    };
    const isReady = ref(false);
    onMounted(() => {
      isReady.value = true;
    });
    const { tipMessage } = useMessageTip();
    // 拖拽
    const { stepList, planList, handleDragstart, handleDragenter, handleDrop, handleDragleave, handleClickActive } = useDraggable(tipMessage);
    // 右侧根据产品搜索
    const { planDetail, productName, stage, dataTime, demandLists, dialogEditData } = useShowPlanDetail();

    const { isShowEditModal, openDialog, handleCreateOrEditPlan } = useCreateAndEditPlan(planList);
    const handleDeletePlan = () => {
      if ((planDetail as Record<string, any>).id) {
        deletePlan<ResponseParams.ResponseDataSuccess>((planDetail as Record<string, any>).id).then((res) => {
          tipMessage(res.code);
          planList();
        });
      }
    };
    return {
      isReady,
      dialogEditData,
      planDetail,
      handleDeletePlan,
      tipMessage,
      handleCreateOrEditPlan,
      demandLists,
      dataTime,
      stage,
      handleClickActive,
      ...toRefs(planDetail as Record<string, any>),
      isShowEditModal,
      openDialog,
      stepList,
      handleDragstart,
      handleDragenter,
      handleDrop,
      handleDragleave,
      defaultProps,
      productName
    };
  }
});
</script>

<style scoped lang="less">
.planManagement {
  height: 100%;
  ::v-global(.planManagement__side__marginTop td) {
    padding-bottom: 10px;
  }
  ::v-global(.planManagement__side__wrapper) {
    width: 30%;
    overflow: hidden;
  }
  ::v-global(.planManagement__side__sideBody) {
    box-sizing: border-box;
    padding: 10px;
  }
  ::v-global(.planManagement__side__sideBody .inline-form) {
    width: 50%;
    display: inline-block;
  }
  ::v-global(.planManagement__side__selectProduct) {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
  ::v-global(.planManagement__side__progressBar) {
    position: relative;
    left: 2%;
  }
  ::v-global(.planManagement__side__tree) {
    margin-top: 10px;
    height: 150px;
    border-bottom: 1px solid #999;
    margin-bottom: 10px;
  }
  ::v-global(.planManagement__side__editForm) {
    display: flex;
    justify-content: center;
  }

  .planManagement__main__columns {
    background: #fff;
    display: flex;
    height: 82vh;
    li {
      flex: 1;
      margin-right: 5px;
      // margin-bottom: 20px;
      overflow: hidden;
      .header {
        user-select: none;
        text-align: center;
        line-height: 32px;
        font-size: 14px;
        color: rgba(38, 38, 38, 1);
        height: 32px;
      }
      .body {
        border: 1px solid rgba(232, 232, 232, 1);
        box-sizing: border-box;
        height: 100%;
        height: 82vh;
        padding-bottom: 30px;
        .block {
          // cursor: move;
          user-select: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 5px auto 5px;
          color: rgba(89, 89, 89, 1);
          font-size: 12px;
          width: 104px;
          height: 104px;
        }
      }
    }
  }
}
.center {
  text-align: center;
}
</style>
