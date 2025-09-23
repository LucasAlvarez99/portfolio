// ===============================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ===============================

// Configuración del typing animation
const typingConfig = {
    phrases: [
        "Creando experiencias web únicas",
        "Desarrollando soluciones innovadoras", 
        "Transformando ideas en código",
        "Construyendo el futuro digital"
    ],
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseAfterComplete: 2000,
    pauseBeforeNext: 500
};

// Variables globales
let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = typingConfig.typingSpeed;

// ===============================
// LOADER INICIAL
// ===============================
function initLoader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            loader.classList.add('hidden');
        }, 1500);
    });
}

// ===============================
// TOGGLE TEMA OSCURO/CLARO
// ===============================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Cargar tema guardado o usar modo claro por defecto
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
}

// ===============================
// ANIMACIÓN TYPING EN HERO
// ===============================
function typeAnimation() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;

    const currentPhrase = typingConfig.phrases[currentPhraseIndex];
    
    if (isDeleting) {
        // Modo borrar
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex - 1) + '|';
        currentCharIndex--;
        typingSpeed = typingConfig.deletingSpeed;
    } else {
        // Modo escribir
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex + 1) + '|';
        currentCharIndex++;
        typingSpeed = typingConfig.typingSpeed;
    }

    // Verificar si completó la frase
    if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = typingConfig.pauseAfterComplete;
    } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % typingConfig.phrases.length;
        typingSpeed = typingConfig.pauseBeforeNext;
    }

    setTimeout(typeAnimation, typingSpeed);
}

function initTypingAnimation() {
    // Iniciar animación después de que se cargue la página
    setTimeout(typeAnimation, 2000);
}

// ===============================
// ANIMACIONES AL SCROLL
// ===============================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animación especial para barras de habilidades
                if (entry.target.classList.contains('skill-card')) {
                    animateSkillBar(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clases de animación
    document.querySelectorAll('.fade-in, .slide-up, .zoom-in').forEach(el => {
        observer.observe(el);
    });
}

// Animar barras de habilidades
function animateSkillBar(skillCard) {
    const levelBar = skillCard.querySelector('.level-bar');
    if (levelBar) {
        const level = levelBar.getAttribute('data-level');
        setTimeout(() => {
            levelBar.style.setProperty('--level-width', level + '%');
            levelBar.style.width = level + '%';
        }, 200);
    }
}

// ===============================
// NAVEGACIÓN SUAVE
// ===============================
function initSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===============================
// FORMULARIO DE CONTACTO
// ===============================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        const formData = new FormData(contactForm);
        
        // Validar formulario
        if (!validateForm(formData)) {
            return;
        }

        // Mostrar estado de carga
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;

        try {
            // Simular envío del formulario (aquí puedes integrar tu API)
            await simulateFormSubmission(formData);
            
            // Mostrar mensaje de éxito
            showNotification('¡Mensaje enviado correctamente! Te contactaré pronto.', 'success');
            contactForm.reset();
            
        } catch (error) {
            showNotification('Error al enviar el mensaje. Por favor, intenta de nuevo.', 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Validar formulario
function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    if (!name || name.trim().length < 2) {
        showNotification('Por favor, ingresa un nombre válido.', 'error');
        return false;
    }

    if (!email || !isValidEmail(email)) {
        showNotification('Por favor, ingresa un email válido.', 'error');
        return false;
    }

    if (!subject || subject.trim().length < 3) {
        showNotification('Por favor, ingresa un asunto válido.', 'error');
        return false;
    }

    if (!message || message.trim().length < 10) {
        showNotification('Por favor, ingresa un mensaje de al menos 10 caracteres.', 'error');
        return false;
    }

    return true;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Simular envío del formulario
function simulateFormSubmission(formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Formulario enviado:', Object.fromEntries(formData));
            resolve();
        }, 2000);
    });
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Agregar estilos dinámicamente
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===============================
// HEADER SCROLL EFFECT
// ===============================
function initHeaderScrollEffect() {
    let lastScrollY = window.scrollY;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.background = document.body.getAttribute('data-theme') === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = document.body.getAttribute('data-theme') === 'dark' 
                ? 'rgba(15, 23, 42, 0.8)' 
                : 'rgba(255, 255, 255, 0.1)';
            header.style.backdropFilter = 'blur(10px)';
        }

        lastScrollY = currentScrollY;
    });
}

// ===============================
// EFECTOS DE PARTÍCULAS
// ===============================
function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--accent-primary);
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.3;
        z-index: -1;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight}px;
    `;
    
    document.body.appendChild(particle);
    
    const duration = Math.random() * 3000 + 2000;
    const animation = particle.animate([
        { 
            transform: 'translateY(0px)', 
            opacity: 0.3 
        },
        { 
            transform: `translateY(-${window.innerHeight + 100}px)`, 
            opacity: 0 
        }
    ], {
        duration: duration,
        easing: 'linear'
    });

    animation.onfinish = () => {
        particle.remove();
    };
}

function initParticleEffect() {
    // Crear partículas ocasionalmente
    setInterval(createParticle, 2000);
}

// ===============================
// EFECTOS ADICIONALES
// ===============================
function initAdditionalEffects() {
    // Efecto parallax suave para el hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Efecto hover en las cards de proyecto
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) rotateY(5deg)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateY(0)';
        });
    });

    // Efecto de click en botones
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            let ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Agregar animación de ripple al CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===============================
// UTILIDADES
// ===============================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===============================
// INICIALIZACIÓN
// ===============================
function init() {
    // Inicializar todos los módulos
    initLoader();
    initThemeToggle();
    initTypingAnimation();
    initScrollAnimations();
    initSmoothNavigation();
    initContactForm();
    initHeaderScrollEffect();
    initParticleEffect();
    initAdditionalEffects();

    console.log('🚀 Portfolio de Lucas Alvarez cargado correctamente!');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===============================
// EXPORTAR FUNCIONES (OPCIONAL)
// ===============================
// Si necesitas acceder a estas funciones desde el exterior
window.portfolioApp = {
    showNotification,
    createParticle,
    typeAnimation
};