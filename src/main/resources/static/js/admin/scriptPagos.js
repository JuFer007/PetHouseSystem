async function cargarPagos() {
    try {
        const res = await fetch("http://localhost:8080/api/pagos");
        const pagos = await res.json();

        const tbody = document.querySelector("#tablaPagos tbody");
        tbody.innerHTML = "";

        let pagosCompletados = 0;
        let pagosPendientes = 0;
        let ingresosTotales = 0;

        pagos.forEach(p => {
            const estado = p.estado.toUpperCase();

            if (estado === "COMPLETADO") pagosCompletados++;
            else if (estado === "PENDIENTE") pagosPendientes++;

            ingresosTotales += p.monto;

            const tr = document.createElement("tr");
            tr.classList.add("table-row", "border-b", "border-gray-200");

            tr.innerHTML = `
                <td class="py-4 px-4">${p.servicioNombre || "Servicio desconocido"}</td>
                <td class="text-center py-4 px-4">S/. ${p.monto.toFixed(2)}</td>
                <td class="text-center py-4 px-4">${p.metodoPago}</td>
                <td class="text-center py-4 px-4">${new Date(p.fechaPago).toLocaleDateString()}</td>

                <td class="text-center py-4 px-4">
                    <span class="status-badge ${estado === "COMPLETADO" ? "status-completed" : "status-pending"}">
                        ${estado}
                    </span>
                </td>

                <td class="py-4 px-4 flex justify-center gap-4">

                    <!-- Marcar como pagado -->
                    <i class="fas fa-check-circle cursor-pointer
                        ${estado === "COMPLETADO" ? "text-gray-300" : "text-green-500"}"
                        title="${estado === "COMPLETADO" ? "Pago cerrado" : "Marcar como pagado"}"></i>

                    <!-- Descargar PDF -->
                    <i class="fas fa-file-pdf cursor-pointer
                        ${estado === "COMPLETADO" ? "text-blue-500" : "text-gray-300"}"
                        title="${estado === "COMPLETADO" ? "Generar Ticket" : "El pago no está completado"}"></i>

                    <!-- Eliminar -->
                    <i class="fas fa-trash cursor-pointer text-red-500" title="Eliminar"></i>
                </td>
            `;

            const btnRegistrar = tr.querySelector(".fa-check-circle");
            const btnEliminar = tr.querySelector(".fa-trash");
            const btnPDF = tr.querySelector(".fa-file-pdf");

            const pagoYaCerrado = estado === "COMPLETADO";

            btnRegistrar.addEventListener("click", async () => {
                if (pagoYaCerrado) {
                    showToast("error", "Pago ya está completado", "No puedes modificar un pago cerrado.");
                    return;
                }

                try {
                    await fetch(`http://localhost:8080/api/pagos/${p.id}/estado?nuevoEstado=COMPLETADO`, {
                        method: "PATCH"
                    });

                    showToast("success", "Pago completado", "El pago fue marcado como completado.");
                    cargarPagos();

                } catch (error) {
                    showToast("error", "Error", "No se pudo completar el pago.");
                    console.error(error);
                }
            });

            btnEliminar.addEventListener("click", async () => {
                try {
                    await fetch(`http://localhost:8080/api/pagos/${p.id}`, { method: "DELETE" });
                    showToast("success", "Pago eliminado", "Se eliminó correctamente.");
                    tr.remove();
                } catch (error) {
                    showToast("error", "Error", "No se pudo eliminar el pago.");
                    console.error(error);
                }
            });

            btnPDF.addEventListener("click", async () => {
                if (!pagoYaCerrado) {
                    showToast("error", "No disponible", "El ticket solo se genera cuando el pago está completado.");
                    return;
                }

                showToast("info", "Generando PDF", "Generando tu ticket, por favor espera...");

                try {
                    const ticketRes = await fetch(`http://localhost:8080/api/tickets/${p.idCita}`);

                    if (!ticketRes.ok) throw new Error("Error obteniendo ticket");

                    const ticket = await ticketRes.json();

                    const body = {
                        cliente: ticket.clienteNombre,
                        fecha: ticket.fecha,
                        hora: ticket.hora,
                        numeroAtencion: ticket.numeroAtencion,
                        dni: ticket.clienteDni,
                        telefono: ticket.clienteTelefono,
                        nombreMascota: ticket.nombreMascota,
                        especie: ticket.especie,
                        raza: ticket.raza,
                        edad: ticket.edad,
                        peso: ticket.peso || "N/A",
                        veterinario: ticket.veterinarioNombre,
                        servicios: [
                            {
                                concepto: ticket.servicioNombre,
                                monto: ticket.servicioMonto,
                                fecha: ticket.fechaServicio
                            }
                        ],
                        metodoPago: ticket.metodoPago,
                        observaciones: ticket.observaciones,
                        subtotal: ticket.subtotal,
                        descuento: ticket.descuento,
                        total: ticket.total,
                        proximaCita: ticket.proximaCita || ""
                    };

                    const pdfRes = await fetch("http://localhost:3005/generar-ticket-vet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    });

                    if (!pdfRes.ok) {
                        showToast("error", "Error", "No se pudo generar el PDF.");
                        return;
                    }

                    const pdfBlob = await pdfRes.blob();
                    const url = URL.createObjectURL(pdfBlob);
                    window.open(url, "_blank");

                } catch (error) {
                    console.error("Error generando ticket:", error);
                    showToast("error", "Error", "Hubo un problema generando el ticket.");
                }
            });

            tbody.appendChild(tr);
        });

        document.querySelector("#pagosCompletados").textContent = pagosCompletados;
        document.querySelector("#pagosPendientes").textContent = pagosPendientes;
        document.querySelector("#ingresosTotales").textContent = `S/. ${ingresosTotales.toFixed(2)}`;

    } catch (error) {
        console.error("Error cargando pagos:", error);
        showToast("error", "Error de conexión", "No se pudo cargar los pagos.");
    }
}

document.addEventListener("DOMContentLoaded", cargarPagos);
