package com.app.Mascota;
import com.app.DTO.HistoriaClinicaDTO;
import com.app.MascotaEnfermedad.MascotaEnfermedadService;
import com.app.MascotaVacuna.MascotaVacunaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class MascotaService {
    private final MascotaRepository mascotaRepository;
    private final MascotaEnfermedadService mascotaEnfermedadService;
    private final MascotaVacunaService mascotaVacunaService;

    public List<Mascota> findAll() {
        return mascotaRepository.findAll();
    }

    public Mascota findById(Long id) {
        return mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
    }

    public List<Mascota> findByClienteId(Long clienteId) {
        return mascotaRepository.findByClienteId(clienteId);
    }

    public List<Mascota> findByEspecie(String especie) {
        return mascotaRepository.findByEspecie(especie);
    }

    public List<Mascota> findByNombre(String nombre) {
        return mascotaRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Mascota save(Mascota mascota) {
        return mascotaRepository.save(mascota);
    }

    public Mascota update(Long id, Mascota mascota) {
        Mascota mascotaExistente = findById(id);
        mascotaExistente.setNombre(mascota.getNombre());
        mascotaExistente.setEdad(mascota.getEdad());
        return mascotaRepository.save(mascotaExistente);
    }

    public void deleteById(Long id) {
        mascotaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public HistoriaClinicaDTO obtenerHistoriaClinica(Long mascotaId) {
        Mascota mascota = findById(mascotaId);

        return HistoriaClinicaDTO.builder()
                .mascotaId(mascota.getId())
                .mascotaNombre(mascota.getNombre())
                .especie(mascota.getEspecie())
                .raza(mascota.getRaza())
                .edad(mascota.getEdad())
                .duenoNombre(mascota.getCliente().getNombre())
                .duenoApellido(mascota.getCliente().getApellido())
                .duenoTelefono(mascota.getCliente().getTelefono())
                .enfermedades(mascotaEnfermedadService.findByMascotaId(mascotaId))
                .vacunas(mascotaVacunaService.findByMascotaId(mascotaId))
                .build();
    }
}
