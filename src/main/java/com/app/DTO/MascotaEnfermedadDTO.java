package com.app.DTO;
import com.app.Enums.EstadoEnfermedad;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class MascotaEnfermedadDTO {
    private Long id;
    private Long mascotaId;
    private String mascotaNombre;
    private String mascotaEspecie;
    private Long clienteId;
    private String clienteNombre;
    private String clienteApellido;
    private Long enfermedadId;
    private String enfermedadNombre;
    private String enfermedadDescripcion;
    private LocalDate fechaDiagnostico;
    private String sintomas;
    private String observaciones;
    private EstadoEnfermedad estado;
    private LocalDate fechaRecuperacion;
}
