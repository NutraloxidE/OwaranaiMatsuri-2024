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
 * 
 * Shaders
 * 
 */

const VignetteShader = {
  uniforms: {
    "tDiffuse": { type: "t", value: null },
    "offset":   { type: "f", value: 1.0 },
    "darkness": { type: "f", value: 1.0 }
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


window.addEventListener("load", init);
window.addEventListener("resize", onResize);
window.addEventListener('click', onMouseClick, false);

let mixer;

let camera, scene, renderer;

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
  container.appendChild(renderer.domElement);

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

  var mainSceneModel;

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

  function onUpdate_PerFrame(e) {
    passedFrame += 1;
    
    //camera movement animation
    
    if(mainSceneModel){
      //reset variables
      cameraAdditionalMovements.set(0,0,0);
      cameraResultedPositionForThisFrame.set(0,0,0);
      
      //calliculate cinamatic bias (Yure)
      var howBigIsCameraYure = 2;
      cameraCinameticBias = new THREE.Vector3(Math.sin(passedFrame*0.05) * howBigIsCameraYure, Math.sin(passedFrame * 0.039) * howBigIsCameraYure, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraCinameticBias);

      //add gyro movement in case of smartphone
      var isSmartphone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if(true){
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
        
        console.log(gyrobias);

        cameraAdditionalMovements = cameraAdditionalMovements.add(gyrobias);

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
    renderer.render(scene, camera);
    requestAnimationFrame(onUpdate_PerFrame);
  }
}