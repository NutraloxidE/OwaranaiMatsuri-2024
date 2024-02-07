import { SceneBeingLoaded } from './index.js';

let loadingText = document.getElementById('id-loading-text');
let touchText = document.getElementById('id-touch-text');

setInterval(function() {
  let loadingText = document.getElementById('id-loading-text');
  let touchText = document.getElementById('id-touch-text');

  if (SceneBeingLoaded) {
    loadingText.style.display = 'none';
    touchText.style.display = 'block';
  } else {
    loadingText.style.display = 'block';
    touchText.style.display = 'none';
  }
}, 200); // 1000 milliseconds = 1 second
