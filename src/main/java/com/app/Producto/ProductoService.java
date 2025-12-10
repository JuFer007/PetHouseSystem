package com.app.Producto;
import com.app.Config.ImagenService;
import com.app.DTO.ProductoEstadisticasDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("mysqlTransactionManager")

public class ProductoService {
    private final ProductoRepository productoRepository;
    private final ImagenService imagenService;

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Producto findById(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public List<Producto> findByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<Producto> findByActivo(boolean activo) {
        return productoRepository.findByActivo(activo);
    }

    public List<Producto> findByNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> findProductosConStockBajo(Integer stock) {
        return productoRepository.findByStockLessThan(stock);
    }

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto saveConImagen(Producto producto, MultipartFile imagen) {
        if (imagen != null && !imagen.isEmpty()) {
            String urlImagen = imagenService.guardarImagenProducto(imagen);
            producto.setUrlImagen(urlImagen);
        }
        return productoRepository.save(producto);
    }

    public Producto update(Long id, Producto producto) {
        Producto productoExistente = findById(id);
        productoExistente.setNombre(producto.getNombre());
        productoExistente.setCategoria(producto.getCategoria());
        productoExistente.setPrecio(producto.getPrecio());
        productoExistente.setStock(producto.getStock());
        productoExistente.setActivo(producto.isActivo());
        productoExistente.setUrlImagen(producto.getUrlImagen());
        return productoRepository.save(productoExistente);
    }

    public Producto updateConImagen(Long id, Producto producto, MultipartFile imagen) {
        Producto productoExistente = findById(id);

        if (imagen != null && !imagen.isEmpty()) {
            if (productoExistente.getUrlImagen() != null) {
                imagenService.eliminarImagenProducto(productoExistente.getUrlImagen());
            }
            String urlImagen = imagenService.guardarImagenProducto(imagen);
            productoExistente.setUrlImagen(urlImagen);
        }

        productoExistente.setNombre(producto.getNombre());
        productoExistente.setCategoria(producto.getCategoria());
        productoExistente.setPrecio(producto.getPrecio());
        productoExistente.setStock(producto.getStock());
        productoExistente.setActivo(producto.isActivo());

        return productoRepository.save(productoExistente);
    }

    public void deleteById(Long id) {
        Producto producto = findById(id);

        if (producto.getUrlImagen() != null) {
            imagenService.eliminarImagenProducto(producto.getUrlImagen());
        }

        productoRepository.deleteById(id);
    }

    public Producto actualizarStock(Long id, Integer cantidad) {
        Producto producto = findById(id);
        producto.setStock(producto.getStock() + cantidad);
        return productoRepository.save(producto);
    }

    public List<ProductoEstadisticasDTO> findAllConEstadisticas() {
        return productoRepository.findAllConEstadisticas();
    }

    public Producto cambiarEstado(Long id) {
        Producto producto = findById(id);
        producto.setActivo(!producto.isActivo());
        return productoRepository.save(producto);
    }
}
