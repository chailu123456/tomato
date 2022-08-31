<template>
  <div class="container">
    <div v-if="bugDetail.id !== null">
      <div class="rp-test__pageTitle">
        <back-btn :name="jumpName"></back-btn>
        &nbsp;
        <el-divider direction="vertical"></el-divider>
        &nbsp;
        <el-button>{{ bugDetail.id }}</el-button>
        &nbsp;
        <span>{{ bugDetail.name }}</span>
        <div class="f-r">
          <el-button type="primary" @click="handleCopy">复制</el-button>
          <el-button type="primary" @click="handleUpdateList">编辑</el-button>
          <el-button type="primary" @click="handleCreateBug">新增Bug</el-button>
        </div>
      </div>
      <div class="rp-test__desc">
        <el-row :gutter="10" class="rp-test__descFullHeight">
          <el-col :span="18">
            <div class="grid-content__left">
              <el-row :gutter="10" class="rp-test__descFullHeight">
                <el-col :span="24">
                  <el-card class="grid-content__left--top rp-test__descFullHeight" id="rp-test__detail">
                    <h4>BUG描述</h4>
                    <!-- <el-scrollbar height="450px"> -->
                    <span v-html="bugDetail.description"></span>
                    <!-- </el-scrollbar> -->
                  </el-card>
                </el-col>
                <el-col style="margin-top: 30px; margin-bottom: 50px" :span="24">
                  <el-card class="grid-content__left--bottom">
                    <h4>
                      附件
                      <i class="el-icon-paperclip"></i>
                    </h4>
                    <ul>
                      <li v-for="(item, index) in bugDetail.attachment" :key="index" @click="handleDownload(item.title, item.addr)">
                        <i class="el-icon-document" style="color: #1f9f85"></i>
                        &nbsp;
                        <el-button type="text">{{ item.title }}({{ item.size }}kb)</el-button>
                      </li>
                    </ul>
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
                      <el-descriptions-item label-class-name="label-title" width="150px" label="所属迭代">{{ bugDetail.iteration_name }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="所属环境">{{ getEnv(bugDetail.env) }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" width="150px" label="级别">{{ bugDetail.level }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="类型">{{ bugDetail.type }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="状态">
                        <span @click="handleChangeStatus(bugDetail)" class="rp-test-status"
                          ><i class="el-icon-thumb rotate-icon"></i>{{ bugDetail.status }}</span
                        >
                      </el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="指派给"
                        ><span class="rp-Table__bug" @click="handleChangeAssign(bugDetail)"
                          ><i class="el-icon-thumb rotate-icon"></i>{{ bugDetail.staff_name }}</span
                        >
                      </el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="创建人">{{ bugDetail.creator }}</el-descriptions-item>

                      <el-descriptions-item label-class-name="label-title" label="创建时间">{{ bugDetail.create_time }}</el-descriptions-item>
                      <el-descriptions-item label-class-name="label-title" label="解决时间">{{ bugDetail.end_time }}</el-descriptions-item>
                    </el-descriptions>
                  </el-card>
                </el-col>
                <el-col :span="24">
                  <el-card class="grid-content__right--bottom">
                    <el-scrollbar height="350px">
                      <ul>
                        <li v-for="(item, index) in bugDetail.list" :key="index">
                          {{ item.create_time }}
                          <br />
                          <span v-html="item.info"></span>
                        </li>
                      </ul>
                    </el-scrollbar>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 更改状态弹框 -->
    <el-dialog title="修改bug状态" v-model="statusModal" width="30%" center>
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp_rowData.status" placeholder="--所有--">
            <el-option v-for="item in BUG_STATUS_DELETE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input rows="5" show-word-limit placeholder="请输入备注" type="textarea" v-model="temp_rowData.remark" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleConfirmChange">保 存</el-button>
          <el-button @click="statusModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 更改指派弹框 -->
    <el-dialog title="修改指派" v-model="assignModal" width="30%" center>
      <el-form label-width="70px" class="rp-Dialog__bugStatus">
        <el-form-item label="指派给" prop="status">
          <el-select
            value-key="staff_no"
            filterable
            @change="handleStaff"
            collapse-tagsvalue-key="staff_no"
            v-model="assignFormData.staff_no_obj"
            placeholder="--所有--"
          >
            <!-- <el-option v-for="item in employeeLists" :key="item.staff_no" :label="item.staff_name" :value="item"> </el-option> -->
            <el-option-group v-for="group in employeeLists" :key="group.staff_no" :label="group.label">
              <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input rows="5" show-word-limit placeholder="请输入备注" type="textarea" v-model="assignFormData.remark" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" v-debounce @click="handleConfirmChangeAssign">保 存</el-button>
          <el-button @click="assignModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, onUpdated, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ResponseParams } from "@/types/response";
import { getBugDetail, updateAssignTask, updateBugStatus } from "@/api/request-modules/test";
import fileSave from "@/utils/fileSave";
import { BUG_LEVEL, BUG_STATUS, BUG_TYPE, ENVLIST } from "@/utils";
import useMessageTip from "@/composables/useMessageTip";
import { RequestParams } from "@/types/request";
import { getSession } from "@/utils/sesssion";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const jumpName = ref("test");
    let bugDetail = reactive({
      // bug描述
      description: "",
      // bug名称
      name: null,
      // 指派员工姓名
      staff_name: null,
      // 指派员工工号
      staff_no: null,
      status: "",
      level: "",
      id: null,
      type: "",
      remark: null,
      attachment: [] as Array<Record<string, any>>,
      creator: "",
      end_time: "",
      create_time: "",
      list: [] as Array<Record<string, any>>,
      // 原来的状态
      status_raw: 0,
      iteration_name: "",
      env: 0
    });
    const employeeLists: any = getSession("iterationPeopleList", true) as any;
    const unwatch = watch(
      () => route.query.bugId,
      (newValue) => {
        if (newValue) {
          getBugDetailFn(newValue as string);
        }
      }
    );
    if (route.query.bugId) {
      getBugDetailFn(route.query.bugId as string);
    }
    if (route.query.jump) {
      jumpName.value = "dashboard";
    } else {
      jumpName.value = "test";
    }
    function getBugDetailFn(bugId: string | number) {
      // 获取bug详情
      getBugDetail<ResponseParams.ResponseDataSuccess>(bugId).then((res) => {
        const {
          list,
          end_time,
          create_time,
          creator,
          remark,
          type,
          description,
          name,
          iteration_name,
          staff_name,
          staff_no,
          status,
          level,
          id,
          attachment,
          env
        } = res.data as Record<string, any>;
        bugDetail.description = description;
        bugDetail.name = name;
        bugDetail.staff_name = staff_name;
        bugDetail.staff_no = staff_no;
        bugDetail.status = BUG_STATUS.find((v) => v.value === status)!.label;
        bugDetail.status_raw = status;
        bugDetail.level = BUG_LEVEL.find((v) => v.value === level)!.label;
        bugDetail.type = BUG_TYPE.find((v) => v.value === type)!.label;
        bugDetail.id = id;
        attachment.forEach((v: Record<string, any>) => {
          v.size = (v.size / 1024).toFixed(2);
        });
        bugDetail.attachment = attachment;
        bugDetail.remark = remark;
        bugDetail.creator = creator;
        bugDetail.create_time = create_time;
        bugDetail.end_time = end_time;
        bugDetail.list = list;
        bugDetail.iteration_name = iteration_name || "主干";
        bugDetail.env = env;
      });
    }
    const handleDownload = (title: string, url: string) => {
      if (url) {
        fileSave(title, url);
      }
    };
    const handleUpdateList = () => {
      router.push({ name: "bugEdit", query: { bugId: bugDetail.id, page: route.query.page } });
    };
    const handleCreateBug = () => {
      router.push({
        name: "bugEdit",
        query: {
          page: route.query.page,
          product_id: route.query.product_id,
          currentIterationId: route.query.currentIterationId,
          currentIterationName: route.query.currentIterationName
        }
      });
    };
    const handleCopy = () => {
      const coypVal = {
        iteration_id: route.query.currentIterationId,
        level: BUG_LEVEL.find((v) => v.label === bugDetail.level)!.value,
        staff_name: bugDetail.staff_name,
        staff_no: bugDetail.staff_no,
        status: bugDetail.status,
        type: BUG_TYPE.find((v) => v.label === bugDetail.type)!.value,
        env: bugDetail.env,
        currentIterationId: route.query.currentIterationId,
        currentIterationName: route.query.currentIterationName
      };
      router.push({ name: "bugEdit", params: { coypVal: JSON.stringify(coypVal) } });
    };
    onUpdated(() => {
      const wrapper = document.getElementById("rp-test__detail")!;
      if (!wrapper) return;
      [...wrapper.getElementsByTagName("img")].forEach((image) => {
        image.style.cursor = "pointer";
        image.onclick = () => {
          window.open(image.src);
        };
      });
    });
    let temp_rowData = ref();
    const { tipMessage } = useMessageTip();
    //#region 修改状态
    const statusModal = ref(false);
    const handleChangeStatus = (row: Record<string, any>) => {
      temp_rowData.value = { ...row };
      temp_rowData.value.status = row.status_raw;
      // temp_rowData.value.status = row.status_raw;
      statusModal.value = true;
    };
    // 弹窗点击确定
    const handleConfirmChange = () => {
      updateBugStatus<ResponseParams.ResponseDataSuccess>(temp_rowData.value as RequestParams.UpdateBugStatus).then((res) => {
        if (res.code === 200) {
          tipMessage(res.code);
          getBugDetailFn(parseInt(route.query.bugId as string));
          statusModal.value = false;
        }
      });
    };
    const BUG_STATUS_DELETE = BUG_STATUS.slice().splice(1, BUG_STATUS.length);
    //#endregion
    //#region 修改指派
    const assignModal = ref(false);
    const assignFormData = reactive({
      bug_id: 0,
      remark: null,
      staff_no_obj: {
        staff_no: "",
        staff_name: ""
      } as Record<string, any>
    });
    const handleChangeAssign = (row: Record<string, any>) => {
      assignFormData.staff_no_obj = row;
      assignFormData.bug_id = row.id;
      assignModal.value = true;
    };
    let obj = {
      remark: assignFormData.remark,
      staff_no: assignFormData.staff_no_obj.staff_no,
      bug_id: 0
    };
    // 弹窗点击确定
    const handleConfirmChangeAssign = () => {
      obj.bug_id = assignFormData.bug_id;
      obj.remark = assignFormData.remark;
      updateAssignTask<ResponseParams.ResponseDataSuccess>(obj).then((res) => {
        if (res.code === 200) {
          assignModal.value = false;
          tipMessage(res.code);
          getBugDetailFn(assignFormData.bug_id);
        }
      });
    };
    const handleStaff = (name: string) => {
      const list: Record<string, any> = employeeLists[1];
      list.options.forEach((item: any) => {
        if (name === item.staff_name) {
          obj.staff_no = item.staff_no;
        }
      });
    };

    const getEnv = (type: number) => {
      const list = ENVLIST.find((v: { value: string; id: number }) => v.id === type);
      return list?.value;
    };

    //#endregion
    onUnmounted(() => {
      unwatch && unwatch();
    });
    return {
      handleDownload,
      route,
      bugDetail,
      handleUpdateList,
      handleCreateBug,
      handleConfirmChangeAssign,
      handleChangeAssign,
      temp_rowData,
      assignModal,
      assignFormData,
      statusModal,
      handleChangeStatus,
      handleConfirmChange,
      employeeLists,
      BUG_STATUS_DELETE,
      handleStaff,
      handleCopy,
      getEnv,
      jumpName
    };
  }
});
</script>

<style scoped lang="less">
.container {
  height: 100%;
  padding: 20px !important;
}
.rp-test__pageTitle {
  margin-bottom: 20px;
  position: relative;
  span {
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
:deep(.el-descriptions__label) {
  display: inline-block;
  font-weight: 700;
  line-height: 30px;
  width: 100px;
}
.rp-test__descFullHeight {
  height: 100%;
}
.rp-Dialog__bugStatus {
  :deep(.el-form-item__content) {
    display: flex;
  }
  :deep(.el-select) {
    width: 100%;
  }
}
.rp-test-status {
  .rp-Table__common;
  color: #3370ff;
  &:hover {
    cursor: pointer;
  }
}
.rotate-icon {
  transform: rotate(90deg);
  margin-right: 5px;
  color: #3370ff;
}
.rp-Table__common {
  font-size: 14px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}
.rp-Table__bug {
  .rp-Table__common;
  color: #3370ff;
}
img {
  cursor: pointer;
}
</style>
