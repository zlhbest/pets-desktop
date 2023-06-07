// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::{
    statics::{MAIN_WINDOW_NAME, WALLPAPER_WINDOW_NAME},
    tauri_command::*,
};
use lazy_static::lazy_static;
use statics::CUSTOM_RESOURCE_SCHEME_PROTOCOL;

use std::{sync::RwLock, thread, time::Duration};
use tauri::{
    http::Response, App, AppHandle, CustomMenuItem, GlobalWindowEvent, Manager, Result, SystemTray,
    SystemTrayEvent, SystemTrayMenu,
};
use tauri_window::get_control_window;

use windows_api::{mouse::MouseHook, screen};
mod command;
mod custom_scheme_protocol;
mod statics;
mod tauri_command;
mod tauri_window;
mod utils;
mod windows_api;

// 临时配置文件
lazy_static! {
    // 创建钩子
    pub static ref MOUSE_HOOK:RwLock<MouseHook> = RwLock::new(MouseHook::new());
}

fn main() {
    MOUSE_HOOK.write().unwrap().create_hook();

    // 实例化的时候需要
    refresh();
}

fn refresh() {
    let app = init_window().unwrap();
    // 添加主窗口
    match get_control_window(&app) {
        Ok(main_window) => {
            // 设置选中的显示器
            MouseHook::set_monitor(main_window.available_monitors().unwrap());
            app.run(|_, _| {});
        }
        Err(err) => println!("主窗口创建失败；{}", err),
    }
}
/**
 * 初始化App类
 */
fn init_window() -> Result<App> {
    let window_app = tauri::Builder::default()
        .setup(|app| {
            // 创建系统托盘
            let _tray_handle = SystemTray::new().with_menu(system_tray_menu()).build(app)?;
            Ok(())
        })
        // 实验！ 重写asset
        .register_uri_scheme_protocol(
            CUSTOM_RESOURCE_SCHEME_PROTOCOL,
            custom_scheme_protocol::mmd_file_handler,
        )
        .on_system_tray_event(menu_handler)
        .on_window_event(window_event_listener)
        // 创建对js的函数
        .invoke_handler(tauri::generate_handler![
            wallpaper_run,
            get_all_monitors_setting,
            update_monitors_setting,
            delete_wallpaper,
            upload_wapper_dir,
            setting_live2d,
            setting_mmd
        ])
        .build(tauri::generate_context!())?;
    Ok(window_app)
}

// 创建系统托盘菜单
fn system_tray_menu() -> SystemTrayMenu {
    SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("open_mcontrol_window", "打开控制面板"))
        .add_item(CustomMenuItem::new("close_wallpaper", "关闭壁纸"))
        .add_item(CustomMenuItem::new("quit", "退出"))
}

fn open_main_window(app: &AppHandle) {
    match app.get_window(MAIN_WINDOW_NAME) {
        Some(control_window) => match control_window.show() {
            Err(err) => println!("打开控制窗口失败：{}", err),
            _ => {}
        },
        None => println!("创建控制窗口失败：未创建窗口"),
    }
}

// 执行系统托盘相关操作
fn menu_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "open_mcontrol_window" => open_main_window(app),
            "close_wallpaper" => match app.get_window(WALLPAPER_WINDOW_NAME) {
                Some(wallpaper_window) => {
                    // 这里close 是发的消息，不能及时的关闭，只能通过暂停几秒来确保关闭
                    let _ = wallpaper_window.close();
                    thread::sleep(Duration::from_secs(2));
                    screen::refresh_desktop();
                }
                None => {}
            },
            "quit" => {
                // 将钩子卸载
                MOUSE_HOOK.write().unwrap().uninstall_hook();
                // 退出的时候需要将页面关闭
                if let Some(wallpaper) = app.get_window(WALLPAPER_WINDOW_NAME) {
                    let _ = wallpaper.close();
                    thread::sleep(Duration::from_secs(2));
                    // 来自于lively_wallpaper
                    screen::refresh_desktop();
                }
                screen::refresh_desktop();
                app.exit(0);
            }
            _ => {}
        },
        SystemTrayEvent::DoubleClick { .. } => open_main_window(app),
        _ => {}
    }
}
// 监听窗口事件
fn window_event_listener(event: GlobalWindowEvent) {
    match event.event() {
        // 保持前端在后台运行
        tauri::WindowEvent::CloseRequested { api, .. } => {
            event.window().hide().unwrap();
            api.prevent_close();
        }
        _ => {}
    }
}
