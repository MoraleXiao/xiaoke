const PIECE_DEFINITIONS = [
  {
    id: "large-a",
    name: "大三角 A",
    type: "large-triangle",
    color: "#ff7a59",
    description: "适合搭出屋顶、翅膀、山坡等大轮廓。",
    points: [
      [-100, -100],
      [100, -100],
      [-100, 100],
    ],
  },
  {
    id: "large-b",
    name: "大三角 B",
    type: "large-triangle",
    color: "#ffb347",
    description: "第二块大三角，常和另一块组合出主体。",
    points: [
      [-100, -100],
      [100, -100],
      [-100, 100],
    ],
  },
  {
    id: "medium",
    name: "中三角",
    type: "medium-triangle",
    color: "#7ad97a",
    description: "适合补足斜边结构，也能做尾巴或船帆。",
    points: [
      [-70.71, -70.71],
      [70.71, -70.71],
      [-70.71, 70.71],
    ],
  },
  {
    id: "small-a",
    name: "小三角 A",
    type: "small-triangle",
    color: "#29b6f6",
    description: "适合做耳朵、脚尖、装饰角。",
    points: [
      [-50, -50],
      [50, -50],
      [-50, 50],
    ],
  },
  {
    id: "small-b",
    name: "小三角 B",
    type: "small-triangle",
    color: "#8479ff",
    description: "另一块小三角，适合局部细节和补形。",
    points: [
      [-50, -50],
      [50, -50],
      [-50, 50],
    ],
  },
  {
    id: "square",
    name: "正方形",
    type: "square",
    color: "#ef5da8",
    description: "适合做身体中段、窗户或几何中心。",
    points: [
      [0, -50],
      [50, 0],
      [0, 50],
      [-50, 0],
    ],
  },
  {
    id: "parallelogram",
    name: "平行四边形",
    type: "parallelogram",
    color: "#14c8b7",
    description: "翻面后很适合做尾翼、鱼尾、屋檐。",
    points: [
      [-75, 25],
      [-25, -25],
      [75, -25],
      [25, 25],
    ],
  },
];

const TEMPLATE_DEFINITIONS = [
  {
    id: "cat",
    name: "小猫",
    description: "抬头坐姿的小猫，适合练习轮廓观察。",
    caption: "模板：小猫。试着拼出耳朵、身体和卷起的尾巴。",
    placements: {
      "large-a": { x: 470, y: 390, rotation: 0, flip: 1 },
      "large-b": { x: 540, y: 270, rotation: 90, flip: 1 },
      medium: { x: 585, y: 395, rotation: 180, flip: 1 },
      "small-a": { x: 620, y: 170, rotation: 45, flip: 1 },
      "small-b": { x: 692, y: 170, rotation: 135, flip: 1 },
      square: { x: 645, y: 244, rotation: 0, flip: 1 },
      parallelogram: { x: 374, y: 362, rotation: -45, flip: -1 },
    },
  },
  {
    id: "boat",
    name: "小船",
    description: "含船身与双帆，适合讲解平衡与对称。",
    caption: "模板：小船。观察大三角如何撑起船帆，平行四边形如何形成船头。",
    placements: {
      "large-a": { x: 395, y: 270, rotation: 45, flip: 1 },
      "large-b": { x: 525, y: 270, rotation: 135, flip: 1 },
      medium: { x: 595, y: 262, rotation: 225, flip: 1 },
      "small-a": { x: 355, y: 410, rotation: 225, flip: 1 },
      "small-b": { x: 655, y: 410, rotation: 315, flip: 1 },
      square: { x: 506, y: 412, rotation: 45, flip: 1 },
      parallelogram: { x: 436, y: 414, rotation: 0, flip: 1 },
    },
  },
  {
    id: "rocket",
    name: "火箭",
    description: "竖直向上的火箭，适合课堂热身拼搭。",
    caption: "模板：火箭。试着拼出尖头、机身和两侧尾翼。",
    placements: {
      "large-a": { x: 450, y: 360, rotation: -45, flip: 1 },
      "large-b": { x: 575, y: 360, rotation: 225, flip: 1 },
      medium: { x: 510, y: 468, rotation: 180, flip: 1 },
      "small-a": { x: 510, y: 146, rotation: 180, flip: 1 },
      "small-b": { x: 412, y: 512, rotation: 0, flip: 1 },
      square: { x: 510, y: 286, rotation: 45, flip: 1 },
      parallelogram: { x: 610, y: 512, rotation: 180, flip: -1 },
    },
  },
  {
    id: "house",
    name: "小屋",
    description: "有屋顶和侧窗的小房子，适合低年级模仿。",
    caption: "模板：小屋。先拼屋顶，再补墙体与窗格会更顺手。",
    placements: {
      "large-a": { x: 402, y: 244, rotation: 0, flip: 1 },
      "large-b": { x: 602, y: 244, rotation: 90, flip: 1 },
      medium: { x: 510, y: 388, rotation: 45, flip: 1 },
      "small-a": { x: 380, y: 448, rotation: 45, flip: 1 },
      "small-b": { x: 642, y: 448, rotation: 135, flip: 1 },
      square: { x: 510, y: 450, rotation: 45, flip: 1 },
      parallelogram: { x: 510, y: 182, rotation: 0, flip: 1 },
    },
  },
];

const pieceState = PIECE_DEFINITIONS.map((piece) => ({
  ...piece,
  placed: false,
  snapped: false,
  x: 0,
  y: 0,
  rotation: 0,
  flip: 1,
  zIndex: 0,
}));

const state = {
  selectedPieceId: null,
  activeTemplateId: null,
  drag: null,
  zCounter: 0,
};

const boardSvg = document.getElementById("board-svg");
const pieceLayer = document.getElementById("piece-layer");
const templateLayer = document.getElementById("template-layer");
const pieceLibrary = document.getElementById("piece-library");
const templateList = document.getElementById("template-list");
const placedCount = document.getElementById("placed-count");
const snappedCount = document.getElementById("snapped-count");
const templateName = document.getElementById("template-name");
const boardEmpty = document.getElementById("board-empty");
const templateCaption = document.getElementById("template-caption");
const selectedPieceBadge = document.getElementById("selected-piece-badge");
const selectedEmpty = document.getElementById("selected-empty");
const selectedCard = document.getElementById("selected-card");
const selectedPieceName = document.getElementById("selected-piece-name");
const selectedPieceMeta = document.getElementById("selected-piece-meta");

const SVG_NS = "http://www.w3.org/2000/svg";
const BOARD_WIDTH = 900;
const BOARD_HEIGHT = 620;
const GRID_STEP = 10;
const SNAP_DISTANCE = 38;
const SNAP_ROTATION = 12;

init();

function init() {
  renderAll();
  bindEvents();
}

function bindEvents() {
  document.getElementById("add-all").addEventListener("click", () => {
    pieceState.forEach((piece, index) => {
      if (!piece.placed) {
        placePieceOnBoard(piece.id, index);
      }
    });
    renderAll();
  });

  document.getElementById("clear-template").addEventListener("click", () => {
    state.activeTemplateId = null;
    pieceState.forEach((piece) => {
      piece.snapped = false;
    });
    renderAll();
  });

  document.getElementById("shuffle-pieces").addEventListener("click", () => {
    scatterPlacedPieces();
    renderAll();
  });

  document.getElementById("reset-board").addEventListener("click", () => {
    resetBoard();
    renderAll();
  });

  document.getElementById("demo-template").addEventListener("click", () => {
    if (state.activeTemplateId) {
      applyTemplateLayout();
    } else {
      scatterPlacedPieces(true);
    }
    renderAll();
  });

  selectedCard.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || !state.selectedPieceId) {
      return;
    }
    handleInspectorAction(button.dataset.action);
    renderAll();
  });

  boardSvg.addEventListener(
    "wheel",
    (event) => {
      if (!state.selectedPieceId) {
        return;
      }
      event.preventDefault();
      rotatePiece(state.selectedPieceId, event.deltaY < 0 ? 45 : -45);
      renderAll();
    },
    { passive: false },
  );

  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function handleInspectorAction(action) {
  switch (action) {
    case "rotate-left":
      rotatePiece(state.selectedPieceId, -45);
      break;
    case "rotate-right":
      rotatePiece(state.selectedPieceId, 45);
      break;
    case "flip":
      flipPiece(state.selectedPieceId);
      break;
    case "bring-front":
      bringToFront(state.selectedPieceId);
      break;
    case "nudge-center":
      movePieceToCenter(state.selectedPieceId);
      break;
    case "remove":
      returnPieceToTray(state.selectedPieceId);
      break;
    default:
      break;
  }
}

function handleKeyboardShortcuts(event) {
  if (!state.selectedPieceId) {
    return;
  }

  const piece = findPiece(state.selectedPieceId);
  if (!piece || !piece.placed) {
    return;
  }

  if (["INPUT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) {
    return;
  }

  const movement = event.shiftKey ? 20 : 8;
  let handled = true;

  switch (event.key) {
    case "ArrowUp":
      piece.y = clamp(piece.y - movement, 30, BOARD_HEIGHT - 30);
      break;
    case "ArrowDown":
      piece.y = clamp(piece.y + movement, 30, BOARD_HEIGHT - 30);
      break;
    case "ArrowLeft":
      piece.x = clamp(piece.x - movement, 30, BOARD_WIDTH - 30);
      break;
    case "ArrowRight":
      piece.x = clamp(piece.x + movement, 30, BOARD_WIDTH - 30);
      break;
    case "r":
    case "R":
      rotatePiece(piece.id, event.shiftKey ? -45 : 45);
      break;
    case "f":
    case "F":
      flipPiece(piece.id);
      break;
    case "Delete":
    case "Backspace":
      returnPieceToTray(piece.id);
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    event.preventDefault();
    piece.snapped = maybeSnapPiece(piece);
    renderAll();
  }
}

function renderAll() {
  renderLibrary();
  renderTemplates();
  renderBoard();
  renderInspector();
  renderStats();
}

function renderLibrary() {
  pieceLibrary.innerHTML = pieceState
    .map((piece) => {
      const statusLabel = piece.placed ? (piece.snapped ? "已吸附" : "已上板") : "待上板";
      return `
        <article class="piece-card ${piece.placed ? "is-active" : ""}" data-piece-card-id="${piece.id}">
          <div class="piece-preview">${buildPiecePreview(piece)}</div>
          <div class="piece-meta">
            <div class="piece-title-row">
              <strong>${piece.name}</strong>
              <span class="piece-status">${statusLabel}</span>
            </div>
            <p>${piece.description}</p>
          </div>
          <div class="piece-controls">
            <button class="piece-action" type="button" data-piece-action="${piece.placed ? "focus" : "place"}" data-piece-id="${piece.id}">
              ${piece.placed ? "定位拼板" : "加入画布"}
            </button>
            ${
              piece.placed
                ? `<button class="piece-action" type="button" data-piece-action="remove" data-piece-id="${piece.id}">收回左侧</button>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  pieceLibrary.querySelectorAll("button[data-piece-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const pieceId = button.dataset.pieceId;
      const action = button.dataset.pieceAction;
      if (action === "place") {
        placePieceOnBoard(pieceId);
      } else if (action === "focus") {
        state.selectedPieceId = pieceId;
        bringToFront(pieceId);
      } else if (action === "remove") {
        returnPieceToTray(pieceId);
      }
      renderAll();
    });
  });
}

function renderTemplates() {
  templateList.innerHTML = TEMPLATE_DEFINITIONS.map((template) => {
    const isActive = template.id === state.activeTemplateId;
    return `
      <article class="template-card ${isActive ? "is-active" : ""}">
        <div class="template-preview">${buildTemplatePreview(template)}</div>
        <div class="template-meta">
          <div class="template-title-row">
            <strong>${template.name}</strong>
          </div>
          <p>${template.description}</p>
          <div class="template-actions">
            <button type="button" data-template-id="${template.id}">
              ${isActive ? "当前模板" : "选择模板"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  templateList.querySelectorAll("button[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTemplateId = button.dataset.templateId;
      pieceState.forEach((piece) => {
        piece.snapped = maybeSnapPiece(piece);
      });
      renderAll();
    });
  });
}

function renderBoard() {
  templateLayer.innerHTML = "";
  pieceLayer.innerHTML = "";

  const activeTemplate = getActiveTemplate();
  if (activeTemplate) {
    Object.entries(activeTemplate.placements).forEach(([pieceId, placement]) => {
      const piece = findPiece(pieceId);
      if (!piece) {
        return;
      }
      const ghost = buildPieceGroup(piece, placement, {
        className: "template-piece",
        dataId: piece.id,
      });
      templateLayer.appendChild(ghost);
    });
  }

  pieceState
    .filter((piece) => piece.placed)
    .sort((left, right) => left.zIndex - right.zIndex)
    .forEach((piece) => {
      const group = buildPieceGroup(piece, piece, {
        className: [
          "workspace-piece",
          piece.id === state.selectedPieceId ? "is-selected" : "",
          piece.snapped ? "is-snapped" : "",
        ]
          .filter(Boolean)
          .join(" "),
        dataId: piece.id,
      });
      group.addEventListener("pointerdown", startDraggingPiece);
      group.addEventListener("dblclick", () => {
        state.selectedPieceId = piece.id;
        rotatePiece(piece.id, 45);
        renderAll();
      });
      pieceLayer.appendChild(group);
    });

  boardEmpty.classList.toggle("is-hidden", pieceState.some((piece) => piece.placed));
}

function renderInspector() {
  const piece = findPiece(state.selectedPieceId);
  if (!piece || !piece.placed) {
    selectedPieceBadge.textContent = "未选择";
    selectedPieceBadge.classList.add("is-idle");
    selectedEmpty.hidden = false;
    selectedCard.hidden = true;
    return;
  }

  selectedPieceBadge.textContent = piece.snapped ? "已吸附" : "已选中";
  selectedPieceBadge.classList.remove("is-idle");
  selectedPieceName.textContent = piece.name;
  selectedPieceMeta.textContent = `位置：${Math.round(piece.x)}, ${Math.round(piece.y)} · 角度：${normalizeAngle(piece.rotation)}° · ${piece.flip === 1 ? "正向" : "已翻面"}`;
  selectedEmpty.hidden = true;
  selectedCard.hidden = false;
}

function renderStats() {
  const placedPieces = pieceState.filter((piece) => piece.placed);
  const snappedPieces = placedPieces.filter((piece) => piece.snapped);
  placedCount.textContent = String(placedPieces.length);
  snappedCount.textContent = String(snappedPieces.length);

  const activeTemplate = getActiveTemplate();
  templateName.textContent = activeTemplate ? activeTemplate.name : "自由创作";
  templateCaption.textContent = activeTemplate
    ? activeTemplate.caption
    : "当前未选择模板，你可以自由拼出动物、房子、交通工具等图案。";
}

function placePieceOnBoard(pieceId, explicitIndex) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }

  if (!piece.placed) {
    const spawnPoint = getSpawnPoint(explicitIndex ?? pieceState.filter((item) => item.placed).length);
    piece.x = spawnPoint.x;
    piece.y = spawnPoint.y;
    piece.rotation = spawnPoint.rotation;
    piece.flip = 1;
  }

  piece.placed = true;
  piece.snapped = maybeSnapPiece(piece);
  bringToFront(piece.id);
  state.selectedPieceId = piece.id;
}

function returnPieceToTray(pieceId) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }
  piece.placed = false;
  piece.snapped = false;
  piece.x = 0;
  piece.y = 0;
  piece.rotation = 0;
  piece.flip = 1;
  if (state.selectedPieceId === pieceId) {
    state.selectedPieceId = null;
  }
}

function resetBoard() {
  pieceState.forEach((piece) => {
    piece.placed = false;
    piece.snapped = false;
    piece.x = 0;
    piece.y = 0;
    piece.rotation = 0;
    piece.flip = 1;
  });
  state.selectedPieceId = null;
}

function scatterPlacedPieces(ensureAll = false) {
  if (ensureAll) {
    pieceState.forEach((piece, index) => {
      if (!piece.placed) {
        placePieceOnBoard(piece.id, index);
      }
    });
  }

  pieceState.forEach((piece, index) => {
    if (!piece.placed) {
      return;
    }
    const column = index % 3;
    const row = Math.floor(index / 3);
    piece.x = 170 + column * 210 + (row % 2) * 26;
    piece.y = 150 + row * 150 + (column % 2) * 20;
    piece.rotation = (index * 45) % 360;
    piece.snapped = maybeSnapPiece(piece);
    bringToFront(piece.id);
  });
}

function applyTemplateLayout() {
  const template = getActiveTemplate();
  if (!template) {
    return;
  }

  Object.entries(template.placements).forEach(([pieceId, placement]) => {
    const piece = findPiece(pieceId);
    if (!piece) {
      return;
    }
    piece.placed = true;
    piece.x = placement.x;
    piece.y = placement.y;
    piece.rotation = placement.rotation;
    piece.flip = placement.flip;
    piece.snapped = true;
    bringToFront(piece.id);
  });

  state.selectedPieceId = null;
}

function rotatePiece(pieceId, delta) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }
  piece.rotation = normalizeAngle(piece.rotation + delta);
  piece.snapped = maybeSnapPiece(piece);
}

function flipPiece(pieceId) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }
  piece.flip *= -1;
  piece.snapped = maybeSnapPiece(piece);
}

function movePieceToCenter(pieceId) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }
  piece.x = BOARD_WIDTH / 2;
  piece.y = BOARD_HEIGHT / 2;
  piece.snapped = maybeSnapPiece(piece);
}

function bringToFront(pieceId) {
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }
  state.zCounter += 1;
  piece.zIndex = state.zCounter;
}

function startDraggingPiece(event) {
  const group = event.currentTarget;
  const pieceId = group.dataset.pieceId;
  const piece = findPiece(pieceId);
  if (!piece) {
    return;
  }

  event.preventDefault();
  state.selectedPieceId = pieceId;
  bringToFront(pieceId);

  const startPoint = toSvgPoint(event.clientX, event.clientY);
  state.drag = {
    pieceId,
    pointerId: event.pointerId,
    startX: startPoint.x,
    startY: startPoint.y,
    originX: piece.x,
    originY: piece.y,
  };

  window.addEventListener("pointermove", dragPointerMove);
  window.addEventListener("pointerup", finishDraggingPiece);
  renderAll();
}

function dragPointerMove(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) {
    return;
  }

  const piece = findPiece(state.drag.pieceId);
  if (!piece) {
    return;
  }

  const currentPoint = toSvgPoint(event.clientX, event.clientY);
  const deltaX = currentPoint.x - state.drag.startX;
  const deltaY = currentPoint.y - state.drag.startY;

  piece.x = clamp(state.drag.originX + deltaX, 20, BOARD_WIDTH - 20);
  piece.y = clamp(state.drag.originY + deltaY, 20, BOARD_HEIGHT - 20);
  piece.snapped = false;
  renderBoard();
  renderInspector();
}

function finishDraggingPiece(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) {
    return;
  }

  const piece = findPiece(state.drag.pieceId);
  if (piece) {
    piece.x = snapToGrid(piece.x);
    piece.y = snapToGrid(piece.y);
    piece.snapped = maybeSnapPiece(piece);
  }

  state.drag = null;
  window.removeEventListener("pointermove", dragPointerMove);
  window.removeEventListener("pointerup", finishDraggingPiece);
  renderAll();
}

function maybeSnapPiece(piece) {
  const template = getActiveTemplate();
  if (!template || !piece.placed) {
    return false;
  }

  const target = template.placements[piece.id];
  if (!target) {
    return false;
  }

  const distance = Math.hypot(piece.x - target.x, piece.y - target.y);
  const rotationGap = angleDistance(piece.rotation, target.rotation);
  if (distance <= SNAP_DISTANCE && rotationGap <= SNAP_ROTATION && piece.flip === target.flip) {
    piece.x = target.x;
    piece.y = target.y;
    piece.rotation = target.rotation;
    return true;
  }
  return false;
}

function buildPieceGroup(piece, placement, { className, dataId }) {
  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", className);
  group.dataset.pieceId = dataId;
  group.setAttribute("transform", `translate(${placement.x} ${placement.y})`);

  const inner = document.createElementNS(SVG_NS, "g");
  inner.setAttribute(
    "transform",
    `rotate(${placement.rotation || 0}) scale(${placement.flip || 1} 1)`,
  );

  const polygon = document.createElementNS(SVG_NS, "polygon");
  polygon.setAttribute("points", pointsToAttribute(piece.points));
  polygon.setAttribute("fill", piece.color);

  inner.appendChild(polygon);
  group.appendChild(inner);
  return group;
}

function buildPiecePreview(piece) {
  const minX = Math.min(...piece.points.map(([x]) => x));
  const maxX = Math.max(...piece.points.map(([x]) => x));
  const minY = Math.min(...piece.points.map(([, y]) => y));
  const maxY = Math.max(...piece.points.map(([, y]) => y));
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.min(56 / width, 56 / height);
  const translateX = 36 - ((minX + maxX) / 2) * scale;
  const translateY = 36 - ((minY + maxY) / 2) * scale;
  return `
    <svg class="mini-svg" viewBox="0 0 72 72" aria-hidden="true">
      <g transform="translate(${translateX} ${translateY}) scale(${scale})">
        <polygon points="${pointsToAttribute(piece.points)}" fill="${piece.color}"></polygon>
      </g>
    </svg>
  `;
}

function buildTemplatePreview(template) {
  const scale = 0.18;
  const content = Object.entries(template.placements)
    .map(([pieceId, placement]) => {
      const piece = findPiece(pieceId);
      if (!piece) {
        return "";
      }
      return `
        <g transform="translate(${placement.x * scale} ${placement.y * scale}) rotate(${placement.rotation}) scale(${placement.flip} 1)">
          <polygon points="${pointsToAttribute(piece.points)}" fill="${piece.color}" opacity="0.88"></polygon>
        </g>
      `;
    })
    .join("");

  return `
    <svg class="mini-svg" viewBox="0 0 170 100" aria-hidden="true">
      ${content}
    </svg>
  `;
}

function getActiveTemplate() {
  return TEMPLATE_DEFINITIONS.find((template) => template.id === state.activeTemplateId) || null;
}

function findPiece(pieceId) {
  return pieceState.find((piece) => piece.id === pieceId) || null;
}

function getSpawnPoint(index) {
  const spawnGrid = [
    { x: 170, y: 150, rotation: 0 },
    { x: 330, y: 150, rotation: 45 },
    { x: 490, y: 160, rotation: 90 },
    { x: 220, y: 320, rotation: 180 },
    { x: 390, y: 320, rotation: 225 },
    { x: 560, y: 320, rotation: 270 },
    { x: 310, y: 470, rotation: 315 },
  ];
  return spawnGrid[index % spawnGrid.length];
}

function toSvgPoint(clientX, clientY) {
  const point = boardSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(boardSvg.getScreenCTM().inverse());
}

function pointsToAttribute(points) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function angleDistance(from, to) {
  const raw = Math.abs(normalizeAngle(from) - normalizeAngle(to)) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

function snapToGrid(value) {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
