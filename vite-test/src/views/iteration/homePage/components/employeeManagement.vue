<template>
  <div>
    <el-dialog title="添加成员" v-model="dialogVisible" width="40%" center>
      <div class="position__center">
        <div>
          <el-scrollbar height="400px">
            <el-input placeholder="输入姓名查找" v-model="filterText"> </el-input>
            <el-tree
              @check="handleCheckBoxEvent"
              show-checkbox
              node-key="id"
              class="filter-tree"
              :data="mockData"
              :props="{ children: 'children', label: 'label' }"
              default-expand-all
              :filter-node-method="filterNode"
              ref="treeRef"
            >
              <template #default="{ node }">
                <span class="custom-tree-node">
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
        <div>
          <el-divider direction="vertical"></el-divider>
        </div>
        <div>
          <el-scrollbar height="400px">
            <div v-for="(item, index) in rightCheckedNodes" :key="index" class="current-checked-nodes">
              <el-button size="medium" icon="el-icon-user-solid" type="text">{{ item.label }}</el-button>
              <i class="el-icon-close" @click="deleteCheckedKeys(item, index)"></i>
            </div>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <!-- <el-button type="primary" @click="handleChangeLists">确 定</el-button> -->
        </span>
      </template>
    </el-dialog>

    <el-card class="card__employee">
      <template #header>
        <div class="card__header__left">
          <span>成员维护</span>
        </div>
        <div class="card__header__right">
          <div>
            <el-button icon="el-icon-plus" type="primary" @click="handleShowDialog">添加成员</el-button>
          </div>
        </div>
      </template>
      <page-table :tableData="list" :hiddenPagation="true">
        <template #main>
          <el-table-column prop="id" label="序号" width="80"> </el-table-column>
          <el-table-column prop="staff_name" label="姓名" width="120"> </el-table-column>
          <el-table-column prop="job_name" label="职位" width="150"> </el-table-column>
          <el-table-column prop="" label="任务总工时" width="230"> </el-table-column>
          <!-- <el-table-column prop="job_path" label="部门" width="230"> </el-table-column> -->
          <el-table-column prop="complete_percent" label="总进度">
            <template #default="scope">
              <el-progress :percentage="scope.row.complete_percent" color="rgba(41, 152, 255, 1)"></el-progress>
            </template>
          </el-table-column>
          <el-table-column prop="today_percent" label="今日进度">
            <template #default="scope">
              <el-progress :percentage="scope.row.today_percent"></el-progress>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="current_tasks" label="当前任务">
            <template #default="scope">
              <span v-for="item in scope.row.current_tasks" :key="item.id">
                {{ item.name }}
              </span>
            </template>
          </el-table-column> -->
          <el-table-column width="180" label="操作">
            <!-- <template #default="scope">
              <el-button type="text" @click="handleChangeLists(scope.row.staff_no)">查看任务</el-button>
              <el-button type="text" @click="handleChangeLists(scope.row.staff_no)">删除</el-button>
            </template> -->
          </el-table-column>
        </template>
      </page-table>
    </el-card>
  </div>
</template>

<script lang="ts">
// import useMessageTip from "@/composables/useMessageTip";
import { defineComponent, PropType, watch } from "vue";
import { ref } from "vue";
// import { useRoute } from "vue-router";
import useGetEmployee from "./composables/getEmployee";
export default defineComponent({
  name: "employeeManagement",
  props: {
    list: {
      default: () => [],
      type: Array as PropType<Array<any>>
    }
  },
  emits: ["refresh"],
  setup() {
    const filterText = ref("");
    const treeRef = ref();
    // const route = useRoute();
    const filterNode = (value: string, data: Record<string, any>) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };
    watch(
      () => filterText.value,
      (newValue) => {
        treeRef.value?.filter(newValue);
      }
    );
    const { handleShowDialog, dialogVisible, mockData, handleCheckBoxEvent, rightCheckedNodes, deleteCheckedKeys } = useGetEmployee(treeRef);

    return {
      deleteCheckedKeys,
      rightCheckedNodes,
      handleCheckBoxEvent,
      filterNode,
      mockData,
      treeRef,
      filterText,
      handleShowDialog,
      dialogVisible
    };
  }
});
</script>

<style scoped lang="less">
.position__center {
  position: relative;
  display: flex;
  div {
    &:nth-child(1) {
      flex: 0 0 48%;
    }
    &:nth-child(3) {
      flex: 0 0 48%;
    }
  }
  .current-checked-nodes {
    display: flex;
    justify-content: space-between;
    i {
      cursor: pointer;
    }
  }
}
::v-deep(.el-card__header) {
  border-bottom: none !important;
}
::v-deep(.el-divider--vertical) {
  height: 100%;
}
</style>
