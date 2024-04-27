/**
 * THIS IS wwwroot for r1ce.farm
 */


/**
 * 
 * Translation stuff
 * 
 */
var translations = {
  en: {
    home: "Home",
    profile: "Profile",
    works: "Works",
    events: "Events",
    blog: "Blog",
    contact: "Contact"
  },
  ja: {
    home: "ホーム",
    profile: "プロフィール",
    works: "作品",
    events: "イベント",
    blog: "ブログ",
    contact: "コンタクト"
  }
  // 他の言語を追加することも可能です
};

function switchLanguage(lang) {
  var trans = translations[lang];
  document.getElementById('nav-home').textContent = trans.home;
  document.getElementById('nav-profile').textContent = trans.profile;
  document.getElementById('nav-works').textContent = trans.works;
  document.getElementById('nav-events').textContent = trans.events;
  document.getElementById('nav-blog').textContent = trans.blog;
  document.getElementById('nav-contact').textContent = trans.contact;
}
window.switchLanguage = switchLanguage;

/**
 * Loading screen
 */

export let SceneBeingLoaded = false;

/*
window.addEventListener('load', function() {
  SceneBeingLoaded = true;
}); */


window.onload = function() {
  SceneBeingLoaded = true;  
  document.getElementById('id-audio-notification').innerText = 'ロード完了、クリックおよびタップしてください';
}

function hideLoadingScreen() {
  
  let loadingScreen = document.getElementById('loading-screen');
  //console.log(document.getElementsByTagName('body')[0]);

  if(loadingScreen){
    loadingScreen.style.opacity = '0';

    setTimeout(function() {
      loadingScreen.style.display = 'none';
    }, 1000); // 1秒後にローディング画面を非表示にする
  } else {
    console.error('Element not found');
  }
}
window.hideLoadingScreen = hideLoadingScreen;

/**
 * 
 * Shaders
 * 
 */

const VignetteShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "offset":   { type: "f", value: 0.2 },
    "darkness": { type: "f", value: -10 }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform float offset;",
    "uniform float darkness;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 texel = texture2D( tDiffuse, vUv );",
      "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
      "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",
    "}"
  ].join("\n")
};

const edgeDarkeningShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null }, // The texture to apply the effect to
    "edgeDarkness": { type: "f", value: 0.5 }, // The amount of darkening at the edge
    "centerDarkness": { type: "f", value: -0.2 } // The amount of darkening at the center
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform float edgeDarkness;",
    "uniform float centerDarkness;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
    "vec4 texColor = texture2D( tDiffuse, vUv );",
    "float dist = distance(vUv, vec2(0.5));", // Calculate distance from the center
    "float darkness = mix(centerDarkness, edgeDarkness, smoothstep(0.0, 1.0, dist));", // Interpolate between center and edge darkness based on distance
    "texColor.rgb *= 1.0 - darkness;", // Apply the darkness
    "gl_FragColor = texColor;",
    "}"
  ].join("\n")
};

const contrastShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null }, // The texture to apply the effect to
    "contrast": { type: "f", value: 0.95 }, // The amount of contrast
    "brightness": { type: "f", value: 0.10 } // The amount of brightness
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform float contrast;",
    "uniform float brightness;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
    "vec4 texColor = texture2D( tDiffuse, vUv );",
    "texColor.rgb = ((texColor.rgb - 0.5) * max(contrast, 0.0)) + 0.5 + brightness;", // Apply contrast and brightness
    "gl_FragColor = texColor;",
    "}"
  ].join("\n")
};

/**
 *  Music player / audio player
 */

let playButtonObjects = [];
let stopButtonObjects = [];

class AudioWithInfo {
  constructor(audioURI, BPM, timebias = 0) {
    this.audioURI = audioURI;
    this.BPM = BPM;
    this.timebias = 0; //(in seconds)
    this.isPlaying = false;
  }
}

let currentAudioIndex = -1;

const audioList = [
  new AudioWithInfo('audio/1.R1cefarm - Entering the torii gate.mp3', 95),
  new AudioWithInfo('audio/2.RENKA Chan - GEKIYABA DISCO.mp3', 132),
  new AudioWithInfo('audio/3.tomatoism - G.G.G.mp3', 145),
  new AudioWithInfo('audio/4.R1cefarm - R1ce phonk.mp3', 120),
  new AudioWithInfo('audio/5.uncalc - アイコンタクト.mp3', 132),
  new AudioWithInfo('audio/6.R1cefarm & Shiroroll - Killing it.mp3', 140),
  new AudioWithInfo('audio/7.R1cefarm - Onigiri Eater.mp3', 156),
  new AudioWithInfo('audio/8.uncalc - restart.mp3', 160)
];
window.audioList = audioList;

/**
 * ######################################
 * Initializes
 * ######################################
 */

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/postprocessing/RenderPass.js';

window.addEventListener("load", init);
window.addEventListener("resize", onResize);
window.addEventListener('click', onMouseClick, false);

let mixer;

let camera, scene, renderer, composer, renderPass, effectPass;

let isSceneActive = false;
window.isSceneActive = isSceneActive;

let sceneActivationTime = null;

let width, height;

//resize window
function onResize() {
  width = window.innerWidth;
  height = window.innerHeight;

  // レンダラーのサイズを調整する
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // カメラのアスペクト比を正す
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

//Activate Scene
function ActivateScene() {
  hideLoadingScreen();

  //play audio
  if(window.isSceneActive == false) {
    window.audio = new Audio('audio/GekiyabaLoungeWEB.mp3');
    window.audio.volume = 0.5; // Set the volume to 50%
    window.audio.play();
  }

  sceneActivationTime = Date.now();
  window.isSceneActive = true;
}
window.ActivateScene = ActivateScene;

/**
 * 
 * Audio n stuff
 * 
 */

function toggleAudio () {
  if(window.audio.paused) {
    window.audio.play();
    return true;
  } else {
    window.audio.pause();
    return false;
  }
}

function playAudio() {
  var imageElement = document.getElementById('audioToggleImage');

  
  if (window.audio) {
    imageElement.src = 'img/audio-on.png';
    window.audio.play();
  }
}
window.playAudio = playAudio;

function stopAudio() {
  var imageElement = document.getElementById('audioToggleImage');

  if (window.audio) {
    imageElement.src = 'img/audio-off.png';
    window.audio.pause();
  }
}
window.stopAudio = stopAudio;

function toggleAudioAndImage() {
  console.log('Toggling audio and image');

  var isPlaying = toggleAudio();
  var imageElement = document.getElementById('audioToggleImage');

  if (isPlaying) {
    imageElement.src = 'img/audio-on.png';
  } else {
    imageElement.src = 'img/audio-off.png';
  }
}
window.toggleAudioAndImage = toggleAudioAndImage;

//Initialize
function init() {
  width = window.innerWidth;
  height = window.innerHeight;

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    //canvas: document.querySelector("#myCanvas"),
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;

  //レンダラーをコンテナに設定
  const container = document.getElementById( 'container' );
  //container.appendChild(renderer.domElement); //old code
  if (container) {
    // ここでappendChildを呼び出す
    container.appendChild(renderer.domElement);
  } else {
    console.warn('!!!!!Element not found');
  }


  /**
   * Scenes Control
   */
  sceneFunc_OwaranaiMatsuriPrototypeVer2();
}

function DestroyCurrentActiveScene() {
  gonnaDestroyCurrentActiveScene = true;
}

//listen to click event
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {




  //touch to screen event for loading screen
  if(SceneBeingLoaded == true && window.isSceneActive == false){
    console.log("Attempting to activate scene...")
    window.ActivateScene();
  }

  if(window.isSceneActive == false){
    console.log("You can't click now. Scene is not active.");
    return;
  }

  // マウス座標を正規化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // マウス位置からレイを生成
  raycaster.setFromCamera(mouse, camera);

  // シーン上のすべての子オブジェクトに対してインターセクトを調べる
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    // クリックされたオブジェクトの処理
    const clickedObject = intersects[0].object;
    console.log('Clicked object:', clickedObject);

    //ここに処理を追加！
    if (clickedObject.name === "GoatPlane"){
      console.log("bahhhh");
    }

    //audio player and button visibility control
    if (/^GkybL_Play-button_00[0-7]$/.test(clickedObject.name)) {
      const ClickedIndex = parseInt(clickedObject.name.slice(-1), 10);

      console.log("Play button clicked " + ClickedIndex);
      playAudio();

      
      //play if its not playing
      if (audioList[ClickedIndex].isPlaying == false) {
        console.log("Going to play audio");

        //stop all audio, and set isPlaying to false
        audioList.forEach((audio) => {
          audio.isPlaying = false;
        });
        if (window.audio) {
          window.audio.pause();
          window.audio = null;
        }

        //set all stop buttons to invisible and play buttons to visible
        playButtonObjects.forEach(object => object.visible = true);
        stopButtonObjects.forEach(object => object.visible = false);

        //play audio
        window.audio = new Audio(audioList[ClickedIndex].audioURI);
        window.audio.volume = 0.5; // Set the volume to 50%
        window.audio.play();

        //set isPlaying to true
        window.audioList[ClickedIndex].isPlaying = true;

        //change button visibility
        clickedObject.visible = false;
        stopButtonObjects[ClickedIndex].visible = true;
      }else if(audioList[ClickedIndex].isPlaying == true) {
        console.log("Going to stop audio");

        //stop audio
        window.audio.pause();
        window.audio = null;

        //set isPlaying to false
        window.audioList[ClickedIndex].isPlaying = false;

        //change button visibility
        clickedObject.visible = true;
        stopButtonObjects[ClickedIndex].visible = false;
      }


    }

  }
}

//任意のオブジェクトのアニメーションを再生する
function startAnimation(object, animationName) {
  const animationMixer = new THREE.AnimationMixer(object);

  // Blenderで指定したアクション名を指定
  const clip = THREE.AnimationClip.findByName(gltf.animations, animationName);

  if (clip) {
    const action = animationMixer.clipAction(clip);
    action.play();
  }
}

/**
 * ######################################
 * Scenes (like in unity lmao)a
 * ######################################
 */

function sceneFunc_OwaranaiMatsuriPrototypeVer2() {
  scene = new THREE.Scene();

  //defining intro and final camera position
  let cameraIntroFinalPosition = new THREE.Vector3(0, 150, +520);
  let cameraIntroStartPosition = new THREE.Vector3(0, 150, -400);
  let cameraHalfwayPosition = new THREE.Vector3(0, 150, +60);

  //check if height is bigger than width, if its bigger, final destination should be a bit far
  if(window.innerHeight > window.innerWidth){
    cameraIntroFinalPosition = new THREE.Vector3(0, 150, +860);
    cameraIntroStartPosition = new THREE.Vector3(0, 150, 0);
    cameraHalfwayPosition = new THREE.Vector3(0, 150, +60);
  }


  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height);
  //camera.position.set(0, 150, +500);
  camera.position.copy(cameraIntroStartPosition);

  /**
   * Post Processing (PostFX)
   */

  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  //contrast
  const contrast = new ShaderPass(contrastShader);
  contrast.renderToScreen = true;
  composer.addPass(contrast);

  //edge darkening
  const edgeDarkening = new ShaderPass(edgeDarkeningShader);
  edgeDarkening.renderToScreen = true;
  composer.addPass(edgeDarkening);



  /**
   * Scene Objects
   */

  // light
  const dirLight = new THREE.AmbientLight(0xffffff, 1);
  dirLight.rotation.z = Math.PI / 9;
  scene.add(dirLight);

  // ground grid
  const grid = new THREE.GridHelper( 3000, 20, 0x696969, 0xe6e6fa );
  grid.material.opacity = 1;
  grid.material.transparent = true;
  //scene.add( grid );

  // create box
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshLambertMaterial({color: 0x6699FF});
  const box = new THREE.Mesh(geometry, material);
  box.position.set(-300,90,-300);
  //scene.add(box);


  // Main Scene
  const mainSceneLoader = new GLTFLoader();

  let mainSceneModel;
  window.mainSceneModel = mainSceneModel;
  let mainSceneModelBoolCheck = false;

  mainSceneLoader.load( 'models/GekiyabaLounge.glb', function ( gltf ) {

    mainSceneModel = gltf.scene;
    mainSceneModel.position.set( 0, 0, 0 );
    mainSceneModel.scale.set( 50, 50, 50 );
    scene.add( mainSceneModel );
    
  }, undefined, function ( e ) {

    console.error( e );

  } );

  onUpdate_PerFrame();

  var passedFrame = 0;

  // CAMERA VARIABLES
  var cameraTargetPosition = new THREE.Vector3(0,0,0);
  var cameraResultedPositionForThisFrame = new THREE.Vector3(0,0,0);

  var cameraAdditionalMovements = new THREE.Vector3(0,0,0);
  var cameraCinameticBias = new THREE.Vector3(0,0,0);
  var cameraMouseBias = new THREE.Vector3(0,0,0);
  var cameraMouseBiasWidth = 0;
  var cameraMouseBiasHeight = 0;

  var cameraPreviousPosition = new THREE.Vector3(0,0,0);

  //
  cameraTargetPosition = cameraIntroFinalPosition;

  //init for onUpdate_PerFrame 
  let isSmartphone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let godrayObject;
  let GkybL_USB3dObject;
  let usbStableSpinSpeed = 2;
  let usbcurrentSpinSpeed = 0;

  let gkybL_Objects = [];
  let gkybL_Objects_isHidden = false;

  let cut1_Objects = [];
  let cut1_Objects_isHidden = false;

  let cut2_Objects = [];
  let cut2_Objects_isHidden = false;



  let isInitialized = false;
  let brightness = 0;
  let change = 0;

  //update per frame
  function onUpdate_PerFrame(e) {
    passedFrame += 1;

    //check
    if(mainSceneModel){
      mainSceneModelBoolCheck = true;
    }else{
      mainSceneModelBoolCheck = false;
    }
    
    if(mainSceneModelBoolCheck && window.isSceneActive){

      //initialize after mainSceneModel is loaded
      function initialize() {
        // Add your initialization code here
        
        /*
        Load the objects you want to manipulate here
        */

        godrayObject = mainSceneModel.getObjectByName('02_Godray');
        GkybL_USB3dObject = mainSceneModel.getObjectByName('GkybL_USB3d');

        gkybL_Objects = mainSceneModel.children.filter(child => child.name.includes('GkybL_'));
        cut1_Objects = mainSceneModel.children.filter(child => child.name.includes('Cut1_'));
        cut2_Objects = mainSceneModel.children.filter(child => child.name.includes('Cut2_'));

        playButtonObjects = mainSceneModel.children
          .filter(child => child.name.includes('GkybL_Play-button_'))
          .sort((a, b) => a.name.localeCompare(b.name));
      
        stopButtonObjects = mainSceneModel.children
          .filter(child => child.name.includes('GkybL_Stop-button_'))
          .sort((a, b) => a.name.localeCompare(b.name));

        isInitialized = true;
      }

      if (!isInitialized) {
        initialize();
      }

      // Rest of the code...

      //reset variables
      cameraAdditionalMovements.set(0,0,0);
      cameraResultedPositionForThisFrame.set(0,0,0);
      
      //calliculate cinamatic bias (Yure)
      var howBigIsCameraYure = 2;
      cameraCinameticBias = new THREE.Vector3(Math.sin(passedFrame*0.05) * howBigIsCameraYure, Math.sin(passedFrame * 0.039) * howBigIsCameraYure, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraCinameticBias);

      //add gyro movement in case of smartphone
      if(isSmartphone){
        var howBigIsGyroYure = 100;

        var gyrobias = new THREE.Vector3(0,0,0);

        // Get accelerometer data from smartphone
        if (window.LinearAccelerationSensor) {
          const sensor = new LinearAccelerationSensor({ frequency: 60 });

          sensor.addEventListener('reading', function() {
            var accelerationX = sensor.x; // acceleration along the x-axis
            var accelerationY = sensor.y; // acceleration along the y-axis
            var accelerationZ = sensor.z; // acceleration along the z-axis

            // Apply accelerometer data to each dimension
            gyrobias.x = accelerationX * howBigIsGyroYure;
            gyrobias.y = accelerationY * howBigIsGyroYure;
            gyrobias.z = accelerationZ * howBigIsGyroYure;
          });

          sensor.start();
        } else {
          console.log('LinearAccelerationSensor is not supported');
        }
        
        //console.log(gyrobias);

        cameraAdditionalMovements = cameraAdditionalMovements.add(gyrobias);

      }

      ///Glow Godrays
      function updateBrightness() {
        change += Math.random() * 0.02 - 0.01;
        change = Math.max(Math.min(change, 0.03), -0.03);
        brightness += change;
        brightness = Math.max(Math.min(brightness, 1), 0.8);
      }
      updateBrightness();

      if (godrayObject) {
        //godrayObject.material.emissive.setRGB(brightness, brightness, brightness);
        godrayObject.material.opacity = brightness;
      }

      function spinUSB() {
        // Spin the USB, usbcurrentSpinSpeed always lerp back to usbStableSpinSpeed every frame
        usbcurrentSpinSpeed = THREE.MathUtils.lerp(usbcurrentSpinSpeed, usbStableSpinSpeed, 0.039);
        GkybL_USB3dObject.rotation.y += usbcurrentSpinSpeed * 0.01;
      }
      spinUSB();

      ///move with mouse coordinate
      window.onmousemove = function (e) {
        cameraMouseBiasWidth = ((e.clientX / window.parent.window.innerWidth) - 0.5) * 100;
        cameraMouseBiasHeight = ((e.clientY / window.parent.window.innerHeight) - 0.5) * 75;
      }
      cameraMouseBias = new THREE.Vector3(cameraMouseBiasWidth, cameraMouseBiasHeight * -1, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraMouseBias);

      //Intro scene control
      if (window.audio && !window.audio.paused) {

        // 再生時間を取得します
        const bias = 0.08;
        const playTime = (Date.now() - sceneActivationTime) / 1000 + bias; // Convert to seconds and add bias
    
        // 再生時間に基づいてシーンを制御します
        if (playTime >= 0 && playTime < 0.85) {
          //make GkybL_Objects invisible
          if(!gkybL_Objects_isHidden){
            gkybL_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 0;
            });
            gkybL_Objects_isHidden = true;
          }

          if(!cut2_Objects_isHidden) {
            cut2_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 0;
            });
            cut2_Objects_isHidden = true;
          }

        } else if (playTime >= 0.85 && playTime < 1.71) {

          if(!cut1_Objects_isHidden) {

            camera.position.copy(cameraHalfwayPosition);

            cut1_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 0;
            });
            cut1_Objects_isHidden = true;
          }

          if(cut2_Objects_isHidden) {
            cut2_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 1;
            });
            cut2_Objects_isHidden = false;
          }

        } else if (playTime >= 1.71) {

          //make GkybL_Objects visible just for the first time (one frame)
          if(!cut2_Objects_isHidden) {

            //spin usb faster
            usbcurrentSpinSpeed = 39;

            //make play button visible and hide stop button
            playButtonObjects.forEach(object => object.visible = true);
            stopButtonObjects.forEach(object => object.visible = false);

            camera.position.copy(cameraHalfwayPosition);

            cut2_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 0;
            });
            cut2_Objects_isHidden = true;
          }

          //make GkybL_Objects visible
          if(gkybL_Objects_isHidden){
            gkybL_Objects.forEach((object) => { 
              object.material.transparent = true;
              object.material.opacity = 1;
            });
            gkybL_Objects_isHidden = false;
          }

        }
        // 他の時間範囲に対するアクションも同様に追加できます
      }  
          
      //finalize camera position (with lerp) easing
      cameraResultedPositionForThisFrame = cameraTargetPosition.clone();
      cameraResultedPositionForThisFrame = cameraResultedPositionForThisFrame.add(cameraAdditionalMovements);
      camera.position.lerp(cameraResultedPositionForThisFrame, 0.02);
    }

    //it rotates box if box was instantiated
    if(box){
      box.rotation.y += 0.01;
      box.rotation.x += 0.012;
    }

    //DO NOT EDIT LOWER THAN HERE ()
    composer.render();
    //renderer.render(scene, camera); //apply this for normal render
    requestAnimationFrame(onUpdate_PerFrame);
  }
}