<template>
  <el-button type="primary" @click="apply">应用</el-button>
</template>

<script setup>
import { create_mmd_window } from "../../api/tauri_api";
function apply() {
  create_mmd_window();
}
</script>
