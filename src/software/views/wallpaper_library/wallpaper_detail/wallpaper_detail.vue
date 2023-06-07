<template>
  <PageTitle :title="wallpaper.title" :is_back="true" />
  <el-card class="detail_card">
    <img :src="preview" class="preview_img" />
  </el-card>
  <el-card class="worker_card">
    <div class="title-box">
      <el-text class="title" size="small">详细信息</el-text>
    </div>
    <el-descriptions border :column="1">
      <el-descriptions-item label="作者">{{
        wallpaper.author
      }}</el-descriptions-item>
      <el-descriptions-item label="描述">{{
        wallpaper.describe
      }}</el-descriptions-item>
      <el-descriptions-item label="版本">{{
        wallpaper.version
      }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
  <el-button
    type="primary"
    size="large"
    class="detal_button"
    @click="delete_wallpaper_fun"
  >
    删除</el-button
  >
  <el-button
    type="primary"
    size="large"
    class="detal_button"
    @click="apply_wallpaper"
  >
    应用</el-button
  >
</template>

<script setup>
import { onMounted, ref } from "vue";
import { wallpaper_dir } from "../../../api/model/wallpaper";
import {
  get_resource_file_src,
  setting_wallpaper,
  delete_wallpaper,
} from "../../../api/tauri_api";
import img from "../../../resource/images/404_error.webp";
import loading from "../../../resource/images/loading.gif";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
const router = useRouter();
let wallpaper = ref({});
let preview = ref(loading);
function apply_wallpaper() {
  setting_wallpaper(
    wallpaper.value.path + "\\" + wallpaper.value.main_file,
    true
  );
}
async function delete_wallpaper_fun() {
  ElMessageBox.confirm("是否删除该壁纸 ?")
    .then(() => {
      delete_wallpaper(wallpaper.value.path).then(() => {
        router.back();
      });
    })
    .catch(() => {
      // catch error
    });
}
onMounted(() => {
  //通过history api 实现传参
  wallpaper.value = window.history.state.wallpaper;
  // 获取预览图
  get_resource_file_src((src_path) => {
    preview.value =
      wallpaper.value.preview === null || wallpaper.value.preview === ""
        ? img
        : src_path;
  }, wallpaper_dir + "\\" + wallpaper.value.dir_name + "\\" + wallpaper.value.preview);
});
</script>
<style>
.detail_card {
  margin-top: 10px;
}
.preview_img {
  width: 100%;
}
.worker_card {
  margin-top: 10px;
  padding: 5px;
}
.detal_button {
  float: right;
  margin-right: 10px;
  margin-top: 10px;
}
</style>