// ==================== Mostrar módulo y resaltar sidebar ====================
function showModule(moduleName, event = null) {
    // Ocultar todos los módulos
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => module.classList.remove('active'));

    // Mostrar el módulo seleccionado
    const selectedModule = document.getElementById(moduleName);
    if (selectedModule) selectedModule.classList.add('active');

    // Actualizar header
    const headerTitles = {
        'dashboard': 'Dashboard',
        'citas': 'Citas',
        'servicios': 'Servicios',
        'productos': 'Productos',
        'ventas': 'Ventas',
        'pagos': 'Pagos',
        'trabajadores': 'Trabajadores',
        'clientes': 'Clientes',
        'mascotas': 'Mascotas',
        'catalogo-enfermedades': 'Enfermedades',
        'catalogo-vacunas': 'Vacunas',
        'historia-clinica': 'Historias Clínicas',
        'horarios': 'Horarios',
        'horarioTrabajador': 'Horario Semanal',
        'reportes': 'Reportes'
    };
    document.getElementById('header-title').textContent = headerTitles[moduleName] || 'Módulo';

    // Resaltar sidebar-item activo
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active', 'bg-cyan-500', 'text-white'));

    if (event) {
        event.currentTarget.classList.add('active', 'bg-cyan-500', 'text-white');
    } else {
        const currentItem = Array.from(sidebarItems)
            .find(item => item.getAttribute('onclick')?.includes(moduleName));
        if (currentItem) currentItem.classList.add('active', 'bg-cyan-500', 'text-white');
    }
}

// ==================== Filtrar sidebar según rol ====================
function filtrarSidebarPorRol() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;

    const rol = usuario.rol.trim().toUpperCase();
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        const rolesPermitidos = item.dataset.roles
            ?.split(',')
            .map(r => r.trim().toUpperCase()) || [];

        if (!rolesPermitidos.includes(rol)) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

// ==================== Inicialización ====================
document.addEventListener('DOMContentLoaded', () => {
    // Filtrar items según rol
    filtrarSidebarPorRol();

    // Agregar eventos click a sidebar-items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const onclickValue = item.getAttribute('onclick');
            const moduleName = onclickValue?.match(/showModule\('(.+?)'/)?.[1];
            if (moduleName) showModule(moduleName, e);
        });
    });

    // Mostrar módulo inicial
    showModule('dashboard');
});

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('user-dropdown-toggle');
    const menu = document.getElementById('user-dropdown-menu');

    if (!toggle || !menu) return;

    // Mostrar menú al pasar el mouse
    toggle.addEventListener('mouseenter', () => {
        menu.classList.remove('invisible', 'opacity-0');
        menu.classList.add('visible', 'opacity-100');
    });

    // Ocultar menú al salir del toggle
    toggle.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!menu.matches(':hover')) { // solo si no estás sobre el menú
                menu.classList.add('invisible', 'opacity-0');
                menu.classList.remove('visible', 'opacity-100');
            }
        }, 100);
    });

    // Mantener visible cuando el mouse esté sobre el menú
    menu.addEventListener('mouseenter', () => {
        menu.classList.remove('invisible', 'opacity-0');
        menu.classList.add('visible', 'opacity-100');
    });

    menu.addEventListener('mouseleave', () => {
        menu.classList.add('invisible', 'opacity-0');
        menu.classList.remove('visible', 'opacity-100');
    });
});
