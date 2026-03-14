const SHAPE_DEFINITIONS = [
  {
    id: "circle",
    label: "circle",
    chinese: "圆形",
    category: "core",
    type: "circle",
    description: "适合做太阳、车轮、气球、果实和人物脸部。",
  },
  {
    id: "triangle",
    label: "triangle",
    chinese: "三角形",
    category: "core",
    type: "triangle",
    description: "适合拼树顶、屋顶、鱼尾，也能重复组合成圣诞树。",
  },
  {
    id: "square",
    label: "square",
    chinese: "正方形",
    category: "core",
    type: "square",
    description: "适合做窗户、礼物盒、机器人身体等稳定结构。",
  },
  {
    id: "rectangle",
    label: "rectangle",
    chinese: "长方形",
    category: "core",
    type: "rectangle",
    description: "适合做树干、门、车身、桥面和长条装饰。",
  },
  {
    id: "star",
    label: "star",
    chinese: "星形",
    category: "core",
    type: "star",
    description: "适合做奖章、夜空、节日树顶和闪亮装饰。",
  },
  {
    id: "oval",
    label: "oval",
    chinese: "椭圆",
    category: "extra",
    type: "oval",
    description: "可做花瓣、叶子、鱼身和不同大小的装饰块。",
  },
  {
    id: "diamond",
    label: "diamond",
    chinese: "菱形",
    category: "extra",
    type: "diamond",
    description: "适合做风筝、花纹、鱼鳞和几何拼贴细节。",
  },
  {
    id: "heart",
    label: "heart",
    chinese: "心形",
    category: "extra",
    type: "heart",
    description: "适合做节日贺卡、图标和情感主题作品。",
  },
  {
    id: "hexagon",
    label: "hexagon",
    chinese: "六边形",
    category: "extra",
    type: "hexagon",
    description: "适合做蜂巢、徽章和科幻风格装饰。",
  },
];

const COLOR_OPTIONS = [
  "#ff6b6b",
  "#ff9f43",
  "#ffd93d",
  "#4ecdc4",
  "#45aaf2",
  "#6c5ce7",
  "#f368e0",
  "#1dd1a1",
  "#576574",
  "#222f3e",
];

const SVG_NS = "http://www.w3.org/2000/svg";
const BOARD_WIDTH = 980;
const BOARD_HEIGHT = 680;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.8;

const state = {
  instances: [],
  currentColor: COLOR_OPTIONS[0],
  selectedInstanceId: null,
  drag: null,
  zCounter: 0,
  spawnIndex: 0,
  instanceCounter: 0,
};

const coreShapeList = document.getElementById("core-shape-list");
const extraShapeList = document.getElementById("extra-shape-list");
const palette = document.getElementById("palette");
const customColorInput = document.getElementById("custom-color");
const boardSvg = document.getElementById("board-svg");
const shapeLayer = document.getElementById("shape-layer");
const boardEmpty = document.getElementById("board-empty");
const shapeCount = document.getElementById("shape-count");
const colorCount = document.getElementById("color-count");
const selectionLabel = document.getElementById("selection-label");
const selectedBadge = document.getElementById("selected-badge");
const inspectorEmpty = document.getElementById("inspector-empty");
const inspectorCard = document.getElementById("inspector-card");
const selectedName = document.getElementById("selected-name");
const selectedMeta = document.getElementById("selected-meta");
const selectedColorDot = document.getElementById("selected-color-dot");
const sizeSlider = document.getElementById("size-slider");

init();

function init() {
  renderAll();
  bindEvents();
}

function bindEvents() {
  coreShapeList.addEventListener("click", handleLibraryClick);
  extraShapeList.addEventListener("click", handleLibraryClick);

  palette.addEventListener("click", (event) => {
    const swatch = event.target.closest("button[data-color]");
    if (!swatch) {
      return;
    }
    setCurrentColor(swatch.dataset.color, true);
  });

  customColorInput.addEventListener("input", (event) => {
    setCurrentColor(event.target.value, true);
  });

  document.getElementById("scatter-shapes").addEventListener("click", () => {
    scatterShapes();
    renderAll();
  });

  document.getElementById("duplicate-selected").addEventListener("click", () => {
    duplicateSelectedShape();
    renderAll();
  });

  document.getElementById("clear-canvas").addEventListener("click", () => {
    clearCanvas();
    renderAll();
  });

  inspectorCard.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    handleInspectorAction(button.dataset.action);
    renderAll();
  });

  sizeSlider.addEventListener("input", (event) => {
    const instance = getSelectedInstance();
    if (!instance) {
      return;
    }
    instance.scale = clampScale(Number(event.target.value));
    renderBoard();
    renderInspector();
    renderStats();
  });

  boardSvg.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-instance-id]")) {
      return;
    }
    state.selectedInstanceId = null;
    renderAll();
  });

  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function handleLibraryClick(event) {
  const button = event.target.closest("button[data-add-shape]");
  if (!button) {
    return;
  }
  addShape(button.dataset.addShape);
  renderAll();
}

function handleInspectorAction(action) {
  switch (action) {
    case "scale-down":
      changeSelectedScale(-0.12);
      break;
    case "scale-up":
      changeSelectedScale(0.12);
      break;
    case "rotate-left":
      changeSelectedRotation(-15);
      break;
    case "rotate-right":
      changeSelectedRotation(15);
      break;
    case "duplicate":
      duplicateSelectedShape();
      break;
    case "bring-front":
      bringSelectedToFront();
      break;
    case "center":
      centerSelectedShape();
      break;
    case "delete":
      deleteSelectedShape();
      break;
    default:
      break;
  }
}

function handleKeyboardShortcuts(event) {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }

  if (["INPUT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) {
    return;
  }

  const movement = event.shiftKey ? 20 : 8;
  let handled = true;

  switch (event.key) {
    case "ArrowUp":
      instance.y = clamp(instance.y - movement, 40, BOARD_HEIGHT - 40);
      break;
    case "ArrowDown":
      instance.y = clamp(instance.y + movement, 40, BOARD_HEIGHT - 40);
      break;
    case "ArrowLeft":
      instance.x = clamp(instance.x - movement, 40, BOARD_WIDTH - 40);
      break;
    case "ArrowRight":
      instance.x = clamp(instance.x + movement, 40, BOARD_WIDTH - 40);
      break;
    case "r":
    case "R":
      changeSelectedRotation(event.shiftKey ? -15 : 15);
      break;
    case "+":
    case "=":
      changeSelectedScale(0.1);
      break;
    case "-":
    case "_":
      changeSelectedScale(-0.1);
      break;
    case "Delete":
    case "Backspace":
      deleteSelectedShape();
      break;
    case "d":
    case "D":
      duplicateSelectedShape();
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    event.preventDefault();
    renderAll();
  }
}

function renderAll() {
  renderShapeLibraries();
  renderPalette();
  renderBoard();
  renderInspector();
  renderStats();
}

function renderShapeLibraries() {
  coreShapeList.innerHTML = SHAPE_DEFINITIONS.filter((shape) => shape.category === "core")
    .map((shape) => buildShapeCard(shape))
    .join("");

  extraShapeList.innerHTML = SHAPE_DEFINITIONS.filter((shape) => shape.category === "extra")
    .map((shape) => buildShapeCard(shape))
    .join("");
}

function renderPalette() {
  palette.innerHTML = COLOR_OPTIONS.map((color) => {
    const isActive = color.toLowerCase() === state.currentColor.toLowerCase();
    return `
      <button
        class="color-swatch ${isActive ? "is-active" : ""}"
        type="button"
        data-color="${color}"
        style="--swatch: ${color};"
        aria-label="选择颜色 ${color}"
      ></button>
    `;
  }).join("");

  customColorInput.value = state.currentColor;
}

function renderBoard() {
  shapeLayer.innerHTML = "";

  state.instances
    .slice()
    .sort((left, right) => left.zIndex - right.zIndex)
    .forEach((instance) => {
      const definition = getShapeDefinition(instance.shapeId);
      if (!definition) {
        return;
      }

      const group = document.createElementNS(SVG_NS, "g");
      group.setAttribute(
        "class",
        ["workspace-shape", instance.id === state.selectedInstanceId ? "is-selected" : ""]
          .filter(Boolean)
          .join(" "),
      );
      group.dataset.instanceId = instance.id;
      group.setAttribute(
        "transform",
        `translate(${instance.x} ${instance.y}) rotate(${instance.rotation}) scale(${instance.scale})`,
      );
      group.innerHTML = getShapeMarkup(definition.type, instance.color);
      group.addEventListener("pointerdown", startDraggingShape);
      shapeLayer.appendChild(group);
    });

  boardEmpty.classList.toggle("is-hidden", state.instances.length > 0);
}

function renderInspector() {
  const instance = getSelectedInstance();
  if (!instance) {
    selectedBadge.textContent = "未选择";
    selectedBadge.classList.add("is-idle");
    inspectorEmpty.hidden = false;
    inspectorCard.hidden = true;
    return;
  }

  const definition = getShapeDefinition(instance.shapeId);
  selectedBadge.textContent = definition.label;
  selectedBadge.classList.remove("is-idle");
  selectedName.textContent = `${definition.label} · ${definition.chinese}`;
  selectedMeta.textContent = `颜色：${instance.color.toUpperCase()} · 大小：${Math.round(
    instance.scale * 100,
  )}% · 角度：${normalizeAngle(instance.rotation)}°`;
  selectedColorDot.style.background = instance.color;
  sizeSlider.value = String(instance.scale);
  inspectorEmpty.hidden = true;
  inspectorCard.hidden = false;
}

function renderStats() {
  shapeCount.textContent = String(state.instances.length);
  colorCount.textContent = String(new Set(state.instances.map((instance) => instance.color.toLowerCase())).size);

  const instance = getSelectedInstance();
  if (!instance) {
    selectionLabel.textContent = "未选择";
    return;
  }

  const definition = getShapeDefinition(instance.shapeId);
  selectionLabel.textContent = `${definition.label} ${instance.serial}`;
}

function buildShapeCard(shape) {
  return `
    <button
      class="shape-card"
      type="button"
      data-add-shape="${shape.id}"
      title="${shape.label} · ${shape.chinese}：${shape.description}"
      aria-label="添加 ${shape.label} ${shape.chinese}"
    >
      <span class="shape-preview">${buildShapePreview(shape)}</span>
      <span class="shape-label">${shape.label}</span>
      <span class="shape-sub">${shape.chinese}</span>
    </button>
  `;
}

function buildShapePreview(shape) {
  return `
    <svg class="mini-svg" viewBox="-100 -80 200 160" aria-hidden="true">
      ${getShapeMarkup(shape.type, state.currentColor)}
    </svg>
  `;
}

function addShape(shapeId) {
  const definition = getShapeDefinition(shapeId);
  if (!definition) {
    return;
  }

  state.instanceCounter += 1;
  const spawnPoint = getSpawnPoint(state.spawnIndex);
  state.spawnIndex += 1;

  const instance = {
    id: `shape-${state.instanceCounter}`,
    serial: state.instanceCounter,
    shapeId,
    x: spawnPoint.x,
    y: spawnPoint.y,
    rotation: spawnPoint.rotation,
    scale: 1,
    color: state.currentColor,
    zIndex: nextZIndex(),
  };

  state.instances.push(instance);
  state.selectedInstanceId = instance.id;
}

function duplicateSelectedShape() {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }

  state.instanceCounter += 1;
  const duplicate = {
    ...instance,
    id: `shape-${state.instanceCounter}`,
    serial: state.instanceCounter,
    x: clamp(instance.x + 34, 50, BOARD_WIDTH - 50),
    y: clamp(instance.y + 34, 50, BOARD_HEIGHT - 50),
    zIndex: nextZIndex(),
  };

  state.instances.push(duplicate);
  state.selectedInstanceId = duplicate.id;
}

function deleteSelectedShape() {
  if (!state.selectedInstanceId) {
    return;
  }
  state.instances = state.instances.filter((instance) => instance.id !== state.selectedInstanceId);
  state.selectedInstanceId = null;
}

function clearCanvas() {
  state.instances = [];
  state.selectedInstanceId = null;
  state.spawnIndex = 0;
}

function scatterShapes() {
  state.instances.forEach((instance, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    instance.x = 140 + column * 190 + (row % 2) * 22;
    instance.y = 120 + row * 140 + (column % 2) * 18;
    instance.rotation = (index * 12) % 360;
    instance.zIndex = nextZIndex();
  });
}

function centerSelectedShape() {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }
  instance.x = BOARD_WIDTH / 2;
  instance.y = BOARD_HEIGHT / 2;
  instance.zIndex = nextZIndex();
}

function changeSelectedScale(delta) {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }
  instance.scale = clampScale(instance.scale + delta);
}

function changeSelectedRotation(delta) {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }
  instance.rotation = normalizeAngle(instance.rotation + delta);
}

function bringSelectedToFront() {
  const instance = getSelectedInstance();
  if (!instance) {
    return;
  }
  instance.zIndex = nextZIndex();
}

function setCurrentColor(color, applyToSelection) {
  state.currentColor = color;
  if (applyToSelection) {
    const instance = getSelectedInstance();
    if (instance) {
      instance.color = color;
    }
  }
  renderAll();
}

function startDraggingShape(event) {
  event.preventDefault();
  event.stopPropagation();

  const target = event.currentTarget;
  const instance = findInstance(target.dataset.instanceId);
  if (!instance) {
    return;
  }

  state.selectedInstanceId = instance.id;
  instance.zIndex = nextZIndex();

  const startPoint = toSvgPoint(event.clientX, event.clientY);
  state.drag = {
    instanceId: instance.id,
    pointerId: event.pointerId,
    startX: startPoint.x,
    startY: startPoint.y,
    originX: instance.x,
    originY: instance.y,
  };

  window.addEventListener("pointermove", dragPointerMove);
  window.addEventListener("pointerup", finishDraggingShape);
  renderAll();
}

function dragPointerMove(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) {
    return;
  }

  const instance = findInstance(state.drag.instanceId);
  if (!instance) {
    return;
  }

  const currentPoint = toSvgPoint(event.clientX, event.clientY);
  const deltaX = currentPoint.x - state.drag.startX;
  const deltaY = currentPoint.y - state.drag.startY;

  instance.x = clamp(state.drag.originX + deltaX, 40, BOARD_WIDTH - 40);
  instance.y = clamp(state.drag.originY + deltaY, 40, BOARD_HEIGHT - 40);
  renderBoard();
  renderInspector();
  renderStats();
}

function finishDraggingShape(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) {
    return;
  }

  state.drag = null;
  window.removeEventListener("pointermove", dragPointerMove);
  window.removeEventListener("pointerup", finishDraggingShape);
  renderAll();
}

function getShapeDefinition(shapeId) {
  return SHAPE_DEFINITIONS.find((shape) => shape.id === shapeId) || null;
}

function getSelectedInstance() {
  return findInstance(state.selectedInstanceId);
}

function findInstance(instanceId) {
  return state.instances.find((instance) => instance.id === instanceId) || null;
}

function getSpawnPoint(index) {
  const points = [
    { x: 180, y: 150, rotation: 0 },
    { x: 330, y: 170, rotation: 6 },
    { x: 480, y: 160, rotation: -8 },
    { x: 630, y: 180, rotation: 4 },
    { x: 260, y: 320, rotation: -12 },
    { x: 430, y: 330, rotation: 10 },
    { x: 600, y: 320, rotation: -4 },
    { x: 770, y: 180, rotation: 8 },
  ];
  return points[index % points.length];
}

function nextZIndex() {
  state.zCounter += 1;
  return state.zCounter;
}

function toSvgPoint(clientX, clientY) {
  const point = boardSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(boardSvg.getScreenCTM().inverse());
}

function clampScale(value) {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

function getShapeMarkup(type, color) {
  switch (type) {
    case "circle":
      return `<circle class="shape-body" cx="0" cy="0" r="48" fill="${color}"></circle>`;
    case "triangle":
      return `<polygon class="shape-body" points="0,-62 64,50 -64,50" fill="${color}"></polygon>`;
    case "square":
      return `<rect class="shape-body" x="-50" y="-50" width="100" height="100" rx="4" fill="${color}"></rect>`;
    case "rectangle":
      return `<rect class="shape-body" x="-78" y="-46" width="156" height="92" rx="4" fill="${color}"></rect>`;
    case "star":
      return `<polygon class="shape-body" points="${buildStarPoints(5, 66, 30)}" fill="${color}"></polygon>`;
    case "oval":
      return `<ellipse class="shape-body" cx="0" cy="0" rx="72" ry="46" fill="${color}"></ellipse>`;
    case "diamond":
      return `<polygon class="shape-body" points="0,-68 66,0 0,68 -66,0" fill="${color}"></polygon>`;
    case "heart":
      return `<path class="shape-body" d="M 0 56 C -70 6 -102 -28 -80 -68 C -60 -104 -14 -96 0 -62 C 14 -96 60 -104 80 -68 C 102 -28 70 6 0 56 Z" fill="${color}"></path>`;
    case "hexagon":
      return `<polygon class="shape-body" points="${buildPolygonPoints(6, 66, -30)}" fill="${color}"></polygon>`;
    default:
      return `<circle class="shape-body" cx="0" cy="0" r="48" fill="${color}"></circle>`;
  }
}

function buildPolygonPoints(sides, radius, rotationOffset) {
  const points = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = ((360 / sides) * index + rotationOffset) * (Math.PI / 180);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(`${roundPoint(x)},${roundPoint(y)}`);
  }
  return points.join(" ");
}

function buildStarPoints(points, outerRadius, innerRadius) {
  const result = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = (-90 + (360 / (points * 2)) * index) * (Math.PI / 180);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    result.push(`${roundPoint(x)},${roundPoint(y)}`);
  }
  return result.join(" ");
}

function roundPoint(value) {
  return Number(value.toFixed(2));
}
