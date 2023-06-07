import { resourceDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
export let s_instance: TauriAPI;
export class TauriAPI {
  public static getInstance(): TauriAPI {
    if (s_instance == null || s_instance == undefined) {
      s_instance = new TauriAPI();
    }

    return s_instance;
  }
  public async get_resource_src(path: string): Promise<string> {
    const resource_dir = await resourceDir();
    const joinPath = await join(resource_dir, path);
    return convertFileSrc(joinPath);
  }
}
