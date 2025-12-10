let editId = null;

async function cargarProductos() {
    const tbody = document.querySelector("#productos table tbody");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Cargando...</td></tr>`;

    const res = await fetch("/api/productos");
    const productos = await res.json();

    let html = "";

    productos.forEach(prod => {

        let stockColor = "text-green-600";
        if (prod.stock <= 5) stockColor = "text-red-600";
        else if (prod.stock <= 15) stockColor = "text-yellow-600";

        html += `
            <tr class="border-b border-gray-200 ${!prod.activo ? 'opacity-40' : ''}">
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

                <td class="py-4 px-4 flex gap-4 justify-center items-center">
                    <button onclick="editarProducto(${prod.id})"
                        class="text-cyan-500 hover:text-cyan-700">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button onclick="cambiarEstadoProducto(${prod.id})"
                        class="${prod.activo ? 'text-green-500' : 'text-red-500'} hover:opacity-80">
                        <i class="fas ${prod.activo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

cargarProductos();

async function cambiarEstadoProducto(id) {

    if (!confirm("¿Cambiar estado del producto?")) return;

    const res = await fetch(`/api/productos/${id}/cambiar-estado`, { method: "PUT" });

    if (res.ok) {
        showToast("success", "Estado modificado", "El producto cambió de estado.");
        cargarProductos();
    } else {
        showToast("error", "Error", "No se pudo modificar el estado.");
    }
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

    const nombre = document.getElementById("productoNombre").value.trim();
    const categoria = document.getElementById("productoCategoria").value.trim();
    const precio = parseFloat(document.getElementById("productoPrecio").value);
    const stock = parseInt(document.getElementById("productoStock").value);
    const file = document.getElementById("productoImagen").files[0];

    if (!nombre || nombre.length < 3) return showToast("error","Nombre inválido","Mínimo 3 caracteres");
    if (!categoria) return showToast("error","Campo requerido","Seleccione categoría");
    if (isNaN(precio) || precio <= 0) return showToast("error","Precio inválido","Debe ser mayor a 0");
    if (isNaN(stock) || stock < 0) return showToast("error","Stock inválido","Debe ser >= 0");

    if (!editId && !file) return showToast("warning","Imagen requerida","Seleccione imagen");

    const producto = {
        nombre: nombre.toUpperCase(),
        categoria: categoria.toUpperCase(),
        precio,
        stock,
        activo: true
    };

    const formData = new FormData();
    formData.append("producto", new Blob([JSON.stringify(producto)], { type:"application/json" }));
    if (file) formData.append("imagen", file);

    let url = "/api/productos/con-imagen";
    let method = "POST";

    if (editId){
        url = `/api/productos/${editId}/con-imagen`;
        method = "PUT";
    }

    const res = await fetch(url,{method, body:formData});

    if (res.ok){
        showToast("success","Guardado","Producto guardado correctamente");
        cerrarModalProducto();
        cargarProductos();
    } else {
        showToast("error","Error","No se pudo guardar");
    }
}

document.getElementById("productoImagen").addEventListener("change",function(){
    const file = this.files[0];
    if (file) document.getElementById("productoImagenPreview").src = URL.createObjectURL(file);
});

function mostrarModalProducto(){
    document.getElementById("modalProducto").classList.remove("hidden");
}

function cerrarModalProducto(){
    document.getElementById("modalProducto").classList.add("hidden");
}

async function productoExiste(nombre,idActual=null){
    try{
        const res = await fetch(`/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`);
        if(!res.ok) return false;
        const productos = await res.json();

        if(idActual){
            return productos.some(p=>p.nombre.toUpperCase()===nombre.toUpperCase() && p.id!==idActual);
        }

        return productos.some(p=>p.nombre.toUpperCase()===nombre.toUpperCase());
    }catch{
        return false;
    }
}
