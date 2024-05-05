use percent_encoding::percent_decode;
use std::fs;
use tauri::{
    http::{Request, Response, ResponseBuilder},
    AppHandle,
};
static MMD_URI_REPLACE: &str = "library://localhost/";
pub fn mmd_file_handler(
    app: &AppHandle,
    request: &Request,
) -> Result<Response, Box<dyn std::error::Error>> {
    let resp = ResponseBuilder::new().header("Access-Control-Allow-Origin", "*");
    let path: &str = request.uri().strip_prefix(MMD_URI_REPLACE).unwrap();
    if let Some(resource_dir) = app.path_resolver().resource_dir() {
        // 进行join
        let real_path = resource_dir.join(path);
        let real_path =
            percent_decode(real_path.into_os_string().into_string().unwrap().as_bytes())
                .decode_utf8_lossy()
                .to_string();
        match fs::read(real_path) {
            Ok(context) => {
                return resp.body(context);
            }
            Err(error) => {
                return resp.status(500).body(error.to_string().into_bytes());
            }
        }
    } else {
        return resp.status(404).body(Vec::new());
    }
}
