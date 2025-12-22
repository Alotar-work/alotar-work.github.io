class DebugConsole {
  constructor() {
    this.containerId = "debug-container";
    this.storageKey = "debugLogs";
    this.cookieName = "debugModeEnabled";
    this.maxLogs = 500;
    this.isActive = false;
    this.container = null;
    this.logContent = null;
    this.logs = [];
    this.init();
  }
  init() {
    const urlMode = this.checkUrlForDebugMode();
    let shouldActivate = false;
    if (urlMode === "1") {
      shouldActivate = true;
      this.setCookie(this.cookieName, "true", 30);
      console.log(
        "DebugConsole: Активирован через URL (?debugMode=1). Кука установлена."
      );
    } else if (urlMode === "0") {
      shouldActivate = false;
      this.deleteCookie(this.cookieName);
      console.log(
        "DebugConsole: Деактивирован через URL (?debugMode=0). Кука удалена."
      );
    } else {
      const cookieValue = this.getCookie(this.cookieName);
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
    const params = new URLSearchParams(window.location.search);
    return params.get("debugMode");
  }
  createContainer() {
    this.container = document.createElement("div");
    this.container.id = this.containerId;
    Object.assign(this.container.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "200px",
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      color: "#eee",
      fontFamily:
        'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: "13px",
      padding: "10px",
      boxSizing: "border-box",
      overflowY: "auto",
      zIndex: "99999",
      borderTop: "1px solid #444",
      display: "flex",
      flexDirection: "column",
    });
    this.clearButton = document.createElement("button");
    this.clearButton.textContent = "Очистить";
    Object.assign(this.clearButton.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      border: "1px solid #555",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#ccc",
      cursor: "pointer",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      zIndex: "10",
    });
    this.clearButton.addEventListener("click", () => {
      this.clear();
    });
    this.logContent = document.createElement("pre");
    this.logContent.style.margin = "0";
    this.logContent.style.whiteSpace = "pre-wrap";
    this.logContent.style.flexGrow = "1";
    this.container.appendChild(this.logContent);
    this.container.appendChild(this.clearButton);
    document.body.appendChild(this.container);
  }
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
    this.container.scrollTop = this.container.scrollHeight;
    this.saveLogsToStorage();
  }
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
  loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem(this.storageKey);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        this.logContent.textContent = this.logs.join("\n") + "\n";
        this.container.scrollTop = this.container.scrollHeight;
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
  clear() {
    if (!this.isActive) return;
    this.logs = [];
    this.logContent.textContent = "";
    localStorage.removeItem(this.storageKey);
    console.log("DebugConsole: Логи очищены.");
  }
  // --- Вспомогательные функции для работы с Cookie ---
  setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  deleteCookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}
