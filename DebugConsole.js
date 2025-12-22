class DebugConsole {
  constructor() {
    this.containerId = "debug-container";
    this.storageKey = "debugLogs";
    this.cookieName = "debugModeEnabled";
    this.maxLogs = 500;
    this.isActive = false;
    this.container = null;
    this.logContent = null;
    this.clearButton = null;
    this.logs = [];
    this.init();
  }

  init() {
    /* ... (без изменений) */
    const urlMode = this.checkUrlForDebugMode();
    let shouldActivate = false;
    if (urlMode === "1") {
      shouldActivate = true;
      setCookie(this.cookieName, "true", 30);
      console.log(
        "DebugConsole: Активирован через URL (?debugMode=1). Кука установлена."
      );
    } else if (urlMode === "0") {
      shouldActivate = false;
      deleteCookie(this.cookieName);
      console.log(
        "DebugConsole: Деактивирован через URL (?debugMode=0). Кука удалена."
      );
    } else {
      const cookieValue = getCookie(this.cookieName);
      if (cookieValue === "true") {
        shouldActivate = true;
        console.log("DebugConsole: Активирован через cookie.");
      } else {
        console.log(
          "DebugConsole: Неактивен. Для активации добавьте ?debugMode=1 к URL."
        );
      }
    }
    if (shouldActivate) {
      this.isActive = true;
      this.createContainer();
      this.loadLogsFromStorage();
    }
  }

  checkUrlForDebugMode() {
    /* ... (без изменений) */
    const params = new URLSearchParams(window.location.search);
    return params.get("debugMode");
  }

  /**
   * Создает контейнер с правильной структурой: controls (сверху) + log content (снизу с прокруткой)
   */
  createContainer() {
    // 1. Главный контейнер (flex-контейнер)
    this.container = document.createElement("div");
    this.container.id = this.containerId;
    Object.assign(this.container.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "300px",
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      color: "#eee",
      fontFamily:
        'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: "13px",
      // УБИРАЕМ overflowY и padding отсюда
      boxSizing: "border-box",
      zIndex: "99999",
      borderTop: "1px solid #444",
      // ВКЛЮЧАЕМ flex для дочерних элементов
      display: "flex",
      flexDirection: "column",
    });

    // 2. Контейнер для кнопок (не прокручивается)
    const controlsContainer = document.createElement("div");
    Object.assign(controlsContainer.style, {
      flexShrink: "0", // Этот блок не будет сжиматься
      padding: "8px 10px",
      borderBottom: "1px solid #333",
      backgroundColor: "rgba(0,0,0,0.2)", // Немного затемним для отделения
      textAlign: "right", // Кнопка справа
    });

    // --- Создание кнопки "Очистить" ---
    this.clearButton = document.createElement("button");
    this.clearButton.textContent = "Очистить";
    Object.assign(this.clearButton.style, {
      border: "1px solid #555",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#ccc",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
    });
    this.clearButton.addEventListener("click", () => this.clear());

    controlsContainer.appendChild(this.clearButton);

    // 3. Контейнер для логов (прокручивается)
    this.logContent = document.createElement("pre");
    Object.assign(this.logContent.style, {
      margin: "0",
      whiteSpace: "pre-wrap",
      flexGrow: "1", // Занимает все оставшееся место
      overflowY: "auto", // ПРОКРУТКА ТЕПЕРЬ ЗДЕСЬ
      padding: "10px", // Добавим padding для текста
    });

    // --- Сборка контейнера ---
    this.container.appendChild(controlsContainer);
    this.container.appendChild(this.logContent);
    document.body.appendChild(this.container);
  }

  log(message) {
    /* ... (без изменений) */
    if (!this.isActive) return;
    const timestamp = new Date().toLocaleTimeString();
    let textMessage =
      typeof message === "object"
        ? JSON.stringify(message, null, 2)
        : String(message);
    const logEntry = `[${timestamp}] ${textMessage}`;
    this.logs.push(logEntry);
    this.logContent.textContent += logEntry + "\n";
    this.logContent.scrollTop = this.logContent.scrollHeight; // Прокручиваем именно этот элемент
    this.saveLogsToStorage();
  }

  saveLogsToStorage() {
    /* ... (без изменений) */
  }
  loadLogsFromStorage() {
    /* ... (без изменений) */
  }
  clear() {
    /* ... (без изменений) */
  }
}
