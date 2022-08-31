import { updateDoc } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import fileSave from "@/utils/fileSave";
import useMixin from "../../useMixin";
import { reactive, ref, computed } from "vue";
import { useStore } from "@/store/index";
interface DocList {
  name: string;
  filed: string;
  canShow: boolean;
  canEdit: boolean;
  category: number;
  quote_id: number;
  demandUrl: string;
  doc: Array<{
    size: number;
    url: string;
    name: string;
    type: number;
    remark?: string;
  }>;
}
const docLists = reactive<Array<DocList>>([
  {
    name: "需求及UI说明",
    filed: "detail_design",
    canShow: true,
    canEdit: true,
    category: 1,
    quote_id: 0,
    demandUrl: "",
    doc: [
      {
        size: 0,
        url: "",
        name: "",
        type: 0,
        remark: ""
      }
    ]
  },
  // {
  //   name: "UI设计",
  //   filed: "ui_design",
  //   canShow: true,
  //   canEdit: true,
  //   category: 2,
  //   quote_id: 0,
  //   demandUrl: "",

  //   doc: [
  //     {
  //       size: 0,
  //       url: "",
  //       name: "",
  //       type: 0,
  //       remark: ""
  //     }
  //   ]
  // },
  {
    name: "接口文档",
    filed: "api",
    canShow: true,
    canEdit: true,
    category: 6,
    quote_id: 0,
    demandUrl: "",

    doc: [
      {
        size: 0,
        url: "",
        name: "",
        type: 0,
        remark: ""
      }
    ]
  },
  {
    name: "测试用例",
    filed: "test_case",
    canShow: true,
    canEdit: true,
    category: 5,
    quote_id: 0,
    demandUrl: "",
    doc: [
      {
        size: 0,
        url: "",
        name: "",
        type: 0,
        remark: ""
      }
    ]
  }
]);

export default function useUpdateDoc(tipMessage: (...args: Array<unknown>) => unknown): Record<string, unknown> {
  const { getIterationDetail } = useMixin(true);

  const dialogVisible = ref(false);
  const dialogDocInfo: any = reactive({
    title: "",
    demandUrl: "",
    doc: [
      {
        size: 0,
        url: "",
        name: "",
        type: 1,
        remark: ""
      }
    ],
    category: 0,
    quote_id: 0,
    index: 0
  });

  const store = useStore();
  const currentIter = computed(() => store.getters.currentIter);

  const handleEditDoc = (index: number) => {
    const { name, doc, quote_id, category, url } = JSON.parse(JSON.stringify(docLists[index]));
    dialogDocInfo.title = docLists[index].name;
    dialogDocInfo.doc[0].name = name;
    dialogDocInfo.doc[0].url = url;
    dialogDocInfo.doc = doc;
    if (doc[0].type === 1 || doc[0].type === 0) {
      dialogDocInfo.demandUrl = doc[0].url;
      dialogDocInfo.doc[0].type = 1;
    } else {
      dialogDocInfo.demandUrl = "";
    }
    dialogDocInfo.category = category;
    dialogDocInfo.index = index;

    dialogDocInfo.quote_id = quote_id;
    dialogVisible.value = true;
  };

  // 资料地址弹窗确定
  const handleConfirmChange = (type: number) => {
    // dialogId
    if (type === 2) dialogDocInfo.demandUrl = "";
    const params = {
      quote_id: dialogDocInfo.quote_id,
      category: dialogDocInfo.category,
      url: type === 2 ? dialogDocInfo.doc[0].url : dialogDocInfo.demandUrl,
      name: type === 2 ? dialogDocInfo.doc[0].name : "",
      size: type === 2 ? dialogDocInfo.doc[0].size : 0,
      type: dialogDocInfo.doc[0].type
    };
    if (type === 1) {
      dialogDocInfo.doc = [
        {
          size: 0,
          url: "",
          name: "",
          type: 1,
          remark: ""
        }
      ];
      if (!params.url) {
        tipMessage(400, "需求链接不能为空！");
        return;
      }
    }
    if (type === 2) {
      if (!params.url && !params.size) {
        tipMessage(400, "需求链接或需求文件不能为空！");
        return;
      }
    }

    updateDoc<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
      tipMessage(res.code);
      // 替换为当前设置的
      docLists[dialogDocInfo.index].doc = dialogDocInfo.doc;
      dialogVisible.value = false;
      getIterationDetail(currentIter.value?.id);
    });
  };
  //#endregion
  const handleDownloadDoc = (detail: Record<string, any>) => {
    const { url, name } = detail;
    fileSave(name, url);
  };
  return {
    docLists,
    handleConfirmChange,
    handleEditDoc,
    dialogDocInfo,
    dialogVisible,
    handleDownloadDoc
  };
}
