<template>
  <div>
    <div class="input-option">
      <span class="option-show" v-show="!hide" @click="handleBtn">{{ inputValue }}{{ company }}</span>
      <!-- @input="(val:any)=>{inputValue = val.replace(/[^\d]/g, '')}" -->
      <!-- <el-input-number @change="handleChangeVal" size="small" :max="100" :min="0" class="option-edit" v-model="inputVal" /> -->
      <el-input
        v-show="hide"
        type="number"
        @blur="handleBlur"
        @change="handleChangeVal"
        size="small"
        ref="inputOption"
        @input="(val:any)=>{inputValue = val.replace(/[^\d]/g, '')}"
        class="option-edit"
        v-model.number="inputValue"
      />
    </div>
  </div>
</template>

<script lang="ts">
/**业务组件
 * 表格鼠标hover修改数据 使用模块：任务、需求池模块修改工时，进度
 * getWangEditorValue: 富文本值更新
 * inputVal: 传入的值
 * company: 单位,如%,h
 * valKey: key值
 * currentId： 当前数据id
 * 用法：<InputOption :inputVal="scoped.row.hours" :currentId="scoped.row.id" @onChangeVal="onChangeVal" valKey="hours"></InputOption>

 * 
 * */
export default {
  name: "inputOption"
};
</script>
<script lang="ts" setup>
import { defineProps, defineEmits, ref, watch } from "vue";
import useMessageTip from "@/composables/useMessageTip";
const { tipMessage } = useMessageTip();
const hide = ref(false);
const emit = defineEmits(["onChangeVal"]);
const props = defineProps({
  inputVal: {
    // 值
    type: Number,
    default: null
  },
  company: {
    // 单位
    type: String,
    default: ""
  },
  // 当前操作值的key
  valKey: {
    type: String,
    default: ""
  },
  // 哪个模块用到好做判断
  module: {
    type: String,
    default: ""
  },

  currentId: {
    // 当前数据id
    type: Number,
    default: null
  }
});
const inputOption = ref();
const inputValue = ref(props.inputVal);
let originInputVal = JSON.stringify(props.inputVal);
watch(
  () => props.inputVal,
  (val: number) => {
    originInputVal = JSON.stringify(props.inputVal);
    inputValue.value = val;
  }
);

const handleBtn = () => {
  hide.value = true;
  inputOption.value?.focus();
};

const handleBlur = () => {
  hide.value = false;
};

const handleChangeVal = (val: number | string) => {
  inputOption.value?.focus();
  if (val === "") {
    inputValue.value = Number(originInputVal);
    return tipMessage(400, "请输入大于0的正整数");
  }
  const obj = {
    ids: [props.currentId],
    [props.valKey]: Number(val)
  };
  if (Number(val)) {
    const r = /^\+?[0-9][0-9]*$/;
    if (!r.test(val + "")) {
      inputValue.value = Number(originInputVal);
      return tipMessage(400, "请输入大于0的正整数");
    }
    if (val < 0) {
      inputValue.value = Number(originInputVal);
      return tipMessage(400, "请输入大于0的正整数");
    }
    if (props.valKey === "complete_percent") {
      if (val > 100) {
        inputValue.value = Number(originInputVal);
        return tipMessage(400, "请输入0-100之间的正整数");
      }
    }
    if (props.valKey === "hours") {
      if (val > 999) {
        inputValue.value = Number(originInputVal);
        return tipMessage(400, "请输入0-999之间的正整数");
      }
    }
  } else {
    if (props.valKey === "hours") {
      if (val == 0) {
        inputValue.value = Number(originInputVal);
        return tipMessage(400, "请输入大于0的正整数");
      }
    } else if (props.valKey === "complete_percent") {
      if (val > 100) {
        inputValue.value = Number(originInputVal);
        return tipMessage(400, "请输入0-100之间的正整数");
      }
    } else {
      inputValue.value = Number(originInputVal);
    }
  }

  console.log(originInputVal);
  emit("onChangeVal", obj, props.valKey);
};
</script>
<style scoped lang="less">
.input-option {
  :deep(.el-input__wrapper) {
    // box-shadow: none;
    // background: transparent;
  }
  &:hover {
    .option-show {
      display: block;
      border: 1px solid #dcdfe6;
      height: 30px;
      line-height: 30px;
      border-radius: 4px;
      background: #fff;
    }
    .option-edit {
      text-align: center;
      display: block;
    }
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #777, #898989 inset !important;
      // background: #fff;
      // border: 1px solid #777;
    }
  }
  // .option-show {
  //   display: block;
  // }
  // .option-edit {
  //   display: none;
  // }
  :deep(.el-input__inner) {
    text-align: center !important;
  }
}
</style>
