<template>
  <div>
    <el-dialog title="添加成员" v-model="addMemberVisible" width="40%" center :before-close="closeDialog">
      <div class="position__center">
        <div>
          <el-scrollbar height="400px">
            <el-input placeholder="输入姓名查找" v-model="filterText"> </el-input>
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
              <el-button icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
              <el-icon
                style="margin-right: 10px; margin-top: 10px"
                class="el-icon-close"
                :style="{ display: !item.role ? 'inline-block' : 'none' }"
                @click="deleteCheckedKeys(item, index)"
              >
                <Close />
              </el-icon>
            </div>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleConfirmSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </span>
      </template>
    </el-dialog>

    <el-card class="card__employee" shadow="never">
      <template #header>
        <div class="card__header__left">
          <span>成员维护 <span style="font-size: 12px; color: #666">指派或关联当前迭代的任务后，被指派人将自动成为该迭代成员，无需手动添加</span></span>
        </div>
        <div class="card__header__right" style="margin-right: 8px">
          <div>
            <el-button type="primary" @click="handleShowDialog">
              <span style="vertical-align: middle"> 手动添加成员 </span>
            </el-button>
          </div>
        </div>
      </template>
      <page-table :tableData="list" :hiddenPagation="true">
        <template #main>
          <el-table-column prop="staff_id" label="编号" width="120"> </el-table-column>
          <el-table-column prop="staff_name" label="姓名" width="120"> </el-table-column>
          <el-table-column prop="job_name" label="角色" width="150"> </el-table-column>
          <el-table-column prop="total_hour" label="任务总工时"> </el-table-column>
          <el-table-column prop="complete_percent" width="90" label="总进度">
            <template #default="scope">
              <span>{{ scope.row.complete_percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="today_percent" label="今日进度">
            <template #default="scope">
              <span>{{ scope.row.today_percent }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="bug_num" label="BUG数"></el-table-column>
          <el-table-column prop="unfixed_bug_num" label="未修复BUG数"></el-table-column>
          <el-table-column prop="submit_bug_num" label="提交BUG数"></el-table-column>

          <el-table-column width="180" label="操作">
            <template #default="scope">
              <el-button type="primary" link @click="handleShowTask(scope.row.staff_no, scope.row.staff_name)">查看任务</el-button>
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
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import { Close } from "@element-plus/icons";
import { computed, defineComponent, PropType, watch } from "vue";
import { ref } from "vue";
import useGetEmployee from "./composables/getEmployee";
export default defineComponent({
  name: "employeeManagement",
  components: { Close },
  props: {
    list: {
      default: () => [],
      type: Array as PropType<Array<any>>
    }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    const treeRef = ref();
    const keywordTreeRef = ref();
    const { tipMessage } = useMessageTip();
    const filterNode = (value: string, data: Record<string, any>) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };

    watch(
      () => store.state.addMemberVisible,
      (newVal) => {
        if (newVal) {
          handleShowDialog();
        } else {
          closeDialog();
        }
      }
    );

    const addMemberVisible = computed(() => store.state.addMemberVisible);

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
        treeRef?.value.filter(newValue);
      }
    );

    const closeDialog = () => {
      store.commit(MutationType.addMemberVisible, false);
    };

    return {
      addMemberVisible,
      closeDialog,
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
      padding-right: 10px;
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
