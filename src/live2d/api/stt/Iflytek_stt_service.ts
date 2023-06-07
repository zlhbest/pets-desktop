import CryptoJS from "crypto-js";
import { ISTTService, Params, RuntimeError, Status } from "./stt_service";
export interface IatRecorderOpts extends Params {
  appId: string;
  apiSecret: string;
  onTextChange?: (text: string) => void;
  // 判断是否可以修改状态
  onWillStatusChange?: (before: Status, after: Status) => void;
  language?: string;
  accent?: string;
}
export class IatRecorder {
  appId: string;
  apiKey: string;
  apiSecret: string;
  onTextChange: (text: string) => void;
  onWillStatusChange: (before: Status, after: Status) => void;
  language: string;
  accent: string;
  status: Status;
  streamRef: MediaStream;
  audioData: number[];
  resultText: string;
  resultTextTemp: string;
  webWorker: Worker;
  webSocket: WebSocket;
  audioContext: AudioContext;
  constructor(opts: IatRecorderOpts) {
    // 服务接口认证信息(语音听写（流式版）WebAPI)
    this.appId = opts.appId || "";
    this.apiKey = opts.apiKey || "";
    this.apiSecret = opts.apiSecret || "";
    // 识别监听方法
    this.onTextChange = opts.onTextChange || undefined;
    this.onWillStatusChange = opts.onWillStatusChange || undefined;
    // 方言/语种
    this.status = Status.END;
    this.language = opts.language || "zh_cn";
    this.accent = opts.accent || "mandarin";
    // 流媒体
    this.streamRef;
    // 记录音频数据
    this.audioData = [];
    // 记录听写结果
    this.resultText = "";
    // wpgs下的听写结果需要中间状态辅助记录
    this.resultTextTemp = "";
    // 音频数据多线程
    this.init();
  }
  getWebSocketUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 请求地址根据语种不同变化
        const url = "wss://iat-api.xfyun.cn/v2/iat",
          host = "iat-api.xfyun.cn",
          date = new Date().toUTCString(),
          algorithm = "hmac-sha256",
          headers = "host date request-line",
          signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`,
          signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret),
          signature = CryptoJS.enc.Base64.stringify(signatureSha),
          authorizationOrigin = `api_key="${this.apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`,
          authorization = btoa(authorizationOrigin);
        resolve(
          `${url}?authorization=${authorization}&date=${date}&host=${host}`
        );
      } catch (error) {
        const url = "wss://iat-api.xfyun.cn/v2/iat",
          host = "iat-api.xfyun.cn",
          date = new Date().toUTCString(),
          algorithm = "hmac-sha256",
          headers = "host date request-line",
          signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`,
          signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret),
          signature = CryptoJS.enc.Base64.stringify(signatureSha),
          authorizationOrigin = `api_key="${this.apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`,
          authorization = btoa(authorizationOrigin);
        resolve(
          `${url}?authorization=${authorization}&date=${date}&host=${host}`
        );
      }
    });
  }
  // 初始化操作
  init() {
    try {
      if (!this.appId || !this.apiKey || !this.apiSecret) {
        console.error(
          "请正确配置【迅飞语音听写（流式版）WebAPI】服务接口认证信息！"
        );
      } else {
        this.webWorker = new Worker("./utils/transcode.worker.js");
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.webWorker.onmessage = function (event: MessageEvent<number[]>) {
          that.audioData.push(...event.data);
        };
      }
    } catch (error) {
      console.error("请在浏览器下运行");
    }
  }
  // 修改录音听写状态
  setStatus(status: Status) {
    this.onWillStatusChange &&
      this.status !== status &&
      this.onWillStatusChange(this.status, status);
    this.status = status;
  }
  // 设置识别结果的内容
  setResultText(
    resultText: string | undefined,
    resultTextTemp: string | undefined
  ) {
    this.onTextChange && this.onTextChange(resultText || resultTextTemp || "");
    resultText !== undefined && (this.resultText = resultText);
    resultTextTemp !== undefined && (this.resultTextTemp = resultTextTemp);
  }
  // 修改监听的参数
  setParams(language: string, accent: string) {
    language && (this.language = language);
    accent && (this.accent = accent);
  }
  // 对处理后的音频数据进行base64编码，
  toBase64(buffer: Iterable<number>) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  // 连接websocket
  connectWebSocket() {
    this.getWebSocketUrl().then((url) => {
      if ("WebSocket" in window) {
        this.webSocket = new WebSocket(url);
      } else {
        console.error("不支持websocket");
        return false;
      }
      this.setStatus(Status.INIT);
      this.webSocket.onopen = (e) => {
        this.setStatus(Status.ING);
        // 重新开始录音
        setTimeout(() => {
          this.webSocketSend();
        }, 500);
      };
      this.webSocket.onmessage = (e) => {
        this.webSocketRes(e.data);
      };
      this.webSocket.onerror = (e) => {
        this.recorderStop();
      };
      this.webSocket.onclose = (e) => {
        this.recorderStop();
      };
    });
  }
  // 初始化浏览器录音
  recorderInit() {
    // 创造音频环境
    try {
      this.audioContext = this.audioContext
        ? this.audioContext
        : new window.AudioContext();
      this.audioContext.resume();
      if (!this.audioContext) {
        console.error("浏览器不支持webAudioApi相关接口");
        return false;
      }
    } catch (e) {
      if (!this.audioContext) {
        console.error("浏览器不支持webAudioApi相关接口");
      }
    }
    // 获取浏览器录音权限成功时候的回调
    const getMediaSuccess = () => {
      // 创建一个用于通过JavaScript直接处理音频
      const scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1);
      scriptProcessor.onaudioprocess = (e) => {
        if (this.status === Status.ING) {
          // 处理音频
          this.webWorker.postMessage(e.inputBuffer.getChannelData(0));
        }
      };
      // 创建一个新的MediaStreamAudioSourceNode对象，
      const mediaSource = this.audioContext.createMediaStreamSource(
        this.streamRef
      );
      mediaSource.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);
      this.connectWebSocket();
    };
    // 获取浏览器录音权限失败时回调
    const getMediaFail = (e) => {
      alert("对不起：录音权限获取失败!");
      this.audioContext && this.audioContext.close();
      // 关闭websocket
      if (this.webSocket && this.webSocket.readyState === 1) {
        this.webSocket.close();
      }
    };
    // 获取浏览器录音权限
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          this.streamRef = stream;
          getMediaSuccess();
        })
        .catch((e) => {
          getMediaFail(e);
        });
    }
  }
  // 向websocket 发消息
  webSocketSend() {
    if (this.webSocket.readyState !== 1) return false;
    // 音频数据
    const audioData = this.audioData.splice(0, 1280);
    const params = {
      common: {
        app_id: this.appId,
      },
      business: {
        language: this.language, //小语种可在控制台--语音听写（流式）--方言/语种处添加试用
        domain: "iat",
        accent: this.accent, //中文方言可在控制台--语音听写（流式）--方言/语种处添加试用
        vad_eos: 5000,
        dwa: "wpgs", //为使该功能生效，需到控制台开通动态修正功能（该功能免费）
      },
      data: {
        status: 0,
        format: "audio/L16;rate=16000",
        encoding: "raw",
        audio: this.toBase64(audioData),
      },
    };
    this.webSocket.send(JSON.stringify(params));
    const handlerInterval = setInterval(() => {
      // websocket未连接
      if (this.webSocket.readyState !== 1) {
        this.audioData = [];
        clearInterval(handlerInterval);
        return false;
      }
      if (this.audioData.length === 0) {
        if (this.status === Status.END) {
          this.webSocket.send(
            JSON.stringify({
              data: {
                status: 2,
                format: "audio/L16;rate=16000",
                encoding: "raw",
                audio: "",
              },
            })
          );
          this.audioData = [];
          clearInterval(handlerInterval);
        }
        return false;
      }
      // 中间帧
      this.webSocket.send(
        JSON.stringify({
          data: {
            status: 1,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: this.toBase64(this.audioData.splice(0, 1280)),
          },
        })
      );
    }, 40);
  }
  // 识别结束 webSocket返回数据
  webSocketRes(resultData: string) {
    const jsonData = JSON.parse(resultData);
    if (jsonData.data && jsonData.data.result) {
      const data = jsonData.data.result;
      let str = "";
      const ws = data.ws;
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w;
      }
      // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
      // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
      if (data.pgs) {
        if (data.pgs === "apd") {
          // 将resultTextTemp同步给resultText
          this.setResultText(this.resultTextTemp, undefined);
        }
        // 将结果存储在resultTextTemp中
        this.setResultText(undefined, this.resultText + str);
      } else {
        this.setResultText(this.resultText + str, undefined);
      }
    }
    if (jsonData.code === 0 && jsonData.data.status === 2) {
      this.webSocket.close();
    }
    if (jsonData.code !== 0) {
      this.webSocket.close();
    }
  }
  // 启动录音
  recorderStart() {
    if (!this.audioContext) {
      this.recorderInit();
    } else {
      this.audioContext.resume();
      this.connectWebSocket();
    }
  }
  // 停止录音
  recorderStop() {
    if (
      !(
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent)
      )
    ) {
      // safari下suspend后再次resume录音内容将是空白，设置safari下不做suspend
      this.audioContext && this.audioContext.suspend();
    }
    this.setStatus(Status.END);
    try {
      // this.streamRef.getTracks().map(track => track.stop()) || his.streamRef.getAudioTracks()[0].stop();
    } catch (error) {
      console.error("暂停失败!");
    }
  }
  // 开始
  start() {
    this.recorderStart();
    this.setResultText("", "");
  }
  // 停止
  stop() {
    this.recorderStop();
  }
}
/**
 *  const params = {
    appId: "8c706b2b",
    apiSecret: "YjJhMmEyYTUzNmM5MGUxN2IyZWMyNjJk",
    apiKey: "4ca98c1d8a918c9afc9c41bb3a42507c",
    onWillStatusChange: function (oldStatus: Status, newStatus: Status) {
      
    },
    onTextChange: function (text: string) {
     
    },
  };
 */
export class IflytekSTTService implements ISTTService {
  recorder?: IatRecorder;

  setParams(params: IatRecorderOpts): void {
    // 初始化
    this.recorder = new IatRecorder(params);
  }
  //这里进行初始化

  start(): void {
    if (this.recorder === undefined) {
      throw new RuntimeError("未初始化STTService");
    }
    // 只有在end的时候才start
    if (this.recorder.status === Status.END) {
      this.recorder.start();
    }
  }
  stop(): void {
    if (this.recorder === undefined) {
      throw new RuntimeError("未初始化STTService");
    }
    this.recorder.stop();
  }
}
