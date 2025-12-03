package com.app.DTO;
import com.app.Cliente.Cliente;
import com.app.Mascota.Mascota;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CitaDTO {
    private Cliente cliente;
    private Mascota mascota;
    private CitaDetalleDTO cita;

    @Data
    public static class CitaDetalleDTO {
        private LocalDate fecha;
        private LocalTime hora;
        private String motivo;
        private String estado;
        private Long servicioId;
    }
}