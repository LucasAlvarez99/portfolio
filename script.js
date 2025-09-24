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
let projects = [];

// ===============================
// GESTIÓN DE PROYECTOS
// ===============================
function loadProjects() {
    const savedProjects = localStorage.getItem('portfolioProjects');
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    } else {
        // Proyectos por defecto
        projects = [
            {
                id: 1,
                title: "E-Commerce App",
                description: "Aplicación de comercio electrónico completa con carrito de compras, sistema de pagos y panel de administración.",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
                link: "https://ecommerce-demo.vercel.app",
                github: "https://github.com/lucasalvarez/ecommerce-app",
                technologies: ["React", "Node.js", "MongoDB", "Stripe"]
            },
            {
                id: 2,
                title: "Task Manager",
                description: "Gestor de tareas colaborativo con funciones de equipo, calendario integrado y notificaciones en tiempo real.",
                image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop",
                link: "https://taskmanager-demo.vercel.app",
                github: "https://github.com/lucasalvarez/task-manager",
                technologies: ["Vue.js", "Firebase", "Tailwind"]
            },
            {
                id: 3,
                title: "Dashboard Analytics",
                description: "Dashboard interactivo para análisis de datos con gráficos dinámicos y reportes automatizados.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
                link: "https://dashboard-demo.vercel.app",
                github: "https://github.com/lucasalvarez/dashboard-analytics",
                technologies: ["React", "D3.js", "Express", "PostgreSQL"]
            }
        ];
    }
    renderProjects();
    updateProjectCount();
}

function renderProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;

    container.innerHTML = projects.map(project => `
        <div class="project-card zoom-in" onclick="openProjectModal(${project.id})">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title} Preview" />
                <div class="project-overlay">
                    <div class="overlay-content">
                        <h4>Vista Previa</h4>
                        <p>Haz clic para ver más detalles</p>
                    </div>
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-buttons">
                    <a href="${project.link}" class="btn btn-primary" target="_blank" onclick="event.stopPropagation()">
                        <i class="fas fa-eye"></i> Ver Proyecto
                    </a>
                    <a href="${project.github}" class="btn btn-secondary" target="_blank" onclick="event.stopPropagation()">
                        <i class="fab fa-github"></i> Ver Código
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function updateProjectCount() {
    const countElement = document.getElementById('projectCount');
    if (countElement) {
        countElement.textContent = projects.length;
    }
}

// ===============================
// MODAL DE PROYECTOS (ESTILO VERCEL)
// ===============================
function openProjectModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalProjectTitle = document.getElementById('modalProjectTitle');
    const modalProjectDescription = document.getElementById('modalProjectDescription');
    const modalProjectTech = document.getElementById('modalProjectTech');
    const modalProjectLink = document.getElementById('modalProjectLink');
    const modalGithubLink = document.getElementById('modalGithubLink');
    const previewFrame = document.getElementById('previewFrame');
    const previewLoading = document.getElementById('previewLoading');
    const previewUrl = document.getElementById('previewUrl');

    // Verificar que todos los elementos existen
    if (!modal || !modalTitle || !modalProjectTitle || !modalProjectDescription || 
        !modalProjectTech || !modalProjectLink || !modalGithubLink || 
        !previewFrame || !previewLoading || !previewUrl) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    // Llenar modal con datos del proyecto
    modalTitle.textContent = `${project.title} - Vista Previa`;
    modalProjectTitle.textContent = project.title;
    modalProjectDescription.textContent = project.description;
    modalProjectTech.innerHTML = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    modalProjectLink.href = project.link;
    modalGithubLink.href = project.github;
    
    // Configurar URL preview
    try {
        const domain = new URL(project.link).hostname;
        const urlSpan = previewUrl.querySelector('span');
        if (urlSpan) {
            urlSpan.textContent = domain;
        }
    } catch (e) {
        console.error('Error al parsear URL:', e);
        const urlSpan = previewUrl.querySelector('span');
        if (urlSpan) {
            urlSpan.textContent = 'preview.demo.com';
        }
    }

    // Mostrar loading
    previewLoading.style.display = 'flex';
    previewFrame.style.display = 'none';

    // Cargar iframe
    previewFrame.src = project.link;
    previewFrame.onload = () => {
        setTimeout(() => {
            previewLoading.style.display = 'none';
            previewFrame.style.display = 'block';
        }, 1000);
    };

    // Manejar error de carga del iframe
    previewFrame.onerror = () => {
        previewLoading.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>No se pudo cargar la vista previa</p>
            <small>Haz clic en "Ver Sitio Web" para abrir el proyecto</small>
        `;
    };

    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    const previewFrame = document.getElementById('previewFrame');
    
    if (!modal || !previewFrame) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Limpiar iframe
    setTimeout(() => {
        previewFrame.src = '';
    }, 300);
}

function openFullPreview() {
    const modalProjectLink = document.getElementById('modalProjectLink');
    if (modalProjectLink && modalProjectLink.href) {
        window.open(modalProjectLink.href, '_blank');
    }
}

// ===============================
// LOADER INICIAL
// ===============================
function initLoader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
            }
        }, 1500);
    });
}

// ===============================
// TOGGLE TEMA OSCURO/CLARO
// ===============================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (!themeToggle) return;

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
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
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
// FORMULARIO DE CONTACTO CON EMAILJS
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
            // Enviar email usando EmailJS
            await sendEmail(formData);
            
            // Mostrar mensaje de éxito
            showNotification('¡Mensaje enviado correctamente! Te contactaré pronto.', 'success');
            contactForm.reset();
            
        } catch (error) {
            console.error('Error al enviar email:', error);
            showNotification('Error al enviar el mensaje. Por favor, intenta de nuevo.', 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Enviar email con EmailJS
async function sendEmail(formData) {
    const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        to_email: 'lucas.alvarez.bernardez.99@gmail.com'
    };

    // Para usar EmailJS, necesitas registrarte en https://www.emailjs.com/
    // y obtener tu USER_ID, SERVICE_ID y TEMPLATE_ID
    
    // Simulación del envío (reemplazar por EmailJS real)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular envío exitoso
            console.log('Email enviado:', templateParams);
            resolve();
            
            // Para implementar EmailJS real, descomenta y configura:
            /*
            if (typeof emailjs !== 'undefined') {
                emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
                    .then((response) => {
                        console.log('Email enviado exitosamente:', response);
                        resolve(response);
                    })
                    .catch((error) => {
                        console.error('Error al enviar email:', error);
                        reject(error);
                    });
            } else {
                reject(new Error('EmailJS no está cargado'));
            }
            */
        }, 2000);
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

// ===============================
// HEADER SCROLL EFFECT
// ===============================
function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;

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
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });

    // Efecto de click en botones con ripple
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            let ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');

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
}

// ===============================
// NOTIFICACIONES
// ===============================
function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);

    // Remover después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===============================
// EVENTOS DEL MODAL
// ===============================
function initModalEvents() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');

    // Cerrar modal con botón X
    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }

    // Cerrar modal haciendo clic fuera del contenido
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeProjectModal();
        }
    });
}

// ===============================
// CONFIGURACIÓN DE EMAILJS
// ===============================
function initEmailJS() {
    // Para usar EmailJS, descomenta y configura con tus credenciales:
    /*
    // Cargar EmailJS dinámicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
        emailjs.init("TU_USER_ID_DE_EMAILJS");
        console.log('📧 EmailJS inicializado');
    };
    document.head.appendChild(script);
    */
    
    console.log('📧 EmailJS configurado (modo simulación)');
}

// ===============================
// GESTIÓN DEL ESTADO DE LA APLICACIÓN
// ===============================
function initAppState() {
    // Cargar configuración guardada
    const savedConfig = JSON.parse(localStorage.getItem('portfolioConfig') || '{}');
    
    // Aplicar configuración si existe
    if (savedConfig.name) {
        const nameElements = document.querySelectorAll('h1, .logo');
        nameElements.forEach(el => {
            if (el.textContent && el.textContent.includes('Lucas Alvarez')) {
                el.textContent = el.textContent.replace('Lucas Alvarez', savedConfig.name);
            }
        });
    }

    if (savedConfig.email) {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.href = `mailto:${savedConfig.email}`;
            const span = link.querySelector('span');
            if (span) span.textContent = savedConfig.email;
        });
    }

    if (savedConfig.phone) {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            link.href = `tel:${savedConfig.phone}`;
            const span = link.querySelector('span');
            if (span) span.textContent = savedConfig.phone;
        });
    }
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===============================
// INICIALIZACIÓN PRINCIPAL
// ===============================
function init() {
    console.log('🚀 Inicializando Portfolio de Lucas Alvarez...');

    try {
        // Inicializar módulos principales
        initLoader();
        initThemeToggle();
        initEmailJS();
        initAppState();
        loadProjects();
        initTypingAnimation();
        initScrollAnimations();
        initSmoothNavigation();
        initContactForm();
        initHeaderScrollEffect();
        initParticleEffect();
        initAdditionalEffects();
        initModalEvents();

        console.log('✅ Portfolio cargado correctamente!');
        
        // Mostrar bienvenida en consola
        console.log(`
╔══════════════════════════════════════╗
║     Portfolio - Lucas Alvarez        ║
║  Desarrollador Web Full Stack        ║
╚══════════════════════════════════════╝

🎨 Diseño: Moderno y responsive
⚡ Performance: Optimizado
🌙 Tema: Dark/Light mode
📱 Mobile: First design
🔧 Admin: Panel incluido

Hecho con ❤️ y mucho ☕
        `);
    } catch (error) {
        console.error('❌ Error al inicializar el portfolio:', error);
    }
}

// ===============================
// PUNTO DE ENTRADA
// ===============================
// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===============================
// EXPORTAR FUNCIONES GLOBALES
// ===============================
// Hacer funciones disponibles globalmente para uso en HTML
window.portfolioApp = {
    // Funciones principales
    showNotification,
    createParticle,
    typeAnimation,
    openProjectModal,
    closeProjectModal,
    openFullPreview,
    
    // Funciones de utilidad
    debounce,
    throttle,
    
    // Estado de la aplicación
    projects,
    loadProjects,
    renderProjects,
    
    // Configuración
    typingConfig
};

// Hacer funciones disponibles globalmente
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openFullPreview = openFullPreview;