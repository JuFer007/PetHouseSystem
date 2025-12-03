package com.app.DTO;
import com.app.Cliente.Cliente;
import com.app.Mascota.Mascota;
import com.app.Servicio.Servicio;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Getter
@Setter

public class CitaResponseDTO {
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private String estado;
    private Long mascotaId;
    private Cliente cliente;
    private Mascota mascota;
    private Servicio servicio;
}
