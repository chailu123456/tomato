<template>
  <div>
    <page-table :tableData="employeeCalendarList" @handlePagationChange="getData" :total="total" :border="true" :pageSize="20" ref="pageTableRef">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="姓名">
            <el-input @keyup.enter="handleConditionSearch" @change="handleName" v-model="searchParams.staff_name" placeholder="请输入姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="部门" class="rp-select">
            <el-cascader
              placeholder="请选择"
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
              @change="handleChange"
              :options="allPeople"
              v-model="searchParams.department_code"
              collapse-tags
              ref="cascaderVal"
              filterable
              clearable
              :props="{ multiple: true, value: `id` }"
            ></el-cascader>
          </el-form-item>
          <!-- <el-form-item label="部门">
            <select-tree
              ref="selectTreeRef"
              :options="departmentOptions"
              @getValue="getSelectTreeValue"
              @initOptions="getDepartmentOptions"
              :value="departmentDefault"
              @click.stop="clickCell[0] = -1"
            ></select-tree>
          </el-form-item> -->
          <el-form-item label="迭代">
            <el-cascader
              v-model="searchParams.iteration_id"
              placeholder="请输入迭代"
              clearable
              @change="handleIteration"
              :options="demandList"
              :props="{ value: `id`, label: `name`, children: `child_list`, emitPath: false }"
              filterable
            ></el-cascader>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">搜 索</el-button>
          </el-form-item> -->
          <el-form-item label="选择月份" style="position: absolute; right: 32px">
            <el-date-picker
              v-model="searchParams.month"
              style="width: 116px"
              :clearable="false"
              @change="changeDay"
              value-format="YYYY-MM"
              type="month"
              placeholder="选择月"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="name" align="center" label="姓名" min-width="50" fixed> </el-table-column>
        <el-table-column :prop="day.prop" align="center" :label="day.label" min-width="50" v-for="(day, index) in days" :key="index">
          <template #default="scope">
            <div
              class="day"
              :class="{
                'day-white': scope.row[day.prop] && getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'white',
                'day-green': scope.row[day.prop] && getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'green',
                'day-blue': scope.row[day.prop] && getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'blue',
                'day-active': clickCell[0] === scope.$index && clickCell[1] === index
              }"
            >
              <span
                v-if="scope.row[day.prop] && (clickCell[0] !== scope.$index || clickCell[1] !== index)"
                style="display: inline-block; width: 100%; height: 100%"
                @click.stop="handleClick(scope.$index, index)"
                >{{ getIds(scope.row[day.prop].week, scope.row[day.prop].list) }}
              </span>
              <el-popover
                v-if="scope.row[day.prop] && clickCell[0] === scope.$index && clickCell[1] === index"
                :placement="scope.$index > 5 ? 'top' : 'bottom'"
                :width="getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'blue' ? 700 : 200"
                trigger="hover"
              >
                <template #reference>
                  <span style="display: inline-block; width: 100%; height: 100%">{{ getIds(scope.row[day.prop].week, scope.row[day.prop].list) }}</span>
                </template>
                <span v-if="getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'white'">今天是空闲状态，找点事来做吧</span>
                <span v-else-if="getColor(scope.row[day.prop].week, scope.row[day.prop].list) === 'green'">今日是休息日哦，要加班吗？</span>
                <el-table v-else :data="scope.row[day.prop].list" :show-header="false" :border="true" stripe max-height="200">
                  <el-table-column property="id"></el-table-column>
                  <el-table-column property="name" class-name="table-column-left" width="330" :show-overflow-tooltip="true"></el-table-column>
                  <el-table-column property="complete_percent">
                    <template #default="scope"> {{ scope.row.complete_percent }}% </template>
                  </el-table-column>
                  <el-table-column property="dev_time" width="200">
                    <template #default="scope"> {{ scope.row.dev_time }}至{{ scope.row.release_time }} </template>
                  </el-table-column>
                </el-table>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, onBeforeUnmount, ref, toRaw } from "vue";
import { getDepartmentList } from "@/api/request-modules/common";
import useFetchSearch from "./hooks/useFetchSearch";
import useGetEmployeeCalendarList from "./hooks/useGetEmployeeCalendarList";
import { ResponseParams } from "@/types/response";
// import useGetDemandList from "@/views/iteration/useGetDemandList";
import dayjs from "dayjs";
import { setSession, getSession } from "@/utils/sesssion";
import { demandList } from "@/views/iteration/useMixin";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
// 列结构
interface dayColumn {
  prop: string; // 与表格字段对应
  label: string; // 用于显示
}
// 迭代详情
interface iterationDetail {
  id: number;
  name: string;
  complete_percent: number;
  dev_time: string;
  release_time: string;
}
export default defineComponent({
  name: "staffOverview",
  setup() {
    const pageTableRef = ref();
    const selectTreeRef = ref();
    const maxHeight = computed(() => {
      const clientHeight = document.documentElement.clientHeight;
      return clientHeight;
    });
    // 搜索条件
    let searchParams: Record<string, any> = reactive({
      product_id: 0,
      iteration_id: "",
      department_code: [],
      staff_name: "",
      month: dayjs().format("YYYY-MM")
    });
    // 搜索
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      days.length = 0; // 重置列字段
      getDays(searchParams.month);
      // 点击搜索，缓存三个条件，不包括月份
      const paramNoTime = JSON.parse(JSON.stringify(searchParams));
      delete paramNoTime.month;
      setSession("employeeCalendarSearch", JSON.stringify(paramNoTime));
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // 获取当前page_size，如果有缓存，不设置，没有缓存默认第一页
        const currentPage = pageTableRef.value.getCurrentPage();
        if (!toRaw(currentPage).pageSize) {
          await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams);
        } else {
          await getData(currentPage, true, searchParams);
        }
        stopAutoGetData.value = false;
      }, 300);
    };
    // 部门
    let departmentDefault = ref("9I0C");
    let departmentOptions = ref([]);
    if (getSession("employeeCalendarSearch") !== null) {
      const param = getSession("employeeCalendarSearch", true) as Record<string, any>;
      departmentDefault.value = param.department_code || "9I0C";
      searchParams = reactive({
        product_id: param.product_id,
        iteration_id: param.iteration_id,
        department_code: param.department_code,
        staff_name: param.staff_name,
        month: dayjs().format("YYYY-MM")
      });
    }

    // 获取选中部门
    // const getSelectTreeValue = (departmentCode: string) => {
    //   searchParams.department_code = departmentCode;
    //   handleConditionSearch();
    // };
    // 列
    let days: dayColumn[] = reactive([]);
    // 选择日期
    const changeDay = (month: string) => {
      searchParams.month = month;
      getDays(month);
      handleConditionSearch();
    };
    // 根据每月,获取列
    const getDays = (month: string) => {
      // days = [];
      const m = dayjs(month).month() + 1;
      const mon = m >= 10 ? m.toString() : "0" + m;
      const dayNumber = dayjs(month).daysInMonth();
      for (let i = 1; i <= dayNumber; i++) {
        let day: string = i >= 10 ? i.toString() : "0" + i;
        const column: dayColumn = { prop: `day-${mon}-${day}`, label: `${mon}/${day}` };
        days.push(column);
      }
    };
    getDays(searchParams.month);
    // 获取对应颜色  有迭代--蓝色;白色--周一至周五,同时没有迭代;绿色--周六至周日
    const getColor = (week: string, list: iterationDetail[]) => {
      try {
        if (week === "0" || week === "6") {
          return "green";
        } else {
          if (!list.length) {
            return "white";
          }
          return "blue";
        }
      } catch {
        console.log("月份不对");
      }
    };
    const handleName = (val: string) => {
      if (!val) {
        searchParams.staff_name = "";
        handleConditionSearch();
      }
    };

    const handleIteration = (val: number) => {
      if (!val) searchParams.iteration_id = "";
      handleConditionSearch();
    };

    // 解析list的id,取前两个
    const getIds = (week: string, list: iterationDetail[]) => {
      try {
        let ids = "";
        if (week === "0" || week === "6") {
          return ids;
        }
        if (list.length) {
          ids += list[0].id;
        }
        if (list.length > 1) {
          ids += `,${list[1].id}`;
        }
        if (list.length > 2) {
          ids += "...";
        }
        return ids;
      } catch {
        console.log("月份不对");
      }
    };
    let allPeople: any = ref(null);
    const cascaderVal = ref();
    const handleChange = () => {
      const val = cascaderVal?.value.getCheckedNodes();
      let code: string[] = [];
      if (val && val.length) {
        val.forEach((item: Record<string, any>) => {
          code.push(item.value);
        });
      }
      searchParams.department_code = code;
      if (!val.length) getData();
    };
    // 单元格点击背景色效果
    let clickCell = reactive([-1, -1]);
    const handleClick = (rowIndex: number, columnIndex: number) => {
      clickCell[0] = rowIndex;
      clickCell[1] = columnIndex;
    };
    // 清除选中单元格
    const clearActive = () => {
      clickCell.length = 0;
    };
    const listener = document.addEventListener("click", clearActive, false);
    onBeforeUnmount(() => {
      document.removeEventListener("click", clearActive);
    });
    // 获取需求下拉列表
    // const getDemandList = useGetDemandList();
    // const getDemandListFn = () => {
    //   getDemandList().then((res) => {
    //     demandList.value = res;
    //   });
    // };
    // getDemandListFn();
    const { getData, tableData, stopAutoGetData } = useGetEmployeeCalendarList(useFetchSearch, searchParams);

    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as number;
      // 重置searchParams
      searchParams.iteration_id = "";
      searchParams.staff_name = "";
      searchParams.department_code = [];
      handleConditionSearch();
    });
    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr: Array<Record<string, any>> = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].department_code;
        obj.label = people[i].name;
        if (people[i].son && people[i].son.length) {
          obj.children = dataReverse(people[i].son);
        }
        newArr.push(obj);
      }
      return newArr;
    };
    // 子组件需要渲染完，才能处理数据
    getDepartmentList<ResponseParams.ResponseDataSuccess>().then((res) => {
      allPeople.value = dataReverse(res.data);
    });
    return {
      demandList,
      maxHeight,
      departmentOptions,
      getData,
      ...toRefs(tableData),
      searchParams,
      days,
      changeDay,
      getDays,
      getColor,
      getIds,
      handleClick,
      clickCell,
      listener,
      handleConditionSearch,
      pageTableRef,
      selectTreeRef,

      handleName,
      handleIteration,
      handleChange,
      allPeople,
      cascaderVal
    };
  }
});
</script>

<style scoped lang="less">
.day {
  height: 32px;
  color: rgb(100, 105, 112);
  text-align: center;
  line-height: 32px;
  cursor: pointer;
}
.day-white {
  background-color: #fff;
}
.day-green {
  background-color: rgb(172, 230, 177);
}
div.day-active {
  background-color: rgb(230, 162, 60);
}
:deep(.el-table .cell) {
  padding: 0;
  text-align: center;
  height: 32px;
  line-height: 32px;
}
:deep(.el-table--border td:first-child .cell, .el-table--border th:first-child .cell) {
  padding: 0;
}
:deep(.el-table td, .el-table th) {
  padding: 0;
}
:deep(.el-table--small th) {
  padding: 0;
}

:deep(.rp-select) {
  .el-input {
    min-width: 360px;
    height: 32px;
  }
  .el-select__tags {
    min-width: 300px !important;
  }
  .el-cascader__tags {
    min-width: 320px !important;
  }
  .el-select__tags-text {
    min-width: 300px !important;
  }
  span.el-tag {
    margin-top: 6px;
  }
  .el-cascader__search-input {
    width: 300px;
    // position: absolute;
    // top: -16px;
    // height: 0;
    // padding: 1.2em 0.5em;
    // background-clip: content-box;
  }
}
:deep(.page) {
  bottom: 22px;
}
.day-blue {
  background-color: rgb(202, 214, 236);
}
.status-enabled {
  color: rgb(108, 188, 1);
}
</style>
<style lang="less">
.el-cascader-menu__wrap {
  height: 400px !important;
}
</style>
