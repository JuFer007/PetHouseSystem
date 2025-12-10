async function buscarPorDNI() {
    const dni = document.getElementById('dni').value.trim();

    if (dni.length !== 8) {
        showToast('warning', 'DNI inválido', 'El DNI debe tener 8 dígitos');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/dni/${dni}`);
        if (!response.ok) throw new Error();

        const data = await response.json();

        document.getElementById('nombre').value = data.first_name || '';
        document.getElementById('apellido').value =
            `${data.first_last_name || ''} ${data.second_last_name || ''}`.trim();

        showToast('success', 'DNI encontrado', 'Datos cargados correctamente');

    } catch {
        showToast('error', 'DNI no válido', 'No se encontraron datos del DNI');
    }
}

document.getElementById('telefono')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dni = document.getElementById('dni').value.trim();
    const nombre = document.getElementById('nombre').value.trim().toUpperCase();
    const apellido = document.getElementById('apellido').value.trim().toUpperCase();
    const telefono = document.getElementById('telefono').value.trim();
    const correo = document.getElementById('correo').value.trim().toLowerCase();

    if (!/^\d{8}$/.test(dni)) {
        showToast('warning','DNI inválido','Debe tener 8 dígitos');
        return;
    }

    if (nombre.length < 2) {
        showToast('warning','Nombre inválido','Debe tener mínimo 2 letras');
        return;
    }

    if (apellido.length < 2) {
        showToast('warning','Apellido inválido','Debe tener mínimo 2 letras');
        return;
    }

    if (!/^\d{9}$/.test(telefono)) {
        showToast('warning','Teléfono inválido','Debe tener 9 dígitos');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        showToast('error','Correo inválido','Formato incorrecto');
        return;
    }

    try {
        const resUsuarios = await fetch('/api/usuarios');
        const usuarios = await resUsuarios.json();

        const correoExiste = usuarios.some(
            u => u.correoElectronico?.toLowerCase() === correo.toLowerCase()
        );

        if (correoExiste) {
            showToast('error','Correo ya registrado','Este correo ya existe');
            return;
        }

    } catch {
        showToast('error','Error','No se pudo validar el correo');
        return;
    }

    try {
        const respDNI = await fetch(`/api/clientes/dni/${dni}`);

        if (respDNI.ok) {
            showToast('error','DNI duplicado','Este DNI ya está registrado');
            return;
        }

    } catch {
        showToast('error','Error','No se pudo validar DNI');
        return;
    }

    let clienteCreado;

    try {
        const cliente = {
            dni,
            nombre,
            apellido,
            telefono,
            activo: true
        };

        const res = await fetch('/api/clientes', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(cliente)
        });

        if (!res.ok) throw new Error();

        clienteCreado = await res.json();

    } catch {
        showToast('error','Error','No se pudo crear cliente');
        return;
    }

    try {
        const usuario = {
            correoElectronico: correo,
            password: '123456',
            rol: 'CLIENTE',
            activo: true,
            cliente: { id: clienteCreado.id }
        };

        const resUser = await fetch('/api/usuarios',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(usuario)
        });

        if(!resUser.ok) throw new Error();

        showToast('success','Registro exitoso','Cuenta creada correctamente');

        setTimeout(()=> {
            window.location.href = '/login';
        },2000);

    } catch {
        showToast('error','Registro fallido','No se pudo crear el usuario');
    }

});
