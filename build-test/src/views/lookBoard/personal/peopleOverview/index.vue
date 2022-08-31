<template>
  <div>
    <page-table
      :loading="tableLoading"
      :tableData="displayTbody"
      :total="total"
      :currentPage="page"
      @cell-click="cellClick"
      @sort-change="sortChange"
      @handlePagationChange="handlePagationChange"
      :border="true"
      class="user-calendar-table"
      ref="pageTableRef"
    >
      <template #header>
        <div class="search-header">
          <div class="search-left">
            <search-form
              :searchArray="searchArray"
              :currentActive="currentActive"
              @change="searchChange"
              @quickSeacrh="quickSeacrh"
              @changeSearch="changeSearch"
              @onCancel="onCancleSearch"
              @resetSearch="resetSearch"
            ></search-form>
          </div>
          <div class="search-right">
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
          </div>
        </div>
      </template>
      <template #main>
        <el-table-column
          v-for="(it, index) in displayTheader"
          :label="it"
          align="center"
          :min-width="index <= 1 ? 80 : 40"
          :key="`column${index}${displayTheader.length}`"
          :sortable="index <= 1 ? 'custom' : false"
          :prop="`${index <= 1 ? ['staff_name', 'job_name'][index] : index}`"
        >
          <template #default="scope">
            <div
              class="day"
              :class="{
                'color-day-1': index > 1 && scope.row[index] == 1,
                'color-day-2': index > 1 && scope.row[index] == 2,
                'color-day-3': index > 1 && scope.row[index] == 3
              }"
            >
              <span v-if="index <= 1">{{ scope.row[index] }}</span>
              <span v-if="today == getCellCertainDay(index)" class="today-tag"></span>
              <!-- 当前有选中的格子 -->
              <PeopleCell
                v-if="index > 1 && clickCell[0] == scope.$index && clickCell[1] == index"
                :columnIndex="index"
                :type="scope.row[index]"
                :rowIndex="scope.$index"
                :year="getSearchParamsYear()"
                :staffName="getCellStaffName(scope.$index)"
                :staffNo="getCellStaffNo(scope.$index)"
                :certainDay="getCellCertainDay(index)"
              ></PeopleCell>
            </div>
          </template>
        </el-table-column>
      </template>
    </page-table>

    <!-- 底部颜色说明图 -->
    <div class="color-description">
      <span class="color-block-1">节假日</span>
      <span class="color-block-2">有任务</span>
      <span class="color-block-3">空闲</span>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { map, indexOf } from "lodash";
import { POST_TYPE } from "@/utils/contantOptions";
import PeopleCell from "./components/cell.vue";
import { ResponseParams } from "@/types/response";
import useFetchSearch from "./hooks/useFetchSearch";
import { Pagation } from "@/composables/usePagation";
import { demandList } from "@/views/iteration/useMixin";
import { getIterateList } from "@/api/request-modules/board";
import { selectProductList } from "@/api/request-modules/product";
import { getDepartmentList } from "@/api/request-modules/common";
import { BtnArray, SearchForm, SearchArray } from "@/types/interface";
import useGetEmployeeCalendarList from "./hooks/useGetEmployeeCalendarList";
import { defineComponent, reactive, toRefs, computed, onMounted, ref, watch } from "vue";

// 列结构
interface dayColumn {
  prop: string; // 与表格字段对应
  label: string; // 用于显示
}

export default defineComponent({
  name: "peopleOverview",
  components: {
    PeopleCell
  },
  setup() {
    const pageTableRef = ref();
    const selectTreeRef = ref();
    const maxHeight = computed(() => {
      const clientHeight = document.documentElement.clientHeight;
      return clientHeight;
    });

    const tableLoading = ref(false);
    const popoverLoading = ref(false);
    // let departmentDefault = ref("9I0C");
    let departmentOptions = ref([]);
    let allPeople: any = ref([]);
    let productList: any = ref([]);
    let iterationList: any = ref([]);
    let days: dayColumn[] = reactive([]);
    const today = ref(dayjs().format("MM/DD"));

    // 搜索条件
    let searchParams: Record<string, any> = reactive({
      product_id: "",
      iteration_id: "",
      department_code: [],
      staff_name: "",
      filter_type: 2,
      position_type: [],
      month: dayjs().format("YYYY-MM")
    });

    // 快捷搜索列表的数据
    const defaultBtnArray: BtnArray[] = [
      { id: "-1", label: "所有", key: "" },
      { id: "1", label: "我的部门", key: "filter_type" },
      { id: "2", label: "我的项目", key: "filter_type" },
      { id: "3", label: "我的岗位", key: "filter_type" },
      { id: dayjs().format("YYYY-MM"), label: "本月", key: "month" },
      { id: dayjs().subtract(1, "month").format("YYYY-MM"), label: "上月", key: "month" }
    ];

    const defaultSearchForm: any = [
      {
        type: "input",
        label: "姓名",
        key: "staff_name",
        val: ""
      },
      {
        type: "customComponents",
        componentIndex: 1,
        label: "部门",
        val: [],
        key: "department_code",
        multiple: true,
        valueKey: ["value", "label"],
        listData: allPeople
      },
      {
        type: "select",
        label: "项目",
        val: [],
        multiple: false,
        key: "product_id",
        valueKey: ["id", "name"],
        listData: productList
      },
      {
        type: "select",
        label: "迭代",
        multiple: false,
        val: [],
        key: "iteration_id",
        valueKey: ["id", "name"],
        listData: iterationList
      },
      {
        type: "select",
        label: "岗位",
        val: [],
        key: "position_type",
        multiple: true,
        valueKey: ["value", "label"],
        listData: POST_TYPE
      }
    ];

    const searchArray: SearchArray = reactive({
      btnArray: defaultBtnArray,
      searchForm: defaultSearchForm
    });

    const currentActive = ref("2");

    const clearSearchParams = (clearMonth = true) => {
      // searchParams = {
      //   product_id: "",
      //   iteration_id: "",
      //   department_code: [],
      //   staff_name: "",
      //   position_type: [],
      //   month: dayjs().format("YYYY-MM")
      // };
      delete searchParams["filter_type"];
      Object.keys(searchParams).forEach((key) => {
        if (["product_id", "iteration_id", "staff_name"].includes(key)) {
          searchParams[key] = "";
        } else if (["department_code", "position_type"].includes(key)) {
          searchParams[key] = [];
        } else {
          if (clearMonth) {
            searchParams.month = dayjs().format("YYYY-MM");
          }
        }
      });
    };

    const quickSeacrh = (val: BtnArray) => {
      const { key, id } = val;
      clearSearchParams();
      switch (key) {
        case "filter_type":
          searchParams[key] = Number(id);
          break;
        case "month":
          searchParams[key] = id;
          break;
        default:
          break;
      }
      handleConditionSearch(true);
    };

    const resetSearch = () => {
      searchArray.searchForm[3].listData = [];
      getIterationDataList(0);
    };

    const changeSearch = (val: SearchForm) => {
      clearSearchParams(false);
      map(val, (value, key) => {
        switch (key) {
          case "staff_name": // 姓名
          case "product_id": // 项目
          case "iteration_id": // 迭代
          case "department_code": // 岗位类型
            searchParams[key] = value;
            break;
          case "position_type": // 部门
            if (value) {
              searchParams[key] = value;
            } else {
              searchParams[key] = [];
            }
            break;
        }
      });
      handleConditionSearch(true);
    };

    // 搜索下拉列表值改变
    const searchChange = (val: SearchForm) => {
      if (val.key === "product_id") {
        searchArray.searchForm[3].val = [];
        getIterationDataList(val.val);
      }
    };

    const onCancleSearch = () => {
      searchArray.btnArray = defaultBtnArray;
      searchArray.searchForm = defaultSearchForm;
    };

    // 搜索
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (resetPage?: boolean) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (resetPage) {
          await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams);
        } else {
          const currentPage = pageTableRef.value.getCurrentPage();
          await getData(currentPage, true, searchParams);
        }
      }, 300);
    };

    const handlePagationChange = async (pagationParams?: Pagation) => {
      const page = pagationParams ? pagationParams.pageIndex : 1;
      const pageSize = pagationParams ? pagationParams.pageSize : 20;
      await getData({ pageIndex: page, pageSize: pageSize }, true, searchParams);
    };
    // 选择日期
    const changeDay = (month: string) => {
      searchParams.month = month;
      handleConditionSearch(true);
    };

    const getSearchParamsYear = () => {
      const year = searchParams.month.split("-")[0];
      return year;
    };

    // 得到当前单元格员工编号
    const getCellStaffNo = (rowIndex: number) => {
      const { employeeCalendarList } = tableData;
      return employeeCalendarList[rowIndex][0];
    };

    // 得到当前单元格员工名字
    const getCellStaffName = (rowIndex: number) => {
      const { employeeCalendarList } = tableData;
      return employeeCalendarList[rowIndex][1];
    };

    // 得到当前单元格日期
    const getCellCertainDay = (columnIndex: number) => {
      const { displayTheader } = tableData;
      return displayTheader[columnIndex];
    };

    const { getData, tableData } = useGetEmployeeCalendarList(useFetchSearch, searchParams);

    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr: Array<Record<string, any>> = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.value = people[i].department_code;
        obj.label = people[i].name;
        if (people[i].son && people[i].son.length) {
          obj.children = dataReverse(people[i].son);
        }
        newArr.push(obj);
      }
      return newArr;
    };

    const getSelectDepartmentList = () => {
      getDepartmentList<ResponseParams.ResponseDataSuccess>().then((res) => {
        if (res.code === 200 && res.data) {
          allPeople.value = dataReverse(res.data);
        } else {
          allPeople.value = [];
        }
      });
    };

    const getSelectProductList = () => {
      selectProductList<ResponseParams.ResponseDataSuccess>().then((res: any) => {
        if (res.code === 200 && res.data) {
          productList.value = res.data;
        } else {
          productList.value = [];
        }
      });
    };

    const getIterationDataList = (params: number) => {
      getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: params }).then((res) => {
        if (res.code === 200 && res.data) {
          iterationList.value = res.data;
        } else {
          iterationList.value = [];
        }
      });
    };

    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.sort_name = prop;
      searchParams.sort_by = order === "ascending" ? 1 : 2;
      handleConditionSearch();
    };

    let clickCell = reactive([-1, -1]);
    let prevCell: any = null; // 上次选中的格子
    let currCell: any = null; // 当前选中的格子
    let needShowPopover = ref(false); // 是否要显示格子浮框
    const cellClick = (row: any, column: any, cell: HTMLDivElement) => {
      // 第一列和第二列暂时不处理
      const { displayTbody } = tableData;
      clickCell[0] = indexOf(displayTbody, row);
      clickCell[1] = column.no;
      prevCell = currCell;
      currCell = cell.getElementsByClassName("day")[0] as HTMLDivElement;
      if (prevCell) {
        prevCell.style.backgroundColor = "";
      }
      if (currCell && column.no > 1) {
        setTimeout(() => {
          needShowPopover.value = true;
          currCell.style.backgroundColor = "#e6a23c";
        }, 100);
      }
    };

    // 设置表头今天的标志颜色
    const setTheaderTodyTag = (type: string, index: number) => {
      if (index <= 1) {
        return;
      }
      const theader = document.querySelector(".el-table__header");
      const theadNode = theader?.getElementsByClassName("el-table__cell")[index] as HTMLDivElement;
      if (type === "add") {
        theadNode.style.backgroundColor = "#22b089";
      } else {
        theadNode.style.backgroundColor = "#fff";
      }
    };

    const dayIndex = ref(-1);
    watch(
      () => tableData.displayTheader,
      (newVal) => {
        const today = dayjs().format("MM/DD");
        newVal.forEach((item: string, index: number) => {
          if (item === today) {
            dayIndex.value = index;
            setTimeout(() => {
              setTheaderTodyTag("add", index);
            }, 1200);
          }
        });
        setTimeout(() => {
          setTheaderTodyTag("clear", dayIndex.value);
        }, 600);
      },
      {
        deep: true,
        immediate: true
      }
    );

    onMounted(() => {
      getSelectDepartmentList();
      getSelectProductList();
      getIterationDataList(0); // 默认查询全部
      handleConditionSearch(true);
    });

    return {
      days,
      today,
      getData,
      maxHeight,
      clickCell,
      allPeople,
      demandList,
      searchArray,
      tableLoading,
      searchParams,
      pageTableRef,
      currentActive,
      selectTreeRef,
      needShowPopover,
      popoverLoading,
      departmentOptions,
      changeDay,
      cellClick,
      sortChange,
      resetSearch,
      quickSeacrh,
      changeSearch,
      searchChange,
      onCancleSearch,
      getCellStaffNo,
      getCellStaffName,
      getSearchParamsYear,
      getCellCertainDay,
      handleConditionSearch,
      handlePagationChange,
      ...toRefs(tableData)
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
.color-day-1 {
  background: #7fd1bb;
}

.color-day-2 {
  background: #94c8ff;
}

.color-day-3 {
  background: #fff;
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

.search-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-right: 50px;
  .search-left {
    display: flex;
    justify-content: flex-start;
  }
}

.color-description {
  z-index: 999;
  position: absolute;
  float: left;
  margin-left: 20px;
  margin-top: -62px;
  .color-block-1 {
    background: #7fd1bb;
    color: #666666;
    border: 1px solid #7fd1bb;
    text-align: center;
    min-width: 50px;
    line-height: 24px;
    margin: 0 6px;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 12px;
  }
  .color-block-2 {
    background: #94c8ff;
    color: #666666;
    text-align: center;
    border: 1px solid #94c8ff;
    min-width: 50px;
    line-height: 24px;
    margin: 0 6px;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 12px;
  }
  .color-block-3 {
    background: #fff;
    color: #666666;
    border: 1px solid #666666;
    text-align: center;
    min-width: 50px;
    line-height: 24px;
    margin: 0 6px;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 12px;
  }
}

.today-tag {
  background-color: #22b089;
  width: 2px;
  height: calc(100% + 2px);
  display: inline-block;
  position: absolute;
  left: 50%;
}

:deep(.el-table .cell) {
  padding: 1px;
  text-align: center;
}

:deep(.user-calendar-table .el-table__header .el-table__cell) {
  border-right: 1px solid #ebeef5 !important;
}

:deep(.user-calendar-table .el-table__body .el-table__cell) {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
  border-right: 1px solid #ebeef5 !important;
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
