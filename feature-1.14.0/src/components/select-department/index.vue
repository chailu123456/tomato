<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 16:51:30
 * @LastEditTime: 2022-04-24 18:59:48
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\select-department\index.vue
-->
<template>
  <div class="select-department">
    <el-cascader
      placeholder="请选择"
      @change="handleChange"
      :options="peoples"
      v-model="val"
      collapse-tags
      filterable
      ref="cascaderVal"
      clearable
      :props="props"
    ></el-cascader>
  </div>
</template>

<script lang="ts">
import useCommon, { Department } from "@/composables/useCommon";
import { onMounted, ref, defineEmits } from "vue";

export default {
  name: "select-department"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["event"]);
const val = ref<string[]>(); // v-model
const cascaderVal = ref(); // ref
const peoples = ref<Department[]>();
const props = {
  label: "name",
  value: "department_code",
  children: "son",
  multiple: true
};

const { useGetDepartmentList } = useCommon();

const handleChange = (arr: string[]) => {
  const nodes = cascaderVal?.value.getCheckedNodes();
  val.value = arr;
  const code = nodes.map((item: Record<string, any>) => item.value);
  emit("event", code);
};

onMounted(() => {
  getDepartment();
});

// 去掉空的数组
const removeEmpty = (data: Department[]) => {
  for (let i = 0; i < data.length; i++) {
    if (!data[i].son.length) {
      // @ts-ignore
      delete data[i].son;
    } else {
      removeEmpty(data[i].son);
    }
  }
  return data;
};
// 获取部门人员列表信息
const getDepartment = async () => {
  const data = await useGetDepartmentList();
  if (data) {
    peoples.value = removeEmpty(data);
  }
};
</script>
