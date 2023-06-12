export function tauri_path_handler(path) {
  return path.replace(/\\\\\?\\/, "");
}
