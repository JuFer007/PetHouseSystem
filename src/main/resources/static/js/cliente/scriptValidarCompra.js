// Verificar sesión del cliente antes de agregar al carrito
async function verificarSesionCliente() {
    try {
        const response = await fetch('/api/usuarios/session', {
            method: 'GET',
            credentials: 'include'
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}

// Sobrescribir función addToCart para validar sesión
const addToCartOriginal = window.addToCart;

window.addToCart = async function(productoId, nombre, precio, stock, urlImagen) {
    const tieneSesion = await verificarSesionCliente();

    if (!tieneSesion) {
        showToast('warning', 'Inicia sesión', 'Debes iniciar sesión para comprar productos');
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
        showToast('warning', 'Inicia sesión', 'Debes iniciar sesión para completar la compra');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    checkoutOriginal();
};

// Actualizar navbar si hay sesión
async function actualizarNavbar() {
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
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Ejecutar al cargar página
document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbar();
});
