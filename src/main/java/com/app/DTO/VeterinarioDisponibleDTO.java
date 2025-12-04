package com.app.DTO;
import lombok.*;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class VeterinarioDisponibleDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private boolean disponible;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
