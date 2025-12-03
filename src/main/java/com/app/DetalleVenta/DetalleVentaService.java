package com.app.DetalleVenta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")

public class DetalleVentaService {
    private final DetalleVentaRepository detalleVentaRepository;

    public List<DetalleVenta> findAll() {
        return detalleVentaRepository.findAll();
    }

    public DetalleVenta findById(Long id) {
        return detalleVentaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detalle de venta no encontrado"));
    }

    public List<DetalleVenta> findByVentaId(Long ventaId) {
        return detalleVentaRepository.findByVentaId(ventaId);
    }

    public List<DetalleVenta> findByProductoId(Long productoId) {
        return detalleVentaRepository.findByProductoId(productoId);
    }

    public DetalleVenta save(DetalleVenta detalleVenta) {
        detalleVenta.setSubtotal(detalleVenta.getCantidad() * detalleVenta.getPrecioUnitario());
        return detalleVentaRepository.save(detalleVenta);
    }

    public void deleteById(Long id) {
        detalleVentaRepository.deleteById(id);
    }
}
