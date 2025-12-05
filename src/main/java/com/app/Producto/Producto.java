package com.app.Producto;
import com.app.Enums.ProductoCategoria;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;

    @Enumerated(EnumType.STRING)
    private ProductoCategoria categoria;
    private Double precio;
    private Integer stock;
    private boolean activo = true;
    private String urlImagen;
}
