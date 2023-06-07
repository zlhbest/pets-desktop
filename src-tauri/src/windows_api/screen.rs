use std::ptr;

use windows::{
    core::PCWSTR,
    Win32::{
        Foundation::{BOOL, HWND, LPARAM, WPARAM},
        UI::WindowsAndMessaging::{
            EnumWindows, FindWindowExW, FindWindowW, GetDesktopWindow, GetForegroundWindow,
            SendMessageTimeoutW, SystemParametersInfoW, SEND_MESSAGE_TIMEOUT_FLAGS,
            SPIF_UPDATEINIFILE, SPI_SETDESKWALLPAPER,
        },
    },
};

use crate::statics::{
    get_ptr, CHROME_WIDGET_WIN_0, CHROME_WIDGET_WIN_1, PROGMAN, SHELLDLL_DEF_VIEW, WORKER_W,
};
#[derive(Debug, Clone, Copy)]
pub struct ScreenHelper {
    pub progman: Option<HWND>,
    pub workerw: Option<HWND>,
}
impl ScreenHelper {
    pub fn new() -> Self {
        ScreenHelper {
            progman: None,
            workerw: None,
        }
    }

    pub fn is_desktop(&self) -> bool {
        if self.workerw.is_none() || self.progman.is_none() {
            return false;
        }
        let hwnd = unsafe { GetForegroundWindow() };
        return hwnd.0 == self.workerw.unwrap().0 || hwnd.0 == self.progman.unwrap().0;
    }

    pub fn find_desktop_handles(&mut self) {
        let progman = unsafe { FindWindowW(PCWSTR(get_ptr(PROGMAN)), PCWSTR(ptr::null())) };
        self.progman = Some(progman);
        let mut workerw = HWND::default();
        let mut folder_view = unsafe {
            FindWindowExW(
                progman,
                HWND::default(),
                PCWSTR(get_ptr(SHELLDLL_DEF_VIEW)),
                PCWSTR(ptr::null()),
            )
        };
        if folder_view.0 == 0 {
            while {
                workerw = unsafe {
                    FindWindowExW(
                        GetDesktopWindow(),
                        workerw,
                        PCWSTR(get_ptr(WORKER_W)),
                        PCWSTR(ptr::null()),
                    )
                };
                folder_view = unsafe {
                    FindWindowExW(
                        workerw,
                        HWND::default(),
                        PCWSTR(get_ptr(SHELLDLL_DEF_VIEW)),
                        PCWSTR(ptr::null()),
                    )
                };
                folder_view.0 == 0 && workerw.0 != 0
            } {}
        }
        self.workerw = Some(workerw);
    }
}

// 找到真正展示在页面上的hwnd
pub fn get_webview_chrome_hwnd(parent: Option<HWND>) -> Option<HWND> {
    match parent {
        Some(parent_hwnd) => unsafe {
            let chrome_0 = FindWindowExW(
                parent_hwnd,
                HWND::default(),
                PCWSTR(get_ptr(CHROME_WIDGET_WIN_0)),
                PCWSTR(ptr::null()),
            );
            if chrome_0.0 != 0 {
                return Some(FindWindowExW(
                    chrome_0,
                    HWND::default(),
                    PCWSTR(get_ptr(CHROME_WIDGET_WIN_1)),
                    PCWSTR(ptr::null()),
                ));
            } else {
                return None;
            }
        },
        None => None,
    }
}
/**
 * 查找WorkerW句柄
 */
pub fn get_workerw() -> Option<HWND> {
    let program = unsafe { FindWindowW(PCWSTR(get_ptr(PROGMAN)), PCWSTR(ptr::null())) };
    // 创建一个结果
    let mut result: usize = 0;
    unsafe {
        SendMessageTimeoutW(
            program,
            0x052C,
            WPARAM(0xD),
            LPARAM(0x1),
            SEND_MESSAGE_TIMEOUT_FLAGS(0x0),
            1000,
            &mut result as *mut usize,
        )
    };
    // 创建一个
    let mut workerw: HWND = HWND::default();
    // 遍历窗口获取窗口句柄
    unsafe {
        EnumWindows(
            Some(enum_windows_proc),
            LPARAM(&mut workerw as *mut HWND as isize),
        )
    };
    Some(workerw)
}
/**
 * 获取WorkerW 窗口, 这是回调函数 不需要关注
 */
unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    // 找到SHELLDLL_DefView
    let p = FindWindowExW(
        hwnd,
        HWND::default(),
        PCWSTR(get_ptr(SHELLDLL_DEF_VIEW)),
        PCWSTR(ptr::null()),
    );
    if p.0 != 0 {
        let workerw = FindWindowExW(
            HWND::default(),
            hwnd,
            PCWSTR(get_ptr(WORKER_W)),
            PCWSTR(ptr::null()),
        );
        // 传值
        let data = lparam.0 as *mut HWND;
        (*data) = workerw;
        return BOOL(0);
    }
    BOOL(1)
}

// 在删除完后更新一下屏幕
//https://github.com/rocksdanister/lively/blob/cdcfc3009e988022f440886a856eb24d2f3e4014/src/Lively/Lively.Common/Helpers/Shell/DesktopUtil.cs#L69
pub fn refresh_desktop() {
    unsafe { SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, ptr::null_mut(), SPIF_UPDATEINIFILE) };
}

#[cfg(test)]
mod tests {
    use super::get_workerw;

    #[test]
    fn it_works() {
        let result = get_workerw();
        println!("{:?}", result);
    }
}
