package com.app.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProductoEstadisticasDTO {
    private Long productoId;
    private String nombreProducto;
    private String categoria;
    private Double precio;
    private Integer stockActual;
    private String urlImagen;
    private Boolean activo;
    private Long totalVendido;
    private Long vecesVendido;
    private Double ingresoTotal;
    private Double ingresoPromedioPorVenta;
}
