document.addEventListener('DOMContentLoaded', function() {
// Elements for managing FAQ
    const faqCategories = document.querySelectorAll('.faq-category');
    const categorySections = document.querySelectorAll('.faq-category-section');
    const categoryHeaders = document.querySelectorAll('.category-header');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const searchInput = document.getElementById('faqSearch');
    
// Function to activate the category
    function activateCategory(category) {
        faqCategories.forEach(cat => cat.classList.remove('active'));
        
        // Add the active class of the selected category
        if (category !== 'all') {
            document.querySelector(`.faq-category[data-category="${category}"]`).classList.add('active');
        } else {
            document.querySelector('.faq-category[data-category="all"]').classList.add('active');
        }
        
        // Show/hide categories
        categorySections.forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.classList.remove('hide-category');
                // Open the category
                section.classList.add('active');
                section.querySelector('.category-content').style.display = 'block';
            } else {
                section.classList.add('hide-category');
                section.classList.remove('active');
                section.querySelector('.category-content').style.display = 'none';
            }
        });
    }
    
    // Handlers for filter categories
    faqCategories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryType = this.dataset.category;
            activateCategory(categoryType);
        });
    });
    
    // Handlers for opening/closing categories
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const categorySection = this.parentElement;
            const content = this.nextElementSibling;
            const toggleIcon = this.querySelector('.toggle-icon i');
            
            // Switch the active class
            categorySection.classList.toggle('active');
            
            // Show/hide content
            if (categorySection.classList.contains('active')) {
                content.style.display = 'block';
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                content.style.display = 'none';
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Handlers for opening/closing questions
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-icon i');
            
            // Close all other open questions in the same category
            const activeFaqItems = faqItem.parentElement.querySelectorAll('.faq-item.active');
            activeFaqItems.forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.display = 'none';
                    item.querySelector('.faq-icon i').classList.remove('fa-minus');
                    item.querySelector('.faq-icon i').classList.add('fa-plus');
                }
            });
            
            // Switch the current question
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                answer.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
        });
    });
    
    // Function for searching by questions
    function searchFAQs(query) {
        const searchTerm = query.toLowerCase().trim();
        
        // Если поиск пустой, показываем все вопросы
        if (searchTerm === '') {
            faqQuestions.forEach(question => {
                const faqItem = question.parentElement;
                const categorySection = faqItem.closest('.faq-category-section');
                
                faqItem.classList.remove('hide-faq');
                categorySection.classList.remove('hide-category');
            });
            
            // Проверяем, есть ли сообщение "ничего не найдено" и удаляем его
            const noResults = document.querySelector('.no-results');
            if (noResults) noResults.remove();
            
            return;
        }
        
        let foundResults = false;
        
        // Ищем по вопросам и ответам
        faqQuestions.forEach(question => {
            const faqItem = question.parentElement;
            const questionText = question.querySelector('span').textContent.toLowerCase();
            const answerText = faqItem.querySelector('.faq-answer p').textContent.toLowerCase();
            const categorySection = faqItem.closest('.faq-category-section');
            
            // Проверяем, содержит ли вопрос или ответ поисковый запрос
            if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                faqItem.classList.remove('hide-faq');
                categorySection.classList.remove('hide-category');
                foundResults = true;
                
                // Открываем категорию, если она закрыта
                categorySection.classList.add('active');
                categorySection.querySelector('.category-content').style.display = 'block';
                
                // Открываем сам вопрос
                faqItem.classList.add('active');
                faqItem.querySelector('.faq-answer').style.display = 'block';
                faqItem.querySelector('.faq-icon i').classList.remove('fa-plus');
                faqItem.querySelector('.faq-icon i').classList.add('fa-minus');
            } else {
                faqItem.classList.add('hide-faq');
                
                // Проверяем, есть ли другие видимые вопросы в категории
                const visibleItems = categorySection.querySelectorAll('.faq-item:not(.hide-faq)');
                if (visibleItems.length === 0) {
                    categorySection.classList.add('hide-category');
                } else {
                    categorySection.classList.remove('hide-category');
                }
            }
        });
        
        // If nothing is found, show a message
        const faqContainer = document.querySelector('.faq-container');
        let noResults = document.querySelector('.no-results');
        
        if (!foundResults) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>По запросу "<strong>${query}</strong>" ничего не найдено.</p>
                    <p>Попробуйте изменить формулировку или обратитесь в поддержку.</p>
                `;
                faqContainer.appendChild(noResults);
            }
        } else if (noResults) {
            noResults.remove();
        }
    }
    
    searchInput.addEventListener('input', function() {
        searchFAQs(this.value);
    });
    
    activateCategory('all');
});