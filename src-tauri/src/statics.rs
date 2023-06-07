pub static CONFIG_NAME: &str = "tauri_pets_config";
pub static MONITORS_SETTING_CONFIG: &str = "monitors_setting_config";

// 主窗体名称
pub static MAIN_WINDOW_NAME: &str = "main";
// 背景窗口名称
pub static WALLPAPER_WINDOW_NAME: &str = "wallpaper";
// 宠物窗口名称
pub static PETS_WINDOW_NAME: &str = "pets";

pub static LIVE2D_WINDOW_NAMW: &str = "live2d_window";

pub static MMD_WINDOW_NAMW: &str = "mmd_window";

pub static CUSTOM_RESOURCE_SCHEME_PROTOCOL: &str = "library";

// 获取windows 窗口的名称
pub static PROGMAN: &str = "Progman\0";
pub static SHELLDLL_DEF_VIEW: &str = "SHELLDLL_DefView\0";
pub static WORKER_W: &str = "WorkerW\0";
pub static CHROME_WIDGET_WIN_0: &str = "Chrome_WidgetWin_0\0";
pub static CHROME_WIDGET_WIN_1: &str = "Chrome_WidgetWin_1\0";

/**
 * 获取str 的u16指针
 */
pub fn get_ptr(str: &str) -> *const u16 {
    str.encode_utf16().collect::<Vec<u16>>().as_ptr()
}
