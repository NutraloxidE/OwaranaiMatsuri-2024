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
    window.audio = new Audio('audio/r1cefarmwebsite.2.mp3');
    window.audio.volume = 0.5; // Set the volume to 50%
    window.audio.play();

    window.audio.addEventListener('ended', function() {
      this.src = 'audio/r1cefarmwebsite.2.forloop.mp3'; // Change the source to the new audio
      this.loop = true; // Set the audio to loop
      this.play(); // Play the new audio
    });

  }

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
  if(SceneBeingLoaded == true){
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
 * Scenes (like in unity lmao)
 * ######################################
 */

//Templete (copy paste this to make new scene)
function sceneFunc_simpleTemplete() {
  scene = new THREE.Scene();

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, +500);

  // create box
  const geometry = new THREE.BoxGeometry(200, 200, 200);
  const material = new THREE.MeshNormalMaterial();
  const box = new THREE.Mesh(geometry, material);
  scene.add(box);

  onUpdate_PerFrame();

  function onUpdate_PerFrame() {
    box.rotation.y += 0.01;

    //DO NOT EDIT LOWER THAN HERE ()
    renderer.render(scene, camera);
    requestAnimationFrame(onUpdate_PerFrame);
  }
}

function sceneFunc_OwaranaiMatsuriPrototypeVer2() {
  scene = new THREE.Scene();

  const cameraIntroFinalPosition = new THREE.Vector3(0, 150, +520);
  const cameraIntroStartPosition = new THREE.Vector3(0, 150, -400);

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
  const dracoLoader = new DRACOLoader();
  const mainSceneLoader = new GLTFLoader();

  let mainSceneModel;
  window.mainSceneModel = mainSceneModel;
  let mainSceneModelBoolCheck = false;

  mainSceneLoader.load( 'models/shigure-depth.3.glb', function ( gltf ) {

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
  let isInitialized = false;
  let brightness = 0;
  let change = 0;

  //update per frame
  function onUpdate_PerFrame(e) {
    passedFrame += 1;

    //bloom shader time update
    
    //camera movement animation

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
        godrayObject = mainSceneModel.getObjectByName('02_Godray');
        //console.log(godrayObject);
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

      ///move with mouse coordinate
      window.onmousemove = function (e) {
        cameraMouseBiasWidth = ((e.clientX / window.parent.window.innerWidth) - 0.5) * 100;
        cameraMouseBiasHeight = ((e.clientY / window.parent.window.innerHeight) - 0.5) * 75;
      }
      cameraMouseBias = new THREE.Vector3(cameraMouseBiasWidth, cameraMouseBiasHeight * -1, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraMouseBias);
      
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