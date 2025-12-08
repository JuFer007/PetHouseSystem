const SistemaAutenticacion = {
    usuario: null,
    verificado: false,
    verificando: false,

    async verificarSesion() {
        if (this.verificando) {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (!this.verificando) {
                        clearInterval(interval);
                        resolve(this.usuario);
                    }
                }, 100);
            });
        }

        if (this.verificado) {
            return this.usuario;
        }

        this.verificando = true;

        try {
            const response = await fetch('/api/usuarios/session', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const usuario = await response.json();

                if (usuario.rol === 'CLIENTE' && usuario.cliente) {
                    this.usuario = usuario;
                    this.verificado = true;
                    this.guardarEnStorage(usuario);
                    this.actualizarUI(true);
                    
                    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
                        if (window.location.hash !== '#perfil') {
                            window.location.hash = '#perfil';
                        }
                    }
                    
                    return usuario;
                }
            }

            this.limpiarSesion();
            this.actualizarUI(false);
            return null;

        } catch (error) {
            console.error('Error verificando sesión:', error);
            this.limpiarSesion();
            this.actualizarUI(false);
            return null;
        } finally {
            this.verificando = false;
        }
    },

    guardarEnStorage(usuario) {
        localStorage.setItem('clienteId', usuario.cliente.id);
        localStorage.setItem('usuario', JSON.stringify(usuario));
    },

    limpiarSesion() {
        this.usuario = null;
        this.verificado = false;
        localStorage.removeItem('clienteId');
        localStorage.removeItem('clienteData');
        localStorage.removeItem('usuario');
    },

    actualizarUI(logueado) {
        const btnLogin = document.getElementById('btnUsuarioNav');
        const btnLoginMobile = document.getElementById('btnUsuarioNavMobile');
        const navPerfil = document.getElementById('navPerfil');
        const navPerfilMobile = document.getElementById('navPerfilMobile');
        const btnCerrar = document.getElementById('btnCerrarSesion');
        const btnCerrarMobile = document.getElementById('btnCerrarSesionMobile');

        if (logueado) {
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnLoginMobile) btnLoginMobile.style.display = 'none';
            if (navPerfil) navPerfil.style.display = 'block';
            if (navPerfilMobile) navPerfilMobile.style.display = 'block';
            if (btnCerrar) btnCerrar.style.display = 'block';
            if (btnCerrarMobile) btnCerrarMobile.style.display = 'block';
        } else {
            if (btnLogin) {
                btnLogin.style.display = 'block';
                btnLogin.onclick = () => window.location.href = '/login';
            }
            if (btnLoginMobile) {
                btnLoginMobile.style.display = 'block';
                btnLoginMobile.onclick = () => window.location.href = '/login';
            }
            if (navPerfil) navPerfil.style.display = 'none';
            if (navPerfilMobile) navPerfilMobile.style.display = 'none';
            if (btnCerrar) btnCerrar.style.display = 'none';
            if (btnCerrarMobile) btnCerrarMobile.style.display = 'none';
        }
    },

    async cerrarSesion() {
        try {
            await fetch('/api/usuarios/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error cerrando sesión:', error);
        } finally {
            this.limpiarSesion();
            this.actualizarUI(false);
            window.location.href = '/';
        }
    },

    obtenerUsuario() {
        return this.usuario;
    },

    tieneSesion() {
        return this.verificado && this.usuario !== null;
    }
};

window.SistemaAutenticacion = SistemaAutenticacion;

document.addEventListener('DOMContentLoaded', () => {
    SistemaAutenticacion.verificarSesion();
});
