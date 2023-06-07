export class MMDFiles {
  modelFile: string;
  vmdFiles: string;
  cameraFile: string;
  audioFile: string;

  public static async getFiles(): Promise<MMDFiles> {
    const mmdFiles = new MMDFiles();
    mmdFiles.modelFile =
      "https://library.localhost/resources/mmd_library/models/hutao/胡桃.pmx";
    mmdFiles.vmdFiles =
      "https://library.localhost/resources/mmd_library/activity/move/hit-and-run.vmd";
    mmdFiles.cameraFile =
      "https://library.localhost/resources/mmd_library/activity/wavefile/wavefile-camera.vmd";
    mmdFiles.audioFile =
      "https://library.localhost/resources/mmd_library/songs/wavefile-short.mp3";
    return mmdFiles;
  }
}
