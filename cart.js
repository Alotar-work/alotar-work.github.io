document.addEventListener("DOMContentLoaded", () => {
  // Получаем полный URL
  const href = window.location.href;
  const debugConsole = new DebugConsole();

  // Проверяем, заканчивается ли URL на 'cart' или 'cart/'
  if (/\/cart(\?.*)?$/.test(href)) {
    var setEmail = false;
    // Создаем MutationObserver для отслеживания появления контейнера
    const observer = new MutationObserver(() => {
      let container = document.querySelector(".md-shopcart__delivery");

      if (container) {
        // Находим targetDiv внутри контейнера
        const targetDiv = container.querySelector(
          ".md-shopcart__cdek-type-delivery"
        );

        if (targetDiv) {
          const delivery_more_items = container.querySelector(
            ".md-shopcart__delivery-more-items"
          );
          if (delivery_more_items) {
            if (targetDiv.children.length > 0) {
              const placeholder_box = delivery_more_items.querySelector(
                ".form__placeholder-box"
              );
              placeholder_box.classList.remove("select-city-input");
              const placeholder =
                delivery_more_items.querySelector(".form__placeholder");
              placeholder.classList.remove("select-city-label");
            } else {
              const placeholder_box = delivery_more_items.querySelector(
                ".form__placeholder-box"
              );
              placeholder_box.classList.add("select-city-input");
              const placeholder =
                delivery_more_items.querySelector(".form__placeholder");
              placeholder.classList.add("select-city-label");
            }

            const input = container.querySelector('input[name="point_name"]');

            if (input) {
              const point = targetDiv.querySelector(".block__1_KHZ");
              if (point) point.classList.remove("select-city-label");
            } else {
              const point = targetDiv.querySelector(".block__1_KHZ");
              if (point) point.classList.add("select-city-label");
            }
          }
        }

        if (!setEmail) {
          const kdEmail = getCookie("kD_email");
          var keychainDesign = getCookie("keychainDesign");
          const emailInput = document.querySelector("input[type='email']");
          const descInput = document.querySelector(
            'textarea[name="Комментарии к заказу"]'
          );
          debugConsole.log("Полученые данные о брелоках из кук:");
          debugConsole.log(keychainDesign);

          if (!keychainDesign) {
            document
              .querySelectorAll(".md-shopcart__grid-item")
              .forEach((item) => {
                const titleEl = item.querySelector(".item-title__name");
                if (titleEl?.textContent.trim() === "Собери свой АМУЛЕТ") {
                  item.querySelector(".md-shopcart__item-delete a").click();
                  const modal = document.getElementById("checkout-modal-root");
                  modal.querySelector(".btn-success")?.click();
                }
              });
            debugConsole.log(
              "В куках не найдены данные о брелоках. Всё найденные брулоки в корзине удалены."
            );
          }

          const hasEightElements = Array.from(
            document.querySelectorAll(".md-shopcart__grid-item")
          ).some(
            (item) =>
              item.querySelector(".item-title__name")?.textContent.trim() ===
                "Собери свой АМУЛЕТ" &&
              item
                .querySelector(".sku-item")
                ?.textContent.includes("количество элементов: 8")
          );
          var newKeychainDesignArray = [];
          document
            .querySelectorAll(".md-shopcart__grid-item")
            .forEach((item) => {
              const titleEl = item.querySelector(".item-title__name");

              if (titleEl?.textContent.trim() === "Собери свой АМУЛЕТ") {
                const skuEl = item.querySelector(".sku-item");
                const inputEl = item.querySelector(".box-number__input");
                const minusBtn = item.querySelector(".control-minus");

                // 1. Скрываем кнопки
                item.querySelector(".control-minus").style.display = "none";
                item.querySelector(".control-plus").style.display = "none";
                var elementCount = 0;
                if (skuEl && inputEl && minusBtn) {
                  elementCount = parseInt(
                    skuEl.textContent.split(":")[1].trim(),
                    10
                  );
                  let maxQty = 3;

                  if (elementCount === 8) {
                    maxQty = 1;
                  } else if (elementCount === 4 && hasEightElements) {
                    maxQty = 1;
                  }

                  const currentQty = parseInt(inputEl.value, 10);
                  if (currentQty > maxQty) {
                    const clickMinus = (timesToClick) => {
                      if (timesToClick <= 0) return;
                      minusBtn.click();
                      setTimeout(() => clickMinus(timesToClick - 1), 150); // 150ms задержка
                    };
                    clickMinus(currentQty - maxQty);
                  }
                }

                var keychainDesignArray = [];
                if (keychainDesign) {
                  keychainDesignArray = JSON.parse(keychainDesign);
                }
                item
                  .querySelector(".md-shopcart__item-delete a")
                  ?.addEventListener("click", (e) => {
                    debugConsole.log(
                      "Клик на кнопку удаления брелока из корзины"
                    );
                    newKeychainDesignArray = keychainDesignArray.filter(
                      function (keychain) {
                        return keychain.length !== elementCount;
                      }
                    );
                    console.log(newKeychainDesignArray);
                  });
              }
            });

          const btnSuccess = document.querySelectorAll(".btn-success");
          btnSuccess.forEach(function (btn) {
            btn.addEventListener("click", (e) => {
              setCookie(
                "keychainDesign",
                JSON.stringify(newKeychainDesignArray),
                7
              );
              keychainDesign = getCookie("keychainDesign");
              descInput.textContent = "Данные брелока: " + keychainDesign;
              debugConsole.log("Подтверждение удалени брелока");
              debugConsole.log("Обновлённые данные");
              debugConsole.log(keychainDesign);
            });
          });

          if (emailInput && kdEmail) {
            emailInput.value = kdEmail;
            setEmail = true;
            const nextLabel = emailInput.nextElementSibling;
            if (nextLabel && nextLabel.tagName.toLowerCase() === "label") {
              nextLabel.style.display = "none";
            }
          }
          if (descInput && keychainDesign) {
            descInput.textContent = "Данные брелока: " + keychainDesign;
            setEmail = true;
            const nextLabel = descInput.nextElementSibling;
            if (nextLabel && nextLabel.tagName.toLowerCase() === "div") {
              nextLabel.style.display = "none";
            }
          }
          setCookie("keychainClear", 0, 7);
        }
      } else {
        setCookie("keychainClear", 1, 7);
      }
    });

    // Начинаем наблюдение за всем документом
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0)
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
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

  setTimeout(function () {
    $("#product-params-form a").on("click", function () {
      ym(98577918, "reachGoal", "gotocart");
    });
  }, 2000);
});
