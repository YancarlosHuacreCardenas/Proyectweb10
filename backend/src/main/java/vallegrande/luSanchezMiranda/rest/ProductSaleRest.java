package vallegrande.luSanchezMiranda.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.ProductSale;
import vallegrande.luSanchezMiranda.service.ProductSaleService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/product-sale")
@Tag(name = "ProductSale", description = "CRUD Reactivo de Productos de Venta (Spring WebFlux + MongoDB)")
public class ProductSaleRest {

    @Autowired
    private ProductSaleService service;

    /**
     * GET: Listar todos los productos de venta (FLUX)
     */
    @Operation(summary = "Listar todos los productos de venta", description = "Obtiene un Flux con la lista completa de productos.")
    @GetMapping
    public Flux<ProductSale> listar() {
        return service.listar();
    }

    /**
     * GET: Listar productos por estado (FLUX)
     * Ej: /api/product-sale/status/A o /api/product-sale/status/I
     */
    @Operation(summary = "Listar productos por estado", description = "Obtiene un Flux con los productos filtrados por su estado ('A' o 'I').")
    @GetMapping("/status/{status}")
    public Flux<ProductSale> listarPorEstado(@PathVariable String status) {
        return service.listarPorEstado(status);
    }

    /**
     * GET: Listar productos activos (FLUX)
     */
    @Operation(summary = "Listar productos activos", description = "Obtiene un Flux con los productos activos ('A').")
    @GetMapping("/activos")
    public Flux<ProductSale> listarActivos() {
        return service.listarPorEstado("A");
    }

    /**
     * GET: Listar productos inactivos (FLUX)
     */
    @Operation(summary = "Listar productos inactivos", description = "Obtiene un Flux con los productos inactivos ('I').")
    @GetMapping("/inactivos")
    public Flux<ProductSale> listarInactivos() {
        return service.listarPorEstado("I");
    }

    /**
     * GET: Listar producto por ID (MONO)
     */
    @Operation(summary = "Buscar producto por ID", description = "Obtiene un Mono con el producto específico según su ID.")
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ProductSale>> listarPorId(@PathVariable String id) {
        return service.listarPorId(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST: Crear producto de venta (MONO)
     */
    @Operation(summary = "Crear producto de venta", description = "Registra un nuevo producto en MongoDB y retorna un Mono.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ProductSale> guardar(@Valid @RequestBody ProductSale product) {
        return service.guardar(product);
    }

    /**
     * PUT: Editar producto de venta por ID (MONO)
     */
    @Operation(summary = "Actualizar producto de venta", description = "Modifica un producto existente por su ID y retorna un Mono.")
    @PutMapping("/{id}")
    public Mono<ResponseEntity<ProductSale>> actualizar(@PathVariable String id,
            @Valid @RequestBody ProductSale product) {
        return service.actualizar(id, product)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * PATCH: Eliminar lógico de producto (MONO)
     * Soporta tanto /api/product-sale/eliminar/{id} como
     * /api/product-sale/{id}/eliminar
     */
    @Operation(summary = "Eliminación lógica de producto", description = "Cambia el estado del producto a inactivo ('I') y retorna un Mono.")
    @PatchMapping({ "/eliminar/{id}", "/{id}/eliminar" })
    public Mono<ResponseEntity<ProductSale>> eliminarLogico(@PathVariable String id) {
        return service.eliminarLogico(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * PATCH: Restaurar lógico de producto (MONO)
     * Soporta tanto /api/product-sale/restaurar/{id} como
     * /api/product-sale/{id}/restaurar
     */
    @Operation(summary = "Restaurar producto inactivo", description = "Cambia el estado del producto a activo ('A') y retorna un Mono.")
    @PatchMapping({ "/restaurar/{id}", "/{id}/restaurar" })
    public Mono<ResponseEntity<ProductSale>> restaurarLogico(@PathVariable String id) {
        return service.restaurarLogico(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
