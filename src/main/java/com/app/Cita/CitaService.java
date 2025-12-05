package com.app.Cita;
import com.app.Cliente.Cliente;
import com.app.Cliente.ClienteRepository;
import com.app.DTO.CitaDTO;
import com.app.DTO.CitaResponseDTO;
import com.app.Enums.CitaEstado;
import com.app.Enums.PagoEstado;
import com.app.Mascota.Mascota;
import com.app.Mascota.MascotaRepository;
import com.app.Pago.Pago;
import com.app.Pago.PagoService;
import com.app.Servicio.Servicio;
import com.app.Servicio.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")

public class CitaService {
    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;
    private final ServicioRepository servicioRepository;
    private final PagoService pagoService;

    private CitaResponseDTO enrichCita(Cita cita) {
        CitaResponseDTO dto = new CitaResponseDTO();
        dto.setId(cita.getId());
        dto.setFecha(cita.getFecha());
        dto.setHora(cita.getHora());
        dto.setMotivo(cita.getMotivo());
        dto.setEstado(String.valueOf(cita.getEstado()));
        dto.setMascotaId(cita.getMascotaId());

        if (cita.getMascotaId() != null) {
            try {
                Mascota mascota = mascotaRepository.findById(cita.getMascotaId()).orElse(null);
                dto.setMascota(mascota);

                if (mascota != null && mascota.getCliente() != null) {
                    dto.setCliente(mascota.getCliente());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (cita.getServicio() != null) {
            dto.setServicio(cita.getServicio());
        }
        dto.setVeterinarioId(cita.getVeterinarioId());
        return dto;
    }

    public List<CitaResponseDTO> findAll() {
        return citaRepository.findAll().stream().map(this::enrichCita).collect(Collectors.toList());
    }

    public CitaResponseDTO findById(Long id) {
        Cita cita = citaRepository.findById(id).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        return enrichCita(cita);
    }

    public List<CitaResponseDTO> findByMascotaId(Long mascotaId) {
        return citaRepository.findByMascotaId(mascotaId).stream().map(this::enrichCita).collect(Collectors.toList());
    }

    public List<CitaResponseDTO> findByEstado(String estado) {
        return citaRepository.findByEstado(estado).stream().map(this::enrichCita).collect(Collectors.toList());
    }

    public List<CitaResponseDTO> findByFechaBetween(LocalDate inicio, LocalDate fin) {
        return citaRepository.findByFechaBetween(inicio, fin).stream().map(this::enrichCita).collect(Collectors.toList());
    }

    @Transactional
    public Cita save(CitaDTO citaDTO) {
        Cliente cliente = citaDTO.getCliente();
        Optional<Cliente> existingCliente = clienteRepository.findByDni(cliente.getDni());
        if (existingCliente.isPresent()) {
            cliente = existingCliente.get();
        } else {
            cliente.setNombre(cliente.getNombre().toUpperCase());
            cliente.setApellido(cliente.getApellido().toUpperCase());
            cliente = clienteRepository.save(cliente);
        }

        Mascota mascota = citaDTO.getMascota();
        Optional<Mascota> existingMascota = mascotaRepository.findByNombreAndClienteId(
                mascota.getNombre().toUpperCase(), cliente.getId()
        );

        if (existingMascota.isPresent()) {
            mascota = existingMascota.get();
        } else {
            mascota.setCliente(cliente);
            mascota.setNombre(mascota.getNombre().toUpperCase());
            mascota.setEspecie(mascota.getEspecie().toUpperCase());
            mascota.setRaza(mascota.getRaza().toUpperCase());
            mascota = mascotaRepository.save(mascota);
        }

        Cita cita = new Cita();
        cita.setFecha(citaDTO.getCita().getFecha());
        cita.setMotivo(citaDTO.getCita().getMotivo() != null ? citaDTO.getCita().getMotivo().toUpperCase() : null);
        cita.setEstado(CitaEstado.valueOf(String.valueOf(citaDTO.getCita().getEstado())));
        cita.setMascotaId(mascota.getId());
        cita.setHora(citaDTO.getCita().getHora());
        cita.setVeterinarioId(citaDTO.getCita().getVeterinarioId());

        Long servicioId = citaDTO.getCita().getServicioId();
        if (servicioId != null) {
            Servicio servicio = servicioRepository.findById(servicioId).orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
            cita.setServicio(servicio);
        }
        return citaRepository.save(cita);
    }

    public CitaResponseDTO update(Long id, Cita cita) {
        if (id == null) {
            throw new IllegalArgumentException("El ID de la cita no puede ser null");
        }

        Cita citaExistente = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        String estadoAnterior = String.valueOf(citaExistente.getEstado()).toLowerCase();

        citaExistente.setFecha(cita.getFecha());
        citaExistente.setMotivo(cita.getMotivo());
        citaExistente.setEstado(cita.getEstado());
        citaExistente.setHora(cita.getHora());

        citaExistente = citaRepository.save(citaExistente);

        if (!"COMPLETADA".equalsIgnoreCase(estadoAnterior)
                && "COMPLETADA".equalsIgnoreCase(String.valueOf(citaExistente.getEstado()))) {

            Cliente cliente = null;

            if (citaExistente.getMascotaId() != null) {
                Mascota mascota = mascotaRepository.findById(citaExistente.getMascotaId()).orElse(null);
                if (mascota != null) {
                    cliente = mascota.getCliente();
                } else {
                    System.out.println("Mascota no encontrada con ID: " + citaExistente.getMascotaId());
                }
            }

            if (cliente != null) {
                Pago nuevoPago = new Pago();
                nuevoPago.setCliente(cliente);

                if (citaExistente.getServicio() != null && citaExistente.getServicio().getId() != null) {
                    nuevoPago.setServicioId(citaExistente.getServicio().getId());
                    nuevoPago.setMonto(citaExistente.getServicio().getPrecio());
                    nuevoPago.setIdCita(citaExistente.getId());
                } else {
                    nuevoPago.setServicioId(null);
                    nuevoPago.setMonto(0.0);
                }
                nuevoPago.setMetodoPago("EFECTIVO");
                nuevoPago.setEstado(PagoEstado.valueOf("PENDIENTE"));
                nuevoPago.setFechaPago(LocalDateTime.now());

                pagoService.save(nuevoPago);
            } else {
                System.out.println("No se pudo crear pago: cliente no encontrado");
            }
        }
        return enrichCita(citaExistente);
    }

    public void deleteById(Long id) {
        citaRepository.deleteById(id);
    }

    public List<CitaResponseDTO> findByVeterinarioId(Long veterinarioId) {
        return citaRepository.findByVeterinarioId(veterinarioId)
                .stream()
                .map(this::enrichCita)
                .collect(Collectors.toList());
    }
}
