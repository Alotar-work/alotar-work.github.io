class DebugConsole {
  constructor() {
    // Уникальные идентификаторы и имена
    this.containerId = "debug-container";
    this.storageKey = "debugLogs";
    this.cookieName = "debugModeEnabled";

    // Настройки
    this.maxLogs = 500;

    // Состояние
    this.isActive = false;
    this.container = null;
    this.logContent = null;
    this.clearButton = null;
    this.logs = [];

    // Запускаем инициализацию
    this.init();
  }

  // --- Методы для работы с Cookie (теперь внутри класса) ---

  /**
   * Устанавливает cookie
   * @param {string} name - Имя cookie
   * @param {string} value - Значение cookie
   * @param {number} days - Количество дней для хранения
   */
  _setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  /**
   * Получает значение cookie по имени
   * @param {string} name - Имя cookie
   * @returns {string|null} Значение cookie или null, если не найдено
   */
  _getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Удаляет cookie по имени
   * @param {string} name - Имя cookie
   */
  _deleteCookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  // --- Основные методы класса ---

  /**
   * Основной метод инициализации с проверкой URL и Cookie
   */
  init() {
    const urlMode = this.checkUrlForDebugMode();
    let shouldActivate = false;

    // Приоритет у параметра в URL
    if (urlMode === "1") {
      shouldActivate = true;
      this._setCookie(this.cookieName, "true", 30); // Устанавливаем куку на 30 дней
      console.log(
        "DebugConsole: Активирован через URL (?debugMode=1). Кука установлена."
      );
    } else if (urlMode === "0") {
      shouldActivate = false;
      this._deleteCookie(this.cookieName);
      console.log(
        "DebugConsole: Деактивирован через URL (?debugMode=0). Кука удалена."
      );
    } else {
      // Если параметра в URL нет, проверяем наличие куки
      const cookieValue = this._getCookie(this.cookieName);
      if (cookieValue === "true") {
        shouldActivate = true;
        console.log("DebugConsole: Активирован через cookie.");
      }
    }

    if (shouldActivate) {
      this.isActive = true;
      this.createContainer();
      this.loadLogsFromStorage();
    }
  }

  /**
   * Проверяет наличие параметра debugMode в URL
   * @returns {string|null} Возвращает '1', '0' или null
   */
  checkUrlForDebugMode() {
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
      boxSizing: "border-box",
      zIndex: "99999",
      borderTop: "1px solid #444",
      display: "flex",
      flexDirection: "column",
    });

    // 2. Контейнер для кнопок (не прокручивается)
    const controlsContainer = document.createElement("div");
    Object.assign(controlsContainer.style, {
      flexShrink: "0",
      padding: "8px 10px",
      borderBottom: "1px solid #333",
      backgroundColor: "rgba(0,0,0,0.2)",
      textAlign: "right",
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
      flexGrow: "1",
      overflowY: "auto",
      padding: "10px",
    });

    // --- Сборка контейнера ---
    this.container.appendChild(controlsContainer);
    this.container.appendChild(this.logContent);
    document.body.appendChild(this.container);
  }

  /**
   * Основной метод для добавления нового сообщения в лог
   * @param {any} message - Сообщение для вывода
   */
  log(message) {
    if (!this.isActive) return;
    const timestamp = new Date().toLocaleTimeString();
    let textMessage =
      typeof message === "object"
        ? JSON.stringify(message, null, 2)
        : String(message);
    const logEntry = `[${timestamp}] ${textMessage}`;
    this.logs.push(logEntry);
    this.logContent.textContent += logEntry + "\n";
    this.logContent.scrollTop = this.logContent.scrollHeight;
    this.saveLogsToStorage();
  }

  /**
   * Сохраняет текущие логи в localStorage
   */
  saveLogsToStorage() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (e) {
      console.error(
        "DebugConsole: Не удалось сохранить логи в localStorage.",
        e
      );
    }
  }

  /**
   * Загружает логи из localStorage и выводит их в контейнер
   */
  loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem(this.storageKey);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        this.logContent.textContent = this.logs.join("\n") + "\n";
        this.logContent.scrollTop = this.logContent.scrollHeight;
        console.log(
          `DebugConsole: Загружено ${this.logs.length} записей из localStorage.`
        );
      }
    } catch (e) {
      console.error(
        "DebugConsole: Не удалось загрузить логи из localStorage.",
        e
      );
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Очищает логи из UI, памяти и localStorage
   */
  clear() {
    if (!this.isActive) return;
    this.logs = [];
    this.logContent.textContent = "";
    localStorage.removeItem(this.storageKey);
    console.log("DebugConsole: Логи очищены.");
  }
}
