// ===============================
// LÓGICA ESPECÍFICA DEL ADMIN
// ===============================

// Variables globales del admin
let projects = [];
let techStack = [];
let selectedImageBase64 = null;
let supabaseClient = null;

// Configuración de inactividad
const INACTIVITY_CONFIG = {
    timeout: 10000, // 10 segundos
    warningTime: 5000 // 5 segundos antes del logout
};

let inactivityTimer;
let warningTimer;

// ===============================
// INICIALIZACIÓN DEL ADMIN
// ===============================
function initAdmin() {
    console.log('🔧 Inicializando panel de administración...');
    
    // Verificar autenticación
    if (!checkSession()) {
        showNotification('Sesión expirada. Redirigiendo al login...', 'error');
        setTimeout(() => redirectToLogin(), 1000);
        return;
    }

    // Inicializar componentes
    initSupabase();
    initInactivityTimer();
    initImageUpload();
    initTechTags();
    initProjectForm();
    initLogoutButton();
    loadProjects();
    updateStats();
    
    console.log('✅ Admin inicializado correctamente');
}

// ===============================
// SUPABASE INTEGRATION
// ===============================
function initSupabase() {
    const config = loadConfig('supabaseConfig', {});
    
    if (config.url && config.key) {
        try {
            supabaseClient = supabase.createClient(config.url, config.key);
            updateConnectionStatus('connected');
            console.log('✅ Supabase conectado');
        } catch (error) {
            console.error('❌ Error conectando a Supabase:', error);
            updateConnectionStatus('disconnected');
        }
    } else {
        updateConnectionStatus('disconnected');
        showNotification('Configura Supabase para usar la base de datos', 'warning');
    }
}

async function testConnection() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    
    if (!url || !key) {
        showNotification('Por favor completa URL y Key de Supabase', 'error');
        return;
    }
    
    showLoader();
    updateConnectionStatus('connecting');
    
    try {
        const testClient = supabase.createClient(url, key);
        const { data, error } = await testClient.from('projects').select('*').limit(1);
        
        if (error) throw error;
        
        // Guardar configuración
        saveConfig('supabaseConfig', { url, key });
        supabaseClient = testClient;
        
        updateConnectionStatus('connected');
        showNotification('¡Conexión exitosa a Supabase!', 'success');
        
        // Cargar proyectos desde Supabase
        await loadProjectsFromSupabase();
        
    } catch (error) {
        console.error('Error en test de conexión:', error);
        updateConnectionStatus('disconnected');
        showNotification('Error conectando a Supabase: ' + error.message, 'error');
    } finally {
        hideLoader();
    }
}

function updateConnectionStatus(status) {
    const indicator = document.getElementById('connectionStatus');
    const dbStatus = document.getElementById('dbStatus');
    
    if (!indicator) return;
    
    indicator.className = `connection-status ${status}`;
    
    switch (status) {
        case 'connected':
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Conectado a Supabase';
            if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-check-circle"></i>';
            break;
        case 'disconnected':
            indicator.innerHTML = '<i class="fas fa-times-circle"></i> Desconectado';
            if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-times-circle"></i>';
            break;
        case 'connecting':
            indicator.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';
            if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            break;
    }
}

// ===============================
// GESTIÓN DE PROYECTOS
// ===============================
async function loadProjects() {
    if (supabaseClient) {
        await loadProjectsFromSupabase();
    } else {
        loadProjectsFromLocalStorage();
    }
    renderProjects();
    updateStats();
}

async function loadProjectsFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        projects = data || [];
        console.log(`📦 Cargados ${projects.length} proyectos desde Supabase`);
        
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        showNotification('Error cargando proyectos desde Supabase', 'error');
        loadProjectsFromLocalStorage();
    }
}

function loadProjectsFromLocalStorage() {
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
                technologies: ["React", "Node.js", "MongoDB", "Stripe"],
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: "Task Manager",
                description: "Gestor de tareas colaborativo con funciones de equipo, calendario integrado y notificaciones en tiempo real.",
                image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop",
                link: "https://taskmanager-demo.vercel.app",
                github: "https://github.com/lucasalvarez/task-manager",
                technologies: ["Vue.js", "Firebase", "Tailwind"],
                created_at: new Date().toISOString()
            }
        ];
        saveProjects();
    }
    
    console.log(`📦 Cargados ${projects.length} proyectos desde localStorage`);
}

async function saveProject(projectData) {
    const newProject = {
        id: Date.now(),
        ...projectData,
        image: selectedImageBase64,
        technologies: [...techStack],
        created_at: new Date().toISOString()
    };
    
    if (supabaseClient) {
        await saveProjectToSupabase(newProject);
    } else {
        projects.push(newProject);
        saveProjects();
    }
    
    showNotification('Proyecto agregado exitosamente', 'success');
    clearProjectForm();
    renderProjects();
    updateStats();
}

async function saveProjectToSupabase(project) {
    try {
        const { error } = await supabaseClient
            .from('projects')
            .insert([project]);
        
        if (error) throw error;
        
        projects.push(project);
        console.log('✅ Proyecto guardado en Supabase');
        
    } catch (error) {
        console.error('Error guardando proyecto:', error);
        showNotification('Error guardando en Supabase, usando localStorage', 'warning');
        projects.push(project);
        saveProjects();
    }
}

function saveProjects() {
    saveConfig('portfolioProjects', projects);
}

async function deleteProject(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        return;
    }
    
    if (supabaseClient) {
        await deleteProjectFromSupabase(id);
    } else {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
    }
    
    showNotification('Proyecto eliminado', 'success');
    renderProjects();
    updateStats();
}

async function deleteProjectFromSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('projects')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        projects = projects.filter(p => p.id !== id);
        console.log('✅ Proyecto eliminado de Supabase');
        
    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        showNotification('Error eliminando de Supabase', 'error');
    }
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No hay proyectos agregados aún.</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-item">
            <div class="project-info">
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 100)}...</p>
                <div style="margin-top: 0.5rem;">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join(' ')}
                </div>
                <small style="color: var(--text-secondary); margin-top: 0.5rem; display: block;">
                    ${project.created_at ? timeAgo(project.created_at) : 'Fecha desconocida'}
                </small>
            </div>
            <div class="project-actions">
                <a href="${project.link}" target="_blank" class="btn btn-primary" title="Ver proyecto">
                    <i class="fas fa-external-link-alt"></i>
                </a>
                <a href="${project.github}" target="_blank" class="btn btn-secondary" title="Ver código">
                    <i class="fab fa-github"></i>
                </a>
                <button onclick="deleteProject(${project.id})" class="btn btn-danger" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===============================
// FORMULARIO DE PROYECTOS
// ===============================
function initProjectForm() {
    const form = document.getElementById('addProjectForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            link: formData.get('link'),
            github: formData.get('github')
        };
        
        // Validaciones
        if (!validateRequired(projectData.title, 'Título') ||
            !validateRequired(projectData.description, 'Descripción') ||
            !validateUrl(projectData.link, 'URL del proyecto') ||
            !validateUrl(projectData.github, 'URL de GitHub')) {
            return;
        }
        
        if (!selectedImageBase64) {
            showNotification('Por favor selecciona una imagen para el proyecto', 'error');
            return;
        }
        
        if (techStack.length === 0) {
            showNotification('Agrega al menos una tecnología', 'error');
            return;
        }
        
        await saveProject(projectData);
    });
}

function clearProjectForm() {
    const form = document.getElementById('addProjectForm');
    if (form) form.reset();
    
    techStack = [];
    selectedImageBase64 = null;
    updateTechDisplay();
    clearImagePreview();
}

// ===============================
// GESTIÓN DE IMÁGENES
// ===============================
function initImageUpload() {
    const fileInput = document.getElementById('projectImage');
    const uploadArea = document.querySelector('.image-upload-area');
    
    if (!fileInput || !uploadArea) return;
    
    fileInput.addEventListener('change', handleFileSelection);
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
}

function handleFileSelection(event) {
    const file = event.target.files[0];
    if (file && validateImageFile(file)) {
        processImageFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0 && validateImageFile(files[0])) {
        processImageFile(files[0]);
    }
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

async function processImageFile(file) {
    try {
        selectedImageBase64 = await fileToBase64(file);
        showImagePreview(selectedImageBase64, file.name);
        showNotification('Imagen cargada correctamente', 'success');
    } catch (error) {
        console.error('Error procesando imagen:', error);
        showNotification('Error al cargar la imagen', 'error');
    }
}

function showImagePreview(base64, filename) {
    const uploadContent = document.getElementById('uploadContent');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (!uploadContent || !imagePreview || !previewImg) return;
    
    previewImg.src = base64;
    previewImg.alt = filename;
    
    uploadContent.style.display = 'none';
    imagePreview.style.display = 'block';
}

function removeImage(event) {
    event.stopPropagation();
    clearImagePreview();
    selectedImageBase64 = null;
    document.getElementById('projectImage').value = '';
}

function clearImagePreview() {
    const uploadContent = document.getElementById('uploadContent');
    const imagePreview = document.getElementById('imagePreview');
    
    if (uploadContent && imagePreview) {
        uploadContent.style.display = 'flex';
        imagePreview.style.display = 'none';
    }
}

// ===============================
// GESTIÓN DE TECNOLOGÍAS
// ===============================
function initTechTags() {
    const techInput = document.getElementById('techInput');
    if (!techInput) return;
    
    techInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tech = techInput.value.trim();
            if (tech && !techStack.includes(tech)) {
                techStack.push(tech);
                updateTechDisplay();
                techInput.value = '';
                showNotification(`Tecnología "${tech}" agregada`, 'success', 2000);
            }
        }
    });
}

function updateTechDisplay() {
    const container = document.getElementById('techTags');
    if (!container) return;
    
    container.innerHTML = techStack.map(tech => `
        <span class="tech-tag">
            ${tech}
            <span class="remove" onclick="removeTech('${tech}')">&times;</span>
        </span>
    `).join('');
}

function removeTech(tech) {
    techStack = techStack.filter(t => t !== tech);
    updateTechDisplay();
    showNotification(`Tecnología "${tech}" eliminada`, 'info', 2000);
}

// ===============================
// GESTIÓN DE CONFIGURACIÓN
// ===============================
function saveConfiguration() {
    const config = {
        name: document.getElementById('portfolioName').value,
        email: document.getElementById('portfolioEmail').value,
        phone: document.getElementById('portfolioPhone').value,
        supabaseUrl: document.getElementById('supabaseUrl').value,
        supabaseKey: document.getElementById('supabaseKey').value
    };
    
    // Guardar configuración general
    saveConfig('portfolioConfig', {
        name: config.name,
        email: config.email,
        phone: config.phone
    });
    
    // Guardar configuración de Supabase
    if (config.supabaseUrl && config.supabaseKey) {
        saveConfig('supabaseConfig', {
            url: config.supabaseUrl,
            key: config.supabaseKey
        });
    }
    
    showNotification('Configuración guardada correctamente', 'success');
}

// ===============================
// SISTEMA DE INACTIVIDAD
// ===============================
function initInactivityTimer() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    resetInactivityTimer();
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    hideActivityWarning();
    
    // Warning timer
    warningTimer = setTimeout(showActivityWarning, INACTIVITY_CONFIG.warningTime);
    
    // Auto logout timer
    inactivityTimer = setTimeout(autoLogout, INACTIVITY_CONFIG.timeout);
}

function showActivityWarning() {
    const indicator = document.getElementById('activityIndicator');
    if (indicator) {
        indicator.textContent = 'Cerrando sesión en 5 segundos...';
        indicator.classList.add('warning', 'show');
    }
}

function hideActivityWarning() {
    const indicator = document.getElementById('activityIndicator');
    if (indicator) {
        indicator.classList.remove('warning', 'show');
    }
}

function autoLogout() {
    showNotification('Sesión cerrada por inactividad', 'warning');
    destroySession();
    setTimeout(() => redirectToLogin(), 1000);
}

// ===============================
// LOGOUT MANUAL
// ===============================
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', handleLogout);
}

function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        destroySession();
        showNotification('Sesión cerrada correctamente', 'success');
        setTimeout(() => redirectToLogin(), 1000);
    }
}

// ===============================
// ESTADÍSTICAS
// ===============================
function updateStats() {
    const totalProjects = document.getElementById('totalProjects');
    if (totalProjects) {
        totalProjects.textContent = projects.length;
    }
    
    // Actualizar también en el portfolio principal
    const projectCount = document.getElementById('projectCount');
    if (projectCount) {
        projectCount.textContent = projects.length;
    }
}

// ===============================
// FUNCIONES GLOBALES PARA HTML
// ===============================
window.deleteProject = deleteProject;
window.removeTech = removeTech;
window.removeImage = removeImage;
window.saveConfiguration = saveConfiguration;
window.testConnection = testConnection;
window.loadProjects = loadProjects;

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', initAdmin); LÓGICA ESPECÍFICA DEL ADMIN
// ===============================

// Variables globales del admin
let projects = [];
let techStack = [];
let selectedImageBase64 = null;
let supabaseClient = null;

// Configuración de inactividad
const INACTIVITY_CONFIG = {
    timeout: 10000, // 10 segundos
    warningTime: 5000 // 5 segundos antes del logout
};

let inactivityTimer;
let warningTimer;

// ===============================
//