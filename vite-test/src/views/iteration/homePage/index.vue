<template>
  <div class="container grid-container">
    <section>
      <el-card shadow="always">
        <div class="flow-schedule">
          <progress-bar></progress-bar>
        </div>
        <div class="progress">
          <div class="progress-item" v-for="item in 3" :key="item">
            <p>项目进度</p>
            <p>
              <span class="progress-item__progressText">35%</span>
              <i class="el-icon-top progress-item__progressText--up"></i>
              <span class="progress-item__progressText--up">10%</span>
            </p>
            <p>时间进度<span>40%</span>,落后<span class="progress-item__progressText--down">5%</span></p>
            <div class="progress-item__icon"></div>
          </div>
        </div>
      </el-card>
    </section>
    <section>
      <el-card shadow="always">
        <div v-for="(item, index) in btn_groups" :key="index" class="btn-groups">
          <el-button class="btn-groups__button" :class="item.class" plain :type="item.type" @click="item.event">{{ item.name }}</el-button>
        </div>
      </el-card>
    </section>
    <section>
      <el-card shadow="always">
        <span>基础信息</span>
        <div class="basic-info">
          <div>
            <span>版本号: </span>
            <span>FFFFFF/v1.0</span>
          </div>
          <div>
            <span>迭代名称: </span>
            <span>配置管理</span>
          </div>
          <div>
            <span>所属项目: </span>
            <span>TOMATO</span>
          </div>
          <div>
            <span>关联计划: </span>
            <span>tomato二期</span>
          </div>
          <div>
            <div class="basic-info__wrapper" v-for="(item, index) in 5" :key="index">
              <div class="basic-info__avatar">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYrqFDY_pIOqJS7BEuURIrPBgX3ykUnHPFqw&usqp=CAU" alt="" />
              </div>

              <div class="basic-info__person">
                <p>东厂曹公公</p>
                <p class="basic-info__job">太监总管</p>
              </div>
            </div>
          </div>
          <div>
            <span>风险备注：</span>
            <span>大江东去浪淘尽，千古风流人物，故垒西边，人道是三国周郎赤壁，乱石穿空惊涛拍岸</span>
          </div>
        </div>
      </el-card>
    </section>
    <section>
      <el-card shadow="always">
        <span>迭代内容</span>
        <ol class="iteration-content">
          <li>
            应用配置管理
            <ol>
              <li>应用列表</li>
              <li>应用详情</li>
            </ol>
          </li>
          <li>全局变量管理</li>
          <li>环境变量管理</li>
        </ol>
      </el-card>
    </section>
    <section>
      <el-card shadow="always" class="assets">
        <span>资料地址</span>
        <div v-for="(item, index) in docLists" :key="index">
          <span>{{ item.name }}: </span>
          <el-button type="text">
            <a :href="item.url" target="_black">查看</a>
          </el-button>
          <el-button type="text" @click="handleEditDoc(index)">编辑</el-button>
        </div>
      </el-card>
    </section>
    <section>
      <createIterationDialog ref="dialogRef" />
    </section>
    <section>
      <employee-management />
    </section>
    <section>
      <projectManagement />
    </section>
    <!-- 资料地址编辑 -->
    <el-dialog :title="title" v-model="dialogVisible" width="30%" center>
      <el-form class="demo-form-inline">
        <el-form-item label="地址">
          <el-input v-model="address" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue";
// import router from "@/router";
import EmployeeManagement from "./components/employeeManagement.vue";
import createIterationDialog from "./components/createIterationDialog.vue";
import projectManagement from "./components/projectManagement.vue";
import useUpdateDoc from "./composables/useUpdateDoc";
import useMixin from "../useMixin";

export default defineComponent({
  components: {
    EmployeeManagement,
    projectManagement,
    createIterationDialog
  },
  setup() {
    // // 编辑迭代
    // const handleEditEvent = () => {
    //   alert(1);
    // };
    // // 修改迭代
    // const handleChangeEvent = () => {
    //   alert(2);
    // };
    // // 迭代工单
    // const handleToTestApplication = () => {
    //   router.push({ path: "/iteration/applyTest" });
    // };
    // const handleRisk = () => {
    //   alert(2);
    // };
    // const handleCreateIteration = () => {
    //   alert(2);
    // };
    //#region  资料地址模块
    const { handleConfirmChange, handleEditDoc, dialogDocInfo, dialogVisible, docLists } = useUpdateDoc();
    //#endregion

    //#region 按钮组
    const { handleChangeDialogStatus, handleIterative, dialogRef } = useMixin(true);
    const btn_groups = [
      {
        name: "编辑迭代",
        event: () => {
          return handleChangeDialogStatus(1);
        },
        type: "primary",
        icon: "",
        class: "plain"
      },
      {
        name: "修改迭代",
        event: handleChangeDialogStatus,
        type: "success",
        icon: ""
      },
      {
        name: "迭代工单",
        event: handleIterative,
        type: "info",
        icon: ""
      },
      {
        name: "风险备注",
        event: handleChangeDialogStatus,
        type: "danger",
        icon: ""
      },
      {
        name: "新增迭代",
        event: () => {
          return handleChangeDialogStatus(0);
        },
        type: "primary",
        icon: ""
      }
    ];
    //#endregion

    return {
      dialogRef,
      handleChangeDialogStatus,
      docLists,
      handleConfirmChange,
      ...toRefs(dialogDocInfo as Record<string, unknown>),
      handleEditDoc,
      dialogVisible,
      btn_groups
    };
  }
});
</script>

<style lang="less" scoped>
.grid-container {
  display: grid;
  text-align: left;
  grid-template-columns: 40% 40% 17%;
  grid-template-rows: 450px 300px auto;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  ::v-deep(.el-card) {
    text-align: left;
    height: 100%;
  }
  .btn-groups {
    text-align: center;
    padding-top: 10px;
  }
  .btn-groups__button {
    width: 130px;
    height: 40px;
    margin-bottom: 30px;
  }
  .plain {
    background: rgba(45, 153, 255, 0.1);
    color: rgba(45, 153, 255);
  }
  .flow-schedule {
    padding-top: 50px;
    padding-bottom: 50px;
    position: relative;
    left: 50%;
    transform: translateX(-45%);
  }
  .progress {
    display: flex;
    .progress-item {
      position: relative;
      border-radius: 10px;
      box-sizing: border-box;
      padding: 30px;
      padding-top: 20px;
      text-align: left;
      flex: 0 0 30.8%;
      height: 200px;
      background: rgba(231, 248, 245);
      margin-right: 50px;
    }
    .progress-item__progressText {
      i {
        font-weight: 700;
      }
      margin-right: 20px;
      font-weight: 700;
      font-size: 30px;
    }
    .progress-item__progressText--up {
      color: rgba(31, 165, 117);
    }
    .progress-item__progressText--down {
      color: rgba(245, 64, 102);
    }
    .progress-item__icon {
      background: rgba(254, 64, 102);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-70%);
    }
    &:last-child {
      margin-right: 0;
    }
  }
  section {
    &:nth-child(1) {
      // 第一个方框左侧线在对其第一个
      grid-column-start: 1;
      grid-column-end: 3;
    }
    &:nth-child(3) {
      grid-column-start: 1;
      grid-column-end: 2;
    }
    &:nth-child(4) {
      grid-column-start: 2;
      grid-column-end: 2;
    }
    &:nth-child(7),
    &:nth-child(8) {
      grid-column-start: 1;
      grid-column-end: 4;
    }
  }
  .basic-info {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 30px 30px 80px;
    div {
      &:nth-child(5) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        grid-column-start: 1;
        grid-column-end: 3;
        .basic-info__wrapper {
          display: flex;
          align-items: center;
        }
      }
      &:nth-child(6) {
        grid-column-start: 1;
        grid-column-end: 3;
      }
      span:nth-child(1) {
        font-weight: 700;
      }
    }
    .basic-info__person {
      font-size: 12px;
      line-height: 2px;
    }
    .basic-info__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .basic-info__job {
      font-size: 12px;
      color: #999;
    }
  }
  .iteration-content {
    margin-top: 30px;
    li {
      list-style: initial !important;
    }
  }
  .assets {
    div {
      line-height: 50px;
      span:first-child {
        display: inline-block;
        width: 90px;
      }
      span:last-child {
        margin-left: 20px;
      }
    }
  }
  .demo-form-inline {
    display: flex;
    ::v-deep(.el-form-item) {
      display: flex;
      flex: 1;
    }
    ::v-deep(.el-form-item__content) {
      flex: 1;
    }
  }
}
</style>
