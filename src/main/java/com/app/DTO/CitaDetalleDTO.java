package com.app.DTO;
import com.app.Enums.CitaEstado;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data

public class CitaDetalleDTO {
    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private CitaEstado estado;
    private Long servicioId;
    private Long veterinarioId;
}
