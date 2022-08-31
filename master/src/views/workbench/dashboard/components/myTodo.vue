<!--
 * @Author: 宋绍华
 * @Date: 2022-06-22 11:42:15
 * @LastEditTime: 2022-06-23 11:51:09
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\workbench\dashboard\components\myTodo.vue
-->
<template>
  <div class="dashboard-todo">
    <div class="todo">
      <div class="todo-top">
        <div class="todo-top-left">
          <span>我的待办</span
          ><el-date-picker
            :clearable="false"
            value-format="YYYY-MM-DD"
            v-model="currValue"
            type="date"
            placeholder="请选择"
            size="default"
            style="width: 150px; margin-left: 10px"
            @change="onChangeDate"
          />
        </div>
        <div class="todo-top-left">
          <el-dropdown>
            <el-icon @click="addTodo" :size="22"><Plus /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="addTodo">新建待办</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="todo-empty" v-if="!list?.length">
        <el-empty class="todo-empty-img" style="padding: 0; margin-top: 0px" description=" " :image-size="70" />
        <div class="todo-empty-text">当前暂无待办，点击<el-button type="primary" link @click="addTodo">创建待办</el-button></div>
      </div>
      <!-- 待办列表 -->
      <div v-else class="todo-scroll" v-loading="loading">
        <TodoItem v-for="(item, i) in list" :data="item" :key="`todoitem${i}`" @click="showTodoDetail(item)" />
      </div>
    </div>
    <!-- 编辑/新建待办 -->
    <HandleWaitDialog :personInfo="curInfo" :item="tipsItem" @show="onShow" @updateData="onUpdateData" v-model:visible="visible" />
    <!-- 添加组织人员 -->
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
    <!-- 查看待办详情 -->
    <CalendarSlotTips :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" :type="4" @updateData="onUpdateData" v-model:tipsVisible="tipsVisible" />
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { nextTick, onMounted, ref } from "vue";
import { Plus } from "@element-plus/icons";
import TodoItem from "./todoItem.vue";
import CalendarSlotTips from "@/views/workbench/work/calendar-slot-dialog.vue";
import HandleWaitDialog from "@/views/workbench/work/handle-wait-dialog.vue";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import useDashboard, { BackLogItemInter, BackLogListItemIter, BugItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";

export default {
  name: "todo"
};
</script>

<script lang="ts" setup>
const currValue = ref(dayjs().format("YYYY-MM-DD"));
const visible = ref(false);
const personVisible = ref(false);
const tipsVisible = ref(false);
const loading = ref(false);
const tipsItem = ref<IterationItemInter | BackLogItemInter | BugItemInter | TaskItemInter>();

const curInfo = ref({
  department: [],
  team_worker: [],
  selectPerson: [],
  day: {},
  type: 4,
  abeyancenEditItem: {} // 待办编辑item
});

// 待办list
const list = ref<BackLogListItemIter[]>();

const { useGetBackLogList, useGetBackLogDetail } = useDashboard();

onMounted(() => {
  getBackLogList(currValue.value);
});
// 获取待办列表
const getBackLogList = async (date: string) => {
  loading.value = true;
  const data = await useGetBackLogList({ date });
  nextTick(() => {
    loading.value = false;
  });
  if (data) {
    list.value = data?.list;
  }
};

const onShow = (show: boolean) => {
  personVisible.value = show;
};

const clearTodoInfo = () => {
  curInfo.value.department = [];
  curInfo.value.team_worker = [];
  curInfo.value.selectPerson = [];
  curInfo.value.abeyancenEditItem = [];
  curInfo.value.day = currValue.value;
};

const onUpdateData = () => {
  clearTodoInfo();
  tipsItem.value = {};
  visible.value = false;
  tipsVisible.value = false;
  getBackLogList(currValue.value);
};

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.value.department = department as any;
  curInfo.value.team_worker = team_worker as any;
  curInfo.value.selectPerson = selectPerson as any;
};

const handleItem = async (item: any) => {
  tipsItem.value = item;
  visible.value = true;
};

// 获取待办详情
const getBackLogDetail = async (params: { id: number; month?: string }) => {
  const data = await useGetBackLogDetail(params);
  return data;
};

// 新增TODO
const addTodo = () => {
  clearTodoInfo();
  visible.value = true;
};

// 显示TODO详情
const showTodoDetail = async (item: any) => {
  const data = await getBackLogDetail({ id: item.id, month: currValue.value });
  if (data) {
    clearTodoInfo();
    tipsItem.value = data;
    tipsVisible.value = true;
  }
};

// 时间切换
const onChangeDate = (date: string) => {
  getBackLogList(date);
};
</script>
<style lang="less" scoped>
.dashboard-todo {
  width: 100%;
  height: calc(100% - 581px);
  min-height: 120px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 8px 0 rgba(0, 0, 0, 0.02);
}
@media screen and (max-height: 850px) {
  .todo-empty-img {
    display: none;
  }
}
.todo {
  overflow-y: scroll;
  width: 100%;
  height: 100%;
  &-top {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 10px;
    font-size: 14px;
    color: #444;
    width: 100%;
    line-height: 56px;
    box-sizing: border-box;
    &-left {
      font-size: 14px;
      display: flex;
      align-items: center;
    }
  }

  &-empty {
    height: calc(100% - 56px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &-text {
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;

      button {
        font-size: inherit;
        margin-left: 4px;
      }
    }
  }

  &-scroll {
    overflow-y: scroll;
    height: calc(100% - 56px) !important;
    margin-left: 10px;
    // margin-right: 5px;
  }
}

.el-dropdown {
  cursor: pointer;
}
</style>
