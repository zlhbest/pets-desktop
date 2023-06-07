use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tauri::Monitor;
use tauri::Result;
use tauri::Window;

use crate::statics::MONITORS_SETTING_CONFIG;
use crate::utils::config;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorSetting {
    // 是否选中
    pub is_select: bool,
}

impl MonitorSetting {
    pub fn new() -> Self {
        MonitorSetting { is_select: false }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorSettingHashMap {
    map: HashMap<String, MonitorSetting>,
}
impl MonitorSettingHashMap {
    pub fn new(window: Window) -> Result<Self> {
        let monitors = window.available_monitors()?;
        let mut setting = MonitorSettingHashMap {
            // 放三个显示器, 如果不够他才扩容
            map: HashMap::with_capacity(monitors.len()),
        };
        for monitor in monitors.iter() {
            let mut name = String::from("");
            if monitor.name().is_some() {
                name = String::from(monitor.name().unwrap());
            }
            setting.push(name, MonitorSetting::new());
        }
        Ok(setting)
    }
    pub fn push(&mut self, name: String, setting: MonitorSetting) {
        self.map.insert(name, setting);
    }
    pub fn change(&mut self, name: String, setting: MonitorSetting) {
        if let Some(_) = self.map.get(&name) {
            self.map.remove(&name);
        }
        self.push(name, setting);
    }
    // 对比显示器，如果发现显示器的数量有变化，那么就只能重新搞一个
    pub fn update(&mut self, window: Window) -> Result<bool> {
        let mut update = false;
        let monitors = window.available_monitors()?;
        // 如果数量不等于的话就会出现问题了
        if monitors.len() != self.map.len() {
            for monitor in monitors.iter() {
                let name = monitor.name().unwrap();
                if self.map.get(name).is_none() {
                    update = true;
                    self.push(String::from(name), MonitorSetting::new());
                }
            }
        }
        Ok(update)
    }

    pub fn get_select_monitor(monitors: Vec<Monitor>) -> Option<Monitor> {
        match config::get(MONITORS_SETTING_CONFIG) {
            Some(result) => match serde_json::from_str::<MonitorSettingHashMap>(result.as_str()) {
                Ok(value) => {
                    for monitor in monitors.iter() {
                        let setting = value.map.get(monitor.name().unwrap());
                        if setting.is_some() && setting.unwrap().is_select {
                            return Some(monitor.to_owned());
                        }
                    }
                    None
                }
                Err(err) => {
                    println!("转换失败：{:?}", err);
                    None
                }
            },
            None => {
                println!("未找到显示器设置属性");
                None
            }
        }
    }
}
