package com.app.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByTrabajadorId(Long trabajadorId);

    @Query("SELECT h FROM Horario h WHERE h.trabajadorId = :trabajadorId " +
    "AND h.diaSemana = :dia AND h.activo = true " +
    "AND h.horaInicio <= :hora AND h.horaFin >= :hora")
    List<Horario> findByTrabajadorYHorario(@Param("trabajadorId") Long trabajadorId, @Param("dia") DayOfWeek dia, @Param("hora") LocalTime hora);
}
