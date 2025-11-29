// Load header and footer with translation support
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading header and footer...');
    
    // Load header
    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Header not found');
            return response.text();
        })
        .then(data => {
            document.getElementById('header').innerHTML = data;
            console.log('Header loaded');
            
            // Re-initialize translation for dynamically loaded content
            if (window.dictionary && window.currentLanguage) {
                // Используем switchLanguage для повторного применения перевода
                window.switchLanguage(window.currentLanguage);
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });

    // Load footer
    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Footer not found');
            return response.text();
        })
        .then(data => {
            document.getElementById('footer').innerHTML = data;
            console.log('Footer loaded');
            
            // Re-initialize translation for dynamically loaded content
            if (window.dictionary && window.currentLanguage) {
                window.switchLanguage(window.currentLanguage);
            }
            
            // Re-attach event listener for footer language button
            const footerLanguageBtn = document.querySelector('.language-btn');
            if (footerLanguageBtn && window.toggleLanguage) {
                footerLanguageBtn.addEventListener('click', window.toggleLanguage);
                console.log('Footer language button event listener attached');
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});