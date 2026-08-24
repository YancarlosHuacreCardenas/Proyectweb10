package vallegrande.luSanchezMiranda.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Documento MongoDB que representa un producto destinado a la venta.
 * Mapea la colección "products_sale".
 */
@Document(collection = "products_sale")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSale {

    /** Identificador único del producto de venta en MongoDB (ObjectId hex string). */
    @Id
    private String id;

    /** Nombre del producto de venta. Máximo 100 caracteres. No puede estar vacío. */
    @NotNull(message = "El nombre del producto no puede ser nulo")
    @NotBlank(message = "El nombre del producto no puede estar vacío")
    @Size(min = 3, max = 100, message = "El nombre del producto debe tener entre 3 y 100 caracteres")
    private String productName;

    /** Precio unitario del producto. Debe ser mayor a 0 y no exceder 99999.99. */
    @NotNull(message = "El precio no puede ser nulo")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @DecimalMax(value = "99999.99", message = "El precio no puede exceder 99999.99")
    private BigDecimal price;

    /** Cantidad de unidades disponibles en stock. No puede ser negativa ni exceder 100000. */
    @NotNull(message = "El stock disponible no puede ser nulo")
    @Min(value = 0, message = "El stock disponible no puede ser negativo")
    @Max(value = 100000, message = "El stock disponible no puede exceder 100000 unidades")
    @Builder.Default
    private Integer availableStock = 0;

    /** Unidad de medida del producto. Valores permitidos: UNIDAD, KG, LITRO, SACO, SOBRE, ROLLO. */
    @NotNull(message = "La unidad de medida no puede ser nula")
    @Pattern(regexp = "^(UNIDAD|KG|LITRO|SACO|SOBRE|ROLLO)$", message = "La unidad de medida debe ser una de las siguientes: UNIDAD, KG, LITRO, SACO, SOBRE, ROLLO")
    private String unitMeasurement;

    /** Descripción detallada del producto. Entre 10 y 255 caracteres. No puede estar vacía. */
    @NotNull(message = "La descripción no puede ser nula")
    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(min = 10, max = 255, message = "La descripción debe tener entre 10 y 255 caracteres")
    private String description;

    /** Estado del registro: "A" (Activo), "I" (Inactivo / Eliminado Lógico). */
    @Builder.Default
    private String status = "A";

    /** Fecha y hora de creación del registro. */
    private LocalDateTime createdAt;

    /** Fecha y hora de la última actualización del registro. */
    private LocalDateTime updatedAt;

    /** Fecha y hora de eliminación lógica del registro. Nulo si está activo. */
    private LocalDateTime deletedAt;

    /** Fecha y hora de restauración del registro. Nulo si no fue restaurado. */
    private LocalDateTime restoredAt;

    /** Nombre de la categoría del producto de venta. */
    private String category;

    // Métodos de compatibilidad para código legacy
    public String getProductsSaleId() {
        return id;
    }

    public void setProductsSaleId(String productsSaleId) {
        this.id = productsSaleId;
    }

    public void setProductsSaleId(Integer productsSaleId) {
        this.id = (productsSaleId != null) ? String.valueOf(productsSaleId) : null;
    }

    public void setProductsSaleId(Object productsSaleId) {
        this.id = (productsSaleId != null) ? String.valueOf(productsSaleId) : null;
    }
}
