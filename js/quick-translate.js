// Простой и безопасный перевод с внешними словарями
class SimpleTranslator {
    constructor() {
        this.dictionaries = {
            'rus': {},
            'eng': {}
        };
        this.currentLang = 'eng';
        this.originalTexts = new Map();
        this.init();
    }

    async init() {
        console.log('Translator initialized');
        await this.loadDictionaries();
        this.saveOriginalTexts();
        this.setupFooterButton();
        this.loadLanguagePreference();
    }

    async loadDictionaries() {
        try {
            console.log('Loading dictionaries from files...');
            const [rusResponse, engResponse] = await Promise.all([
                fetch('locales/rus.json'),
                fetch('locales/eng.json')
            ]);
            
            // Проверяем что файлы загрузились успешно
            if (!rusResponse.ok || !engResponse.ok) {
                throw new Error('Failed to load dictionary files');
            }
            
            this.dictionaries.rus = await rusResponse.json();
            this.dictionaries.eng = await engResponse.json();
            
            console.log('Dictionaries loaded from files:', this.dictionaries);
        } catch (error) {
            console.error('Error loading dictionaries from files:', error);
            console.log('Using fallback dictionaries...');
            // Fallback словарь
            this.dictionaries.rus = {};
            
            this.dictionaries.eng = {};
        }
    }

    saveOriginalTexts() {
        if (this.originalTexts.size > 0) return;
        
        const elements = this.getTranslatableElements();
        elements.forEach(element => {
            const text = element.textContent.trim();
            if (text) {
                this.originalTexts.set(element, text);
            }
        });

        document.querySelectorAll('input').forEach(input => {
            if (input.placeholder) {
                this.originalTexts.set(input, input.placeholder);
            }
        });
    }

    getTranslatableElements() {
        const selectors = [
            'h1', 'label', 'a.forgot-link', 
            'button:not(.language-btn)', '.faq-link p'
        ].join(', ');
        
        return document.querySelectorAll(selectors);
    }

    loadLanguagePreference() {
        const savedLang = localStorage.getItem('footer-lang-preference');
        console.log('Saved lang:', savedLang);
        if (savedLang === 'rus') {
            this.currentLang = 'rus';
            this.applyTranslation('rus');
            this.updateFooterButton();
        }
    }

    saveLanguagePreference() {
        localStorage.setItem('footer-lang-preference', this.currentLang);
    }

    applyTranslation(targetLang) {
        console.log('Applying translation:', targetLang);
        const dictionary = this.dictionaries[targetLang];
        
        if (!dictionary) {
            console.error('Dictionary not found for language:', targetLang);
            return;
        }

        // Переводим основные элементы
        const elements = this.getTranslatableElements();
        elements.forEach(element => {
            const currentText = element.textContent.trim();
            const translation = dictionary[currentText];
            
            if (translation && translation !== currentText) {
                element.textContent = translation;
            }
        });

        // Переводим плейсхолдеры
        document.querySelectorAll('input').forEach(input => {
            const currentPlaceholder = input.placeholder;
            const translation = dictionary[currentPlaceholder];
            
            if (translation && translation !== currentPlaceholder) {
                input.placeholder = translation;
            }
        });

        // Особый случай для FAQ
        this.translateFAQText(targetLang);
    }

    translateFAQText(targetLang) {
        document.querySelectorAll('.faq-link p').forEach(p => {
            const fullText = p.textContent.trim();
            
            if (targetLang === 'rus') {
                if (fullText.includes('If you have any problems')) {
                    const link = p.querySelector('a.faq-text');
                    if (link) {
                        p.innerHTML = 'Если у вас возникли проблемы, вы можете перейти в ';
                        const newLink = document.createElement('a');
                        newLink.href = link.href;
                        newLink.className = 'faq-text';
                        newLink.textContent = 'раздел FAQ';
                        p.appendChild(newLink);
                    }
                }
            } else {
                if (fullText.includes('Если у вас возникли проблемы')) {
                    const link = p.querySelector('a.faq-text');
                    if (link) {
                        p.innerHTML = 'If you have any problems, you can go to the ';
                        const newLink = document.createElement('a');
                        newLink.href = link.href;
                        newLink.className = 'faq-text';
                        newLink.textContent = 'FAQ section';
                        p.appendChild(newLink);
                    }
                }
            }
        });
    }

    translateToRussian() {
        console.log('Applying Russian translation...');
        this.applyTranslation('rus');
        this.currentLang = 'rus';
        this.saveLanguagePreference();
        this.updateFooterButton();
        console.log('Russian translation completed!');
    }

    translateToEnglish() {
        console.log('Applying English translation...');
        this.applyTranslation('eng');
        this.currentLang = 'eng';
        this.saveLanguagePreference();
        this.updateFooterButton();
        console.log('English translation completed!');
    }

    toggleLanguage() {
        console.log('Toggle language clicked, current:', this.currentLang);
        if (this.currentLang === 'eng') {
            this.translateToRussian();
        } else {
            this.translateToEnglish();
        }
    }

    setupFooterButton() {
        setTimeout(() => {
            this.attachButtonHandler();
        }, 1000);
    }

    attachButtonHandler() {
        const footerButton = document.querySelector('.language-btn');
        console.log('Footer button found:', footerButton);
        
        if (footerButton) {
            const newButton = footerButton.cloneNode(true);
            footerButton.parentNode.replaceChild(newButton, footerButton);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Button clicked - working!');
                this.toggleLanguage();
            });
            
            this.updateFooterButton();
            console.log('Button handler attached successfully');
        } else {
            console.log('Footer button not found, retrying...');
            setTimeout(() => {
                this.attachButtonHandler();
            }, 500);
        }
    }

    updateFooterButton() {
        const footerButton = document.querySelector('.language-btn');
        if (footerButton) {
            footerButton.textContent = this.currentLang === 'rus' ? 'Русский' : 'English';
            console.log('Button text updated to:', footerButton.textContent);
        }
    }
}

// Упрощаем инициализацию
let translatorInstance = null;

window.addEventListener('load', () => {
    console.log('Page loaded, initializing translator...');
    translatorInstance = new SimpleTranslator();
});

// Глобальная функция для ручного вызова если нужно
window.reinitTranslator = function() {
    console.log('Manually reinitializing translator...');
    translatorInstance = new SimpleTranslator();
};