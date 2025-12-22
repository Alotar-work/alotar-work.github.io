document.addEventListener("DOMContentLoaded", function () {
  const debugConsole = new DebugConsole();

  const spanHTML =
    '<span class="mod--fs_20" style="font-size:20px;">Количество элементов:</span>';
  const keychainEditor = new KeychainEditor();
  keychainEditor.init(".product-gallery.layout-square");
  debugConsole.loglog("Инициализирован конструктор");

  var keychainClear = getCookie("keychainClear");
  if (keychainClear == 1) {
    setCookie("keychainDesign", JSON.stringify([]), 7);
    setCookie("keychainClear", 0, 7);
    keychainClear = 0;
    debugConsole.loglog("Очищеный куки");
  }

  var keychainDesign = getCookie("keychainDesign");
  if (keychainDesign) {
    keychainDesign = JSON.parse(keychainDesign);
    debugConsole.loglog("Получены данные о брелоках из кук:");
    debugConsole.loglog(keychainDesign);
  } else {
    keychainDesign = [];
    debugConsole.loglog("Данные о брелоках не найдены в куках");
  }

  function handleSelectChange(optionText) {
    const numberValue = parseInt(optionText, 10);
    let finalValue = isNaN(numberValue) ? 4 : numberValue;
    keychainEditor.setMaxElements(finalValue);
    debugConsole.loglog("Измененно количество элементов");
  }

  const selectCheck = setInterval(() => {
    const $selectElement = $("select.js--selectize");
    debugConsole.loglog("Ищем select с выбором количества элементов");
    if ($selectElement.length) {
      debugConsole.loglog("Проверяем, инициализирован ли selectize");
      if ($selectElement[0].selectize) {
        debugConsole.loglog("Selectize инициализирован");
        const selectizeInstance = $selectElement[0].selectize;
        selectizeInstance.setValue(2644630);
        $selectElement[0].insertAdjacentHTML("beforebegin", spanHTML);
        selectizeInstance.on("change", function (value) {
          selectedValue = true;
          const $selectedOption = selectizeInstance.getOption(value);
          const optionText = $selectedOption.text().trim();
          handleSelectChange(optionText);
        });
        clearInterval(selectCheck);
        debugConsole.loglog("Selectize обработчик установлен");
      } else {
        debugConsole.loglog(
          "Selectize не инициализирован, значит это мобильная версия с обычным select - проверяем наличие опций"
        );
        const hasOptions = $selectElement.find("option").length > 0;
        if (hasOptions) {
          debugConsole.loglog("Опции найдены");
          const emailI = $("#KD-email");
          if (emailI.length) {
            $(emailI[0]).css("border-bottom", "2px solid #626262");
          }
          $($selectElement[0])
            .parent()[0]
            .insertAdjacentHTML("beforebegin", spanHTML);
          $($selectElement[0]).val(2644630).change();
          $selectElement.on("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption) {
              const optionText = selectedOption.text.trim();
              handleSelectChange(optionText);
            }
          });
          clearInterval(selectCheck);
          debugConsole.loglog("Обычный select обработчик установлен");
        }
      }
    }
  }, 1000);

  const addBtn = document.getElementById("skuadd");
  if (addBtn) {
    debugConsole.loglog("Найдено кнопка добавления в корзину");
    const container = addBtn.parentNode;

    addBtn.style.position = "absolute";
    addBtn.style.top = "-999px";
    debugConsole.loglog("Кнопка добавления в корзину скрыта");
    var emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "KD-email";
    emailInput.placeholder = "Введите свой email";
    emailInput.style.width = "100%";
    emailInput.style.maxWidth = "360px";
    emailInput.style.height = "40px";
    emailInput.style.border = "none";
    emailInput.style.borderBottom = "1px solid black";
    emailInput.style.marginBottom = "10px";
    emailInput.style.fontSize = "20px";
    emailInput.style.fontFamily = "Arial";
    emailInput.style.fontWeight = "regular";
    emailInput.style.fontStyle = "regular";
    emailInput.style.letterSpacing = "0em";
    emailInput.style.gridColumn = "span 2";

    container.appendChild(emailInput);
    debugConsole.loglog("Добавлено поле 'Email'");

    var doneBtn = document.createElement("button");
    doneBtn.id = "KD-done-button";
    doneBtn.className = addBtn.className;
    doneBtn.innerHTML = addBtn.innerHTML;
    doneBtn.querySelector("span").textContent = "Готово";

    doneBtn.addEventListener("click", function () {
      debugConsole.loglog("Нажата кнопка 'Готово'");
      const resultJson = keychainEditor.getResultJson();
      const resultObj = JSON.parse(resultJson);
      const emailInput = document.getElementById("KD-email");
      debugConsole.loglog("Получены данные конструктора:");
      debugConsole.loglog(resultObj);
      debugConsole.loglog("Получен Email: " + emailInput.value);
      if (!resultJson) {
        alert("Ошибка сохранения. Обратитесь в поддержку.");
        return;
      }

      if (!emailInput.value) {
        alert("Пожалуйста, укажите свой адрес электронной почты");
        return;
      }
      if (!isValidEmail(emailInput.value)) {
        alert("Пожалуйста, введите корректный адрес электронной почты");
        return;
      }

      if (!Array.isArray(keychainDesign)) {
        keychainDesign = [];
      }
      debugConsole.loglog("Данные брелоков перед изменением:");
      debugConsole.loglog(keychainDesign);
      var fourCount = 0;
      var eightCount = 0;
      keychainDesign.forEach(function (keychain) {
        if (keychain.length == 4) fourCount++;
        if (keychain.length == 8) eightCount++;
      });
      debugConsole.loglog("Уже добалено в корзину:");
      debugConsole.loglog("Брелоков с четырмя элементами - " + fourCount);
      debugConsole.loglog("Брелоков с восьмью элементами - " + eightCount);
      if (
        fourCount == 3 ||
        (eightCount == 1 && fourCount == 1) ||
        (eightCount == 1 && fourCount == 0 && resultObj.elements.length == 8)
      ) {
        alert(
          "Пожалуйста, оформите заказ, прежде чем добавлять в корзину ещё один брелок."
        );
        return;
      }

      if (resultObj.elements.length == 4 || resultObj.elements.length == 8) {
        keychainClear = getCookie("keychainClear");
        if (keychainClear == 1) {
          setCookie("keychainDesign", JSON.stringify([]), 7);
          setCookie("keychainClear", 0, 7);
          keychainDesign = [];
        }

        var keychainInfo = {
          length: resultObj.elements.length,
          title: "Амулет из " + resultObj.elements.length + " элементов",
          design: resultJson,
        };
        keychainDesign.push(keychainInfo);
        debugConsole.loglog(
          "Добавлен брелок в корзину. Текущие данные брелоков в корзине:"
        );
        debugConsole.loglog(keychainDesign);
        setCookie("keychainDesign", JSON.stringify(keychainDesign), 7);
        setCookie("kD_email", emailInput.value, 7);
        debugConsole.loglog("Данные из кук:");
        debugConsole.loglog(getCookie("keychainDesign"));
        addBtn.click();
        debugConsole.loglog("Симулировано нажатие на кнопку 'Добавить в корзину'");
        window.location.href = "/playthings/cart";
        debugConsole.loglog("Переадресация в корзину");
      } else {
        alert("Вы добавили недостаточно элементов");
        return;
      }
    });

    container.appendChild(doneBtn);
    debugConsole.loglog("Добавлено кнопка 'Готово'");
  }
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      ";expires=" +
      expires.toUTCString() +
      ";path=/";
  }
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  function debugConsole.loglog(message) {
    let debugContainer = document.getElementById("debug-container");
    if (!debugContainer) {
      debugContainer = document.createElement("div");
      debugContainer.id = "debug-container";
      Object.assign(debugContainer.style, {
        position: "fixed",
        bottom: "0",
        left: "0",
        width: "100%",
        height: "200px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#00ff00",
        fontFamily: "Courier New, Courier, monospace",
        fontSize: "14px",
        padding: "10px",
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: "9999",
        borderTop: "2px solid #00ff00",
        wordBreak: "break-all",
      });
      const logContent = document.createElement("pre");
      logContent.style.margin = "0";
      logContent.style.whiteSpace = "pre-wrap";
      debugContainer.appendChild(logContent);
      document.body.appendChild(debugContainer);
    }
    const logContent = debugContainer.querySelector("pre");
    const timestamp = new Date().toLocaleTimeString();
    let textMessage;
    if (typeof message === "object") {
      textMessage = JSON.stringify(message, null, 2);
    } else {
      textMessage = String(message);
    }
    logContent.textContent += `[${timestamp}] ${textMessage}\n`;
    debugContainer.scrollTop = debugContainer.scrollHeight;
  }
});
