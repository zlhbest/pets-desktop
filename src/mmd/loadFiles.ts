import { TauriAPI } from "./api/tauri_api";
export class MMDFiles {
  modelFile: string;
  vmdFiles: string;
  cameraFile: string;
  audioFile: string;

  public static async getFiles(): Promise<MMDFiles> {
    const mmdFiles = new MMDFiles();
    mmdFiles.modelFile =
      "https://library.localhost/resources/mmd_library/models/hutao/胡桃.pmx";
    mmdFiles.vmdFiles = await TauriAPI.getInstance().get_resource_src(
      "resources\\mmd_library\\activity\\move\\hit-and-run.vmd"
    );
    mmdFiles.cameraFile = await TauriAPI.getInstance().get_resource_src(
      "resources\\mmd_library\\activity\\wavefile\\wavefile-camera.vmd"
    );
    mmdFiles.audioFile = await TauriAPI.getInstance().get_resource_src(
      "resources\\mmd_library\\songs\\wavefile-short.mp3"
    );
    return mmdFiles;
  }
}
