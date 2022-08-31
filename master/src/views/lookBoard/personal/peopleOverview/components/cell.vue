<template>
  <el-popover trigger="hover" v-loading="loading" :width="type == 2 ? 750 : 200" :placement="rowIndex > 5 ? 'top' : 'bottom'">
    <template #reference>
      <span class="popover-cell">&nbsp;</span>
    </template>
    <span v-if="type == 3">今天是空闲状态，找点事来做吧</span>
    <span v-else-if="type == 1">今日是休息日哦，要加班吗？</span>
    <div v-else>
      <div class="details-header-top">
        <span class="details-header-left">{{ `${calendarDetails?.staffName} - ${calendarDetails?.date}` }}</span>
        <span class="details-header-right">
          {{ `当日统计：` }}
          {{ `计划工作项 ${calendarDetails?.work_num}个，` }}
          {{ `今日完成 ${calendarDetails?.complete_work_num}个，` }}
          {{ `修复BUG ${calendarDetails?.fixed_bug_num}个，` }}
          {{ `新增BUG ${calendarDetails?.assigned_bug_num}个，` }}
          {{ `提交BUG ${calendarDetails?.submit_bug_num}个` }}
        </span>
      </div>
      <el-table :data="calendarDetails?.list" :show-header="true" :border="true" max-height="320">
        <el-table-column label="工作" property="name" align="left" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="类型" property="type" width="60">
          <template #default="scope">
            {{ ["", "需求", "任务", "BUG"][Number(scope.row.type)] }}
          </template>
        </el-table-column>
        <el-table-column label="工时" property="hours" width="60"></el-table-column>
        <el-table-column label="预计起止" property="start" width="100">
          <template #default="scope">
            {{ `${scope.row.start} - ${scope.row.end}` }}
          </template>
        </el-table-column>
        <el-table-column label="实际起止" property="start" width="100">
          <template #default="scope">
            {{ `${scope.row.real_start} - ${scope.row.real_end}` }}
          </template>
        </el-table-column>
        <el-table-column label="所属项目" property="product_name"></el-table-column>
      </el-table>
    </div>
  </el-popover>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { ResponseParams } from "@/types/response";
import { defineComponent, reactive, ref, onMounted } from "vue";
import { getEmployeeCalendarDetails } from "@/api/request-modules/iteration";

interface CalendarItems {
  assigned_bug_num?: number;
  complete_work_num?: number;
  date?: string;
  fixed_bug_num?: number;
  staffName?: string;
  staff_no?: string;
  submit_bug_num?: number;
  work_num?: number;
  list: Array<{
    end?: string;
    hours?: number;
    name?: string;
    product_id: number;
    product_name: string;
    real_end?: string;
    real_start?: string;
    start?: string;
    status?: string;
    type: number;
  }>;
}

export default defineComponent({
  name: "PeopleCell",
  components: {},
  props: {
    // 日期类型
    type: {
      type: Number,
      default: () => {
        return 0;
      }
    },
    // 横向索引值
    rowIndex: {
      type: Number,
      default: () => {
        return 0;
      }
    },
    // 纵向索引值
    columnIndex: {
      type: Number,
      default: () => {
        return 0;
      }
    },
    // 员工编号
    staffNo: {
      type: String,
      default: () => {
        return "";
      }
    },
    // 员工名称
    staffName: {
      type: String,
      default: () => {
        return "";
      }
    },
    // 当前月份
    certainDay: {
      type: String,
      default: () => {
        return "";
      }
    },
    year: {
      type: String,
      default: () => {
        return dayjs().format("YYYY");
      }
    }
  },
  emits: ["change"],
  setup(props) {
    const loading = ref(false);
    let calendarDetails = reactive<CalendarItems>({
      list: [],
      date: "",
      staff_no: "",
      staffName: "",
      work_num: 0,
      fixed_bug_num: 0,
      submit_bug_num: 0,
      assigned_bug_num: 0,
      complete_work_num: 0
    });
    const today = ref(dayjs().format("MM/DD"));

    onMounted(() => {
      getCalendarDetails(props.staffNo, props.certainDay);
    });

    const getCalendarDetails = (staff_no: string, certain_day: string) => {
      loading.value = true;
      if (props.type == 2) {
        getEmployeeCalendarDetails<ResponseParams.ResponseDataSuccess>({
          staff_no: staff_no,
          certain_day: certain_day,
          year: props.year
        }).then((res) => {
          if (res.code === 200 && res.data) {
            const { list, date, staff_no, staffName, work_num, fixed_bug_num, submit_bug_num, assigned_bug_num, complete_work_num } = res.data;
            calendarDetails.list = list;
            calendarDetails.date = date;
            calendarDetails.staff_no = staff_no;
            calendarDetails.staffName = staffName;
            calendarDetails.work_num = work_num;
            calendarDetails.fixed_bug_num = fixed_bug_num;
            calendarDetails.submit_bug_num = submit_bug_num;
            calendarDetails.assigned_bug_num = assigned_bug_num;
            calendarDetails.complete_work_num = complete_work_num;
          } else {
            calendarDetails = {
              list: [],
              date: "",
              staff_no: "",
              staffName: "",
              work_num: 2,
              fixed_bug_num: 0,
              submit_bug_num: 0,
              assigned_bug_num: 2,
              complete_work_num: 0
            };
          }
          loading.value = false;
        });
      }
    };

    const getDisplayTime = (start: string, end: string) => {
      if (start && end) {
        return `${start} - ${end}`;
      } else if (start && !end) {
        return `${start} - ${start}`;
      } else if (!start && end) {
        return `${end} - ${end}`;
      } else {
        return "";
      }
    };

    return {
      today,
      loading,
      calendarDetails,
      getDisplayTime
    };
  }
});
</script>

<style lang="less" scoped>
.day-cell {
  display: inline-block;
  width: 100%;
  height: 100%;
}
.day-active {
  background-color: rgb(230, 162, 60) !important;
}
.popover-cell {
  background: transparent;
  width: 100%;
  height: 100%;
  display: inline-block;
  position: absolute;
  left: 0px;
}

.details-header-top {
  display: flex;
  justify-content: space-between;
  height: 42px;
  line-height: 42px;
  .details-header-left {
    font-size: 14px;
    font-weight: bold;
  }
  .details-header-right {
    font-size: 12px;
    color: #999;
  }
}

// .today-tag {
//   background-color: #22b089;
//   width: 2px;
//   height: calc(100% + 2px);
//   display: inline-block;
//   position: absolute;
//   left: 50%;
// }

:deep(.el-table__cell) {
  border-right: 1px solid #ebeef5 !important;
}

:deep(.el-table__header .el-table__cell) {
  background-color: #f0f9ea;
}
</style>
