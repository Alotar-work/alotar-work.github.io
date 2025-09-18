document.addEventListener("DOMContentLoaded", function () {
  // Функция для поиска элемента и размещения канваса
  function findAndPlaceCanvas() {
    // Ищем элемент с классами "product-gallery layout-square"
    const targetElement = document.querySelector(
      ".product-gallery.layout-square"
    );

    if (targetElement) {
      // Элемент найден, очищаем его содержимое
      targetElement.innerHTML = "";

      // Создаем контейнер для канваса внутри найденного элемента
      const canvasContainer = document.createElement("div");
      canvasContainer.className = "canvas-container";
      canvasContainer.id = "canvas-container";
      targetElement.appendChild(canvasContainer);

      // Инициализируем конструктор брелков
      initKeychainEditor(canvasContainer);

      // Останавливаем интервал, если он был запущен
      if (window.canvasSearchInterval) {
        clearInterval(window.canvasSearchInterval);
      }
    } else {
      // Элемент не найден, будем искать снова через секунду
      if (!window.canvasSearchInterval) {
        window.canvasSearchInterval = setInterval(findAndPlaceCanvas, 1000);
      }
    }
  }

  // Функция инициализации редактора брелков
  function initKeychainEditor(canvasContainer) {
    // Создаем canvas через скрипт
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "keychain-canvas";
    canvasContainer.appendChild(canvasElement);

    // Инициализация canvas
    const canvas = new fabric.Canvas("keychain-canvas", {
      width: 600,
      height: 500,
      backgroundColor: "#f9f9f9",
    });

    // Конфигурация
    const cordWidth = 100; // Ширина шнурка 100px
    const cordColor = "#555";
    const maxElements = 4;

    // Массив с URL изображений элементов
    const elementsData = [
      "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-188f5c0d7dff3482d5fd48544b0d69b1.png",
      "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-adf4350d037d0422b1a2c6271d153640.png",
      "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-cf96b243eb89e85ea431646882121a54.png",
      "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-7a9c95e3b00b36c39188d1c5756d086d.png",
    ];

    // Переменная для хранения текущего шнурка
    let currentCord = null;

    // Загрузка изображений шнурков
    const cordUrls = {
      green:
        "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-e2aacb4b0c724ab91dbb67fd454395bd.png",
      gray: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-feb60a4aebc511c7d82b5e41167ead38.png",
      blue: "https://cdn-sh1.vigbo.com/shops/179902/products/24017636/images/3-418dccd27f75ff59e19dd9307db9a4ab.png",
    };

    // Массив для хранения позиций элементов на шнуре
    const cordPositions = [];
    const positionHeight = (canvas.height - 100) / (maxElements + 1);

    for (let i = 1; i <= maxElements; i++) {
      cordPositions.push({
        y: 5 + positionHeight * i,
        occupied: false,
        element: null,
      });
    }

    // Создание кнопки "Сбросить" внутри canvas
    const resetButton = new fabric.Group(
      [
        new fabric.Rect({
          width: 80,
          height: 30,
          fill: "#e74c3c",
          rx: 5,
          ry: 5,
          originX: "center",
          originY: "center",
        }),
        new fabric.Text("Сбросить", {
          fontSize: 14,
          fill: "white",
          originX: "center",
          originY: "center",
        }),
      ],
      {
        left: canvas.width - 90, // Устанавливаем left=canvas.width - 90
        top: 10, // Устанавливаем top=10 пикселей
        selectable: false,
        hoverCursor: "pointer",
        name: "resetButton",
      }
    );

    // Создание значка информации
    const infoIcon = new fabric.Group(
      [
        new fabric.Circle({
          radius: 15,
          fill: "#4a6fa5",
          originX: "center",
          originY: "center",
        }),
        new fabric.Text("i", {
          fontSize: 16,
          fill: "white",
          fontWeight: "bold",
          originX: "center",
          originY: "center",
        }),
      ],
      {
        left: 25, // Отступ слева 10px + 15px (радиус круга)
        top: 25, // Отступ сверху 10px + 15px (радиус круга)
        selectable: false,
        hoverCursor: "pointer",
        name: "infoIcon",
      }
    );

    // Создание надписи "Шнурки:"
    const cordLabel = new fabric.Text("Шнурки:", {
      fontSize: 14,
      fontWeight: "bold", // Сделано жирнее
      fill: "#333",
      left: 15, // Смещено левее на 10px (было 25)
      top: 70, // Смещено ниже на 10px (было 60)
      selectable: false,
      evented: false,
    });

    // Создание кружков для выбора цвета шнурка
    const greenCircle = new fabric.Circle({
      radius: 15,
      fill: "#4CAF50",
      left: 25,
      top: 95, // Смещено ниже из-за изменения позиции надписи
      selectable: false,
      hoverCursor: "pointer",
      name: "greenCircle",
    });

    const grayCircle = new fabric.Circle({
      radius: 15,
      fill: "#9E9E9E",
      left: 25,
      top: 130, // Смещено ниже из-за изменения позиции надписи
      selectable: false,
      hoverCursor: "pointer",
      name: "grayCircle",
    });

    const blueCircle = new fabric.Circle({
      radius: 15,
      fill: "#2196F3",
      left: 25,
      top: 165, // Смещено ниже из-за изменения позиции надписи
      selectable: false,
      hoverCursor: "pointer",
      name: "blueCircle",
    });

    // Создание модального окна с инструкциями
    const modalBackground = new fabric.Rect({
      width: 300,
      height: 180,
      fill: "white",
      stroke: "#ddd",
      strokeWidth: 1,
      rx: 5,
      ry: 5,
      originX: "center",
      originY: "center",
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.2)",
        blur: 10,
        offsetX: 0,
        offsetY: 0,
      }),
      selectable: false,
      evented: false, // установлено evented: false
      hoverCursor: "default",
    });

    const modalTitle = new fabric.Text("Инструкция:", {
      fontSize: 16,
      fill: "#333",
      fontWeight: "bold",
      originX: "center",
      originY: "center",
      left: 0,
      top: -60,
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    const modalText1 = new fabric.Text("1. Перетащите элемент на шнур", {
      fontSize: 14,
      fill: "#555",
      originX: "center",
      originY: "center",
      left: 0,
      top: -30,
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    const modalText2 = new fabric.Text("2. Можно разместить до 4 элементов", {
      fontSize: 14,
      fill: "#555",
      originX: "center",
      originY: "center",
      left: 0,
      top: -10,
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    const modalText3 = new fabric.Text(
      "3. Элементы на шнуре можно менять местами",
      {
        fontSize: 14,
        fill: "#555",
        originX: "center",
        originY: "center",
        left: 0,
        top: 10,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      }
    );

    const modalText4 = new fabric.Text(
      "4. Сдвиньте элемент в сторону, чтобы открепить",
      {
        fontSize: 14,
        fill: "#555",
        originX: "center",
        originY: "center",
        left: 0,
        top: 30,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      }
    );

    const modalText5 = new fabric.Text('5. Нажмите кнопку "Сбросить"', {
      fontSize: 14,
      fill: "#555",
      originX: "center",
      originY: "center",
      left: 0,
      top: 50,
      selectable: false,
      evented: false,
      hoverCursor: "default",
    });

    // Создание модального окна с инструкциями (без кнопки "Закрыть")
    const instructionsModal = new fabric.Group(
      [
        modalBackground,
        modalTitle,
        modalText1,
        modalText2,
        modalText3,
        modalText4,
        modalText5,
      ],
      {
        left: 10, // Устанавливаем left=10
        top: 70, // Установлено top=70
        selectable: false,
        visible: false,
        hoverCursor: "default",
        name: "instructionsModal",
        evented: false, // Группа не перехватывает события
      }
    );

    // Функция для создания шнурка
    function createCord(color) {
      return new Promise((resolve) => {
        fabric.Image.fromURL(
          cordUrls[color],
          function (img) {
            // Устанавливаем размеры изображения
            const targetWidth = cordWidth; // 100px
            const aspectRatio = img.height / img.width;
            const targetHeight = targetWidth * aspectRatio;

            img.set({
              left: canvas.width / 2 - targetWidth / 2,
              top: 5, // Позиция шнурка
              scaleX: targetWidth / img.width,
              scaleY: targetHeight / img.height,
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

    // Функция для создания элемента (картинки)
    function createElement(imageUrl, position) {
      return new Promise((resolve) => {
        fabric.Image.fromURL(
          imageUrl,
          function (img) {
            // Устанавливаем размеры изображения 100x100 пикселей
            const targetSize = 100; // 100px

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

    // Функция для получения результата в формате JSON
    function getResultJson() {
      // Получаем URL текущего шнурка
      let cordImageUrl = "";
      if (currentCord && currentCord._element && currentCord._element.src) {
        cordImageUrl = currentCord._element.src;
      } else {
        // По умолчанию зеленый шнур, если не удалось определить
        cordImageUrl = cordUrls.green;
      }

      // Получаем список элементов на шнуре
      const elementsOnCord = [];
      cordPositions.forEach((pos) => {
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
    window.getResultJson = getResultJson;

    // Инициализация с зеленым шнурком
    createCord("green").then((cord) => {
      currentCord = cord;
      canvas.add(cord);
      canvas.sendToBack(cord); // Отправляем шнурок на задний план
      canvas.renderAll();

      // После добавления шнурка создаем элементы
      createElements();
    });

    // Функция для создания всех элементов
    function createElements() {
      const elementSize = 100; // Размер элементов 100x100 пикселей
      const usedPositions = [];
      const templateElements = [];

      // Создаем элементы для каждого URL в массиве
      const elementPromises = elementsData.map((imageUrl, index) => {
        // Определяем сторону (слева или справа от шнура)
        const side = index % 2 === 0 ? "left" : "right";

        // Генерируем случайную позицию
        let position;
        let attempts = 0;
        const maxAttempts = 20;

        do {
          position = getRandomPosition(side, elementSize);
          attempts++;
        } while (
          attempts < maxAttempts &&
          isPositionOverlapping(position, usedPositions, elementSize)
        );

        usedPositions.push(position);
        position.side = side;

        return createElement(imageUrl, position);
      });

      // Добавляем все элементы на canvas после их загрузки
      Promise.all(elementPromises).then((elements) => {
        elements.forEach((element) => {
          // Добавляем обработчики событий для перетаскивания
          element.on("moving", function () {
            if (this.onCord && !this.isDetaching) {
              const cordCenterX = canvas.width / 2;

              // Проверка горизонтального смещения для открепления
              const horizontalDistance = Math.abs(this.left - cordCenterX);
              if (horizontalDistance > 50) {
                // Начинаем процесс открепления
                this.isDetaching = true;
                this.onCord = false;
                cordPositions[this.positionIndex].occupied = false;
                cordPositions[this.positionIndex].element = null;
                this.positionIndex = -1;
                return;
              }

              // Ограничиваем движение по горизонтали
              this.left = cordCenterX;

              // Проверка вертикального перемещения для обмена местами
              const currentPosition = cordPositions[this.positionIndex];
              const swapThreshold = positionHeight / 2; // Половина расстояния между позициями

              // Проверка перемещения вверх
              if (this.positionIndex > 0) {
                const upperPosition = cordPositions[this.positionIndex - 1];
                if (this.top < upperPosition.y + swapThreshold) {
                  swapElementsOnCord(
                    this.positionIndex,
                    this.positionIndex - 1
                  );
                }
              }

              // Проверка перемещения вниз
              if (this.positionIndex < cordPositions.length - 1) {
                const lowerPosition = cordPositions[this.positionIndex + 1];
                if (this.top > lowerPosition.y - swapThreshold) {
                  swapElementsOnCord(
                    this.positionIndex,
                    this.positionIndex + 1
                  );
                }
              }
            }
          });

          element.on("mouseup", function () {
            if (this.isDetaching) {
              // Элемент был откреплен, возвращаем в исходное положение
              this.isDetaching = false;
              animateElement(
                this,
                this.left,
                this.top,
                this.originalLeft,
                this.originalTop
              );
            } else if (this.onCord) {
              // Элемент на шнуре, проверяем, нужно ли вернуть его в позицию
              const positionY = cordPositions[this.positionIndex].y;
              const verticalDistance = Math.abs(this.top - positionY);

              // Если элемент сдвинут более чем на 5 пикселей, возвращаем его в позицию
              if (verticalDistance > 5) {
                animateElement(
                  this,
                  this.left,
                  this.top,
                  canvas.width / 2,
                  positionY,
                  300
                );
              }
            } else if (!this.onCord) {
              // Проверка, находится ли элемент над шнуром
              const cordCenterX = canvas.width / 2;
              const distance = Math.abs(this.left - cordCenterX);

              if (distance < 50) {
                // Поиск ближайшей свободной позиции
                let closestPosition = -1;
                let minDistance = Infinity;

                cordPositions.forEach((pos, index) => {
                  if (!pos.occupied) {
                    const dist = Math.abs(this.top - pos.y);
                    if (dist < minDistance) {
                      minDistance = dist;
                      closestPosition = index;
                    }
                  }
                });

                if (closestPosition !== -1 && minDistance < 50) {
                  // Размещение элемента на шнуре
                  this.onCord = true;
                  this.positionIndex = closestPosition;
                  cordPositions[closestPosition].occupied = true;
                  cordPositions[closestPosition].element = this;

                  // Позиционирование элемента
                  this.left = cordCenterX;
                  this.top = cordPositions[closestPosition].y;
                  this.setCoords();
                } else {
                  // Элемент не прикреплен к шнуру, возвращаем на исходную позицию с анимацией
                  animateElement(
                    this,
                    this.left,
                    this.top,
                    this.originalLeft,
                    this.originalTop
                  );
                }
              } else {
                // Элемент не прикреплен к шнуру, возвращаем на исходную позицию с анимацией
                animateElement(
                  this,
                  this.left,
                  this.top,
                  this.originalLeft,
                  this.originalTop
                );
              }
            }
          });

          canvas.add(element);
          templateElements.push(element);
        });

        // Сохраняем ссылки на элементы для использования в других функциях
        window.templateElements = templateElements;
        canvas.renderAll();
      });
    }

    // Функция для смены шнурка
    function changeCord(color) {
      if (currentCord) {
        canvas.remove(currentCord);
      }

      createCord(color).then((cord) => {
        currentCord = cord;
        canvas.add(cord);
        canvas.sendToBack(cord); // Отправляем шнурок на задний план
        canvas.renderAll();
      });
    }

    // Добавляем обработчик клика на кнопку сброса
    resetButton.on("mousedown", function () {
      // Сброс всех элементов
      const leftPositions = [];
      const rightPositions = [];

      window.templateElements.forEach((element) => {
        // Снимаем элемент со шнура, если он там был
        if (element.onCord) {
          element.onCord = false;
          cordPositions[element.positionIndex].occupied = false;
          cordPositions[element.positionIndex].element = null;
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
          newPosition = getRandomPosition(element.side, 100);
          attempts++;
        } while (
          attempts < maxAttempts &&
          isPositionOverlapping(newPosition, positionsArray, 100)
        );

        // Добавляем позицию в соответствующий массив
        positionsArray.push(newPosition);

        // Обновляем исходные координаты элемента
        element.originalLeft = newPosition.x + 50;
        element.originalTop = newPosition.y + 50;

        // Анимированно перемещаем элемент на новую позицию
        animateElement(
          element,
          element.left,
          element.top,
          element.originalLeft,
          element.originalTop
        );
      });

      // Сброс позиций
      cordPositions.forEach((pos) => {
        pos.occupied = false;
        pos.element = null;
      });

      canvas.renderAll();
    });

    // Добавляем обработчик клика на значок информации
    infoIcon.on("mousedown", function () {
      // Переключаем видимость модального окна
      instructionsModal.visible = !instructionsModal.visible;
      canvas.renderAll();

      // Гарантируем, что модальное окно поверх всех элементов
      canvas.bringToFront(instructionsModal);
    });

    // Добавляем обработчики клика на кружки выбора цвета шнурка
    greenCircle.on("mousedown", function () {
      changeCord("green");
    });

    grayCircle.on("mousedown", function () {
      changeCord("gray");
    });

    blueCircle.on("mousedown", function () {
      changeCord("blue");
    });

    // Добавляем все элементы на canvas
    canvas.add(resetButton);
    canvas.add(infoIcon);
    canvas.add(cordLabel);
    canvas.add(greenCircle);
    canvas.add(grayCircle);
    canvas.add(blueCircle);
    canvas.add(instructionsModal);

    // Функция для генерации случайной позиции в заданной области
    function getRandomPosition(side, elementSize = 100) {
      const cordCenterX = canvas.width / 2;
      const margin = 30; // Отступ от краев и шнура

      let minX, maxX;

      if (side === "left") {
        minX = margin;
        maxX = cordCenterX - cordWidth / 2 - margin - elementSize;
      } else {
        minX = cordCenterX + cordWidth / 2 + margin;
        maxX = canvas.width - margin - elementSize;
      }

      const minY = margin + 190; // Увеличено из-за смещения надписи и кружков
      const maxY = canvas.height - margin - elementSize;

      const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

      return { x, y, side };
    }

    // Функция проверки пересечения двух прямоугольников
    function doRectanglesOverlap(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }

    // Функция проверки, не пересекается ли новая позиция с существующими
    function isPositionOverlapping(newPos, existingPositions, elementSize) {
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

        if (doRectanglesOverlap(newRect, existingRect)) {
          return true;
        }
      }
      return false;
    }

    // Функция анимации перемещения элемента
    function animateElement(
      element,
      startLeft,
      startTop,
      endLeft,
      endTop,
      duration = 500
    ) {
      const startTime = new Date().getTime();

      function animate() {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Используем easeOutCubic для более плавной анимации
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        element.left = startLeft + (endLeft - startLeft) * easeProgress;
        element.top = startTop + (endTop - startTop) * easeProgress;

        element.setCoords();
        canvas.renderAll();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }

    // Функция обмена двух элементов на шнуре
    function swapElementsOnCord(index1, index2) {
      if (
        index1 < 0 ||
        index1 >= cordPositions.length ||
        index2 < 0 ||
        index2 >= cordPositions.length
      ) {
        return;
      }

      const pos1 = cordPositions[index1];
      const pos2 = cordPositions[index2];

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
        animateElement(
          pos1.element,
          pos1.element.left,
          pos1.element.top,
          canvas.width / 2,
          pos1.y,
          300
        );
      }
      if (pos2.element) {
        animateElement(
          pos2.element,
          pos2.element.left,
          pos2.element.top,
          canvas.width / 2,
          pos2.y,
          300
        );
      }
    }

    // Гарантируем, что модальное окно поверх всех элементов
    canvas.bringToFront(instructionsModal);

    // Обработка изменения размера окна
    window.addEventListener("resize", function () {
      canvas.calcOffset();
      canvas.renderAll();
    });
  }

  // Начинаем поиск элемента и размещение канваса
  findAndPlaceCanvas();
});
