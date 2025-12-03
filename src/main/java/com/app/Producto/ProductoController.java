package com.app.Producto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor

public class ProductoController {
    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> findAll() {
        return ResponseEntity.ok(productoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.findById(id));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Producto>> findByCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(productoService.findByCategoria(categoria));
    }

    @GetMapping("/activo/{activo}")
    public ResponseEntity<List<Producto>> findByActivo(@PathVariable boolean activo) {
        return ResponseEntity.ok(productoService.findByActivo(activo));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> findByNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.findByNombre(nombre));
    }

    @GetMapping("/stock-bajo/{stock}")
    public ResponseEntity<List<Producto>> findProductosConStockBajo(@PathVariable Integer stock) {
        return ResponseEntity.ok(productoService.findProductosConStockBajo(stock));
    }

    @PostMapping
    public ResponseEntity<Producto> save(@RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.save(producto));
    }

    @PostMapping("/con-imagen")
    public ResponseEntity<Producto> saveConImagen(@RequestPart("producto") Producto producto,
    @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(productoService.saveConImagen(producto, imagen));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.update(id, producto));
    }

    @PutMapping("/{id}/con-imagen")
    public ResponseEntity<Producto> updateConImagen(@PathVariable Long id, @RequestPart("producto") Producto producto, @RequestPart(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(productoService.updateConImagen(id, producto, imagen));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> actualizarStock(@PathVariable Long id, @RequestParam Integer cantidad) {
        return ResponseEntity.ok(productoService.actualizarStock(id, cantidad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        productoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
