package com.app.DTO;
import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class HistoriaClinicaDTO {
    private Long mascotaId;
    private String mascotaNombre;
    private String especie;
    private String raza;
    private Integer edad;
    private String duenoNombre;
    private String duenoApellido;
    private String duenoTelefono;
    private List<MascotaEnfermedadDTO> enfermedades;
    private List<MascotaVacunaDTO> vacunas;
}
