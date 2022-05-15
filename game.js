const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

// load sounds
//sesleri yukleme
let hit = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// Egg object
//yumurta nesnesi
var eggPicture=new Image();
eggPicture.src="egg.png";
const egg = {
    x : cvs.width/2,
    y : cvs.height/2,
    radius : 10,
    velocityX : 5,
    velocityY : 5,
    speed : 7,
    color : "#ffbd59",
    eggP:eggPicture
}

var userpanpicture=new Image();
userpanpicture.src="panleft.png";
// User Pan
//kullanici tavasi
const user = {
    x : 0, // left side of canvas
    y : (cvs.height - 100)/2, // -100 the height of paddle
    width : 12,
    height : 100,
    score : 0,
    color : "#ffbd59",
    userpan:userpanpicture
}

// Computer Pan
//bilgisayar engeli
const com = {
    x : cvs.width - 10, // - width of paddle
    y : (cvs.height - 100)/2, // -100 the height of paddle
    width : 12,
    height : 100,
    score : 0,
    color : "#ffbd59s",
    
}

// NET
//orta cizgi
const net = {
    x : (cvs.width - 2)/2,
    y : 0,
    height : 10,
    width : 2,
    color : "#7843e6",
    border:2
}

//dikdortgen cizme
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


// listening to the mouse
//mouse hareketleri
cvs.addEventListener("mousemove", getMousePos);
function getMousePos(evt){
    let rect = cvs.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height/2;
}


// when COM or USER scores, we reset the egg
//her score'da yumurtanin yerini sifirlama
function resetEgg(){
    egg.x = cvs.width/2;
    egg.y = cvs.height/2;
    egg.velocityX = -egg.velocityX;
    egg.speed = 7;
}

// draw the net
//orta cizgi cizme
function drawNet(){
    for(let i = 0; i <= cvs.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}




// collision detection
//carpismalari bulma
function collision(b,p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

//control mechanism
//kontrol mekanizmasi

// draw text
//textleri yazma
function drawText(text,x,y){
    ctx.fillStyle = "#ffbd59";
    ctx.font = "75px Castellar";
    ctx.fillText(text, x, y);
}

function control()
{
    if (com.score>5)
    {
        ctx.fillStyle = "#7843e6";
        ctx.font = "40px Castellar";
        ctx.fillText("You Lose!!!",cvs.width/3,cvs.height/2);
        resetEgg();
        refresh(5000);

    }
    else if(user.score>5)
    {
        ctx.fillStyle = "#7843e6";
        ctx.font = "40px Castellar";
        ctx.fillText("You Win!!!",cvs.width/4,cvs.height/2);
        resetEgg();
        refresh(5000);
        
    }
}

//hangi tarafin score aldigini bulma
function update(){
    
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > cvs.width" the user win
    //yumurta sol dikdortgen alanini gecerse bilgisayar kazanir; sag dikdortgen alanini gecerse kullanici kazanir
    control();
    if( egg.x - egg.radius < 0 ){
        control();
        com.score++;
        comScore.play();
        control();
        resetEgg();
    }else if(egg.x + egg.radius > cvs.width){
        control();
        user.score++;
        userScore.play();
        resetEgg();
    }

    //egg velocity
    // yumurta hizi
    egg.x += egg.velocityX;
    egg.y += egg.velocityY;
    //egg.x = egg.velocityX;
    //egg.y = egg.velocityY;

    com.y += ((egg.y - (com.y + com.height/2)))*0.2;
    
    //carpisma durumunda y hizini ters cevirme
    //reversing y speed in collision
    if(egg.y - egg.radius < 0 || egg.y + egg.radius > cvs.height){
        egg.velocityY = -egg.velocityY;
    }
    
    // en son hangi oyuncunun oynadigi
    //which player played last
    let player = (egg.x + egg.radius < cvs.width/2) ? user : com;
    
    // carpisma varsa
    //if there is a collision
    if(collision(egg,player)){
        hit.play();
        // yumurtanin carptigi yeri bulma
        //find where the ball hit

        let collidePoint = (egg.y - (player.y + player.height/2));
        // collidePoint:get numbers between -1 and 1.
        //-1 ve +1 arasinda deger alma
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height/2);
        
        // top of the paddle or pan: to take a -45degrees
        // center of the paddle or pan: to take a 0degrees
        // bottom of the paddle or pan: to take a 45degrees
        // engelin ust tarafina carpan top -45 derece gider
        //alt tarafina carpan top 45 derece
        //ortasina carpan top 0 aciyla gider
        let angleRad = (45) * collidePoint;
        
        // change the X and Y velocity direction
        //x ve y hiz yonunu degistirme
        let direction = (egg.x + egg.radius < cvs.width/2) ? 1 : -1;
        egg.velocityX = direction * egg.speed * Math.cos(angleRad);
        egg.velocityY = egg.speed * Math.sin(angleRad);
        
        // speed up the egg everytime a paddle hits it.
        //yumurta her carptiginda hizi arttirma
        egg.speed += 0.01;
    }
}

// statgaem function, the function that does al the drawing
//cizim fonksiyonu
function startGame(){
    
    // clear the canvas
    //canvas temizleme
    drawRect(0, 0, cvs.width, cvs.height, "white");
    
    // draw the user score to the left
    //kullanici score solda
    drawText(user.score,cvs.width/4,cvs.height/5);
    
    // draw the computer score to the right
    //bilgisayar score sagda
    drawText(com.score,3*cvs.width/4,cvs.height/5);
    
    // draw the net
    //orta cizgiyi cizme
    drawNet();  
    // draw the user's pan
    //drawRect(user.x, user.y, user.width, user.height, user.color);
    ctx.drawImage(user.userpan,user.x,user.y);
    // draw the computer's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    //ctx.drawImage(com.compan,com.x,com.y);
    // draw the ball
    //drawArc(ball.x, ball.y, ball.radius, ball.color);
    ctx.drawImage(egg.eggP,egg.x,egg.y)
    control();
}
function game(){
    update();
    startGame();
}
//saniyede ekran sayisi
// number of frames per second
let framePerSecond = 50;
function gaming()
{
    //oyun fonksiyonunu cagirma
    let loop = setInterval(game,1000/framePerSecond);
}

function speedup()
{
    setInterval(game,1000/framePerSecond)
}
function share()
{
    const link = document.querySelector('a');
    const button = document.querySelector('#share');
    link.textContent = URL;
    link.href = URL;
    console.log(URL);
}

function refresh(time) {
    setTimeout("location.reload(true);", time);
  }