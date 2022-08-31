<template>
  <div class="rp-select-cop">
    <span class="select-show" v-if="!hide" @click="handleBtn">
      {{ showVal }}
    </span>
    <el-select v-else class="reset-select" v-model="currentVal" ref="selectRef" @change="handleSelect" filterable placeholder="请选择">
      <template v-if="type">
        <el-option v-for="item in optionsData" :key="item[valueKey[0]]" :label="item[valueKey[1]]" :value="item[valueKey[0]]" />
      </template>
      <template v-else>
        <el-option-group v-for="group in optionsData" :key="group.label" :label="group.label">
          <el-option v-for="item in group.options" :key="item[valueKey[0]]" :label="item[valueKey[1]]" :value="item[valueKey[0]]" />
        </el-option-group>
      </template>
    </el-select>
  </div>
</template>

<script lang="ts">
/**业务组件
 * 表格鼠标hover修改数据 使用模块：任务、需求池模块修改工时，进度
 * valueKey: 下拉列表循环遍历读取的key
 * keyVal: 当前值的key(只要是修改完后传到父组件用到)
 * currentVal: 当前值
 * item 当前数据的所有值
 * optionsData 下拉数据
 * currentType 当前列表类型（主要是状态，优先级，指派给）
 * type ype=1进行分组（有历史记录，一般用到指派给）  type = 0 默认不进行分组
 * 用法：selectOption
        :valueKey="['staff_no', 'staff_name']"
        keyVal="staff_no"
        :currentVal="scoped.row.staff_no"
        :type="0"
        :item="scoped.row"
        :optionsData="userList"
        @onChangeSelect="onChangeSelect"
      ></selectOption>

 * 
 * */
export default {
  name: "inputOption"
};
</script>
<script lang="ts" setup>
import { defineProps, defineEmits, watch, ref } from "vue";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
const emit = defineEmits(["onChangeSelect"]);
const props: any = defineProps({
  // type=0进行分组（有历史记录）  type = 1 默认不进行分组
  type: {
    require: false,
    type: Number,
    default: 1
  },
  optionsData: {
    type: Array,
    default: () => []
  },
  valueKey: {
    type: Array,
    default: () => ["value", "label"]
  },
  currentVal: {
    default: () => ""
  },
  currentType: {
    type: String,
    default: () => ""
  },
  keyVal: {
    type: String,
    default: () => ""
  },
  item: {
    type: Object,
    default: () => ({})
  }
});

const hide = ref(false);

const userMsg = getSession("user", true) as USER;
// 控制select框显示字体颜色，在less中可看到
const a = ref("");
const b = ref("");

const showVal = ref("");

const selectRef = ref();
watch(
  () => props.item,
  () => {
    // 关掉select,这块原因是在浏览器标签切换的时候会自动打开第一个(先修改一个昨天，然后切换标签)
    selectRef.value?.blur();
    if (props.currentType === "level" || props.currentType === "priority") {
      a.value = props.optionsData[props.currentVal - 1]?.color || "#333";
      showVal.value = props.optionsData[props.currentVal - 1][props.valueKey[1]];
    } else if (props.currentType === "staff_no") {
      b.value = userMsg?.staff_no === props.item.staff_no ? "bolder" : "normal";
      showVal.value = props.item.staff_name;
    } else if (props.currentType === "status") {
      const person = props.optionsData.filter((item: any) => item[props.valueKey[0]] === props.currentVal);
      showVal.value = person[0] ? person[0][props.valueKey[1]] : "";
      a.value = person[0]?.color || "";
    }
  },
  {
    immediate: true
  }
);

const handleBtn = () => {
  hide.value = true;
  setTimeout(() => {
    selectRef.value.focus();
  }, 200);
};

const handleSelect = (val: number | string) => {
  // 关掉select
  selectRef.value?.blur();
  emit("onChangeSelect", val, props.item, props.keyVal);
};
</script>
<style lang="less">
.rp-select-cop {
  position: relative;
  .select-show {
    display: block;
    padding-right: 21px;
    color: v-bind("a");
    font-weight: v-bind("b");
  }
  &:hover {
    .select-show {
      display: block;
      border: 1px solid #dcdfe6;
      height: 30px;
      line-height: 30px;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }
    .select-show::before {
      content: "";
      position: absolute;
      top: 11px;
      right: 16px;
      width: 6px;
      height: 6px;
      border-top: 0.5px solid #a9abb3;
      border-right: 0.5px solid #a9abb3;
      transform: rotate(135deg);
    }
  }
  .reset-select {
    width: 100%;
    .el-input__wrapper {
      box-shadow: none;
      background: transparent;
      .el-input__suffix {
        opacity: 0;
      }
      .el-input__inner {
        text-align: center;
        color: v-bind("a");
        font-weight: v-bind("b");
      }
      &:hover {
        box-shadow: 0 0 0 1px #777, #898989 inset;
        background: #fff;
        .el-input__suffix {
          opacity: 1;
        }
      }
    }
  }
}
</style>
