package com.app.Ticket;
import com.app.DTO.CitaResponseDTO;
import com.app.Cita.CitaService;
import com.app.Cliente.Cliente;
import com.app.DTO.TicketDTO;
import com.app.Enums.CargoTrabajador;
import com.app.Mascota.Mascota;
import com.app.Pago.Pago;
import com.app.Pago.PagoService;
import com.app.Servicio.Servicio;
import com.app.Trabajador.Trabajador;
import com.app.Trabajador.TrabajadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor

public class TicketService {
    private final CitaService citaService;
    private final PagoService pagoService;
    private final TrabajadorService trabajadorService;

    public TicketDTO generarPagoTicket(Long citaId) {
        CitaResponseDTO cita = citaService.findById(citaId);

        Cliente cliente = cita.getCliente();
        Mascota mascota = cita.getMascota();
        Servicio servicio = cita.getServicio();

        Pago pago = pagoService.findByClienteId(cliente.getId())
                .stream()
                .filter(pagoItem -> pagoItem.getServicioId() != null
                        && servicio != null
                        && pagoItem.getServicioId().equals(servicio.getId()))
                .findFirst()
                .orElse(null);

        Trabajador veterinario = null;

        if (cita.getVeterinarioId() != null) {
            try {
                veterinario = trabajadorService.findById(cita.getVeterinarioId());
            } catch (RuntimeException e) {
                veterinario = null;
            }
        }

        Double monto = pago != null ? pago.getMonto() : (servicio != null ? servicio.getPrecio() : 0.0);
        String metodoPago = pago != null ? pago.getMetodoPago() : "EFECTIVO";

        DateTimeFormatter fechaFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter horaFmt = DateTimeFormatter.ofPattern("HH:mm");

        return TicketDTO.builder()
                .numeroAtencion(String.valueOf(cita.getId()))
                .fecha(cita.getFecha() != null ? cita.getFecha().format(fechaFmt) : "")
                .hora(cita.getHora() != null ? cita.getHora().format(horaFmt) : "")
                .clienteNombre(cliente != null ? cliente.getNombre() + " " + cliente.getApellido() : "")
                .clienteDni(cliente != null ? cliente.getDni() : "")
                .clienteTelefono(cliente != null ? cliente.getTelefono() : "")
                .nombreMascota(mascota != null ? mascota.getNombre() : "")
                .especie(mascota != null ? mascota.getEspecie() : "")
                .raza(mascota != null ? mascota.getRaza() : "")
                .edad(mascota != null ? mascota.getEdad() : 0)
                .veterinarioNombre(veterinario != null ? veterinario.getNombre() + " " + veterinario.getApellido() : "Dr. Desconocido")
                .servicioNombre(servicio != null ? cita.getServicio().getNombre() : "")
                .servicioMonto(monto)
                .fechaServicio(cita.getFecha() != null ? cita.getFecha().format(fechaFmt) : "")
                .metodoPago(metodoPago)
                .observaciones("Ninguna")
                .subtotal(monto)
                .descuento(0.0)
                .total(monto)
                .build();
    }
}
