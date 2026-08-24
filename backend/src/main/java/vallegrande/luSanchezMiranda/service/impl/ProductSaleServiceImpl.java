package vallegrande.luSanchezMiranda.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.ProductSale;
import vallegrande.luSanchezMiranda.repository.ProductSaleRepository;
import vallegrande.luSanchezMiranda.service.ProductSaleService;

import java.time.LocalDateTime;

@Service
public class ProductSaleServiceImpl implements ProductSaleService {

    @Autowired
    private ProductSaleRepository repository;

    @Override
    public Flux<ProductSale> listar() {
        return repository.findAll();
    }

    @Override
    public Flux<ProductSale> listarPorEstado(String status) {
        if (status == null || status.trim().isEmpty()) {
            return repository.findAll();
        }
        return repository.findByStatusIgnoreCase(status.trim());
    }

    @Override
    public Mono<ProductSale> listarPorId(String id) {
        return repository.findById(id);
    }

    @Override
    public Mono<ProductSale> guardar(ProductSale product) {
        if (product.getStatus() == null || product.getStatus().trim().isEmpty()) {
            product.setStatus("A");
        }
        product.setCreatedAt(LocalDateTime.now());
        product.setDeletedAt(null);
        product.setRestoredAt(null);
        return repository.save(product);
    }

    @Override
    public Mono<ProductSale> actualizar(String id, ProductSale product) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setProductName(product.getProductName());
                    existente.setPrice(product.getPrice());
                    existente.setAvailableStock(product.getAvailableStock());
                    existente.setUnitMeasurement(product.getUnitMeasurement());
                    existente.setDescription(product.getDescription());
                    existente.setCategory(product.getCategory());
                    existente.setUpdatedAt(LocalDateTime.now());
                    return repository.save(existente);
                });
    }

    @Override
    public Mono<ProductSale> eliminarLogico(String id) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setStatus("I");
                    existente.setDeletedAt(LocalDateTime.now());
                    return repository.save(existente);
                });
    }

    @Override
    public Mono<ProductSale> restaurarLogico(String id) {
        return repository.findById(id)
                .flatMap(existente -> {
                    existente.setStatus("A");
                    existente.setDeletedAt(null);
                    existente.setRestoredAt(LocalDateTime.now());
                    return repository.save(existente);
                });
    }
}