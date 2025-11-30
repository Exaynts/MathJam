// Configuration
const DEFAULT_LANGUAGE = 'en';
const DICTIONARY_PATH = 'lang/';
let currentLanguage = DEFAULT_LANGUAGE;
let dictionary = {};

// Load dictionary from JSON file
async function loadLanguage(lang) {
    try {
        console.log(`Loading language: ${lang}`);
        const response = await fetch(`${DICTIONARY_PATH}${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not load dictionary: ${lang}.json`);
        }
        const translations = await response.json();
        console.log(`Loaded ${Object.keys(translations).length} translations for ${lang}`);
        return translations;
    } catch (error) {
        console.error('Error loading language file:', error);
        if (lang !== DEFAULT_LANGUAGE) {
            console.log('Falling back to default language');
            return loadLanguage(DEFAULT_LANGUAGE);
        }
        return {};
    }
}

// Apply translation to the page
function applyTranslation(translations) {
    console.log('Applying translations...');
    
    // Update text content for elements with data-i18n
    const textElements = document.querySelectorAll('[data-i18n]');
    console.log(`Found ${textElements.length} text elements to translate`);
    
    textElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // Сохраняем структуру ссылок
            if (element.tagName === 'A') {
                // Для ссылок заменяем только текстовое содержимое, сохраняя HTML
                const originalHTML = element.innerHTML;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalHTML;
                
                // Заменяем текстовые узлы
                const walker = document.createTreeWalker(
                    tempDiv,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                let textReplaced = false;
                while (node = walker.nextNode()) {
                    if (node.textContent.trim() && !textReplaced) {
                        node.textContent = translations[key];
                        textReplaced = true;
                    }
                }
                
                // Если не нашли текстовый узел, просто заменяем весь контент
                if (!textReplaced) {
                    element.textContent = translations[key];
                } else {
                    element.innerHTML = tempDiv.innerHTML;
                }
            } else {
                // Для обычных элементов заменяем весь контент
                element.textContent = translations[key];
            }
        }
    });

    // Update placeholders for elements with data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    console.log(`Found ${placeholderElements.length} placeholder elements to translate`);
    
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    console.log(`Set HTML lang to: ${currentLanguage}`);

    // Update language toggle button text
    const languageToggle = document.querySelector('.language-btn');
    if (languageToggle && translations['English']) {
        languageToggle.textContent = translations['English'];
        console.log('Updated language button text');
    }
    
    // Update date inputs language
    updateDateInputsLanguage();
}

// Set the language for date input fields
function updateDateInputsLanguage() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        const lang = currentLanguage || DEFAULT_LANGUAGE;
        input.setAttribute('lang', lang === 'en' ? 'en-US' : 'ru-RU');
        const existingHints = input.parentNode.querySelectorAll('.date-format-hint');
        existingHints.forEach(hint => hint.remove());
    });
}

// Switch language
async function switchLanguage(lang) {
    if (lang === currentLanguage) {
        console.log(`Language already set to: ${lang}`);
        return;
    }

    try {
        console.log(`Switching to language: ${lang}`);
        const translations = await loadLanguage(lang);
        dictionary = translations;
        currentLanguage = lang;
        
        applyTranslation(translations);
        localStorage.setItem('userLanguage', lang);
        
        console.log(`Successfully switched to: ${lang}`);
    } catch (error) {
        console.error('Error switching language:', error);
    }
}

// Toggle between Russian and English
function toggleLanguage() {
    console.log('Language toggle clicked');
    const newLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    console.log(`Toggling from ${currentLanguage} to ${newLanguage}`);
    switchLanguage(newLanguage);
}

// Initialize translation system
async function initTranslation() {
    console.log('Initializing translation system...');
    
    // Get saved language or detect browser language
    const savedLanguage = localStorage.getItem('userLanguage');
    const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    const initialLanguage = savedLanguage || browserLang || DEFAULT_LANGUAGE;

    console.log(`Initial language: ${initialLanguage} (saved: ${savedLanguage}, browser: ${browserLang})`);

    // Load and apply initial language
    await switchLanguage(initialLanguage);

    // Add event listener to language toggle button
    const languageToggle = document.querySelector('.language-btn');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguage);
        console.log('Added event listener to language button');
    } else {
        console.log('Language button not found');
    }
}

// Make functions globally available
window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.getTranslation = function(key) {
    return dictionary[key] || key;
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslation);
} else {
    initTranslation();
}