use std::{thread, time};

use tauri::{AppHandle, Error, Manager, Result};

use crate::command::model::{CommandResult, CommandResultCode};
use crate::statics::MONITORS_SETTING_CONFIG;
use crate::tauri_window::{create_live2d_window, create_mmd_window};
use crate::utils::file_utils::{check_dir_context, copy_dir_all, delete_dir};
use crate::windows_api::mouse::MouseHook;
use crate::{
    statics::{MAIN_WINDOW_NAME, WALLPAPER_WINDOW_NAME},
    tauri_window::{create_wallpaper_window, CreateWallpaperWindowArgs},
    utils::config,
    windows_api::{self, monitor::MonitorSettingHashMap},
    MOUSE_HOOK,
};

/**
 * 每次程序run 以后都将所有权收回，这里一定要记住，使用async 不然会卡住
 * url 代表就是壁纸的链接
 * is_external 是否是外部链接
 */
#[tauri::command]
pub async fn wallpaper_run(app_handle: tauri::AppHandle, args: CreateWallpaperWindowArgs) {
    let workerw_handler = windows_api::screen::get_workerw().expect("WorkerW未获取到");
    if let Some(background_window) = app_handle.get_window(WALLPAPER_WINDOW_NAME) {
        app_handle.windows().remove(WALLPAPER_WINDOW_NAME);
        let _ = background_window.close();
        // 睡两秒钟应该就完事了
        thread::sleep(time::Duration::from_secs(2));
    }
    // 获取位置
    match create_wallpaper_window(&app_handle, args.handle(), workerw_handler) {
        // 塞入hwnd
        Ok(window) => MOUSE_HOOK.write().unwrap().set_hwnd(window.hwnd().unwrap()),
        Err(err) => {
            println!("创建失败：{}", err)
        }
    }
}

#[tauri::command]
pub async fn update_monitors_setting(app: AppHandle, setting: MonitorSettingHashMap) -> Result<()> {
    update_config_monitors_setting(&setting, app)
}

// 获取显示器设置配置
#[tauri::command]
pub async fn get_all_monitors_setting(app: tauri::AppHandle) -> Result<MonitorSettingHashMap> {
    let window = app.get_window(MAIN_WINDOW_NAME).unwrap();
    let result = config::get(MONITORS_SETTING_CONFIG);
    match result {
        Some(config) => {
            let mut monitors_setting: MonitorSettingHashMap =
                serde_json::from_str(config.as_str())?;
            if let Ok(result) = monitors_setting.update(window) {
                if result {
                    update_config_monitors_setting(&monitors_setting, app)?;
                }
            }
            Ok(monitors_setting)
        }
        None => {
            let monitors_setting = MonitorSettingHashMap::new(window)?;
            update_config_monitors_setting(&monitors_setting, app)?;
            Ok(monitors_setting)
        }
    }
}

fn update_config_monitors_setting(
    monitors_setting: &MonitorSettingHashMap,
    app: AppHandle,
) -> Result<()> {
    let value = serde_json::to_string(&monitors_setting)?;
    let _ = config::write_insert(MONITORS_SETTING_CONFIG, value.as_str());
    // 设置选中的显示器
    MouseHook::set_monitor(
        app.get_window(MAIN_WINDOW_NAME)
            .unwrap()
            .available_monitors()?,
    );
    Ok(())
}

// 如果返回值存在错误，需要返回更加详细的自定义错误信息，就需要使用CommandResult
#[tauri::command]
pub fn upload_wapper_dir(form: String, to: String) -> Result<CommandResult<()>> {
    // 这里需要对上传的文件夹进行校验，判断是不是符合条件的文件夹
    let check_result = check_dir_context(form.clone()).unwrap();
    if check_result.code == CommandResultCode::Success {
        match copy_dir_all(form, to) {
            Ok(_) => Ok(CommandResult::success_no_return()),
            Err(err) => Err(Error::Io(err)),
        }
    } else {
        Ok(check_result)
    }
}

#[tauri::command]
pub fn delete_wallpaper(path: String) -> Result<()> {
    match delete_dir(path) {
        Ok(_) => Ok(()),
        Err(err) => Err(Error::Io(err)),
    }
}
/**
 * 开始live2d模式
 */
#[tauri::command]
pub async fn setting_live2d(app: tauri::AppHandle) -> Result<CommandResult<()>> {
    // 开启live2d模式
    let _ = create_live2d_window(&app);
    Ok(CommandResult::success_no_return())
}
/**
 * 开始mmd模式
 */
#[tauri::command]
pub async fn setting_mmd(app: tauri::AppHandle) -> Result<CommandResult<()>> {
    // 开启live2d模式
    let _ = create_mmd_window(&app);
    Ok(CommandResult::success_no_return())
}
