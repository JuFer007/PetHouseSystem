package com.app.MascotaVacuna;
import com.app.DTO.MascotaVacunaDTO;
import com.app.Enums.EstadoVacuna;
import com.app.Mascota.Mascota;
import com.app.Mascota.MascotaRepository;
import com.app.Vacuna.Vacuna;
import com.app.Vacuna.VacunaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class MascotaVacunaService {
    private final MascotaVacunaRepository repository;
    private final MascotaRepository mascotaRepository;
    private final VacunaRepository vacunaRepository;

    @Transactional(readOnly = true)
    public List<MascotaVacunaDTO> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MascotaVacunaDTO findById(Long id) {
        MascotaVacuna entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        return convertToDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<MascotaVacunaDTO> findByMascotaId(Long mascotaId) {
        return repository.findByMascotaId(mascotaId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaVacunaDTO> findByEstado(EstadoVacuna estado) {
        return repository.findByEstado(estado).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaVacunaDTO> findProximasVacunas(Integer dias) {
        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(dias);
        return repository.findProximasAVencer(hoy, fechaLimite).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaVacunaDTO> findVacunasVencidas() {
        LocalDate hoy = LocalDate.now();
        return repository.findVencidas(hoy).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    @Transactional
    public List<MascotaVacunaDTO> save(MascotaVacunaDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getMascotaId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Vacuna vacuna = vacunaRepository.findById(dto.getVacunaId())
                .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));

        List<MascotaVacunaDTO> guardadas = new ArrayList<>();

        MascotaVacuna entity = MascotaVacuna.builder()
                .mascota(mascota)
                .vacuna(vacuna)
                .fechaAplicacion(dto.getFechaAplicacion())
                .proximaDosis(dto.getProximaDosis())
                .numeroDosiS(dto.getNumeroDosis())
                .estado(dto.getEstado())
                .observaciones(dto.getObservaciones())
                .build();

        MascotaVacuna saved = repository.save(entity);
        guardadas.add(convertToDTO(saved));

        return guardadas;
    }

    @Transactional
    public MascotaVacunaDTO update(Long id, MascotaVacunaDTO dto) {
        MascotaVacuna entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        if (entity.getEstado() == EstadoVacuna.VENCIDA) {
            throw new RuntimeException("No se puede editar una vacuna vencida");
        }

        if (dto.getVacunaId() != null && !dto.getVacunaId().equals(entity.getVacuna().getId())) {
            Vacuna vacuna = vacunaRepository.findById(dto.getVacunaId())
                    .orElseThrow(() -> new RuntimeException("Vacuna no encontrada"));
            entity.setVacuna(vacuna);
        }

        if (dto.getFechaAplicacion() != null) {
            entity.setFechaAplicacion(dto.getFechaAplicacion());
        }

        entity.setProximaDosis(dto.getProximaDosis());

        if (dto.getNumeroDosis() != null) {
            entity.setNumeroDosiS(dto.getNumeroDosis());
        }

        EstadoVacuna estado = calcularEstado(dto.getProximaDosis());
        entity.setEstado(estado);

        entity.setObservaciones(dto.getObservaciones());

        MascotaVacuna updated = repository.save(entity);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private EstadoVacuna calcularEstado(LocalDate proximaDosis) {
        if (proximaDosis == null) {
            return EstadoVacuna.VIGENTE;
        }

        LocalDate hoy = LocalDate.now();
        long diasRestantes = ChronoUnit.DAYS.between(hoy, proximaDosis);

        if (diasRestantes < 0) {
            return EstadoVacuna.VENCIDA;
        } else if (diasRestantes <= 30) {
            return EstadoVacuna.PENDIENTE;
        } else {
            return EstadoVacuna.VIGENTE;
        }
    }

    private MascotaVacunaDTO convertToDTO(MascotaVacuna entity) {
        Integer diasRestantes = null;
        if (entity.getProximaDosis() != null) {
            diasRestantes = (int) ChronoUnit.DAYS.between(LocalDate.now(), entity.getProximaDosis());
        }

        return MascotaVacunaDTO.builder()
                .id(entity.getId())
                .mascotaId(entity.getMascota().getId())
                .mascotaNombre(entity.getMascota().getNombre())
                .mascotaEspecie(entity.getMascota().getEspecie())
                .clienteId(entity.getMascota().getCliente().getId())
                .clienteNombre(entity.getMascota().getCliente().getNombre())
                .clienteApellido(entity.getMascota().getCliente().getApellido())
                .vacunaId(entity.getVacuna().getId())
                .vacunaNombre(entity.getVacuna().getNombre())
                .vacunaDescripcion(entity.getVacuna().getDescripcion())
                .fechaAplicacion(entity.getFechaAplicacion())
                .proximaDosis(entity.getProximaDosis())
                .numeroDosis(entity.getNumeroDosiS())
                .estado(entity.getEstado())
                .observaciones(entity.getObservaciones())
                .diasRestantes(diasRestantes)
                .build();
    }
}
