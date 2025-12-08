package com.app.MascotaVacuna;
import com.app.Enums.EstadoVacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface MascotaVacunaRepository extends JpaRepository<MascotaVacuna, Long> {
    List<MascotaVacuna> findByMascotaId(Long mascotaId);
    List<MascotaVacuna> findByEstado(EstadoVacuna estado);
    List<MascotaVacuna> findByVacunaId(Long vacunaId);

    @Query("SELECT mv FROM MascotaVacuna mv WHERE mv.mascota.cliente.id = :clienteId")
    List<MascotaVacuna> findByClienteId(@Param("clienteId") Long clienteId);

    @Query("SELECT mv FROM MascotaVacuna mv WHERE mv.proximaDosis BETWEEN :hoy AND :fechaLimite")
    List<MascotaVacuna> findProximasAVencer(@Param("hoy") LocalDate hoy, @Param("fechaLimite") LocalDate fechaLimite);

    @Query("SELECT mv FROM MascotaVacuna mv WHERE mv.proximaDosis < :hoy")
    List<MascotaVacuna> findVencidas(@Param("hoy") LocalDate hoy);

    @Query("SELECT mv FROM MascotaVacuna mv WHERE mv.mascota.id = :mascotaId AND mv.vacuna.id = :vacunaId ORDER BY mv.fechaAplicacion DESC")
    List<MascotaVacuna> findUltimaVacunaPorTipo(@Param("mascotaId") Long mascotaId, @Param("vacunaId") Long vacunaId);

    @Query("SELECT mv FROM MascotaVacuna mv WHERE mv.mascota.id = :mascotaId AND mv.vacuna.id = :vacunaId ORDER BY mv.numeroDosis ASC")
    List<MascotaVacuna> findByMascotaVacuna(@Param("mascotaId") Long mascotaId, @Param("vacunaId") Long vacunaId);
}
