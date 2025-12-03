package com.app.DTO;
import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class VentaRequestDTO {
    private Long clienteId;
    private String metodoPago;
    private List<CarritoItemDTO> items;
}
