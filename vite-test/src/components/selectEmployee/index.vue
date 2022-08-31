<script lang="tsx">
import { defineComponent, PropType, Ref, ref } from "vue";
import { store } from "../../store";

export default defineComponent({
  name: "selectEmployee",
  props: {
    title: {
      type: String as PropType<string>,
      default: "提示"
    },
    dialogVisible: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emit: ["close"],
  setup(props, { emit }) {
    const dialogVisible = ref<boolean>(false);
    const selectLists = ref([]);
    let result: Ref<Array<Record<string, any>>> = ref([]);
    store.state.employeeLists.forEach(({ staff_name, staff_no }) => {
      result.value.push({
        label: staff_name,
        key: staff_no,
        disabled: false
      });
    });
    // 搜索过滤方法
    const filterMethod = (query: any, item: any) => {
      return item.label.indexOf(query) > -1;
    };
    const handleConfirmSave = () => {
      dialogVisible.value = false;
      emit("close", selectLists);
    };
    return () => {
      return (
        <el-dialog
          title={props.title}
          v-model={dialogVisible}
          width="30%"
          v-slots={{
            footer: () => {
              return (
                <span class="dialog-footer">
                  <el-button>取 消</el-button>
                  <el-button type="primary" onClick={handleConfirmSave}>
                    确 定
                  </el-button>
                </span>
              );
            }
          }}>
          <div class="position__center">
            <el-transfer v-model={selectLists.value} data={result.value} filter-method={filterMethod} filterable filter-placeholder="请输入关键字" />
          </div>
        </el-dialog>
      );
    };
  }
});
</script>
<style scoped lang="less">
.position__center {
  position: relative;
  text-align: center;
  ::v-deep(.el-transfer) {
    text-align: left;
    display: inline-block;
  }
}
</style>
