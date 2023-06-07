<template>
  <el-container class="container">
    <el-aside width="200px">
      <el-menu
        :default-active="activePath"
        class="el-menu-class"
        :router="true"
      >
        <el-menu-item index="/wallpaper_library">
          <el-icon><Notebook /></el-icon>
          <template #title>壁纸库</template>
        </el-menu-item>
        <el-sub-menu index="live2d">
          <template #title>
            <span class="iconfont icon-Dancing"></span>
            <span>live2d</span>
          </template>
          <el-menu-item index="/live2d_setting">
            <span class="iconfont icon-peizhiguanli"></span>
            <template #title>live2d配置</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="mmd">
          <template #title>
            <span class="iconfont icon-Dancing"></span>
            <span>MMD</span>
          </template>
          <el-menu-item index="/mmd_setting">
            <span class="iconfont icon-peizhiguanli"></span>
            <template #title>mmd配置</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="setting">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </template>
          <el-menu-item index="/monitor_setting">
            <el-icon><Monitor /></el-icon>
            <template #title>显示设置</template>
          </el-menu-item>
          <el-menu-item index="/wallpaper_upload">
            <el-icon><Upload /></el-icon>
            <template #title>上传壁纸</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-main> <router-view /> </el-main>
  </el-container>
</template>

<script  setup>
import { Notebook, Setting, Monitor, Upload } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
const default_router = "/wallpaper_library";
const route = useRoute();
const router = useRouter();
const path = computed(() => (route.path === "/" ? default_router : route.path));
const activePath = ref(path);
router.push(activePath.value);
</script>

<style>
.el-menu-class {
  width: 200px;
  min-height: 400px;
  height: 100%;
  margin: 0px;
}
.container {
  height: 100%;
  padding: 5px;
}
</style>
