package vallegrande.luSanchezMiranda.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import vallegrande.luSanchezMiranda.model.Category;

@Repository
public interface CategoryRepository extends ReactiveMongoRepository<Category, String> {
    Flux<Category> findByStatus(Boolean status);
}
