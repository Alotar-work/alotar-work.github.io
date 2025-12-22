document.addEventListener("DOMContentLoaded", function () {
  const spanHTML =
    '<span class="mod--fs_20" style="font-size:20px;">Количество элементов:</span>';
  const keychainEditor = new KeychainEditor();
  keychainEditor.init(".product-gallery.layout-square");

  var keychainClear = getCookie("keychainClear");
  if (keychainClear == 1) {
    setCookie("keychainDesign", JSON.stringify([]), 7);
    setCookie("keychainClear", 0, 7);
    keychainClear = 0;
  }

  var keychainDesign = getCookie("keychainDesign");
  if (keychainDesign) {
    keychainDesign = JSON.parse(keychainDesign);
  } else {
    keychainDesign = [];
  }

  function handleSelectChange(optionText) {
    const numberValue = parseInt(optionText, 10);
    let finalValue = isNaN(numberValue) ? 4 : numberValue;
    keychainEditor.setMaxElements(finalValue);
  }

  const selectCheck = setInterval(() => {
    const $selectElement = $("select.js--selectize");

    if ($selectElement.length) {
      // Проверяем, инициализирован ли selectize
      if ($selectElement[0].selectize) {
        // Десктопная версия с selectize
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
        console.log("Selectize обработчик установлен");
      } else {
        // Мобильная версия с обычным select - проверяем наличие опций
        const hasOptions = $selectElement.find("option").length > 0;
        if (hasOptions) {
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
          console.log("Обычный select обработчик установлен");
        }
      }
    }
  }, 1000);

  const addBtn = document.getElementById("skuadd");
  if (addBtn) {
    const container = addBtn.parentNode;

    addBtn.style.position = "absolute";
    addBtn.style.top = "-999px";

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

    var doneBtn = document.createElement("button");
    doneBtn.id = "KD-done-button";
    doneBtn.className = addBtn.className;
    doneBtn.innerHTML = addBtn.innerHTML;
    doneBtn.querySelector("span").textContent = "Готово";

    doneBtn.addEventListener("click", function () {
      const resultJson = keychainEditor.getResultJson();
      const resultObj = JSON.parse(resultJson);
      const emailInput = document.getElementById("KD-email");

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

      var fourCount = 0;
      var eightCount = 0;
      keychainDesign.forEach(function (keychain) {
        if (keychain.length == 4) fourCount++;
        if (keychain.length == 8) eightCount++;
      });

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

        setCookie("keychainDesign", JSON.stringify(keychainDesign), 7);
        setCookie("kD_email", emailInput.value, 7);
        addBtn.click();
        window.location.href = "/playthings/cart";
      } else {
        alert("Вы добавили недостаточно элементов");
        return;
      }
    });

    container.appendChild(doneBtn);
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
});
