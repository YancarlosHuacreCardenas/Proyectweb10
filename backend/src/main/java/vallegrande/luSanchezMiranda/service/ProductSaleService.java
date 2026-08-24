package vallegrande.luSanchezMiranda.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.ProductSale;

public interface ProductSaleService {

    /** Listar todos los productos de venta (Flux) */
    Flux<ProductSale> listar();

    /** Listar productos por estado "A" (Activo) o "I" (Inactivo) (Flux) */
    Flux<ProductSale> listarPorEstado(String status);

    /** Listar por ID (Mono) */
    Mono<ProductSale> listarPorId(String id);

    /** Crear un nuevo producto de venta (Mono) */
    Mono<ProductSale> guardar(ProductSale product);

    /** Editar un producto existente por ID (Mono) */
    Mono<ProductSale> actualizar(String id, ProductSale product);

    /** Eliminar lógicamente un producto (cambia estado a "I") (Mono) */
    Mono<ProductSale> eliminarLogico(String id);

    /** Restaurar lógicamente un producto (cambia estado a "A") (Mono) */
    Mono<ProductSale> restaurarLogico(String id);
}