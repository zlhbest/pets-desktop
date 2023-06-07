import { playSound } from "../../utils/audio";
import { axiosUtil } from "../axios";

const axios_util: axiosUtil = new axiosUtil(
  "https://shikongmengo-vits-uma-genshin-honkai.hf.space/api/generate"
);
const space = "https://shikongmengo-vits-uma-genshin-honkai.hf.space";
const language = "中文";
const noiseScale = 0.6; //情感控制推荐0.6到0.8
const noiseScaleW = 0.668; //发音时长
const lengthScale = 1.6; //语速,数值越大语速越慢
const speaker = "菲利克斯";
const axios = axios_util.axios;
export function get_tts_service(
  text: string,
  callback: (path: string) => void
) {
  axios({
    url: axios_util.getBaseUrl(),
    method: "post",
    data: JSON.stringify({
      data: [text, language, speaker, noiseScale, noiseScaleW, lengthScale],
    }),
    headers: {
      "content-type": "application/json",
    },
  }).then((resp) => {
    const { data } = resp.data;
    const [message, audioInfo, take] = data;
    const audioLink = `${space}/file=${audioInfo.name}`;
    playSound(audioLink);
    callback(audioLink);
  });
}
