const video = document.getElementById("video");
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
let intervalRef, canvas

const startVideo = () => {
  // Get user media
  navigator.mediaDevices
    .getUserMedia({
      video: {},
    })
    .then((stream) => {
      // Assign the video stream to the video element
      video.srcObject = stream;
    })
    .catch((err) => console.error(err));
};

const startDetection = async () => {
  console.log("Face detection initialized");
  // Loading faceapi models
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]);
  console.log("Loaded face detection models...");
  // Initializing canvas to draw on the detected portion of face
  canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = {
    width: video.width,
    height: video.height,
  };
  faceapi.matchDimensions(canvas, displaySize);
  console.log('Starting face detection...')
  
  // Initializing a process to detect the face every 100ms
  intervalRef = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // Clearing the canvas drawn before drawing a new one
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // draw detections into the canvas
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // draw the landmarks into the canvas
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    const minProbability = 0.05;
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections, minProbability);
  }, 100);
};

// Event listener to listen to the 'play' event
video.addEventListener("play", () => {
  console.log("Video started");
});

// Onclick method for the start button to start the face detection on the video
startBtn.onclick = (e) => {
    startDetection();
    startBtn.classList.add('is-danger');
    startBtn.setAttribute('disabled', '')
    stopBtn.removeAttribute('disabled')
    startBtn.innerText = 'Detecting...';
}

// Onclick method for the stop button to stop the face detection on the video
stopBtn.onclick = (e) => {
    startBtn.classList.remove('is-danger');
    stopBtn.setAttribute('disabled', '')
    startBtn.removeAttribute('disabled')
    startBtn.innerText = 'Start';
    clearInterval(intervalRef)
    clearCanvas()
}

// Function to clear the canvas when the face detection is stopped
const clearCanvas = () =>{
    // Clearing the 2d canvas rectangle
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // console.log(canvas.toString().length)
    if(canvas.toString().length){
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        // clearCanvas()
    }
    return
}

// Start video stream
startVideo()
