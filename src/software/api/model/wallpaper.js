// 构造一个用于展示的WallpaperModel
import { tauri_path_handler } from "../../utils/fileutils";
export const wallpaper_dir = "resources\\wallpaper_library";

export default class WallpaperModel {
  constructor(name, path, jsonBody) {
    this.dir_name = name;
    // 这里是名称
    this.title = jsonBody === null ? name : jsonBody.Title;
    this.path = tauri_path_handler(path);
    this.version = jsonBody === null ? "0.0.0" : jsonBody.Version;
    this.thumbnail = jsonBody === null ? null : jsonBody.Thumbnail;
    this.preview = jsonBody === null ? null : jsonBody.Preview;
    this.describe = jsonBody === null ? "" : jsonBody.Desc;
    this.author = jsonBody === null ? "" : jsonBody.Author;
    this.main_file = jsonBody === null ? "index.html" : jsonBody.MainFile;
  }
}
