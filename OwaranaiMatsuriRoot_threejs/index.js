/**
 * ######################################
 * Initializes
 * ######################################
 */

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
//import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/DRACOLoader.js';
//draco decoder https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/js/libs/draco/gltf/

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

function sceneFunc_OwaranaiMatsuriPrototype() {
  scene = new THREE.Scene();

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 150, +500);

  // light
  const dirLight = new THREE.AmbientLight(0xffffff, 1);
  dirLight.rotation.z = Math.PI / 9;
  scene.add(dirLight);

  // ground
  const yukaGeo = new THREE.PlaneGeometry(500, 500, 10, 10);
  const yukaMat = new THREE.MeshPhongMaterial();
  const yuka = new THREE.Mesh(yukaGeo, yukaMat);
  yuka.position.set(0,-0.18,0);
  yuka.rotation.x = -Math.PI / 2;
  scene.add(yuka);

  // ground grid
  const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
  grid.material.opacity = 1;
  grid.material.transparent = true;
  scene.add( grid );

  // create box
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshLambertMaterial({color: 0x6699FF});
  const box = new THREE.Mesh(geometry, material);
  box.position.set(-200,90,0);
  scene.add(box);

  // goat plane
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/js/libs/draco/gltf/');

  const mainSceneLoader = new GLTFLoader();
  mainSceneLoader.setDRACOLoader( dracoLoader );

  var mainSceneModel;

  mainSceneLoader.load( 'models/GoatPlane.glb', function ( gltf ) {

    mainSceneModel = gltf.scene;
    mainSceneModel.position.set( 1, 100, 0 );
    mainSceneModel.scale.set( 50, 50, 50 );
    scene.add( mainSceneModel );

  }, undefined, function ( e ) {

    console.error( e );

  } );

  if (0) {
    console.log("lmao");
  }
  

  onUpdate_PerFrame();

  var passedFrame = 0;

  function onUpdate_PerFrame() {
    passedFrame += 1;
    
    if(mainSceneModel){
      mainSceneModel.rotation.y += 0.05;
    }

    box.rotation.y += 0.01;
    box.rotation.x += 0.012;

    //DO NOT EDIT LOWER THAN HERE ()
    renderer.render(scene, camera);
    requestAnimationFrame(onUpdate_PerFrame);
  }
}

function sceneFunc_OwaranaiMatsuriPrototypeVer2() {
  scene = new THREE.Scene();

  const cameraIntroFinalPosition = new THREE.Vector3(0, 150, +520);
  const cameraIntroStartPosition = new THREE.Vector3(0, 150, -300);

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height);
  //camera.position.set(0, 150, +500);
  camera.position.copy(cameraIntroStartPosition);
  

  // light
  const dirLight = new THREE.AmbientLight(0xffffff, 1);
  dirLight.rotation.z = Math.PI / 9;
  scene.add(dirLight);

  // ground
  /*
  const yukaGeo = new THREE.PlaneGeometry(500, 500, 10, 10);
  const yukaMat = new THREE.MeshPhongMaterial();
  const yuka = new THREE.Mesh(yukaGeo, yukaMat);
  yuka.position.set(0,-0.18,0);
  yuka.rotation.x = -Math.PI / 2;
  scene.add(yuka);
  */

  // ground grid
  const grid = new THREE.GridHelper( 3000, 20, 0x696969, 0xe6e6fa );
  grid.material.opacity = 1;
  grid.material.transparent = true;
  scene.add( grid );

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

  mainSceneLoader.load( 'models/OwaranaiMatsuriSceneXDD3.glb', function ( gltf ) {

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
      
      //calliculate cinamatic bias
      cameraCinameticBias = new THREE.Vector3(Math.sin(passedFrame*0.05) * 0.15, Math.sin(passedFrame * 0.039)* 0.15, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraCinameticBias);
      
      ///move with mouse coordinate
      window.onmousemove = function (e) {
        cameraMouseBiasWidth = ((e.clientX / window.parent.window.innerWidth) - 0.5) * 100;
        cameraMouseBiasHeight = ((e.clientY / window.parent.window.innerHeight) - 0.5) * 75;
      }
      cameraMouseBias = new THREE.Vector3(cameraMouseBiasWidth, cameraMouseBiasHeight * -1, 0);
      cameraAdditionalMovements = cameraAdditionalMovements.add(cameraMouseBias);
      
      //finalize camera position (with lerp)
      cameraResultedPositionForThisFrame = cameraTargetPosition.clone();
      cameraResultedPositionForThisFrame = cameraResultedPositionForThisFrame.add(cameraAdditionalMovements);
      camera.position.lerp(cameraResultedPositionForThisFrame, 0.039);
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

