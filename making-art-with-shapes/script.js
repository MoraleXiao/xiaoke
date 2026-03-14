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
const EDGE_PADDING = 40;

const state = {
  instances: [],
  currentColor: COLOR_OPTIONS[0],
  selectedInstanceId: null,
  gesture: null,
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
const rotationSlider = document.getElementById("rotation-slider");
const sizeValue = document.getElementById("size-value");
const rotationValue = document.getElementById("rotation-value");

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

  rotationSlider.addEventListener("input", (event) => {
    const instance = getSelectedInstance();
    if (!instance) {
      return;
    }
    instance.rotation = normalizeAngle(Number(event.target.value));
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
      instance.y = clamp(instance.y - movement, EDGE_PADDING, BOARD_HEIGHT - EDGE_PADDING);
      break;
    case "ArrowDown":
      instance.y = clamp(instance.y + movement, EDGE_PADDING, BOARD_HEIGHT - EDGE_PADDING);
      break;
    case "ArrowLeft":
      instance.x = clamp(instance.x - movement, EDGE_PADDING, BOARD_WIDTH - EDGE_PADDING);
      break;
    case "ArrowRight":
      instance.x = clamp(instance.x + movement, EDGE_PADDING, BOARD_WIDTH - EDGE_PADDING);
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
      group.addEventListener("pointerdown", startShapeInteraction);
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
  const angle = normalizeAngle(instance.rotation);
  const scalePercent = Math.round(instance.scale * 100);

  selectedBadge.textContent = definition.label;
  selectedBadge.classList.remove("is-idle");
  selectedName.textContent = `${definition.label} · ${definition.chinese}`;
  selectedMeta.textContent = `颜色：${instance.color.toUpperCase()} · 大小：${scalePercent}% · 角度：${angle}°`;
  selectedColorDot.style.background = instance.color;
  sizeSlider.value = String(instance.scale);
  rotationSlider.value = String(angle);
  sizeValue.textContent = `${scalePercent}%`;
  rotationValue.textContent = `${angle}°`;
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
    x: clamp(instance.x + 34, EDGE_PADDING, BOARD_WIDTH - EDGE_PADDING),
    y: clamp(instance.y + 34, EDGE_PADDING, BOARD_HEIGHT - EDGE_PADDING),
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
  clearGesture();
}

function scatterShapes() {
  state.instances.forEach((instance, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    instance.x = 130 + column * 190 + (row % 2) * 18;
    instance.y = 110 + row * 132 + (column % 2) * 14;
    instance.rotation = (index * 12) % 360;
    instance.zIndex = nextZIndex();
  });
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

function startShapeInteraction(event) {
  event.preventDefault();
  event.stopPropagation();

  const instance = findInstance(event.currentTarget.dataset.instanceId);
  if (!instance) {
    return;
  }

  state.selectedInstanceId = instance.id;
  instance.zIndex = nextZIndex();

  if (!state.gesture || state.gesture.instanceId !== instance.id) {
    clearGesture();
    state.gesture = {
      instanceId: instance.id,
      pointers: new Map(),
      mode: "drag",
      originX: instance.x,
      originY: instance.y,
      originScale: instance.scale,
      originRotation: instance.rotation,
      startPointerX: 0,
      startPointerY: 0,
      startCenterX: 0,
      startCenterY: 0,
      startDistance: 0,
      startAngle: 0,
    };
    window.addEventListener("pointermove", handleShapeGestureMove);
    window.addEventListener("pointerup", finishShapeInteraction);
    window.addEventListener("pointercancel", finishShapeInteraction);
  }

  const point = toSvgPoint(event.clientX, event.clientY);
  state.gesture.pointers.set(event.pointerId, point);
  refreshGestureSnapshot(instance);
  renderBoard();
  renderInspector();
  renderStats();
}

function handleShapeGestureMove(event) {
  if (!state.gesture || !state.gesture.pointers.has(event.pointerId)) {
    return;
  }

  const instance = findInstance(state.gesture.instanceId);
  if (!instance) {
    clearGesture();
    return;
  }

  const point = toSvgPoint(event.clientX, event.clientY);
  state.gesture.pointers.set(event.pointerId, point);

  if (state.gesture.pointers.size >= 2) {
    applyTransformGesture(instance);
  } else {
    applyDragGesture(instance);
  }

  renderBoard();
  renderInspector();
  renderStats();
}

function finishShapeInteraction(event) {
  if (!state.gesture) {
    return;
  }

  state.gesture.pointers.delete(event.pointerId);
  const instance = findInstance(state.gesture.instanceId);

  if (!instance || state.gesture.pointers.size === 0) {
    clearGesture();
    renderAll();
    return;
  }

  refreshGestureSnapshot(instance);
  renderBoard();
  renderInspector();
  renderStats();
}

function refreshGestureSnapshot(instance) {
  const pointers = Array.from(state.gesture.pointers.values());
  state.gesture.originX = instance.x;
  state.gesture.originY = instance.y;
  state.gesture.originScale = instance.scale;
  state.gesture.originRotation = instance.rotation;

  if (pointers.length >= 2) {
    const [first, second] = pointers;
    const center = getMidpoint(first, second);
    state.gesture.mode = "transform";
    state.gesture.startCenterX = center.x;
    state.gesture.startCenterY = center.y;
    state.gesture.startDistance = Math.max(getDistance(first, second), 1);
    state.gesture.startAngle = getAngle(first, second);
    return;
  }

  const [point] = pointers;
  state.gesture.mode = "drag";
  state.gesture.startPointerX = point.x;
  state.gesture.startPointerY = point.y;
}

function applyDragGesture(instance) {
  const [point] = Array.from(state.gesture.pointers.values());
  instance.x = clamp(
    state.gesture.originX + (point.x - state.gesture.startPointerX),
    EDGE_PADDING,
    BOARD_WIDTH - EDGE_PADDING,
  );
  instance.y = clamp(
    state.gesture.originY + (point.y - state.gesture.startPointerY),
    EDGE_PADDING,
    BOARD_HEIGHT - EDGE_PADDING,
  );
}

function applyTransformGesture(instance) {
  const [first, second] = Array.from(state.gesture.pointers.values());
  const center = getMidpoint(first, second);
  const distance = Math.max(getDistance(first, second), 1);
  const angle = getAngle(first, second);
  const distanceRatio = distance / state.gesture.startDistance;
  const rotationDelta = getAngleDelta(angle, state.gesture.startAngle);

  instance.x = clamp(
    state.gesture.originX + (center.x - state.gesture.startCenterX),
    EDGE_PADDING,
    BOARD_WIDTH - EDGE_PADDING,
  );
  instance.y = clamp(
    state.gesture.originY + (center.y - state.gesture.startCenterY),
    EDGE_PADDING,
    BOARD_HEIGHT - EDGE_PADDING,
  );
  instance.scale = clampScale(state.gesture.originScale * distanceRatio);
  instance.rotation = normalizeAngle(state.gesture.originRotation + rotationDelta);
}

function clearGesture() {
  state.gesture = null;
  window.removeEventListener("pointermove", handleShapeGestureMove);
  window.removeEventListener("pointerup", finishShapeInteraction);
  window.removeEventListener("pointercancel", finishShapeInteraction);
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
    { x: 170, y: 140, rotation: 0 },
    { x: 310, y: 150, rotation: 8 },
    { x: 450, y: 145, rotation: -8 },
    { x: 590, y: 160, rotation: 6 },
    { x: 240, y: 290, rotation: -10 },
    { x: 400, y: 300, rotation: 10 },
    { x: 560, y: 295, rotation: -6 },
    { x: 730, y: 180, rotation: 5 },
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
  const matrix = boardSvg.getScreenCTM();
  if (!matrix) {
    return { x: 0, y: 0 };
  }
  return point.matrixTransform(matrix.inverse());
}

function getMidpoint(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function getDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getAngle(first, second) {
  return Math.atan2(second.y - first.y, second.x - first.x) * (180 / Math.PI);
}

function getAngleDelta(current, start) {
  let delta = current - start;
  while (delta > 180) {
    delta -= 360;
  }
  while (delta < -180) {
    delta += 360;
  }
  return delta;
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
