let video = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let recDiv = recordBtn.querySelector("div");
let capBtn = document.querySelector("#capture");
let capDiv = capBtn.querySelector("div");
let body = document.querySelector("body");

let mediaRecorder;
let isRecording = false;
let appliedFilter;
let chunks = [];
let minZoom = 1;
let maxZoom = 3;       //dont make it more than 3 the image quality gets worsed. 
let filters = document.querySelectorAll(".filter");

let zoomInBtn = document.querySelector(".zoom-in");
let zoomOutBtn = document.querySelector(".zoom-out");
let curZoom = 1;

let gallery = document.querySelector('#gallery');

gallery.addEventListener('click', (e)=>{
  location.assign('gallery.html');     //location is a predef obj in browser
      // www.google.com/home.html  
      //  domain       path     locn changes the path
      // '5500/' == '5500/index.html' dono same cheej h
});

zoomInBtn.addEventListener("click", (e) => {
  if (curZoom < maxZoom) {
    curZoom = curZoom + 0.1;
  }

  video.style.transform = `scale(${curZoom})`;
});

zoomOutBtn.addEventListener("click", (e) => {
  if (curZoom > minZoom) {
    curZoom = curZoom - 0.1;
  }
  video.style.transform = `scale(${curZoom})`;
});

for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("click", (e) => {
    removeFilter();         //remove any filter if exists
    appliedFilter = e.currentTarget.style.backgroundColor;  //apply new filter

    let div = document.createElement("div");
    div.style.backgroundColor = appliedFilter;
    div.classList.add("filter-div");
    body.append(div);
  });
}

recordBtn.addEventListener("click", (e) => {
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    recDiv.classList.remove("record-animation");  //stop the animation effect of video btn
  } 
  else {
    mediaRecorder.start();
    appliedFilter = "";    // color will be removed
    removeFilter();        //no filters in recording, remove from ui
    curZoom = 1;           //no zooming in videos recording
    video.style.transform = `scale(${curZoom})`;
    isRecording = true;
    recDiv.classList.add("record-animation");   //animationn effect of btn
  }
});

capBtn.addEventListener("click", () => {
  if (isRecording) return;        //dont capture photos while video is on

  capDiv.classList.add("capture-animation");     //animation effect of capture button
  setTimeout(() => {
    capDiv.classList.remove("capture-animation");
  }, 1000);      //after 1s stop the animation effect of capture btn

  
  //caputre screen img and save
  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  let tool = canvas.getContext("2d");

  tool.translate(canvas.width / 2, canvas.height / 2);   //origin shift
  tool.scale(curZoom, curZoom)
  tool.translate(-canvas.width/2, -canvas.height/2)   //shift origin back to top left corner
  
  tool.drawImage(video, 0, 0); //take the frame at this time

  if (appliedFilter) {
    tool.fillStyle = appliedFilter;
    tool.fillRect(0, 0, canvas.width, canvas.height); //to cature filtered img
  }

  let link = canvas.toDataURL(); //it is data url h, if contains all the info of canvas img
  addMedia(link, "image");
  
  // let a = document.createElement("a");
  // a.href = link;
  // a.download = "img.png";  
  // a.click();
  // a.remove();
  // canvas.remove();
});

// system gives permission for both vido aur audio, gives us promise
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(function (mediaStream) {
    //this mediastream will contain a track which will have audio and video in it

    mediaRecorder = new MediaRecorder(mediaStream); //containes input of mic and camera

    mediaRecorder.addEventListener("dataavailable", function (e) {
      //dataavailable is an event
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
      let blob = new Blob(chunks, { type: "video/mp4" }); //blab is a large binary file, to combinne all chunsk
      chunks = []; //empty krdo
      addMedia(blob, "video");
      // let a = document.createElement("a");
      // let url = window.URL.createObjectURL(blob); 
      // a.href = url;
      // a.download = "video.mp4";
      // a.click();
      // a.remove();
    });

    video.srcObject = mediaStream; //src of video is this video, media stream is an object
  })
  .catch(function (err) {
    console.log(err);
  });
//now we have to record for that we have mediaRecorder which is an inbuilt object on browser 

function removeFilter() {
  let Filter = document.querySelector(".filter-div");
  if (Filter) Filter.remove();
}

// scale(1,2) in canvas be like in x dir scale 1 and in y dir scale 2, if we apply scale(0,0)
//it will zoom from top left corner, to zoom from center, take out coordinates of center and
//do zoom from center of canvas // 3line code only
//tool.translate(canvas.width/2, canvas.height/2) origin shift
//too.scale(curZoom, curZoom)
//tool.translate(-canvas.width/2, -canvas.height/2) origin back to top left corner
