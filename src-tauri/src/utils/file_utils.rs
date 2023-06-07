use crate::command::{error::CommonError, model::CommandResult};
use std::{
    fs::{self, read_dir},
    io,
    path::Path,
};
pub fn copy_dir_all<P: AsRef<Path>, Q: AsRef<Path>>(src: P, dst: Q) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}
// 校验文件夹中必须存在的一些文件 如Wallpaper的配置文件
pub fn check_dir_context(path: impl AsRef<Path>) -> tauri::Result<CommandResult<()>> {
    // 进行校验
    if !path.as_ref().is_dir() {
        return Ok(CommandResult::failed(CommonError::DirError(
            "请选择文件夹进行上传".into(),
        )));
    }
    // 检测文件中是否存在必要的json文件
    let has_json_file = read_dir(path)?
        .into_iter()
        .filter_map(|item| item.ok())
        .filter_map(|item| item.file_name().into_string().ok())
        .find(|item| item.eq("WallpaperInfo.json"));
    if has_json_file.is_none() {
        Ok(CommandResult::failed(CommonError::DirError(
            "WallpaperInfo.json未找到,请检查上传文件夹".into(),
        )))
    } else {
        Ok(CommandResult::success_no_return())
    }
}
pub fn delete_dir(path: impl AsRef<Path>) -> io::Result<()> {
    fs::remove_dir_all(path)?;
    Ok(())
}
#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{check_dir_context, copy_dir_all};

    #[test]
    fn copy_dir_test() {
        let path = "C:\\Users\\11279\\Pictures\\EVA";
        let path = Path::new(path);
        let _ = copy_dir_all(
            path,
            "D:\\tauri-pets\\pets-desktop\\src-tauri\\resources\\wallpaper_library\\EVA",
        );
    }

    #[test]
    fn check_dir() {
        let path = "D:\\tauri-pets\\pets-desktop\\src-tauri\\target\\debug\\resources\\wallpaper_library\\3c355c1a";
        let result = check_dir_context(path);
        println!("{:?}", result);
    }
}
