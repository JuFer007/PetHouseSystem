const serviciosContainer = document.getElementById("serviciosGrid");
const apiServiciosUrl = "http://localhost:8080/api/servicios";

let servicioEditId = null;

async function cargarServicios() {
    try {
        const res = await fetch(apiServiciosUrl);
        if (!res.ok) throw new Error("Error al obtener servicios");
        const servicios = await res.json();

        serviciosContainer.innerHTML = "";

        servicios.forEach(servicio => {
            let iconClass = "fas fa-cog text-gray-600 text-xl";
            let bgClass = "bg-gray-100";

            if (servicio.nombre.toLowerCase().includes("baño")) {
                iconClass = "fas fa-water text-blue-600 text-xl";
                bgClass = "bg-blue-100";

            } else if (servicio.nombre.toLowerCase().includes("vacunación")) {
                iconClass = "fas fa-syringe text-purple-600 text-xl";
                bgClass = "bg-purple-100";

            } else if (servicio.nombre.toLowerCase().includes("consulta")) {
                iconClass = "fas fa-stethoscope text-cyan-600 text-xl";
                bgClass = "bg-cyan-100";

            } else if (servicio.nombre.toLowerCase().includes("desparas")) {
                // Desparasitación
                iconClass = "fas fa-bug text-green-600 text-xl";
                bgClass = "bg-green-100";

            } else if (servicio.nombre.toLowerCase().includes("cirugía")) {
                iconClass = "fas fa-scalpel text-red-600 text-xl";
                iconClass = "fas fa-cut text-red-600 text-xl";
                bgClass = "bg-red-100";

            } else if (servicio.nombre.toLowerCase().includes("hospital")) {
                iconClass = "fas fa-hospital text-gray-600 text-xl";
                bgClass = "bg-gray-100";

            } else if (servicio.nombre.toLowerCase().includes("odont")) {
                iconClass = "fas fa-tooth text-yellow-600 text-xl";
                bgClass = "bg-yellow-100";

            } else if (servicio.nombre.toLowerCase().includes("peluquer")) {
                iconClass = "fas fa-cut text-pink-600 text-xl";
                bgClass = "bg-pink-100";

            } else if (servicio.nombre.toLowerCase().includes("emergencia")) {
                iconClass = "fas fa-briefcase-medical text-red-700 text-xl";
                bgClass = "bg-red-200";

            } else if (servicio.nombre.toLowerCase().includes("laboratorio")) {
                iconClass = "fas fa-vials text-indigo-600 text-xl";
                bgClass = "bg-indigo-100";

            } else if (servicio.nombre.toLowerCase().includes("radi")) {
                iconClass = "fas fa-x-ray text-slate-600 text-xl";
                bgClass = "bg-slate-100";

            } else {
                iconClass = "fas fa-paw text-orange-600 text-xl";
                bgClass = "bg-orange-100";
            }

            const card = document.createElement("div");
            card.classList.add("chart-container", "module-card");
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800">${servicio.nombre}</h4>
                        <p class="text-sm text-gray-500">${servicio.descripcion || '-'}</p>
                    </div>
                    <div class="w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center">
                        <i class="${iconClass} text-xl"></i>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2">
                    <span class="text-2xl font-bold text-gray-800">S/. ${servicio.precio.toFixed(2)}</span>

                    <div class="flex gap-2">
                        <!-- Editar -->
                        <button class="btn-secondary" onclick="abrirModalServicio(${servicio.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>

                        <!-- Activar / Desactivar -->
                        <button class="btn-warning" onclick="cambiarEstadoServicio(${servicio.id}, ${servicio.activo})" title="${servicio.activo ? "Desactivar" : "Activar"}">
                            <i class="fas ${servicio.activo ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        </button>

                        <!-- Eliminar -->
                        <button class="btn-danger" onclick="eliminarServicio(${servicio.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;


            serviciosContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudieron cargar los servicios.");
    }
}

function abrirModalServicio(id = null) {
    servicioEditId = id;
    const modal = document.getElementById("modalServicio");
    const titulo = document.getElementById("modalTitulo");
    const nombre = document.getElementById("servicioNombre");
    const descripcion = document.getElementById("servicioDescripcion");
    const precio = document.getElementById("servicioPrecio");
    const imagenInput = document.getElementById("servicioImagen");
    const imagenPreview = document.getElementById("servicioImagenPreview");

    imagenInput.value = "";
    imagenPreview.src = "";

    if (id) {
        // Editar servicio
        fetch(`${apiServiciosUrl}/${id}`)
            .then(res => res.json())
            .then(servicio => {
                nombre.value = servicio.nombre;
                descripcion.value = servicio.descripcion || '';
                precio.value = servicio.precio;
                titulo.textContent = "Editar Servicio";

                if (servicio.imagenUrl) {
                    imagenPreview.src = `http://localhost:8080/imagenesServicios/${servicio.imagenUrl}`;
                } else {
                    imagenPreview.src = "https://via.placeholder.com/250x250?text=Sin+imagen";
                }

                modal.classList.remove("hidden");
            });
    } else {
        nombre.value = "";
        descripcion.value = "";
        precio.value = "";
        titulo.textContent = "Agregar Servicio";
        imagenPreview.src = "https://via.placeholder.com/250x250?text=Imagen+Servicio";
        modal.classList.remove("hidden");
    }
}

function cerrarModalServicio() {
    document.getElementById("modalServicio").classList.add("hidden");
}

document.getElementById("formServicio").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("servicioNombre").value;
    const descripcion = document.getElementById("servicioDescripcion").value;
    const precio = parseFloat(document.getElementById("servicioPrecio").value);
    const imagenFile = document.getElementById("servicioImagen").files[0];

    try {
        const formData = new FormData();
        formData.append("servicio", new Blob([JSON.stringify({ nombre, descripcion, precio, activo: true})], { type: "application/json" }));
        if (imagenFile) formData.append("imagen", imagenFile);

        let url = apiServiciosUrl;
        let method = "POST";

        if (servicioEditId) {
            url = `${apiServiciosUrl}/${servicioEditId}/con-imagen`;
            method = "PUT";
        } else {
            url = `${apiServiciosUrl}/con-imagen`;
        }

        const res = await fetch(url, { method, body: formData });
        if (!res.ok) throw new Error("Error en la operación");

        showToast("success", servicioEditId ? "Servicio actualizado" : "Servicio agregado",
            servicioEditId ? "El servicio se actualizó correctamente." : "El servicio se creó correctamente.");

        cerrarModalServicio();
        cargarServicios();
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudo guardar el servicio.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    cargarServicios();
});

async function cambiarEstadoServicio(id) {
    try {
        const res = await fetch(`${apiServiciosUrl}/${id}/cambiar-estado`, {
            method: "PUT"
        });

        if (!res.ok) throw new Error("Error al cambiar el estado");

        showToast("success", "Estado actualizado", "El servicio se ha actualizado correctamente.");
        cargarServicios();
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudo actualizar el estado.");
    }
}

async function eliminarServicio(id) {
    if (!confirm("¿Seguro que quieres eliminar este servicio?")) return;

    try {
        const res = await fetch(`${apiServiciosUrl}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar");

        showToast("success", "Servicio eliminado", "El servicio se eliminó correctamente.");
        cargarServicios();
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudo eliminar el servicio.");
    }
}

document.getElementById("servicioImagen").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById("servicioImagenPreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});
