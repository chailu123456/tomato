import { nextTick, ref, unref, reactive, watch } from "vue";
import { RequestParams } from "@/types/request";
const isShowIteration = ref<boolean>(false);
const checkBoxStatus = ref(false);
const title = ref("新增迭代");
const checkAddress = (rule: Array<unknown>, value: string, callback: (...args: Array<unknown>) => void): void => {
  const reg = /https:\/\/qyapi.weixin.qq.com\/cgi-bin\/webhook\/send\?key=(\w|\d|-){1,}/g;
  if (!value) {
    callback();
  } else if (!reg.test(value)) {
    callback(new Error("格式错误，正确格式为 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key="));
  } else {
    callback();
  }
};

const rules: any = ref({
  plan_id: [{ required: true, message: "请选择产品计划", trigger: "change" }],
  "iteration_manager.staff_name": [{ required: true, message: "请选择产品负责人", trigger: "change" }],
  "backend_manager.staff_name": [{ required: true, message: "请选择后端负责人", trigger: "change" }],
  "frontend_manager.staff_name": [{ required: true, message: "请选择前端负责人", trigger: "change" }],
  "test_manager.staff_name": [{ required: true, message: "请选择测试负责人", trigger: "change" }],
  name: [{ required: true, message: "请输入迭代名称", trigger: "blur" }],
  dev_time: [{ required: true, message: "请选择开发时间", trigger: "change" }],
  union_time: [{ required: true, message: "请选择联调时间", trigger: "change" }],
  test_time: [{ required: true, message: "请选择测试时间", trigger: "change" }],
  release_time: [{ required: true, message: "请选择发版时间", trigger: "change" }],
  notify_url: [
    {
      validator: checkAddress,
      trigger: "blur",
      required: false
    }
  ]
});
const noRules = {
  plan_id: [{ required: true, message: "请选择产品计划", trigger: "change" }],
  "iteration_manager.staff_name": [{ required: true, message: "请选择产品负责人", trigger: "change" }],
  "backend_manager.staff_name": [{ required: true, message: "请选择后端负责人", trigger: "change" }],
  "frontend_manager.staff_name": [{ required: true, message: "请选择前端负责人", trigger: "change" }],
  "test_manager.staff_name": [{ required: true, message: "请选择测试负责人", trigger: "change" }],
  name: [{ required: true, message: "请输入迭代名称", trigger: "blur" }],
  notify_url: [
    {
      validator: checkAddress,
      trigger: "blur",
      required: false
    }
  ]
};
const isRules = {
  plan_id: [{ required: true, message: "请选择产品计划", trigger: "change" }],
  "iteration_manager.staff_name": [{ required: true, message: "请选择产品负责人", trigger: "change" }],
  "backend_manager.staff_name": [{ required: true, message: "请选择后端负责人", trigger: "change" }],
  "frontend_manager.staff_name": [{ required: true, message: "请选择前端负责人", trigger: "change" }],
  "test_manager.staff_name": [{ required: true, message: "请选择测试负责人", trigger: "change" }],
  name: [{ required: true, message: "请输入迭代名称", trigger: "blur" }],
  dev_time: [{ required: true, message: "请选择开发时间", trigger: "change" }],
  union_time: [{ required: true, message: "请选择联调时间", trigger: "change" }],
  test_time: [{ required: true, message: "请选择测试时间", trigger: "change" }],
  release_time: [{ required: true, message: "请选择发版时间", trigger: "change" }],
  notify_url: [
    {
      validator: checkAddress,
      trigger: "blur",
      required: false
    }
  ]
};
export type RuleForm = HTMLElement & {
  resetFields: () => void;
  validate: (valid: any) => void;
  clearValidate: () => void;
};
const formData = reactive<RequestParams.CreateIteration & { version: string }>({
  // 提醒地址新增
  notify_url: "",
  // 后端负责人
  backend_manager: {
    staff_name: null,
    staff_no: null
  },
  // 开发时间
  dev_time: null,
  // 前端负责人
  frontend_manager: {
    staff_name: null,
    staff_no: null
  },
  // 迭代版本号
  id: null,
  // 计划版本号
  version: "",
  // 产品负责人
  iteration_manager: {
    staff_name: null,
    staff_no: null
  },
  // 迭代名称
  name: "",
  // 是否排期
  is_schedule: 0,
  // 计划id
  plan_id: null,
  // 发版时间
  release_time: null,
  // 测试负责人
  test_manager: {
    staff_name: null,
    staff_no: null
  },
  // 提测时间
  test_time: null,
  // 联调时间
  union_time: null
});
const hasTime = ref(false);

export default function useAddOrEditDIalogForm(): Record<string, any> {
  const ruleFormRef = ref<RuleForm | null>(null);
  const reset = () => {
    ruleFormRef.value?.clearValidate();
    ruleFormRef.value?.resetFields();
  };
  watch(
    () => isShowIteration.value,
    (newValue) => {
      if (!newValue) {
        reset();
      }
    }
  );
  watch(
    () => checkBoxStatus,
    (newValue) => {
      if (newValue) {
        rules.value = noRules;
      } else {
        rules.value = isRules;
      }
    }
  );
  const handleChangeDialogStatus = (isCancel: boolean, rawData: Record<string, any>) => {
    if (isCancel === true) {
      isShowIteration.value = false;
      return;
    }
    // 新增
    if (!rawData) {
      hasTime.value = false;
      title.value = "新增迭代";
      formData.is_schedule = 0;
      formData.release_time = "";
      formData.dev_time = "";
      formData.union_time = "";
      formData.test_time = "";
      const pickField = ["backend_manager", "frontend_manager", "iteration_manager", "test_manager"];
      pickField.forEach((field: string) => {
        (formData as { [key: string]: any })[field].staff_no = "";
      });
    } else {
      title.value = "修改迭代";
      nextTick(() => {
        const {
          backend_manager,
          dev_time,
          frontend_manager,
          id,
          iteration_manager,
          name,
          plan,
          release_time,
          test_manager,
          test_time,
          union_time,
          notify_url,
          is_schedule,
          plan: { version }
        } = unref(rawData);
        formData.notify_url = notify_url;
        formData.version = version;
        formData.backend_manager.staff_name = backend_manager.staff_name;
        formData.backend_manager.staff_no = backend_manager.staff_no;
        formData.dev_time = dev_time;
        formData.frontend_manager.staff_name = frontend_manager.staff_name;
        formData.frontend_manager.staff_no = frontend_manager.staff_no;
        formData.id = id;
        formData.iteration_manager.staff_name = iteration_manager.staff_name;
        formData.iteration_manager.staff_no = iteration_manager.staff_no;
        formData.name = name;
        formData.is_schedule = is_schedule;
        formData.plan_id = plan.id;
        formData.release_time = release_time;
        formData.test_manager.staff_name = test_manager.staff_name;
        formData.test_manager.staff_no = test_manager.staff_no;
        formData.test_time = test_time;
        formData.union_time = union_time;
        hasTime.value = is_schedule ? true : false;
        checkBoxStatus.value = is_schedule ? false : true;
      });
    }
    isShowIteration.value = true;
  };

  return {
    reset,
    formData,
    ruleFormRef,
    title,
    rules,
    handleChangeDialogStatus,
    isShowIteration,
    hasTime,
    checkBoxStatus
  };
}
