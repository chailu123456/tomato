<template>
  <div class="container">
    <div>
      <div class="rp-test__pageTitle">
        <back-btn></back-btn>
        <el-divider style="margin: 0 20px" direction="vertical"></el-divider>
        <el-button>{{ demandDetail.id }}</el-button>
        &nbsp;
        <span class="demand-name">{{ demandDetail.name }}</span>
        <div class="f-r">
          <el-button type="primary" :disabled="handleDisable(demandDetail)" @click="handleEditDemand">编 辑</el-button>
          <el-button type="primary" @click="handleAddDemand">新增需求</el-button>
        </div>
      </div>
      <div class="rp-test__desc">
        <el-row :gutter="10" class="rp-test__descFullHeight">
          <el-col :span="18">
            <div class="grid-content__left">
              <el-row :gutter="10" class="rp-test__descFullHeight">
                <el-col :span="24">
                  <el-card class="grid-content__left--top rp-test__descFullHeight" id="rp-demand__detail">
                    <h4>需求描述</h4>
                    <!-- <el-scrollbar height="450px"> -->
                    <span v-html="demandDetail.description"></span>
                    <!-- </el-scrollbar> -->
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content__right">
              <el-row :gutter="10">
                <el-col :span="24">
                  <el-card class="grid-content__right--top">
                    <el-descriptions title="" :column="1">
                      <el-descriptions-item label-class-name="label-title" label="收集时间">{{ demandDetail.collect_time || "-" }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="需求优先级">{{
                        PRIORITY[demandDetail.level - 1].value || "-"
                      }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="需求状态">{{ getStatus(demandDetail.status) }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="关联迭代">{{ demandDetail.iteration_name || "-" }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="所属模块">{{ demandDetail.product_module_name || "-" }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="需求类型">{{ handleType(demandDetail.type) }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="来源方">{{
                        demandDetail.origin_path ? demandDetail.origin_path : demandDetail.origin
                      }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="来源备注">{{ demandDetail.origin_remark || "-" }}</el-descriptions-item>
                    </el-descriptions>
                  </el-card>
                </el-col>
                <el-col :span="24">
                  <el-card class="grid-content__right--bottom">
                    <h4 style="margin-top: 0">操作记录</h4>
                    <el-scrollbar height="350px">
                      <ul v-if="demandDetail.list.length">
                        <li v-for="(item, index) in demandDetail.list" :key="index">
                          {{ item.create_time }}
                          <br />
                          <span v-html="item.info"></span>
                        </li>
                      </ul>
                      <el-empty v-else :image-size="100" description="暂无数据"></el-empty>
                    </el-scrollbar>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="rp-child-demand" v-if="demandDetail.child_list.length">
        <el-row :gutter="10" class="rp-test__descFullHeight">
          <el-col :span="18">
            <div class="grid-content__left">
              <el-row :gutter="10" class="rp-test__descFullHeight">
                <el-col :span="24">
                  <el-card class="grid-content__left--top rp-test__descFullHeight">
                    <h4 style="margin-top: 0; float: left">子需求</h4>
                    <div class="f-r">
                      <!-- <el-button type="primary" v-if="demandDetail.status != 999" @click="handleAddChildDemand">+ 子需求</el-button> -->
                    </div>
                    <el-table :data="demandDetail.child_list" style="width: 100%">
                      <el-table-column prop="id" label="ID" width="100"> </el-table-column>
                      <el-table-column prop="name" class-name="table-column-left" label="描述"> </el-table-column>
                      <el-table-column prop="level" label="优先级" width="100">
                        <template #default="scope">
                          <span>{{ PRIORITY[scope.row.level].value }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" width="100" label="操作">
                        <template #default="scope">
                          <!-- <el-button type="text" @click="handleEditChild(scope.row)">编辑</el-button> -->
                          <el-button
                            :class="[demandDetail.status === 999 ? '' : 'delete']"
                            :disabled="demandDetail.status === 999"
                            type="text"
                            @click="handleDeleteChild(scope.row.id)"
                            >删除</el-button
                          >
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="rp-child-demand-upload">
        <el-row :gutter="10" class="rp-test__descFullHeight">
          <el-col :span="18">
            <el-card>
              <h4>
                附件
                <i class="el-icon-paperclip"></i>
              </h4>
              <ul>
                <li v-for="(item, index) in demandDetail.attachment" :key="index" @click="handleDownload(item.title, item.addr)">
                  <i class="el-icon-document" style="color: #1f9f85"></i>
                  &nbsp;
                  <el-button type="text">{{ item.title }}({{ item.size }}kb)</el-button>
                </li>
              </ul>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="630px" center>
      <div class="add-demand" v-if="dialogTitle === '新增子需求'">
        <el-button class="f-r" @click="handleCreateChildDemand">增加</el-button>
        <div class="f-r demand-child-list">
          <li v-for="(item, index) in childList" :key="index">
            <div>
              <span style="display: inline-block; width: 70px">子需求名称</span>
              <el-input v-model="item.name"></el-input>
            </div>
            <div>
              <span style="display: inline-block; width: 50px">优先级</span>
              <el-select class="elect-pool" v-model="item.level" placeholder="--所有--">
                <el-option v-for="it in PRIORITY" :key="it.value" :label="it.value" :value="it.id"></el-option>
              </el-select>
            </div>
            <el-button type="text" :disabled="index === 0" class="delete" @click="handleRemoveChild(index)">删 除</el-button>
          </li>
        </div>
      </div>
      <div v-else>
        <el-form :model="formParams" label-position="right" class="dialog-demand-form" label-width="100px" ref="formRef">
          <el-form-item label="优先级" prop="level">
            <el-select class="elect-pool" v-model="formParams.level" placeholder="--所有--">
              <el-option v-for="item in PRIORITY" :key="item.value" :label="item.value" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子需求名称" prop="name">
            <el-input v-model="formParams.name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="dialogVisible = false">返 回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onUpdated, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ResponseParams } from "@/types/response";
import { RequestParams } from "@/types/request";
import { getDemandDetail } from "@/api/request-modules/product";
import { PRIORITY, PLAN_STATUS } from "@/utils/contantOptions";
// import api from "@/api/dict";
import { ElMessageBox, ElMessage } from "element-plus";

import { editDemand } from "@/api/request-modules/product";
import useMessageTip from "@/composables/useMessageTip";
import fileSave from "@/utils/fileSave";
export default defineComponent({
  name: "demandPoolDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { tipMessage } = useMessageTip();
    const internalInstance = getCurrentInstance();
    const global: any = internalInstance?.appContext.config.globalProperties;

    const handleDisable = (obj: Record<any, any>) => {
      // 优先判断status=999是否作废然后判断demand_status
      //demand_status 2和3不能编辑，  3 不能作废
      if (obj.status === 999) return true;
      if (obj.demand_status === 3) return true;
      return false;
    };

    let demandDetail = reactive<RequestParams.CreateDemand>({
      // 描述
      description: "",
      // 名称
      name: "",
      status: 0,
      demand_status: 0,
      level: 1,
      type: 1,
      id: 0,
      origin: "",
      collect_time: "",
      create_by: "",
      creator: "",
      parent_id: 0,
      origin_remark: "",
      product_id: 0,
      iteration_name: "",
      list: [] as Array<Record<string, any>>,
      child_list: [] as Array<Record<string, any>>,
      attachment: [],
      product_module_id: 0,
      origin_path: "",
      product_module_name: ""
    });
    if (route.query.demand_id) {
      getdemandDetailFn(route.query.demand_id as any);
    }
    function getdemandDetailFn(id: number) {
      // 获取bug详情
      getDemandDetail<ResponseParams.ResponseDataSuccess>({ id: id }).then((res) => {
        const {
          status_list,
          child_list,
          iteration_name,
          origin_remark,
          product_module_name,
          collect_time,
          create_by,
          creator,
          origin,
          parent_id,
          product_id,
          description,
          demand_status,
          name,
          type,
          status,
          level,
          id,
          origin_path,
          attachment
        } = res.data as Record<string, any>;
        demandDetail.description = description;
        demandDetail.name = name;
        demandDetail.status = status;
        demandDetail.demand_status = demand_status;
        demandDetail.type = type;
        demandDetail.level = level;
        demandDetail.id = id;
        demandDetail.origin = origin;
        demandDetail.collect_time = collect_time;
        demandDetail.list = status_list;
        demandDetail.child_list = child_list;
        demandDetail.create_by = create_by;
        demandDetail.creator = creator;
        demandDetail.parent_id = parent_id;
        demandDetail.product_id = product_id;
        demandDetail.iteration_name = iteration_name;
        demandDetail.origin_remark = origin_remark;
        demandDetail.origin_path = origin_path ? origin_path : origin;
        demandDetail.product_module_name = product_module_name;
        attachment.forEach((v: Record<string, any>) => {
          v.size = (v.size / 1024).toFixed(2);
        });
        demandDetail.attachment = attachment;
      });
    }

    const handleBack = () => {
      router.go(-1);
    };
    const dialogVisible = ref(false);
    const dialogTitle = ref("添加子需求");
    // 编辑需求
    const handleEditDemand = () => {
      router.push({
        name: "editDemandPool",
        query: {
          demand_id: demandDetail.id
        }
      });
    };

    const handleType = (val: number) => {
      // 1.新增功能 2.产品优化 3.缺陷修复 4.政治项目 5.配合升级
      const statusObj: any = {
        1: "新增功能",
        2: "产品优化",
        3: "缺陷修复",
        4: "政治项目",
        5: "配合升级"
      };
      return statusObj[val] || "";
    };

    const getStatus = (status: number) => {
      const list = PLAN_STATUS.find((v: { value: number; label: string }) => v.value === status);
      return list?.label;
    };

    // 弹框子需求 列表
    let childList = reactive([{ name: "", level: 1 }]);

    const isEdit = ref(true);
    // 编辑单个子需求 值
    const formParams = reactive({
      name: "",
      level: 0,
      id: 0
    });
    // 弹框里边 --> 新增子需求
    const handleCreateChildDemand = () => {
      childList.push({ name: "", level: 1 });
    };
    // 新增需求
    const handleAddDemand = () => {
      router.push({ name: "editDemandPool" });
    };
    // +子需求
    const handleAddChildDemand = () => {
      isEdit.value = false;
      dialogTitle.value = "新增子需求";
      dialogVisible.value = true;
      childList[0] = { name: "", level: 1 };
    };
    // 子需求表格 -- 编辑
    const handleEditChild = (row: any) => {
      isEdit.value = true;
      formParams.name = row.name;
      formParams.level = row.level;
      formParams.id = row.id;
      dialogTitle.value = "编辑子需求";
      dialogVisible.value = true;
    };
    // 子需求表格 -- 移除
    const handleDeleteChild = (id: number) => {
      ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          demandDetail.child_list = demandDetail.child_list.filter((item: any) => item.id != id);
          editDemand<ResponseParams.ResponseDataSuccess>(demandDetail).then(() => {
            getdemandDetailFn(route.query.demand_id as any);
          });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除"
          });
        });
    };
    // 移除弹框子需求
    const handleRemoveChild = (index: number) => {
      childList.splice(index, 1);
    };
    const editDemandFn = () => {
      editDemand<ResponseParams.ResponseDataSuccess>(demandDetail).then((res) => {
        if (res.code === 200) {
          global.$message({
            message: "成功",
            type: "success"
          });
          dialogVisible.value = false;
          getdemandDetailFn(route.query.demand_id as any);
        } else {
          // 失败重新获取数据
          getdemandDetailFn(route.query.demand_id as any);
        }
      });
    };

    // 弹框 确认
    const handleConfirmChange = () => {
      if (isEdit.value) {
        if (!formParams.name) return tipMessage(400, "请输入子需求名称");
        demandDetail.child_list.forEach((item: any) => {
          if (item.id === formParams.id) {
            item.name = formParams.name;
            item.level = formParams.level;
          }
        });
        editDemandFn();
      } else {
        childList.forEach((item) => {
          demandDetail.child_list.push(item);
        });
        editDemandFn();
      }
    };
    onUpdated(() => {
      const wrapper = document.getElementById("rp-demand__detail")!;
      if (!wrapper) return;
      [...wrapper.getElementsByTagName("img")].forEach((image) => {
        image.style.cursor = "pointer";
        image.onclick = () => {
          window.open(image.src);
        };
      });
    });
    // 文件下载
    const handleDownload = (title: string, url: string) => {
      if (url) {
        fileSave(title, url);
      }
    };
    return {
      route,
      demandDetail,
      handleEditDemand,
      handleAddDemand,
      handleEditChild,
      handleDeleteChild,

      dialogTitle,
      handleCreateChildDemand,
      handleAddChildDemand,
      dialogVisible,
      PRIORITY,
      PLAN_STATUS,
      getStatus,
      childList,
      handleConfirmChange,
      handleRemoveChild,
      formParams,
      handleBack,
      handleDownload,
      handleType,
      handleDisable
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding: 20px;
  height: 100%;
  .rp-project-name {
    position: absolute;
    width: 300px;
    top: 4px;
    right: 140px;
    z-index: 99;
    height: 50px;
    line-height: 50px;
    background: #fff;
    font-size: 14px;
    span {
      font-weight: 700;
      font-size: 16px;
      color: @rp-color-text-title;
    }
  }
}
.rp-test__pageTitle {
  margin-bottom: 20px;
  position: relative;
  span.demand-name {
    font-size: 18px;
    font-weight: 700;
  }
  .f-r {
    position: relative;
    // left: -40px;
    float: right;
  }
}
.rp-test__desc {
  height: 100%;
  .grid-content__left {
    height: 100%;
    box-sizing: border-box;
    // padding: 20px;
  }
  .grid-content__right {
    box-sizing: border-box;
    // padding: 20px;
  }
  .grid-content__left--top {
    margin-bottom: 20px;
  }
  .grid-content__right--bottom {
    margin-top: 20px;
    li {
      margin-bottom: 15px;
    }
  }
}
.rp-child-demand {
  margin-top: 10px;
  margin-bottom: 10px;
}
.rp-child-demand-upload {
  margin-top: 10px;
}
:deep(.el-descriptions__label) {
  display: inline-block;
  line-height: 30px;
  width: 100px;
  font-size: 14px;
}
.rp-test__descFullHeight {
  height: 100%;
}
.add-demand {
  .demand-child-list {
    width: 100%;
    margin-bottom: 30px;
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      :deep(.el-input) {
        width: 260px;
      }
      :deep(.elect-pool) {
        width: 120px;
        .el-input {
          width: 100%;
        }
      }
      .delete {
        color: @rp-color-danger;
      }
    }
  }
}
.dialog-demand-form {
  :deep(.el-form-item) {
    display: flex;
    align-items: center;
    .el-form-item__content {
      width: 80%;
    }
  }
}
img {
  cursor: pointer;
}
</style>
