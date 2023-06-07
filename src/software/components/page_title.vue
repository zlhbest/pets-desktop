<template>
  <div class="title-box">
    <el-icon class="back_icon" v-show="is_back" :size="20" @click="back"
      ><Back
    /></el-icon>
    <el-text class="title" size="large">{{ title }}</el-text>
  </div>
</template>

<script setup>
import { Back } from "@element-plus/icons-vue";
defineProps({
  title: String,
  is_back: {
    type: Boolean,
    default: false,
  },
});
import { useRouter } from "vue-router";
const router = useRouter();
function back() {
  router.back();
}
</script>

<style>
.title-box {
  border-bottom: solid 1px var(--el-menu-border-color);
}
.title {
  /*设置为行内块级元素即可*/
  display: inline-block;
  margin-bottom: 5px;
}
.back_icon {
  margin-right: 20px;
}
.back_icon:hover {
  cursor: pointer;
}
</style>