class ModernArtStudio {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.startAnimations();
    }

    initializeComponents() {
        this.mobileMenu = new MobileMenuHandler();
        this.gallery = new GalleryCarousel();
        this.contactForm = new ContactFormHandler();
        this.mapIntegration = new YandexMapIntegration();
        this.scrollAnimations = new ScrollAnimationHandler();
    }

    setupEventListeners() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.smoothScroll.bind(this));
        });

        document.querySelectorAll('.btn-program').forEach(btn => {
            btn.addEventListener('click', this.handleProgramClick.bind(this));
        });

        this.setupLazyLoading();
    }

    smoothScroll(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    handleProgramClick(e) {
        e.preventDefault();
        const programCard = e.target.closest('.program-card');
        const programTitle = programCard.querySelector('h3').textContent;

        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            const selectElement = document.querySelector('select[name="program"]');
            if (selectElement) {
                let value = '';
                if (programTitle.includes('малыш')) value = 'kids';
                else if (programTitle.includes('масл')) value = 'oil';
                else if (programTitle.includes('Рисунок')) value = 'academic';
                else if (programTitle.includes('поступлен')) value = 'exam';

                selectElement.value = value;
                selectElement.focus();
            }
        }, 500);
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    startAnimations() {
        this.animateCounters();
        this.setupParallax();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = element.textContent.replace(/\d+/, target);
                clearInterval(timer);
            } else {
                element.textContent = element.textContent.replace(/\d+/, Math.floor(current));
            }
        }, 16);
    }

    setupParallax() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero-gradient');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
}

class MobileMenuHandler {
    constructor() {
        this.burger = document.getElementById('burger');
        this.nav = document.querySelector('.nav ul');
        this.isOpen = false;

        if (this.burger && this.nav) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.burger.addEventListener('click', () => this.toggleMenu());

        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.burger.contains(e.target) && !this.nav.contains(e.target)) {
                this.closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.burger.classList.add('active');
        this.nav.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.burger.classList.remove('active');
        this.nav.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

class GalleryCarousel {
    constructor() {
        this.carousel = document.querySelector('.gallery-carousel');
        if (!this.carousel) return;

        this.track = this.carousel.querySelector('.carousel-track');
        this.items = this.carousel.querySelectorAll('.gallery-item');
        this.prevBtn = this.carousel.querySelector('.carousel-btn-prev');
        this.nextBtn = this.carousel.querySelector('.carousel-btn-next');
        this.indicators = this.carousel.querySelectorAll('.indicator');

        this.currentSlide = 0;
        this.totalSlides = this.items.length;
        this.isPlaying = true;

        if (this.totalSlides > 0) {
            this.init();
        }
    }

    init() {
        this.updateCarousel();
        this.setupEventListeners();
        this.startAutoplay();
    }

    setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.carousel.addEventListener('mouseleave', () => this.resumeAutoplay());

        this.setupTouchEvents();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    }

    setupTouchEvents() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.pauseAutoplay();
        });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const deltaX = startX - currentX;

            const offset = -this.currentSlide * 100 - (deltaX / this.track.offsetWidth) * 100;
            this.track.style.transform = `translateX(${offset}%)`;
        });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const deltaX = startX - currentX;
            const threshold = 50;

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            } else {
                this.updateCarousel();
            }

            this.resumeAutoplay();
        });
    }

    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }

    updateCarousel() {
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        this.preloadAdjacentImages();
    }

    preloadAdjacentImages() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;

        [prevIndex, this.currentSlide, nextIndex].forEach(index => {
            const img = this.items[index]?.querySelector('img');
            if (img && !img.complete) {
                const tempImg = new Image();
                tempImg.src = img.src;
            }
        });
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, 5000);
    }

    pauseAutoplay() {
        this.isPlaying = false;
    }

    resumeAutoplay() {
        this.isPlaying = true;
    }

    destroy() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (!this.form) return;

        this.setupEventListeners();
        this.setupValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => this.validateField(field));
            field.addEventListener('blur', () => this.validateField(field));
        });

        const phoneField = this.form.querySelector('input[name="phone"]');
        if (phoneField) {
            this.setupPhoneMask(phoneField);
        }
    }

    setupPhoneMask(phoneField) {
        phoneField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('8')) value = '7' + value.substring(1);
            if (value.startsWith('7')) {
                const match = value.match(/^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
                if (match) {
                    const formatted = `+7${match[1] ? ` (${match[1]}` : ''}${match[2] ? `) ${match[2]}` : ''}${match[3] ? `-${match[3]}` : ''}${match[4] ? `-${match[4]}` : ''}`;
                    e.target.value = formatted;
                }
            }
        });
    }

    setupValidation() {
        this.validationRules = {
            name: { required: true, minLength: 2, pattern: /^[а-яёА-ЯЁa-zA-Z\s-]+$/ },
            parent_name: { required: true, minLength: 2, pattern: /^[а-яёА-ЯЁa-zA-Z\s-]+$/ },
            age: { required: true, min: 5, max: 18 },
            phone: { required: true, pattern: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/ },
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            program: { required: true },
            privacy: { required: true }
        };
    }

    validateField(field) {
        const rules = this.validationRules[field.name];
        if (!rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }
        if (isValid && value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = this.getPatternErrorMessage(field.name);
        }
        if (isValid && value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Минимум ${rules.minLength} символов`;
        }
        if (isValid && value && rules.min && parseInt(value) < rules.min) {
            isValid = false;
            errorMessage = `Минимальное значение: ${rules.min}`;
        }
        if (isValid && value && rules.max && parseInt(value) > rules.max) {
            isValid = false;
            errorMessage = `Максимальное значение: ${rules.max}`;
        }
        if (field.type === 'checkbox' && rules.required && !field.checked) {
            isValid = false;
            errorMessage = 'Необходимо согласие с политикой конфиденциальности';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.showFieldSuccess(field);
        }
        return isValid;
    }

    getPatternErrorMessage(fieldName) {
        const messages = {
            name: 'Используйте только буквы, пробелы и дефисы',
            parent_name: 'Используйте только буквы, пробелы и дефисы',
            phone: 'Введите телефон в формате +7 (xxx) xxx-xx-xx',
            email: 'Введите корректный email адрес'
        };
        return messages[fieldName] || 'Неверный формат данных';
    }

    showFieldError(field, message) {
        field.style.borderColor = 'var(--error)';
        field.style.background = 'rgba(239, 68, 68, 0.05)';

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error);
            font-size: 0.875rem;
            margin-top: 0.5rem;
            animation: slideDown 0.3s ease;
        `;
        field.parentNode.appendChild(errorElement);
    }

    showFieldSuccess(field) {
        field.style.borderColor = 'var(--success)';
        field.style.background = 'rgba(34, 197, 94, 0.05)';
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.background = '';

        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const allFields = this.form.querySelectorAll('input[name], select[name], textarea[name]');
        let isFormValid = true;

        allFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showFormError('Пожалуйста, исправьте ошибки в форме');
            return;
        }

        this.submitForm();
    }

    async submitForm() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
        submitButton.disabled = true;
        this.form.classList.add('form-loading');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showFormSuccess('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
            this.form.reset();
        } catch (error) {
            this.showFormError('Произошла ошибка при отправке. Попробуйте позже или позвоните нам.');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            this.form.classList.remove('form-loading');
        }
    }

    showFormSuccess(message) {
        const app = window.artStudio || { showNotification: (msg, type) => alert(msg) };
        app.showNotification(message, 'success');
    }

    showFormError(message) {
        const app = window.artStudio || { showNotification: (msg, type) => alert(msg) };
        app.showNotification(message, 'error');
    }
}

class YandexMapIntegration {
    constructor() {
        this.mapContainer = document.getElementById('yandex-map');
        this.fallback = document.querySelector('.map-fallback');
        this.loadButton = document.getElementById('load-map-btn');
        this.coordinates = [55.688209, 37.296337];
        this.loaded = false;

        if (this.mapContainer) {
            this.setupEventListeners();
            setTimeout(() => this.loadYandexMaps(), 2000);
        }
    }

    setupEventListeners() {
        this.loadButton?.addEventListener('click', () => this.loadYandexMaps());
    }

    async loadYandexMaps() {
        if (this.loaded) return;
        this.loaded = true;

        try {
            if (this.fallback) {
                this.fallback.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Карта загружается...</p>';
            }

            if (!window.ymaps) {
                await this.loadYandexMapsAPI();
            }

            ymaps.ready(() => {
                const map = new ymaps.Map(this.mapContainer, {
                    center: this.coordinates,
                    zoom: 16,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                const placemark = new ymaps.Placemark(this.coordinates, {
                    balloonContentHeader: 'ИЗОСТУДИЯ',
                    balloonContentBody: 'Творческое развитие детей<br>г. Одинцово, ул. Говорова 28',
                    balloonContentFooter: 'Телефон: +7 (916) 445-51-31',
                    hintContent: 'ИЗОСТУДИЯ - Одинцово'
                }, {
                    iconLayout: 'default#image',
                    iconImageHref: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="20" fill="#AD7A5C"/>
                            <path d="M12 16L20 24L28 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `),
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -40]
                });

                map.geoObjects.add(placemark);

                if (this.fallback) {
                    this.fallback.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Ошибка загрузки карты:', error);
            if (this.fallback) {
                this.fallback.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Не удалось загрузить карту</p>
                    <button class="btn-map" onclick="window.open('https://yandex.ru/maps/?text=Одинцово ул. Говорова 28', '_blank')">
                        Открыть в Яндекс.Картах
                    </button>
                `;
            }
        }
    }

    loadYandexMapsAPI() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=ваш-api-ключ';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

class ScrollAnimationHandler {
    constructor() {
        this.setupIntersectionObserver();
        this.setupScrollEffects();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    if (entry.target.classList.contains('program-card')) {
                        this.animateProgramCard(entry.target);
                    }
                    if (entry.target.classList.contains('feature-card')) {
                        this.animateFeatureCard(entry.target);
                    }
                }
            });
        }, options);

        const elementsToAnimate = document.querySelectorAll(
            '.program-card, .feature-card, .contact-card, .contact-form, .about-content, .hero-stats'
        );

        elementsToAnimate.forEach(el => {
            el.classList.add('fade-in');
            this.observer.observe(el);
        });
    }

    animateProgramCard(card) {
        const delay = Array.from(card.parentNode.children).indexOf(card) * 100;
        setTimeout(() => {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }, delay);
    }

    animateFeatureCard(card) {
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }, 200);
            }, 300);
        }
    }

    setupScrollEffects() {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
    }

    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');

        if (header) {
            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        const hero = document.querySelector('.hero');
        if (hero && scrolled < hero.offsetHeight) {
            const parallaxElements = hero.querySelectorAll('.hero-content, .hero-stats');
            parallaxElements.forEach(el => {
                el.style.transform = `translateY(${scrolled * 0.3}px)`;
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.artStudio = new ModernArtStudio();

    const animationStyles = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .header.scrolled {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-loading {
            position: relative;
            pointer-events: none;
        }

        .form-loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            border-radius: var(--border-radius-lg);
            z-index: 10;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .notification-content i {
            font-size: 1.125rem;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
});
