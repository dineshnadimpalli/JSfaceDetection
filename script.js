const video = document.getElementById("video");
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
let intervalRef, canvas

const startVideo = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: {},
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => console.error(err));
};

const startDetection = async () => {
  console.log("Face detection initialized");
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]);
  console.log("Loaded face detection models...");
  canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = {
    width: video.width,
    height: video.height,
  };
  faceapi.matchDimensions(canvas, displaySize);
  console.log('Starting face detection...')

  intervalRef = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // draw detections into the canvas
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // draw the landmarks into the canvas
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    const minProbability = 0.05;
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections, minProbability);
  }, 100);
};

video.addEventListener("play", () => {
  console.log("Video started");
});

startBtn.onclick = (e) => {
    if(canvas)     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    startDetection();
    startBtn.classList.add('is-danger');
    startBtn.setAttribute('disabled', '')
    stopBtn.removeAttribute('disabled')
    startBtn.innerText = 'Detecting...';
}

stopBtn.onclick = (e) => {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    startBtn.classList.remove('is-danger');
    stopBtn.setAttribute('disabled', '')
    startBtn.removeAttribute('disabled')
    startBtn.innerText = 'Start';
    clearInterval(intervalRef)
}


// Start video stream
startVideo()
