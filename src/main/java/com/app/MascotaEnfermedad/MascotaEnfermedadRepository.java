package com.app.MascotaEnfermedad;
import com.app.Enums.EstadoEnfermedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface MascotaEnfermedadRepository extends JpaRepository<MascotaEnfermedad, Long> {
    List<MascotaEnfermedad> findByMascotaId(Long mascotaId);
    List<MascotaEnfermedad> findByEstado(EstadoEnfermedad estado);
    List<MascotaEnfermedad> findByEnfermedadId(Long enfermedadId);

    @Query("SELECT me FROM MascotaEnfermedad me WHERE me.mascota.cliente.id = :clienteId")
    List<MascotaEnfermedad> findByClienteId(@Param("clienteId") Long clienteId);

    @Query("SELECT me FROM MascotaEnfermedad me WHERE me.fechaDiagnostico BETWEEN :inicio AND :fin")
    List<MascotaEnfermedad> findByFechaDiagnosticoBetween(
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );

    @Query("SELECT me FROM MascotaEnfermedad me WHERE me.estado IN ('EN_TRATAMIENTO', 'CRONICO')")
    List<MascotaEnfermedad> findEnfermedadesActivas();

    @Query("SELECT e.nombre, COUNT(me) FROM MascotaEnfermedad me JOIN me.enfermedad e GROUP BY e.nombre ORDER BY COUNT(me) DESC")
    List<Object[]> contarEnfermedadesPorTipo();
}
