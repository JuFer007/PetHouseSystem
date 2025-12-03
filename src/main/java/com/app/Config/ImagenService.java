package com.app.Config;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service

public class ImagenService {
    private final String DIRECTORIO_SERVICIOS = "imagenesServicios/";
    private final String DIRECTORIO_PRODUCTOS = "imagenesProductos/";

    public ImagenService() {
        try {
            Files.createDirectories(Paths.get(DIRECTORIO_SERVICIOS));
            Files.createDirectories(Paths.get(DIRECTORIO_PRODUCTOS));
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear los directorios de imágenes", e);
        }
    }

    public String guardarImagenServicio(MultipartFile archivo) {
        return guardarImagen(archivo, DIRECTORIO_SERVICIOS, "/imagenesServicios/");
    }

    public String guardarImagenProducto(MultipartFile archivo) {
        return guardarImagen(archivo, DIRECTORIO_PRODUCTOS, "/imagenesProductos/");
    }

    private String guardarImagen(MultipartFile archivo, String directorio, String urlBase) {
        if (archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        try {
            String contentType = archivo.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("El archivo debe ser una imagen");
            }

            String extension = obtenerExtension(archivo.getOriginalFilename());
            String nombreArchivo = UUID.randomUUID().toString() + extension;
            Path rutaDestino = Paths.get(directorio + nombreArchivo);
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);
            return nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen: " + e.getMessage(), e);
        }
    }

    public void eliminarImagenServicio(String url) {
        eliminarImagen(url, DIRECTORIO_SERVICIOS, "/imagenesServicios/");
    }

    public void eliminarImagenProducto(String url) {
        eliminarImagen(url, DIRECTORIO_PRODUCTOS, "/imagenesProductos/");
    }

    private void eliminarImagen(String url, String directorio, String urlBase) {
        if (url == null || url.isEmpty()) {
            return;
        }

        try {
            String nombreArchivo = url.replace(urlBase, "");
            Path rutaArchivo = Paths.get(directorio + nombreArchivo);

            Files.deleteIfExists(rutaArchivo);

        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar la imagen: " + e.getMessage(), e);
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || nombreArchivo.isEmpty()) {
            return ".jpg";
        }

        int ultimoPunto = nombreArchivo.lastIndexOf(".");
        if (ultimoPunto == -1) {
            return ".jpg";
        }
        return nombreArchivo.substring(ultimoPunto).toLowerCase();
    }
}
