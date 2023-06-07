import { axiosUtil } from "../axios";
import { ISTTService, Params, Status } from "./stt_service";

// 将音频转换为文字
const util: axiosUtil = new axiosUtil("https://api.openai.com");
const axios = util.getAxios();
const baseUrl = util.getBaseUrl();
// 将音频转换为文字
export const createTranscription = (formData, token) => {
  return axios({
    method: "post",
    baseURL: `${baseUrl}/v1/audio/transcriptions`,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  }).then((res) => {
    return res.data;
  });
};

export interface OpenAiParams extends Params {
  onTextComplete?: (text: string) => void;
}

// 将音频翻译成英语
export const createTranslation = (formData, token) => {
  return axios({
    method: "post",
    baseURL: `${baseUrl}/v1/audio/translations`,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  }).then((res) => {
    return res.data;
  });
};
// appKey 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
export class OpenAIRecorder implements ISTTService {
  recorder: MediaRecorder;
  recording: boolean;
  token: string;
  status: Status;
  onTextComplete?: (text: string) => void;
  setParams(params: OpenAiParams): void {
    this.token = params.apiKey;
    this.onTextComplete = params.onTextComplete || undefined;
    this.status = Status.END;
  }
  start(): void {
    if (this.status === Status.END) {
      this.status = Status.ING;
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.recorder = new MediaRecorder(stream);
          this.recording = true;
          this.recorder.start();
        })
        .catch((error) => {
          console.log("报错" + error);
        });
    }
  }
  stop(): void {
    this.recorder.stop();
    this.recording = false;
    this.recorder.ondataavailable = (event) => {
      const blob = new Blob([event.data], { type: "audio/wav" });
      const file = new File([blob], "recording.wav", {
        type: "audio/wav",
        lastModified: Date.now(),
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");
      formData.append("temperature", "1");
      formData.append("response_format", "text");
      formData.append("language", "zh");
      createTranscription(formData, this.token).then((data) => {
        this.status = Status.END;
        this.onTextComplete && this.onTextComplete(data || "");
      });
    };
  }
}
