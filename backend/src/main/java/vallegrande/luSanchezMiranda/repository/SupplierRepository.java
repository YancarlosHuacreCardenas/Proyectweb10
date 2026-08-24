package vallegrande.luSanchezMiranda.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import vallegrande.luSanchezMiranda.model.Supplier;

@Repository
public interface SupplierRepository extends ReactiveMongoRepository<Supplier, String> {
    Flux<Supplier> findByStatus(Boolean status);
}