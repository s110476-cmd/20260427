// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存水泡的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // 確保影片寬度已載入，避免 map 函數產生 NaN 導致無法繪圖
  if (video.width === 0) return;

  // Calculate dimensions: 50% of screen
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  image(video, x, y, displayW, displayH);

  // 在畫布中間加上置中文字
  fill(0); // 文字顏色設為黑色
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  text("414730340水OO", width / 2, height / 2);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Color-code based on left or right hand
        let handColor = (hand.handedness === "Left") ? color(255, 0, 255) : color(255, 255, 0);
        
        // 設定線條樣式
        stroke(handColor);
        strokeWeight(4);
        noFill();

        // Define the segments to connect with lines
        // 0-4: 大拇指與手腕, 5-8: 食指, 9-12: 中指, 13-16: 無名指, 17-20: 小指
        let segments = [
          [0, 1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
          [17, 18, 19, 20]
        ];

        for (let segment of segments) {
          for (let i = 0; i < segment.length - 1; i++) {
            let pt1 = hand.keypoints[segment[i]];
            let pt2 = hand.keypoints[segment[i + 1]];

            // 將影像座標映射到畫布上的置中縮放位置
            let x1 = map(pt1.x, 0, video.width, x, x + displayW);
            let y1 = map(pt1.y, 0, video.height, y, y + displayH);
            let x2 = map(pt2.x, 0, video.width, x, x + displayW);
            let y2 = map(pt2.y, 0, video.height, y, y + displayH);

            line(x1, y1, x2, y2);
          }
        }

        // 定義指尖編號
        let fingertipIndices = [4, 8, 12, 16, 20];

        // Draw circles at keypoints
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          let px = map(keypoint.x, 0, video.width, x, x + displayW);
          let py = map(keypoint.y, 0, video.height, y, y + displayH);
          
          fill(handColor);
          noStroke();
          circle(px, py, 16);

          // 如果是編號 4, 8, 12, 16, 20 的指尖，產生水泡
          if (fingertipIndices.includes(i)) {
            // 稍微限制產生頻率，避免水泡過多
            if (frameCount % 2 === 0) {
              bubbles.push({
                x: px,
                y: py,
                vx: random(-1, 1), // 左右漂移
                vy: random(-1, -3), // 向上升的速度
                size: random(5, 15),
                alpha: 255, // 透明度，用來控制破掉的感覺
                maxLife: random(50, 150) // 隨機壽命，決定在哪裡破掉
              });
            }
          }
        }
      }
    }
  }

  // 更新並繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.maxLife--;

    stroke(255, b.alpha);
    strokeWeight(1);
    fill(255, 255, 255, 50); // 半透明白色
    circle(b.x, b.y, b.size);

    // 當壽命結束或超出螢幕，移除水泡 (自動破掉)
    if (b.maxLife <= 0 || b.y < 0) {
      bubbles.splice(i, 1);
    }
  }
}
