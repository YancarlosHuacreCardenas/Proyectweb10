package vallegrande.luSanchezMiranda.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import vallegrande.luSanchezMiranda.model.Ubigeo;

@Repository
public interface UbigeoRepository extends ReactiveMongoRepository<Ubigeo, String> {
}
