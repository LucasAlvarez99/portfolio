// ===============================
// LÓGICA ESPECÍFICA DEL PORTFOLIO
// ===============================

// Variables globales
let projects = [];
let typingConfig = {
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

let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = typingConfig.typingSpeed;

// ===============================
// INICIALIZACIÓN DEL PORTFOLIO
// ===============================
function initPortfolio() {
    console.log('🚀 Inicializando portfolio...');
    
    // Cargar datos dinámicos
    loadPortfolioData();
    loadProjects();
    
    // Inicializar componentes
    initTypingAnimation();
    initScrollAnimations();
    initContactForm();
    initProjectModal();
    initHeaderScrollEffect();
    initParticleEffect();
    
    console.log('✅ Portfolio inicializado correctamente');
}



// ===============================
// CARGA DE DATOS DINÁMICOS
// ===============================
function loadPortfolioData() {
    const config = loadConfig('portfolioConfig', {});
    
    // Aplicar nombre
    if (config.name) {
        document.querySelectorAll('.logo, h1').forEach(element => {
            if (element.textContent && element.textContent.includes('Lucas Alvarez')) {
                element.textContent = element.textContent.replace('Lucas Alvarez', config.name);
            }
        });
    }
    
    // Aplicar título/cargo
    if (config.title) {
        document.querySelectorAll('.subtitle').forEach(element => {
            if (element.textContent && element.textContent.includes('Desarrollador Web')) {
                element.textContent = config.title;
            }
        });
    }
    
    // Aplicar información de contacto
    if (config.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.href = `mailto:${config.email}`;
            const span = link.querySelector('span');
            if (span) span.textContent = config.email;
        });
    }
    
    if (config.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.href = `tel:${config.phone}`;
            const span = link.querySelector('span');
            if (span) span.textContent = config.phone;
        });
    }
    
    if (config.location) {
        document.querySelectorAll('.contact-item').forEach(item => {
            const icon = item.querySelector('i.fa-map-marker-alt');
            if (icon) {
                const span = item.querySelector('span');
                if (span) span.textContent = config.location;
            }
        });
    }
    
    // Aplicar textos de "Sobre mí"
    if (config.aboutText1 || config.aboutText2 || config.aboutText3) {
        const aboutTextElements = document.querySelectorAll('.about-text p');
        if (config.aboutText1 && aboutTextElements[0]) {
            aboutTextElements[0].textContent = config.aboutText1;
        }
        if (config.aboutText2 && aboutTextElements[1]) {
            aboutTextElements[1].textContent = config.aboutText2;
        }
        if (config.aboutText3 && aboutTextElements[2]) {
            aboutTextElements[2].textContent = config.aboutText3;
        }
    }
    
    // Aplicar estadísticas
    const statItems = document.querySelectorAll('.stat-item h3');
    if (config.statProjects && statItems[0]) {
        statItems[0].textContent = config.statProjects;
    }
    if (config.statExperience && statItems[1]) {
        statItems[1].textContent = config.statExperience + '+';
    }
    if (config.statSatisfaction && statItems[2]) {
        statItems[2].textContent = config.statSatisfaction + '%';
    }
    
    // Aplicar imagen de perfil
    if (config.profileImage) {
        document.querySelectorAll('.about-image img').forEach(img => {
            img.src = config.profileImage;
        });
    }
    
    console.log('📄 Datos del portfolio cargados');
}

// ===============================
// GESTIÓN DE PROYECTOS
// ===============================
function loadProjects() {
    projects = loadConfig('portfolioProjects', []);
    
    // Proyectos por defecto si no hay ninguno
    if (projects.length === 0) {
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
    
    console.log(`📦 ${projects.length} proyectos cargados`);
}

function renderProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;}
    
function renderProjects() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    
    container.innerHTML = projects.map(project => `
        <div class="project-card zoom-in" onclick="openProjectModal(${project.id})">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title} Preview" loading="lazy" />
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
// MODAL DE PROYECTOS
// ===============================
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeProjectModal();
        }
    });
}

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
    
    if (!modal) return;
    
    // Llenar modal con datos del proyecto
    if (modalTitle) modalTitle.textContent = `${project.title} - Vista Previa`;
    if (modalProjectTitle) modalProjectTitle.textContent = project.title;
    if (modalProjectDescription) modalProjectDescription.textContent = project.description;
    if (modalProjectTech) {
        modalProjectTech.innerHTML = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
    }
    if (modalProjectLink) modalProjectLink.href = project.link;
    if (modalGithubLink) modalGithubLink.href = project.github;
    
    // Configurar URL preview
    try {
        const domain = new URL(project.link).hostname;
        const urlSpan = previewUrl?.querySelector('span');
        if (urlSpan) urlSpan.textContent = domain;
    } catch (e) {
        const urlSpan = previewUrl?.querySelector('span');
        if (urlSpan) urlSpan.textContent = 'preview.demo.com';
    }
    
    // Mostrar loading
    if (previewLoading) previewLoading.style.display = 'flex';
    if (previewFrame) previewFrame.style.display = 'none';
    
    // Cargar iframe
    if (previewFrame) {
        previewFrame.src = project.link;
        previewFrame.onload = () => {
            setTimeout(() => {
                if (previewLoading) previewLoading.style.display = 'none';
                if (previewFrame) previewFrame.style.display = 'block';
            }, 1000);
        };
        
        previewFrame.onerror = () => {
            if (previewLoading) {
                previewLoading.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudo cargar la vista previa</p>
                    <small>Haz clic en "Ver Sitio Web" para abrir el proyecto</small>
                `;
            }
        };
    }
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Analytics
    if (window.gtag) {
        gtag('event', 'project_view', {
            project_name: project.title
        });
    }
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    const previewFrame = document.getElementById('previewFrame');
    
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Limpiar iframe
    setTimeout(() => {
        if (previewFrame) previewFrame.src = '';
    }, 300);
}

function openFullPreview() {
    const modalProjectLink = document.getElementById('modalProjectLink');
    if (modalProjectLink && modalProjectLink.href) {
        window.open(modalProjectLink.href, '_blank');
    }
}

// ===============================
// ANIMACIÓN TYPING EN HERO
// ===============================
function initTypingAnimation() {
    setTimeout(typeAnimation, 2000);
}

function typeAnimation() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;
    
    const currentPhrase = typingConfig.phrases[currentPhraseIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex - 1) + '|';
        currentCharIndex--;
        typingSpeed = typingConfig.deletingSpeed;
    } else {
        typingElement.textContent = currentPhrase.substring(0, currentCharIndex + 1) + '|';
        currentCharIndex++;
        typingSpeed = typingConfig.typingSpeed;
    }
    
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
    
    // Observar elementos con animaciones
    document.querySelectorAll('.fade-in, .slide-up, .zoom-in').forEach(el => {
        observer.observe(el);
    });
}

function animateSkillBar(skillCard) {
    const levelBar = skillCard.querySelector('.level-bar');
    if (levelBar) {
        const level = levelBar.getAttribute('data-level');
        setTimeout(() => {
            levelBar.style.width = level + '%';
        }, 200);
    }
}

// ===============================
// CONFIGURACIÓN DE EMAILJS PARA PORTFOLIO
// ===============================

// Configuración de EmailJS (reemplaza con tus credenciales reales)
const EMAILJS_CONFIG = {
    serviceID: 'service_2thylwz',
    templateID: 'template_n2tlb2b', 
    userID: 'CR6rKM8xVNBO7QF41'
};

// Inicializar EmailJS cuando se carga la página
function initEmailJS() {
    // Verificar si EmailJS está cargado
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS no está cargado');
        return false;
    }
    
    // Inicializar EmailJS con tu User ID
    emailjs.init(EMAILJS_CONFIG.userID);
    console.log('✅ EmailJS inicializado correctamente');
    return true;
}

// Función mejorada para enviar email
async function sendContactEmail(formData) {
    console.log('📧 Enviando email de contacto...');
    
    try {
        // Preparar los datos del template
        const templateParams = {
            from_name: formData.get('name'),
            from_email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            to_email: 'lucas.alvarez.bernardez.99@gmail.com',
            reply_to: formData.get('email'),
            // Datos adicionales
            sent_date: new Date().toLocaleDateString('es-ES'),
            sent_time: new Date().toLocaleTimeString('es-ES'),
            user_agent: navigator.userAgent.substring(0, 100)
        };
        
        console.log('📤 Enviando con datos:', {
            nombre: templateParams.from_name,
            email: templateParams.from_email,
            asunto: templateParams.subject
        });
        
        // Enviar email usando EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceID,
            EMAILJS_CONFIG.templateID,
            templateParams
        );
        
        if (response.status === 200) {
            console.log('✅ Email enviado exitosamente:', response);
            
            // También guardar en Supabase si está disponible
            if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                await saveContactMessageToSupabase(templateParams);
            }
            
            return true;
        } else {
            throw new Error('Email no enviado: ' + response.text);
        }
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        
        // Si EmailJS falla, al menos guardar en Supabase/localStorage
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            await saveContactMessageToSupabase({
                from_name: formData.get('name'),
                from_email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            });
            console.log('💾 Mensaje guardado en Supabase como respaldo');
        }
        
        throw error;
    }
}

// Función para guardar mensaje en Supabase
async function saveContactMessageToSupabase(messageData) {
    try {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert([{
                name: messageData.from_name,
                email: messageData.from_email,
                subject: messageData.subject,
                message: messageData.message,
                created_at: new Date().toISOString()
            }]);
        
        if (error) {
            console.error('Error guardando mensaje en Supabase:', error);
            return false;
        }
        
        console.log('✅ Mensaje guardado en Supabase');
        return true;
    } catch (error) {
        console.error('Error inesperado guardando mensaje:', error);
        return false;
    }
}

// Función mejorada para manejar el formulario de contacto
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.error('❌ Formulario de contacto no encontrado');
        return;
    }
    
    // Inicializar EmailJS
    const emailJSReady = initEmailJS();
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Formulario de contacto enviado');
        
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Validar formulario
        if (!validateContactForm(formData)) {
            return;
        }
        
        // Mostrar estado de carga
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;
        
        try {
            if (emailJSReady) {
                // Intentar enviar por EmailJS
                await sendContactEmail(formData);
                showNotification('✅ ¡Mensaje enviado correctamente! Te contactaré pronto.', 'success', 5000);
            } else {
                // Fallback: solo guardar en Supabase
                if (typeof supabaseClient !== 'undefined' && supabaseClient) {
                    await saveContactMessageToSupabase({
                        from_name: formData.get('name'),
                        from_email: formData.get('email'),
                        subject: formData.get('subject'),
                        message: formData.get('message')
                    });
                    showNotification('✅ Mensaje guardado correctamente. Te contactaré pronto.', 'success', 5000);
                } else {
                    showNotification('⚠️ Mensaje procesado. Te contactaré pronto.', 'warning', 5000);
                }
            }
            
            // Limpiar formulario
            contactForm.reset();
            
            // Analytics (si está disponible)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_form_submit', {
                    'event_category': 'Contact',
                    'event_label': 'Form Submit Success'
                });
            }
            
        } catch (error) {
            console.error('❌ Error al enviar mensaje:', error);
            
            let errorMessage = 'Error al enviar el mensaje. ';
            if (error.text && error.text.includes('Invalid')) {
                errorMessage += 'Verifica la configuración de EmailJS.';
            } else if (error.text && error.text.includes('network')) {
                errorMessage += 'Verifica tu conexión a internet.';
            } else {
                errorMessage += 'Por favor, intenta de nuevo o contáctame directamente.';
            }
            
            showNotification(errorMessage, 'error', 8000);
            
        } finally {
            // Restaurar botón
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Validación del formulario de contacto
function validateContactForm(formData) {
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const subject = formData.get('subject')?.trim();
    const message = formData.get('message')?.trim();
    
    // Validar nombre
    if (!name || name.length < 2) {
        showNotification('Por favor ingresa tu nombre completo', 'error');
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return false;
    }
    
    // Validar asunto
    if (!subject || subject.length < 3) {
        showNotification('El asunto debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    // Validar mensaje
    if (!message || message.length < 10) {
        showNotification('El mensaje debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    return true;
}

// Función de prueba para el email
function testEmailFunction() {
    console.log('🧪 Probando función de email...');
    
    const testFormData = new FormData();
    testFormData.append('name', 'Test Usuario');
    testFormData.append('email', 'test@example.com');
    testFormData.append('subject', 'Prueba de Contacto');
    testFormData.append('message', 'Este es un mensaje de prueba desde la consola.');
    
    sendContactEmail(testFormData)
        .then(() => {
            console.log('✅ Test de email exitoso');
        })
        .catch((error) => {
            console.error('❌ Test de email falló:', error);
        });
}

// Exportar funciones para uso global
window.testEmailFunction = testEmailFunction;
window.initContactForm = initContactForm;

// Auto-inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

// ===============================
// EFECTOS DE HEADER
// ===============================
function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        
        if (scrolled > 100) {
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
        
        // Efecto parallax suave en hero
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }, 10));
}

// ===============================
// EFECTOS DE PARTÍCULAS
// ===============================
function initParticleEffect() {
    setInterval(createParticle, 2000);
}

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
        { transform: 'translateY(0px)', opacity: 0.3 },
        { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear'
    });
    
    animation.onfinish = () => particle.remove();
}

// ===============================
// FUNCIONES GLOBALES PARA HTML
// ===============================
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openFullPreview = openFullPreview;

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', initPortfolio);