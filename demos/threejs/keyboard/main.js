const _settings = {
  nDetectsPerLoop: 0, // 0 -> adaptative

  loadNNOptions: {
    notHereFactor: 0.0,
    paramsPerLabel: {
      KEYBOARD: {
        thresholdDetect: 0.7
      }
    }
  },

  detectOptions: {
    isKeepTracking: true,
    isSkipConfirmation: false,
    thresholdDetectFactor: 1,
    //cutShader: 'median',
    thresholdDetectFactorUnstitch: 0.2,
    trackingFactors: [0.2, 0.2, 0.2]
  },

  NNPath: '../../../neuralNets/NN_KEYBOARD_3.json', //BEST
  //NNPath: '../../../../../../../neuralNets/raw/objectTrackingKeyboards/ARKeyboard0_2020-10-05_5_5.json',

  cameraFov: 0,//WebARRocksMediaStreamAPIHelper.evaluate_verticalFoV(),  // vertical field of View of the 3D camera in degrees. set 75 for mobile, 55 for desktop
  scanSettings:{
    nScaleLevels: 2,
    scale0Factor: 0.8,
    overlapFactors: [2, 2, 3],
    scanCenterFirst: true,
    scaleXRange: [1/15, 1.2]
  },

  followZRot: false

  //,videoURL: '../../../../../testVideos/keyboard_1.mov' // use a video from a file instead of the camera video
};

// some globals:
let _DOMVideo = null;

// entry point:
function main(){
  _DOMVideo = document.getElementById('webcamVideo');

  if (_settings.videoURL){
    // get video from file:
    _DOMVideo.setAttribute('playsinline', true); // for IOS
    _DOMVideo.setAttribute('autoplay', true);
    _DOMVideo.setAttribute('loop', true);        
    _DOMVideo.setAttribute('src', _settings.videoURL);
    _DOMVideo.oncanplay = function(e){
      _DOMVideo.oncanplay = null;
      let isPlaying = false;
      const onUserEvent = function(){
        //if (isPlaying) return;
        _DOMVideo.play();
        isPlaying = true;
        init();
      }
      window.addEventListener('click', onUserEvent); // desktop
      window.addEventListener('touchstart', onUserEvent); // mobile      
    }

  } else {
    // get video from camera:
    WebARRocksMediaStreamAPIHelper.get(_DOMVideo, init, function(err){
      throw new Error('Cannot get video feed ' + err);
    }, {
      video: {
        width:  {min: 640, max: 1920, ideal: 1280},
        height: {min: 640, max: 1920, ideal: 720},
        facingMode: {ideal: 'environment'}
      },
      audio: false
   });
 }
}

// executed when video is ready:
function init(){
  const ARCanvas = document.getElementById('ARCanvas');
  //alert('Video resolution: ' + _DOMVideo.videoWidth.toString() + 'x' + _DOMVideo.videoHeight.toString());

  WebARRocksObjectThreeHelper.init({
    video: _DOMVideo,
    ARCanvas: ARCanvas,    
    threeCanvas: document.getElementById('threeCanvas'),
    isFullScreen: true,
    NNPath: _settings.NNPath,
    callbackReady: start,
    loadNNOptions: _settings.loadNNOptions,
    nDetectsPerLoop: _settings.nDetectsPerLoop,
    detectOptions: _settings.detectOptions,
    cameraFov: _settings.cameraFov,
    followZRot: _settings.followZRot,
    scanSettings: _settings.scanSettings,
    stabilizerOptions: {n: 3}
  });
}

// Executed when WebAR.rocks.object is initialized and NN is loaded:
function start(){
  const s = 0.5;
  const debugCube = new THREE.Mesh(
    new THREE.BoxGeometry(s,s,s),
    new THREE.MeshNormalMaterial({wireframe: false})
  );
  debugCube.position.set(0, s/2, 0);
  
  WebARRocksObjectThreeHelper.add('KEYBOARD', debugCube);
  animate();
}

// main loop (rendering + detecting):
function animate(){
  WebARRocksObjectThreeHelper.animate();
  window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);
