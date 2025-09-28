// ===============================
// ADMIN.JS - ACTUALIZADO CON SUPABASE FUNCIONAL
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
// SUPABASE CON CREDENCIALES REALES - MEJORADO
// ===============================
async function initSupabaseWithCredentials() {
    console.log('🔌 Inicializando Supabase...');
    
    // Tus credenciales reales
    const SUPABASE_URL = 'https://gacaofljolawsefbelgc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2FvZmxqb2xhd3NlZmJlbGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQyMjMsImV4cCI6MjA3NDMzMDIyM30.3X0NA-_cRqVQSbu-cp1Ge4ToMbAVO2QqNr-yAPOZBho';
    
    try {
        // Verificar que la librería Supabase esté cargada
        if (typeof supabase === 'undefined') {
            console.error('❌ Librería de Supabase no cargada');
            showNotification('Error: Librería de Supabase no encontrada', 'error');
            updateConnectionStatus('disconnected');
            return false;
        }
        
        // Crear cliente de Supabase con configuración mejorada
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false, // No persistir sesión para admin público
            },
            db: {
                schema: 'public'
            }
        });
        
        console.log('✅ Cliente Supabase creado');
        updateConnectionStatus('connecting');
        
        // Guardar configuración en localStorage
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
        const connectionSuccess = await testSupabaseConnection();
        
        return connectionSuccess;
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        updateConnectionStatus('disconnected');
        showNotification('Error conectando a Supabase: ' + error.message, 'error');
        return false;
    }
}

async function testSupabaseConnection() {
    if (!supabaseClient) {
        console.error('❌ No hay cliente Supabase para probar');
        return false;
    }
    
    try {
        console.log('🔌 Probando conexión a Supabase...');
        
        // Test mejorado con más información
        const { data, error, count } = await supabaseClient
            .from('projects')
            .select('*', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.error('❌ Error en test de conexión:', error);
            
            // Mensajes específicos según el tipo de error
            if (error.message.includes('relation "projects" does not exist')) {
                console.log('💡 La tabla "projects" no existe. Necesitas ejecutar el SQL de configuración.');
                showNotification('Tabla "projects" no encontrada. Verifica la configuración de BD.', 'warning');
            } else if (error.code === '42501') {
                showNotification('Sin permisos. Verifica las políticas RLS.', 'error');
            } else {
                showNotification('Error de conexión: ' + error.message, 'error');
            }
            
            updateConnectionStatus('disconnected');
            return false;
        }
        
        console.log(`✅ Conexión exitosa. Proyectos en BD: ${count}`);
        showNotification(`✅ Conectado a Supabase. Proyectos: ${count}`, 'success', 3000);
        updateConnectionStatus('connected');
        
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
                if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success);"></i>';
                break;
            case 'disconnected':
                indicator.innerHTML = '<i class="fas fa-times-circle"></i> Sin conexión';
                if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-times-circle" style="color: var(--error);"></i>';
                break;
            case 'connecting':
                indicator.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';
                if (dbStatus) dbStatus.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="color: var(--warning);"></i>';
                break;
        }
    }
}

// ===============================
// GESTIÓN DE PROYECTOS CON SUPABASE - MEJORADO
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

// ===============================
// FUNCIÓN SAVEPROJECT MEJORADA
// ===============================
async function saveProject(projectData) {
    console.log('💾 Guardando proyecto:', projectData.title);
    
    // Validar que tenemos imagen seleccionada
    if (!selectedImageBase64) {
        showNotification('Error: No se ha seleccionado una imagen', 'error');
        return false;
    }
    
    // Validar que tenemos tecnologías
    if (techStack.length === 0) {
        showNotification('Error: Debe agregar al menos una tecnología', 'error');
        return false;
    }
    
    // Crear objeto del proyecto
    const newProject = {
        title: projectData.title,
        description: projectData.description,
        image: selectedImageBase64,
        link: projectData.link,
        github: projectData.github,
        technologies: [...techStack], // Clonar el array
        views: 0,
        featured: false,
        created_at: new Date().toISOString()
    };
    
    console.log('📦 Proyecto preparado:', {
        title: newProject.title,
        technologies: newProject.technologies,
        hasImage: !!newProject.image
    });
    
    try {
        // Intentar guardar en Supabase si está disponible
        if (supabaseClient) {
            const success = await saveProjectToSupabase(newProject);
            if (success) {
                showNotification('✅ Proyecto guardado en Supabase correctamente', 'success');
                clearProjectForm();
                await loadProjects(); // Recargar lista
                updateStats();
                return true;
            } else {
                // Fallback a localStorage si Supabase falla
                console.log('⚠️ Supabase falló, usando localStorage como respaldo');
                return await saveProjectToLocalStorage(newProject);
            }
        } else {
            // Usar localStorage directamente si no hay Supabase
            console.log('📝 Guardando en localStorage (no hay Supabase)');
            return await saveProjectToLocalStorage(newProject);
        }
    } catch (error) {
        console.error('❌ Error general guardando proyecto:', error);
        showNotification('Error: ' + error.message, 'error');
        return false;
    }
}

async function saveProjectToSupabase(project) {
    console.log('🔗 Intentando guardar en Supabase...');
    
    try {
        // Verificar conexión primero
        const { data: testData, error: testError } = await supabaseClient
            .from('projects')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.error('❌ Error de conexión con Supabase:', testError);
            throw new Error(`Conexión fallida: ${testError.message}`);
        }
        
        console.log('✅ Conexión con Supabase OK');
        
        // Preparar datos para Supabase (sin el ID)
        const supabaseProject = {
            title: project.title,
            description: project.description,
            image: project.image,
            link: project.link,
            github: project.github,
            technologies: project.technologies, // Supabase maneja JSON automáticamente
            views: project.views || 0,
            featured: project.featured || false
        };
        
        console.log('📤 Enviando a Supabase:', {
            title: supabaseProject.title,
            techCount: supabaseProject.technologies.length
        });
        
        // Insertar en Supabase
        const { data, error } = await supabaseClient
            .from('projects')
            .insert([supabaseProject])
            .select(); // Obtener el registro insertado
        
        if (error) {
            console.error('❌ Error insertando en Supabase:', error);
            
            // Mensajes de error más específicos
            if (error.code === 'PGRST116') {
                throw new Error('La tabla "projects" no existe. Verifica la configuración de la base de datos.');
            } else if (error.code === '42501') {
                throw new Error('Sin permisos para insertar. Verifica las políticas RLS.');
            } else {
                throw new Error(error.message);
            }
        }
        
        if (!data || data.length === 0) {
            throw new Error('No se recibió confirmación del servidor');
        }
        
        console.log('✅ Proyecto guardado en Supabase:', data[0]);
        
        // Agregar a la lista local también para mostrar inmediatamente
        const savedProject = {
            ...data[0],
            id: data[0].id || Date.now() // Usar ID de Supabase o fallback
        };
        
        projects.unshift(savedProject); // Agregar al principio
        saveConfig('portfolioProjects', projects); // Sincronizar localStorage
        
        return true;
        
    } catch (error) {
        console.error('💥 Error en saveProjectToSupabase:', error);
        showNotification(`Error Supabase: ${error.message}`, 'error');
        return false;
    }
}

async function saveProjectToLocalStorage(project) {
    console.log('💾 Guardando en localStorage...');
    
    try {
        // Agregar ID único
        const projectWithId = {
            ...project,
            id: Date.now() // ID basado en timestamp
        };
        
        // Cargar proyectos existentes
        const existingProjects = loadConfig('portfolioProjects', []);
        
        // Agregar nuevo proyecto al principio
        existingProjects.unshift(projectWithId);
        
        // Guardar
        const saved = saveConfig('portfolioProjects', existingProjects);
        
        if (saved) {
            console.log('✅ Proyecto guardado en localStorage');
            projects = existingProjects; // Actualizar variable global
            showNotification('✅ Proyecto guardado localmente', 'success');
            clearProjectForm();
            renderProjects();
            updateStats();
            return true;
        } else {
            throw new Error('No se pudo guardar en localStorage');
        }
        
    } catch (error) {
        console.error('💥 Error guardando en localStorage:', error);
        showNotification('Error guardando localmente: ' + error.message, 'error');
        return false;
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
// FORMULARIO DE PROYECTOS - MEJORADO
// ===============================
function initProjectForm() {
    const form = document.getElementById('addProjectForm');
    if (!form) {
        console.error('❌ Formulario addProjectForm no encontrado');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Formulario enviado');
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const projectData = {
            title: formData.get('title')?.trim(),
            description: formData.get('description')?.trim(),
            link: formData.get('link')?.trim(),
            github: formData.get('github')?.trim()
        };
        
        console.log('📋 Datos del formulario:', projectData);
        
        // Validaciones mejoradas
        if (!validateProjectData(projectData)) {
            return; // validateProjectData ya muestra el error
        }
        
        // Deshabilitar botón mientras se guarda
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        try {
            // Intentar guardar
            const success = await saveProject(projectData);
            
            if (success) {
                console.log('🎉 Proyecto guardado exitosamente');
            } else {
                console.log('❌ No se pudo guardar el proyecto');
            }
        } catch (error) {
            console.error('💥 Error en el envío:', error);
            showNotification('Error inesperado: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function validateProjectData(projectData) {
    // Validar título
    if (!projectData.title || projectData.title.length < 3) {
        showNotification('El título debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    // Validar descripción
    if (!projectData.description || projectData.description.length < 10) {
        showNotification('La descripción debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    // Validar URLs
    if (!isValidUrl(projectData.link)) {
        showNotification('La URL del proyecto no es válida', 'error');
        return false;
    }
    
    if (!isValidUrl(projectData.github)) {
        showNotification('La URL de GitHub no es válida', 'error');
        return false;
    }
    
    // Validar imagen
    if (!selectedImageBase64) {
        showNotification('Debe seleccionar una imagen para el proyecto', 'error');
        return false;
    }
    
    // Validar tecnologías
    if (techStack.length === 0) {
        showNotification('Debe agregar al menos una tecnología', 'error');
        return false;
    }
    
    return true;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function clearProjectForm() {
    const form = document.getElementById('addProjectForm');
    if (form) {
        form.reset();
    }
    
    // Limpiar variables globales
    techStack = [];
    selectedImageBase64 = null;
    
    // Limpiar UI
    updateTechDisplay();
    clearImagePreview();
    
    console.log('🧹 Formulario limpiado');
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
// GESTIÓN DE CONFIGURACIÓN - MEJORADA
// ===============================
async function saveConfiguration() {
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
    
    // Configurar Supabase si hay credenciales nuevas
    if (config.supabaseUrl && config.supabaseKey) {
        try {
            // Crear nuevo cliente con las credenciales del formulario
            supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseKey);
            
            // Probar conexión
            const success = await testSupabaseConnection();
            
            if (success) {
                // Guardar configuración de Supabase
                saveConfig('supabaseConfig', {
                    url: config.supabaseUrl,
                    key: config.supabaseKey
                });
                
                showNotification('✅ Configuración de Supabase actualizada correctamente', 'success');
                
                // Recargar proyectos con la nueva conexión
                await loadProjects();
                renderProjects();
                updateStats();
            } else {
                showNotification('❌ Configuración guardada pero hay problemas de conexión', 'warning');
            }
        } catch (error) {
            console.error('Error configurando Supabase:', error);
            showNotification('Error configurando Supabase: ' + error.message, 'error');
        }
    } else {
        showNotification('Configuración general guardada correctamente', 'success');
    }
}

function loadSavedConfiguration() {
    const config = loadConfig('portfolioConfig', {});
    
    // Cargar valores guardados
    if (config.name) document.getElementById('portfolioName').value = config.name;
    if (config.email) document.getElementById('portfolioEmail').value = config.email;
    if (config.phone) document.getElementById('portfolioPhone').value = config.phone;
}

// ===============================
// FUNCIÓN DE TEST MEJORADA
// ===============================
async function testConnection() {
    console.log('🧪 Probando conexión...');
    
    updateConnectionStatus('connecting');
    showLoader();
    
    try {
        // Si no hay cliente, intentar inicializar
        if (!supabaseClient) {
            await initSupabaseWithCredentials();
        }
        
        // Probar conexión
        const success = await testSupabaseConnection();
        
        if (success) {
            await loadProjectsFromSupabase();
            renderProjects();
            updateStats();
        }
        
        return success;
        
    } catch (error) {
        console.error('Error en test:', error);
        showNotification('Error inesperado en el test', 'error');
        return false;
    } finally {
        hideLoader();
    }
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
    
    // Actualizar otras estadísticas si están disponibles
    const totalViews = document.getElementById('totalViews');
    if (totalViews) {
        const views = projects.reduce((sum, project) => sum + (project.views || 0), 0);
        totalViews.textContent = views.toLocaleString();
    }
}

// ===============================
// FUNCIONES DE DEBUG
// ===============================
async function debugSupabaseConnection() {
    console.log('🔍 DEBUGGEANDO CONEXIÓN SUPABASE');
    console.log('================================');
    
    if (!supabaseClient) {
        console.error('❌ supabaseClient no inicializado');
        return false;
    }
    
    try {
        // Test 1: Verificar que la tabla existe
        console.log('🧪 Test 1: Verificando tabla projects...');
        const { data: tableTest, error: tableError } = await supabaseClient
            .from('projects')
            .select('count')
            .limit(1);
        
        if (tableError) {
            console.error('❌ Error accediendo a la tabla:', tableError);
            return false;
        }
        
        console.log('✅ Tabla projects accesible');
        
        // Test 2: Intentar insertar un proyecto de prueba
        console.log('🧪 Test 2: Insertando proyecto de prueba...');
        const testProject = {
            title: 'Test Project DEBUG',
            description: 'Este es un proyecto de prueba para verificar la conexión',
            image: 'data:image/png;base64,test',
            link: 'https://test.com',
            github: 'https://github.com/test',
            technologies: ['Test', 'Debug']
        };
        
        const { data: insertData, error: insertError } = await supabaseClient
            .from('projects')
            .insert([testProject])
            .select();
        
        if (insertError) {
            console.error('❌ Error insertando proyecto de prueba:', insertError);
            return false;
        }
        
        console.log('✅ Proyecto de prueba insertado:', insertData[0]);
        
        // Limpiar - eliminar el proyecto de prueba
        if (insertData[0]?.id) {
            await supabaseClient
                .from('projects')
                .delete()
                .eq('id', insertData[0].id);
            console.log('🧹 Proyecto de prueba eliminado');
        }
        
        console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
        return true;
        
    } catch (error) {
        console.error('💥 Error en debug:', error);
        return false;
    }
}

// Función de prueba rápida para saveProject
async function testSaveProject() {
    console.log('🧪 Probando función saveProject...');
    
    // Configurar datos de prueba
    selectedImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    techStack = ['Test', 'Debug'];
    
    const testData = {
        title: 'Proyecto de Prueba Console',
        description: 'Este es un proyecto de prueba ejecutado desde la consola del navegador para verificar que saveProject funciona correctamente',
        link: 'https://test-console.vercel.app',
        github: 'https://github.com/test/console-project'
    };
    
    try {
        const result = await saveProject(testData);
        if (result) {
            console.log('✅ Test de saveProject exitoso');
        } else {
            console.log('❌ Test de saveProject falló');
        }
        return result;
    } catch (error) {
        console.error('💥 Error en test de saveProject:', error);
        return false;
    }
}

// Función para mostrar credenciales actuales
function showCurrentCredentials() {
    console.log('\n🔑 Credenciales actuales:');
    console.log('========================');
    
    const config = JSON.parse(localStorage.getItem('supabaseConfig') || '{}');
    
    if (config.url) {
        console.log('🌐 URL:', config.url);
    } else {
        console.log('❌ No hay URL guardada');
    }
    
    if (config.key) {
        console.log('🔑 Key:', config.key.substring(0, 20) + '...');
    } else {
        console.log('❌ No hay key guardada');
    }
    
    console.log('🤖 Cliente actual:', !!supabaseClient ? 'Inicializado' : 'No inicializado');
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

// Funciones de debug para consola
window.debugSupabaseConnection = debugSupabaseConnection;
window.testSaveProject = testSaveProject;
window.showCurrentCredentials = showCurrentCredentials;

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', initAdmin);

// ===============================
// INFORMACIÓN DE DEBUG AUTOMÁTICA
// ===============================
console.log('🛠️ ADMIN.JS CARGADO CON SUPABASE');
console.log('=================================');
console.log('📋 Comandos de debug disponibles:');
console.log('• debugSupabaseConnection() - Debug completo de conexión');
console.log('• testSaveProject() - Probar guardar proyecto');
console.log('• showCurrentCredentials() - Ver credenciales actuales');
console.log('• testConnection() - Probar conexión manual');
console.log('• loadProjects() - Recargar proyectos');

// Auto-verificación después de cargar
setTimeout(() => {
    if (typeof supabase !== 'undefined') {
        console.log('✅ Librería Supabase cargada correctamente');
    } else {
        console.error('❌ Librería Supabase NO cargada');
        console.log('💡 Verifica que tengas: <script src="https://unpkg.com/@supabase/supabase-js@2"></script>');
    }
}, 1000);