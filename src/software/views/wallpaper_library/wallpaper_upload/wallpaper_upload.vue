<template>
  <PageTitle title="上传壁纸" />
  <el-card class="upload_file_card">
    <div
      class="el-upload el-upload--text is-drag"
      tabindex="0"
      @click="open_dir_dialog"
    >
      <div class="el-upload-dragger">
        <i class="el-icon el-icon--upload"
          ><el-icon><UploadFilled /></el-icon
        ></i>
        <div class="el-upload__text">
          拖拽文件夹(目前不支持拖拽) 或者 <em>点击文件夹上传</em>
        </div>
      </div>
    </div>
    <div class="upload_dir_process" v-if="is_upload">
      <p>文件路径：{{ select_path }}</p>
      <el-progress :percentage="percentage" />
    </div>
    <el-button
      type="primary"
      @click="upload_wallpaper_dir"
      class="upload_button"
    >
      上传
    </el-button>
  </el-card>
</template>

<script setup>
import { UploadFilled } from "@element-plus/icons-vue";
import { open } from "@tauri-apps/api/dialog";
import { onMounted, onUnmounted, ref } from "vue";
import { appWindow } from "@tauri-apps/api/window";
import { upload_wapper_dir } from "../../../api/tauri_api";
import { ElMessage } from "element-plus";
let select_path = ref("");
let is_upload = ref(false);
const percentage = ref(0);
async function open_dir_dialog() {
  // 读取文件 这里不用input 是因为input拿不到文件路径，操作有限 前端的拖拽也是拿不到文件的绝对路径
  open({
    directory: true,
    title: "选择需要上传的文件夹--目前仅支持目录上传",
  }).then((select) => {
    if (select !== null) {
      select_path.value = select;
      is_upload.value = true;
    }
  });
}

let unlisten = null;
function upload_wallpaper_dir() {
  is_upload.value = true;
  if (select_path.value === "") {
    ElMessage.warning("请选择要上传的文件夹");
  } else {
    upload_wapper_dir(
      select_path.value,
      (result) => {
        console.log(result);
        if (result.code.Fail !== undefined) {
          ElMessage.error("上传失败：" + result.code.Fail.DirError);
        } else {
          ElMessage.success("上传成功");
          percentage.value = 100;
          // 太快的慢一秒
          setTimeout(() => {
            is_upload.value = false;
          }, 1000);
        }
      },
      (err) => {
        ElMessage.error("上传失败：" + err);
      }
    );
  }
}
// 设置文件拖拽监听
onMounted(() => {
  appWindow
    .onFileDropEvent((event) => {
      alert(event);
      if (event.payload.type === "hover") {
        console.log("User hovering", event.payload.paths);
      } else if (event.payload.type === "drop") {
        console.log("User dropped", event.payload.paths);
      } else {
        console.log("File drop cancelled");
      }
    })
    .then((unlistener) => {
      unlisten = unlistener;
    });
});
onUnmounted(() => {
  if (unlisten !== null) {
    unlisten();
  }
});
</script>

<style>
.upload_file_card {
  margin-top: 10px;
  padding: 5px;
}
.upload_button {
  float: right;
  margin-top: 10px;
}
.upload_dir_process {
  margin-top: 5px;
  width: 100%;
  border-radius: 6px;
  box-sizing: border-box;
  border: 1px solid var(--el-card-border-color);
  font-size: 10px;
}
.upload_dir_process p {
  margin-left: 10px;
}
.el-progress__text {
  display: none;
}
</style>