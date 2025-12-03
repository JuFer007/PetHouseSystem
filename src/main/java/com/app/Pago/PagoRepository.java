package com.app.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByClienteId(Long clienteId);
    List<Pago> findByEstado(String estado);
    List<Pago> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Pago> findByMetodoPago(String metodoPago);
}
