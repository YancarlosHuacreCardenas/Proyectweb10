package vallegrande.luSanchezMiranda.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Supplier;

public interface SupplierService {
    Flux<Supplier> findAll();
    Flux<Supplier> findByStatus(Boolean status);
    Mono<Supplier> findById(String id);
    Mono<Supplier> save(Supplier supplier);
    Mono<Supplier> update(String id, Supplier supplier);
    Mono<Supplier> deleteLogical(String id);
    Mono<Supplier> restoreLogical(String id);
}
