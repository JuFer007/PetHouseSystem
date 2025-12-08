async function verificarSesionCliente() {
    try {
        const response = await fetch('/api/usuarios/session', {
            method: 'GET',
            credentials: 'include'
        });

        // Retornar true solo si la respuesta es exitosa
        return response.ok;
    } catch (error) {
        // Si hay error, retornar false
        return false;
    }
}

const addToCartOriginal = window.addToCart;

window.addToCart = async function(productoId, nombre, precio, stock, urlImagen) {
    const tieneSesion = await verificarSesionCliente();

    if (!tieneSesion) {
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    // Si tiene sesión, ejecutar función original
    addToCartOriginal(productoId, nombre, precio, stock, urlImagen);
};

// Validar sesión en checkout
const checkoutOriginal = window.checkout;

window.checkout = async function() {
    const tieneSesion = await verificarSesionCliente();

    if (!tieneSesion) {
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    checkoutOriginal();
};

let navbarActualizado = false;

async function actualizarNavbar() {
    if (navbarActualizado) return; // Evitar múltiples ejecuciones

    const tieneSesion = await verificarSesionCliente();

    if (tieneSesion) {
        try {
            const response = await fetch('/api/usuarios/session', { credentials: 'include' });
            const usuario = await response.json();

            if (usuario.rol === 'CLIENTE') {
                // Cambiar botón de login por perfil
                const navButtons = document.querySelector('nav .hidden.md\\:flex');
                if (navButtons) {
                    const loginBtn = navButtons.querySelector('button[onclick*="login"]');
                    if (loginBtn) {
                        loginBtn.onclick = () => window.location.href = '/perfil';
                        loginBtn.title = 'Mi Perfil';
                    }
                }
            }
            navbarActualizado = true; // Marcar como actualizado
        } catch (error) {
            // Ignorar errores
        }
    }
}

// Ejecutar al cargar página solo una vez
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        actualizarNavbar();
    });
} else {
    actualizarNavbar();
}
