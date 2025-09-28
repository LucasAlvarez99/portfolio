// ===============================
// ADMIN.JS - CON CREDENCIALES REALES
// ===============================

// Variables globales del admin
let projects = [];
let techStack = [];
let selectedImageBase64 = null;
let supabaseClient = null;

// Configuración de inactividad
const INACTIVITY_CONFIG = {
    timeout: 30000, // 30 segundos
    warningTime: 25000 // 5 segundos antes del logout
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
    initSupabaseWithCredentials();
    initInactivityTimer();
    initImageUpload();
    initTechTags();
    initProjectForm();
    initLogoutButton();
    loadProjects();
    updateStats();
    loadSavedConfiguration();
    
    console.log('✅ Admin inicializado correctamente');
}

// ===============================
// SUPABASE CON CREDENCIALES REALES
// ===============================
function initSupabaseWithCredentials() {
    // Tus credenciales reales
    const SUPABASE_URL = 'https://gacaofljolawsefbelgc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2FvZmxqb2xhd3NlZmJlbGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQyMjMsImV4cCI6MjA3NDMzMDIyM30.3X0NA-_cRqVQSbu-cp1Ge4ToMbAVO2QqNr-yAPOZBho';
    
    try {
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase client no está cargado');
            updateConnectionStatus('disconnected');
            showNotification('Error: Supabase no está cargado', 'error');
            return;
        }
        
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        updateConnectionStatus('connected');
        
        // Guardar credenciales en localStorage también
        saveConfig('supabaseConfig', { 
            url: SUPABASE_URL, 
            key: SUPABASE_ANON_KEY 
        });
        
        // Actualizar campos del formulario
        const urlField = document.getElementById('supabaseUrl');
        const keyField = document.getElementById('supabaseKey');
        
        if (urlField) urlField.value = SUPABASE_URL;
        if (keyField) keyField.value = SUPABASE_ANON_KEY;
        
        console.log('✅ Supabase inicializado con credenciales reales');
        
        // Test inicial de conexión
        testSupabaseConnection();
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        updateConnectionStatus('disconnected');
        showNotification('Error conectando a Supabase: ' + error.message, 'error');
    }
}

async function testSupabaseConnection() {
    try {
        console.log('🔌 Probando conexión a Supabase...');
        
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Error en test de conexión:', error);
            
            if (error.message.includes('relation "projects" does not exist')) {
                console.log('💡 La tabla "projects" no existe. Creándola...');
                showNotification('Tabla "projects" no encontrada. Verifica tu configuración SQL.', 'warning');
            } else {
                showNotification('Error de conexión: ' + error.message, 'error');
            }
            
            updateConnectionStatus('disconnected');
            return false;
        }
        
        console.log('✅ Conexión exitosa. Datos:', data);
        updateConnectionStatus('connected');
        showNotification('¡Conexión exitosa a Supabase!', 'success', 3000);
        return true;
        
    } catch (error) {
        console.error('❌ Error inesperado:', error);
        updateConnectionStatus('disconnected');
        showNotification('Error inesperado: ' + error.message, 'error');
        return false;
    }
}

function updateConnectionStatus(status) {
    const indicator = document.getElementById('connectionStatus');
    const dbStatus = document.getElementById('dbStatus');
    
    if (indicator) {
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
}

// ===============================
// GESTIÓN DE PROYECTOS CON SUPABASE
// ===============================
async function loadProjects() {
    console.log('📦 Cargando proyectos...');
    
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
        console.log('🔍 Cargando desde Supabase...');
        
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error cargando proyectos:', error);
            showNotification('Error cargando desde Supabase, usando localStorage', 'warning');
            loadProjectsFromLocalStorage();
            return;
        }
        
        projects = data || [];
        console.log(`✅ ${projects.length} proyectos cargados desde Supabase`);
        
        // Sincronizar con localStorage como backup
        saveConfig('portfolioProjects', projects);
        
    } catch (error) {
        console.error('Error inesperado cargando proyectos:', error);
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
    
    console.log(`📦 ${projects.length} proyectos cargados desde localStorage`);
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
        const { data, error } = await supabaseClient
            .from('projects')
            .insert([project])
            .select();
        
        if (error) {
            console.error('Error guardando proyecto:', error);
            showNotification('Error guardando en Supabase, usando localStorage', 'warning');
            projects.push(project);
            saveProjects();
            return;
        }
        
        projects.push(data[0]);
        saveConfig('portfolioProjects', projects);
        console.log('✅ Proyecto guardado en Supabase');
        
    } catch (error) {
        console.error('Error inesperado guardando:', error);
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
        
        if (error) {
            console.error('Error eliminando proyecto:', error);
            showNotification('Error eliminando de Supabase', 'error');
            return;
        }
        
        projects = projects.filter(p => p.id !== id);
        saveConfig('portfolioProjects', projects);
        console.log('✅ Proyecto eliminado de Supabase');
        
    } catch (error) {
        console.error('Error inesperado eliminando:', error);
        showNotification('Error inesperado eliminando proyecto', 'error');
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
            !validateUrl(projectData.link) ||
            !validateUrl(projectData.github)) {
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
        showNotification('Imagen cargada correctamente', 'success', 2000);
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
    const fileInput = document.getElementById('projectImage');
    if (fileInput) fileInput.value = '';
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
                showNotification(`Tecnología "${tech}" agregada`, 'success', 1500);
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
    showNotification(`Tecnología "${tech}" eliminada`, 'info', 1500);
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

function loadSavedConfiguration() {
    const config = loadConfig('portfolioConfig', {});
    
    // Cargar valores guardados
    if (config.name) document.getElementById('portfolioName').value = config.name;
    if (config.email) document.getElementById('portfolioEmail').value = config.email;
    if (config.phone) document.getElementById('portfolioPhone').value = config.phone;
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
}

// ===============================
// FUNCIÓN DE TEST MEJORADA
// ===============================
async function testConnection() {
    console.log('🧪 Probando conexión...');
    
    updateConnectionStatus('connecting');
    showLoader();
    
    try {
        const success = await testSupabaseConnection();
        
        if (success) {
            await loadProjectsFromSupabase();
            renderProjects();
            updateStats();
        }
        
    } catch (error) {
        console.error('Error en test:', error);
        showNotification('Error inesperado en el test', 'error');
    } finally {
        hideLoader();
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
document.addEventListener('DOMContentLoaded', initAdmin);