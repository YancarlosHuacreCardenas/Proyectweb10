package vallegrande.luSanchezMiranda.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import vallegrande.luSanchezMiranda.model.Customer;
import reactor.core.publisher.Flux;

@Repository
public interface CustomerRepository extends ReactiveMongoRepository<Customer, String> {
    Flux<Customer> findByStatus(Boolean status);
}
