package vallegrande.luSanchezMiranda.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Ubigeo;
import vallegrande.luSanchezMiranda.service.UbigeoService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/v1/ubigeo")
@RequiredArgsConstructor
public class UbigeoRest {

    private final UbigeoService ubigeoService;

    @GetMapping
    public Flux<Ubigeo> listAll() {
        return ubigeoService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Ubigeo> listById(@PathVariable String id) {
        return ubigeoService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Ubigeo> create(@Valid @RequestBody Ubigeo ubigeo) {
        return ubigeoService.save(ubigeo);
    }

    @PutMapping("/{id}")
    public Mono<Ubigeo> update(@PathVariable String id, @Valid @RequestBody Ubigeo ubigeo) {
        return ubigeoService.update(id, ubigeo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable String id) {
        return ubigeoService.delete(id);
    }
}
