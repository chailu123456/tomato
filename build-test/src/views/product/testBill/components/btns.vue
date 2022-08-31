<!--
 * @Author: 宋绍华
 * @Date: 2022-05-18 21:15:44
 * @LastEditTime: 2022-05-31 18:51:28
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\testBill\components\btns.vue
-->
<template>
  <jsxNode />
</template>

<script lang="tsx" setup>
import { defineEmits, defineProps } from "vue";
const emit = defineEmits(["onClick"]);
const props = defineProps({
  status: {
    type: Number,
    default: 0
  }
});

const jsxNode = () => {
  switch (props.status) {
    case 1:
      return (
        <el-button size="small" plain onClick={() => onClick(3, "申请提测")} type="primary">
          申请提测
        </el-button>
      );
    case 2:
      return (
        <el-button size="small" plain onClick={() => onClick(3, "重新提测")} type="primary">
          重新提测
        </el-button>
      );
    case 3:
      return (
        <span>
          <el-button size="small" plain type="primary" onClick={() => onClick(4, "接受提测")}>
            接受提测
          </el-button>
          <el-button size="small" plain onClick={() => onClick(2, "驳回提测")} type="primary">
            驳回提测
          </el-button>
        </span>
      );
    case 4:
      return (
        <span>
          <el-button size="small" plain onClick={() => onClick(5, "测试完成")} type="primary">
            测试完成
          </el-button>
          <el-button size="small" plain onClick={() => onClick(6, "测试完成，申请发布")} type="primary">
            测试完成，申请发布
          </el-button>
        </span>
      );
    case 5:
      return (
        <el-button size="small" plain type="primary" onClick={() => onClick(6, "申请发布")}>
          申请发布
        </el-button>
      );
    case 6:
      return (
        <el-button size="small" plain onClick={() => onClick(7, "发布完成")} type="primary">
          发布完成
        </el-button>
      );
    default:
      return (
        <el-button size="small" color="#999" disabled>
          已发布
        </el-button>
      );
  }
};

const onClick = (toStatus: number, text: string) => {
  emit("onClick", { toStatus, curStatus: props.status, text });
};
</script>
<style lang="less" scoped></style>
