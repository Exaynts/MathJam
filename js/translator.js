const DEFAULT_LANG = 'en';
let currentLang = localStorage.getItem('userLanguage') || DEFAULT_LANG;
let dictionary = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch {
        if (lang !== DEFAULT_LANG) return loadLanguage(DEFAULT_LANG);
        return {};
    }
}

function applyTranslation(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            if (element.tagName === 'A' && element.children.length > 0) {
                const firstText = Array.from(element.childNodes).find(node => node.nodeType === 3);
                if (firstText) firstText.textContent = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) element.placeholder = translations[key];
    });

    document.documentElement.lang = currentLang;
    
    const langBtn = document.querySelector('.language-btn');
    if (langBtn && translations['English']) {
        langBtn.textContent = translations['English'];
    }
}

async function switchLanguage(lang) {
    if (lang === currentLang) return;
    
    const translations = await loadLanguage(lang);
    dictionary = translations;
    currentLang = lang;
    
    applyTranslation(translations);
    localStorage.setItem('userLanguage', lang);
}

function toggleLanguage() {
    switchLanguage(currentLang === 'ru' ? 'en' : 'ru');
}

async function initTranslation() {
    const savedLang = localStorage.getItem('userLanguage');
    const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
    const initialLang = savedLang || browserLang || DEFAULT_LANG;
    
    await switchLanguage(initialLang);
    
    document.querySelector('.language-btn')?.addEventListener('click', toggleLanguage);
}

window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.getTranslation = key => dictionary[key] || key;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslation);
} else {
    initTranslation();
}