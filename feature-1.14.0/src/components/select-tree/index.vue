<template>
  <el-select v-model="valueId" popper-class="select-tree" :clearable="clearable" @clear="clearHandle" ref="rpSelect">
    <el-option :value="valueId" :label="valueTitle">
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="options"
        :props="props"
        filterable
        :node-key="props.value"
        :default-expanded-keys="defaultExpandedKey"
        @node-click="handleNodeClick"
      >
      </el-tree>
    </el-option>
  </el-select>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, nextTick, onMounted } from "vue";
export default defineComponent({
  name: "selectTree",
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          multiple: true,
          value: "department_code", // 字段名
          label: "name", // 显示名称
          children: "son" // 子级字段名
        };
      }
    },
    /* 选项列表数据(树形结构的对象数组) */
    options: {
      type: Array,
      default: () => {
        return [];
      }
    },
    /* 初始值 */
    value: {
      type: String,
      default: () => {
        return "";
      }
    },
    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    /* 自动收起 */
    accordion: {
      type: Boolean,
      default: () => {
        return true;
      }
    }
  },
  emits: ["getValue", "initOptions"],
  setup(props, { emit }) {
    const valueId = ref(props.value); // 初始值
    const valueTitle = ref("");
    let defaultExpandedKey = reactive([valueId.value]);
    watch(valueId, (newValue) => {
      valueId.value = newValue;
      initHandle();
    });
    onMounted(() => {
      // 挂载完，父组件初始化数据
      emit("initOptions");
    });
    // 初始化值
    const rpSelect = ref();
    const selectTree = ref();
    const initHandle = () => {
      if (valueId.value) {
        valueTitle.value = selectTree.value.getNode(valueId.value).data[props.props.label]; // 初始化显示
        selectTree.value.setCurrentKey(valueId.value); // 设置默认选中
        defaultExpandedKey = [valueId.value]; // 设置默认展开
      }
      nextTick(() => {
        const scrollWrap = document.querySelectorAll(".el-scrollbar .el-select-dropdown__wrap")[0] as HTMLElement;
        scrollWrap.style.cssText = "margin: 0px; max-height: none; overflow: hidden;";
        const scrollBar = document.querySelectorAll(".el-scrollbar .el-scrollbar__bar");
        for (let i = 0; i < scrollBar.length; i++) {
          let ele = scrollBar[i] as HTMLElement;
          ele.style.width = "0";
        }
      });
    };
    // 切换选项
    const handleNodeClick = (node: Record<string, any>) => {
      valueTitle.value = node[props.props.label];
      valueId.value = node[props.props.value];
      emit("getValue", valueId.value);
      defaultExpandedKey.length = 0;
      // 如果是叶子节点，就收起来吧，非叶子节点，收于不收，看子节点咋办
      if (!node[props.props.children].length) {
        rpSelect.value.blur();
      }
    };
    // 清空选中样式
    const clearSelected = () => {
      let allNode = document.querySelectorAll("#tree-option .el-tree-node");
      allNode.forEach((element) => element.classList.remove("is-current"));
    };
    // 清除选中
    const clearHandle = () => {
      valueTitle.value = "";
      valueId.value = "";
      defaultExpandedKey.length = 0;
      clearSelected();
      emit("getValue", null);
    };
    return {
      valueId,
      valueTitle,
      defaultExpandedKey,
      rpSelect,
      selectTree,
      initHandle,
      handleNodeClick,
      clearHandle,
      clearSelected
    };
  }
});
</script>

<style>
.select-tree .el-select-dropdown__wrap {
  max-height: 450px;
}
</style>
<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 450px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  /* color: #409eff; */
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  /* color: #606266; */
  font-weight: normal;
}
</style>
