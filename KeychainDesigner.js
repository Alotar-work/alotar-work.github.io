class KeychainEditor {
  constructor(options = {}) {
    this.options = {
      width: 600, // Базовая ширина канваса
      height: 500, // Уменьшаем высоту канваса, так как панель теперь под ним
      backgroundColor: options.backgroundColor || "#f9f9f9",
      cordWidth: options.cordWidth || 100,
      elementWidth: options.elementWidth || 70,
      cordColor: options.cordColor || "#555",
      maxElements: options.maxElements || 4,
      cordUrls: options.cordUrls || {
        green:
          "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-a8d54636b48977d8e3c942463a137662.png",
        gray: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-f0e15c5e7670d46991cf515363e0e6d8.png",
        blue: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-89ce49869885b935e240762b42f50034.png",
      },
      elementsData: options.elementsData || [
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-a257b6ed2a1e889cf7b2888816e2164e.png",
          startX: 130,
          startY: 100,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-f4167800bbf18364ea389b94eff678e8.png",
          startX: 200,
          startY: 150,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-13598614d25eaf9f8f552c1f8a90915f.png",
          startX: 80,
          startY: 180,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-8979b15d0009f1d7efdfabe4d7a0f117.png",
          startX: 120,
          startY: 250,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-a741507ea62d41ee92bc57542c25f62f.png",
          startX: 200,
          startY: 250,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-e29ff47f42cd1974ada3e71a9ad098f2.png",
          startX: 70,
          startY: 310,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-95a1689816a9b200198ae5ee15b44acd.png",
          startX: 180,
          startY: 315,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-01cfdab6e0b16424cd8ae2c0c89a596b.png",
          startX: 150,
          startY: 390,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-a202d5490f2e9f72714aaa6fe0440f61.png",
          startX: 430,
          startY: 100,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-c5993e649898375b0af26a26195d3b82.png",
          startX: 510,
          startY: 150,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-6875de21e6e375e170c093ab87049ede.png",
          startX: 400,
          startY: 200,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-ab6f9d040c22053f587d382aaf6b833c.png",
          startX: 510,
          startY: 250,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-97e9860e583911096942c661d76bbc86.png",
          startX: 400,
          startY: 300,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-fe44024ceed694cb5a913f0692ec5a85.png",
          startX: 510,
          startY: 330,
        },
        {
          url: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-6f1472f659d16c9078497b32c976781b.png",
          startX: 450,
          startY: 400,
        },
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
    this.canvas = new fabric.Canvas("keychain-canvas", {
      selection: false, // Отключаем выделение рамкой
    });
    const canvasElement = document.getElementById("keychain-canvas");
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
    canvasElement.style.display = "block";
    canvasElement.style.border = "1px solid #ddd";

    // Отключаем выделение нескольких объектов
    this.canvas.on("selection:created", (e) => {
      if (e.selected && e.selected.length > 1) {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    });
    this.canvas.on("selection:updated", (e) => {
      if (e.selected && e.selected.length > 1) {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    });
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

    this.updateThresholds();
  }

  // Обновленный метод для обновления позиций элементов на шнурке
  updateCordElements() {
    const elementsCount = this.elementsOnCord.length;
    if (elementsCount === 0) return;

    // Определяем видимую область шнурка
    const visibleCordHeight = this.currentCanvasHeight;

    // 1. Вычисляем общую высоту всех элементов на шнурке
    let totalHeight = 0;
    // Сортируем элементы для сохранения порядка
    this.elementsOnCord.sort((a, b) => a.positionIndex - b.positionIndex);
    this.elementsOnCord.forEach((element) => {
      totalHeight += element.height * element.scaleY;
    });

    // 2. Находим центральную точку для распределения (идеальный центр минус 50px)
    const verticalOffset =
      20 * (this.currentCanvasHeight / this.originalCanvasHeight);
    const centerY = visibleCordHeight / 2 - verticalOffset;

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
            .control-panel-left { margin-bottom: 10px; display: flex; align-items: center; gap: 15px; }
            .control-panel-right { margin-bottom: 10px; display: flex; align-items: center; gap: 15px; }
            .reset-button, .random-button { background: transparent; border: 2px solid black; padding: 8px 15px; cursor: pointer; transition: background 0.3s; font-size: 16px; font-family: 'Arial'; letter-spacing: 0em; }
            .reset-button:hover, .random-button:hover { background: black; color: white; }
            .cord-label { font-size: 16px; font-family: 'Arial'; letter-spacing: 0em; }
            .max-elements-label { font-size: 16px; font-family: 'Arial'; letter-spacing: 0em; }
            .max-elements-select { padding: 8px; border: 2px solid black; background: white; cursor: pointer; font-size: 16px; font-family: 'Arial'; }
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

  createElement(elementData) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(
        elementData.url,
        (img) => {
          const targetWidth =
            this.options.elementWidth *
            (this.currentCanvasWidth / this.originalCanvasWidth);
          const elementScale = targetWidth / img.width;
          const scaledHeight = img.height * elementScale;

          // Используем предопределенные позиции
          const scaledPos = this.getScaledPosition(
            elementData.startX,
            elementData.startY
          );

          img.set({
            left: scaledPos.x,
            top: scaledPos.y,
            scaleX: elementScale,
            scaleY: elementScale,
            originX: "center",
            originY: "center",
            hasControls: false,
            hasBorders: false,
            isTemplate: true,
            imageUrl: elementData.url,
            onCord: false,
            positionIndex: -1,
            isDetaching: false,
            crossOrigin: "anonymous",
            // Сохраняем оригинальные позиции
            originalLeft: elementData.startX,
            originalTop: elementData.startY,
          });
          resolve(img);
        },
        { crossOrigin: "anonymous" }
      );
    });
  }

  createElements() {
    const elementPromises = this.options.elementsData.map((elementData) => {
      return this.createElement(elementData);
    });

    Promise.all(elementPromises).then((elements) => {
      elements.forEach((element) => {
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
            // Если элемент на шнурке, обновляем его позицию
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

  // ИСПРАВЛЕННЫЙ метод для проверки обмена элементов местами
  checkForSwap(movingElement) {
    if (!movingElement.onCord) return;

    const movingIndex = this.elementsOnCord.indexOf(movingElement);
    if (movingIndex === -1) return;

    // Проверяем обмен с элементом ниже
    if (movingIndex < this.elementsOnCord.length - 1) {
      const elementBelow = this.elementsOnCord[movingIndex + 1];
      // Обмен происходит, только если центр перетаскиваемого элемента
      // явно прошел центр нижнего элемента
      if (movingElement.top > elementBelow.top) {
        this.swapElementsInArray(movingIndex, movingIndex + 1);
      }
    }

    // Проверяем обмен с элементом выше
    if (movingIndex > 0) {
      const elementAbove = this.elementsOnCord[movingIndex - 1];
      if (movingElement.top < elementAbove.top) {
        this.swapElementsInArray(movingIndex, movingIndex - 1);
      }
    }
  }

  // Вспомогательный метод для обмена элементов в массиве
  swapElementsInArray(index1, index2) {
    const element1 = this.elementsOnCord[index1];
    const element2 = this.elementsOnCord[index2];

    // Меняем элементы местами в массиве
    this.elementsOnCord[index1] = element2;
    this.elementsOnCord[index2] = element1;

    // Обновляем их positionIndex
    const tempIndex = element1.positionIndex;
    element1.positionIndex = element2.positionIndex;
    element2.positionIndex = tempIndex;
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
      this.canvas.renderAll();
      this.applyResponsive();
    });
  }

  reset() {
    // Очищаем массив элементов на шнурке
    this.elementsOnCord = [];

    this.templateElements.forEach((element) => {
      if (element.onCord) {
        element.onCord = false;
        element.positionIndex = -1;
      }

      // Возвращаем элемент в его стартовую позицию
      const scaledPos = this.getScaledPosition(
        element.originalLeft,
        element.originalTop
      );

      this.animateElement(
        element,
        element.left,
        element.top,
        scaledPos.x,
        scaledPos.y
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
        // Возвращаем элемент в его стартовую позицию
        const scaledPos = this.getScaledPosition(
          element.originalLeft,
          element.originalTop
        );

        return this.animateElementPromise(
          element,
          element.left,
          element.top,
          scaledPos.x,
          scaledPos.y,
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

  // метод для изменения максимального количества элементов
  setMaxElements(newMax) {
    if (newMax < 1) return; // Не позволяем установить 0 или отрицательное значение

    this.options.maxElements = newMax;

    // Если текущее количество элементов на шнурке больше нового лимита
    if (this.elementsOnCord.length > newMax) {
      // Удаляем лишние элементы (с конца)
      const elementsToRemove = this.elementsOnCord.splice(newMax);

      elementsToRemove.forEach((element) => {
        element.onCord = false;
        element.positionIndex = -1;

        // Возвращаем элемент в его стартовую позицию
        const scaledPos = this.getScaledPosition(
          element.originalLeft,
          element.originalTop
        );

        this.animateElement(
          element,
          element.left,
          element.top,
          scaledPos.x,
          scaledPos.y
        );
      });
    }

    // Перераспределяем и центрируем оставшиеся элементы на шнурке
    this.updateCordElements();
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



