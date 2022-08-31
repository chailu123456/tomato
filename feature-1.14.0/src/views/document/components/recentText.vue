<!--
 * @Author: 宋绍华
 * @Date: 2022-03-31 16:23:42
 * @LastEditTime: 2022-03-31 18:03:50
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\document\components\recentText.vue
-->
<template>
  <div class="recent">{{ textMap[curTextType] }}</div>
</template>

<script lang="ts">
import { withDefaults, defineProps } from "vue";
export default {
  name: "recentText"
};
</script>

<!--
显示文档更改状态文本，并且可以跳转到历史记录
1. 最近修改
  - 刚刚
  - 几分钟前
2. 已经保存到云端
3. 保存中...
 -->
<script lang="ts" setup>
type TextType = "save" | "saving" | "recent";
withDefaults(
  defineProps<{
    curTextType: TextType;
  }>(),
  {
    curTextType: "recent"
  }
);
const textMap = {
  save: "已保存到云端",
  saving: "保存中...",
  recent: "最近修改"
};
</script>
<style lang="less">
.recent {
  margin-left: 10px;
  display: flex;
  align-items: flex-end;
  color: #646a73;
  font-size: 12px;
  cursor: pointer;
  line-height: 2;
}
</style>
