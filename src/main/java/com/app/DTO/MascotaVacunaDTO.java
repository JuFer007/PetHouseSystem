package com.app.DTO;
import com.app.Enums.EstadoVacuna;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor

public class MascotaVacunaDTO {
    private Long id;
    private Long mascotaId;
    private String mascotaNombre;
    private String mascotaEspecie;
    private Long clienteId;
    private String clienteNombre;
    private String clienteApellido;
    private Long vacunaId;
    private String vacunaNombre;
    private String vacunaDescripcion;
    private LocalDate fechaAplicacion;
    private LocalDate proximaDosis;
    private Integer numeroDosis;
    private EstadoVacuna estado;
    private String observaciones;
    private Integer diasRestantes;
}
