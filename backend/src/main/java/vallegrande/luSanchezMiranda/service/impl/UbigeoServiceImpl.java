package vallegrande.luSanchezMiranda.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vallegrande.luSanchezMiranda.model.Ubigeo;
import vallegrande.luSanchezMiranda.repository.UbigeoRepository;
import vallegrande.luSanchezMiranda.service.UbigeoService;

@Service
@RequiredArgsConstructor
public class UbigeoServiceImpl implements UbigeoService {

    private final UbigeoRepository ubigeoRepository;

    @Override
    public Flux<Ubigeo> findAll() {
        return ubigeoRepository.findAll();
    }

    @Override
    public Mono<Ubigeo> findById(String id) {
        return ubigeoRepository.findById(id);
    }

    @Override
    public Mono<Ubigeo> save(Ubigeo ubigeo) {
        return ubigeoRepository.save(ubigeo);
    }

    @Override
    public Mono<Ubigeo> update(String id, Ubigeo ubigeo) {
        return ubigeoRepository.findById(id)
                .flatMap(existing -> {
                    existing.setDepartment(ubigeo.getDepartment());
                    existing.setProvince(ubigeo.getProvince());
                    existing.setDistrict(ubigeo.getDistrict());
                    return ubigeoRepository.save(existing);
                });
    }

    @Override
    public Mono<Void> delete(String id) {
        return ubigeoRepository.deleteById(id);
    }
}
