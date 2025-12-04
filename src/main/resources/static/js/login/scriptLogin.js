function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correoElectronico = document.getElementById('correoElectronico').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('/api/usuarios/inicioSesion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correoElectronico,
                password
            })
        });

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        if (!response.ok) {
            showToast('error', data.message || 'Error al iniciar sesión');
            return;
        }

        localStorage.setItem('usuario', JSON.stringify(data));

        showToast('success', 'Inicio de sesión exitoso', 'Bienvenido(a)');

        setTimeout(() => {

            if (data.rol === 'CLIENTE') {
                window.location.href = '/';

            } else {
                window.location.href = '/dashboard';
            }

        }, 800);

    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error de conexión. Intente nuevamente.');
    }
});


function loginWithGmail() {
    showToast('info', 'Función de Gmail en desarrollo');
}

function loginWithOutlook() {
    showToast('info', 'Función de Outlook en desarrollo');
}
