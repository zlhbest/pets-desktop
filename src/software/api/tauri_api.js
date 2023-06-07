import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { resourceDir, join } from "@tauri-apps/api/path";
import { availableMonitors } from "@tauri-apps/api/window";
import { ElMessage } from "element-plus";
import {
  readBinaryFile,
  readDir,
  readTextFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import WallpaperModel from "./model/wallpaper";

import monitor_position from "../utils/monitor_position";
import { asyncForEach, create_ten_rand_uuid } from "../utils/util";
const wallpaper_info_file = "WallpaperInfo.json";
const wallpaper_dir = "resources/wallpaper_library";

export function get_all_monitors_setting() {
  return invoke("get_all_monitors_setting");
}

export function update_monitors_setting(monitorsSetting) {
  let temp = {};
  monitorsSetting.forEach((value, key) => {
    temp[key] = value;
  });
  return invoke("update_monitors_setting", {
    setting: {
      map: temp,
    },
  });
}
// 选择壁纸
export function setting_wallpaper(select_wallpaper, isExernal) {
  console.log(select_wallpaper);
  if (
    select_wallpaper === undefined ||
    select_wallpaper === null ||
    select_wallpaper === ""
  ) {
    ElMessage.error("未选择相关壁纸");
  }
  get_select_monitor_position((position) => {
    return invoke("wallpaper_run", {
      args: {
        url: select_wallpaper,
        is_external: isExernal,
        position: {
          x: position.x,
          y: position.y,
        },
      },
    });
  });
}
// 计算应该所在的点位置
function get_select_monitor_position(callback) {
  // 首先获取到可以用的显示器
  availableMonitors().then((monitors) => {
    // 再获取配置
    get_all_monitors_setting().then((settings) => {
      monitors.forEach((element) => {
        element.setting = settings.map[element.name];
      });
      callback(monitor_position(monitors));
    });
  });
}

export function get_all_wallpaper_dir(callback) {
  readDir(wallpaper_dir, {
    dir: BaseDirectory.Resource,
    recursive: false,
  }).then((entries) => {
    asyncForEach(entries, async (dir) => {
      let jsonBody = null;
      await readTextFile(
        wallpaper_dir + "/" + dir.name + "/" + wallpaper_info_file,
        {
          dir: BaseDirectory.Resource,
        }
      )
        .then((contents) => {
          jsonBody = JSON.parse(contents);
        })
        .catch(() => {});
      let wallpaper = new WallpaperModel(dir.name, dir.path, jsonBody);
      callback(wallpaper);
    });
  });
}
// 获取到文件的二进制 用于读取图片等信息  不过转换过慢，小文件可以
export async function get_binary_file_from_resource(path) {
  return readBinaryFile(path, { dir: BaseDirectory.Resource });
}

// 这里需要将tauri 返回的路径转为src 展示文件 拿到绝对路径转换成前端需要的url  用于文件展示
export function get_resource_file_src(callback, path) {
  resourceDir().then((resource_path) => {
    join(resource_path, path).then((filePath) => {
      callback(convertFileSrc(filePath));
    });
  });
}

export function upload_wapper_dir(path, success, fail) {
  resourceDir().then((resource_path) => {
    join(
      resource_path,
      "resources",
      "wallpaper_library",
      create_ten_rand_uuid()
    ).then((to_path) => {
      invoke("upload_wapper_dir", { form: path, to: to_path })
        .then((result) => {
          success(result);
        })
        .catch((err) => {
          fail(err);
        });
    });
  });
}

export function delete_wallpaper(path) {
  return invoke("delete_wallpaper", { path: path });
}

export function create_live2d_window() {
  invoke("setting_live2d");
}

export function create_mmd_window() {
  invoke("setting_mmd");
}