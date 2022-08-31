export default function useBtnGroups(): Record<string, unknown> {
  // 编辑迭代
  const handleEditEvent = () => {
    alert(1);
  };
  // 修改迭代
  const handleChangeEvent = () => {
    alert(2);
  };
  // 迭代工单
  const handleToTestApplication = () => {
    alert(2);
  };
  // 风险备注
  const handleRisk = () => {
    alert(2);
  };
  // 创建迭代
  const handleCreateIteration = () => {
    alert(2);
  };
  const btn_groups = [
    {
      name: "编辑迭代",
      event: handleEditEvent,
      type: "primary",
      icon: "",
      class: "plain"
    },
    {
      name: "修改迭代",
      event: handleChangeEvent,
      type: "success",
      icon: ""
    },
    {
      name: "迭代工单",
      event: handleToTestApplication,
      type: "info",
      icon: ""
    },
    {
      name: "风险备注",
      event: handleRisk,
      type: "danger",
      icon: ""
    },
    {
      name: "新增迭代",
      event: handleCreateIteration,
      type: "primary",
      icon: ""
    }
  ];
  return {
    btn_groups,
    handleEditEvent,
    handleChangeEvent,
    handleToTestApplication,
    handleRisk,
    handleCreateIteration
  };
}
