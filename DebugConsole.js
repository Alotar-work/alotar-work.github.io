class DebugConsole {
  constructor() {
    this.containerId = "debug-container";
    this.storageKey = "debugLogs";
    this.maxLogs = 500;
    this.isActive = false;
    this.container = null;
    this.logContent = null;
    this.logs = [];
    this.init();
  }

  init() {
    if (this.checkUrlForDebugMode()) {
      this.isActive = true;
      console.log("DebugConsole: Активирован. Режим отладки включен.");
      this.createContainer();
      this.loadLogsFromStorage();
    }
  }

  checkUrlForDebugMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("debugMode") === "1";
  }

  createContainer() {
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
      padding: "10px",
      boxSizing: "border-box",
      overflowY: "auto",
      zIndex: "99999",
      borderTop: "1px solid #444",
      display: "flex",
      flexDirection: "column",
    });
    this.logContent = document.createElement("pre");
    this.logContent.style.margin = "0";
    this.logContent.style.whiteSpace = "pre-wrap";
    this.logContent.style.flexGrow = "1";
    this.container.appendChild(this.logContent);
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
}
