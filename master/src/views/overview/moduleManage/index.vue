<template>
  <div class="rp-setting-module">
    <el-row :gutter="20">
      <el-col :span="10">
        <div class="grid-content bg-purple" style="margin-top: 20px">
          <el-tree
            :data="treeData"
            :props="defaultProps"
            default-expand-all
            node-key="id"
            @dblclick="handleEdit"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <input
                  @click.stop="handleInput"
                  @keyup.enter="(ev) => handleConfirm(ev, node, data)"
                  :value="node.label"
                  v-if="data.isEdit"
                  placeholder="请输入内容"
                />
                <span @dblclick.stop="handleEdit(data)" v-else>{{ node.label }}</span>
                <span class="module-option-btn" v-if="!data.isEdit && data.isBtn">
                  <a @click.stop="handleAppend(node, data)" v-debounce v-if="data.level < 3 || data.level === 0">新增子集</a>
                  <a @click.stop="handleEdit(data)" v-if="data.level != 0">编辑</a>
                  <a @click.stop="handleRemove(node, data)" class="delete" v-if="data.level">删除</a>
                </span>
                <span class="module-option" v-if="!data.isBtn">
                  <a @click.stop="handleAppend(node, data)" v-debounce v-if="data.level < 3 || data.level === 0">新增子集</a>
                  <a @click.stop="handleEdit(data)" v-if="data.level != 0">编辑</a>
                  <a @click.stop="handleRemove(node, data)" class="delete" v-if="data.level">删除</a>
                </span>
                <span class="module-option-btn" v-if="data.isEdit">
                  <a v-debounce @click.stop="(ev) => handleConfirm(ev, node, data)">确定</a>
                  <a @click.stop="handleCancle()" class="delete">取消</a>
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="grid-content bg-purple" style="border-left: 1px solid #ccc">
          <div style="margin-left: 20px; margin-top: 20px">{{ originName }}已关联需求</div>
          <page-table
            :tableData="list"
            @handlePagationChange="getTableData"
            :currentPage="page"
            :total="total"
            ref="pageTableRef"
            :stopAutoGetData="stopAutoGetData"
          >
            <template #main>
              <el-table-column prop="name" label="标题"></el-table-column>
              <el-table-column prop="origin_path" width="300" label="来源">
                <template #default="scoped">
                  <span>{{ scoped.row.origin_path ? scoped.row.origin_path : scoped.row.origin }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scoped">
                  <span>{{ scoped.row.plan_id ? "已关联" : "未关联" }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="plan_name" label="计划">
                <template #default="scoped">
                  <span>{{ scoped.row.plan_name || "无" }}</span>
                </template>
              </el-table-column>
            </template>
          </page-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { getSettingModule, editSettingModule, deleteSettingModule, createSettingModule } from "@/api/request-modules/product";
import useMessageTip from "@/composables/useMessageTip";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import { ElMessageBox, ElMessage } from "element-plus";
import { replaceProductId } from "@/views/iteration/useMixin";
import { defineComponent, reactive, ref, toRefs } from "vue";

export default defineComponent({
  name: "moduleManage",
  setup() {
    const { productLists, productId } = replaceProductId();
    //#region 点击保存
    const { tipMessage } = useMessageTip();
    let id = 1000;
    const treeData: any = ref([]);
    const defaultProps = reactive({
      children: "children",
      label: "name"
    });
    const page = ref(1);
    const searchParams = reactive({
      product_id: productId.value,
      product_module_id: 0,
      page_index: 1,
      page_size: 20
    });
    const handleNodeClick = (data: Record<string, any>) => {
      data.isBtn = true;
      originName.value = data.name;
      // data.isEdit = true;
      searchParams.product_module_id = data.id;
      getTableData();
      treeData.value = dataReverse(treeData.value, data.id);
    };
    // 新增子集保存当前子集名字
    let addModule: Record<string, any> = {};
    // 新增
    const handleAppend = (node: any, data: Record<string, any>) => {
      const newChild: any = { id: id++, level: 4, name: `未命名${new Date().getTime()}`, children: [] };
      if (!data.children) {
        data.children = [];
      }
      addModule.name = newChild.name;
      data.children.push(newChild);
      treeData.value = [...treeData.value];
      createSettingModule({ parent_id: data.id, product_id: productId.value, name: newChild.name }).then(async (res: any) => {
        if (res.code === 200) {
          tipMessage(res.code, "成功");
          await getData(1);
        } else {
          tipMessage(res.code, res.message);
        }
      });
    };
    let originName = ref("主干");
    // 编辑
    const handleEdit = (data: Record<string, any>) => {
      if (!data.id) return;
      originName.value = data.name;
      data.isEdit = true;
      data.isBtn = true;
    };
    // 删除
    const handleRemove = (node: Record<string, any>, data: Record<string, any>) => {
      ElMessageBox.confirm("删除模块会同时删除其子模块，当前模块下需求和用例会自动关联到其父级，操作不可逆，是否确认？", "删除模块", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex((d: Record<string, any>) => d.id === data.id);
          children.splice(index, 1);
          treeData.value = [...treeData.value];
          deleteSettingModule({ id: data.id }).then((res: any) => {
            if (res.code === 200) {
              tipMessage(res.code, "成功");
              getTableData(undefined, undefined, undefined, 1);
            }
          });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除"
          });
        });
    };
    // 编辑-确定修改
    const handleConfirm = (e: Record<string, any>, node: Record<string, any>, data: Record<string, any>) => {
      // 修改节点
      const $input = e.target.parentNode.parentNode.querySelector("input") || e.target.parentElement.parentElement.querySelector("input");
      node.name = $input.value.replace(/^\s*|\s*$/g, "");
      if (!$input.value) return tipMessage(400, "模块名称不能为空");
      if ($input.value.match(/^\s+$/)) return tipMessage(400, "请输入模块名称");
      if (node.name === "主干") return tipMessage(400, "模块名称不能重复");
      if (originName.value === node.name) {
        handleCancle();
        return;
      }
      editSettingModule({ id: data.id, name: node.name }).then((res: any) => {
        if (res.code === 200) {
          tipMessage(res.code, "成功");
          getData();
        }
      });
    };
    // 取消
    const handleCancle = () => {
      getData();
    };
    // 右边表格数据
    const tableData = reactive({
      list: [],
      total: 0
    });
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 对数据进行转换
    const dataReverse = (people: Array<Record<string, any>>, id: number) => {
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].id;
        obj.name = people[i].name;

        obj.level = people[i].level;
        obj.parent_id = people[i].parent_id;
        obj.product_id = people[i].product_id;
        obj.isEdit = false;
        if (id === people[i].id) obj.isBtn = true;
        else obj.isBtn = false;

        if (obj.name === addModule.name) addModule = obj;

        if (people[i].children && people[i].children.length) obj.children = dataReverse(people[i].children, id);

        newArr.push(obj);
      }
      return newArr;
    };
    let timer: ReturnType<typeof setTimeout>;
    const getData = (n?: number | null) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        getSettingModule({ product_id: productId.value }).then(async (res: any) => {
          const data = [
            {
              id: 0,
              level: 0,
              parent_id: 0,
              product_id: 0,
              name: "主干",
              children: res.data
            }
          ];
          treeData.value = dataReverse(data, -1);
          if (n) {
            await handleEdit(addModule);
          }
        });
      }, 200);
    };
    useWatchChangeProduct(
      () => {
        /** */
      },
      async () => {
        if (!productLists.value.length) return;
        originName.value = "主干";
        await getData();
        searchParams.product_module_id = 0;
        searchParams.product_id = productId.value;
        await getTableData();
      }
    );
    getData();

    let timerData: ReturnType<typeof setTimeout>;
    // 分页以及获取数据
    const getTableData = (pagationParams?: Pagation, flag?: boolean, params?: any, id?: number) => {
      clearTimeout(timerData);
      timerData = setTimeout(async () => {
        if (id) searchParams.product_module_id = 0;
        searchParams.product_id = productId.value;
        stopAutoGetData.value = flag == undefined ? false : true;
        page.value = (pagationParams && pagationParams.pageIndex) || 1;
        const { response } = useRequest(useFetchSearch, params || searchParams);
        const { pagation } = useRenderTable(response);
        let {
          data: { list, count }
        } = await pagation(pagationParams);

        tableData.total = count;
        tableData.list = list;
      }, 300);
    };

    return {
      treeData,
      defaultProps,
      handleAppend,
      handleEdit,
      handleRemove,
      handleNodeClick,
      handleConfirm,
      stopAutoGetData,
      getData,
      getTableData,
      ...toRefs(tableData),
      pageTableRef,
      searchParams,
      originName,
      handleCancle,
      page
    };
  }
});
</script>

<style lang="less" scoped>
.rp-setting-module {
  background: #fff;
  :deep(.main) {
    overflow: hidden !important;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    span.module-option {
      display: none;
      a {
        color: rgb(31, 159, 133);
        margin: 0 6px;
      }
      a.delete {
        color: #f56c6c;
      }
    }
    .module-option-btn {
      a {
        color: rgb(31, 159, 133);
        margin: 0 6px;
      }
      a.delete {
        color: #f56c6c;
      }
    }
  }
  .el-tree-node__content:hover {
    .module-option {
      display: inline-block;
    }
  }
  .el-table {
    border: 1px solid #ebeef5;
  }
}
:deep(.page) {
  left: 50% !important;
  width: 50% !important;
}
</style>
