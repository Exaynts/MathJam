// Загрузка компонентов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            // Активируем выпадающие меню после загрузки
            initDropdowns();
        });
    
    // Загрузка footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        });
});

// Функция для активации выпадающих меню
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            this.querySelector('.dropdown-content').style.display = 'flex';
        });
        dropdown.addEventListener('mouseleave', function() {
            this.querySelector('.dropdown-content').style.display = 'none';
        });
    });
}

// После загрузки хедера добавляем отступ автоматически
function addHeaderMargin() {
    const header = document.querySelector('.header');
    const main = document.querySelector('main');
    
    if (header && main) {
        const headerHeight = header.offsetHeight;
        main.style.marginTop = headerHeight + 'px';
    }
}

// Вызываем после загрузки хедера
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
        initDropdowns();
        addHeaderMargin(); // Автоматически добавляем отступ
    });