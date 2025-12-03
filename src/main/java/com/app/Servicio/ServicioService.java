package com.app.Servicio;
import com.app.Config.ImagenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")

public class ServicioService {
    private final ServicioRepository servicioRepository;
    private final ImagenService imagenService;

    public List<Servicio> findAll() {
        return servicioRepository.findAll();
    }

    public Servicio findById(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    public List<Servicio> findByActivo(boolean activo) {
        return servicioRepository.findByActivo(activo);
    }

    public List<Servicio> findByNombre(String nombre) {
        return servicioRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Servicio save(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public Servicio saveConImagen(Servicio servicio, MultipartFile imagen) {
        if (imagen != null && !imagen.isEmpty()) {
            String urlImagen = imagenService.guardarImagenServicio(imagen);
            servicio.setImagenUrl(urlImagen);
        }
        return servicioRepository.save(servicio);
    }

    public Servicio update(Long id, Servicio servicio) {
        Servicio servicioExistente = findById(id);
        servicioExistente.setNombre(servicio.getNombre());
        servicioExistente.setDescripcion(servicio.getDescripcion());
        servicioExistente.setPrecio(servicio.getPrecio());
        servicioExistente.setActivo(servicio.isActivo());
        servicioExistente.setImagenUrl(servicio.getImagenUrl());
        return servicioRepository.save(servicioExistente);
    }

    public Servicio updateConImagen(Long id, Servicio servicio, MultipartFile imagen) {
        Servicio servicioExistente = findById(id);

        if (imagen != null && !imagen.isEmpty()) {
            if (servicioExistente.getImagenUrl() != null) {
                imagenService.eliminarImagenServicio(servicioExistente.getImagenUrl());
            }
            String urlImagen = imagenService.guardarImagenServicio(imagen);
            servicioExistente.setImagenUrl(urlImagen);
        }

        servicioExistente.setNombre(servicio.getNombre());
        servicioExistente.setDescripcion(servicio.getDescripcion());
        servicioExistente.setPrecio(servicio.getPrecio());
        servicioExistente.setActivo(servicio.isActivo());

        return servicioRepository.save(servicioExistente);
    }

    public void deleteById(Long id) {
        Servicio servicio = findById(id);
        if (servicio.getImagenUrl() != null) {
            imagenService.eliminarImagenServicio(servicio.getImagenUrl());
        }
        servicioRepository.deleteById(id);
    }

    public String getNombreById(Long id) {
        return servicioRepository.findById(id)
                .map(Servicio::getNombre)
                .orElse("Servicio desconocido");
    }
}
