// ===============================
// CONFIGURACIÓN DE EMAILJS
// ===============================
const EMAILJS_CONFIG = {
    serviceID: 'service_2thylwz',      // Ej: 'service_abc123xyz'
    templateID: 'template_n2tlb2b',    // Ej: 'template_xyz789abc'
    userID: 'CR6rKM8xVNBO7QF41'          // Ej: 'user_def456ghi'
};

// Inicializar EmailJS
function initEmailJS() {
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS no está cargado');
        return false;
    }
    
    try {
        emailjs.init(EMAILJS_CONFIG.userID);
        console.log('✅ EmailJS inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando EmailJS:', error);
        return false;
    }
}
let projects = [];
let supabaseClient = null;
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
    
    // Inicializar Supabase primero
    initSupabase();
    
    // Cargar datos dinámicos
    loadPortfolioData();
    
    // Cargar proyectos desde Supabase
    loadProjectsFromSupabase();
    
    // Inicializar componentes
    initTypingAnimation();
    initScrollAnimations();
    initContactForm();
    initProjectModal();
    initHeaderScrollEffect();
    initParticleEffect();
    initCVDownload();
    
    console.log('✅ Portfolio inicializado correctamente');
}

// ===============================
// INICIALIZAR SUPABASE EN EL PORTFOLIO
// ===============================
function initSupabase() {
    console.log('🔌 Inicializando conexión a Supabase...');
    
    // Credenciales de Supabase
    const SUPABASE_URL = 'https://gacaofljolawsefbelgc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2FvZmxqb2xhd3NlZmJlbGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQyMjMsImV4cCI6MjA3NDMzMDIyM30.3X0NA-_cRqVQSbu-cp1Ge4ToMbAVO2QqNr-yAPOZBho';
    
    try {
        // Verificar que Supabase esté cargado
        if (typeof supabase === 'undefined') {
            console.error('❌ Librería de Supabase no cargada');
            console.log('💡 Usando proyectos por defecto...');
            return false;
        }
        
        // Crear cliente
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase inicializado');
        return true;
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return false;
    }
}

// ===============================
// CARGAR PROYECTOS DESDE SUPABASE
// ===============================
async function loadProjectsFromSupabase() {
    console.log('📦 Cargando proyectos desde Supabase...');
    
    // Si no hay cliente Supabase, usar proyectos por defecto
    if (!supabaseClient) {
        console.log('⚠️ No hay conexión a Supabase, usando proyectos por defecto');
        loadDefaultProjects();
        return;
    }
    
    try {
        // Obtener proyectos desde Supabase
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error cargando proyectos:', error);
            console.log('💡 Usando proyectos por defecto...');
            loadDefaultProjects();
            return;
        }
        
        if (data && data.length > 0) {
            projects = data;
            console.log(`✅ ${projects.length} proyectos cargados desde Supabase`);
            
            // Guardar en localStorage SOLO como respaldo
            saveConfig('portfolioProjects', projects);
        } else {
            console.log('⚠️ No hay proyectos en Supabase, usando por defecto');
            loadDefaultProjects();
        }
        
        // Renderizar proyectos
        renderProjects();
        updateProjectCount();
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
        loadDefaultProjects();
    }
}

// Función para cargar proyectos por defecto
function loadDefaultProjects() {
    // Intentar cargar desde localStorage primero
    const savedProjects = loadConfig('portfolioProjects', []);
    
    if (savedProjects.length > 0) {
        projects = savedProjects;
        console.log(`📦 ${projects.length} proyectos cargados desde localStorage`);
    } else {
        // Si no hay nada, usar proyectos de demostración
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
        console.log('📦 3 proyectos de demostración cargados');
    }
    
    renderProjects();
    updateProjectCount();
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
    
    console.log('📄 Datos del portfolio cargados');
}

// ===============================
// RENDERIZAR PROYECTOS
// ===============================
// ===============================
// RENDERIZAR PROYECTOS - VERSIÓN FIJA
// ===============================
function renderProjects() {
    console.log('🎨 Renderizando proyectos...', projects.length);
    
    const container = document.getElementById('projectsGrid');
    if (!container) {
        console.error('❌ Contenedor projectsGrid no encontrado');
        return;
    }
    
    console.log('✅ Contenedor encontrado');
    
    if (projects.length === 0) {
        console.log('⚠️ No hay proyectos para mostrar');
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay proyectos para mostrar.</p>';
        return;
    }
    
    console.log('📦 Renderizando', projects.length, 'proyectos');
    
    // Limpiar contenedor completamente
    container.innerHTML = '';
    
    // Agregar cada proyecto
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card zoom-in visible'; // Agregar 'visible' directamente
        projectCard.style.opacity = '1'; // Forzar visibilidad
        projectCard.style.transform = 'scale(1)'; // Forzar transformación
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title} Preview" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Imagen+No+Disponible'" />
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
                    ${(project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
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
        `;
        
        // Agregar evento de clic
        projectCard.addEventListener('click', () => openProjectModal(project.id));
        
        // Agregar al contenedor
        container.appendChild(projectCard);
    });
    
    console.log('✅', projects.length, 'proyectos renderizados correctamente');
    
    // Forzar que sean visibles después de un frame
    requestAnimationFrame(() => {
        const allCards = container.querySelectorAll('.project-card');
        allCards.forEach(card => {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'block';
        });
        console.log('✅ Visibilidad forzada en', allCards.length, 'tarjetas');
    });
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
// ANIMACIONES AL SCROLL - VERSIÓN FIJA
// ===============================
function initScrollAnimations() {
    // NO aplicar animaciones a las project-card inicialmente
    // Ya están visibles por defecto
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // NO sobrescribir la visibilidad de project-card
                if (!entry.target.classList.contains('project-card')) {
                    entry.target.classList.add('visible');
                }
                
                // Animación especial para barras de habilidades
                if (entry.target.classList.contains('skill-card')) {
                    animateSkillBar(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observar solo elementos que NO son project-card
    document.querySelectorAll('.fade-in:not(.project-card), .slide-up:not(.project-card), .zoom-in:not(.project-card)').forEach(el => {
        observer.observe(el);
    });
    
    console.log('✅ Animaciones de scroll inicializadas (excluyendo proyectos)');
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
// FORMULARIO DE CONTACTO CON EMAILJS
// ===============================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    // Inicializar EmailJS
    const emailJSReady = initEmailJS();
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                await sendEmailWithEmailJS(formData);
                showNotification('✅ ¡Mensaje enviado correctamente! Te contactaré pronto.', 'success', 5000);
                contactForm.reset();
            } else {
                showNotification('⚠️ EmailJS no está configurado. Configura tus credenciales.', 'warning', 5000);
            }
        } catch (error) {
            console.error('Error al enviar email:', error);
            let errorMessage = 'Error al enviar el mensaje. ';
            
            if (error.text && error.text.includes('Invalid')) {
                errorMessage += 'Verifica la configuración de EmailJS.';
            } else if (error.text && error.text.includes('limit')) {
                errorMessage += 'Se alcanzó el límite de emails. Intenta más tarde.';
            } else {
                errorMessage += 'Por favor, intenta de nuevo.';
            }
            
            showNotification(errorMessage, 'error', 8000);
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Enviar email usando EmailJS
async function sendEmailWithEmailJS(formData) {
    console.log('📧 Enviando email con EmailJS...');
    
    const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        to_email: 'lucas.alvarez.bernardez.99@gmail.com',
        sent_date: new Date().toLocaleDateString('es-ES'),
        sent_time: new Date().toLocaleTimeString('es-ES'),
        reply_to: formData.get('email')
    };
    
    console.log('📤 Enviando con datos:', {
        nombre: templateParams.from_name,
        email: templateParams.from_email
    });
    
    const response = await emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams
    );
    
    if (response.status === 200) {
        console.log('✅ Email enviado exitosamente');
        
        // Guardar en Supabase también (opcional)
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            saveContactToSupabase(templateParams);
        }
        
        return true;
    } else {
        throw new Error('Email no enviado: ' + response.text);
    }
}

// Guardar contacto en Supabase (opcional)
async function saveContactToSupabase(data) {
    try {
        const { error } = await supabaseClient
            .from('contact_messages')
            .insert([{
                name: data.from_name,
                email: data.from_email,
                subject: data.subject,
                message: data.message,
                created_at: new Date().toISOString()
            }]);
        
        if (!error) {
            console.log('✅ Contacto guardado en Supabase');
        }
    } catch (error) {
        console.log('⚠️ No se pudo guardar en Supabase:', error);
    }
}

function validateContactForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!name || name.length < 2) {
        showNotification('El nombre debe tener al menos 2 caracteres', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showNotification('Por favor, ingresa un email válido', 'error');
        return false;
    }
    
    if (!subject || subject.length < 3) {
        showNotification('El asunto debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    if (!message || message.length < 10) {
        showNotification('El mensaje debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    return true;
}

async function sendEmail(formData) {
    // Esta función ahora apunta a sendEmailWithEmailJS
    return sendEmailWithEmailJS(formData);
}

// Función de prueba para EmailJS
function testEmailFunction() {
    console.log('🧪 Probando EmailJS...');
    
    const testFormData = new FormData();
    testFormData.append('name', 'Usuario de Prueba');
    testFormData.append('email', 'test@example.com');
    testFormData.append('subject', 'Mensaje de prueba');
    testFormData.append('message', 'Este es un mensaje de prueba desde la consola del navegador.');
    
    sendEmailWithEmailJS(testFormData)
        .then(() => {
            console.log('✅ Test de EmailJS exitoso');
            alert('✅ Email de prueba enviado. Revisa tu bandeja de entrada.');
        })
        .catch((error) => {
            console.error('❌ Test de EmailJS falló:', error);
            alert('❌ Error al enviar email de prueba. Revisa la consola.');
        });
}

// Exportar función de test
window.testEmailFunction = testEmailFunction;

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
// BOTÓN DESCARGA CV
// ===============================
function initCVDownload() {
    const cvButton = document.getElementById('cvDownloadBtn');
    if (!cvButton) {
        console.log('⚠️ Botón de CV no encontrado');
        return;
    }
    
    console.log('📄 Inicializando botón de descarga de CV');
    
    // Verificar si el archivo existe
    checkCVFile();
    
    // Agregar pulso inicial para llamar la atención
    setTimeout(() => {
        cvButton.classList.add('pulse');
        setTimeout(() => {
            cvButton.classList.remove('pulse');
        }, 6000); // Pulsar por 6 segundos
    }, 2000);
    
    // Evento de clic
    cvButton.addEventListener('click', function(e) {
        handleCVDownload(this);
    });
}

// Verificar si el archivo CV existe
async function checkCVFile() {
    const cvButton = document.getElementById('cvDownloadBtn');
    if (!cvButton) return;
    
    const cvPath = './assets/CV_Lucas_Alvarez.pdf';
    
    try {
        const response = await fetch(cvPath, { method: 'HEAD' });
        
        if (response.ok) {
            console.log('✅ Archivo CV encontrado');
            cvButton.style.opacity = '1';
        } else {
            console.warn('⚠️ Archivo CV no encontrado en:', cvPath);
            cvButton.style.opacity = '0.6';
            cvButton.title = 'CV no disponible - Archivo no encontrado';
            cvButton.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('⚠️ El archivo CV no está disponible. Por favor, súbelo a: ./assets/CV-Lucas-Alvarez.pdf', 'warning', 5000);
            }, { once: true });
        }
    } catch (error) {
        console.warn('⚠️ No se pudo verificar el archivo CV:', error);
        // Dejar que intente descargar de todas formas
    }
}

// Manejar la descarga del CV
function handleCVDownload(button) {
    console.log('📥 Descargando CV...');
    
    // Agregar clase de descarga
    button.classList.add('downloading');
    
    // Cambiar icono temporalmente
    const icon = button.querySelector('i');
    const originalIconClass = icon.className;
    icon.className = 'fas fa-spinner fa-spin';
    
    // Simular proceso de descarga
    setTimeout(() => {
        // Quitar estado de descarga
        button.classList.remove('downloading');
        button.classList.add('downloaded');
        
        // Restaurar icono y agregar check
        icon.className = originalIconClass;
        
        // Mostrar notificación
        if (typeof showNotification !== 'undefined') {
            showNotification('✅ CV descargado correctamente', 'success', 3000);
        }
        
        // Analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'CV',
                'event_label': 'CV Download',
                'value': 1
            });
        }
        
        // Guardar estadística en Supabase si está disponible
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
            saveDownloadAnalytics();
        }
        
        // Remover estado después de 3 segundos
        setTimeout(() => {
            button.classList.remove('downloaded');
        }, 3000);
        
        console.log('✅ CV descargado');
        
    }, 800); // Simular tiempo de descarga
}

// Guardar analítica de descarga en Supabase
async function saveDownloadAnalytics() {
    try {
        const { data, error } = await supabaseClient
            .from('analytics')
            .insert([{
                event_type: 'cv_download',
                event_data: {
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent.substring(0, 100)
                }
            }]);
        
        if (error) {
            console.log('⚠️ No se pudo guardar analytics:', error.message);
        } else {
            console.log('📊 Analytics de descarga guardado');
        }
    } catch (error) {
        console.log('⚠️ Error guardando analytics:', error);
    }
}

// Función para actualizar el CV dinámicamente desde el admin
function updateCVPath(newPath) {
    const cvButton = document.getElementById('cvDownloadBtn');
    if (cvButton) {
        cvButton.href = newPath;
        console.log('✅ Ruta del CV actualizada a:', newPath);
        checkCVFile();
    }
}

// Exportar funciones
window.updateCVPath = updateCVPath;

// Función throttle
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

// Función de configuración
function loadConfig(key, defaultValue = null) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

function saveConfig(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

// ===============================
// FUNCIONES GLOBALES PARA HTML
// ===============================
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openFullPreview = openFullPreview;
window.loadProjectsFromSupabase = loadProjectsFromSupabase;

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', initPortfolio);

// Información de debug
console.log('🛠️ INDEX.JS CARGADO');
console.log('📋 Para recargar proyectos: loadProjectsFromSupabase()');