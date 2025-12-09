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

const addToCartOriginal = window.addToCart;

window.addToCart = async function(productoId, nombre, precio, stock, urlImagen) {
    const tieneSesion = await verificarSesionCliente();

    if (!tieneSesion) {
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    addToCartOriginal(productoId, nombre, precio, stock, urlImagen);
};

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
    if (navbarActualizado) return;

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
            navbarActualizado = true;
        } catch (error) {
            console.log(error);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        actualizarNavbar();
    });
} else {
    actualizarNavbar();
}
