package vallegrande.luSanchezMiranda.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.ProductSale;

@Repository
public interface ProductSaleRepository extends ReactiveMongoRepository<ProductSale, String> {

    /**
     * Obtiene una lista (Flux) de productos filtrados por su estado ("A" o "I").
     */
    Flux<ProductSale> findByStatus(String status);

    /**
     * Obtiene una lista (Flux) de productos por estado de forma case-insensitive.
     */
    Flux<ProductSale> findByStatusIgnoreCase(String status);

    /**
     * Obtiene productos cuyo nombre contenga la cadena proporcionada (case-insensitive).
     */
    Flux<ProductSale> findByProductNameContainingIgnoreCase(String productName);

    /**
     * Obtiene un producto por su nombre exacto (Mono).
     */
    Mono<ProductSale> findByProductName(String productName);

    /**
     * Sobrecarga de compatibilidad para consultas por ID numérico (convierte a String).
     */
    default Mono<ProductSale> findById(Integer id) {
        return id != null ? findById(String.valueOf(id)) : Mono.empty();
    }
}
