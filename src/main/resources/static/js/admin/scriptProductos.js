let editId = null;

async function cargarProductos() {
    const tbody = document.querySelector("#productos table tbody");
    tbody.innerHTML = `
        <tr><td colspan="7" class="text-center py-4">Cargando...</td></tr>
    `;

    const res = await fetch("/api/productos");
    const productos = await res.json();

    let html = "";

    productos.forEach(prod => {
        let stockColor = "text-green-600";
        if (prod.stock <= 5) stockColor = "text-red-600";
        else if (prod.stock <= 15) stockColor = "text-yellow-600";

        html += `
            <tr class="border-b border-gray-200">
                <td class="py-4 px-4">${prod.id}</td>

                <td class="py-4 px-4">
                    <img src="http://localhost:8080/imagenesProductos/${prod.urlImagen}"
                         class="w-14 h-14 object-cover rounded-lg shadow">
                </td>

                <td class="py-4 px-4 font-semibold">${prod.nombre}</td>
                <td class="py-4 px-4">${prod.categoria}</td>

                <td class="py-4 px-4">S/ ${Number(prod.precio).toFixed(2)}</td>

                <td class="py-4 px-4 font-bold ${stockColor}">
                    ${prod.stock}
                </td>

                <td class="py-4 px-4 flex gap-4">
                    <button onclick="editarProducto(${prod.id})"
                        class="text-cyan-500 hover:text-cyan-700">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button onclick="eliminarProducto(${prod.id})"
                        class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

cargarProductos();

async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    await fetch(`/api/productos/${id}`, { method: "DELETE" });

    showToast("success", "Producto Eliminado", "Se eliminó correctamente.");
    cargarProductos();
}

function abrirModalNuevoProducto() {
    editId = null;

    document.getElementById("modalTituloProducto").textContent = "Nuevo Producto";

    document.getElementById("productoNombre").value = "";
    document.getElementById("productoCategoria").value = "";
    document.getElementById("productoPrecio").value = "";
    document.getElementById("productoStock").value = "";
    document.getElementById("productoImagen").value = "";
    document.getElementById("productoImagenPreview").src =
        "https://via.placeholder.com/300x300?text=Producto";

    mostrarModalProducto();
}

async function editarProducto(id) {
    editId = id;

    const res = await fetch(`/api/productos/${id}`);
    const prod = await res.json();

    document.getElementById("modalTituloProducto").textContent = "Editar Producto";

    document.getElementById("productoNombre").value = prod.nombre;
    document.getElementById("productoCategoria").value = prod.categoria;
    document.getElementById("productoPrecio").value = prod.precio;
    document.getElementById("productoStock").value = prod.stock;

    document.getElementById("productoImagenPreview").src =
        `http://localhost:8080/imagenesProductos/${prod.urlImagen}`;

    mostrarModalProducto();
}

async function guardarProducto() {
    if (!nombre) {
        showToast("error", "Campo requerido", "El nombre del producto es obligatorio");
        return;
    }

    if (nombre.length < 3) {
        showToast("warning", "Nombre muy corto", "El nombre debe tener al menos 3 caracteres");
        return;
    }

    if (!categoria) {
        showToast("error", "Campo requerido", "La categoría es obligatoria");
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        showToast("error", "Precio inválido", "El precio debe ser mayor a 0");
        return;
    }

    if (precio > 10000) {
        showToast("warning", "Precio elevado", "Verifique el precio ingresado (máx. S/. 10,000)");
        return;
    }

    if (isNaN(stock) || stock < 0) {
        showToast("error", "Stock inválido", "El stock debe ser mayor o igual a 0");
        return;
    }

    if (stock > 9999) {
        showToast("warning", "Stock elevado", "El stock no puede superar 9,999 unidades");
        return;
    }

    if (!editId && !file) {
        showToast("warning", "Imagen requerida", "Debe seleccionar una imagen para el producto");
        return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
        showToast("error", "Archivo muy grande", "La imagen no debe superar los 5 MB");
        return;
    }

    if (file && !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        showToast("error", "Formato inválido", "Solo se permiten imágenes JPG, JPEG o PNG");
        return;
    }

    const producto = {
        nombre: document.getElementById("productoNombre").value.toUpperCase(),
        categoria: document.getElementById("productoCategoria").value.toUpperCase(),
        precio: document.getElementById("productoPrecio").value,
        stock: document.getElementById("productoStock").value,
        activo: true
    };

    const formData = new FormData();
    formData.append("producto", new Blob([JSON.stringify(producto)], { type: "application/json" }));

    const file = document.getElementById("productoImagen").files[0];
    if (file) formData.append("imagen", file);

    let url = "/api/productos/con-imagen";
    let method = "POST";

    if (editId) {
        url = `/api/productos/${editId}/con-imagen`;
        method = "PUT";
    }

    const res = await fetch(url, { method, body: formData });

    if (res.ok) {
        showToast("success", "Cambios Guardados", "El producto se guardó correctamente.");
        cerrarModalProducto();
        cargarProductos();
    } else {
        showToast("error", "Error", "No se pudo guardar el producto.");
    }
}

document.getElementById("productoImagen").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        document.getElementById("productoImagenPreview").src = URL.createObjectURL(file);
    }
});

function mostrarModalProducto() {
    document.getElementById("modalProducto").classList.remove("hidden");
}

function cerrarModalProducto() {
    document.getElementById("modalProducto").classList.add("hidden");
}

function exportarExcel() {
    window.open("http://localhost:3003/exportar/excel", "_blank");
}
