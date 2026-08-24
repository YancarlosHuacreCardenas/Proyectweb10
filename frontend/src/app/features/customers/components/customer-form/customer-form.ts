import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Customer }     from '../../models/customer.model';
import { Ubigeo }       from '../../../../shared/interfaces/ubigeo.interface';
import { UbigeoService } from '../../../../shared/services/ubigeo.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.css'],
})
export class CustomerFormComponent implements OnInit, OnChanges {

  @Input() mode: 'create' | 'edit' | null = 'create';
  @Input() customer: Customer | null = null;

  @Output() save   = new EventEmitter<Customer>();
  @Output() cancel = new EventEmitter<void>();

  // ── Form model ────────────────────────────────────────────────
  form = {
    customerName:     '',
    customerLastname: '',
    documentType:     'DNI',
    documentNumber:   '',
    customerType:     'Natural',
    email:            '',
    phone:            '',
    address:          '',
    status:           true,
    ubigeoCode:       ''
  };

  ubigeos: Ubigeo[] = [];
  errors: { [key: string]: string } = {};

  constructor(private ubigeoService: UbigeoService) {}

  get isEdit(): boolean { return this.mode === 'edit'; }
  get title():  string  { return this.isEdit ? 'Editar Cliente' : 'Nuevo Cliente'; }
  get subtitle(): string { return this.isEdit ? 'Actualiza los datos del cliente' : 'Complete los datos del cliente'; }
  get saveLabel(): string { return this.isEdit ? 'Actualizar' : 'Guardar Cliente'; }

  // Placeholder dinámico según tipo de documento
  get docNumberPlaceholder(): string {
    switch (this.form.documentType) {
      case 'DNI': return 'Ingrese los 8 dígitos del DNI';
      case 'RUC': return 'Ingrese los 11 dígitos del RUC';
      case 'CE':  return 'Ingrese el número de carnet de extranjería';
      default:    return 'Ingrese el número de documento';
    }
  }

  // Al cambiar tipo de cliente → ajusta tipo de documento automáticamente
  onCustomerTypeChange(): void {
    if (this.form.customerType === 'Empresa') {
      this.form.documentType   = 'RUC';
      this.form.documentNumber = '';   // limpiar porque el formato cambia
    } else if (this.form.customerType === 'Natural') {
      this.form.documentType   = 'DNI';
      this.form.documentNumber = '';
    }
  }

  ngOnInit(): void {
    this.loadUbigeos();
    this.fillForm();
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c['customer'] || c['mode']) this.fillForm();
  }

  loadUbigeos() {
    this.ubigeoService.listar().subscribe({
      next: (data) => this.ubigeos = data,
      error: (err) => console.error('Error loading ubigeos', err)
    });
  }

  private fillForm(): void {
    if (this.isEdit && this.customer) {
      this.form = {
        customerName:     this.customer.customerName,
        customerLastname: this.customer.customerLastname,
        documentType:     this.customer.documentType,
        documentNumber:   this.customer.documentNumber,
        customerType:     this.customer.customerType,
        email:            this.customer.email,
        phone:            this.customer.phone,
        address:          this.customer.address,
        status:           this.customer.status ?? true,
        ubigeoCode:       this.customer.ubigeoCode || ''
      };
    } else {
      this.form = {
        customerName: '',
        customerLastname: '',
        documentType: 'DNI',
        documentNumber: '',
        customerType: 'Natural',
        email: '',
        phone: '',
        address: '',
        status: true,
        ubigeoCode: ''
      };
    }
    this.errors = {};
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDocumentNumber(docNumber: string, docType: string): boolean {
    const cleaned = docNumber.replace(/\s/g, '');
    switch (docType) {
      case 'DNI':
        return /^\d{8}$/.test(cleaned);
      case 'RUC':
        return /^\d{11}$/.test(cleaned);
      case 'CE':
        return cleaned.length >= 5 && cleaned.length <= 13;
      default:
        return cleaned.length > 0;
    }
  }

  private isNumericOnly(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  validate(): boolean {
    this.errors = {};

    // Validar nombre
    const nameClean = this.form.customerName.trim();
    if (!nameClean) {
      this.errors['customerName'] = 'El nombre es requerido';
    } else if (nameClean.length < 2) {
      this.errors['customerName'] = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    const lastnameClean = this.form.customerLastname.trim();
    if (!lastnameClean) {
      this.errors['customerLastname'] = 'El apellido es requerido';
    } else if (lastnameClean.length < 2) {
      this.errors['customerLastname'] = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar documento
    const docClean = this.form.documentNumber.trim();
    if (!docClean) {
      this.errors['documentNumber'] = 'El número de documento es requerido';
    } else if (!this.isValidDocumentNumber(docClean, this.form.documentType)) {
      if (this.form.documentType === 'DNI') {
        this.errors['documentNumber'] = 'El DNI debe tener exactamente 8 dígitos';
      } else if (this.form.documentType === 'RUC') {
        this.errors['documentNumber'] = 'El RUC debe tener exactamente 11 dígitos';
      } else {
        this.errors['documentNumber'] = 'El formato del documento no es válido';
      }
    }

    // Validar email
    const emailClean = this.form.email.trim();
    if (!emailClean) {
      this.errors['email'] = 'El email es requerido';
    } else if (!this.isValidEmail(emailClean)) {
      this.errors['email'] = 'Ingresa un email válido (ejemplo: usuario@dominio.com)';
    }

    // Validar teléfono
    const phoneClean = this.form.phone.trim();
    if (!phoneClean) {
      this.errors['phone'] = 'El teléfono es requerido';
    } else if (!this.isNumericOnly(phoneClean)) {
      this.errors['phone'] = 'El teléfono solo debe contener dígitos';
    } else if (phoneClean.length !== 9) {
      this.errors['phone'] = 'El teléfono debe tener exactamente 9 dígitos';
    }

    // Validar dirección
    const addressClean = this.form.address.trim();
    if (!addressClean) {
      this.errors['address'] = 'La dirección es requerida';
    } else if (addressClean.length < 5) {
      this.errors['address'] = 'La dirección debe tener al menos 5 caracteres';
    }

    // Validar ubigeo
    if (!this.form.ubigeoCode) {
      this.errors['ubigeo'] = 'El ubigeo es requerido';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSave(): void {
    if (!this.validate()) return;
    const payload = {
      customerName:     this.form.customerName.trim(),
      customerLastname: this.form.customerLastname.trim(),
      documentType:     this.form.documentType,
      documentNumber:   this.form.documentNumber.trim(),
      customerType:     this.form.customerType,
      email:            this.form.email.trim(),
      phone:            this.form.phone.trim(),
      address:          this.form.address.trim(),
      status:           this.form.status,
      ubigeoCode:       this.form.ubigeoCode
    };
    this.save.emit(payload as any);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
