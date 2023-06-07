<template>
  <el-form :model="live2dSetting">
    <el-form-item label="开启live模式">
      <el-switch v-model="live2dSetting.open" />
    </el-form-item>
    <el-form-item label="设置为壁纸模式">
      <el-switch v-model="live2dSetting.isWallpaper" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="apply">应用</el-button>
    </el-form-item>
  </el-form>
</template>


<script setup>
import { ref } from "vue";
import { create_live2d_window } from "../../api/tauri_api";
const live2dSetting = ref({
  open: true,
  isWallpaper: true,
});
function apply() {
  create_live2d_window();
}
</script>