package com.app.DTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ClienteDTO {
    private Long id;
    private String dni;
    private String nombre;
    private String apellido;
    private String telefono;
    private List<MascotaDTO> mascotas;
}
