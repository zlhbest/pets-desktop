/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from "./control_live2d/lappdelegate";
import * as LAppDefine from "./control_live2d/lappdefine";
import { STTServiceType, getSTTService } from "./api/stt/stt_service_factory";
import { ISTTService } from "./api/stt/stt_service";
import { chatCompletion } from "./api/chatApi/openai";
import { get_tts_service } from "./api/tts/vits_online_service";
import { LAppLive2DManager } from "./control_live2d/lapplive2dmanager";

/**
 * 浏览器加载后的处理
 */
window.onload = (): void => {
  // create the application instance
  if (LAppDelegate.getInstance().initialize() == false) {
    return;
  }

  LAppDelegate.getInstance().run();

  // 进行检测语音输入
  const params = {
    apiKey: "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",
    onTextComplete: function (text: string) {
      console.log(text);
      chatCompletion(
        "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",
        text,
        (response) => {
          console.log(response);
          get_tts_service(response, (path) => {
            console.log("开始回调:" + path);
            LAppLive2DManager.getInstance()
              .getCurrentModel()
              .startRandomMotion(
                LAppDefine.MotionGroupTapBody,
                LAppDefine.PriorityNormal,
                LAppLive2DManager.getInstance()._finishedMotion,
                path
              );
          });
        }
      );
    },
  };
  // 进行语音输入
  const sttService: ISTTService = getSTTService(STTServiceType.openai, params);
  // 这里注册一下键盘空格键的输入
  addEventListener("keypress", (e) => {
    if (e.code === "Space") {
      sttService.start();
    }
  });
  addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      sttService.stop();
    }
  });
};

/**
 * 结束时的处理
 */
window.onbeforeunload = (): void => LAppDelegate.releaseInstance();

/**
 * Process when changing screen size.
 */
window.onresize = () => {
  if (LAppDefine.CanvasSize === "auto") {
    LAppDelegate.getInstance().onResize();
  }
};
