<template>
  <div class="container">
    <div class="rp-test__pageTitle">
      <el-button>{{ testDetail.id }}</el-button>
      &nbsp;
      <span>{{ testDetail.name }}</span>
      <div class="f-r">
        <el-button type="primary" @click="handleUpdateList">编辑</el-button>
        <el-button type="primary" @click="handleCreateBug">新增Bug</el-button>
      </div>
    </div>
    <div class="rp-test__desc">
      <el-row :gutter="20" class="rp-test__descFullHeight">
        <el-col :span="18">
          <div class="grid-content__left">
            <el-row :gutter="20" class="rp-test__descFullHeight">
              <el-col style="height: 75%" :span="24">
                <el-card class="grid-content__left--top rp-test__descFullHeight">
                  <h4>BUG描述</h4>
                  <span>{{ testDetail.description }}</span>
                </el-card>
              </el-col>
              <el-col style="height: 20%" :span="24">
                <el-card class="grid-content__left--bottom">
                  <h4>
                    附件
                    <i class="el-icon-paperclip"></i>
                  </h4>
                  <ul>
                    <li>
                      <i class="el-icon-document" style="color: #1f9f85"></i>
                      &nbsp;
                      <el-link type="primary">文件65416516(800M)</el-link>
                    </li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content__right">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="grid-content__right--top">
                  <el-descriptions title="" :column="1">
                    <el-descriptions-item label-class-name="label-title" width="150px" label="级别">{{ testDetail.level }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="类型">{{ testDetail.type }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="创建人">{{ testDetail.creator }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="指派给">{{ testDetail.staff_name }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="状态">{{ testDetail.status }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="创建时间">{{ testDetail.create_time }}</el-descriptions-item>
                    <el-descriptions-item label-class-name="label-title" label="解决时间">{{ testDetail.end_time }}</el-descriptions-item>
                  </el-descriptions>
                </el-card>
              </el-col>
              <el-col :span="24">
                <el-card class="grid-content__right--bottom">
                  <ul>
                    <li>2021-07-09 09:49:40由张盛德创建，指派给李晓明。</li>
                    <li>2021-07-09 09:49:40由张盛德创建，指派给李晓明。</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { getSession, setSession } from "@/utils/index";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();

    const testDetail = { ...getSession("detailBug", true) };
    console.log(testDetail, "65465");
    const handleUpdateList = () => {
      setSession("editBug", testDetail);
      router.push({ path: "/iteration/edit", query: { isEdit: 1, page: route.query.page } });
    };
    const handleCreateBug = () => {
      router.push({ path: "/iteration/edit", query: { page: route.query.page } });
    };
    return {
      testDetail,
      handleUpdateList,
      handleCreateBug
    };
  }
});
</script>

<style scoped lang="less">
.container {
  height: 90%;
}
.rp-test__pageTitle {
  span {
    font-size: 18px;
    font-weight: 700;
  }
  .f-r {
    float: right;
  }
}
.rp-test__desc {
  height: 100%;
  .grid-content__left {
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
  }
  .grid-content__right {
    box-sizing: border-box;
    padding: 20px;
  }
  .grid-content__left--top {
    margin-bottom: 20px;
  }
  .grid-content__right--bottom {
    margin-top: 20px;
    li {
      margin-bottom: 30px;
    }
  }
}
::v-deep(.el-descriptions__label) {
  display: inline-block;
  font-weight: 700;
  line-height: 30px;
  width: 100px;
}
.rp-test__descFullHeight {
  height: 100%;
}
</style>
