/**
 * artDrawings
 * 먹화 드로잉 함수 모음 — 3D 텍스처와 모달 이미지에서 공통으로 사용
 * 모든 좌표는 400×500 기준으로 작성하고 drawInkArt에서 스케일 적용
 */

import * as THREE from "three";

export type ArtType =
  | "plum"
  | "bamboo"
  | "mountain"
  | "orchid"
  | "bird"
  | "chrysanthemum"
  | "lotus"
  | "pine"
  | "grape"
  | "peony"
  | "carp"
  | "tiger"
  | "crane";

/** 붉은 낙관 (도장) */
function drawSeal(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
  ctx.fillRect(340, 440, 32, 32);
  ctx.fillStyle = "#f8f4ed";
  ctx.font = "bold 16px serif";
  ctx.textAlign = "center";
  ctx.fillText("순", 356, 462);
}

/** 홍매도 */
function drawPlum(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(50, 40, 30, 0.75)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(80, 500);
  ctx.bezierCurveTo(100, 380, 160, 340, 200, 220);
  ctx.bezierCurveTo(230, 140, 260, 100, 300, 60);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(200, 220);
  ctx.bezierCurveTo(240, 200, 280, 220, 320, 200);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(170, 310);
  ctx.bezierCurveTo(130, 290, 100, 300, 70, 280);
  ctx.stroke();
  (
    [
      [290, 70],
      [310, 110],
      [330, 55],
      [260, 85],
      [340, 85],
    ] as [number, number][]
  ).forEach(([fx, fy]) => {
    ctx.fillStyle = "rgba(195, 100, 110, 0.65)";
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.ellipse(
        fx + Math.cos(angle) * 10,
        fy + Math.sin(angle) * 10,
        7, 5, angle, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "rgba(230, 190, 60, 0.9)";
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** 풍죽도 */
function drawBamboo(ctx: CanvasRenderingContext2D) {
  const drawStalk = (x: number, lean: number) => {
    ctx.strokeStyle = "rgba(55, 75, 45, 0.7)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    let y = 500;
    for (let seg = 0; seg < 7; seg++) {
      ctx.beginPath();
      ctx.moveTo(x + lean * seg, y);
      ctx.lineTo(x + lean * (seg + 1), y - 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + lean * (seg + 1) - 6, y - 60);
      ctx.lineTo(x + lean * (seg + 1) + 6, y - 60);
      ctx.stroke();
      y -= 60;
    }
    ctx.lineWidth = 2;
    (
      [
        [x + lean * 3, 320],
        [x + lean * 5, 200],
      ] as [number, number][]
    ).forEach(([lx, ly]) => {
      (
        [
          [-1, -1],
          [1, -1],
          [0, -1.4],
        ] as [number, number][]
      ).forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.bezierCurveTo(
          lx + dx * 25, ly + dy * 20,
          lx + dx * 50, ly + dy * 40,
          lx + dx * 60, ly + dy * 10
        );
        ctx.stroke();
      });
    });
  };
  drawStalk(120, 2);
  drawStalk(220, -1.5);
  drawStalk(300, 1);
}

/** 산수도 */
function drawMountain(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(80, 70, 60, 0.08)";
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(100, 150, 200, 260);
  ctx.quadraticCurveTo(300, 100, 400, 350);
  ctx.lineTo(400, 420);
  ctx.fill();

  ctx.fillStyle = "rgba(55, 45, 35, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, 500);
  ctx.quadraticCurveTo(60, 300, 150, 360);
  ctx.quadraticCurveTo(200, 220, 260, 310);
  ctx.quadraticCurveTo(320, 240, 400, 420);
  ctx.lineTo(400, 500);
  ctx.fill();

  const mist = ctx.createLinearGradient(0, 310, 0, 390);
  mist.addColorStop(0, "rgba(248, 244, 237, 0)");
  mist.addColorStop(0.5, "rgba(248, 244, 237, 0.65)");
  mist.addColorStop(1, "rgba(248, 244, 237, 0)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, 310, 400, 80);

  ctx.fillStyle = "rgba(40, 35, 25, 0.5)";
  ctx.beginPath();
  ctx.moveTo(300, 420);
  ctx.lineTo(310, 300);
  ctx.lineTo(320, 420);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(310, 295, 25, 0, Math.PI * 2);
  ctx.fill();
}

/** 묵란도 */
function drawOrchid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(50, 60, 40, 0.65)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  (
    [
      [160, 480, 80, 200],
      [200, 480, 300, 180],
      [220, 480, 350, 280],
      [140, 460, 50, 300],
    ] as [number, number, number, number][]
  ).forEach(([sx, sy, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2 + 30, (sy + ey) / 2, ex, ey);
    ctx.stroke();
  });
  (
    [
      [250, 240],
      [290, 190],
      [230, 170],
    ] as [number, number][]
  ).forEach(([fx, fy]) => {
    ctx.fillStyle = "rgba(140, 100, 160, 0.5)";
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(
        fx + Math.cos(angle) * 14,
        fy + Math.sin(angle) * 14,
        10, 7, angle, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "rgba(230, 190, 60, 0.9)";
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** 조수도 */
function drawBird(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.bezierCurveTo(100, 280, 200, 260, 320, 230);
  ctx.bezierCurveTo(360, 220, 400, 200, 400, 180);
  ctx.stroke();
  (
    [
      [250, 215],
      [310, 200],
    ] as [number, number][]
  ).forEach(([bx, by]) => {
    ctx.fillStyle = "rgba(60, 50, 40, 0.75)";
    ctx.beginPath();
    ctx.ellipse(bx, by, 18, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + 16, by - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - 14, by);
    ctx.lineTo(bx - 28, by - 8);
    ctx.lineTo(bx - 26, by + 2);
    ctx.fill();
  });
}

/** 황국도 */
function drawChrysanthemum(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(50, 60, 35, 0.6)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(200, 500);
  ctx.bezierCurveTo(195, 400, 185, 340, 200, 250);
  ctx.stroke();
  (
    [
      [175, 380],
      [215, 340],
    ] as [number, number][]
  ).forEach(([lx, ly]) => {
    ctx.fillStyle = "rgba(60, 85, 45, 0.45)";
    ctx.beginPath();
    ctx.ellipse(lx, ly, 25, 15, -0.4, 0, Math.PI * 2);
    ctx.fill();
  });
  const cx = 200,
    cy = 230;
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    ctx.fillStyle = "rgba(210, 180, 80, 0.65)";
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(angle) * 28,
      cy + Math.sin(angle) * 28,
      10, 6, angle, 0, Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(190, 140, 40, 0.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
}

/** 연화도 */
function drawLotus(ctx: CanvasRenderingContext2D) {
  // 줄기
  ctx.strokeStyle = "rgba(55, 90, 55, 0.65)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(200, 500);
  ctx.bezierCurveTo(195, 400, 185, 360, 200, 300);
  ctx.stroke();
  // 연잎
  ctx.fillStyle = "rgba(70, 110, 65, 0.3)";
  ctx.beginPath();
  ctx.ellipse(145, 390, 55, 25, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 꽃잎 5장
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const cx = 200 + Math.cos(angle) * 48;
    const cy = 220 + Math.sin(angle) * 48;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 44, angle + Math.PI / 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(210, 170, 190, 0.45)";
    ctx.fill();
    ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
  // 꽃심
  ctx.beginPath();
  ctx.arc(200, 220, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(230, 195, 80, 0.7)";
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.5)";
  ctx.stroke();
}

/** 송학도 */
function drawPine(ctx: CanvasRenderingContext2D) {
  // 소나무 줄기
  ctx.strokeStyle = "rgba(60, 45, 30, 0.75)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(200, 500);
  ctx.bezierCurveTo(195, 400, 180, 320, 185, 230);
  ctx.stroke();
  // 가지들
  const branches: [number, number, number, number, number, number][] = [
    [185, 300, 100, 260, 60, 240],
    [185, 260, 290, 210, 330, 195],
    [185, 230, 120, 180, 90, 155],
    [185, 230, 270, 175, 300, 155],
  ];
  ctx.lineWidth = 3;
  branches.forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
  });
  // 솔잎 뭉치
  const needleClusters = [[60, 230], [330, 185], [90, 148], [300, 148], [185, 110]];
  needleClusters.forEach(([cx, cy]) => {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
      ctx.strokeStyle = "rgba(50, 80, 45, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
}

/** 포도도 */
function drawGrape(ctx: CanvasRenderingContext2D) {
  // 덩굴 줄기
  ctx.strokeStyle = "rgba(60, 45, 30, 0.65)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(200, 80);
  ctx.bezierCurveTo(220, 130, 210, 170, 200, 200);
  ctx.stroke();
  // 잎
  ctx.fillStyle = "rgba(65, 105, 55, 0.35)";
  ctx.beginPath();
  ctx.ellipse(145, 120, 50, 35, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.5)";
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(265, 100, 45, 32, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 포도송이
  const rows = [[1], [2], [3], [4], [3], [2], [1]];
  let startY = 210;
  rows.forEach((row) => {
    const count = row[0];
    const startX = 200 - (count - 1) * 24;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * 24 * 2, startY, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 70, 140, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(50, 40, 30, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    startY += 36;
  });
}

/** 모란도 */
function drawPeony(ctx: CanvasRenderingContext2D) {
  // 줄기·잎
  ctx.strokeStyle = "rgba(55, 85, 50, 0.6)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(200, 500);
  ctx.bezierCurveTo(200, 420, 195, 370, 200, 320);
  ctx.stroke();
  [[140, 400, 0.4], [260, 380, -0.4]].forEach(([lx, ly, angle]) => {
    ctx.fillStyle = "rgba(65, 105, 55, 0.3)";
    ctx.beginPath();
    ctx.ellipse(lx as number, ly as number, 42, 24, angle as number, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  // 꽃잎 (겹겹이 3층)
  [[55, 1.0], [38, 0.55], [22, 0.35]].forEach(([r, alpha], layer) => {
    const count = 7 - layer;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + layer * 0.3;
      const cx = 200 + Math.cos(angle) * (r as number) * 0.6;
      const cy = 230 + Math.sin(angle) * (r as number) * 0.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r as number, (r as number) * 0.65, angle, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 120, 130, ${alpha})`;
      ctx.fill();
      ctx.strokeStyle = "rgba(50, 40, 30, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  // 꽃심
  ctx.beginPath();
  ctx.arc(200, 230, 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(230, 190, 60, 0.85)";
  ctx.fill();
}

/** 어락도 (잉어) */
function drawCarp(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(50, 40, 30, 0.7)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  // 물결
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(60, 380 + i * 25);
    ctx.bezierCurveTo(150, 365 + i * 25, 250, 395 + i * 25, 340, 380 + i * 25);
    ctx.strokeStyle = `rgba(80, 110, 160, ${0.25 - i * 0.05})`;
    ctx.stroke();
  }
  // 몸통
  ctx.beginPath();
  ctx.ellipse(190, 270, 90, 50, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(190, 150, 100, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.65)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 비늘
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      ctx.beginPath();
      ctx.arc(130 + col * 30 + (row % 2) * 15, 250 + row * 14, 11, Math.PI, Math.PI * 2);
      ctx.strokeStyle = "rgba(50, 40, 30, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // 꼬리
  ctx.beginPath();
  ctx.moveTo(275, 270);
  ctx.bezierCurveTo(310, 230, 330, 215, 310, 270);
  ctx.bezierCurveTo(330, 325, 310, 310, 275, 270);
  ctx.fillStyle = "rgba(190, 150, 100, 0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 눈
  ctx.beginPath();
  ctx.arc(118, 262, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(30, 20, 10, 0.8)";
  ctx.fill();
  // 수염
  [[118, 258], [118, 266]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 20, y - 8, x - 30, y + 5, x - 35, y);
    ctx.strokeStyle = "rgba(50, 40, 30, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/** 맹호도 (호랑이) */
function drawTiger(ctx: CanvasRenderingContext2D) {
  // 몸통
  ctx.beginPath();
  ctx.ellipse(200, 300, 95, 65, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(210, 165, 80, 0.5)";
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 머리
  ctx.beginPath();
  ctx.ellipse(200, 180, 65, 58, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(210, 165, 80, 0.5)";
  ctx.fill();
  ctx.stroke();
  // 줄무늬
  const stripes = [
    [150, 160, 165, 145], [165, 148, 175, 132],
    [220, 148, 230, 132], [235, 160, 250, 145],
    [130, 290, 115, 275], [140, 315, 122, 305],
    [260, 290, 275, 275], [250, 315, 268, 305],
  ] as [number, number, number, number][];
  stripes.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "rgba(60, 40, 20, 0.45)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
  });
  // 눈
  [[-25, -18], [25, -18]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.ellipse(200 + dx, 180 + dy, 10, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(190, 140, 40, 0.8)";
    ctx.fill();
    ctx.strokeStyle = "rgba(50, 40, 30, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(200 + dx, 180 + dy, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20, 15, 10, 0.9)";
    ctx.fill();
  });
  // 코
  ctx.beginPath();
  ctx.ellipse(200, 196, 8, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(180, 100, 90, 0.7)";
  ctx.fill();
  // 수염
  [[-1, 0], [1, 0]].forEach(([dir]) => {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + dir * 60, 198);
    ctx.strokeStyle = "rgba(240, 230, 210, 0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/** 쌍학도 (학) */
function drawCrane(ctx: CanvasRenderingContext2D) {
  // 소나무 가지
  ctx.strokeStyle = "rgba(55, 42, 28, 0.65)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(60, 500);
  ctx.bezierCurveTo(80, 400, 100, 350, 130, 290);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(130, 290);
  ctx.bezierCurveTo(180, 270, 240, 265, 300, 270);
  ctx.stroke();
  // 학 1 (서 있는 자세)
  // 몸통
  ctx.beginPath();
  ctx.ellipse(230, 230, 32, 18, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(240, 238, 232, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 목·머리
  ctx.beginPath();
  ctx.moveTo(205, 220);
  ctx.bezierCurveTo(195, 190, 190, 165, 185, 145);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(185, 138, 10, 8, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(240, 238, 232, 0.9)";
  ctx.fill();
  ctx.stroke();
  // 붉은 정수리
  ctx.beginPath();
  ctx.ellipse(185, 130, 7, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(190, 60, 50, 0.85)";
  ctx.fill();
  // 부리
  ctx.beginPath();
  ctx.moveTo(178, 138);
  ctx.lineTo(155, 136);
  ctx.strokeStyle = "rgba(50, 40, 30, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 다리
  [[215, 248], [235, 248]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 5, y + 25);
    ctx.strokeStyle = "rgba(50, 40, 30, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  // 꼬리 깃털
  ctx.beginPath();
  ctx.moveTo(258, 230);
  ctx.bezierCurveTo(280, 215, 295, 220, 285, 240);
  ctx.fillStyle = "rgba(30, 25, 20, 0.5)";
  ctx.fill();
  ctx.stroke();
}

/**
 * 먹화를 주어진 크기의 canvas에 그린다
 * 모든 그리기는 400×500 기준 좌표를 사용하고 ctx.scale로 대상 크기에 맞춘다
 */
export function drawInkArt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: ArtType
) {
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.scale(w / 400, h / 500);

  switch (type) {
    case "plum":          drawPlum(ctx);          break;
    case "bamboo":        drawBamboo(ctx);         break;
    case "mountain":      drawMountain(ctx);       break;
    case "orchid":        drawOrchid(ctx);         break;
    case "bird":          drawBird(ctx);           break;
    case "chrysanthemum": drawChrysanthemum(ctx);  break;
    case "lotus":         drawLotus(ctx);           break;
    case "pine":          drawPine(ctx);            break;
    case "grape":         drawGrape(ctx);           break;
    case "peony":         drawPeony(ctx);           break;
    case "carp":          drawCarp(ctx);            break;
    case "tiger":         drawTiger(ctx);           break;
    case "crane":         drawCrane(ctx);           break;
  }
  drawSeal(ctx);

  ctx.restore();
}

/** Three.js 텍스처 생성 (3D 액자용, 400×500) */
export function createArtTexture(type: ArtType): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext("2d")!;
  drawInkArt(ctx, 400, 500, type);
  return new THREE.CanvasTexture(canvas);
}
