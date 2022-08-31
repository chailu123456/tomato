<template>
  <div>
    <el-dialog title="添加成员" v-model="dialogVisible" width="40%" center>
      <div class="position__center">
        <div>
          <el-scrollbar height="400px">
            <el-input placeholder="输入姓名查找" v-model="filterText"> </el-input>
            <!-- <el-tree
              @check="handleCheckBoxEventByText"
              node-key="uniqueId"
              show-checkbox
              :data="userListForName"
              :props="{ label: 'staff_name' }"
              v-show="filterText"
              :default-checked-keys="rightNodeKey"
              ref="keywordTreeRef"
            ></el-tree> -->
            <!-- v.uniqueId = v.DepartmentCode -->
            <el-tree
              :default-checked-keys="rightNodeKey"
              @node-expand="handleNodeExpand"
              @check="handleCheckBoxEvent"
              show-checkbox
              node-key="id"
              class="filter-tree"
              :data="deparment"
              default-expand-all
              :check-strictly="false"
              :default-expanded-keys="[]"
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
              <!-- <template v-if="!item.department_code"> -->
              <el-button size="medium" icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
              <el-icon
                style="margin-right: 10px; margin-top: 10px"
                class="el-icon-close"
                :style="{ display: !item.role ? 'inline-block' : 'none' }"
                @click="deleteCheckedKeys(item, index)"
              >
                <Close />
              </el-icon>
              <!-- </template> -->
            </div>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleConfirmSubmit">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>

    <el-card class="card__employee">
      <template #header>
        <div class="card__header__left">
          <span>成员维护</span>
        </div>
        <div class="card__header__right" style="margin-right: 8px">
          <div>
            <el-button type="primary" @click="handleShowDialog">
              <el-icon style="vertical-align: middle">
                <Plus />
              </el-icon>
              <span style="vertical-align: middle"> 添加成员 </span>
            </el-button>
          </div>
        </div>
      </template>
      <page-table :tableData="list" :hiddenPagation="true">
        <template #main>
          <el-table-column prop="staff_id" label="序号" width="120"> </el-table-column>
          <el-table-column prop="staff_name" label="姓名" width="120"> </el-table-column>
          <el-table-column prop="job_name" label="角色" width="150"> </el-table-column>
          <el-table-column prop="total_hour" label="任务总工时" width="120"> </el-table-column>
          <!-- <el-table-column prop="job_path" label="部门" width="230"> </el-table-column> -->
          <el-table-column prop="complete_percent" min-width="200" label="总进度">
            <template #default="scope">
              <!-- <span>{{ scope.row.complete_percent }}%</span> -->
              <el-progress :percentage="scope.row.complete_percent" color="rgba(41, 152, 255, 1)"></el-progress>
            </template>
          </el-table-column>
          <el-table-column prop="today_percent" width="100" label="今日进度">
            <template #default="scope">
              <span>{{ scope.row.today_percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="current_tasks" min-width="200">
            <template #header>
              <div>任务工时分布<br />开发/联调/测试</div>
            </template>
            <template #default="scope">
              <div class="progress">
                <span
                  :style="{
                    width: (scope.row.dev_hours / scope.row.total_hour) * 100 + '%',
                    background: 'rgb(236 249 211)'
                  }"
                  >{{ scope.row.dev_hours }}</span
                >
                <span
                  :style="{
                    width: (scope.row.union_hours / scope.row.total_hour) * 100 + '%',
                    background: 'rgba(231, 248, 245)'
                  }"
                  >{{ scope.row.union_hours }}</span
                >
                <span
                  :style="{
                    width: (scope.row.test_hours / scope.row.total_hour) * 100 + '%',
                    background: 'rgb(211 249 242)'
                  }"
                  >{{ scope.row.test_hours }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column width="180" label="操作">
            <template #default="scope">
              <el-button type="text" @click="handleShowTask(scope.row.staff_no, scope.row.staff_name)">查看任务</el-button>
              <el-button type="text" :class="[scope.row.role != 0 ? '' : 'delete']" :disabled="scope.row.role != 0" @click="handleRemoveList(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </template>
      </page-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import useMessageTip from "@/composables/useMessageTip";
import { Plus, Close } from "@element-plus/icons";
import { defineComponent, PropType, watch } from "vue";
import { ref } from "vue";
// import { useRoute } from "vue-router";
import useGetEmployee from "./composables/getEmployee";
export default defineComponent({
  name: "employeeManagement",
  components: { Plus, Close },
  props: {
    list: {
      default: () => [],
      type: Array as PropType<Array<any>>
    }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    // const filterText = ref("");
    const treeRef = ref();
    const keywordTreeRef = ref();
    const { tipMessage } = useMessageTip();
    // const route = useRoute();
    const filterNode = (value: string, data: Record<string, any>) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };

    const {
      rightNodeKey,
      userListForName,
      filterText,
      handleNodeExpand,
      deparment,
      handleShowDialog,
      dialogVisible,
      mockData,
      handleCheckBoxEvent,
      rightCheckedNodes,
      deleteCheckedKeys,
      handleCheckBoxEventByText,
      handleConfirmSubmit,
      handleRemoveList,
      handleShowTask
    } = useGetEmployee(treeRef, keywordTreeRef, props, emit, tipMessage);
    watch(
      () => filterText.value,
      (newValue) => {
        // getUserForName(newValue);
        treeRef?.value.filter(newValue);
      }
    );

    return {
      handleShowTask,
      handleRemoveList,
      handleConfirmSubmit,
      handleCheckBoxEventByText,
      keywordTreeRef,
      rightNodeKey,
      userListForName,
      handleNodeExpand,
      deparment,
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
.card__employee {
  :deep(.container) {
    padding: 0 !important;
  }
  :deep(.main) {
    padding: 0 !important;
  }
}
:deep(.progress) {
  display: flex;
  span {
    display: inline-block;
    width: 33%;
    min-width: 5%;
    background: #ccc;
  }
}
:deep(.el-card__header) {
  border-bottom: none !important;
}
:deep(.el-divider--vertical) {
  height: 100%;
}
:deep(.cell) {
  // text-align: center !important;
}
</style>
