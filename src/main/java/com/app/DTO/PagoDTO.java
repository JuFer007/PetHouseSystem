package com.app.DTO;
import com.app.Enums.PagoEstado;
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
    private PagoEstado estado;
    private String fechaPago;
}
