<template>
  <el-dialog custom-class="module-manage-dialog" title="项目模块管理" v-model="moduleModal" width="900px" :append-to-body="true" :before-close="beforeClose">
    <div class="module-manage">
      <!-- 左侧树形结构 -->
      <div class="module-manage-left">
        <el-tree
          draggable
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          ref="moduleTreeRef"
          :highlight-current="true"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          :default-expanded-keys="expandedKeys"
          :allow-drop="allowTreeDrop"
          @node-drop="nodeTreeDrop"
          @node-click="getCurrModuleDetail"
          @node-expand="handleNodeExpand"
          @node-collapse="handNodeCollapse"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span class="module-option-name">{{ node.label }}</span>
              <span class="module-option-btn">
                <a style="margin-right: 6px" v-if="data.level"
                  ><el-icon><Rank /></el-icon
                ></a>
                <a class="module-option-icon" @click.stop="handleRemove(node, data)" v-if="data.level"
                  ><el-icon><Delete /></el-icon
                ></a>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
      <div class="module-manage-right" v-loading="detailLoading">
        <!-- 右侧表单内容 -->
        <div class="module-manage-right-top">
          <el-form :model="detailFrom" label-position="top" ref="moduleFormRef" class="module-manage-form">
            <el-form-item label="模块详情" prop="parent_id"> </el-form-item>
            <el-form-item label="所属父级" prop="parent_id">
              <el-tooltip v-if="detailFrom.parent_path.length > 20" effect="light" :content="detailFrom.parent_path" placement="bottom">
                <span class="form-status form-disable">{{ detailFrom.parent_path }}</span>
              </el-tooltip>
              <span v-else class="form-status form-disable">{{ detailFrom.parent_path ? detailFrom.parent_path : "-" }}</span>
            </el-form-item>
            <el-form-item label="模块名称" prop="id">
              <span v-if="detailFrom?.id" class="star">*</span>
              <el-input :disabled="!detailFrom?.id" v-model="detailFrom.name" maxlength="20" style="width: 80%" placeholder="模块名称" />
            </el-form-item>
            <el-form-item v-if="detailFrom?.level != 3" label="子模块" prop="children">
              <div v-for="item in detailFrom.children" :key="`module${item?.id}`" style="width: 80%" class="children-module">
                <span class="star">*</span>
                <el-input v-model="item.name" maxlength="20" placeholder="" />
              </div>
              <div v-for="(addItem, i) in moduleAdds" :key="`moduleaddnums${i}`" style="width: 100%" class="children-module">
                <el-input v-model="moduleAdds[i].name" style="width: 80%" maxlength="20" :placeholder="`新增子模块，输入名称`" />
                <el-icon class="module-option-icon" @click.stop="insetNewModule(i + 1)" :size="18"><CirclePlus /></el-icon>
                <el-icon v-if="moduleAdds.length > 1" class="module-option-del" @click.stop="removeNewModule(i)" :size="18"><Remove /></el-icon>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="module-manage-right-bottom">
          <el-button @click="$emit('update:moduleModal', false)">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">保 存</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { ref, defineProps, reactive, computed, defineEmits, watch } from "vue";
import { useStore } from "@/store/index";
import { getModuleData } from "./index";
import { ResponseParams } from "@/types/response";
import { slice, concat, filter, trim, every } from "lodash";
import { Delete, Rank } from "@element-plus/icons";
import { ElMessageBox } from "element-plus";
import { CirclePlus, Remove } from "@element-plus/icons";
import useMessageTip from "@/composables/useMessageTip";
import type { ModuleNode, ModuleEditParam, SimpNode } from "./index";
import { deleteSettingModule, editSettingModule, getModuleDetail, moveModule } from "@/api/request-modules/product";

export default {
  name: "module-manage-dialog"
};
</script>

<script lang="ts" setup>
const props = defineProps({
  moduleModal: {
    type: Boolean,
    default: false
  }
});

const store = useStore();
const detailLoading = ref(false);
const defaultProps = reactive({
  children: "children",
  label: "name"
});

const { tipMessage } = useMessageTip();
const emit = defineEmits(["update:moduleModal", "refreshSelect"]);
const curProductInfo = computed(() => store?.getters?.productInfo);
const productId = computed(() => store?.getters?.productId);
let timer: ReturnType<typeof setTimeout>;
const moduleTreeRef = ref();
const treeData = ref<ModuleNode[]>([]);
const expandedKeys = ref<number[]>([0]);
const detailFrom = ref<ModuleNode>({
  value: 0,
  label: "",
  level: 0,
  parent_id: 0,
  product_id: 0,
  id: 0,
  name: "",
  parent_name: "",
  parent_path: ""
});
const moduleAdds = ref<SimpNode[]>([{ name: "", id: 0 }]);

const clearData = () => {
  treeData.value = [];
};

const getData = (init?: boolean) => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const data = await getModuleData({
      id: productId.value,
      name: curProductInfo.value?.name
    });
    if (data.length) {
      treeData.value = data;
      if (init) {
        updateCurrDetail(treeData.value[0]);
      } else {
        updateCurrDetail(moduleTreeRef?.value?.getCurrentNode());
      }
    }
  }, 200);
};

// 树节点展开
const handleNodeExpand = (data: ModuleNode) => {
  const id: number = data.id || 0;
  expandedKeys.value.push(id);
};

// 数结点关闭
const handNodeCollapse = (data: ModuleNode) => {
  const id: number = data.id;
  const index = expandedKeys.value.indexOf(id);
  if (index > -1) {
    const head = slice(expandedKeys.value, 0, index);
    const foot = slice(expandedKeys.value, index + 1);
    expandedKeys.value = concat(head, foot);
  }
};

const getCurrModuleDetail = async (params: ModuleNode) => {
  detailLoading.value = true;

  const res = await getModuleDetail<ResponseParams.ResponseDataSuccess>({
    id: params?.id,
    product_id: params?.product_id
  });
  if (res.code === 200) {
    detailFrom.value.value = res.data?.id;
    detailFrom.value.label = res.data?.name;
    detailFrom.value.level = params?.level;
    detailFrom.value.parent_id = res.data?.parent_id;
    detailFrom.value.product_id = params?.product_id;
    detailFrom.value.id = res.data?.id;
    detailFrom.value.name = res.data?.name;
    detailFrom.value.parent_name = res.data?.parent_name;
    detailFrom.value.parent_path = res.data?.parent_path;
    detailFrom.value.children = res.data?.children;
    moduleAdds.value = [{ name: "", id: 0 }];
    detailLoading.value = false;
  }
};

// 更新模块详情
const updateCurrDetail = (params: ModuleNode) => {
  getCurrModuleDetail(params);
  setTimeout(() => {
    moduleTreeRef?.value?.setCurrentKey(params?.id);
  }, 200);
};

const insetNewModule = (index: number) => {
  const head = slice(moduleAdds.value, 0, index);
  const foot = slice(moduleAdds.value, index);
  moduleAdds.value = concat(head, { name: "", id: 0 }, foot);
};

const removeNewModule = (index: number) => {
  const head = slice(moduleAdds.value, 0, index);
  const foot = slice(moduleAdds.value, index + 1);
  moduleAdds.value = concat(head, foot);
};

// 删除
const handleRemove = (node: Record<string, any>, data: ModuleNode) => {
  console.log(data);
  ElMessageBox.confirm("删除模块会同时删除其子模块，当前模块下需求和用例会自动关联到其父级，操作不可逆，是否确认？", "删除模块", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    customClass: "module-manage-remove-dialog"
  }).then(async () => {
    const parent = node.parent;
    const children = parent.data.children || parent.data;
    const index = children.findIndex((d: Record<string, any>) => d.id === data.id);
    children.splice(index, 1);
    treeData.value = [...treeData.value];
    const res = await deleteSettingModule<ResponseParams.ResponseDataSuccess>({
      id: data?.id
    });
    if (res.code === 200) {
      tipMessage(res.code, "成功");
      updateCurrDetail(treeData.value[0]);
      emit("refreshSelect", data?.id, data?.parent_id, data?.parent_name);
    }
  });
};

const handleConfirm = async () => {
  const { id, name, children } = detailFrom.value;
  const items = children
    ? concat(
        children.map((o) => {
          return { id: o.id, name: o.name };
        }),
        filter(moduleAdds.value, (o) => trim(o.name) !== "")
      )
    : moduleAdds.value;

  if (!name) return tipMessage(400, "模块名称不能为空");
  if (!every(children, "name")) return tipMessage(400, "子模块名称不能为空");

  const params = {
    id,
    name,
    product_id: productId.value,
    children: items
  } as ModuleEditParam;

  const res = await editSettingModule<ResponseParams.ResponseDataSuccess>(params);
  if (res.code === 200) {
    tipMessage(res.code, "成功");
    getData(false);
    emit("refreshSelect");
  }
};

const beforeClose = () => {
  emit("update:moduleModal", false);
};

const allowTreeDrop = (curr: { data?: ModuleNode }, after: any, type: string) => {
  // 不允许放在根节点的前面和后面
  const isRootNode = after.data.id === 0; // 是否是根节点
  if (isRootNode && (type === "prev" || type === "next")) {
    return false;
  } else {
    return true;
  }
};

const nodeTreeDrop = async (curr: { data?: ModuleNode }, after: any) => {
  // order的传值规则为 父级下第一个默认为0，否则传前面一个平级模块的id
  let order = -1;
  let parentId = 0;
  let currLevel = 0;
  // after是当前被拖动元素的平级时
  after?.parent.childNodes.forEach((o: { data: ModuleNode }, i: number) => {
    if (o?.data?.id == curr.data?.id) {
      parentId = after.parent.data.id;
      currLevel = o?.data?.level;
      i === 0 ? (order = 0) : (order = after?.parent.childNodes[i - 1].data.id);
    }
  });
  if (order == -1) {
    // after是当前被拖动元素的父级时
    after.data.children.forEach((o: ModuleNode, i: number) => {
      if (o?.id == curr.data?.id) {
        parentId = after.data.id;
        currLevel = after.data.level + 1;
        i === 0 ? (order = 0) : (order = after.data.children[i - 1].id);
      }
    });
  }
  if (order === -1) {
    tipMessage(400, "拖动失败请重新再试！");
    getData(false);
    return;
  }
  if (currLevel >= 4) {
    tipMessage(400, "模块最多到第四级！");
    getData(false);
    return;
  }
  const params = {
    id: curr.data?.id,
    order: order,
    parent_id: parentId,
    product_id: productId.value
  };
  const res = await moveModule<ResponseParams.ResponseDataSuccess>(params);
  if (res.code === 200) {
    tipMessage(res.code, "成功");
  }
  getData(false);
};

watch(
  () => productId.value,
  (newVal) => {
    newVal && getData(true);
  },
  {
    immediate: true
  }
);

watch(
  () => props.moduleModal,
  (value) => {
    if (value) {
      getData(true);
    } else {
      clearData();
    }
  },
  {
    immediate: true
  }
);
</script>

<style lang="less" scoped>
.module-manage-dialog {
  display: block;
}

.module-manage {
  height: 100%;
  width: 100%;
  height: 560px;
  display: flex;
  justify-content: flex-start;
}
.module-manage-left {
  flex-basis: 450px;
  border-right: 1px solid #ccc;
  padding: 14px;
  box-sizing: border-box;
  overflow-y: scroll;
  .el-empty {
    height: 90%;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    .module-option-name {
      margin-right: 20px;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .module-option-btn {
      display: none;
      margin-right: 10px;
    }
    &:hover {
      .module-option-name {
        max-width: 270px;
      }
      .module-option-btn {
        display: block;
      }
    }
  }

  .el-tree-node.is-drop-inner > .el-tree-node__content .module-option-name {
    background-color: #1e9273;
    color: #fff;
  }
}

.module-option-icon {
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
}

.module-option-del {
  cursor: pointer;
  &:hover {
    color: #ff4851;
  }
}

.module-manage-right {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;

  .form-disable {
    background-color: var(--el-disabled-bg-color);
    box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
    cursor: not-allowed;
    padding: 0 12px;
    display: inline-flex;
    background-image: none;
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    transition: var(--el-transition-box-shadow);
    line-height: 32px;
    text-align: left;
    color: var(--el-disabled-text-color);
    width: 300px;
    height: 32px;
    overflow: hidden;
  }

  .module-manage-right-top {
    flex: 1;
    width: 100%;
    padding: 14px 14px 10px 28px;
    box-sizing: border-box;
    overflow-y: scroll;
    .star {
      color: red;
      position: absolute;
      left: -10px;
    }
    .children-module {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .el-icon {
        margin-left: 10px;
      }
    }
  }
  .module-manage-right-bottom {
    flex-basis: 50px;
    width: 100%;
    line-height: 50px;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    align-items: center;
    border-top: 1px solid #ccc;
    padding-right: 14px;
    box-sizing: border-box;
  }
}
</style>

<style lang="less">
.module-manage-dialog {
  .el-dialog__body {
    padding: 0px !important;
  }
}

.module-manage-remove-dialog {
  .el-button--primary {
    background-color: @rp-color-danger;
    border-color: @rp-color-danger;
    &:hover {
      background-color: #f17377;
      border-color: #f17377;
    }
  }
}

.el-input.is-disabled .el-input__inner {
  color: #606266 !important;
}
.el-input.is-disabled .el-input__wrapper {
  color: #606266 !important;
}
</style>
