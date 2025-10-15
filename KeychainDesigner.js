class KeychainEditor {
  constructor(options = {}) {
    this.options = {
      width: 600, // Базовая ширина канваса
      height: 500, // Уменьшаем высоту канваса, так как панель теперь под ним
      backgroundColor: options.backgroundColor || "#f9f9f9",
      cordWidth: options.cordWidth || 100,
      elementWidth: options.elementWidth || 50,
      cordColor: options.cordColor || "#555",
      maxElements: options.maxElements || 4,
      cordUrls: options.cordUrls || {
        green:
          "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-0d9833be6231cc92420d3833ee256081.png",
        gray: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-746c02d60c2d7f87e1ffde532e5cb2b6.png",
        blue: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-c1d379781b124ce9b9469fa92985f6bd.png",
      },
      elementsData: options.elementsData || [
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-5378eb609fb01b0349d93ce03d2591f6.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-3ff04cbf7b4ce6971309bff88d765305.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-510805ebcf41c5a0556f357b5d4eba9d.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-c3590ee9e6cedf63e373b4b74ac8d326.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-ba5882596978692d1c2d7c426b08023b.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-1528282b3ee8054680b75e96deabaf06.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-b76a2903684594c4f90ac5da76270fa4.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-2ad94fee17e1f8c05c5c73dc50c5a366.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-50d8afa3c95316e40701ca5911d2882f.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-13201cafdab9d6c5a59e6faf17f0e1a2.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-c242ab6d96120f678b8ce568213dab42.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-b26f400811363f2decf849fc49f3fcb6.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-406215077c57ae0674696857565d4de4.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-17e661b4879d6a3513f081848050d73f.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-0b3235414e47c14968ff4ebdb1b9e47c.png",
      ],
    };

    this.canvas = null;
    this.currentCord = null;
    this.elementsOnCord = []; // Массив для хранения элементов на шнурке
    this.templateElements = [];
    this.currentCordColor = "green"; // Текущий цвет шнурка
    this.controlPanel = null; // Панель управления в DOM
    this.container = null; // Контейнер для канваса
    this.originalCanvasWidth = this.options.width; // Сохраняем исходную ширину канваса
    this.originalCanvasHeight = this.options.height; // Сохраняем исходную высоту канваса
    this.cordImageAspectRatio = null; // Сохраняем соотношение сторон изображения шнурка
    this.currentCanvasWidth = this.options.width; // Текущая ширина канваса
    this.currentCanvasHeight = this.options.height; // Текущая высота канваса

    // Пороговые значения для перемещения элементов
    this.originalDetachThreshold = 50; // Исходный порог открепления
    this.originalAttachThreshold = 50; // Исходный порог прикрепления
    this.originalSwapThreshold = 25; // Исходный порог обмена элементами
    this.currentDetachThreshold = this.originalDetachThreshold;
    this.currentAttachThreshold = this.originalAttachThreshold;
    this.currentSwapThreshold = this.originalSwapThreshold;

    this.isApplyResponsiveAwait = false;

    // Параметры полукольца
    this.originalSemiRingWidth = 100; // Ширина кольца (диаметр)
    this.originalSemiRingThickness = 7; // Толщина кольца
    this.semiRing = null;
  }

  init(targetElementSelector) {
    this.container = document.querySelector(targetElementSelector);
    if (this.container) {
      this.container.innerHTML = "";
      this.initializeEditor();
    } else {
      console.error(
        `Элемент с селектором "${targetElementSelector}" не найден`
      );
    }
  }

  initializeEditor() {
    this.createCanvas();
    this.setupCanvas();
    this.createControlPanel();
    this.createSemiRing();
    this.initCord();
    this.setupEventListeners();
    this.setupResizeObserver();
    setTimeout(() => {
      this.applyResponsive();
    }, 500);
  }

  createCanvas() {
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "keychain-canvas";
    canvasElement.width = this.options.width;
    canvasElement.height = this.options.height;
    this.container.appendChild(canvasElement);
  }

  setupCanvas() {
    this.canvas = new fabric.Canvas("keychain-canvas", {});
    const canvasElement = document.getElementById("keychain-canvas");
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
    canvasElement.style.display = "block";
    canvasElement.style.border = "1px solid #ddd";
  }

  createSemiRing() {
    const centerX = this.currentCanvasWidth / 2;
    const centerY =
      (this.originalSemiRingWidth / 2) *
      (this.currentCanvasHeight / this.originalCanvasHeight);
    const outerRadius =
      (this.originalSemiRingWidth / 2) *
      (this.currentCanvasHeight / this.originalCanvasHeight);
    const innerRadius =
      outerRadius -
      this.originalSemiRingThickness *
        (this.currentCanvasHeight / this.originalCanvasHeight);

    const path =
      `M ${centerX - outerRadius},${centerY} ` +
      `A ${outerRadius},${outerRadius} 0 0 0 ${
        centerX + outerRadius
      },${centerY} ` +
      `L ${centerX + innerRadius},${centerY} ` +
      `A ${innerRadius},${innerRadius} 0 0 1 ${
        centerX - innerRadius
      },${centerY} ` +
      `Z`;

    this.semiRing = new fabric.Path(path, {
      fill: "#000000",
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      left: centerX,
      top: 0,
      name: "semiRing",
    });

    this.canvas.add(this.semiRing);
    this.canvas.sendToBack(this.semiRing);
  }

  getScaledPosition(originalX, originalY) {
    const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
    const scaleY = this.currentCanvasHeight / this.originalCanvasHeight;
    return { x: originalX * scaleX, y: originalY * scaleY };
  }

  getOriginalPosition(currentX, currentY) {
    const scaleX = this.originalCanvasWidth / this.currentCanvasWidth;
    const scaleY = this.originalCanvasHeight / this.currentCanvasHeight;
    return { x: currentX * scaleX, y: currentY * scaleY };
  }

  updateThresholds() {
    const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
    const scaleY = this.currentCanvasHeight / this.originalCanvasHeight;
    this.currentDetachThreshold = this.originalDetachThreshold * scaleX;
    this.currentAttachThreshold = this.originalAttachThreshold * scaleX;
    this.currentSwapThreshold = this.originalSwapThreshold * scaleY;
  }

  applyResponsive() {
    if (this.controlPanel) {
      const containerStyle = window.getComputedStyle(this.container);
      const containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
      const containerPaddingRight =
        parseFloat(containerStyle.paddingRight) || 0;
      const containerWidth =
        this.container.clientWidth -
        containerPaddingLeft -
        containerPaddingRight;

      let canvasWidth = containerWidth;
      const aspectRatio = this.options.height / this.options.width;
      let canvasHeight = canvasWidth * aspectRatio;

      const maxCanvasHeight = window.innerHeight * 0.95;
      if (canvasHeight > maxCanvasHeight) {
        canvasHeight = maxCanvasHeight;
        canvasWidth = canvasHeight / aspectRatio;
      }

      this.currentCanvasWidth = canvasWidth;
      this.currentCanvasHeight = canvasHeight;

      this.canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });
      this.updateElementPositions();
      this.canvas.renderAll();
    } else if (!this.isApplyResponsiveAwait) {
      this.isApplyResponsiveAwait = true;
      setTimeout(() => {
        this.isApplyResponsiveAwait = false;
        this.applyResponsive();
      }, 500);
    }
  }

  updateElementPositions() {
    if (this.currentCord) {
      const cordHeight = this.currentCanvasHeight - 10;
      const cordWidth = cordHeight / this.cordImageAspectRatio;
      const cordLeft = (this.currentCanvasWidth - cordWidth) / 2;
      const cordTop = 0;
      this.currentCord.set({
        left: cordLeft,
        top: cordTop,
        scaleX: cordWidth / this.currentCord.width,
        scaleY: cordHeight / this.currentCord.height,
      });
      this.currentCord.setCoords();
    }

    // Обновляем позиции элементов на шнурке
    this.updateCordElements();

    this.templateElements.forEach((element) => {
      const targetWidth =
        this.options.elementWidth *
        (this.currentCanvasWidth / this.originalCanvasWidth);
      const elementScale = targetWidth / element.width;

      if (!element.onCord) {
        const scaledPos = this.getScaledPosition(
          element.originalLeft,
          element.originalTop
        );
        element.set({
          left: scaledPos.x,
          top: scaledPos.y,
          scaleX: elementScale,
          scaleY: elementScale,
        });
      }
      element.setCoords();
    });

    if (this.semiRing) {
      this.canvas.remove(this.semiRing);
      this.createSemiRing();
    }

    this.updateThresholds();
  }

  // Обновленный метод для обновления позиций элементов на шнурке
  updateCordElements() {
    const elementsCount = this.elementsOnCord.length;
    if (elementsCount === 0) return;

    // Определяем видимую область шнурка (исключая полукольцо сверху)
    const semiRingHeight =
      this.originalSemiRingWidth *
      (this.currentCanvasHeight / this.originalCanvasHeight);
    const visibleCordHeight = this.currentCanvasHeight - semiRingHeight;
    const cordStartY = semiRingHeight;

    // 1. Вычисляем общую высоту всех элементов на шнурке
    let totalHeight = 0;
    // Сортируем элементы для сохранения порядка
    this.elementsOnCord.sort((a, b) => a.positionIndex - b.positionIndex);
    this.elementsOnCord.forEach((element) => {
      totalHeight += element.height * element.scaleY;
    });

    // 2. Находим центральную точку для распределения (идеальный центр минус 50px)
    const verticalOffset =
      50 * (this.currentCanvasHeight / this.originalCanvasHeight);
    const centerY = cordStartY + visibleCordHeight / 2 - verticalOffset;

    // 3. Вычисляем начальную Y-координату для первого элемента
    let currentY = centerY - totalHeight / 2;

    // 4. Распределяем элементы плотно друг к другу
    this.elementsOnCord.forEach((element, index) => {
      const elementHeight = element.height * element.scaleY;
      // Позиционируем центр элемента
      const targetY = currentY + elementHeight / 2;

      element.set({
        left: this.currentCanvasWidth / 2,
        top: targetY,
        positionIndex: index, // Обновляем индекс после сортировки
      });
      element.setCoords();

      // Сдвигаем текущую Y-координату на высоту текущего элемента
      currentY += elementHeight;
    });
  }

  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.applyResponsive();
    });
    resizeObserver.observe(this.container);
    this.resizeObserver = resizeObserver;
  }

  createControlPanel() {
    const style = document.createElement("style");
    style.textContent = `
            .control-panel { padding: 15px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; width: 100%; box-sizing: border-box; }
            .control-panel-left { display: flex; align-items: center; gap: 15px; }
            .control-panel-right { display: flex; align-items: center; gap: 15px; }
            .reset-button, .random-button { background: transparent; border: 2px solid black; padding: 8px 15px; cursor: pointer; transition: background 0.3s; font-size: 16px; font-family: 'Arial'; letter-spacing: 0em; }
            .reset-button:hover, .random-button:hover { background: black; color: white; }
            .cord-label { font-size: 16px; font-family: 'Arial'; letter-spacing: 0em; }
            .cord-colors { display: flex; gap: 10px; }
            .cord-color { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: border 0.3s; }
            .cord-color:hover { border-color: #333; }
            .cord-color.active { border-color: #333; box-shadow: 0 0 5px rgba(0,0,0,0.3); }
          `;
    document.head.appendChild(style);

    this.controlPanel = document.createElement("div");
    this.controlPanel.className = "control-panel";

    const leftPanel = document.createElement("div");
    leftPanel.className = "control-panel-left";
    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "Сбросить";
    resetButton.id = "reset-button";
    const randomButton = document.createElement("button");
    randomButton.className = "random-button";
    randomButton.textContent = "Случайный брелок";
    randomButton.id = "random-button";
    leftPanel.appendChild(resetButton);
    leftPanel.appendChild(randomButton);

    const rightPanel = document.createElement("div");
    rightPanel.className = "control-panel-right";
    const cordLabel = document.createElement("span");
    cordLabel.className = "cord-label";
    cordLabel.textContent = "Шнурки:";
    const cordColors = document.createElement("div");
    cordColors.className = "cord-colors";
    const colors = ["green", "gray", "blue"];
    colors.forEach((color) => {
      const circle = document.createElement("div");
      circle.className = `cord-color ${color === "green" ? "active" : ""}`;
      circle.style.backgroundColor =
        color === "green"
          ? "#4CAF50"
          : color === "gray"
          ? "#9E9E9E"
          : "#2196F3";
      circle.dataset.color = color;
      cordColors.appendChild(circle);
    });
    rightPanel.appendChild(cordLabel);
    rightPanel.appendChild(cordColors);

    this.controlPanel.appendChild(leftPanel);
    this.controlPanel.appendChild(rightPanel);
    this.container.appendChild(this.controlPanel);
  }

  initCord() {
    this.createCord(this.currentCordColor).then((cord) => {
      this.currentCord = cord;
      this.canvas.add(cord);
      this.canvas.sendToBack(cord);
      if (this.semiRing) {
        this.canvas.sendToBack(this.semiRing);
      }
      this.canvas.renderAll();
      this.createElements();
    });
  }

  setupEventListeners() {
    document.getElementById("reset-button").addEventListener("click", () => {
      this.reset();
    });
    document.getElementById("random-button").addEventListener("click", () => {
      this.generateRandomKeychain();
    });
    document.querySelectorAll(".cord-color").forEach((circle) => {
      circle.addEventListener("click", () => {
        const color = circle.dataset.color;
        this.changeCord(color);
        document
          .querySelectorAll(".cord-color")
          .forEach((c) => c.classList.remove("active"));
        circle.classList.add("active");
      });
    });
  }

  createCord(color) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(
        this.options.cordUrls[color],
        (img) => {
          this.cordImageAspectRatio = img.height / img.width;
          const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
          const cordWidth = this.options.cordWidth * scaleX;
          const cordHeight = cordWidth * this.cordImageAspectRatio;
          img.set({
            left: this.currentCanvasWidth / 2 - cordWidth / 2,
            top: 0,
            scaleX: cordWidth / img.width,
            scaleY: cordHeight / img.height,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            name: "cord",
            crossOrigin: "anonymous",
          });
          resolve(img);
        },
        { crossOrigin: "anonymous" }
      );
    });
  }

  createElement(imageUrl, position) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          const targetWidth =
            this.options.elementWidth *
            (this.currentCanvasWidth / this.originalCanvasWidth);
          const elementScale = targetWidth / img.width;
          const scaledHeight = img.height * elementScale;
          img.set({
            left: position.x,
            top: position.y,
            scaleX: elementScale,
            scaleY: elementScale,
            originX: "center",
            originY: "center",
            hasControls: false,
            hasBorders: false,
            isTemplate: true,
            imageUrl: imageUrl,
            side: position.side,
            originalSide: position.side,
            onCord: false,
            positionIndex: -1,
            isDetaching: false,
            crossOrigin: "anonymous",
          });
          resolve(img);
        },
        { crossOrigin: "anonymous" }
      );
    });
  }

  getRandomPosition(side, elementSize) {
    const cordCenterX = this.currentCanvasWidth / 2;
    const margin = 30;
    const cordVisualWidth =
      this.options.cordWidth *
      (this.currentCanvasWidth / this.originalCanvasWidth);
    const padding = 20;

    let minX, maxX;
    if (side === "left") {
      minX = margin;
      maxX = cordCenterX - cordVisualWidth / 2 - padding - elementSize;
    } else {
      minX = cordCenterX + cordVisualWidth / 2 + padding;
      maxX = this.currentCanvasWidth - margin - elementSize;
    }

    const minY = margin + 50;
    const maxY = this.currentCanvasHeight - margin - elementSize;

    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    return { x, y, side };
  }

  doRectanglesOverlap(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  isPositionOverlapping(newPos, existingPositions, elementSize) {
    const newRect = {
      x: newPos.x,
      y: newPos.y,
      width: elementSize,
      height: elementSize,
    };
    for (const pos of existingPositions) {
      const existingRect = {
        x: pos.x,
        y: pos.y,
        width: elementSize,
        height: elementSize,
      };
      if (this.doRectanglesOverlap(newRect, existingRect)) {
        return true;
      }
    }
    return false;
  }

  createElements() {
    const elementSize = this.options.elementWidth;
    const usedPositions = [];

    const elementPromises = this.options.elementsData.map((imageUrl, index) => {
      const side = index % 2 === 0 ? "left" : "right";
      let position;
      let attempts = 0;
      const maxAttempts = 20;
      do {
        position = this.getRandomPosition(side, elementSize);
        attempts++;
      } while (
        attempts < maxAttempts &&
        this.isPositionOverlapping(position, usedPositions, elementSize)
      );
      usedPositions.push(position);
      position.side = side;
      return this.createElement(imageUrl, position);
    });

    Promise.all(elementPromises).then((elements) => {
      elements.forEach((element) => {
        const originalPos = this.getOriginalPosition(element.left, element.top);
        element.originalLeft = originalPos.x;
        element.originalTop = originalPos.y;

        element.on("moving", () => {
          // --- ИСПРАВЛЕННОЕ Ограничение движения в пределах холста ---
          const elementWidth = element.width * element.scaleX;
          const elementHeight = element.height * element.scaleY;

          // Левая граница
          if (element.left < elementWidth / 2) {
            element.left = elementWidth / 2;
          }
          // Верхняя граница
          if (element.top < elementHeight / 2) {
            element.top = elementHeight / 2;
          }
          // Правая граница
          if (element.left > this.currentCanvasWidth - elementWidth / 2) {
            element.left = this.currentCanvasWidth - elementWidth / 2;
          }
          // Нижняя граница
          if (element.top > this.currentCanvasHeight - elementHeight / 2) {
            element.top = this.currentCanvasHeight - elementHeight / 2;
          }
          // --- Конец ограничения ---

          if (element.onCord && !element.isDetaching) {
            const cordCenterX = this.currentCanvasWidth / 2;
            if (
              Math.abs(element.left - cordCenterX) > this.currentDetachThreshold
            ) {
              element.isDetaching = true;
              this.detachElementFromCord(element);
              return;
            }
            element.left = cordCenterX;

            // Проверка на обмен местами с другими элементами
            this.checkForSwap(element);
          }
        });

        element.on("mouseup", () => {
          const updateOriginalPosition = () => {
            const originalPos = this.getOriginalPosition(
              element.left,
              element.top
            );
            element.originalLeft = originalPos.x;
            element.originalTop = originalPos.y;
          };

          if (element.isDetaching) {
            element.isDetaching = false;
            updateOriginalPosition();
          } else if (element.onCord) {
            // Если элемент на шнурке, просто обновляем его позицию
            this.updateCordElements();
          } else {
            const cordCenterX = this.currentCanvasWidth / 2;
            const distance = Math.abs(element.left - cordCenterX);
            if (distance < this.currentAttachThreshold) {
              // Проверяем, есть ли место на шнурке
              if (this.elementsOnCord.length < this.options.maxElements) {
                this.attachElementToCord(element);
              } else {
                this.handleNoDropZone(element);
                updateOriginalPosition();
              }
            } else {
              this.handleNoDropZone(element);
              updateOriginalPosition();
            }
          }
        });

        this.canvas.add(element);
        this.templateElements.push(element);
      });
      this.canvas.renderAll();
    });
  }

  // Новый метод для прикрепления элемента к шнурку
  attachElementToCord(element) {
    element.onCord = true;
    element.positionIndex = this.elementsOnCord.length;
    this.elementsOnCord.push(element);
    element.left = this.currentCanvasWidth / 2;
    this.updateCordElements();
    element.setCoords();
  }

  // Новый метод для открепления элемента от шнурка
  detachElementFromCord(element) {
    element.onCord = false;
    // Удаляем элемент из массива элементов на шнурке
    const index = this.elementsOnCord.indexOf(element);
    if (index > -1) {
      this.elementsOnCord.splice(index, 1);
    }
    element.positionIndex = -1;
    // Обновляем позиции оставшихся элементов
    this.updateCordElements();
  }

  // Новый метод для проверки обмена элементов местами
  checkForSwap(movingElement) {
    if (!movingElement.onCord) return;

    const movingIndex = this.elementsOnCord.indexOf(movingElement);
    if (movingIndex === -1) return;

    // Проверяем каждый элемент на шнурке на предмет обмена
    this.elementsOnCord.forEach((element, index) => {
      if (element === movingElement) return;

      // Проверяем, достаточно ли близко элементы для обмена
      const distance = Math.abs(movingElement.top - element.top);
      if (distance < this.currentSwapThreshold) {
        // Меняем элементы местами в массиве
        this.elementsOnCord[movingIndex] = element;
        this.elementsOnCord[index] = movingElement;

        // Обновляем positionIndex
        const tempIndex = movingElement.positionIndex;
        movingElement.positionIndex = element.positionIndex;
        element.positionIndex = tempIndex;

        // Обновляем позиции
        this.updateCordElements();
      }
    });
  }

  handleNoDropZone(element) {
    const cordBounds = this.currentCord.getBoundingRect();
    const elementBounds = element.getBoundingRect();
    const padding = 10;
    if (
      elementBounds.left < cordBounds.left + cordBounds.width &&
      elementBounds.left + elementBounds.width > cordBounds.left
    ) {
      if (element.left < this.currentCanvasWidth / 2) {
        element.left = cordBounds.left - elementBounds.width / 2 - padding;
      } else {
        element.left =
          cordBounds.left +
          cordBounds.width +
          elementBounds.width / 2 +
          padding;
      }
      element.setCoords();
    }
  }

  changeCord(color) {
    this.currentCordColor = color;
    if (this.currentCord) {
      this.canvas.remove(this.currentCord);
    }
    this.createCord(color).then((cord) => {
      this.currentCord = cord;
      this.canvas.add(cord);
      this.canvas.sendToBack(cord);
      if (this.semiRing) {
        this.canvas.sendToBack(this.semiRing);
      }
      this.canvas.renderAll();
      this.applyResponsive();
    });
  }

  reset() {
    const leftPositions = [];
    const rightPositions = [];
    const elementSize = this.options.elementWidth;

    // Очищаем массив элементов на шнурке
    this.elementsOnCord = [];

    this.templateElements.forEach((element) => {
      if (element.onCord) {
        element.onCord = false;
        element.positionIndex = -1;
      }
      element.side = element.originalSide;

      let newPosition;
      let attempts = 0;
      const maxAttempts = 20;
      const positionsArray =
        element.side === "left" ? leftPositions : rightPositions;
      do {
        newPosition = this.getRandomPosition(element.side, elementSize);
        attempts++;
      } while (
        attempts < maxAttempts &&
        this.isPositionOverlapping(newPosition, positionsArray, elementSize)
      );
      positionsArray.push(newPosition);

      const originalPos = this.getOriginalPosition(
        newPosition.x,
        newPosition.y
      );
      element.originalLeft = originalPos.x;
      element.originalTop = originalPos.y;

      this.animateElement(
        element,
        element.left,
        element.top,
        newPosition.x,
        newPosition.y
      );
    });

    this.canvas.renderAll();
  }

  // Обновленный метод для генерации случайного брелка
  generateRandomKeychain() {
    const elementsToDetach = [...this.elementsOnCord];
    if (elementsToDetach.length > 0) {
      // Логически открепляем элементы, чтобы они не мешали анимации
      this.elementsOnCord = [];
      elementsToDetach.forEach((element) => {
        element.onCord = false;
        element.positionIndex = -1;
      });

      // Анимируем старые элементы away
      const animations = elementsToDetach.map((element) => {
        const elementSize = this.options.elementWidth;
        const newPosition = this.getRandomPosition(
          element.originalSide,
          elementSize
        );
        const originalPos = this.getOriginalPosition(
          newPosition.x,
          newPosition.y
        );
        element.originalLeft = originalPos.x;
        element.originalTop = originalPos.y;
        return this.animateElementPromise(
          element,
          element.left,
          element.top,
          newPosition.x,
          newPosition.y,
          400
        );
      });

      // После того как они разлетелись, добавляем новые
      Promise.all(animations).then(() => {
        this.addRandomElementsToCord();
      });
    } else {
      // Если шнурок пуст, просто добавляем новые элементы
      this.addRandomElementsToCord();
    }
  }

  // Вспомогательный метод для добавления случайных элементов с анимацией
  addRandomElementsToCord() {
    const availableElements = this.templateElements.filter((el) => !el.onCord);
    if (availableElements.length < this.options.maxElements) {
      console.error("Недостаточно элементов для создания случайного брелка.");
      return;
    }

    const shuffled = availableElements.sort(() => 0.5 - Math.random());
    const selectedElements = shuffled.slice(0, this.options.maxElements);

    // 1. Добавляем элементы на шнурок
    selectedElements.forEach((element) => {
      element.onCord = true;
      element.positionIndex = this.elementsOnCord.length;
      this.elementsOnCord.push(element);
    });

    // 2. Вычисляем их финальные позиции
    this.updateCordElements();

    // 3. Запускаем анимацию падения сверху
    selectedElements.forEach((element) => {
      const finalLeft = element.left;
      const finalTop = element.top;
      const elementHeight = element.height * element.scaleY;

      // Устанавливаем начальную позицию для анимации (над холстом)
      element.set({
        left: finalLeft,
        top: -elementHeight, // Начинаем анимацию с высоты элемента над холстом
      });
      element.setCoords();

      // Запускаем анимацию к финальной позиции
      this.animateElement(
        element,
        finalLeft, // startLeft
        -elementHeight, // startTop
        finalLeft, // endLeft
        finalTop, // endTop
        700 // duration
      );
    });
  }

  getResultJson() {
    let cordImageUrl = "";
    if (
      this.currentCord &&
      this.currentCord._element &&
      this.currentCord._element.src
    ) {
      cordImageUrl = this.currentCord._element.src;
    } else {
      cordImageUrl = this.options.cordUrls.green;
    }
    const elementsOnCord = [];
    this.elementsOnCord.forEach((element) => {
      if (element && element.imageUrl) {
        elementsOnCord.push({ imageUrl: element.imageUrl });
      }
    });
    const result = { cord: cordImageUrl, elements: elementsOnCord };
    return JSON.stringify(result, null, 2);
  }

  animateElement(
    element,
    startLeft,
    startTop,
    endLeft,
    endTop,
    duration = 500
  ) {
    const startTime = new Date().getTime();
    const animate = () => {
      const currentTime = new Date().getTime();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      element.left = startLeft + (endLeft - startLeft) * easeProgress;
      element.top = startTop + (endTop - startTop) * easeProgress;
      element.setCoords();
      this.canvas.renderAll();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  // Вспомогательный метод для анимации, возвращающий Promise
  animateElementPromise(
    element,
    startLeft,
    startTop,
    endLeft,
    endTop,
    duration = 500
  ) {
    return new Promise((resolve) => {
      const startTime = new Date().getTime();
      const animate = () => {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        element.left = startLeft + (endLeft - startLeft) * easeProgress;
        element.top = startTop + (endTop - startTop) * easeProgress;
        element.setCoords();
        this.canvas.renderAll();
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
}
