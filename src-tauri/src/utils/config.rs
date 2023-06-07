use std::sync::RwLock;

use lazy_static::lazy_static;
use system_config::Config;

use crate::statics::CONFIG_NAME;

lazy_static! {
    static ref CONFIG: RwLock<Config> = RwLock::new(Config::new(CONFIG_NAME).unwrap());
}

pub fn get<P: AsRef<str>>(key: P) -> Option<String> {
    CONFIG.read().unwrap().get(key)
}

pub fn write_insert<T: AsRef<str>>(key: T, value: T) {
    match CONFIG.write().unwrap().write_insert(key, value) {
        Ok(_result) => {}
        Err(err) => println!("写入失败：{:?}", err),
    }
}
