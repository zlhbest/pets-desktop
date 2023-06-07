<template>
  <PageTitle title="壁纸库" />
  <el-row :gutter="20">
    <el-col
      :span="8"
      v-for="wallpaper in wallpaper_show_list"
      :key="wallpaper.title"
    >
      <el-card @click="get_detial(wallpaper.all)">
        <div class="wallpaper_container">
          <img class="image" :src="wallpaper.src" />
          <div class="overlay"></div>
          <div class="text">{{ wallpaper.title }}</div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { onMounted, ref, toRaw } from "vue";
import { wallpaper_dir } from "../../api/model/wallpaper";
import img from "../../resource/images/404_error.webp";
import { useRouter } from "vue-router";
import {
  get_all_wallpaper_dir,
  get_resource_file_src,
} from "../../api/tauri_api";
let wallpaper_show_list = ref([]);
const router = useRouter();
onMounted(() => {
  get_all_wallpaper_dir((wallpaper) => {
    if (wallpaper.thumbnail === null || wallpaper.thumbnail === "") {
      wallpaper_show_list.value.push({
        title: wallpaper.title,
        src: img,
        all: wallpaper,
      });
    } else {
      get_resource_file_src((src_path) => {
        wallpaper_show_list.value.push({
          title: wallpaper.title,
          src: wallpaper.thumbnail === null ? img : src_path,
          all: wallpaper,
        });
      }, wallpaper_dir + "\\" + wallpaper.dir_name + "\\" + wallpaper.thumbnail);
    }
  });
});

function get_detial(wallpaperProxy) {
  let wallpaper = toRaw(wallpaperProxy);
  router.push({
    name: "wallpaper_detail",
    state: { wallpaper: wallpaper },
  });
}
</script>


<style >
.el-row {
  margin-top: 10px;
  margin-bottom: 20px;
}
.el-col {
  margin-bottom: 10px;
}
.el-card__body {
  padding: 0px !important;
}
.wallpaper_container {
  padding: 0px;
}
.image {
  display: block;
  width: 100%;
  height: auto;
  opacity: 1;
  transition: 0.5s ease;
  backface-visibility: hidden;
  /* 背面隐藏 */
}
.overlay {
  transform: 0.5s ease;
  opacity: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.wallpaper_container:hover .image {
  opacity: 0.2;
}
.wallpaper_container:hover .overlay {
  opacity: 1;
}
.wallpaper_container:hover {
  cursor: pointer;
}
.text {
  position: relative;
  white-space: nowrap;
  opacity: 0.5;
  color: white;
  padding: 5px;
  text-align: center;
  vertical-align: middle;
}
</style>