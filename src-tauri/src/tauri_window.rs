use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, Result, Window, WindowBuilder, WindowUrl};
use windows::Win32::{Foundation::HWND, UI::WindowsAndMessaging::SetParent};

use crate::statics::{
    LIVE2D_WINDOW_NAME, MAIN_WINDOW_NAME, MMD_WINDOW_NAME, WALLPAPER_WINDOW_NAME,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateWallpaperWindowArgs {
    pub url: String,
    pub is_external: bool,
    pub position: PositionPoint,
}
impl CreateWallpaperWindowArgs {
    pub fn handle(self) -> Self {
        let url = self.url.clone();
        let mut arg_mut = self;
        arg_mut.url = format!("file:\\{}", url);
        arg_mut
    }
}
#[derive(Debug, Serialize, Deserialize)]
pub struct PositionPoint {
    pub x: f64,
    pub y: f64,
}
impl Default for PositionPoint {
    fn default() -> Self {
        Self { x: 0.0, y: 0.0 }
    }
}
/**
 * 创建wallpaper
 */
pub fn create_wallpaper_window(
    app_handle: &tauri::AppHandle,
    args: CreateWallpaperWindowArgs,
    workerw_handler: HWND,
) -> Result<Window> {
    // 重新创建
    let window_url: WindowUrl;
    if args.is_external {
        window_url = tauri::WindowUrl::External(args.url.parse().unwrap());
    } else {
        window_url = tauri::WindowUrl::App(args.url.into());
    }
    let background_window =
        tauri::WindowBuilder::new(app_handle, WALLPAPER_WINDOW_NAME, window_url)
            .transparent(true)
            //.decorations(false) 这里不能设置无边框，如果设置了，会出现一个很奇怪的tao window 的框比较丑
            .fullscreen(true)
            .resizable(false)
            // 这里用于设置在哪个显示器上面
            .position(args.position.x, args.position.y)
            .build()?;
    match background_window.hwnd() {
        Ok(hwnd) => unsafe {
            SetParent(hwnd, workerw_handler);
        },
        Err(err) => println!("错误：{}", err),
    }
    Ok(background_window)
}
// 获取控制台主窗口
pub fn get_control_window(app: &App) -> Result<Window> {
    if let Some(control_window) = app.get_window(MAIN_WINDOW_NAME) {
        Ok(control_window)
    } else {
        let window = WindowBuilder::new(
            app,
            MAIN_WINDOW_NAME,
            // 这个地方注意了，如果是开启的devserver 这里通过external引入 "software/index.html".into()
            //"http://localhost:3000".parse().unwrap()
            WindowUrl::App("software/index.html".into()),
        )
        .inner_size(900.0, 800.0)
        // 设置背景透明
        .title("控制台")
        .resizable(false)
        .decorations(true)
        .theme(Some(tauri::Theme::Dark))
        .center()
        .transparent(false)
        .build()?;
        Ok(window)
    }
}

pub fn create_live2d_window(app: &AppHandle) -> Result<Window> {
    if let Some(live2d_window) = app.get_window(LIVE2D_WINDOW_NAME) {
        let _ = live2d_window.show();
        Ok(live2d_window)
    } else {
        let window = WindowBuilder::new(
            app,
            LIVE2D_WINDOW_NAME,
            //tauri::WindowUrl::External("http://localhost:4000/".parse().unwrap()),
            WindowUrl::App("live2d/index.html".into()),
        )
        .title("live2d")
        .transparent(true)
        .decorations(false)
        .resizable(false)
        .center()
        .theme(Some(tauri::Theme::Dark))
        .build()?;
        Ok(window)
    }
}
//  创建mmd窗口
pub fn create_mmd_window(app: &AppHandle) -> Result<Window> {
    if let Some(mmd_window) = app.get_window(MMD_WINDOW_NAME) {
        let _ = mmd_window.show();
        Ok(mmd_window)
    } else {
        let window = WindowBuilder::new(
            app,
            MMD_WINDOW_NAME,
            //tauri::WindowUrl::External("http://localhost:4000/".parse().unwrap()),
            WindowUrl::App("mmd/index.html".into()),
        )
        .title("mmd")
        .transparent(true)
        .decorations(true)
        .resizable(false)
        .center()
        .theme(Some(tauri::Theme::Dark))
        .build()?;
        Ok(window)
    }
}
