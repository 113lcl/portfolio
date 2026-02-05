// Интерактивные частицы на canvas
class ParticleCanvas {
    constructor() {
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.particleCount = this.isMobile ? 40 : 100;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                baseX: 0,
                baseY: 0,
                density: Math.random() * 30 + 1
            });
        }
        
        this.particles.forEach(particle => {
            particle.baseX = particle.x;
            particle.baseY = particle.y;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Рисуем частицу
            this.ctx.fillStyle = 'rgba(139, 133, 99, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Движение частиц
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Границы экрана
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // Взаимодействие с курсором (только на десктопе)
            if (!this.isMobile && this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = this.mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                
                if (distance < maxDistance) {
                    const directionX = forceDirectionX * force * particle.density;
                    const directionY = forceDirectionY * force * particle.density;
                    particle.x -= directionX;
                    particle.y -= directionY;
                }
            }
        });
        
        // Рисуем связи между частицами (только на десктопе для лучшей производительности)
        if (!this.isMobile) {
            this.connectParticles();
        }
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = 1 - (distance / 120);
                    this.ctx.strokeStyle = `rgba(139, 133, 99, ${opacity * 0.2})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        // Обработчик изменения ориентации для мобильных устройств
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resize();
                this.createParticles();
            }, 100);
        });

        // Только десктоп может взаимодействовать с курсором
        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });

            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    }
}

// Модальное окно контактов
class ContactModal {
    constructor() {
        this.modal = document.getElementById('contactModal');
        this.navContactBtn = document.getElementById('navContactBtn');
        this.floatingBtn = document.getElementById('floatingContactBtn');
        this.closeBtn = document.getElementById('closeModal');
        this.overlay = this.modal.querySelector('.modal-overlay');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.navContactBtn) {
            this.navContactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }
        if (this.floatingBtn) {
            this.floatingBtn.addEventListener('click', () => this.open());
        }
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Модальное окно прайса
class PriceModal {
    constructor() {
        this.modal = document.getElementById('priceModal');
        this.title = document.getElementById('priceTitle');
        this.list = document.getElementById('priceList');
        this.closeBtn = document.getElementById('closePriceModal');
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.portfolio = document.querySelector('.portfolio-content');

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.portfolio) {
            this.portfolio.addEventListener('click', (e) => {
                const card = e.target.closest('.variant');
                if (!card || card.getAttribute('data-price') !== 'true') return;
                this.open(card);
            });
        }

        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(card) {
        const title = card.getAttribute('data-title') || 'Package';
        const includes = (card.getAttribute('data-includes') || '').split('|').filter(Boolean);

        this.title.textContent = title;
        this.list.innerHTML = includes.map(item => `<li>${item}</li>`).join('');

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Плавная прокрутка и появление элементов
class ScrollAnimation {
    constructor() {
        this.observeElements();
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Анимация для элементов портфолио
        document.querySelectorAll('.variant').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// Навигация
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navContactBtn = document.getElementById('navContactBtn');
        this.sections = document.querySelectorAll('section[id]');
        this.touchStartY = 0;
        this.touchEndY = 0;
        
        this.setupScrollBehavior();
        this.setupActiveLinks();
        this.setupNavContact();
        this.setupTouchSwipe();
        this.setupWheelNavigation();
    }

    setupScrollBehavior() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Показываем навигацию при прокрутке вниз
            if (currentScroll > 300) {
                this.navbar.classList.add('visible');
            } else {
                this.navbar.classList.remove('visible');
            }
            
            lastScroll = currentScroll;
        });

        // Плавная прокрутка к секциям
        this.navLinks.forEach(link => {
            if (link.id !== 'navContactBtn') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    }

    setupActiveLinks() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -60% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        this.sections.forEach(section => observer.observe(section));
    }

    setupNavContact() {
        // Contact button is now handled by ContactModal
    }

    setupTouchSwipe() {
        // Поддержка свайпов для мобильных устройств
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const difference = this.touchStartY - this.touchEndY;

        if (Math.abs(difference) < swipeThreshold) return;

        const currentSection = this.getCurrentSection();
        if (!currentSection) return;

        const sections = Array.from(this.sections);
        const currentIndex = sections.indexOf(currentSection);

        // Свайп вверх - следующая секция
        if (difference > 0 && currentIndex < sections.length - 1) {
            this.scrollToSection(sections[currentIndex + 1]);
        }
        // Свайп вниз - предыдущая секция
        else if (difference < 0 && currentIndex > 0) {
            this.scrollToSection(sections[currentIndex - 1]);
        }
    }

    getCurrentSection() {
        const scrollPosition = window.pageYOffset + window.innerHeight / 2;
        
        for (const section of this.sections) {
            const offsetTop = section.offsetTop;
            const offsetBottom = offsetTop + section.offsetHeight;
            
            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                return section;
            }
        }
        return this.sections[0];
    }

    scrollToSection(section) {
        const offsetTop = section.offsetTop;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    setupWheelNavigation() {
        let isSnapping = false;

        window.addEventListener('wheel', (e) => {
            if (isSnapping) {
                e.preventDefault();
                return;
            }

            if (Math.abs(e.deltaY) < 10) return;

            const currentSection = this.getCurrentSection();
            if (!currentSection) return;

            const sections = Array.from(this.sections);
            const currentIndex = sections.indexOf(currentSection);
            const nextIndex = e.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;

            if (nextIndex < 0 || nextIndex >= sections.length) return;

            e.preventDefault();
            isSnapping = true;
            this.scrollToSection(sections[nextIndex]);

            setTimeout(() => {
                isSnapping = false;
            }, 700);
        }, { passive: false });
    }

}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new ParticleCanvas();
    new ContactModal();
    new ScrollAnimation();
    new Navigation();
    new PriceModal();
    initCustomCursor();
    initVariantImages();
    
    // Handle "My Offers" button click
    const myOffersBtn = document.getElementById('myOffersBtn');
    if (myOffersBtn) {
        myOffersBtn.addEventListener('click', () => {
            const portfolioSection = document.getElementById('portfolio');
            if (portfolioSection) {
                portfolioSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Установка фоновых изображений для карточек с примерами работ
function initVariantImages() {
    const variantsWithImages = document.querySelectorAll('.variant[data-image]');
    
    variantsWithImages.forEach(variant => {
        const imagePath = variant.getAttribute('data-image');
        const preview = variant.querySelector('.variant-preview');
        
        if (imagePath && preview) {
            // Устанавливаем фон для ::before псевдоэлемента через inline style
            variant.style.setProperty('--bg-image', `url(${imagePath})`);
            
            // Устанавливаем размытый фон для preview::before
            preview.style.setProperty('--bg-image', `url(${imagePath})`);
        }
    });
}

function initCustomCursor() {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    const canUse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canUse) return;

    let ringX = 0;
    let ringY = 0;
    let targetX = 0;
    let targetY = 0;

    const show = () => {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    };

    const hide = () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    };

    const animate = () => {
        ringX += (targetX - ringX) * 0.15;
        ringY += (targetY - ringY) * 0.15;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        show();
    });

    window.addEventListener('mouseout', hide);
    window.addEventListener('blur', hide);

    const isClickable = (el) => {
        if (!el) return false;
        return !!el.closest('a, button, .variant, .contact-item, .nav-link');
    };

    window.addEventListener('mouseover', (e) => {
        if (isClickable(e.target)) {
            dot.classList.add('is-hover');
            ring.classList.add('is-hover');
        }
    });

    window.addEventListener('mouseout', (e) => {
        if (isClickable(e.target)) {
            dot.classList.remove('is-hover');
            ring.classList.remove('is-hover');
        }
    });

    animate();
}
