package com.app.Mascota;
import com.app.Cliente.Cliente;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@JsonIgnoreProperties({"cliente"})
@Entity
@Table(name = "mascota")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Mascota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
