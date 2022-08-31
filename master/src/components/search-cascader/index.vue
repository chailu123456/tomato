<template>
  <div class="search-cascader">
    <el-cascader
      placeholder="请选择"
      @change="handleChange"
      :options="peoples"
      collapse-tags
      filterable
      ref="cascaderValRef"
      clearable
      :show-all-levels="true"
      :popper-append-to-body="false"
      :teleported="false"
      :props="props"
    ></el-cascader>
  </div>
</template>

<script lang="ts">
import useCommon from "@/composables/useCommon";
import { defineComponent, ref, onMounted } from "vue";
export default defineComponent({
  name: "SearchCascader",
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          multiple: true,
          value: "value", // 字段名
          label: "label", // 显示名称
          children: "children" // 子级字段名
        };
      }
    },
    /* 选项列表数据 */
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
    }
  },
  emits: ["change"],
  setup(props, { emit }) {
    const peoples: any = ref([]);
    const cascaderValRef = ref<any>(null);
    const { useGetDepartmentList } = useCommon();

    onMounted(() => {
      getDepartment();
    });

    // 去掉空的数组
    // const removeEmpty = (data: Department[]) => {
    //   for (let i = 0; i < data.length; i++) {
    //     if (!data[i].son.length) {
    //       // @ts-ignore
    //       delete data[i].son;
    //     } else {
    //       removeEmpty(data[i].son);
    //     }
    //   }
    //   return data;
    // };

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

    const getDepartment = async () => {
      const data = await useGetDepartmentList();
      if (data) {
        peoples.value = dataReverse(data);
      }
    };

    const handleChange = () => {
      const val = cascaderValRef?.value.getCheckedNodes();
      let code: string[] = [];
      if (val && val.length) {
        val.forEach((item: Record<string, any>) => {
          code.push(item.value);
        });
      }
      emit("change", code);
    };
    return {
      peoples,
      handleChange,
      cascaderValRef
    };
  }
});
</script>

<style lang="less" scoped>
.search-cascader {
}
:deep(.el-checkbox--small) {
  margin-right: 4px !important;
}

:deep(.el-cascader__suggestion-panel) {
  width: 500px;
}

.el-cascader-menu__wrap {
  height: 400px !important;
}
</style>
