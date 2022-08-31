<!--
 * @Author: 宋绍华
 * @Date: 2022-05-26 16:02:55
 * @LastEditTime: 2022-05-30 11:06:11
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\project\home\components\transferMember.vue
-->
<template>
  <div class="transfer">
    <el-dialog v-model="visible2" title="选择转让目标" width="30%" :before-close="beforeClose">
      <div style="display: flex; justify-content: center">
        <el-select filterable v-model="val" placeholder="请选择">
          <el-option v-for="item in options" :disabled="item.role === 2" :key="item.staff_no" :label="item.staff_name" :value="item.staff_no" />
        </el-select>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="$emit('update:visible2', false)">取消</el-button>

          <el-button
            type="primary"
            @click="
              $emit('submit', val);
              $emit('update:visible2', false);
            "
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { StaffItemResp } from "@/composables/useHomePage";
import { PropType, ref, defineProps, defineEmits } from "vue";
export default {
  name: "transfer"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["submit", "update:visible2"]);
defineProps({
  visible2: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array as PropType<StaffItemResp[]>,
    default: () => []
  }
});

const val = ref();
const beforeClose = () => {
  emit("update:visible2", false);
};
</script>
<style lang="less" scoped></style>
