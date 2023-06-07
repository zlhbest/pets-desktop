<template>
  <PageTitle title="显示器设置" />
  <el-card class="monitors-card">
    <canvas id="monitors-display" height="300" width="600"></canvas>
  </el-card>
  <el-button
    class="submit"
    @click="update_monitor_setting"
    size="large"
    type="primary"
    >应用</el-button
  >
</template>

<script setup>
// 计算显示器这个地方还是比较困难的
import { availableMonitors } from "@tauri-apps/api/window";
import { ElMessage } from "element-plus";
import { onMounted } from "vue";
import {
  get_all_monitors_setting,
  update_monitors_setting,
} from "../../api/tauri_api";
import { check_monitor_setting_number } from "../../utils/verification";
import create_monitors_canvas from "../../utils/monitors_display";
let monitors_setting = new Map();
let monitor_select_number = 0;
function monitors_canvas_callback(monitors) {
  // 检测有多少个显示器被选中，每次只能选中其中一个显示器
  monitor_select_number = 0;
  monitors.forEach((item) => {
    if (item.setting.is_select) {
      monitor_select_number++;
    }
    monitors_setting.set(item.name, item.setting);
  });
}

function update_monitor_setting() {
  if (check_monitor_setting_number(monitor_select_number)) {
    console.log(monitors_setting);
    update_monitors_setting(monitors_setting)
      .then(() => {
        ElMessage.success("应用成功");
      })
      .catch((err) => {
        ElMessage.error("应用失败：" + err);
      });
  }
}

onMounted(() => {
  // 获取所有的显示器
  availableMonitors().then((monitors) => {
    // 获取显示器设置
    get_all_monitors_setting()
      .then((monitorSetting) => {
        monitors.forEach((item) => {
          let setting = monitorSetting.map[item.name];
          if (setting) {
            item.setting = setting;
          }
        });
        create_monitors_canvas(
          document.getElementById("monitors-display"),
          monitors,
          monitors_canvas_callback
        );
      })
      .catch((error) => console.error(error));
  });
});
</script>


<style>
.monitors-card {
  margin-top: 10px;
}
.submit {
  margin-top: 10px;
  position: absolute;
  right: 20px;
}
</style>