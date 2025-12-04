package com.app.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class VeterinarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
}
