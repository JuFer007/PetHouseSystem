package com.app.DTO;
import com.app.Enums.ProductoCategoria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ProductoEstadisticasDTO {
    private Long productoId;
    private String nombreProducto;
    private ProductoCategoria categoria;
    private Double precio;
    private Integer stockActual;
    private String urlImagen;
    private Boolean activo;
    private Long totalVendido;
    private Long vecesVendido;
    private Double ingresoTotal;
    private Double ingresoPromedioPorVenta;
}
