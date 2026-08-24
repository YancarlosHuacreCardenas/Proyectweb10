package vallegrande.luSanchezMiranda.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ubigeos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ubigeo {
    @Id
    private String ubigeoCode;

    @NotNull(message = "El departamento no puede ser nulo")
    @Size(max = 100)
    private String department;

    @NotNull(message = "La provincia no puede ser nula")
    @Size(max = 100)
    private String province;

    @NotNull(message = "El distrito no puede ser nulo")
    @Size(max = 100)
    private String district;
}
