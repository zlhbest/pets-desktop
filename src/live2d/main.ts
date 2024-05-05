// 导入pixi和live2d模块
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";
import { setLive2dScale } from "./utils";

window["PIXI"] = PIXI;
let mainModel;
async function main() {
  // 创建pixi应用
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0, // 设置背景透明度
  });
  const dropDiv = document.getElementById("drop_div");
  // 添加到dom中 需要进行类型转换
  dropDiv.appendChild(app.view as HTMLCanvasElement);
  // 获取model 使用pixi.js 加载
  const cubism4Model =
    "https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json";
  Live2DModel.from(cubism4Model).then((model) => {
    mainModel = model;
    app.stage.addChild(model as any);
    setModel(model);
    // interaction
    model.on("hit", (hitAreas) => {
      console.log(hitAreas);
      if (hitAreas.includes("Body")) {
        model.motion("tap_body");
      }
    });
  });
}
function setModel(model: Live2DModel) {
  model.x = window.innerWidth / 2;
  model.y = window.innerHeight / 2;
  // 设置缩放
  model.scale.set(
    setLive2dScale(model.getBounds().width, model.getBounds().height)
  );
  // 设置锚点
  model.anchor.set(0.5);
}
window.addEventListener("resize", () => {
  setModel(mainModel);
});
// 执行main函数
main().then();
