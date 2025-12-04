// ========================
// BUSCAR DNI
// ========================
async function buscarPorDNI() {
    const dni = document.getElementById('dni').value.trim();

    if (dni.length !== 8) {
        showToast('warning', 'DNI inválido', 'El DNI debe tener 8 dígitos');
        return;
    }

    try {
        // API CONSULTA DNI
        const response = await fetch(`http://localhost:3002/dni/${dni}`);

        if (!response.ok) throw new Error("DNI no encontrado");

        const data = await response.json();

        document.getElementById('nombre').value = data.first_name || '';
        document.getElementById('apellido').value =
            `${data.first_last_name || ''} ${data.second_last_name || ''}`.trim();

        showToast('success', 'DNI encontrado', 'Datos cargados correctamente');

    } catch (error) {
        console.error('Error DNI:', error);
        showToast('error', 'DNI no válido', 'No se encontraron datos del DNI');
    }
}

// ========================
// SOLO NÚMEROS EN TELÉFONO
// ========================
document.getElementById('telefono')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
});


// ===================================
// REGISTRO CLIENTE + USUARIO
// ===================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dni = document.getElementById('dni').value.trim();
    const nombre = document.getElementById('nombre').value.trim().toUpperCase();
    const apellido = document.getElementById('apellido').value.trim().toUpperCase();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim().toLowerCase();

    // =====================
    // VALIDACIONES
    // =====================
    if (dni.length !== 8) {
        showToast('warning', 'DNI inválido', 'Debe tener 8 dígitos');
        return;
    }

    if (telefono.length !== 9) {
        showToast('warning', 'Teléfono inválido', 'Debe tener 9 dígitos');
        return;
    }

    if (!correo.includes('@')) {
        showToast('warning', 'Correo inválido', 'Correo electrónico incorrecto');
        return;
    }

    // =====================
    // CREAR CLIENTE
    // =====================
    let clienteCreado = null;

    try {
        const cliente = {
            dni,
            nombre,
            apellido,
            telefono,
            activo: true
        };

        const respCliente = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        if (!respCliente.ok)
            throw new Error("Error creando cliente");

        clienteCreado = await respCliente.json();

    } catch (error) {
        console.error("ERROR CLIENTE:", error);
        showToast('error', 'Registro fallido', 'No se pudo crear el cliente');
        return;
    }


    // =====================
    // CREAR USUARIO
    // =====================
    try {
        const usuario = {
            correoElectronico: correo,
            password: '123456',
            rol: 'CLIENTE',
            activo: true,

            cliente: {
                id: clienteCreado.id
            }
        };

        const respUsuario = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });

        if (!respUsuario.ok)
            throw new Error("Error creando usuario");

        showToast('success', 'Registro exitoso', 'Tu cuenta fue creada correctamente');

        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);

    } catch (error) {
        console.error("ERROR USUARIO:", error);
        showToast('error', 'Registro fallido', 'No se pudo crear el usuario');
    }

});
