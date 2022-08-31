<template>
  <div>
    <page-table
      :tableData="list"
      @handlePagationChange="getData"
      @handleRow="handleRow"
      @handleSelectionChange="handleSelectionChange"
      :total="total"
      ref="pageTableRef"
      @sort-change="sortChange"
      :stopAutoGetData="stopAutoGetData"
      :highlight="true"
      :currentPage="page"
    >
      <template #header>
        <el-form :inline="true" :model="formParams" @change="handleConditionSearch">
          <el-form-item label>
            <el-input placeholder="标题搜索" @change="handleInput" v-model="formParams.name"></el-input>
          </el-form-item>
          <el-form-item class="rp-select" label="等级">
            <el-select
              v-model="formParams.level"
              placeholder="请选择"
              clearable
              @change="handleLevel"
              multiple
              collapse-tags
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in PRIORITY" :key="item.value" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="rp-select" label="类型">
            <el-select v-model="formParams.type" placeholder="请选择" clearable @change="handleType" collapse-tags @remove-tag="handleConditionSearch">
              <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="rp-select" label="结果">
            <el-select
              v-model="formParams.status"
              placeholder="请选择"
              clearable
              @change="handleStatus"
              multiple
              collapse-tags
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in RESOULT" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="rp-select" label="创建人">
            <el-select
              @change="setFiled"
              v-model="formParams.tempStaff"
              value-key="staff_no"
              filterable
              placeholder="请选择"
              clearable
              collapse-tags
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no"></el-option>
            </el-select>
          </el-form-item>
          <router-link to="/project/iteration/useCaseAdd" class="use-add">
            <el-button type="primary">新增用例</el-button>
          </router-link>
          <el-button @click="exportTaskDate" class="all-option" type="primary">导 出</el-button>
        </el-form>
      </template>
      <template #main>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column sortable="custom" prop="id" label="ID" width="100"></el-table-column>
        <el-table-column sortable="custom" prop="name" class-name="table-column-left table-title" label="用例标题">
          <template #default="scoped">
            <div>{{ scoped.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="level" label="等级" width="90">
          <template #default="scope">
            <span :style="{ color: getLevel(scope.row.level, 1) }">{{ getLevel(scope.row.level) }}</span>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="status" label="实际结果" width="150">
          <template #default="scope">
            <div @click.stop="">
              <el-dropdown @command="(id: string) => handleCommand(id, scope.row)" trigger="click">
                <span class="el-dropdown-link">
                  <em
                    :style="{
                      width: '10px',
                      height: '10px',
                      display: 'inline-block',
                      borderRadius: '5px',
                      marginRight: '4px',

                      background: tableResoult[scope.row.status - 1]?.color
                    }"
                  ></em>
                  {{ tableResoult[scope.row.status - 1]?.label }}
                  <!-- <i class="el-icon-arrow-down el-icon--right"></i> -->
                  <el-icon>
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="(item, index) in tableResoult" :key="index" :command="item.value">
                      <em
                        :style="{
                          width: '10px',
                          height: '10px',
                          marginRight: '8px',
                          display: 'inline-block',
                          borderRadius: '5px',
                          background: item.color
                        }"
                      ></em>
                      <span :style="{ color: item?.color }">{{ item.label }}</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="type" label="用例类型" width="130">
          <template #default="scoped">
            <span>{{ scoped.row.type === 1 ? "冒烟" : "功能" }}用例</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="creator" label="创建人" width="130"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scoped">
            <el-button type="primary" link @click.stop="handleUpdateList(scoped.row)">编辑</el-button>
            <el-button type="primary" link @click.stop="handleRemarkList(scoped.row)">备注</el-button>
            <el-button type="danger" link @click.stop="handleDeleteList(scoped.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </template>
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num" @click="handleTypeList(0, ['1'])">已通过 {{ bugType.passed_num }} 条</span>
          <span class="rp-test-num" @click="handleTypeList(1, [1])">L0 {{ bugType.zero_type_num }} 条</span>
        </div>
      </template>
    </page-table>
    <div class="rp-use-case-opation" v-if="selectMore.length">
      <el-button @click="handleUpdateList(0)">编辑</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-dropdown size="small" @command="(id: string) => handleCommand(id)">
        <el-button>
          结 果
          <i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :command="item.value" v-for="(item, index) in tableResoult" :key="index">
              <em
                :style="{
                  width: '10px',
                  height: '10px',
                  marginRight: '8px',
                  display: 'inline-block',
                  borderRadius: '5px',
                  background: item.color,
                  marginRight: '4px'
                }"
              ></em>
              <span :style="{ color: item.color }">{{ item.label }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-divider direction="vertical"></el-divider>
      <el-button @click="handleDeleteList(0)">删除</el-button>
    </div>

    <!-- 编辑备注 -->
    <el-dialog center title="编辑备注" v-model="isOpenEditRemark" width="30%">
      <div style="margin-top: 16px">
        <el-form :model="dialogFormData">
          <el-form-item label>
            <el-input
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 18 }"
              maxlength="300"
              placeholder="请输入1-300字备注"
              v-model="dialogFormData.remark"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isOpenEditRemark = false">取 消</el-button>
          <el-button type="primary" v-debounce @click="handleUpdateStatus">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-drawer v-model="drawerUseCase" direction="rtl" :modal="false" modal-class="case-drawer" size="100%">
      <template #title>
        <div class="drawer-title">用例详情</div>
      </template>
      <div class="rp-drawer-use">
        <div class="rp-drawer-title">
          <el-button>{{ drawerVal.id }}</el-button>
          <h1>{{ drawerVal.name }}</h1>
        </div>
        <div class="rp-drawer-content">
          <div class="content-list">
            <div class="content-list-title">
              <span class="list-icon"></span>
              <span class="list-name">基本信息</span>
            </div>
            <div class="list-show">
              <div>
                等级：
                <span :style="{ color: getLevel(drawerVal.level, 1) }">{{ getLevel(drawerVal.level) }}</span>
              </div>
              <div>
                类型：
                <span>{{ drawerVal.type === 1 ? "冒烟" : "功能" }}用例</span>
              </div>
              <div>
                结果：
                <span :style="{ color: tableResoult[drawerVal.status - 1].color }">{{ tableResoult[drawerVal.status - 1].label }}</span>
              </div>
              <div>
                创建人：
                <span>{{ drawerVal.creator }}</span>
              </div>
            </div>
          </div>
          <div class="content-list">
            <div class="content-list-title">
              <span class="list-icon"></span>
              <span class="list-name">前提</span>
            </div>
            <div class="list-show">
              <div>
                <span>{{ drawerVal.premise || "无" }}</span>
              </div>
            </div>
          </div>
          <div class="content-list">
            <div class="content-list-title">
              <span class="list-icon"></span>
              <span class="list-name">输入</span>
            </div>
            <div class="list-show">
              <div>
                <span>{{ drawerVal.input || "无" }}</span>
              </div>
            </div>
          </div>
          <div class="content-list">
            <div class="content-list-title">
              <span class="list-icon"></span>
              <span class="list-name">输出</span>
            </div>
            <div class="list-show">
              <div>
                <span>{{ drawerVal.output || "无" }}</span>
              </div>
            </div>
          </div>
          <div class="content-list">
            <div class="content-list-title">
              <span class="list-icon"></span>
              <span class="list-name">备注</span>
            </div>
            <div class="list-show">
              <div>
                <span>{{ drawerVal.remark || "无" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-btn">
        <el-dropdown style="margin-right: 10px" size="small" @command="(id: string) => handleCommand(id, drawerVal)">
          <el-button>
            结 果
            <i class="el-icon-arrow-up el-icon--right"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="item.value" v-for="(item, index) in tableResoult" :key="index">
                <em
                  :style="{
                    width: '10px',
                    height: '10px',
                    marginRight: '8px',
                    display: 'inline-block',
                    borderRadius: '5px',
                    background: item.color
                  }"
                ></em>
                <span :style="{ color: item.color }">{{ item.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- <el-button type="primary" @click="handleCommand('1', drawerVal)">通 过</el-button> -->
        <el-button @click="handleUpdateList(drawerVal)">编 辑</el-button>
        <el-button @click="handleRemarkList(drawerVal)">备 注</el-button>
        <el-button @click="handleDeleteList(drawerVal.id)" style="color: #f56c6c; border-color: #f56c6c">删 除</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, watch, computed } from "vue";
import { PRIORITY, STATUS, RESOULT } from "./contantOptions";
import { Pagation } from "@/composables/usePagation";
import { getSession, setSession, hideText, setObjStringify } from "@/utils";
import useRequest from "@/composables/useRequest";
import useRenderTable from "@/composables/useRenderTable";
import useFetchSearch from "./composables/useFetchSearch";
import { getUseCaseStaff, updateUseCaseStatus, deleteUseCaseStatus, updateUseCaseRemark } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import useMessageTip from "@/composables/useMessageTip";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { store } from "@/store";

export default defineComponent({
  name: "useCase",
  setup() {
    const router = useRouter();
    const { tipMessage } = useMessageTip();
    const dialogFormData = reactive<any>({
      remark: null,
      id: null
    });
    const employeeLists: any = ref([]);
    const tableData = reactive({
      list: [],
      total: 0,
      bugType: {
        passed_num: 0,
        zero_type_num: 0
      }
    });
    const page = ref(1);
    // 判断是否进行筛选
    const flag = ref<boolean>(false);
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 迭代id保存
    const iterateId = computed(() => store.getters.iterateId);
    // 抽屉
    const drawerUseCase = ref(false);
    watch(
      () => drawerUseCase.value,
      (newValue) => {
        if (!newValue) {
          var dom = document.getElementsByClassName("current-row")[0];
          let children: any = dom?.childNodes;
          if (children) {
            for (let i = 0; i < children.length; i++) {
              children[i].style.backgroundColor = "#fff";
            }
          }
        }
      }
    );
    // 抽屉信息
    const drawerVal: Record<string, any> = ref({
      create_by: "",
      creator: "",
      id: -1,
      input: "",
      level: -1,
      name: "",
      output: "",
      premise: "",
      remark: "",
      status: -1,
      type: -1
    });

    const formParams = reactive<Record<string, any>>({
      create_by: "",
      type: [] as Array<number>,
      name: null,
      status: [] as Array<number>,
      level: [] as Array<number>,
      product_id: (getSession("productInfo", true) as Record<string, any>)?.id
    });

    // 表格多选
    const selectMore: any = ref([]);

    // 创建人下拉点击
    const setFiled = (staff: string) => {
      flag.value = true;

      formParams.create_by = staff;
      if (!staff) {
        formParams.create_by = "";
      }
      handleConditionSearch();
    };

    const tableHeight = () => {
      setTimeout(() => {
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 140;
      }, 100);
    };

    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      if (!iterateId.value) {
        tableData.total = 0;
        tableData.list = [];
        tableData.bugType.passed_num = 0;
        tableData.bugType.zero_type_num = 0;
        return;
      }
      const paramsObj = JSON.parse(JSON.stringify(params || Object.assign(formParams, { iteration_id: iterateId.value })));
      Reflect.deleteProperty(paramsObj, "tempStaff");
      const { response } = useRequest(useFetchSearch, paramsObj);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count, passed_num, zero_type_num }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
      tableData.bugType.passed_num = passed_num;
      tableData.bugType.zero_type_num = zero_type_num;
      tableHeight();
    };
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (flag.value) {
          pageTableRef.value.setCurrentPage();
          page.value = 1;
          await getData({ pageIndex: 1, pageSize: 20 }, true, Object.assign(formParams, { iteration_id: iterateId.value }));
          flag.value = false;
        } else {
          await getData(pageTableRef.value.getCurrentPage(), true, Object.assign(formParams, { iteration_id: iterateId.value }));
        }
        stopAutoGetData.value = false;
        drawerUseCase.value = false;
        getUseCase();
      }, 300);
    };
    // 等级赛选
    const getLevel = (type: number, color?: number) => {
      if (color) return PRIORITY.find((t) => t.id === type)?.color;
      return PRIORITY.find((t) => t.id === type)?.value;
    };
    watch(
      () => iterateId.value,
      () => {
        if (!formParams.product_id) return false;
        handleConditionSearch();
      }
    );
    // // 获取当前 创建人 下拉列表数据
    const getUseCase = () => {
      if (!iterateId.value) return;
      getUseCaseStaff({ iteration_id: iterateId.value }).then((res: any) => {
        employeeLists.value = res.data;
      });
    };
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      if (formParams.product_id != newValue) formParams.product_id = null;
      formParams.product_id = newValue as number;
      flag.value = true;

      handleConditionSearch();
    });
    // 类型
    const handleType = (val: number[]) => {
      flag.value = true;
      if (!val.length) {
        formParams.type = [];
      }
      handleConditionSearch();
    };
    // 等级
    const handleLevel = (val: number[]) => {
      flag.value = true;
      if (!val.length) {
        formParams.level = [];
      }
      handleConditionSearch();
    };
    // 结果
    const handleStatus = (val: number[]) => {
      flag.value = true;

      if (!val.length) {
        formParams.status = [];
      }
      handleConditionSearch();
    };
    const handleInput = () => {
      flag.value = true;
    };
    // 表格-行点击
    const handleRow = (val: Record<string, any>) => {
      drawerUseCase.value = true;
      drawerVal.value = val;
    };

    // 更新备注
    const handleRemarkList = (row: Record<string, any>) => {
      drawerUseCase.value = false;

      const { id, remark } = row;
      dialogFormData.remark = remark;
      dialogFormData.id = id;
      isOpenEditRemark.value = true;
    };
    // 更新状态
    const handleUpdateStatus = () => {
      updateUseCaseRemark<ResponseParams.ResponseDataSuccess>(dialogFormData).then((res: any) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        isOpenEditRemark.value = false;
      });
    };
    let isOpenEditRemark = ref(false);
    // 编辑--批量编辑
    const handleUpdateList = (row: Record<string, any> | number) => {
      drawerUseCase.value = false;
      if (row) {
        setSession("editUseCase", JSON.stringify(row));
      } else {
        if (selectMore.value && selectMore.value.length) {
          setSession("editUseCase", JSON.stringify(selectMore.value));
        } else {
          return tipMessage(400, "请选择要批量操作的列表");
        }
      }
      router.push({
        name: "useCaseAdd",
        query: Object.assign(
          {
            isEdit: 1
          },
          { ...router.currentRoute.value.query }
        )
      });
    };

    // 导出
    const exportTaskDate = async () => {
      const params = JSON.parse(JSON.stringify(formParams));
      if (!params.type) delete params.type;
      if (!tableData.total) return tipMessage(400, "暂无数据，无法导出");
      setObjStringify(params, "/api/tomato/test-case/export");
    };

    // 更新结果
    const updataStatus = (params: any) => {
      updateUseCaseStatus<ResponseParams.ResponseDataSuccess>(params).then((res: any) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        isOpenEditRemark.value = false;
      });
    };
    // 结果 -- 批量结果
    const handleCommand = (command: string, val?: any): any => {
      drawerUseCase.value = false;

      let params: any = {
        status: Number(command)
      };
      if (val) {
        params = {
          ids: [val.id],
          status: Number(command)
        };
      } else {
        params.ids = [];
        if (selectMore.value && selectMore.value.length) {
          selectMore.value.forEach((item: Record<string, any>) => {
            params.ids.push(item.id);
          });
        } else {
          return tipMessage(400, "请选择列表");
        }
      }
      updataStatus(params);
    };

    // 删除--批量删除
    const handleDeleteList = (val: number) => {
      drawerUseCase.value = false;

      let params: any = {
        ids: []
      };
      if (val) {
        params.ids = [val];
      } else {
        params.ids = [];
        if (selectMore.value && selectMore.value.length) {
          selectMore.value.forEach((item: Record<string, any>) => {
            params.ids.push(item.id);
          });
        } else {
          return tipMessage(400, "请选择要操作的列表");
        }
      }
      ElMessageBox.confirm("此操作将永久删除该用例，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger-box",
        type: "error"
      }).then(() => {
        deleteUseCaseStatus<ResponseParams.ResponseDataSuccess>(params).then((res) => {
          tipMessage(res.code);
          getData(pageTableRef.value.getCurrentPage());
        });
      });
    };

    const tableResoult = JSON.parse(JSON.stringify(RESOULT));
    // tableResoult.shift();

    const handleTypeList = (isType: number, params: number[] | string[]) => {
      if (isType) {
        formParams.level = params;
      } else {
        formParams.status = params;
      }
      handleConditionSearch();
    };

    const handleSelectionChange = (val: any) => {
      selectMore.value = val;
    };

    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      formParams.sort_name = prop;
      formParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, formParams);
    };

    return {
      sortChange,
      handleUpdateList,
      employeeLists,
      setFiled,
      pageTableRef,
      stopAutoGetData,
      handleConditionSearch,
      ...toRefs(tableData),
      getLevel,
      getData,
      handleUpdateStatus,
      dialogFormData,
      isOpenEditRemark,
      handleRemarkList,
      formParams,
      handleType,
      handleStatus,
      page,
      handleInput,

      PRIORITY,
      STATUS,
      RESOULT,
      tableResoult,
      handleCommand,
      selectMore,
      handleLevel,

      handleTypeList,
      handleDeleteList,
      handleSelectionChange,
      hideText,

      drawerUseCase,
      handleRow,
      drawerVal,
      exportTaskDate
    };
  }
});
</script>

<style scoped lang="less">
.progress-padding {
  padding-left: 10px;
}
.use-add {
  float: right;
  margin-right: 10px;
}
.rotate-icon {
  transform: rotate(90deg);
  margin-right: 5px;
  color: #3370ff;
}
.rp-Table__common {
  font-size: 14px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}
.all-option {
  float: right;
  margin-right: 8px;
}
:deep(.el-dropdown-link) {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
  .el-icon {
    display: inline-block;
  }
}
:deep(.rp-select) {
  .el-input {
    width: 140px;
  }
  .el-select__tags {
    max-width: 120px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
  }
}
.rp-Table__bug {
  .rp-Table__common;
  color: #3370ff;
}
.rp-Table__bugSelf {
  .rp-Table__common;
  color: #ff0000;
}
.no-click {
  pointer-events: none;
  cursor: default;
  color: #c0c4cc;
}
.rp-assign {
  :deep(.el-form-item__content) {
    display: flex !important;
  }
}
:deep(.row-scroll) {
  max-height: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.rp-use-case-opation {
  z-index: 999;
  position: absolute;
  left: 80px;
  margin-top: -70px;
}
.rp-test-list-num {
  float: left;
  span.rp-test-num {
    display: inline-block;
    padding: 0px 6px;
    font-size: 13px;
    margin: 0 6px;
    background: #c4efe6;
    color: #606266;
    border-radius: 4px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
      color: #3f3f40;
    }
  }
  :deep(.el-pagination__total) {
    display: inline-block;
    background: #f4f4f5;
    padding: 2px 6px;
    line-height: 20px;
    height: 20px;
    margin-top: 4px;
    border-radius: 4px;
    -webkit-box-sizing: none;
  }
}
.rp-drawer-use {
  padding: 0 20px 20px 20px;
  overflow: scroll;
  height: calc(100% - 100px);
  // margin-top: 50px;
  .rp-drawer-title {
    display: flex;
    align-items: center;
    .el-button {
      min-height: 22px;
      height: 22px;
      line-height: 22px;
      padding: 0 14px;
      margin-right: 10px;
    }
    h1 {
      color: #615e5e;
      font-size: 18px;
    }
  }
  .rp-drawer-content {
    .content-list {
      .content-list-title {
        display: flex;
        align-items: center;
        margin: 10px 0;
        color: #615e5e;
        span.list-icon {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: #1f9f85;
          margin-right: 10px;
        }
        span.list-name {
          font-weight: 700;
        }
      }
      .list-show {
        padding-left: 18px;
        margin-top: 10px;
        div {
          font-size: 14px;
          margin: 5px 0;
          color: #606266;
          span {
            white-space: pre-wrap;
          }
        }
      }
    }
  }
}
.drawer-btn {
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0px;
  right: 0;
  padding: 10px;
  width: 30%;
  background: #fff;
  box-shadow: 0px -2px 12px #eee;
  .el-button {
    width: 90px;
  }
}

:deep(.el-drawer__body) {
  height: 100%;
}

:deep(.page) {
  padding-top: 20px;
}
:deep(.case-drawer) {
  position: fixed;
  inset: 0px;
  width: 70%;
  left: 30% !important;
  top: 50px;
  .el-drawer__header {
    margin: 0;
    padding-top: 0;
    min-height: 40px;
    border-bottom: 1px solid #ccc;
    .drawer-title {
      color: #615e5e;
      font-size: 14px;
      font-weight: 700;
    }
  }
}
</style>
<style lang="less"></style>
💈
