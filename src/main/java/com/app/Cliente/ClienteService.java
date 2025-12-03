package com.app.Cliente;
import com.app.DTO.ClienteDTO;
import com.app.Mascota.Mascota;
import com.app.DTO.MascotaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("postgresTransactionManager")

public class ClienteService {
    private final ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    public Cliente findById(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public Cliente findByDni(String dni) {
        return clienteRepository.findByDni(dni).orElseThrow(() -> new RuntimeException("Cliente no encontrado con DNI: " + dni));
    }

    public List<Cliente> findByNombreOApellido(String texto) {
        return clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(texto, texto);
    }

    public Cliente save(Cliente cliente) {
        if (clienteRepository.existsByDni(cliente.getDni())) {
            throw new RuntimeException("Ya existe un cliente con el DNI: " + cliente.getDni());
        }
        return clienteRepository.save(cliente);
    }

    public Cliente update(Long id, Cliente cliente) {
        Cliente clienteExistente = findById(id);

        if (!clienteExistente.getDni().equals(cliente.getDni()) &&
                clienteRepository.existsByDni(cliente.getDni())) {
            throw new RuntimeException("Ya existe un cliente con el DNI: " + cliente.getDni());
        }

        clienteExistente.setDni(cliente.getDni());
        clienteExistente.setNombre(cliente.getNombre());
        clienteExistente.setApellido(cliente.getApellido());
        clienteExistente.setTelefono(cliente.getTelefono());

        return clienteRepository.save(clienteExistente);
    }

    public void deleteById(Long id) {
        clienteRepository.deleteById(id);
    }

    public List<ClienteDTO> findAllDTO() {
        return clienteRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ClienteDTO toDTO(Cliente cliente) {
        List<MascotaDTO> mascotasDTO = cliente.getMascotas() != null ?
                cliente.getMascotas().stream()
                        .distinct()
                        .map(this::toMascotaDTO)
                        .collect(Collectors.toList())
                : List.of();

        return ClienteDTO.builder()
                .id(cliente.getId())
                .dni(cliente.getDni())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .telefono(cliente.getTelefono())
                .mascotas(mascotasDTO)
                .build();
    }

    private MascotaDTO toMascotaDTO(Mascota mascota) {
        return MascotaDTO.builder()
                .id(mascota.getId())
                .nombre(mascota.getNombre())
                .especie(mascota.getEspecie())
                .raza(mascota.getRaza())
                .edad(mascota.getEdad())
                .build();
    }
}
