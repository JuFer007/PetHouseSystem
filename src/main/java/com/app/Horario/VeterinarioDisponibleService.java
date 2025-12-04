package com.app.Horario;
import com.app.DTO.VeterinarioDTO;
import com.app.DTO.VeterinarioDisponibleDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class VeterinarioDisponibleService {
    private final HorarioRepository horarioRepository;
    private final JdbcTemplate postgresJdbcTemplate;

    public List<VeterinarioDisponibleDTO> obtenerVeterinariosDisponibles(LocalDate fecha, LocalTime hora) {

        DayOfWeek diaSemana = fecha.getDayOfWeek();

        String sql = "SELECT id, nombre, apellido FROM trabajador WHERE cargo = 'VETERINARIO' AND activo = true";

        List<VeterinarioDTO> veterinarios = postgresJdbcTemplate.query(sql, (rs, rowNum) -> new VeterinarioDTO(rs.getLong("id"), rs.getString("nombre"), rs.getString("apellido")));
        List<VeterinarioDisponibleDTO> disponibles = new ArrayList<>();

        for (VeterinarioDTO vet : veterinarios) {
            List<Horario> horarios = horarioRepository.findByTrabajadorYHorario(vet.getId(), diaSemana, hora);

            if (!horarios.isEmpty()) {
                VeterinarioDisponibleDTO dto = VeterinarioDisponibleDTO.builder()
                        .id(vet.getId())
                        .nombre(vet.getNombre())
                        .apellido(vet.getApellido())
                        .disponible(true)
                        .horaInicio(horarios.get(0).getHoraInicio())
                        .horaFin(horarios.get(0).getHoraFin())
                        .build();
                disponibles.add(dto);
            }
        }
        return disponibles;
    }

    public boolean verificarDisponibilidad(Long veterinarioId, LocalDate fecha, LocalTime hora) {
        DayOfWeek diaSemana = fecha.getDayOfWeek();
        List<Horario> horarios = horarioRepository.findByTrabajadorYHorario(veterinarioId, diaSemana, hora);
        return !horarios.isEmpty();
    }
}
