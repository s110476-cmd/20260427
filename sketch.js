// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

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

  // Calculate dimensions: 50% of screen
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  image(video, x, y, displayW, displayH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Color-code based on left or right hand
        if (hand.handedness == "Left") {
          fill(255, 0, 255);
          stroke(255, 0, 255);
        } else {
          fill(255, 255, 0);
          stroke(255, 255, 0);
        }

        // Define the segments to connect with lines
        // 0-4: 大拇指與手腕, 5-8: 食指, 9-12: 中指, 13-16: 無名指, 17-20: 小指
        let segments = [
          [0, 1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
          [17, 18, 19, 20]
        ];

        // Draw lines for each segment
        strokeWeight(4);
        noFill();
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

        // Draw circles at keypoints
        noStroke();
        for (let keypoint of hand.keypoints) {
          let px = map(keypoint.x, 0, video.width, x, x + displayW);
          let py = map(keypoint.y, 0, video.height, y, y + displayH);
          circle(px, py, 16);
        }
      }
    }
  }
}
