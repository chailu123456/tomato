<template>
  <el-dialog
    :title="title"
    ref="handleperson"
    custom-class="position-dialog"
    v-model="visible"
    :before-close="() => beforeClose('close')"
    :append-to-body="true"
    width="600px"
  >
    <div class="load-container" v-if="!allPeople">
      <div class="load"></div>
    </div>
    <div v-else>
      <el-input placeholder="输入姓名查找" v-model="filterName"></el-input>
      <el-scrollbar height="400px">
        <el-tree
          @check="handleCheckBoxEventByText"
          node-key="id"
          default-expand-all
          show-checkbox
          :check-strictly="checkStrictly"
          :data="allPeople"
          :default-checked-keys="checkedKeys"
          :filter-node-method="filterNode"
          @check-change="onCheckChange"
          ref="keywordTreeRef"
        ></el-tree>
      </el-scrollbar>
    </div>
    <div>
      <el-divider direction="vertical"></el-divider>
    </div>
    <div>
      <el-scrollbar height="400px">
        <div v-for="(item, index) in selectPerson" :key="index" class="current-checked-nodes">
          <el-button icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
          <el-icon v-if="item.isNew || props.isOldOneShowClose" @click="deleteCheckedKeys(item, index)"><Close /></el-icon>
        </div>
      </el-scrollbar>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click.stop="handleShadow">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { getDepartmentListPeople } from "@/api/request-modules/common";
import { ElLoading } from "element-plus";
import { defineProps, ref, nextTick, watch, PropType, reactive, defineEmits } from "vue";
import { BackLogItemInter } from "@/composables/useDashboard";
import { Close } from "@element-plus/icons";

export default {
  name: "handlePerson"
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["update:visible", "submit"]);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object as PropType<BackLogItemInter | Record<string, any>>,
    default: () => ({})
  },
  checkStrictly: {
    type: Boolean,
    default: true
  },
  disabledNode: {
    // 禁止节点
    type: Boolean,
    default: false
  },
  onlyEmployee: {
    // 仅获取员工，不获取部门
    type: Boolean,
    default: false
  },
  isRadio: {
    // 单选
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "添加成员"
  },
  isOldOneShowClose: {
    // 是否传进来的数据能否删除
    type: Boolean,
    default: true
  }
});

const filterName = ref("");
const allPeople = ref();
const handleperson = ref();
let loading: any;
const originalPersons: Record<string, any> = [];
let checkedId = ref<number>();
// 协作者选中列表id
let checkedKeys: any = ref([]);
// 协作者人员列表列表
let selectPerson = ref<Array<Record<string, any>>>([]);
const keywordTreeRef = ref();
const formParams: any = reactive({
  department: [],
  team_worker: []
});

watch(
  () => props.visible,
  async (newValue) => {
    filterName.value = "";
    if (newValue) {
      await getPeople();

      if (props.item.id) {
        const { department, participant } = props.item;

        const l1 = department?.map((i: { staff_no: string }) => i.staff_no);
        const l2 = participant?.map((i: { staff_no: string }) => i.staff_no);
        checkedKeys.value.length = 0;
        selectPerson.value.length = 0;
        checkedKeys.value.push(...l1, ...l2);
        const l3: Record<string, any>[] = [];
        const l4: Record<string, any>[] = [];
        department.forEach((i: { staff_no: string; staff_name: string }) => {
          const { staff_no, staff_name } = i;
          l3.push({
            staff_name,
            staff_no,
            is_department: true
          });
        });
        participant.forEach((i: { staff_no: string; staff_name: string }) => {
          const { staff_no, staff_name } = i;
          l4.push({
            staff_name,
            staff_no,
            is_department: false
          });
        });
        selectPerson.value.push(...l3, ...l4);
        // 原始数据
        originalPersons.push(...l3, ...l4);
      }
      loading = ElLoading.service({
        fullscreen: false,
        target: handleperson.value.dialogRef,
        customClass: "handlePersonFullScreen"
      });
    } else {
      loading?.close();
    }
  }
);
watch(
  () => filterName.value,
  (newValue) => {
    keywordTreeRef?.value.filter(newValue);
  }
);

const dataReverse = (people: Array<Record<string, any>>) => {
  let newArr = [];
  for (let i = 0; i < people.length; i += 1) {
    let obj: Record<string, any> = {};
    obj.id = people[i].id;
    obj.label = people[i].label;
    obj.is_department = people[i].is_department;
    obj.disabled = props.disabledNode && people[i].is_department;

    if (people[i].children && people[i].children.length) {
      obj.children = dataReverse(people[i].children);
    }
    newArr.push(obj);
  }
  return newArr;
};

const getPeople = () => {
  getDepartmentListPeople().then((res: any) => {
    allPeople.value = dataReverse(res.data);
    loading.close();
  });
};

// 是否为新添加人员
const hasNewPerson = (staff_no: string) => {
  return !originalPersons.map((item: Record<string, any>) => item.staff_no).includes(staff_no);
};

// 文字搜索时候点击的
const handleCheckBoxEventByText = (checkedNodes: Record<string, any>, checkedKeys: Record<string, any>) => {
  // 单选
  if (props.isRadio) {
    if (!checkedKeys.checkedKeys.length) {
      selectPerson.value = [];
    } else {
      const { id: staff_no, label: staff_name, is_department } = checkedNodes;
      selectPerson.value = [{ staff_name, staff_no, is_department, isNew: hasNewPerson(staff_no) }];
    }
  } else if (props.onlyEmployee) {
    // 只选择员工
    const allCheckNodes = keywordTreeRef?.value.getCheckedNodes();

    if (Array.isArray(allCheckNodes)) {
      const employees = allCheckNodes.filter((item) => !item.is_department);
      selectPerson.value = employees.map((item) => {
        return {
          staff_name: item.label,
          staff_no: item.id,
          is_department: false,
          isNew: hasNewPerson(item.id)
        };
      });
    }
  } else {
    let ids = ref<string[]>([]);
    selectPerson.value.forEach((item) => {
      ids.value.push(item.staff_no);
    });
    const isTrue = ids.value.includes(checkedNodes.id);
    if (isTrue) {
      selectPerson.value.forEach((item, index) => {
        if (item.staff_no === checkedNodes.id) {
          selectPerson.value.splice(index, 1);
        }
      });
    } else {
      selectPerson.value.push({
        staff_name: checkedNodes.label,
        staff_no: checkedNodes.id,
        is_department: checkedNodes.is_department,
        isNew: hasNewPerson(checkedNodes.id)
      });
    }
  }
};

//成员 搜索 过滤
const filterNode = (value: any, data: any) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

// 删除成员
const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
  selectPerson.value.splice(index, 1);
  nextTick(() => {
    keywordTreeRef?.value.setCheckedKeys(selectPerson.value.map((v) => v.staff_no));
  });
};

// 添加协作者弹框---确定
const handleShadow = async () => {
  formParams.team_worker = [];
  formParams.department = [];
  checkedKeys.value = [];
  if (selectPerson.value && selectPerson.value.length) {
    selectPerson.value.forEach((item) => {
      if (item.is_department) {
        formParams.department.push(item.staff_no * 1);
      } else {
        formParams.team_worker.push(item.staff_no);
      }
      checkedKeys.value.push(item.staff_no);
    });
  }
  beforeClose();
  const form = { selectPerson: Object.assign([], selectPerson.value), ...Object.assign({}, formParams) };
  emit("submit", form);
};

const beforeClose = (action?: string) => {
  if (action === "close") {
    checkedKeys.value.length = 0;
    selectPerson.value.length = 0;
  }
  emit("update:visible", false);
};

// node 变化
const onCheckChange = (data: any, checked: any, node: any) => {
  if (!props.isRadio) return;
  if (checked) {
    checkedId.value = data.id;
    keywordTreeRef?.value.setCheckedKeys([data.id]);
  } else {
    if (checkedId.value === data.id) {
      keywordTreeRef?.value.setCheckedKeys([]);
    }
  }
};
</script>

<style lang="less">
.position-dialog {
  .el-dialog__body {
    position: relative;
    display: flex;
    div {
      &:nth-child(1) {
        flex: 2;
      }
      &:nth-child(2) {
        .el-divider--vertical {
          height: 100%;
        }
      }
      &:nth-child(3) {
        flex: 2;
      }
    }
    .current-checked-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 20px;

      i {
        cursor: pointer;
        &:hover {
          color: @rp-color-danger;
        }
      }
    }

    .el-input--small .el-input__inner {
      line-height: 32px;
      height: 32px;
    }
  }
}
.handlePersonFullScreen {
  z-index: 3500 !important;
}
</style>
