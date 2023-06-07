#[derive(Debug, thiserror::Error, serde::Serialize, PartialEq)]
pub enum CommonError {
    #[error("文件夹校验报错: {0}")]
    DirError(String),

    #[error("未找到路径：{0}")]
    NotFindPath(String),
}
