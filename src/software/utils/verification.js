import { ElMessage } from "element-plus";

export function check_monitor_setting_number(monitor_select_number) {
  if (monitor_select_number > 1) {
    ElMessage.error("同一时间只允许选中一个显示器操作");
    return false;
  }
  if (monitor_select_number == 0) {
    ElMessage.warning("未选择显示器");
    return false;
  }
  return true;
}
