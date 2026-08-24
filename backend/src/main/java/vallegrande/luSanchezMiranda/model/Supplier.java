package vallegrande.luSanchezMiranda.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    private String idSupplier;

    @NotNull(message = "La razón social no puede ser nula")
    @Size(max = 150, message = "La razón social no puede exceder los 150 caracteres")
    private String companyName;

    @NotNull(message = "El RUC no puede ser nulo")
    @Size(min = 11, max = 11, message = "El RUC debe tener exactamente 11 dígitos")
    @Pattern(regexp = "\\d{11}", message = "El RUC debe contener solo dígitos")
    private String ruc;

    @NotNull(message = "El teléfono no puede ser nulo")
    private String phone;

    @NotNull(message = "El correo electrónico no puede ser nulo")
    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 100, message = "El correo electrónico no puede exceder los 100 caracteres")
    private String email;

    @NotNull(message = "La dirección no puede ser nula")
    @Size(max = 200, message = "La dirección no puede exceder los 200 caracteres")
    private String address;

    private String ubigeoCode;

    private String idCategory;

    @Builder.Default
    private Boolean status = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private LocalDateTime restoredAt;

    // Métodos helper de compatibilidad si son requeridos
    public String getSupplierId() {
        return idSupplier;
    }

    public void setSupplierId(String supplierId) {
        this.idSupplier = supplierId;
    }
}