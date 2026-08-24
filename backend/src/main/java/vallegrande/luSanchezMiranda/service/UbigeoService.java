package vallegrande.luSanchezMiranda.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Ubigeo;

public interface UbigeoService {
    Flux<Ubigeo> findAll();
    Mono<Ubigeo> findById(String id);
    Mono<Ubigeo> save(Ubigeo ubigeo);
    Mono<Ubigeo> update(String id, Ubigeo ubigeo);
    Mono<Void> delete(String id);
}
