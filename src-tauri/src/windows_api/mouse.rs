use crate::windows_api::screen::ScreenHelper;

// 这个mod 主要作用就是注册钩子，然后将注册后的钩子进行监听，使用时需要告知hwnd
use super::{monitor, screen::get_webview_chrome_hwnd};
use lazy_static::lazy_static;
use tauri::Monitor;
use windows::{
    core::PCWSTR,
    Win32::{
        Foundation::{HWND, LPARAM, LRESULT, WPARAM},
        System::LibraryLoader::GetModuleHandleW,
        UI::WindowsAndMessaging::{
            CallNextHookEx, PostMessageW, SetWindowsHookExW, UnhookWindowsHookEx, HHOOK,
            MOUSEHOOKSTRUCT, WH_MOUSE_LL, WM_LBUTTONDOWN, WM_LBUTTONUP, WM_MOUSEMOVE,
            WM_NCMOUSEMOVE,
        },
    },
};

static mut NOUSE_HOOK_HWND: Option<HWND> = None;
// 这样开销要小很多 但是这种设置全局变量的方式让extend 函数能够使用我感觉很不方便，对于软件设计是一种丑陋的存在，应该还有更加优雅的方式实现
static mut SELECT_MONITOR_POSITION: Option<MousePoint> = None;
lazy_static! {
    static ref SCREEN_HELPER: ScreenHelper = {
        let mut screen = ScreenHelper::new();
        screen.find_desktop_handles();
        screen
    };
}

// 鼠标位置
#[derive(Debug, Clone, Copy)]
pub struct MousePoint {
    pub x: i32,
    pub y: i32,
}
impl MousePoint {
    pub fn new(x: i32, y: i32) -> Self {
        MousePoint { x, y }
    }
    /**
     * 用于转换xy 成为一个i32 的数字 这里涉及到一步转换, 鼠标点与屏幕坐标的转换
     */
    pub fn get_mouse_i32_value(&self) -> i32 {
        // 这样会不会极其的消耗性能，感觉做法很不妥
        let monitor_position = unsafe { SELECT_MONITOR_POSITION.unwrap() };
        let mut param: i32 = self.y - monitor_position.y;
        param <<= 16;
        param |= self.x - monitor_position.x;
        param
    }
}
#[derive(Clone, Copy)]
pub struct MouseHook {
    // 这个是真正展示的句柄
    pub window_hwnd: Option<HWND>,
    pub chrome_hwnd: Option<HWND>,
    // 这个是生成的hook
    pub hook: Option<HHOOK>,
}

impl MouseHook {
    pub fn new() -> Self {
        MouseHook {
            hook: None,
            window_hwnd: None,
            chrome_hwnd: None,
        }
    }
    /**
     * 这里塞入的应该是获取到的tauri创建的window 还不是真正的我们需要的句柄
     */
    pub fn set_hwnd(&mut self, hwnd: HWND) {
        self.window_hwnd = Some(hwnd);
        let chrome_hwnd = get_webview_chrome_hwnd(self.window_hwnd);
        //  使用笨办法 等后面发现更好的办法再改进
        unsafe { NOUSE_HOOK_HWND = chrome_hwnd };
    }

    pub fn set_monitor(monitors: Vec<Monitor>) {
        unsafe {
            match monitor::MonitorSettingHashMap::get_select_monitor(monitors) {
                Some(monitor) => {
                    SELECT_MONITOR_POSITION = Some(MousePoint {
                        x: monitor.position().x,
                        y: monitor.position().y,
                    })
                }
                None => {}
            }
        }
    }

    /**
     * 创建钩子
     */
    pub fn create_hook(&mut self) {
        let hmod = unsafe { GetModuleHandleW(PCWSTR::null()).unwrap() };
        // 监听全局的鼠标事件
        match unsafe { SetWindowsHookExW(WH_MOUSE_LL, Some(Self::hook_shoot), hmod, 0) } {
            Ok(hook) => self.hook = Some(hook),
            Err(err) => {
                println!("创建钩子失败:{}", err);
                self.hook = None;
            }
        };
    }

    /**
     *  这里面是否可以传递一个闭包，使用使用外部变量呢
     */
    unsafe extern "system" fn hook_shoot(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if NOUSE_HOOK_HWND.is_some() {
            // 当在窗口的时候才去使用 减少阻塞
            if SCREEN_HELPER.is_desktop() {
                let wparam_cast = wparam.0 as u32;
                // 获取鼠标位置
                let mouse_pos = lparam.0 as *const MOUSEHOOKSTRUCT;
                let mouse_point = MousePoint::new((*mouse_pos).pt.x, (*mouse_pos).pt.y);
                match wparam_cast {
                    // 这里是鼠标点击事件
                    WM_MOUSEMOVE | WM_NCMOUSEMOVE => {
                        let _ = PostMessageW(
                            NOUSE_HOOK_HWND.unwrap(),
                            WM_MOUSEMOVE,
                            WPARAM(0x0020),
                            LPARAM(mouse_point.get_mouse_i32_value() as *mut i32 as isize),
                        );
                    }
                    // 鼠标按下事件
                    WM_LBUTTONDOWN => {
                        let _ = PostMessageW(
                            NOUSE_HOOK_HWND.unwrap(),
                            WM_LBUTTONDOWN,
                            WPARAM(0x0001),
                            LPARAM(mouse_point.get_mouse_i32_value() as *mut i32 as isize),
                        );
                    }
                    // 鼠标左键抬起事件
                    WM_LBUTTONUP => {
                        let _ = PostMessageW(
                            NOUSE_HOOK_HWND.unwrap(),
                            WM_LBUTTONUP,
                            WPARAM(0x0001),
                            LPARAM(mouse_point.get_mouse_i32_value() as *mut i32 as isize),
                        );
                    }
                    _ => {}
                }
            }
        }
        return unsafe { CallNextHookEx(HHOOK::default(), code, wparam, lparam) };
    }
    /**
     * 卸载hook
     */
    pub fn uninstall_hook(&self) -> bool {
        // 释放钩子
        if let Some(hook) = self.hook {
            unsafe { UnhookWindowsHookEx(hook).as_bool() }
        } else {
            return false;
        }
    }
}
