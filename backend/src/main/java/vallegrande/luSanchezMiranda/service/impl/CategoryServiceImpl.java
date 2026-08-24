package vallegrande.luSanchezMiranda.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Category;
import vallegrande.luSanchezMiranda.repository.CategoryRepository;
import vallegrande.luSanchezMiranda.service.CategoryService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Flux<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Flux<Category> findByStatus(Boolean status) {
        return categoryRepository.findByStatus(status);
    }

    @Override
    public Mono<Category> findById(String id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Mono<Category> save(Category category) {
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setStatus(true);
        return categoryRepository.save(category);
    }

    @Override
    public Mono<Category> update(String id, Category category) {
        return categoryRepository.findById(id)
                .flatMap(existingCategory -> {
                    existingCategory.setCategoryName(category.getCategoryName());
                    existingCategory.setCategoryType(category.getCategoryType());
                    existingCategory.setUpdatedAt(LocalDateTime.now());
                    return categoryRepository.save(existingCategory);
                });
    }

    @Override
    public Mono<Category> deleteLogical(String id) {
        return categoryRepository.findById(id)
                .flatMap(existingCategory -> {
                    existingCategory.setStatus(false);
                    existingCategory.setDeletedAt(LocalDateTime.now());
                    existingCategory.setUpdatedAt(LocalDateTime.now());
                    return categoryRepository.save(existingCategory);
                });
    }

    @Override
    public Mono<Category> restoreLogical(String id) {
        return categoryRepository.findById(id)
                .flatMap(existingCategory -> {
                    existingCategory.setStatus(true);
                    existingCategory.setRestoredAt(LocalDateTime.now());
                    existingCategory.setUpdatedAt(LocalDateTime.now());
                    return categoryRepository.save(existingCategory);
                });
    }
}
