package vallegrande.luSanchezMiranda.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Supplier;
import vallegrande.luSanchezMiranda.repository.SupplierRepository;
import vallegrande.luSanchezMiranda.service.SupplierService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public Flux<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    @Override
    public Flux<Supplier> findByStatus(Boolean status) {
        return supplierRepository.findByStatus(status);
    }

    @Override
    public Mono<Supplier> findById(String id) {
        return supplierRepository.findById(id);
    }

    @Override
    public Mono<Supplier> save(Supplier supplier) {
        supplier.setCreatedAt(LocalDateTime.now());
        supplier.setUpdatedAt(LocalDateTime.now());
        supplier.setStatus(true);
        return supplierRepository.save(supplier);
    }

    @Override
    public Mono<Supplier> update(String id, Supplier supplier) {
        return supplierRepository.findById(id)
                .flatMap(existingSupplier -> {
                    existingSupplier.setCompanyName(supplier.getCompanyName());
                    existingSupplier.setRuc(supplier.getRuc());
                    existingSupplier.setPhone(supplier.getPhone());
                    existingSupplier.setEmail(supplier.getEmail());
                    existingSupplier.setAddress(supplier.getAddress());
                    existingSupplier.setUbigeoCode(supplier.getUbigeoCode());
                    existingSupplier.setIdCategory(supplier.getIdCategory());
                    existingSupplier.setUpdatedAt(LocalDateTime.now());
                    return supplierRepository.save(existingSupplier);
                });
    }

    @Override
    public Mono<Supplier> deleteLogical(String id) {
        return supplierRepository.findById(id)
                .flatMap(existingSupplier -> {
                    existingSupplier.setStatus(false);
                    existingSupplier.setDeletedAt(LocalDateTime.now());
                    existingSupplier.setUpdatedAt(LocalDateTime.now());
                    return supplierRepository.save(existingSupplier);
                });
    }

    @Override
    public Mono<Supplier> restoreLogical(String id) {
        return supplierRepository.findById(id)
                .flatMap(existingSupplier -> {
                    existingSupplier.setStatus(true);
                    existingSupplier.setRestoredAt(LocalDateTime.now());
                    existingSupplier.setUpdatedAt(LocalDateTime.now());
                    return supplierRepository.save(existingSupplier);
                });
    }
}
