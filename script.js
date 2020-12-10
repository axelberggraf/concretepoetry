let poemContainer = document.getElementById('poem')
let titleContainer = document.getElementById('title')
let authorContainer = document.getElementById('author')
let poem = "";

let lines = [];
let colors = [];
let currentCol;
let points = [];
let lerpIndex = 0;

let curFont = "Helvetica";
let mobileDevice = false;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  mobileDevice = true;
}

let xpos;
let ypos;
let angle;

let bgcol;

let curX;
let curY;
let curA;


let finished = false;

let prevx;
let prevy;

let animate = false;
let animationSpeed = 0.0001;

let t = 0;

let moved = false;
let letterIndex = 0;
let lineIndex = 0;
let letterIndex2 = 0;
let lineIndex2 = 0;
let wordIndex = 0;
let pointsIndex = 0;
let isDragging = false;
let fontSize = 80;
let charWidth;
let clickedInit = false;
let words = "";
let lineCount = 5;

let boxes, boxes2;

let title = "";
let author = "";

let url = "https://poetrydb.org/linecount/" + lineCount


var firebaseConfig = {
  // personal firebase data goes here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
database = firebase.database();
var ref = database.ref('poems')

ref.on('value', gotData, errData);

function gotData(data){

  var gallery = document.getElementById("gallery");
  gallery.innerHTML = ""
  var photos = data.val();

  if(photos){
    var keys = Object.keys(photos);
    numPhotos = keys.length;

    for(var i = keys.length; i >= 0; i--){

      var key = keys[i];
      var ref = database.ref('poems/' + key);

      ref.on('value',addImage);

      //Add images to gallery
      function addImage(data){
        var dbpoem = data.val();
        if(dbpoem != null){

          var img = document.createElement("img");
          img.addEventListener('click', function (event) {
            zoomImage(event);
          })
          img.classList.add("image")
          img.src = dbpoem.url;

          var tit = document.createElement("P");

          tit.innerHTML = "<i>" + dbpoem.title+ "</i>"
          tit.classList.add("intext");
          var auth = document.createElement("P");
          auth.innerHTML = dbpoem.author;
          auth.classList.add("intext")

          var cont = document.createElement("div");
          cont.classList.add("cont")

          gallery.appendChild(cont);
          cont.appendChild(img);
          cont.appendChild(tit)
          cont.appendChild(auth)
        }
      }

    }



  }

  isLoaded = true;

}


function errData(err){
  console.log(err);
}


window.onload = (event) => {
  boxes = document.getElementsByClassName("color");

  for (let item of boxes) {
    item.addEventListener('click',function(e){

      for(let item of boxes){
        // item.style.border = "none";
        item.style.boxShadow = "none";
      }
      let style = getComputedStyle(e.target, "backgroundColor");
      let bgc = style.backgroundColor
      if(bgc == "rgb(0, 0, 0)"){
        currentCol = color(0);
      }else if(bgc == "rgb(255, 0, 0)"){
        currentCol = color(255,0,0);
      }else if(bgc == "rgb(0, 255, 0)"){
        currentCol = color(0,255,0);
      }else if(bgc == "rgb(0, 0, 255)"){
        currentCol = color(0,0,255);
      }else if(bgc == "rgb(255, 255, 0)"){
        currentCol = color(255,255,0);
      }else if(bgc == "rgb(255, 0, 255)"){
        currentCol = color(255,0,255);
      }else if(bgc == "rgb(255, 255, 255)"){
        currentCol = color(255,255,255);
      }
      e.target.style.boxShadow = "0px 0px 3px rgb(0,0,100)"
    });

  }

  boxes2 = document.getElementsByClassName("bgcolor");

  for (let item of boxes2) {
    item.addEventListener('click',function(e){
      for(let item of boxes2){
        item.style.boxShadow = "none";
      }

      let style = getComputedStyle(e.target, "backgroundColor");
      let bgc = style.backgroundColor

      e.target.style.boxShadow = "0px 0px 3px rgb(0,0,100)"

      if(bgc == "rgb(0, 0, 0)"){
        bgcol = color(0);

        poemContainer.style.color="white";
        titleContainer.style.color="white";
        authorContainer.style.color="white";


      }else if(bgc == "rgb(255, 255, 255)"){
        bgcol = color(255);

        poemContainer.style.color="black";
        titleContainer.style.color="black";
        authorContainer.style.color="black";

      }
    })
  }


};




function setup(){
  if(mobileDevice){
    canvas = createCanvas(window.innerWidth - 42, window.innerHeight*0.75)
  }else{
    canvas = createCanvas(window.innerWidth - 42, window.innerHeight)
  }

  canvas.parent("canvasContainer")
  canvas.id('mycanvas');
  bgcol = color(255);


  colors = [
    color(0,0,0),
    color(255,0,0),
    color(0,255,0),
    color(0,0,255)
  ]


  blendMode(MULTIPLY);
  currentCol = color(0);
  fill(currentCol);

}


function draw(){

  blendMode(BLEND);
  background(bgcol);
  if(!clickedInit){
    textSize(25);
    textAlign(CENTER,CENTER);
    if(mobileDevice){
      text("Click and drag to draw",width/2,height/3*2)
    }else{
      text("Click and drag to draw",width/2,height/2)
    }

  }


  textAlign(LEFT,BASELINE);
  letterIndex2 = 0;
  lineIndex2 = 0;


  if(animate){
    points.forEach((item,i)=>{
      if(points.length > 3){

        if(i<points.length-1){
          item.x = Math.lerp(item.x,points[i+1 + lerpIndex].x,t);
          item.y = Math.lerp(item.y,points[i+1].y,t);
        }else{
          item.x = Math.lerp(item.x,points[0].x,t);
          item.y = Math.lerp(item.y,points[0].y,t);
        }

        if(i == 0){
          deltax = points[1].x - item.x;
          deltay = points[1].y - item.y;
          item.angle = findAngle(deltax,deltay);
        }else{
          deltax = item.x - points[i-1].x;
          deltay = item.y - points[i-1].y;
          item.angle = findAngle(deltax,deltay);
        }
      }
    })
    t+= animationSpeed;
  }
  blendMode(BLEND);

  //Draw all letters
  points.forEach((item,i) =>{
    push();
    translate(item.x,item.y)

    rotate(item.angle);

    textSize(item.size);
    textFont(item.font);
    fill(item.color);
    let letter = lines[lineIndex2].substring(letterIndex2, letterIndex2+1);

    text(letter, 0, 0);
    pop();

    letterIndex2 += 1;
    if(letterIndex2 == lines[lineIndex2].length || lines[lineIndex2].length == 0){
      letterIndex2 = 0;
      lineIndex2 += 1;
    }

  })




};




function mouseDragged(){

  if(mouseY >0){
    xpos = mouseX;
    ypos = mouseY;
    if(moved === false){
      prevx = xpos
      prevy = ypos
      moved = true
    }
    dist = Math.abs((xpos-prevx))+Math.abs((ypos-prevy))

    if (lineIndex == lines.length-1 && letterIndex == lines[lines.length-1].length) {
      finished = true;

    }

    //check distance to previous point – to create a baseline for letter
    if(dist > charWidth*1.1 && !(lineIndex >= lines.length)){

      textSize(fontSize);
      if(poem){
        let letter = lines[lineIndex].substring(letterIndex, letterIndex+1);
        charWidth = textWidth(lines[lineIndex].substring(letterIndex,letterIndex+1));

      }

      let deltay = (ypos-prevy)
      let deltax = (xpos-prevx)

      angle = findAngle(deltax,deltay);

      push();
      translate(xpos,ypos)
      rotate(angle);
      pop();

      if(poem){
        poem = poem.substring(1);
        poemContainer.innerHTML = poem
      }

      //add data to array
      points.push({
        x: xpos,
        y: ypos,
        angle: angle,
        color: currentCol,
        size: fontSize,
        font: curFont
      })

      prevx = xpos
      prevy = ypos

      letterIndex += 1

      if(letterIndex == lines[lineIndex].length || lines[lineIndex].length == 0){

        if(poem){
          poem = poem.substring(4);
          poemContainer.innerHTML = poem
        }
        letterIndex = 0;
        lineIndex += 1;
      }


    }

  }
};


function mousePressed(){
  if(mouseY > 0){
    isDragging = true;
    clickedInit = true;
  }

}
function mouseReleased (){
  moved = false;
  isDragging = false;
}


//set fontsize
var slider = document.getElementById("slider");
slider.oninput = function() {
  let fz = document.getElementById('fz')
  fontSize = parseFloat(this.value,10);
  fz.innerHTML = fontSize;
  textSize(fontSize);
}

//choose font
let fontSelector = document.getElementById('fontSelector');
fontSelector.addEventListener('change',function(e){
  if(this.value == "serif"){
    curFont = "Georgia";
    textFont('Georgia');
    poemContainer.style.fontFamily="serif";
    titleContainer.style.fontFamily="serif";
    authorContainer.style.fontFamily="serif";

  }else if(this.value == "sans"){
    curFont = "Helvetica"
    textFont('Helvetica');
    poemContainer.style.fontFamily="sans-serif";
    titleContainer.style.fontFamily="sans-serif";
    authorContainer.style.fontFamily="sans-serif";
  }

})

//choose line count
var lineSlider = document.getElementById("lineSlider");
lineSlider.oninput = function() {
  let cnt = document.getElementById('cnt')
  lineCount = parseFloat(this.value,10);
  cnt.innerHTML = lineCount
  url = "https://poetrydb.org/linecount/" + lineCount
}





function clicked(){
  animate = !animate;
}


function findAngle(deltax,deltay){
  if(deltax > 0 && deltay > 0){
    angle = Math.atan(deltay/deltax)
  }
  else if (deltax == 0 && deltay > 0) {
    angle = Math.PI/2
  }
  else if (deltax < 0 && deltay > 0) {
    angle = Math.atan(Math.abs(deltax)/Math.abs(deltay)) + Math.PI/2
  }
  else if (deltax < 0 && deltay == 0) {
    angle = Math.PI
  }
  else if (deltax < 0 && deltay < 0) {
    angle = Math.atan(Math.abs(deltay)/Math.abs(deltax)) + Math.PI
  }
  else if (deltax == 0 && deltay < 0) {
    angle = Math.PI/2*3
  }
  else if (deltax > 0 && deltay < 0) {
    angle = Math.atan(Math.abs(deltax)/Math.abs(deltay)) + Math.PI/2*3
  }

  return angle;
}


//get new poem
function newPoem(){
  blendMode(BLEND);
  background(bgcol);
  poem = "";
  lines = [];

  letterIndex = 0;
  lineIndex = 0;
  pointsIndex = 0;

  points = [];

  animate = false;
  finished = false;

  t = 0;

  //fetch poem from PoetryDB
  fetch(url)
  .then(response => {
    return response.json()
  })
  .then(data => {
    let ind = Math.floor(Math.random()*data.length);

    data[ind].lines.forEach((item, i) =>{
      lines[i] = item.concat("  ");
      poem = poem.concat(item, "  <br>");
    })

    title = data[ind].title;
    author = data[ind].author;
    titleContainer.innerHTML = "<i>" + data[ind].title + "</i>"
    authorContainer.innerHTML = data[ind].author
    poemContainer.innerHTML = poem
    charWidth = textWidth(lines[0].substring(0,1));
  })
  .catch(err => {
    alert("There was an error! Try to refresh the page.");
  })


}


//upload image to firebase storage
function downloadImg(){
  let c = document.getElementById('mycanvas');
  c.toBlob(function(blob){
    var randomName = Math.floor(Math.random()*10000)
    var uploadTask = firebase.storage().ref('images/' + "image" + randomName).put(blob);

    uploadTask.on('state_changed',
    function progress(snapshot){
      background(bgcol);

    },
    function error(err){

    },

    function complete(){
      blendMode(BLEND);
      background(bgcol);
      poem = "";
      lines = [];

      letterIndex = 0;
      lineIndex = 0;
      pointsIndex = 0;

      points = [];

      animate = false;
      finished = false;

      titleContainer.innerHTML = ""
      authorContainer.innerHTML = ""
      poemContainer.innerHTML = ""

      //add reference to database
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        url = downloadURL;
        saveImage(url);
      });




    });
  });

}

//add url reference to database
function saveImage (url){
  if(title == ""){
    title = "Untitled"
  }
  if(author == ""){
    author = "Anonymous"
  }
  var photoURL = {
    url: url,
    title: title,
    author: author
  }
  console.log(photoURL)
  ref.push(photoURL);

  alert("Thank you for your contribution!");

}





function zoomImage(event){
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var modalImg = document.getElementById("img01");

  modal.style.display = "block";
  modalImg.src = event.target.src;

}

function closeModal(){
  var modal = document.getElementById("myModal");
  modal.style.display = "none";

}


//insert custom line
function addLine(){
  let input = document.getElementById('inputField')
  let str = input.value.concat("  ");
  poem = poem.concat(input.value, "  <br>");
  lines.push(str);
  input.value = "";
  charWidth = textWidth(lines[0].substring(0,1));
  poemContainer.innerHTML = poem
}

//insert custom title
function addTitle(){
  let input = document.getElementById('inputField')
  title = input.value;
  titleContainer.innerHTML = "<i>" + title + "</i>"
  input.value = "";
}

//insert custom name/author
function addName(){
  let input = document.getElementById('inputField')
  author= input.value;


  authorContainer.innerHTML = author;
  input.value = "";

}


function clearCanvas(){

  background(bgcol);
  poem = "";
  lines = [];

  letterIndex = 0;
  lineIndex = 0;
  pointsIndex = 0;

  points = [];

  animate = false;
  finished = false;

  t = 0;

  titleContainer.innerHTML = ""
  authorContainer.innerHTML = ""
  poemContainer.innerHTML = ""

}



let isHidden = false;
let footer = document.getElementById('footer')

function hideFooter(){
  a = window.pageYOffset

  if(mobileDevice){
    b = window.innerHeight/4;
  }else{
    b = document.body.scrollHeight - window.innerHeight
  }

  let c = a / window.innerHeight
  console.log(c);
  if(c > 0.3 && !isHidden){
    isHidden = true;
    footer.classList.add("hide")
  }
}




window.addEventListener('wheel',function(e){
  hideFooter();
})

window.addEventListener('touchmove',function(e){
  hideFooter();
})
