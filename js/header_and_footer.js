// Load components on page load
document.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;
      initDropdowns();
    });

fetch("footer.html")
  .then((response) => response.text())
  .then((data) => {
      document.getElementById("footer").innerHTML = data;
      // Даем время для полной загрузки DOM
      setTimeout(() => {
          if (window.reinitTranslator) {
              window.reinitTranslator();
          } else if (translatorInstance) {
              // Перепривязываем обработчики
              translatorInstance.attachButtonHandler();
          }
      }, 100);
  });
});

// Function for activating drop-down menus
function initDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("mouseenter", function () {
      this.querySelector(".dropdown-content").style.display = "flex";
    });
    dropdown.addEventListener("mouseleave", function () {
      this.querySelector(".dropdown-content").style.display = "none";
    });
  });
}

// After loading the header, we add indentation automatically
function addHeaderMargin() {
  const header = document.querySelector(".header");
  const main = document.querySelector("main");

  if (header && main) {
    const headerHeight = header.offsetHeight;
    main.style.marginTop = headerHeight + "px";
  }
}

// Automatically add some padding after the header to avoid overlapping content
fetch("header.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("header").innerHTML = data;
    initDropdowns();
    addHeaderMargin();
  });

// Load the script for translating the language of the text on the page
script = document.createElement("script");
script.src = "js/quick-translate.js";
document.body.appendChild(script);
