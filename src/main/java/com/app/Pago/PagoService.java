package com.app.Pago;
import com.app.DTO.PagoDTO;
import com.app.Servicio.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class PagoService {
    private final PagoRepository pagoRepository;
    private final ServicioService servicioService;

    public List<Pago> findAll() {
        return pagoRepository.findAll();
    }

    public Pago findById(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
    }

    public List<Pago> findByClienteId(Long clienteId) {
        return pagoRepository.findByClienteId(clienteId);
    }

    public List<Pago> findByEstado(String estado) {
        return pagoRepository.findByEstado(estado);
    }

    public List<Pago> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin) {
        return pagoRepository.findByFechaPagoBetween(inicio, fin);
    }

    public List<Pago> findByMetodoPago(String metodoPago) {
        return pagoRepository.findByMetodoPago(metodoPago);
    }

    public Pago save(Pago pago) {
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(LocalDateTime.now());
        }
        return pagoRepository.save(pago);
    }

    public Pago update(Long id, Pago pago) {
        Pago pagoExistente = findById(id);
        pagoExistente.setCliente(pago.getCliente());
        pagoExistente.setServicioId(pago.getServicioId());
        pagoExistente.setMonto(pago.getMonto());
        pagoExistente.setMetodoPago(pago.getMetodoPago());
        pagoExistente.setEstado(pago.getEstado());
        return pagoRepository.save(pagoExistente);
    }

    public void deleteById(Long id) {
        pagoRepository.deleteById(id);
    }

    public Pago cambiarEstado(Long id, String nuevoEstado) {
        Pago pago = findById(id);
        pago.setEstado(nuevoEstado);
        return pagoRepository.save(pago);
    }

    public List<PagoDTO> findAllDTO() {
        List<Pago> pagos = pagoRepository.findAll();

        return pagos.stream().map(p -> {
            String nombreServicio = obtenerNombreServicioDesdeOtraDB(p.getServicioId());

            return new PagoDTO(
                    p.getId(),
                    p.getCliente().getNombre() + " " + p.getCliente().getApellido(),
                    nombreServicio,
                    p.getIdCita(),
                    p.getMonto(),
                    p.getMetodoPago(),
                    p.getEstado(),
                    p.getFechaPago().toString()
            );
        }).toList();
    }

    private String obtenerNombreServicioDesdeOtraDB(Long servicioId) {
        if (servicioId == null) {
            return "Sin servicio asignado";
        }

        try {
            return servicioService.getNombreById(servicioId);
        } catch (Exception e) {
            return "Servicio no encontrado";
        }
    }
}
