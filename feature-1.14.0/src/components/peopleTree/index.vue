<template>
  <div>
    <el-dialog title="添加成员" custom-class="position-dialog" v-model="dialogShadow" :append-to-body="true" width="60%">
      <div class="load-container" v-if="!allPeople">
        <div class="load"></div>
      </div>
      <div v-else>
        <el-input placeholder="输入姓名查找" v-model="filterText"> </el-input>
        <el-scrollbar height="400px">
          <el-tree
            @check="handleCheckBoxEventByText"
            node-key="id"
            default-expand-all
            show-checkbox
            :check-strictly="false"
            :data="allPeople"
            :default-checked-keys="checkedKeys"
            :filter-node-method="filterNode"
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
            <el-button size="medium" icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
            <el-icon style="margin-right: 10px" class="el-icon-close" @click="deleteCheckedKeys(item, index)">
              <Close />
            </el-icon>
          </div>
        </el-scrollbar>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!dialogShadow" @click="handleShadow">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, ref, watch, computed } from "vue";
import { getDepartmentListPeople } from "@/api/request-modules/common";
import { getStaffDetail } from "@/api/request-modules/product";
import { Close } from "@element-plus/icons";

interface Staff {
  staff_name?: string | undefined;
  staff_no?: string | undefined;
}
export default defineComponent({
  name: "peopleTree",
  components: { Close },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    staff: {
      type: Object as PropType<Staff>
    }
  },
  setup(props, { emit }) {
    const dialogShadow = ref(true);
    const filterText = ref();
    const keywordTreeRef = ref();
    // 默认选中的id
    let checkedKeys = computed(() => [props.staff?.staff_no]);
    // 成员列表
    const allPeople = ref();
    // 人员列表列表
    let selectPerson = ref<Array<Record<string, any>>>([]);
    if (props.staff && props.staff.staff_name) {
      selectPerson.value = [props.staff];
    }
    watch(
      () => filterText.value,
      (newValue) => {
        console.log(newValue);
        keywordTreeRef?.value.filter(newValue);
      }
    );
    watch(
      () => dialogShadow.value,
      (newValue) => {
        emit("dialogShadow", newValue);
      },
      { immediate: true }
    );
    // 文字搜索时候点击的
    const handleCheckBoxEventByText = async (checkedNodes: Record<string, any>) => {
      console.log(checkedNodes);
      let ids = ref<string[]>([]);
      selectPerson.value.forEach((item) => {
        ids.value.push(item.staff_no);
      });
      if (checkedNodes.id === "0") {
        selectPerson.value = [{ staff_name: checkedNodes.label, staff_no: checkedNodes.id }];
      } else {
        await getStaffDetail({ staff_no: checkedNodes.id }).then((res: any) => {
          if (res.data) {
            const name = res.data.job_path + "/" + res.data.staff_name;
            selectPerson.value = [{ staff_name: name, staff_no: checkedNodes.id }];
          }
        });
      }

      // console.log(keywordTreeRef?.value.getCheckedNodes(), "---getCheckedNodes----");
      // console.log("选中值")
      keywordTreeRef?.value.setCheckedKeys([checkedNodes.id]);
    };
    // 删除成员
    const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
      selectPerson.value.splice(index, 1);
      nextTick(() => {
        keywordTreeRef?.value.setCheckedKeys(selectPerson.value.map((v) => v.staff_no));
      });
    };
    const dataReverse = (people: Array<Record<string, any>>) => {
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].id;
        obj.label = people[i].label;
        obj.is_department = people[i].is_department;
        obj.disabled = true;
        if (people[i].children && people[i].children.length) {
          obj.children = dataReverse(people[i].children);
        } else {
          obj.disabled = false;
        }
        newArr.push(obj);
      }
      return newArr;
    };

    //成员 搜索 过滤
    const filterNode = (value: any, data: any) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };

    // 弹框---确定
    const handleShadow = async () => {
      emit("personMsg", selectPerson.value[0]);
      dialogShadow.value = false;
    };

    const getPeople = async () => {
      await getDepartmentListPeople().then((res: any) => {
        const c = {
          id: "0",
          label: "外部",
          is_department: true,
          children: []
        };
        res.data.unshift(c);
        allPeople.value = dataReverse(res.data);
      });
    };

    getPeople();
    return {
      dialogShadow,
      keywordTreeRef,
      props,
      allPeople,
      selectPerson,
      deleteCheckedKeys,
      handleCheckBoxEventByText,
      handleShadow,
      checkedKeys,
      filterText,
      filterNode
    };
  }
});
</script>
<style lang="less">
.position-dialog {
  .el-dialog__body {
    position: relative;
    display: flex;
    div {
      &:nth-child(1) {
        flex: 0 0 48%;
      }
      &:nth-child(2) {
        .el-divider--vertical {
          height: 100%;
        }
      }
      &:nth-child(3) {
        flex: 0 0 48%;
      }
    }
    .current-checked-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      i {
        cursor: pointer;
        &:hover {
          color: @rp-color-danger;
        }
      }
    }
  }
  .load-container {
    transform: scale(0.2);
    width: 200px;
    height: 200px;
    position: relative;
    margin: 60px auto;
  }

  .load {
    width: 150px;
    height: 150px;
    border: 20px solid #f3f3f3;
    border-top: 20px solid #0dc5c1;
    border-radius: 50%;
    animation: loading 1.2s infinite linear;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
