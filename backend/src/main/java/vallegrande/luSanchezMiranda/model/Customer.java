package vallegrande.luSanchezMiranda.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    private String idCustomer;

    @NotNull(message = "El código de ubigeo no puede ser nulo")
    private String ubigeoCode;

    @NotNull(message = "El nombre no puede ser nulo")
    @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
    private String customerName;

    @NotNull(message = "El apellido no puede ser nulo")
    @Size(max = 60, message = "El apellido no puede exceder los 60 caracteres")
    private String customerLastname;

    @NotNull(message = "El tipo de cliente no puede ser nulo")
    @Pattern(regexp = "^(Natural|Empresa)$", message = "El tipo de cliente debe ser 'Natural' o 'Empresa'")
    private String customerType;

    @NotNull(message = "El tipo de documento no puede ser nulo")
    @Pattern(regexp = "^(DNI|RUC|CE)$", message = "El tipo de documento debe ser 'DNI', 'RUC' o 'CE'")
    private String documentType;

    @NotNull(message = "El número de documento no puede ser nulo")
    @Size(max = 15, message = "El número de documento no puede exceder los 15 caracteres")
    private String documentNumber;

    @NotNull(message = "El correo electrónico no puede ser nulo")
    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 150, message = "El correo no puede exceder los 150 caracteres")
    private String email;

    @NotNull(message = "El teléfono no puede ser nulo")
    @Size(min = 9, max = 9, message = "El teléfono debe tener exactamente 9 dígitos")
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe contener solo dígitos")
    private String phone;

    @NotNull(message = "La dirección no puede ser nula")
    @Size(max = 200, message = "La dirección no puede exceder los 200 caracteres")
    private String address;

    @Builder.Default
    private Boolean status = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private LocalDateTime restoredAt;

    public String getDni() {
        return this.documentNumber;
    }

    public String getCellPhone() {
        return this.phone;
    }

    public String getFirstName() {
        return this.customerName;
    }

    public String getLastName() {
        return this.customerLastname;
    }
}
