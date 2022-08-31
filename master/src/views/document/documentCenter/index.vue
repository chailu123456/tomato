<template>
  <div class="rp-document-center">
    <div :class="[active ? 'document-center-left-hide' : 'document-center-left']">
      <div class="menu-title">
        <div class="ment-title-left">文档分类</div>
        <div class="ment-title-right-icon">
          <i @click="handleAdd" tip="新增分类" class="iconfont icon-jiahao"></i>
          <i @click="handleClassify" tip="分类排序" class="iconfont icon-zhiyou-fenzupaixu"></i>
          <i
            @click="handleHide"
            :tip="isHideMenuZero ? '隐藏空分类' : '显示空分类'"
            :class="[!isHideMenuZero ? 'icon-yanjing_close' : 'icon-yanjing_open', 'iconfont']"
          ></i>
          <i @click="handlePut" tip="收起" class="iconfont icon-zuoceshouqiyoucezhankai"></i>
        </div>
      </div>
      <div class="menu-list">
        <el-tree
          :data="menuData"
          :highlight-current="true"
          :expand-on-click-node="false"
          ref="menuRef"
          node-key="id"
          :indent="6"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentNodekey"
          :props="{ children: 'children', label: 'label' }"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
        >
          <template #default="{ node, data }">
            <span class="menu-tree-node">
              <i v-if="data.level != 1" style="font-size: 14px; margin-right: 10px; margin-top: 2px" class="iconfont icon-document"></i>
              <span style="font-size: 14px" class="node-name" :class="{ 'current-node-name': data.id === currentNodekey }"
                >{{ node.label }} <i class="num" :style="{ color: data.id === currentNodekey ? '#1d9f85' : '' }"> ({{ data.wiki_count }})</i></span
              >
              <el-popover :width="100" placement="right" trigger="click" v-if="permission">
                <template #reference>
                  <el-icon class="menu-more-option" :style="{ display: menuNameArr.includes(data.node_type) ? 'none' : '' }">
                    <MoreFilled />
                  </el-icon>
                </template>
                <ul class="more-list-option">
                  <li @click="hanleSetName(data)">
                    <i class="iconfont icon-bianji"></i>
                    <em>重命名</em>
                  </li>
                  <li @click="handleAddClassify(data)" v-if="data.level < 6">
                    <i class="iconfont icon-jiahao"></i>
                    <em>新增子分类</em>
                  </li>
                  <li @click="handleDeleteClassify(data)" v-if="permission">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <em>删除</em>
                  </li>
                </ul>
              </el-popover>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
    <div :class="[active ? 'document-center-right-hide' : 'document-center-right', 'document-center-right-normal']">
      <div class="document-right-header">
        <i @click="handleOpen()" tip="展开" v-if="active" class="iconfont icon-youceshouqizuocezhankai"></i>
        <em class="header-line" v-if="active"></em>
        <div class="header-tree-list" v-for="(item, index) in classifyHeader" :key="index">
          <span>
            <em @click="handleData(item)">{{ item.name }}</em>

            <i class="iconfont icon-youjiantou" :style="{ display: index === classifyHeader.length - 1 ? 'none' : 'inline-block' }"></i>
            <span>{{ index === classifyHeader.length - 1 ? " (" + articNum + ")" : "" }}</span>
          </span>
        </div>
      </div>
      <TableComponent :defauldMenuId="defauldMenuId" @treeList="getTreeDate('remove')" @articalNum="articalNum"></TableComponent>
    </div>
    <el-dialog :title="dialogTitle" v-model="dialogFormVisible" width="40%">
      <el-form @submit.prevent :model="formEditName" v-if="dialogTitleArr.indexOf(dialogTitle) != 3">
        <div v-if="dialogTitleArr.indexOf(dialogTitle) === 2" style="margin-bottom: 10px">
          <div style="margin-bottom: 6px">所属父分类</div>
          <span style="color: #989898; font-size: 12px" v-for="(item, index) in classifyDialogHeader" :key="index">
            <i v-if="index" class="iconfont icon-youjiantou" :style="{ display: index === classifyDialogHeader.length ? 'none' : 'inline-block' }"></i>
            <em>{{ index === classifyDialogHeader.length ? "" : item.name }}</em>
          </span>
        </div>

        <el-form-item :model="formEditName" @submit.prevent :rules="{ required: true, message: '请输入分类名称', trigger: 'blur' }" label="">
          <div>分类名称 ({{ formEditName.name.length }}/32)</div>
          <el-input prop="name" v-model.trim="formEditName.name" placeholder="请输入" maxlength="32" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div style="line-height: 26px" v-else>
        分类 「 {{ dialogDeleteTip.label }} 」会被删除。当前分类及其子分类下的文档会被移动到「 {{ dialogDeleteTip.parent_label }} 」。此操作不可撤销，是否确定？
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button :type="dialogTitleArr.indexOf(dialogTitle) != 3 ? 'primary' : 'danger'" @click="handleConfirm(dialogTitleArr.indexOf(dialogTitle))"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <DargTree v-model:visible="dialogSort" v-if="dialogSort" @updateTree="getTreeDate('dragTree')" :sortTreeDate="sortTreeDate"></DargTree>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, nextTick, watch } from "vue";
import type { ResponseParams } from "@/types/response";
import TableComponent from "../components/tableComponent.vue";
import { getClassifyTree, updateClassifyName, addClassify, deleteClassify, getCrumbs } from "@/api/request-modules/document";
import type { Tree, ClassifyHeader } from "@/types/interface";
import DargTree from "../components/dragTree.vue";
import useMessageTip from "@/composables/useMessageTip";
import { setSession, getSession } from "@/utils";
import { MoreFilled, Delete } from "@element-plus/icons";

const { tipMessage } = useMessageTip();
// 控制菜单栏是否显示隐藏
const active = ref(false);
// 重命名、新建分类、新建子分类弹框是否显示
const dialogFormVisible = ref(false);
// 分类弹框是否显示
const dialogSort = ref(false);
// 分类弹框数据
const sortTreeDate: Tree[] = reactive([]);
const menuRef = ref();
// menuNameArr控制是否hover上去显示...操作工作 node_type=0或2则不需要显示
const menuNameArr = ref([0, 2]);
// 新建分类、重命名、新建子分类弹框标题数组
const dialogTitleArr = ref(["新建分类", "重命名", "新建子分类", "删除分类"]);
// 新建分类、重命名、新建子分类弹框标题名称
const dialogTitle = ref(dialogTitleArr.value[0]);
// 文档列表默认展开级数
const defaultExpandedKeys = ref<number[]>([]);
// 菜单列表默认选中id
const currentNodekey = ref(0);
// 默认所有分类数据 id
const defauldMenuId = ref({ name: "所有分类", id: 94 });
// 右侧表格文章列表总数
const articNum = ref(0);
// 子组件掉用父组件 通过子组件传递总数
const articalNum = (val: number) => {
  articNum.value = val;
};
// 判断分类是否排序过
const hasDrag = ref(false);
// 是否有权限修改(重命名、删除，新建子分类)
const permission = ref(false);
// 点击当前的文类目录某一项
const currentLabel = reactive<{ id: number; label: string; wiki_count?: number }>({
  id: 0,
  label: ""
});
// 点击当前的文类目录某一项
const dialogDeleteTip = reactive<{ label: string; parent_label: string }>({
  label: "",
  parent_label: ""
});
// hover当前的文类目录某一项 这块的作用是hover上去保存数据，删除hover的数据后重新获取该父级
const currentHoverLabel = reactive<{ id: number; label: string }>({
  id: 0,
  label: ""
});
// 右侧表格面包屑
const classifyHeader = ref<ClassifyHeader[]>([{ name: "所有分类", id: 94 }]);
// 新增子分类弹框父级
const classifyDialogHeader = ref<ClassifyHeader[]>([{ name: "所有分类", id: 94 }]);
// 左侧表格分类
const menuData: Tree[] | undefined = reactive([]);
// 左侧表格分类-未筛选数据
const menuOriginData: Tree[] = reactive([]);
// 左侧表格分类-筛选去除文档数码为0的
const menuFilterData: Tree[] = reactive([]);
// 弹框重命名、新建分类、新建子分类信息
const formEditName = reactive({
  id: 0,
  name: "",
  parent_id: 0
});
// 默认文档数目为0的隐藏
const isHideMenuZero = ref(false);

// 存储所有树节点
// let nodeIds: number[] = [];

// 判断缓存是否有之前访问的文档id
const docCenterkey = getSession("docCenterkey", true) as any;
// 如果是从工作台跳转过来的则默认显示所有分类，搜索条件为规范，即展示文章标题带有规范的数据
if (window.location.href.includes("guifan")) {
  setTimeout(() => {
    // 给tree赋值
    menuRef?.value.setCurrentKey(menuData[0].id);
    handleNodeClick({ id: menuData[0].id, label: menuData[0].label });
  }, 100);
} else {
  if (docCenterkey?.id) {
    setTimeout(() => {
      currentNodekey.value = docCenterkey.id;
      // 给tree赋值
      menuRef?.value.setCurrentKey(docCenterkey.id);
      handleNodeClick(docCenterkey);
    }, 1000);
  } else {
    setTimeout(() => {
      currentNodekey.value = menuData[0].id;

      // 给tree赋值
      menuRef?.value.setCurrentKey(menuData[0].id);
    }, 1000);
  }
}

// 点击分类节点获取面包屑、表格数据
const handleNodeClick = (data: Record<string, any>) => {
  // console.log("节点点击", data);
  currentNodekey.value = data.id;
  currentLabel.id = data.id;
  currentLabel.label = data.label;
  currentLabel.wiki_count = data.wiki_count;

  // 将每次点击保存下来，下次进入回到之前的文档id
  setSession("docCenterkey", JSON.stringify(currentLabel));
  defauldMenuId.value = { name: data.label, id: data.id };
  getCrumbsData(data);
};
// 获取右侧标题面包屑
const getCrumbsData = (params: Record<string, any>, type?: boolean) => {
  getCrumbs<ResponseParams.ResponseDataSuccess>({ id: params.id }).then((res) => {
    if (res.code === 200) {
      if (type) {
        classifyDialogHeader.value = res.data || [];
      } else {
        classifyHeader.value = res.data || [];
        classifyDialogHeader.value = res.data || [];
      }
    } else {
      classifyHeader.value = [];
      classifyDialogHeader.value = res.data || [];
    }
  });
};
// 重命名
const hanleSetName = (item: Tree) => {
  dialogTitle.value = dialogTitleArr.value[1];
  formEditName.id = item.id;
  formEditName.name = item.label;
  dialogFormVisible.value = true;
};

const optionRequest = [
  { id: 0, request: addClassify },
  { id: 1, request: updateClassifyName },
  { id: 2, request: addClassify },
  { id: 3, request: deleteClassify }
];
// index=1弹框重命名、新建分类、新建子分类信息 确定提交idx=3删除
const handleConfirm = (idx: number) => {
  optionRequest.forEach((item) => {
    if (item.id === idx) {
      item.request<ResponseParams.ResponseDataSuccess>(formEditName).then((res) => {
        if (res.code === 200) {
          dialogFormVisible.value = false;
          getTreeDate();
          if (idx < 3) {
            handleNodeClick({ id: res.data.id, label: res.data.name });
            setTimeout(() => {
              menuRef?.value.setCurrentKey(res.data.id);
            }, 1000);
          }
          if (idx === 3) {
            handleNodeClick(currentHoverLabel);
            setTimeout(() => {
              menuRef?.value.setCurrentKey(currentHoverLabel.id);
            }, 1000);
          }
        }
      });
    }
  });
  if (idx !== 1) isHideMenuZero.value = true;
};

// 进行过滤为文件夹中文档为0的菜单
const filterNode = (value: string, data: Record<string, any>) => {
  if (isHideMenuZero.value) return data.wiki_count > 0 && data.level < 2;
  return data;
};
// 隐藏文档为0的文件夹
const handleHide = () => {
  // console.log(nodeIds);
  isHideMenuZero.value = !isHideMenuZero.value;
  menuData[0] = !isHideMenuZero.value ? menuFilterData[0] : menuOriginData[0];
  // nodeIds.forEach((item) => {
  //   menuRef?.value.defaultExpandedKeys.push(item);
  // });
  setTimeout(() => {
    const docCenterkey = getSession("docCenterkey", true) as any;
    menuRef?.value.setCurrentKey(docCenterkey.id);
  }, 500);
};
// 新增子分类
const handleAddClassify = async (item: Record<string, any>) => {
  dialogTitle.value = dialogTitleArr.value[2];
  // 获取弹框分类父级关系
  await getCrumbsData(item, true);
  formEditName.parent_id = item.id;
  formEditName.name = "";
  dialogFormVisible.value = true;
};
// 删除文档目录
const handleDeleteClassify = (item: Tree) => {
  currentHoverLabel.id = item.parent_id;
  dialogDeleteTip.label = item.label;
  dialogDeleteTip.parent_label = item.parent_label;
  dialogTitle.value = dialogTitleArr.value[3];
  formEditName.id = item.id;
  formEditName.name = "";
  dialogFormVisible.value = true;
};

// 菜单收起
const handlePut = () => {
  active.value = true;
};
// 菜单展开
const handleOpen = () => {
  active.value = false;
};

// 右侧标题点击事件
const handleData = (item: Record<string, any>) => {
  currentNodekey.value = item.id;
  nextTick(() => {
    defauldMenuId.value = { name: item.name, id: item.id };
    menuRef?.value.setCurrentKey({ name: item.name, id: item.id });
    handleNodeClick({ label: item.name, id: item.id });
  });
};

// 新增一级分类
const handleAdd = () => {
  if (!permission.value) return tipMessage(400, `仅管理员可操作分类，请联系各项目负责人或文档管理员`);
  dialogTitle.value = dialogTitleArr.value[0];
  formEditName.parent_id = menuData[0].id;
  formEditName.id = 0;
  formEditName.name = "";
  dialogFormVisible.value = true;
};
// 调整分类排序
const handleClassify = () => {
  if (!permission.value) return tipMessage(400, `仅管理员可操作分类，请联系各项目负责人或文档管理员`);
  dialogSort.value = true;
};

// 进行递归操作，将菜单中文章数量为0的过滤掉
const dataReverse = (people: Array<Tree>) => {
  let newArr = [];
  for (let i = 0; i < people.length; i += 1) {
    const { wiki_count, id, label, node_type, order, parent_id, parent_label, level, children } = people[i];
    let obj: Record<string, any> = {};
    if (wiki_count) {
      obj.id = id;
      obj.label = label;
      obj.node_type = node_type;
      obj.order = order;
      obj.parent_id = parent_id;
      obj.parent_label = parent_label;
      obj.wiki_count = wiki_count;
      obj.level = level;

      if (children && Array.isArray(children) && children.length) {
        obj.children = dataReverse(children);
      }
      newArr.push(obj);
    }
  }
  return newArr;
};

// 进行递归操作，获取所有id。作用是展示全部分类包括为网点数量为0的分类
// const dataReverseAllId = (people: Array<Tree>) => {
//   for (let i = 0; i < people.length; i += 1) {
//     const { children, id, level } = people[i];
//     nodeIds.push(id);
//     if (level === 0) {
//       console.log(children);
//       if (children && children.length) {
//         dataReverseAllId(children);
//       }
//     }
//   }
// };

watch(
  () => dialogSort.value,
  () => {
    if (!dialogSort.value) {
      // 如果对列表进行了排序则刷新，如果只是打开弹出后关闭无如何操作不进行数据渲染
      if (hasDrag.value) {
        // isHideMenuZero.value = true;
        menuData[0] = isHideMenuZero.value ? menuOriginData[0] : menuFilterData[0];
        // menuData[0] = menuOriginData[0];
        // nodeIds.forEach((item) => {
        //   menuRef?.value.defaultExpandedKeys.push(item);
        // });
        const docCenterkey = getSession("docCenterkey", true) as any;
        if (docCenterkey?.id) {
          currentNodekey.value = docCenterkey.id;
          handleNodeClick(docCenterkey);
          setTimeout(() => {
            // 给tree赋值
            menuRef?.value.setCurrentKey(docCenterkey.id);
          }, 1000);
        } else {
          handleNodeClick({ id: menuData[0].id, label: menuData[0].label });
          setTimeout(() => {
            // 给tree赋值
            menuRef?.value.setCurrentKey(menuData[0].id);
          }, 100);
        }
      }
    }
  }
);
// 获取文档菜单
const getTreeDate = (type?: string) => {
  getClassifyTree<ResponseParams.ResponseDataSuccess>().then((res) => {
    if (res.code === 200) {
      // nodeIds = [];
      const treeData = res.data.tree;
      menuOriginData[0] = JSON.parse(JSON.stringify(treeData));
      permission.value = res.data.permission;
      // 弹框排序去除未分类 未分类不可排序
      const newTree = JSON.parse(JSON.stringify(treeData));
      newTree.children.pop();
      sortTreeDate[0] = newTree;
      const { id, label, level, node_type, order, parent_id, children, wiki_count } = treeData;
      const newMenuData: any = {
        id: id,
        label: label,
        level: level,
        node_type: node_type,
        order: order,
        parent_id: parent_id,
        wiki_count: wiki_count,
        children: dataReverse(children)
      };
      // dataReverseAllId(children);
      menuFilterData[0] = newMenuData;

      if (type === "dragTree") {
        hasDrag.value = true;
      } else {
        menuData[0] = isHideMenuZero.value ? menuOriginData[0] : newMenuData;
        menuRef?.value.defaultExpandedKeys.push(menuData[0].id);
        if (type === "remove") {
          if (docCenterkey?.id) {
            setTimeout(() => {
              // 给tree赋值
              menuRef?.value.setCurrentKey(docCenterkey.id);
            }, 100);
          } else {
            setTimeout(() => {
              // 给tree赋值
              menuRef?.value.setCurrentKey(menuData[0].id);
            }, 100);
          }
        }
      }
    }
  });
};
getTreeDate();
</script>
<style lang="less">
.rp-document-center {
  height: 100% !important;
  // padding: 10px !important;
  overflow: hidden;
  display: flex;

  .document-center-left {
    display: inline-block;
    width: 300px;
    height: 100%;
    background: #fff;
    margin-right: 10px;
    border-radius: 4px;
    // padding: 10px;
    transition: all 100ms;
    overflow: hidden;
    opacity: 1;
    .menu-title {
      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      padding: 10px;
      padding-bottom: 0;
      height: 40px;
      line-height: 40px;
      overflow: hidden;
      .ment-title-left {
        font-size: 14px;
      }
      .ment-title-right-icon {
        display: flex;
        align-items: center;
        position: relative;
        .iconfont {
          font-size: 14px;
          margin: 0 6px;
          cursor: pointer;

          &:hover::after {
            cursor: pointer;
            position: absolute;
            margin-left: -30px;
            top: -10px;
            color: #615e5e;
            content: attr(tip);
            z-index: 8;
            font-size: 12px;
            line-height: 20px;
          }
        }
        .icon-zuoceshouqiyoucezhankai:hover:after {
          margin-left: -20px;
        }
        .icon-yanjingguanbi {
          font-size: 20px;
        }
        .icon-jiahao {
          // font-size: 18px;
        }
      }
    }
    .menu-list {
      height: calc(100% - 90px);
      overflow-y: scroll;
      padding: 10px;
      padding-top: 0px;

      .el-tree {
        height: 100%;
        background: #fff !important;
        // .is-current {
        //   .el-tree-node__content {
        //     color: #1d9f85;
        //     i.num {
        //       color: #1d9f85;
        //     }
        //   }
        // }
        .el-tree-node__content {
          height: 30px;
        }

        .el-tree-node__content:hover {
          color: #1d9f85;
          i.num {
            color: #1d9f85;
          }
        }
        .el-tree-node:focus > .el-tree-node__content {
          color: #1d9f85;
          i.num {
            color: #1d9f85;
          }
        }
        .current-node-name {
          color: #1d9f85;
          &:hover {
            color: #1d9f85;
          }
          i.num:hover {
            color: #1d9f85;
          }
        }
      }
      .el-tree--highlight-current > .el-tree-node {
        > .el-tree-node__content > .el-tree-node__expand-icon {
          display: none;
        }
      }
      .menu-tree-node {
        display: flex;
        align-content: center;
        width: calc(100% - 26px);
        font-size: 14px;
        .node-name {
          display: inline-block;
          width: 74%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          i.num {
            color: #999;
          }
        }
        i.menu-more-option {
          display: none;
        }
      }
      .el-tree-node__content:hover {
        .menu-more-option {
          display: block;
          position: absolute;
          right: 8px;
          margin-top: 3px;
        }
      }
    }
    ::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }
  }

  .document-center-left-hide {
    width: 0;
    height: 100%;
    transition: all 100ms;
    opacity: 0;
    .menu-list {
      padding: 10px;
      .menu-tree-node {
        display: flex;
        align-content: center;
        width: calc(100% - 26px);
        font-size: 14px;
        .node-name {
          display: inline-block;
          width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        i.menu-more-option {
          display: none;
        }
      }
    }
    .menu-title {
      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      padding: 10px;
      padding-bottom: 0;
      height: 40px;
      line-height: 40px;
      overflow: hidden;
      .ment-title-left {
        font-size: 14px;
      }
      .ment-title-right-icon {
        .iconfont {
          margin: 0 6px;
          &:hover {
            cursor: pointer;
          }
        }
        .icon-yanjingguanbi {
          font-size: 20px;
        }
        .icon-jiahao {
          font-size: 18px;
        }
      }
    }
    i.menu-more-option {
      display: none;
    }
    .ment-title-left {
      font-size: 14px;
    }
  }
  .document-center-right {
    width: calc(100% - 310px);
    transition: all 100ms;
  }
  .document-center-right-hide {
    width: 100%;
    transition: all 100ms;
  }
  .document-center-right-normal {
    height: calc(100% - 20px);
    background: #fff;
    border-radius: 4px;
    transition: all 100ms;
    z-index: 10;
    padding: 10px;
    .document-right-header {
      // display: flex;
      height: 40px;
      line-height: 40px;
      position: relative;
      width: calc(100% - 370px);
      overflow-x: scroll;
      overflow-y: hidden;
      white-space: nowrap;
      .header-tree-list {
        display: inline-block;
      }
      .icon-youceshouqizuocezhankai {
        margin: 0 6px;
        cursor: pointer;

        &:hover::after {
          cursor: pointer;
          position: absolute;
          margin-left: -18px;
          top: -4px;
          color: #615e5e;
          content: attr(tip);
          z-index: 8;
          font-size: 12px;
          line-height: 20px;
        }
      }
      .header-line {
        display: inline-block;
        width: 1px;
        height: 12px;
        background: #ccc;
        margin: 15px 16px 0 16px;
      }
      span {
        font-size: 14px;
        // margin: 0 4px;
        em {
          &:hover {
            cursor: pointer;
            color: @rp-color-background;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
.document-classify-content {
  height: 500px;
  overflow: scroll;
}

.more-list-option {
  min-width: 100px !important;
  li {
    line-height: 34px;
    &:hover {
      cursor: pointer;
      color: @rp-color-background;
    }
    i {
      margin-right: 6px;
    }
  }
}
</style>
