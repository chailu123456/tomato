import { reactive, ref } from "vue";
const docLists = reactive([
  {
    name: "需求说明",
    canShow: true,
    canEdit: true,
    id: 0,
    url: "132"
  },
  {
    name: "UI设计",
    canShow: true,
    canEdit: true,
    id: 0,
    url: ""
  },
  {
    name: "接口文档",
    canShow: true,
    canEdit: true,
    id: 0,
    url: ""
  },
  {
    name: "测试用例",
    canShow: true,
    canEdit: true,
    id: 0,
    url: ""
  }
]);

export default function useUpdateDoc(): Record<string, unknown> {
  const dialogVisible = ref(false);
  const dialogDocInfo = reactive({
    title: "",
    address: "",
    id: 0
  });

  const handleEditDoc = (index: number) => {
    const { name, url, id } = docLists[index];
    dialogDocInfo.title = name;
    dialogDocInfo.address = url;
    dialogDocInfo.id = id;
    dialogVisible.value = true;
  };
  // 资料地址弹窗确定
  const handleConfirmChange = () => {
    dialogVisible.value = false;
    // dialogId
    //   const params: RequestParams.UpdateDoc = {
    //     quote_id: Number(router.currentRoute.value.query.id),
    //     type: item.id,
    //     url: item.link
    //   };
    //   updateDoc<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    //     tipMessage(res.code);
    //   });
  };
  return {
    docLists,
    handleConfirmChange,
    handleEditDoc,
    dialogDocInfo,
    dialogVisible
  };
}
