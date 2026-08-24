package vallegrande.luSanchezMiranda.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Category;
import vallegrande.luSanchezMiranda.service.CategoryService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/category")
@RequiredArgsConstructor
public class CategoryRest {

    private final CategoryService categoryService;

    @GetMapping
    public Flux<Category> listAll(@RequestParam(required = false) Boolean status) {
        if (status != null) {
            return categoryService.findByStatus(status);
        }
        return categoryService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Category> listById(@PathVariable String id) {
        return categoryService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Category> create(@Valid @RequestBody Category category) {
        return categoryService.save(category);
    }

    @PutMapping("/{id}")
    public Mono<Category> update(@PathVariable String id, @Valid @RequestBody Category category) {
        return categoryService.update(id, category);
    }

    @PatchMapping("/{id}/delete")
    public Mono<Category> deleteLogical(@PathVariable String id) {
        return categoryService.deleteLogical(id);
    }

    @PatchMapping("/{id}/restore")
    public Mono<Category> restoreLogical(@PathVariable String id) {
        return categoryService.restoreLogical(id);
    }
}
