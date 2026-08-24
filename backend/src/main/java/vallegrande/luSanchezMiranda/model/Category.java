package vallegrande.luSanchezMiranda.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    private String idCategory;

    @NotNull(message = "El nombre de la categoría no puede ser nulo")
    @Size(max = 100, message = "El nombre de la categoría no puede exceder los 100 caracteres")
    private String categoryName;

    @NotNull(message = "El tipo de categoría no puede ser nulo")
    @Size(max = 50, message = "El tipo de categoría no puede exceder los 50 caracteres")
    private String categoryType;

    @Builder.Default
    private Boolean status = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private LocalDateTime restoredAt;
}