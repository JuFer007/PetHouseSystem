package com.app.MascotaEnfermedad;
import com.app.DTO.MascotaEnfermedadDTO;
import com.app.Enums.EstadoEnfermedad;
import com.app.Mascota.Mascota;
import com.app.Mascota.MascotaRepository;
import com.app.Enfermedad.Enfermedad;
import com.app.Enfermedad.EnfermedadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class MascotaEnfermedadService {
    private final MascotaEnfermedadRepository repository;
    private final MascotaRepository mascotaRepository;
    private final EnfermedadRepository enfermedadRepository;

    @Transactional(readOnly = true)
    public List<MascotaEnfermedadDTO> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MascotaEnfermedadDTO findById(Long id) {
        MascotaEnfermedad entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        return convertToDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<MascotaEnfermedadDTO> findByMascotaId(Long mascotaId) {
        return repository.findByMascotaId(mascotaId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaEnfermedadDTO> findByEstado(EstadoEnfermedad estado) {
        return repository.findByEstado(estado).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaEnfermedadDTO> findByClienteId(Long clienteId) {
        return repository.findByClienteId(clienteId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MascotaEnfermedadDTO> findEnfermedadesActivas() {
        return repository.findEnfermedadesActivas().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MascotaEnfermedadDTO save(MascotaEnfermedadDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getMascotaId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Enfermedad enfermedad = enfermedadRepository.findById(dto.getEnfermedadId())
                .orElseThrow(() -> new RuntimeException("Enfermedad no encontrada"));

        MascotaEnfermedad entity = MascotaEnfermedad.builder()
                .mascota(mascota)
                .enfermedad(enfermedad)
                .fechaDiagnostico(dto.getFechaDiagnostico())
                .sintomas(dto.getSintomas())
                .observaciones(dto.getObservaciones())
                .estado(dto.getEstado())
                .fechaRecuperacion(dto.getFechaRecuperacion())
                .build();

        MascotaEnfermedad saved = repository.save(entity);
        return convertToDTO(saved);
    }

    @Transactional
    public MascotaEnfermedadDTO update(Long id, MascotaEnfermedadDTO dto) {
        MascotaEnfermedad entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        entity.setSintomas(dto.getSintomas());
        entity.setObservaciones(dto.getObservaciones());
        entity.setEstado(dto.getEstado());
        entity.setFechaRecuperacion(dto.getFechaRecuperacion());

        MascotaEnfermedad updated = repository.save(entity);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private MascotaEnfermedadDTO convertToDTO(MascotaEnfermedad entity) {
        return MascotaEnfermedadDTO.builder()
                .id(entity.getId())
                .mascotaId(entity.getMascota().getId())
                .mascotaNombre(entity.getMascota().getNombre())
                .mascotaEspecie(entity.getMascota().getEspecie())
                .clienteId(entity.getMascota().getCliente().getId())
                .clienteNombre(entity.getMascota().getCliente().getNombre())
                .clienteApellido(entity.getMascota().getCliente().getApellido())
                .enfermedadId(entity.getEnfermedad().getId())
                .enfermedadNombre(entity.getEnfermedad().getNombre())
                .enfermedadDescripcion(entity.getEnfermedad().getDescripcion())
                .fechaDiagnostico(entity.getFechaDiagnostico())
                .sintomas(entity.getSintomas())
                .observaciones(entity.getObservaciones())
                .estado(entity.getEstado())
                .fechaRecuperacion(entity.getFechaRecuperacion())
                .build();
    }
}
