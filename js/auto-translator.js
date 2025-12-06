class AutoTranslator {
    constructor() {
        this.currentLang = localStorage.getItem('autoTranslateLang') || 'ru';
        this.translationCache = new Map();
        this.isTranslating = false;
        this.translationApi = 'yandex'; // 'yandex', 'google', 'libretranslate'
        this.apiKey = ''; // Добавьте ваш API ключ здесь
        this.textQueue = [];
        this.batchSize = 5;
        
        this.init();
    }
    
    async init() {
        // Восстанавливаем язык из localStorage
        if (this.currentLang !== 'ru') {
            await this.translatePage(this.currentLang);
        }
        
        // Обработчик для кнопки перевода в футере
        this.setupFooterButton();
        
        // Также обрабатываем кнопку в хедере, если она есть
        this.setupLanguageToggle();
    }
    
    setupFooterButton() {
        // Используем делегирование событий, так как футер загружается динамически
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('language-btn')) {
                const newLang = this.currentLang === 'ru' ? 'en' : 'ru';
                await this.translatePage(newLang);
                this.updateButtonText(newLang);
            }
        });
    }
    
    setupLanguageToggle() {
        // Для кнопки переключения языка в хедере
        if (window.toggleLanguage) {
            const originalToggle = window.toggleLanguage;
            window.toggleLanguage = async () => {
                const newLang = this.currentLang === 'ru' ? 'en' : 'ru';
                await this.translatePage(newLang);
                this.updateButtonText(newLang);
            };
        }
    }
    
    updateButtonText(lang) {
        // Обновляем текст на всех кнопках перевода
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.textContent = lang === 'en' ? 'Русский' : 'English';
        });
    }
    
    async translatePage(targetLang) {
        if (this.isTranslating || this.currentLang === targetLang) return;
        
        console.log(`Translating page from ${this.currentLang} to ${targetLang}`);
        this.isTranslating = true;
        
        try {
            // 1. Переводим title
            await this.translateTitle(targetLang);
            
            // 2. Переводим текстовые элементы
            await this.translateElements(targetLang);
            
            // 3. Переводим placeholder
            await this.translatePlaceholders(targetLang);
            
            // 4. Обновляем язык документа
            document.documentElement.lang = targetLang;
            
            // 5. Сохраняем настройки
            this.currentLang = targetLang;
            localStorage.setItem('autoTranslateLang', targetLang);
            
            console.log('Translation completed');
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            this.isTranslating = false;
        }
    }
    
    async translateTitle(targetLang) {
        const titleElement = document.querySelector('title[data-translate]');
        if (titleElement) {
            const original = titleElement.getAttribute('data-translate-original') || titleElement.textContent;
            const translated = await this.translateText(original, 'ru', targetLang);
            titleElement.textContent = translated;
            titleElement.setAttribute('data-translate-original', original);
        }
    }
    
    async translateElements(targetLang) {
        const elements = document.querySelectorAll('[data-translate]:not([data-translate-placeholder])');
        const textElements = [];
        
        // Собираем все элементы для перевода
        elements.forEach(element => {
            if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                // Простой текстовый элемент
                const original = element.getAttribute('data-translate-original') || element.textContent;
                textElements.push({ element, original, isSimple: true });
            } else {
                // Элемент с HTML
                this.translateComplexElement(element, targetLang);
            }
        });
        
        // Переводим простые элементы батчами
        for (let i = 0; i < textElements.length; i += this.batchSize) {
            const batch = textElements.slice(i, i + this.batchSize);
            await Promise.all(batch.map(async ({ element, original, isSimple }) => {
                try {
                    const translated = await this.translateText(original, 'ru', targetLang);
                    if (isSimple) {
                        element.textContent = translated;
                    }
                    element.setAttribute('data-translate-original', original);
                } catch (error) {
                    console.warn('Failed to translate:', original);
                }
            }));
            
            // Пауза между батчами для избежания лимитов API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    async translateComplexElement(element, targetLang) {
        // Для элементов с HTML контентом (как в FAQ ответах)
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        const textNodes = [];
        
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (text && text.length > 1 && !/^\s*$/.test(text)) {
                textNodes.push({ node, original: text });
            }
        }
        
        // Переводим текстовые узлы
        for (const { node, original } of textNodes) {
            try {
                const translated = await this.translateText(original, 'ru', targetLang);
                node.textContent = translated;
            } catch (error) {
                console.warn('Failed to translate complex element:', original);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    async translatePlaceholders(targetLang) {
        const elements = document.querySelectorAll('[data-translate-placeholder]');
        
        for (const element of elements) {
            const original = element.getAttribute('data-translate-original') || element.placeholder;
            try {
                const translated = await this.translateText(original, 'ru', targetLang);
                element.placeholder = translated;
                element.setAttribute('data-translate-original', original);
            } catch (error) {
                console.warn('Failed to translate placeholder:', original);
            }
        }
    }
    
    async translateText(text, sourceLang, targetLang) {
        // Проверяем кэш
        const cacheKey = `${text}_${sourceLang}_${targetLang}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }
        
        // Игнорируем короткие тексты и специальные символы
        if (text.length < 2 || /^[\d\s\W]+$/.test(text)) {
            return text;
        }
        
        let translatedText = text;
        
        try {
            switch (this.translationApi) {
                case 'yandex':
                    translatedText = await this.yandexTranslate(text, sourceLang, targetLang);
                    break;
                case 'google':
                    translatedText = await this.googleTranslate(text, sourceLang, targetLang);
                    break;
                case 'libretranslate':
                    translatedText = await this.libretranslate(text, sourceLang, targetLang);
                    break;
                default:
                    // Простой fallback - возвращаем оригинал
                    translatedText = text;
            }
            
            // Сохраняем в кэш
            this.translationCache.set(cacheKey, translatedText);
            
            // Сохраняем в localStorage для будущих посещений
            this.saveToLocalStorage(cacheKey, translatedText);
            
            return translatedText;
        } catch (error) {
            console.warn(`Translation API error (${this.translationApi}):`, error);
            return text; // Возвращаем оригинал в случае ошибки
        }
    }
    
    async yandexTranslate(text, sourceLang, targetLang) {
        // Замените на ваш реальный API ключ Yandex Translate
        // Получить можно здесь: https://translate.yandex.ru/developers/keys
        const API_KEY = this.apiKey || 'trnsl.1.1.20240101T000000Z.1234567890abcdef.1234567890abcdef';
        
        const response = await fetch('https://translate.yandex.net/api/v1.5/tr.json/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                key: API_KEY,
                text: text,
                lang: `${sourceLang}-${targetLang}`,
                format: 'plain'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Yandex API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.text[0];
    }
    
    async googleTranslate(text, sourceLang, targetLang) {
        // Используем неофициальный Google Translate API
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Google API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data[0][0][0];
    }
    
    async libretranslate(text, sourceLang, targetLang) {
        // Используем публичный LibreTranslate сервер
        const response = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error(`LibreTranslate error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.translatedText;
    }
    
    saveToLocalStorage(key, value) {
        try {
            const cache = JSON.parse(localStorage.getItem('translationCache') || '{}');
            cache[key] = value;
            localStorage.setItem('translationCache', JSON.stringify(cache));
        } catch (error) {
            console.warn('Failed to save translation cache:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const cache = JSON.parse(localStorage.getItem('translationCache') || '{}');
            Object.entries(cache).forEach(([key, value]) => {
                this.translationCache.set(key, value);
            });
        } catch (error) {
            console.warn('Failed to load translation cache:', error);
        }
    }
}

// Инициализация переводчика при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.autoTranslator = new AutoTranslator();
});