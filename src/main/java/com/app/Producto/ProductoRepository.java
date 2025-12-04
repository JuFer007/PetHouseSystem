package com.app.Producto;
import com.app.DTO.ProductoEstadisticasDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoria(String categoria);
    List<Producto> findByActivo(boolean activo);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByStockLessThan(Integer stock);

    @Query("SELECT new com.app.DTO.ProductoEstadisticasDTO(" +
    "p.id, p.nombre, p.categoria, p.precio, p.stock, p.urlImagen, p.activo, " +
    "COALESCE(SUM(dv.cantidad), 0), " +
    "COALESCE(COUNT(DISTINCT dv.venta.id), 0), " +
    "COALESCE(SUM(dv.subtotal), 0.0), " +
    "CASE WHEN COUNT(DISTINCT dv.venta.id) > 0 " +
    "THEN COALESCE(SUM(dv.subtotal), 0.0) / COUNT(DISTINCT dv.venta.id) " +
    "ELSE 0.0 END) " +
    "FROM Producto p " +
    "LEFT JOIN DetalleVenta dv ON dv.producto.id = p.id " +
    "GROUP BY p.id, p.nombre, p.categoria, p.precio, p.stock, p.urlImagen, p.activo")
    List<ProductoEstadisticasDTO> findAllConEstadisticas();
}
