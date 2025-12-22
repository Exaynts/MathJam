// Hide and seek aside panel
document.addEventListener("DOMContentLoaded", function () {
  const asideToggle = document.getElementById("asideToggle");
  const asideContainer = document.querySelector(".aside-container");
  const mainContent = document.querySelector(".main-content");

  asideToggle.addEventListener("click", function () {
    asideContainer.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  });
});
