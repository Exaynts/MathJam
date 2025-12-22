// Load header and footer with translation support
document.addEventListener('DOMContentLoaded', function() {
    // Check iframe
    const isInIframe = window.self !== window.top;
    const urlParams = new URLSearchParams(window.location.search);
    const noHeader = urlParams.has('noheader');
    const noFooter = urlParams.has('nofooter');
    
    // If the page is in an iframe OR there are noheader/nofooter parameters, do not load the header/footer
    if (isInIframe || noHeader || noFooter) {
        console.log('Page is in iframe or has noheader/nofooter parameters. Skipping header/footer loading.');
        const headerContainer = document.getElementById('header');
        const footerContainer = document.getElementById('footer');       
        if (headerContainer) headerContainer.style.display = 'none';
        if (footerContainer) footerContainer.style.display = 'none';
        
        // Add in-iflame styles
        document.body.classList.add('in-iframe');        
        return;
    }
    
    console.log('Loading header and footer...');
    
    // Load header (if not in iframe)
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
                window.switchLanguage(window.currentLanguage);
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });

    // Load footer (if not in iframe)
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

function hideHeaderFooter() {
    console.log('Page is in iframe or has noheader/nofooter parameters. Skipping header/footer loading.');
   
    document.documentElement.style.setProperty('--header-height', '0px', 'important');
    const headerContainer = document.getElementById('header');
    const footerContainer = document.getElementById('footer');       
    
    if (headerContainer) {
        headerContainer.style.display = 'none';
        headerContainer.style.height = '0';
    }
    
    if (footerContainer) {
        footerContainer.style.display = 'none';
        footerContainer.style.height = '0';
    }
    
    // Добавляем стили через JS для приоритета
    document.documentElement.style.setProperty('--header-height', '0px', 'important');
    
    // Корректируем main
    const mainElement = document.querySelector('.main');
    if (mainElement) {
        mainElement.style.marginTop = '0';
        mainElement.style.paddingTop = '0';
    }
    
    document.body.classList.add('in-iframe');        
    return;
}