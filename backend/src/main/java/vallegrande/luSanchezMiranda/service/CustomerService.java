package vallegrande.luSanchezMiranda.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Customer;

public interface CustomerService {
    Flux<Customer> findAll();
    Flux<Customer> findByStatus(Boolean status);
    Mono<Customer> findById(String id);
    Mono<Customer> save(Customer customer);
    Mono<Customer> update(String id, Customer customer);
    Mono<Customer> deleteLogical(String id);
    Mono<Customer> restoreLogical(String id);
}
