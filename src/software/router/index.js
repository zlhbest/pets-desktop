// 创建路由
import { createRouter, createWebHashHistory } from "vue-router";

// 加载组件
const WallpaperLibrary = () =>
  import("../views/wallpaper_library/wallpaper_library");
const Monitor_setting = () => import("../views/monitor/monitor_setting");
const WallpaperDetail = () =>
  import("../views/wallpaper_library/wallpaper_detail/wallpaper_detail");
const WallpaperUpload = () =>
  import("../views/wallpaper_library/wallpaper_upload/wallpaper_upload");

// 这里是live2d的处理页面
const live2dSettingPage = () => import("../views/live2d/live2d_setting");
// 增加mmd 的处理页面
const mmdSetting = () => import("../views/mmd/mmd_setting");

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "wallpaper_library",
      path: "/wallpaper_library",
      component: WallpaperLibrary,
    },
    {
      name: "monitor_setting",
      path: "/monitor_setting",
      component: Monitor_setting,
    },
    {
      name: "wallpaper_detail",
      path: "/wallpaper_library/wallpaper_detail",
      component: WallpaperDetail,
    },
    {
      name: "WallpaperUpload",
      path: "/wallpaper_upload",
      component: WallpaperUpload,
    },
    {
      name: "live2dSetting",
      path: "/live2d_setting",
      component: live2dSettingPage,
    },
    {
      name: "MmdSetting",
      path: "/mmd_setting",
      component: mmdSetting,
    },
  ],
});
