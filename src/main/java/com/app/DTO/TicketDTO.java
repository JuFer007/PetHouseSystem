package com.app.DTO;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data

public class TicketDTO {
    private String numeroAtencion;
    private String fecha;
    private String hora;
    private String clienteNombre;
    private String clienteDni;
    private String clienteTelefono;
    private String nombreMascota;
    private String especie;
    private String raza;
    private Integer edad;
    private String veterinarioNombre;
    private String servicioNombre;
    private Double servicioMonto;
    private String fechaServicio;
    private String metodoPago;
    private String observaciones;
    private Double subtotal;
    private Double descuento;
    private Double total;
}
