<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-05-15 12:03:02
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\components\back-btn\index.vue
-->
<script lang="tsx">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { Back } from "@element-plus/icons";

export default defineComponent({
  name: "backBtn",
  components: { Back },
  props: {
    name: {
      type: String
    }
  },
  setup(props) {
    const router = useRouter();

    const handleBack = () => {
      if (props?.name) {
        router.push({
          name: props.name
        });
      } else {
        router.go(-1);
      }
    };
    return () => {
      return (
        <el-button type="primary" onClick={() => handleBack()}>
          <el-icon>
            <back />
          </el-icon>
          返回
        </el-button>
      );
    };
  }
});
</script>
