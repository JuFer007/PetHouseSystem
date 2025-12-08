function mostrarModalCompraExitosa(ordenId, total, metodo) {
    document.getElementById('numeroOrdenExito').textContent = `#${ordenId}`;
    document.getElementById('totalPagadoExito').textContent = `S/. ${total.toFixed(2)}`;
    document.getElementById('metodoPagoExito').textContent = metodo;

    document.getElementById('modalCompraExitosa').classList.add('active');
}

function cerrarModalCompraExitosa() {
    document.getElementById('modalCompraExitosa').classList.remove('active');
}
