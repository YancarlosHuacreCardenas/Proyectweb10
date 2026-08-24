package vallegrande.luSanchezMiranda.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Customer;
import vallegrande.luSanchezMiranda.service.CustomerService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
public class CustomerRest {

    private final CustomerService customerService;

    @GetMapping
    public Flux<Customer> listAll(@RequestParam(required = false) Boolean status) {
        if (status != null) {
            return customerService.findByStatus(status);
        }
        return customerService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Customer> listById(@PathVariable String id) {
        return customerService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Customer> create(@Valid @RequestBody Customer customer) {
        return customerService.save(customer);
    }

    @PutMapping("/{id}")
    public Mono<Customer> update(@PathVariable String id, @Valid @RequestBody Customer customer) {
        return customerService.update(id, customer);
    }

    @PatchMapping("/{id}/delete")
    public Mono<Customer> deleteLogical(@PathVariable String id) {
        return customerService.deleteLogical(id);
    }

    @PatchMapping("/{id}/restore")
    public Mono<Customer> restoreLogical(@PathVariable String id) {
        return customerService.restoreLogical(id);
    }
}
