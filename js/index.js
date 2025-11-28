document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-slides');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    let currentSlide = 0;
    const totalSlides = 3;
    let autoSlide;
    
    function updateCarousel() {
        // move carousel
        carousel.style.transform = `translateX(-${currentSlide * 100/totalSlides}%)`;
        
        // update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    // If prev-button clicked
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // If next-button clicked
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Handlers for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
    
    // Auto switch
    function startAutoSlide() {
        autoSlide = setInterval(nextSlide, 15000);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlide);
    }
    
    startAutoSlide();
    
    // Stop auto-switching on hover
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});