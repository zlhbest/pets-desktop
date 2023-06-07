import { IflytekSTTService } from "./Iflytek_stt_service";
import { OpenAIRecorder } from "./openai_stt_service";
import { ISTTService, Params } from "./stt_service";
//自动语音转换接口  STT speak-to-text
export interface ISTTFactory {
  // 开启流式转换
  getSTTService(type: STTServiceType, params: Params): ISTTService;
}

export enum STTServiceType {
  Iflytek,
  openai,
}

export class STTFactory implements ISTTFactory {
  getSTTService(type: STTServiceType, params: Params): ISTTService {
    let service: ISTTService;
    switch (type) {
      case STTServiceType.Iflytek: {
        service = new IflytekSTTService();
        service.setParams(params);
        break;
      }
      case STTServiceType.openai: {
        service = new OpenAIRecorder();
        service.setParams(params);
        break;
      }
    }
    return service;
  }
}

export function getSTTService(
  type: STTServiceType,
  params: Params
): ISTTService {
  const factory: ISTTFactory = new STTFactory();
  return factory.getSTTService(type, params);
}
