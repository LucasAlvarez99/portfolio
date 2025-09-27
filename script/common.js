// ===============================
// FUNCIONES COMUNES PARA TODAS LAS PÁGINAS
// ===============================

// ===============================
// GESTIÓN DE TEMA
// ===============================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (!themeToggle) return;

    // Cargar tema guardado
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
// SISTEMA DE NOTIFICACIONES
// ===============================
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);

    // Remover después del tiempo especificado
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===============================
// VALIDACIONES COMUNES
// ===============================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateRequired(value, fieldName) {
    if (!value || value.trim().length === 0) {
        showNotification(`${fieldName} es requerido`, 'error');
        return false;
    }
    return true;
}

function validateMinLength(value, minLength, fieldName) {
    if (value.length < minLength) {
        showNotification(`${fieldName} debe tener al menos ${minLength} caracteres`, 'error');
        return false;
    }
    return true;
}

// ===============================
// GESTIÓN DE SESIÓN
// ===============================
function checkSession() {
    const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
    return sessionData.isLoggedIn && Date.now() < sessionData.expiresAt;
}

function createSession(duration = 2 * 60 * 60 * 1000) { // 2 horas por defecto
    const sessionData = {
        isLoggedIn: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration
    };
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
}

function destroySession() {
    localStorage.removeItem('adminSession');
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function redirectToAdmin() {
    window.location.href = 'admin.html';
}

// ===============================
// UTILIDADES DE ARCHIVO
// ===============================
function validateImageFile(file) {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona un archivo de imagen válido', 'error');
        return false;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('La imagen es demasiado grande. Máximo 5MB', 'error');
        return false;
    }

    return true;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===============================
// UTILIDADES DE DOM
// ===============================
function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

function toggleElement(element, show = null) {
    if (!element) return;
    
    if (show === null) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    } else {
        element.style.display = show ? 'block' : 'none';
    }
}

// ===============================
// DEBOUNCE Y THROTTLE
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
// UTILIDADES DE FECHA
// ===============================
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `${minutes} minutos`;
    if (hours < 24) return `${hours} horas`;
    return `${days} días`;
}

// ===============================
// GESTIÓN DE CONFIGURACIÓN
// ===============================
function saveConfig(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error guardando configuración:', error);
        showNotification('Error al guardar configuración', 'error');
        return false;
    }
}

function loadConfig(key, defaultValue = null) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        console.error('Error cargando configuración:', error);
        return defaultValue;
    }
}

// ===============================
// ANIMACIONES Y EFECTOS
// ===============================
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// CSS para el efecto ripple
if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
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
// NAVEGACIÓN SUAVE
// ===============================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
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
// LOADER GLOBAL
// ===============================
function showLoader() {
    let loader = document.querySelector('.loader');
    if (!loader) {
        loader = createElement('div', 'loader', `
            <div class="loader-content">
                <div class="loader-logo">LA</div>
                <p>Cargando...</p>
            </div>
        `);
        document.body.appendChild(loader);
    }
    loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
}

// ===============================
// INICIALIZACIÓN COMÚN
// ===============================
function initCommon() {
    // Inicializar tema
    initThemeToggle();
    
    // Inicializar navegación suave
    initSmoothScrolling();
    
    // Agregar efectos ripple a botones
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            addRippleEffect(this, e);
        });
    });
    
    console.log('✅ Common.js inicializado correctamente');
}

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    initCommon();
}

// ===============================
// EXPORTAR FUNCIONES GLOBALES
// ===============================
window.CommonUtils = {
    showNotification,
    validateEmail,
    validateUrl,
    validateRequired,
    validateMinLength,
    checkSession,
    createSession,
    destroySession,
    redirectToLogin,
    redirectToAdmin,
    validateImageFile,
    fileToBase64,
    createElement,
    clearElement,
    toggleElement,
    debounce,
    throttle,
    formatDate,
    timeAgo,
    saveConfig,
    loadConfig,
    addRippleEffect,
    showLoader,
    hideLoader
};