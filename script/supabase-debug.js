// ===============================
// DEBUG ESPECÍFICO PARA SUPABASE
// ===============================

console.log('🔍 INICIANDO DEBUG DE SUPABASE');
console.log('==============================');

// 1. VERIFICAR CLIENTE SUPABASE
function checkSupabaseClient() {
    console.log('🔌 Verificando cliente Supabase...');
    
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library no cargada');
        console.log('💡 Verifica que tengas: <script src="https://unpkg.com/@supabase/supabase-js@2"></script>');
        return false;
    }
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error('❌ supabaseClient no inicializado');
        console.log('💡 Ejecuta: initSupabase()');
        return false;
    }
    
    console.log('✅ Cliente Supabase OK:', supabaseClient);
    return true;
}

// 2. TEST DE CONEXIÓN BÁSICA
async function testBasicConnection() {
    console.log('\n🌐 Probando conexión básica...');
    
    if (!checkSupabaseClient()) return false;
    
    try {
        // Test simple: obtener 1 proyecto
        const { data, error, count } = await supabaseClient
            .from('projects')
            .select('*', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.error('❌ Error de conexión:', error);
            console.log('📋 Detalles:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return false;
        }
        
        console.log('✅ Conexión exitosa');
        console.log('📊 Proyectos existentes:', count);
        console.log('📄 Primer proyecto:', data[0]);
        return true;
        
    } catch (err) {
        console.error('❌ Error inesperado:', err);
        return false;
    }
}

// 3. TEST DE INSERCIÓN
async function testInsertProject() {
    console.log('\n💾 Probando inserción de proyecto...');
    
    if (!checkSupabaseClient()) return false;
    
    // Proyecto de prueba
    const testProject = {
        title: 'Proyecto de Test DEBUG',
        description: 'Este es un proyecto de prueba creado por el script de debug para verificar que la inserción funciona correctamente.',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        link: 'https://test-debug.vercel.app',
        github: 'https://github.com/debug/test-project',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        created_at: new Date().toISOString()
    };
    
    console.log('📝 Datos del proyecto de prueba:', testProject);
    
    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .insert([testProject])
            .select();
        
        if (error) {
            console.error('❌ Error insertando:', error);
            console.log('📋 Detalles completos:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            
            // Sugerencias según el error
            if (error.message.includes('relation "projects" does not exist')) {
                console.log('💡 SOLUCIÓN: La tabla "projects" no existe');
                console.log('   Ve al SQL Editor de Supabase y ejecuta:');
                console.log('   CREATE TABLE projects (...);');
            }
            
            if (error.message.includes('permission denied')) {
                console.log('💡 SOLUCIÓN: Problema de permisos RLS');
                console.log('   Verifica las políticas de Row Level Security');
            }
            
            return false;
        }
        
        console.log('✅ Proyecto insertado exitosamente!');
        console.log('📄 Proyecto creado:', data[0]);
        return data[0];
        
    } catch (err) {
        console.error('❌ Error inesperado insertando:', err);
        return false;
    }
}

// 4. VERIFICAR POLÍTICAS RLS
async function checkRLSPolicies() {
    console.log('\n🔒 Verificando políticas RLS...');
    
    try {
        // Intentar SELECT (lectura)
        const { data: selectData, error: selectError } = await supabaseClient
            .from('projects')
            .select('id, title')
            .limit(1);
        
        if (selectError) {
            console.error('❌ No se puede hacer SELECT:', selectError.message);
        } else {
            console.log('✅ SELECT permitido');
        }
        
        // Intentar INSERT (escritura)
        const testData = {
            title: 'Test RLS',
            description: 'Test',
            image: 'test',
            link: 'https://test.com',
            github: 'https://github.com/test',
            technologies: ['Test']
        };
        
        const { data: insertData, error: insertError } = await supabaseClient
            .from('projects')
            .insert([testData])
            .select();
        
        if (insertError) {
            console.error('❌ No se puede hacer INSERT:', insertError.message);
            
            if (insertError.message.includes('permission denied')) {
                console.log('💡 PROBLEMA: Las políticas RLS no permiten INSERT');
                console.log('   Solución SQL:');
                console.log('   CREATE POLICY "Allow public inserts" ON projects FOR INSERT WITH CHECK (true);');
            }
        } else {
            console.log('✅ INSERT permitido');
            
            // Limpiar - borrar el test
            await supabaseClient.from('projects').delete().eq('id', insertData[0].id);
            console.log('🧹 Test data limpiada');
        }
        
    } catch (err) {
        console.error('❌ Error verificando RLS:', err);
    }
}

// 5. VERIFICAR ESTRUCTURA DE LA TABLA
async function checkTableStructure() {
    console.log('\n🏗️ Verificando estructura de tabla...');
    
    try {
        // Obtener info de la tabla usando una query que falle intencionalmente
        // para ver qué columnas esperaba
        const { data, error } = await supabaseClient
            .from('projects')
            .select('id, title, description, image, link, github, technologies, created_at, updated_at, views')
            .limit(1);
        
        if (error) {
            console.error('❌ Error en estructura:', error.message);
            
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.log('💡 Falta una columna en la tabla');
            }
        } else {
            console.log('✅ Estructura de tabla OK');
            console.log('📊 Columnas disponibles detectadas');
        }
        
    } catch (err) {
        console.error('❌ Error verificando estructura:', err);
    }
}

// 6. FUNCIÓN PRINCIPAL DE DEBUG
async function debugSupabase() {
    console.clear();
    console.log('🔍 DEBUG COMPLETO DE SUPABASE');
    console.log('==============================');
    
    // Paso 1: Verificar cliente
    const clientOK = checkSupabaseClient();
    if (!clientOK) {
        console.log('❌ No se puede continuar sin cliente Supabase');
        return;
    }
    
    // Paso 2: Test conexión
    const connectionOK = await testBasicConnection();
    if (!connectionOK) {
        console.log('❌ No se puede continuar sin conexión');
        return;
    }
    
    // Paso 3: Verificar estructura
    await checkTableStructure();
    
    // Paso 4: Verificar políticas
    await checkRLSPolicies();
    
    // Paso 5: Test inserción
    console.log('\n🧪 PRUEBA FINAL: Insertando proyecto de test...');
    const insertResult = await testInsertProject();
    
    if (insertResult) {
        console.log('\n🎉 ¡TODO FUNCIONA CORRECTAMENTE!');
        console.log('✅ El problema no es de Supabase');
        console.log('💡 Revisa la función saveProject() en tu código');
    } else {
        console.log('\n❌ HAY UN PROBLEMA CON SUPABASE');
        console.log('💡 Revisa los errores específicos arriba');
    }
}

// 7. TEST RÁPIDO DE LA FUNCIÓN saveProject
async function testSaveProjectFunction() {
    console.log('\n🧪 Probando función saveProject...');
    
    // Simular datos del formulario
    const mockProjectData = {
        title: 'Mock Project',
        description: 'Proyecto simulado para testing',
        link: 'https://mock.com',
        github: 'https://github.com/mock/project'
    };
    
    // Simular datos globales
    if (typeof selectedImageBase64 === 'undefined') {
        window.selectedImageBase64 = 'data:image/png;base64,mock-image';
    }
    
    if (typeof techStack === 'undefined') {
        window.techStack = ['React', 'Node.js'];
    }
    
    console.log('📋 Datos simulados preparados');
    console.log('🚀 Ejecutando saveProject...');
    
    if (typeof saveProject === 'function') {
        try {
            await saveProject(mockProjectData);
            console.log('✅ saveProject ejecutado sin errores');
        } catch (err) {
            console.error('❌ Error en saveProject:', err);
        }
    } else {
        console.error('❌ Función saveProject no encontrada');
    }
}

// 8. MOSTRAR CREDENCIALES ACTUALES
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
}

// FUNCIONES GLOBALES
window.debugSupabase = debugSupabase;
window.testInsertProject = testInsertProject;
window.testBasicConnection = testBasicConnection;
window.checkRLSPolicies = checkRLSPolicies;
window.testSaveProjectFunction = testSaveProjectFunction;
window.showCurrentCredentials = showCurrentCredentials;

// AUTO-EJECUCIÓN
console.log('🛠️ SUPABASE DEBUG TOOLS CARGADO');
console.log('=================================');
console.log('📋 Comandos disponibles:');
console.log('• debugSupabase() - Debug completo');
console.log('• testInsertProject() - Test inserción');
console.log('• testBasicConnection() - Test conexión');
console.log('• checkRLSPolicies() - Verificar permisos');
console.log('• testSaveProjectFunction() - Test función saveProject');
console.log('• showCurrentCredentials() - Ver credenciales');

// Ejecutar verificación básica automáticamente
setTimeout(() => {
    console.log('\n🚀 EJECUTANDO VERIFICACIÓN AUTOMÁTICA...');
    checkSupabaseClient();
    showCurrentCredentials();
}, 500);