package vallegrande.luSanchezMiranda.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Supplier;
import vallegrande.luSanchezMiranda.service.SupplierService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/supplier")
@RequiredArgsConstructor
public class SupplierRest {

    private final SupplierService supplierService;

    @GetMapping
    public Flux<Supplier> listAll(@RequestParam(required = false) Boolean status) {
        if (status != null) {
            return supplierService.findByStatus(status);
        }
        return supplierService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Supplier> listById(@PathVariable String id) {
        return supplierService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Supplier> create(@Valid @RequestBody Supplier supplier) {
        return supplierService.save(supplier);
    }

    @PutMapping("/{id}")
    public Mono<Supplier> update(@PathVariable String id, @Valid @RequestBody Supplier supplier) {
        return supplierService.update(id, supplier);
    }

    @PatchMapping("/{id}/delete")
    public Mono<Supplier> deleteLogical(@PathVariable String id) {
        return supplierService.deleteLogical(id);
    }

    @PatchMapping("/{id}/restore")
    public Mono<Supplier> restoreLogical(@PathVariable String id) {
        return supplierService.restoreLogical(id);
    }
}
