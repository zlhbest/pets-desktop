import * as THREE from "three";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect";
import AmmoModule from "ammojs-typed";
import { MMDFiles } from "./loadFiles";

function main() {
  AmmoModule().then(() => {
    init();
  });
}

window.onload = () => main();
function init() {
  const scene = new THREE.Scene();
  // 加入一个白色的环境光
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);
  const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const listener = new THREE.AudioListener();
  camera.add(listener);
  scene.add(camera);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const effect = new OutlineEffect(renderer);
  effect.enabled = true;
  // 添加mmd模型
  const helper = new MMDAnimationHelper();
  const loader = new MMDLoader();
  const audioParams = { delayTime: (160 * 1) / 30 };
  MMDFiles.getFiles().then((files) => {
    loader.loadWithAnimation(
      files.modelFile,
      files.vmdFiles,
      function (mmd) {
        scene.add(mmd.mesh);
        helper.add(mmd.mesh, {
          animation: mmd.animation,
          physics: true,
        });
        // loader.loadAnimation(files.cameraFile, camera, (cameraAnimation) => {
        //   helper.add(camera, {
        //     animation: cameraAnimation as THREE.AnimationClip,
        //   });
        //   new THREE.AudioLoader().load(files.audioFile, function (buffer) {
        //     const audio = new THREE.Audio(listener).setBuffer(buffer);
        //     helper.add(audio, audioParams);
        //     scene.add(mmd.mesh);
        //   });
        // });
      },
      function onProgress(xhr) {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          console.log(Math.round(percentComplete) + "% downloaded");
        }
      },
      function onError(xhr) {
        console.log(xhr);
      }
    );
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    helper.update(clock.getDelta());
    effect.render(scene, camera);
  }
  animate();
}
