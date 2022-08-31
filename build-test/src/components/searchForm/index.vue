<template>
  <div class="search-list">
    <ul class="search-list-btn">
      <li v-for="i in props.searchArray.btnArray" :class="[i.id === active ? 'is-active' : '', 'btn']" @click="handleClick(i)" :key="i.id">{{ i.label }}</li>
      <li class="funnel-search">
        <el-popover placement="bottom" :teleported="false" @hide="hideSearch" :width="500" ref="popoverRef" trigger="click" popper-class="form-search-popover">
          <template #reference>
            <div class="search-icon" @click="$emit('click')">
              <el-icon :class="[active === '-10' ? 'currentShow' : '']"><search /> </el-icon>
              <span :class="[active === '-10' ? 'currentShow' : '', 'search-text']"> 筛选</span>
              <em :class="[a ? 'circle-tip' : '']">{{ a || "" }}</em>
            </div>
          </template>
          <template #default>
            <el-form ref="formRef" label-width="80px" class="form-search-list">
              <el-form-item
                v-for="item in props.searchArray.searchForm"
                :class="[item.type != 'daterange' ? 'form-list' : 'form-list-date', item.labelClass]"
                :key="item.label"
                :label="item.label"
              >
                <template v-if="item.type === 'input'">
                  <el-input v-model.trim="item.val" clearable :placeholder="item.placeholder || item.label" />
                </template>
                <template v-else-if="item.type === 'select'">
                  <el-select-v2
                    v-if="item.selectType === 'virtual'"
                    v-model="item.val"
                    size="default"
                    :options="item.listData"
                    filterable
                    clearable
                    :teleported="false"
                  />
                  <!-- 默认筛选，不进行筛选项分组 -->
                  <el-select
                    v-else-if="!item.showRecord"
                    :teleported="false"
                    filterable
                    :multiple="item.multiple"
                    collapse-tags
                    clearable
                    v-model="item.val"
                    placeholder="请选择"
                    @change="onSelectChange($event, item)"
                  >
                    <el-option
                      v-for="it in item.listData"
                      :key="item.valueKey ? it[item.valueKey[0]] : it.value"
                      :label="item.valueKey ? it[item.valueKey[1]] : it.label"
                      :value="item.valueKey ? it[item.valueKey[0]] : it.value"
                    ></el-option>
                  </el-select>
                  <!-- 对筛选项分组，记录之前筛选过的数据 -->
                  <el-select
                    @change="onSelectChange($event, item)"
                    v-else
                    :teleported="false"
                    filterable
                    :multiple="item.multiple"
                    collapse-tags
                    clearable
                    v-model="item.val"
                    placeholder="请选择"
                  >
                    <el-option-group v-for="group in item.listData" :key="item.valueKey ? group[item.valueKey[0]] : group.value" :label="group.label">
                      <el-option
                        v-for="i in group.options"
                        :key="item.valueKey ? i[item.valueKey[0]] : i.value"
                        :label="item.valueKey ? i[item.valueKey[1]] : i.label"
                        :value="item.valueKey ? i[item.valueKey[0]] : i.value"
                      ></el-option>
                    </el-option-group>
                  </el-select>
                </template>
                <template v-else-if="item.type === 'daterange'">
                  <el-date-picker
                    size="default"
                    v-model="item.val"
                    :teleported="false"
                    :type="item.dateType || 'daterange'"
                    :value-format="item.format || 'YYYY-MM-DD'"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    :shortcuts="getShortCuts(item)"
                    :placeholder="item.placeholder"
                    :disabled-date="item.disabledDate || (() => {})"
                    :unlink-panels="!!item.isLink"
                  />
                </template>
                <template v-else-if="item.type === 'customComponents'">
                  <component
                    v-if="item.componentIndex && !item.com"
                    @change="(val:any) =>handleEvent(val)"
                    :ref="(el:any) => cascaderVal = el"
                    :is="componentArr[item.componentIndex]"
                  ></component>
                  <component v-else :ref="(el:any) => cascaderVal = el" @change="(val:any) =>handleEvent(val)" :is="item.com"></component>
                </template>
              </el-form-item>
            </el-form>
            <div class="search-opation">
              <el-button @click="handleCancel">取消</el-button>
              <el-button @click="handleReset(formRef)">重置</el-button>
              <el-button @click="handleConfirm">确定</el-button>
            </div>
          </template>
        </el-popover>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
export default {
  name: "search-form"
};

/**
 * 搜索公共组件 已全局注册，直接使用即可
 * getWangEditorValue: 富文本值更新
 * searchArray: 传入的值
 * quickSeacrh: 快速搜索 直接点解搜索列表事件
 * changeSearch: 下拉框搜索  点击搜索弹出搜索列表选择后点击确定事件
 * ts类型路径: @/types/interface中的BtnArray、ListData、SearchForm、SearchArray使用的时候可去对应引入
 * 用法：<search-form :searchArray="searchArray" @quickSeacrh="quickSeacrh" @changeSearch="changeSearch"></search-form>
 * currentActive: 当前是快捷搜索还是form表单搜索，主要是设置背景颜色
 * searchArray传值详解：
 *    btnArray： 快速搜索展示列表
 *       id：所属id
 *       label: 名称
 *       key:当前字段代表key(主要解决点击后将该值去搜索)
 *    searchForm： 搜索框数据列表
 *       type： 类型(判断该搜索时input、select、daterange)
 *       selectType： 使用虚拟组件
 *       label： 名称
 *       key： 当前字段的key(主要解决点击后将该值去搜索)
 *       val： 搜索默认展示值(值可以是数组或字符串,取决于搜索是否多选单选)
 *       showRecord： 是否展示搜索记录(这块主要用到的是搜索指派人，创建人,其它如果要用到记录展示需看接口是否符合数据格式)，默认false,可不传
 *       multiple： 是否多选，在type为select用到  可不传
 *       valueKey   type为select是循环遍历展示的值，可在外部传入key与value,例如valueKey: ["staff_no", "staff_name"],在selsect的<el-option/>会读取传入对应的值，默认读取value与label
 *       listData： 下拉列表展示的数据,
 *       componentIndex: 默认组件下表(在搜索组件里边提前引入,使用的时候传入对应的下标即可),如果需要从外部传入，则不需要传
 *       com: 传入的组件
 *
 * const searchArray: SearchArray = reactive({
      btnArray: [
        { id: "-1", label: "所有", key: "" },
        { id: "2", label: "未完成", key: "a" },
        { id: "3", label: "设计中", key: "b" },
      ],
      searchForm: [
        {
          type: "input",
          label: "需求名称",
          key: "name",
          val: "新建一份"
        },
        {
          type: "select",
          label: "创建人",
          val: ["SF82266"],
          key: "creator",
          showRecord: true,
          multiple: true,
          valueKey: ["staff_no", "staff_name"],
          listData: [
            {
              value: "1",
              label: "张三"
            },
            {
              value: "2",
              label: "王五"
            },
            {
              value: "3",
              label: "里斯"
            }
          ]
        }
      ]
    });
 */
</script>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, markRaw, defineAsyncComponent, defineExpose } from "vue";
import type { FormInstance } from "element-plus";
import { BtnArray, SearchForm } from "@/types/interface";
import { Search } from "@element-plus/icons";

const props = defineProps({
  searchArray: {
    type: Object,
    default: () => ({})
  },
  currentActive: {
    type: String,
    default: () => "-1"
  }
});

let emit = defineEmits(["quickSeacrh", "changeSearch", "click", "onCancel", "change", "resetSearch"]);
// 默认显示所有
const active = ref<string | undefined>(props.currentActive);

let originSearchForm = JSON.parse(JSON.stringify(props.searchArray.searchForm));

setTimeout(() => {
  originSearchForm = JSON.parse(JSON.stringify(props.searchArray.searchForm));
}, 2000);

// 组件
const componentArr = [
  markRaw(defineAsyncComponent(() => import("@/components/select-department/index.vue"))),
  markRaw(defineAsyncComponent(() => import("@/components/search-cascader/index.vue")))
];

// ref
const popoverRef = ref();

const cascaderVal = ref();

watch(
  () => props.currentActive,
  (val) => {
    active.value = val;
  }
);

// 快捷选项搜索
const handleClick = (val: BtnArray) => {
  active.value = val.id;
  a.value = 0;
  emit("quickSeacrh", val);
};
let a = ref(0);
const formRef = ref<FormInstance>();

// eslint-disable-next-line vue/no-setup-props-destructure
watch(
  () => props.searchArray.searchForm,
  (newVal) => {
    let formData = newVal;
    a.value = 0;
    for (let i = 0; i < formData.length; i++) {
      if (Array.isArray(formData[i].val) && formData[i].val.length) {
        a.value++;
      } else {
        if (formData[i].val && !Array.isArray(formData[i].val)) {
          a.value++;
        }
      }
    }
    if (a.value) active.value = "-10";
  },
  {
    deep: true
  }
);

// 级联组件事件回调 val选中的值
const handleEvent = (val: string[]) => {
  props.searchArray.searchForm.forEach((item: SearchForm) => {
    if (item.type === "customComponents") {
      item.val = val;
    }
  });
};

// 确定
const handleConfirm = () => {
  let obj: Record<string, any> = {};
  props.searchArray.searchForm.forEach((item: SearchForm) => {
    obj[item.key] = item.val;
  });
  active.value = "-10";
  emit("changeSearch", obj);
  originSearchForm = JSON.parse(JSON.stringify(props.searchArray.searchForm));
  // 确定后隐藏弹出框
  popoverRef.value?.hide();
};
// 重置
const handleReset = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  props.searchArray.searchForm.forEach((item: any) => {
    item.val = "";
  });
  cascaderVal.value?.cascaderValRef.handleClear();
  active.value = "-10";
  emit("resetSearch");
};

// 取消
const handleCancel = () => {
  let oldData = JSON.parse(JSON.stringify(originSearchForm));
  // 遍历数据val值复制到当前
  props.searchArray.searchForm.forEach((item: SearchForm, index: number) => {
    item.val = oldData[index].val;
    // 弹出框隐藏时判断自定义组件有无默认值，没有则进行清空
    if (item.type === "customComponents") {
      if (!oldData[index].val.length) {
        cascaderVal.value?.cascaderValRef.handleClear();
      }
    }
  });

  // 关掉popover
  popoverRef.value?.hide();
  emit("onCancel");
};

// popover隐藏回调
const hideSearch = () => {
  handleCancel();
};

defineExpose({
  resetForm: () => handleReset(formRef.value)
});

// 获取时间选择去快捷键,
/**
 * 1. 优先返回默认没有的
 * 2. 如果有传入自定义快捷键
 * 3. 返回默认快捷键
 */
const getShortCuts = (item: Record<string, any>) => {
  if (!item.hasShortcuts) return [];
  else if (item.shortcuts) return item.shortcuts;
  return [
    {
      text: "最近一周",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        return [start, end];
      }
    },
    {
      text: "最近一月",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        return [start, end];
      }
    },
    {
      text: "最近三月",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        return [start, end];
      }
    }
  ];
};

const onSelectChange = (val: any, item: Record<string, any>) => {
  emit("change", item);
};
</script>

<style lang="less" scoped>
.search-list {
  .search-list-btn {
    display: flex;
    align-items: center;
    font-size: 12px;

    li.btn {
      text-align: center;
      min-width: 50px;
      line-height: 22px;
      background: #eeeeee;

      margin: 0 6px;
      border-radius: 4px;
      padding: 0 6px;
      color: #666666;
      &:hover {
        cursor: pointer;
      }
    }
    li.is-active {
      background: #f0f9eb;
      color: #23b08a;
    }
    li.funnel-search {
      min-width: 10px;
      background: none;
      .search-icon {
        display: flex;
        align-items: center;
        color: #666666;
        position: relative;
        em.circle-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          width: 20px;
          height: 20px;
          line-height: 20px;
          border-radius: 4px;
          background: #ff0000;
          color: #fff;
          top: -12px;
          right: -14px;
          font-weight: 700;
          text-align: center;
          border-radius: 50%;
          transform: scale(0.75);
        }
      }
      .search-text {
        margin-left: 4px;
      }

      .icon-sousuo {
        font-size: 14px;
        color: #666666;
        &:hover {
          color: #23b08a;
        }
      }
      .icon-sousuo:hover:before {
        color: #23b08a;
      }
      .currentShow {
        color: #23b08a;
      }
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
<style lang="less">
.form-search-popover {
  padding: 20px 0 !important;
  padding-bottom: 10px !important;

  .form-search-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 20px 0 10px;
    .form-list {
      width: 50%;
      display: flex;
      align-items: center;
      .el-form-item__label {
        height: auto;
      }
    }
    .form-list-date {
      width: 100%;
    }
    .el-select__tags-text {
      justify-content: left;
      max-width: 44px !important;
    }
    .el-select__tags {
      max-width: 126px !important;
    }
    .date-month {
      width: 50%;
      .el-input__inner {
        font-size: 12px;
      }
    }
  }
  .el-select-v2__placeholder {
    font-size: 12px;
  }
  .el-select-v2__suffix {
    transform: none;
    top: 0;
  }
  .search-opation {
    text-align: right;
    border-top: 1px solid #e8e8e8;
    padding: 10px 20px 0px 20px;
    .el-button {
      width: 70px;
    }
  }
}
</style>
