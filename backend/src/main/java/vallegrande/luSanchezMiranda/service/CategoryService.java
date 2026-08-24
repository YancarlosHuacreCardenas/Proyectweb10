package vallegrande.luSanchezMiranda.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Category;

public interface CategoryService {
    Flux<Category> findAll();
    Flux<Category> findByStatus(Boolean status);
    Mono<Category> findById(String id);
    Mono<Category> save(Category category);
    Mono<Category> update(String id, Category category);
    Mono<Category> deleteLogical(String id);
    Mono<Category> restoreLogical(String id);
}
