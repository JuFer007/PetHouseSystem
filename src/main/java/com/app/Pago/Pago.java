package com.app.Pago;
import com.app.Cliente.Cliente;
import com.app.Enums.PagoEstado;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pago")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "servicio_id")
    private Long servicioId;

    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false)
    private String metodoPago;

    @Column(nullable = false)
    private LocalDateTime fechaPago;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PagoEstado estado;

    @Column(name = "id_cita")
    private Long idCita;
}
