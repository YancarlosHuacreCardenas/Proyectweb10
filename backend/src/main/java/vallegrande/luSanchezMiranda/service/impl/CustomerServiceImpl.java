package vallegrande.luSanchezMiranda.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Customer;
import vallegrande.luSanchezMiranda.repository.CustomerRepository;
import vallegrande.luSanchezMiranda.service.CustomerService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public Flux<Customer> findAll() {
        return customerRepository.findAll();
    }

    @Override
    public Flux<Customer> findByStatus(Boolean status) {
        return customerRepository.findByStatus(status);
    }

    @Override
    public Mono<Customer> findById(String id) {
        return customerRepository.findById(id);
    }

    @Override
    public Mono<Customer> save(Customer customer) {
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        customer.setStatus(true);
        return customerRepository.save(customer);
    }

    @Override
    public Mono<Customer> update(String id, Customer customer) {
        return customerRepository.findById(id)
                .flatMap(existingCustomer -> {
                    existingCustomer.setCustomerName(customer.getCustomerName());
                    existingCustomer.setCustomerLastname(customer.getCustomerLastname());
                    existingCustomer.setCustomerType(customer.getCustomerType());
                    existingCustomer.setDocumentType(customer.getDocumentType());
                    existingCustomer.setDocumentNumber(customer.getDocumentNumber());
                    existingCustomer.setEmail(customer.getEmail());
                    existingCustomer.setPhone(customer.getPhone());
                    existingCustomer.setAddress(customer.getAddress());
                    existingCustomer.setUbigeoCode(customer.getUbigeoCode());
                    existingCustomer.setUpdatedAt(LocalDateTime.now());
                    return customerRepository.save(existingCustomer);
                });
    }

    @Override
    public Mono<Customer> deleteLogical(String id) {
        return customerRepository.findById(id)
                .flatMap(existingCustomer -> {
                    existingCustomer.setStatus(false);
                    existingCustomer.setDeletedAt(LocalDateTime.now());
                    existingCustomer.setUpdatedAt(LocalDateTime.now());
                    return customerRepository.save(existingCustomer);
                });
    }

    @Override
    public Mono<Customer> restoreLogical(String id) {
        return customerRepository.findById(id)
                .flatMap(existingCustomer -> {
                    existingCustomer.setStatus(true);
                    existingCustomer.setRestoredAt(LocalDateTime.now());
                    existingCustomer.setUpdatedAt(LocalDateTime.now());
                    return customerRepository.save(existingCustomer);
                });
    }
}
