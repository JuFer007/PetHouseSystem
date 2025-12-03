package com.app.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class PagoDTO {
    private Long id;
    private String clienteNombre;
    private String servicioNombre;
    private Long idCita;
    private Double monto;
    private String metodoPago;
    private String estado;
    private String fechaPago;
}
