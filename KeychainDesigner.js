class KeychainEditor {
  constructor(options = {}) {
    this.options = {
      width: 600, // Базовая ширина канваса
      height: 500, // Уменьшаем высоту канваса, так как панель теперь под ним
      backgroundColor: options.backgroundColor || "#f9f9f9",
      cordWidth: options.cordWidth || 100,
      cordColor: options.cordColor || "#555",
      maxElements: options.maxElements || 4,
      cordUrls: options.cordUrls || {
        green:
          "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-e2aacb4b0c724ab91dbb67fd454395bd.png",
        gray: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-feb60a4aebc511c7d82b5e41167ead38.png",
        blue: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-418dccd27f75ff59e19dd9307db9a4ab.png",
      },
      elementsData: options.elementsData || [
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-188f5c0d7dff3482d5fd48544b0d69b1.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-adf4350d037d0422b1a2c6271d153640.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-cf96b243eb89e85ea431646882121a54.png",
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-7a9c95e3b00b36c39188d1c5756d086d.png",
      ],
    };

    this.canvas = null;
    this.currentCord = null;
    this.cordPositions = [];
    this.templateElements = [];
    this.currentCordColor = "green"; // Текущий цвет шнурка
    this.controlPanel = null; // Панель управления в DOM
    this.container = null; // Контейнер для канваса
    this.originalCanvasWidth = this.options.width; // Сохраняем исходную ширину канваса
    this.originalCanvasHeight = this.options.height; // Сохраняем исходную высоту канваса
    this.cordImageAspectRatio = null; // Сохраняем соотношение сторон изображения шнурка
    this.marginRatio = 150 / this.options.height; // Соотношение отступа для позиций на шнуре
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
    this.originalSemiRingThickness = 10; // Толщина кольца
    this.semiRing = null;
  }

  // Новый метод init, который принимает селектор для поиска целевого элемента
  init(targetElementSelector) {
    // Ищем элемент по селектору
    this.container = document.querySelector(targetElementSelector);

    if (this.container) {
      // Элемент найден, очищаем его содержимое
      this.container.innerHTML = "";

      // Инициализируем остальные компоненты
      this.initializeEditor();
    } else {
      console.error(
        `Элемент с селектором "${targetElementSelector}" не найден`
      );
    }
  }

  // Переименовываем старый метод init в initializeEditor
  initializeEditor() {
    // Сначала создаем канвас
    this.createCanvas();

    // Настраиваем канвас (включая адаптивность)
    this.setupCanvas();

    // Создаем полукольцо
    this.createSemiRing();

    // Создаем панель управления (после канваса)
    this.createControlPanel();

    // Создаем позиции на шнуре
    this.createCordPositions();

    // Инициализируем шнур
    this.initCord();

    // Устанавливаем обработчики событий
    this.setupEventListeners();

    // Настраиваем наблюдатель за изменением размера
    this.setupResizeObserver();
  }

  createCanvas() {
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "keychain-canvas";

    // Устанавливаем базовые размеры канваса
    canvasElement.width = this.options.width;
    canvasElement.height = this.options.height;

    this.container.appendChild(canvasElement);
  }

  setupCanvas() {
    this.canvas = new fabric.Canvas("keychain-canvas", {
      //backgroundColor: this.options.backgroundColor,
    });

    // Устанавливаем стили для канваса через JavaScript
    const canvasElement = document.getElementById("keychain-canvas");
    canvasElement.style.width = "100%";
    canvasElement.style.height = "auto";
    canvasElement.style.maxWidth = "600px";
    canvasElement.style.display = "block";
    canvasElement.style.border = "1px solid #ddd";
    canvasElement.style.borderRadius = "5px";

    // Применяем адаптивность при инициализации
    this.applyResponsive();
  }

  // Создание полукольца с использованием Path
  createSemiRing() {
    const centerX = this.options.width / 2;
    const centerY = this.originalSemiRingWidth / 2; // Центр кольца на уровне радиуса от верха
    const outerRadius = this.originalSemiRingWidth / 2;
    const innerRadius = outerRadius - this.originalSemiRingThickness;

    // Создаем путь для полукольца (развернутого на 180 градусов)
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
      fill: "#000000", // Черный цвет
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      left: centerX,
      top: 0, // Устанавливаем top равным нулю
      name: "semiRing",
    });

    this.canvas.add(this.semiRing);
    this.canvas.sendToBack(this.semiRing);
  }

  // Новая функция для расчета масштабированных позиций
  getScaledPosition(originalX, originalY) {
    const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
    const scaleY = this.currentCanvasHeight / this.originalCanvasHeight;

    return {
      x: originalX * scaleX,
      y: originalY * scaleY,
    };
  }

  // Функция для обновления пороговых значений
  updateThresholds() {
    const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
    const scaleY = this.currentCanvasHeight / this.originalCanvasHeight;

    // Обновляем пороговые значения
    this.currentDetachThreshold = this.originalDetachThreshold * scaleX;
    this.currentAttachThreshold = this.originalAttachThreshold * scaleX;
    this.currentSwapThreshold = this.originalSwapThreshold * scaleY;
  }

  applyResponsive() {
    if (this.controlPanel) {
      // Получаем текущую ширину контейнера
      const containerWidth = this.controlPanel.clientWidth;

      // Вычисляем масштабируемую ширину канваса
      const canvasWidth = Math.min(containerWidth, this.options.width);

      // Вычисляем масштабируемую высоту канваса (пропорционально)
      const aspectRatio = this.options.height / this.options.width;
      const canvasHeight = canvasWidth * aspectRatio;

      // Обновляем размеры канваса
      this.currentCanvasWidth = canvasWidth;
      this.currentCanvasHeight = canvasHeight;

      // Важно: сначала обновляем размеры канваса
      this.canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });

      // Затем обновляем позиции всех элементов
      this.updateElementPositions();

      // Перерисовываем канвас
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
    // Обновляем позиции элементов на шнуре
    if (this.currentCord) {
      // Шнурок должен занимать всю высоту канваса (с небольшими отступами)
      const cordHeight = this.currentCanvasHeight - 10; // 5px сверху и 5px снизу
      const cordWidth = cordHeight / this.cordImageAspectRatio; // Вычисляем ширину, сохраняя пропорции

      // Размещаем шнурок по центру
      const cordLeft = (this.currentCanvasWidth - cordWidth) / 2;
      const cordTop = 5; // Отступ сверху

      // Обновляем размеры и позицию шнурка
      this.currentCord.set({
        left: cordLeft,
        top: cordTop,
        scaleX: cordWidth / this.currentCord.width,
        scaleY: cordHeight / this.currentCord.height,
      });
      this.currentCord.setCoords();
    }

    // Используем относительное значение отступа вместо фиксированного 150
    const positionHeight =
      (this.currentCanvasHeight * (1 - this.marginRatio)) /
      (this.options.maxElements + 1);

    // Сначала обновляем позиции на шнуре
    this.cordPositions.forEach((pos, index) => {
      pos.y = 5 + positionHeight * (index + 1);
    });

    // Затем обновляем позиции шаблонных элементов
    this.templateElements.forEach((element) => {
      if (!element.onCord) {
        // Для элементов не на шнуре используем функцию getScaledPosition
        const scaledPos = this.getScaledPosition(
          element.originalLeft,
          element.originalTop
        );

        element.set({
          left: scaledPos.x,
          top: scaledPos.y,
          scaleX:
            (this.currentCanvasWidth / this.originalCanvasWidth) *
            (100 / element.width),
          scaleY:
            (this.currentCanvasHeight / this.originalCanvasHeight) *
            (100 / element.height),
        });
      } else {
        // Элементы на шнуре
        const positionIndex = element.positionIndex;
        if (positionIndex >= 0 && positionIndex < this.cordPositions.length) {
          // Обновляем позицию на шнуре
          const positionY = this.cordPositions[positionIndex].y;
          element.set({
            left: this.currentCanvasWidth / 2,
            top: positionY,
            scaleX:
              (this.currentCanvasWidth / this.originalCanvasWidth) *
              (100 / element.width),
            scaleY:
              (this.currentCanvasHeight / this.originalCanvasHeight) *
              (100 / element.height),
          });
        }
      }
      // Важно: обновляем координаты после изменения позиции
      element.setCoords();
    });

    // Обновляем позицию и размеры полукольца
    if (this.semiRing) {
      const scaleX = this.currentCanvasWidth / this.originalCanvasWidth;
      const scaleY = this.currentCanvasHeight / this.originalCanvasHeight;

      // Используем средний коэффициент масштабирования, чтобы не искажать
      const scale = (scaleX + scaleY) / 2;

      // Пересоздаем полукольцо с новыми размерами
      this.canvas.remove(this.semiRing);

      const centerX = this.currentCanvasWidth / 2;
      const centerY = (this.originalSemiRingWidth / 2) * scale; // Центр кольца на уровне радиуса от верха
      const outerRadius = (this.originalSemiRingWidth / 2) * scale;
      const innerRadius =
        outerRadius - this.originalSemiRingThickness * scale;

      // Создаем путь для полукольца (развернутого на 180 градусов)
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
        fill: "#000000", // Черный цвет
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
        left: centerX,
        top: 0, // Устанавливаем top равным нулю
        name: "semiRing",
      });

      this.canvas.add(this.semiRing);
      this.canvas.sendToBack(this.semiRing);
    }

    // Обновляем пороговые значения
    this.updateThresholds();
  }

  setupResizeObserver() {
    // Создаем наблюдатель за изменением размера контейнера
    const resizeObserver = new ResizeObserver(() => {
      this.applyResponsive();
    });

    // Начинаем наблюдение за контейнером канваса
    resizeObserver.observe(this.container);

    // Сохраняем наблюдатель для возможной остановки
    this.resizeObserver = resizeObserver;
  }

  // Создаем панель управления в DOM
  createControlPanel() {
    // Создаем стили для панели управления
    const style = document.createElement("style");
    style.textContent = `
            .control-panel {
              border: 1px solid #ddd;
              padding: 15px 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
              max-width: 560px;
            }

            .control-panel-left {
              display: flex;
              align-items: center;
              gap: 15px;
            }

            .control-panel-right {
              display: flex;
              align-items: center;
              gap: 15px;
            }

            .reset-button {
              background: transparent;
              border: 2px solid black;
              padding: 8px 15px;
              cursor: pointer;
              transition: background 0.3s;
              font-size: 16px;
              font-family: 'Arial';
              letter-spacing: 0em;
            }

            .reset-button:hover {
              background: black;
              color: white;
            }

            .cord-label {              
              font-size: 16px;
              font-family: 'Arial';
              letter-spacing: 0em;
            }

            .cord-colors {
              display: flex;
              gap: 10px;
            }

            .cord-color {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              cursor: pointer;
              border: 2px solid transparent;
              transition: border 0.3s;
            }

            .cord-color:hover {
              border-color: #333;
            }

            .cord-color.active {
              border-color: #333;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
            }
          `;
    document.head.appendChild(style);

    // Создаем панель управления
    this.controlPanel = document.createElement("div");
    this.controlPanel.className = "control-panel";

    // Левая часть панели
    const leftPanel = document.createElement("div");
    leftPanel.className = "control-panel-left";

    // Кнопка "Сбросить"
    const resetButton = document.createElement("button");
    resetButton.className = "reset-button";
    resetButton.textContent = "Сбросить";
    resetButton.id = "reset-button";

    // Добавляем кнопки в левую часть
    leftPanel.appendChild(resetButton);

    // Правая часть панели
    const rightPanel = document.createElement("div");
    rightPanel.className = "control-panel-right";

    // Надпись "Шнурки:"
    const cordLabel = document.createElement("span");
    cordLabel.className = "cord-label";
    cordLabel.textContent = "Шнурки:";

    // Контейнер для кружков выбора цвета
    const cordColors = document.createElement("div");
    cordColors.className = "cord-colors";

    // Зеленый кружок
    const greenCircle = document.createElement("div");
    greenCircle.className = "cord-color active";
    greenCircle.style.backgroundColor = "#4CAF50";
    greenCircle.dataset.color = "green";

    // Серый кружок
    const grayCircle = document.createElement("div");
    grayCircle.className = "cord-color";
    grayCircle.style.backgroundColor = "#9E9E9E";
    grayCircle.dataset.color = "gray";

    // Синий кружок
    const blueCircle = document.createElement("div");
    blueCircle.className = "cord-color";
    blueCircle.style.backgroundColor = "#2196F3";
    blueCircle.dataset.color = "blue";

    // Добавляем кружки в контейнер
    cordColors.appendChild(greenCircle);
    cordColors.appendChild(grayCircle);
    cordColors.appendChild(blueCircle);

    // Добавляем надпись и кружки в правую часть
    rightPanel.appendChild(cordLabel);
    rightPanel.appendChild(cordColors);

    // Добавляем левую и правую части в панель
    this.controlPanel.appendChild(leftPanel);
    this.controlPanel.appendChild(rightPanel);

    // Добавляем панель в контейнер канваса (после канваса)
    this.container.appendChild(this.controlPanel);
  }

  createCordPositions() {
    // Используем относительное значение отступа вместо фиксированного 150
    const positionHeight =
      (this.options.height * (1 - this.marginRatio)) /
      (this.options.maxElements + 1);

    for (let i = 1; i <= this.options.maxElements; i++) {
      this.cordPositions.push({
        y: 5 + positionHeight * i,
        occupied: false,
        element: null,
      });
    }
  }

  initCord() {
    this.createCord(this.currentCordColor).then((cord) => {
      this.currentCord = cord;
      this.canvas.add(cord);
      this.canvas.sendToBack(cord);

      // Убедимся, что полукольцо остается на заднем плане
      if (this.semiRing) {
        this.canvas.sendToBack(this.semiRing);
      }
      
      this.canvas.renderAll();

      // После добавления шнурка создаем элементы
      this.createElements();
    });
  }

  setupEventListeners() {
    // Обработчик клика на кнопку сброса
    document.getElementById("reset-button").addEventListener("click", () => {
      this.reset();
    });

    // Обработчики клика на кружки выбора цвета шнурка
    document.querySelectorAll(".cord-color").forEach((circle) => {
      circle.addEventListener("click", () => {
        const color = circle.dataset.color;
        this.changeCord(color);

        // Обновляем активный кружок
        document.querySelectorAll(".cord-color").forEach((c) => {
          c.classList.remove("active");
        });
        circle.classList.add("active");
      });
    });
  }

  createCord(color) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(
        this.options.cordUrls[color],
        (img) => {
          // Сохраняем соотношение сторон изображения шнурка
          this.cordImageAspectRatio = img.height / img.width;

          // Устанавливаем начальные размеры изображения
          img.set({
            left: this.options.width / 2 - this.options.cordWidth / 2,
            top: 5,
            scaleX: this.options.cordWidth / img.width,
            scaleY:
              (this.options.cordWidth * this.cordImageAspectRatio) / img.height,
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
          // Устанавливаем размеры изображения 100x100 пикселей
          const targetSize = 100;

          img.set({
            left: position.x + targetSize / 2,
            top: position.y + targetSize / 2,
            scaleX: targetSize / img.width,
            scaleY: targetSize / img.height,
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
            originalLeft: position.x + targetSize / 2,
            originalTop: position.y + targetSize / 2,
            isDetaching: false,
            crossOrigin: "anonymous",
          });
          resolve(img);
        },
        { crossOrigin: "anonymous" }
      );
    });
  }

  createElements() {
    const elementSize = 100;
    const usedPositions = [];

    // Создаем элементы для каждого URL в массиве
    const elementPromises = this.options.elementsData.map((imageUrl, index) => {
      // Определяем сторону (слева или справа от шнура)
      const side = index % 2 === 0 ? "left" : "right";

      // Генерируем случайную позицию
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

    // Добавляем все элементы на canvas после их загрузки
    Promise.all(elementPromises).then((elements) => {
      elements.forEach((element) => {
        // Добавляем обработчики событий для перетаскивания
        element.on("moving", () => {
          if (element.onCord && !element.isDetaching) {
            const cordCenterX = this.currentCanvasWidth / 2;

            // Проверка горизонтального смещения для открепления
            const horizontalDistance = Math.abs(element.left - cordCenterX);
            if (horizontalDistance > this.currentDetachThreshold) {
              // Начинаем процесс открепления
              element.isDetaching = true;
              element.onCord = false;
              this.cordPositions[element.positionIndex].occupied = false;
              this.cordPositions[element.positionIndex].element = null;
              element.positionIndex = -1;
              return;
            }

            // Ограничиваем движение по горизонтали
            element.left = cordCenterX;

            // Проверка вертикального перемещения для обмена местами
            // Используем относительное значение отступа
            const positionHeight =
              (this.currentCanvasHeight * (1 - this.marginRatio)) /
              (this.options.maxElements + 1);
            const swapThreshold = positionHeight / 2;

            // Проверка перемещения вверх
            if (element.positionIndex > 0) {
              const upperPosition =
                this.cordPositions[element.positionIndex - 1];
              if (element.top < upperPosition.y + swapThreshold) {
                this.swapElementsOnCord(
                  element.positionIndex,
                  element.positionIndex - 1
                );
              }
            }

            // Проверка перемещения вниз
            if (element.positionIndex < this.cordPositions.length - 1) {
              const lowerPosition =
                this.cordPositions[element.positionIndex + 1];
              if (element.top > lowerPosition.y - swapThreshold) {
                this.swapElementsOnCord(
                  element.positionIndex,
                  element.positionIndex + 1
                );
              }
            }
          }
        });

        element.on("mouseup", () => {
          if (element.isDetaching) {
            // Элемент был откреплен, возвращаем в исходное положение
            element.isDetaching = false;
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
          } else if (element.onCord) {
            // Элемент на шнуре, проверяем, нужно ли вернуть его в позицию
            const positionY = this.cordPositions[element.positionIndex].y;
            const verticalDistance = Math.abs(element.top - positionY);

            // Если элемент сдвинут более чем на пороговое значение, возвращаем его в позицию
            if (verticalDistance > this.currentSwapThreshold) {
              this.animateElement(
                element,
                element.left,
                element.top,
                this.currentCanvasWidth / 2,
                positionY,
                300
              );
            }
          } else if (!element.onCord) {
            // Проверка, находится ли элемент над шнуром
            const cordCenterX = this.currentCanvasWidth / 2;
            const distance = Math.abs(element.left - cordCenterX);

            if (distance < this.currentAttachThreshold) {
              // Поиск ближайшей свободной позиции
              let closestPosition = -1;
              let minDistance = Infinity;

              this.cordPositions.forEach((pos, index) => {
                if (!pos.occupied) {
                  const dist = Math.abs(element.top - pos.y);
                  if (dist < minDistance) {
                    minDistance = dist;
                    closestPosition = index;
                  }
                }
              });

              if (
                closestPosition !== -1 &&
                minDistance < this.currentAttachThreshold
              ) {
                // Размещение элемента на шнуре
                element.onCord = true;
                element.positionIndex = closestPosition;
                this.cordPositions[closestPosition].occupied = true;
                this.cordPositions[closestPosition].element = element;

                // Позиционирование элемента
                element.left = cordCenterX;
                element.top = this.cordPositions[closestPosition].y;
                element.setCoords();
              } else {
                // Элемент не прикреплен к шнуру, возвращаем на исходную позицию с анимацией
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
              }
            } else {
              // Элемент не прикреплен к шнуру, возвращаем на исходную позицию с анимацией
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
            }
          }
        });

        this.canvas.add(element);
        this.templateElements.push(element);
      });
      this.applyResponsive();
      this.canvas.renderAll();
    });
  }

  changeCord(color) {
    // Обновляем текущий цвет шнурка
    this.currentCordColor = color;

    if (this.currentCord) {
      this.canvas.remove(this.currentCord);
    }

    this.createCord(color).then((cord) => {
      this.currentCord = cord;
      this.canvas.add(cord);
      this.canvas.sendToBack(cord);

      // Убедимся, что полукольцо остается на заднем плане
      if (this.semiRing) {
        this.canvas.sendToBack(this.semiRing);
      }
      
      this.canvas.renderAll();
      this.applyResponsive();
    });
  }

  reset() {
    // Сброс всех элементов
    const leftPositions = [];
    const rightPositions = [];

    this.templateElements.forEach((element) => {
      // Снимаем элемент со шнура, если он там был
      if (element.onCord) {
        element.onCord = false;
        this.cordPositions[element.positionIndex].occupied = false;
        this.cordPositions[element.positionIndex].element = null;
        element.positionIndex = -1;
      }

      // Возвращаем элемент на свою сторону
      element.side = element.originalSide;

      // Генерируем новую случайную позицию без пересечений
      let newPosition;
      let attempts = 0;
      const maxAttempts = 20;
      const positionsArray =
        element.side === "left" ? leftPositions : rightPositions;

      do {
        newPosition = this.getRandomPosition(element.side, 100);
        attempts++;
      } while (
        attempts < maxAttempts &&
        this.isPositionOverlapping(newPosition, positionsArray, 100)
      );

      // Добавляем позицию в соответствующий массив
      positionsArray.push(newPosition);

      // Обновляем исходные координаты элемента
      element.originalLeft = newPosition.x + 50;
      element.originalTop = newPosition.y + 50;

      // Анимированно перемещаем элемент на новую позицию
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

    // Сброс позиций
    this.cordPositions.forEach((pos) => {
      pos.occupied = false;
      pos.element = null;
    });
    this.applyResponsive();
    this.canvas.renderAll();
  }

  getResultJson() {
    // Получаем URL текущего шнурка
    let cordImageUrl = "";
    if (
      this.currentCord &&
      this.currentCord._element &&
      this.currentCord._element.src
    ) {
      cordImageUrl = this.currentCord._element.src;
    } else {
      // По умолчанию зеленый шнур, если не удалось определить
      cordImageUrl = this.options.cordUrls.green;
    }

    // Получаем список элементов на шнуре
    const elementsOnCord = [];
    this.cordPositions.forEach((pos) => {
      if (pos.occupied && pos.element && pos.element.imageUrl) {
        elementsOnCord.push({
          imageUrl: pos.element.imageUrl,
        });
      }
    });

    // Формируем объект результата
    const result = {
      cord: cordImageUrl,
      elements: elementsOnCord,
    };

    // Возвращаем результат в формате JSON
    return JSON.stringify(result, null, 2);
  }

  getRandomPosition(side, elementSize = 100) {
    const cordCenterX = this.options.width / 2;
    const margin = 30;

    let minX, maxX;

    if (side === "left") {
      minX = margin;
      maxX = cordCenterX - this.options.cordWidth / 2 - margin - elementSize;
    } else {
      minX = cordCenterX + this.options.cordWidth / 2 + margin;
      maxX = this.options.width - margin - elementSize;
    }

    const minY = margin + 50; // Уменьшаем отступ сверху, так как высота канваса уменьшилась
    const maxY = this.options.height - margin - elementSize;

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

      // Используем easeOutCubic для более плавной анимации
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

  swapElementsOnCord(index1, index2) {
    if (
      index1 < 0 ||
      index1 >= this.cordPositions.length ||
      index2 < 0 ||
      index2 >= this.cordPositions.length
    ) {
      return;
    }

    const pos1 = this.cordPositions[index1];
    const pos2 = this.cordPositions[index2];

    // Обмен элементов
    const tempElement = pos1.element;
    pos1.element = pos2.element;
    pos2.element = tempElement;

    // Обмен занятости
    const tempOccupied = pos1.occupied;
    pos1.occupied = pos2.occupied;
    pos2.occupied = tempOccupied;

    // Обновление индексов у элементов
    if (pos1.element) {
      pos1.element.positionIndex = index1;
    }
    if (pos2.element) {
      pos2.element.positionIndex = index2;
    }

    // Анимация перемещения элементов
    if (pos1.element) {
      this.animateElement(
        pos1.element,
        pos1.element.left,
        pos1.element.top,
        this.currentCanvasWidth / 2,
        pos1.y,
        300
      );
    }
    if (pos2.element) {
      this.animateElement(
        pos2.element,
        pos2.element.left,
        pos2.element.top,
        this.currentCanvasWidth / 2,
        pos2.y,
        300
      );
    }
  }
}






