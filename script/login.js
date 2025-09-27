// ===============================
// LÓGICA ESPECÍFICA DE LOGIN
// ===============================

// Configuración del login
const LOGIN_CONFIG = {
    defaultUsername: 'admin',
    defaultPassword: 'admin123',
    maxAttempts: 3,
    lockoutTime: 5 * 60 * 1000, // 5 minutos
    sessionDuration: 2 * 60 * 60 * 1000 // 2 horas
};

// Variables de estado
let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
let lastFailedAttempt = parseInt(localStorage.getItem('lastFailedAttempt') || '0');
let isLockedOut = false;

// ===============================
// INICIALIZACIÓN
// ===============================
function initLogin() {
    console.log('🔐 Inicializando sistema de login...');
    
    // Verificar si ya tiene sesión activa
    if (checkSession()) {
        showNotification('Ya tienes una sesión activa', 'success');
        setTimeout(() => redirectToAdmin(), 1000);
        return;
    }

    // Inicializar componentes
    initLoginForm();
    initPasswordToggle();
    initForgotPassword();
    checkLockoutStatus();
    
    console.log('✅ Login inicializado correctamente');
}

// ===============================
// FORMULARIO DE LOGIN
// ===============================
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isLockedOut) {
            showNotification('Cuenta bloqueada temporalmente. Intenta más tarde.', 'error');
            return;
        }

        const formData = new FormData(loginForm);
        const username = formData.get('username')?.trim();
        const password = formData.get('password');

        // Validaciones básicas
        if (!validateRequired(username, 'Usuario') || !validateRequired(password, 'Contraseña')) {
            return;
        }

        await handleLogin(username, password);
    });
}

async function handleLogin(username, password) {
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Mostrar loading
    setLoadingState(true);

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // Verificar credenciales
        if (await validateCredentials(username, password)) {
            handleSuccessfulLogin();
        } else {
            handleFailedLogin();
        }
    } catch (error) {
        console.error('Error en login:', error);
        showNotification('Error interno del servidor', 'error');
    } finally {
        setLoadingState(false);
    }
}

async function validateCredentials(username, password) {
    // Obtener credenciales guardadas o usar las por defecto
    const savedCredentials = loadConfig('adminCredentials', {});
    const validUsername = savedCredentials.username || LOGIN_CONFIG.defaultUsername;
    const validPassword = savedCredentials.password || LOGIN_CONFIG.defaultPassword;

    return username === validUsername && password === validPassword;
}

function handleSuccessfulLogin() {
    // Limpiar intentos fallidos
    loginAttempts = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastFailedAttempt');

    // Crear sesión
    createSession(LOGIN_CONFIG.sessionDuration);

    // Mostrar mensaje de éxito
    showNotification('Inicio de sesión exitoso', 'success');
    
    // Redirigir
    setTimeout(() => redirectToAdmin(), 1000);
}

function handleFailedLogin() {
    loginAttempts++;
    localStorage.setItem('loginAttempts', loginAttempts.toString());
    localStorage.setItem('lastFailedAttempt', Date.now().toString());

    const attemptsLeft = LOGIN_CONFIG.maxAttempts - loginAttempts;
    
    if (attemptsLeft <= 0) {
        activateLockout();
        showNotification(`Demasiados intentos fallidos. Cuenta bloqueada por ${LOGIN_CONFIG.lockoutTime / 60000} minutos.`, 'error');
    } else {
        showNotification(`Credenciales incorrectas. Te quedan ${attemptsLeft} intentos.`, 'error');
        updateAttemptsDisplay(attemptsLeft);
        
        // Efecto shake
        document.querySelector('.login-container').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.login-container').classList.remove('shake');
        }, 500);
    }
}

// ===============================
// GESTIÓN DE BLOQUEOS
// ===============================
function activateLockout() {
    isLockedOut = true;
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-lock"></i> Cuenta Bloqueada';
    }
    
    // Desbloquear después del tiempo configurado
    setTimeout(() => {
        deactivateLockout();
    }, LOGIN_CONFIG.lockoutTime);
}

function deactivateLockout() {
    isLockedOut = false;
    loginAttempts = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastFailedAttempt');
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Iniciar Sesión';
    }
    
    hideMessages();
    updateAttemptsDisplay(LOGIN_CONFIG.maxAttempts);
}

function checkLockoutStatus() {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastFailedAttempt;
    
    if (loginAttempts >= LOGIN_CONFIG.maxAttempts && timeSinceLastAttempt < LOGIN_CONFIG.lockoutTime) {
        activateLockout();
        
        // Countdown timer
        const updateTimer = () => {
            const remaining = Math.ceil((LOGIN_CONFIG.lockoutTime - (Date.now() - lastFailedAttempt)) / 1000);
            if (remaining > 0) {
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                showError(`Cuenta bloqueada. Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`);
                setTimeout(updateTimer, 1000);
            } else {
                deactivateLockout();
            }
        };
        updateTimer();
    } else if (loginAttempts > 0) {
        updateAttemptsDisplay(LOGIN_CONFIG.maxAttempts - loginAttempts);
    }
}

// ===============================
// TOGGLE DE CONTRASEÑA
// ===============================
function initPasswordToggle() {
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordField = document.getElementById('password');
    
    if (!passwordToggle || !passwordField) return;
    
    passwordToggle.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Cambiar icono
        passwordToggle.classList.toggle('fa-eye');
        passwordToggle.classList.toggle('fa-eye-slash');
    });
}

// ===============================
// FORGOT PASSWORD
// ===============================
function initForgotPassword() {
    const forgotPassword = document.getElementById('forgotPassword');
    
    if (!forgotPassword) return;
    
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        handleForgotPassword();
    });
}

function handleForgotPassword() {
    const newPassword = prompt('¿Cuál quieres que sea la nueva contraseña?\n(Mínimo 6 caracteres)');
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    // Guardar nueva contraseña
    const credentials = {
        username: LOGIN_CONFIG.defaultUsername,
        password: newPassword
    };
    
    saveConfig('adminCredentials', credentials);
    showNotification('Contraseña actualizada correctamente', 'success');
}

// ===============================
// UTILIDADES DE UI
// ===============================
function setLoadingState(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!loginBtn || !loadingSpinner) return;
    
    loginBtn.disabled = loading;
    loadingSpinner.classList.toggle('show', loading);
}

function showError(message) {
    hideMessages();
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
    } else {
        showNotification(message, 'error');
    }
}

function showSuccess(message) {
    hideMessages();
    const successMessage = document.getElementById('successMessage');
    
    if (successMessage) {
        successMessage.querySelector('span').textContent = message;
        successMessage.classList.add('show');
    } else {
        showNotification(message, 'success');
    }
}

function hideMessages() {
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (errorMessage) errorMessage.classList.remove('show');
    if (successMessage) successMessage.classList.remove('show');
}

function updateAttemptsDisplay(attemptsLeft) {
    const loginAttempts = document.getElementById('loginAttempts');
    const attemptsCount = document.getElementById('attemptsCount');
    
    if (!loginAttempts || !attemptsCount) return;
    
    if (attemptsLeft < LOGIN_CONFIG.maxAttempts) {
        attemptsCount.textContent = attemptsLeft;
        loginAttempts.classList.add('show');
    } else {
        loginAttempts.classList.remove('show');
    }
}

// ===============================
// AUTO-INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', initLogin);