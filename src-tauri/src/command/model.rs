use super::error::CommonError;

// 这里存一些返回值
#[derive(Debug, serde::Serialize)]
pub struct CommandResult<T: serde::Serialize> {
    pub result: Option<T>,
    pub code: CommandResultCode,
}

#[derive(Debug, serde::Serialize, PartialEq)]
pub enum CommandResultCode {
    // 第一个就是成功
    Success,
    // 失败
    Fail(CommonError),
}

impl<T: serde::Serialize> CommandResult<T> {
    pub fn success(result: T) -> Self {
        CommandResult {
            result: Some(result),
            code: CommandResultCode::Success,
        }
    }
    pub fn success_no_return() -> Self {
        CommandResult {
            result: None,
            code: CommandResultCode::Success,
        }
    }
    pub fn failed(error: CommonError) -> Self {
        CommandResult {
            result: None,
            code: CommandResultCode::Fail(error),
        }
    }
}
