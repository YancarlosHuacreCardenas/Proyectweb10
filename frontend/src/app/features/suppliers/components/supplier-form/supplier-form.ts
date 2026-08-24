import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Supplier, CATEGORY_MAP }     from '../../models/supplier.model';
import { Ubigeo }       from '../../../../shared/interfaces/ubigeo.interface';
import { UbigeoService } from '../../../../shared/services/ubigeo.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-form.html',
  styleUrls: ['./supplier-form.css'],
})
export class SupplierFormComponent implements OnInit, OnChanges {

  @Input() mode: 'create' | 'edit' | null = 'create';
  @Input() supplier: Supplier | null = null;
  @Input() isSaving: boolean = false;

  @Output() save   = new EventEmitter<Supplier>();
  @Output() cancel = new EventEmitter<void>();

  form = {
    companyName: '',
    ruc:         '',
    categoryId:  1,
    status:      true,
    address:     '',
    email:       '',
    phone:       '' as number | string,
    ubigeoCode:  0,
  };

  ubigeos: Ubigeo[] = [];
  categories = Object.entries(CATEGORY_MAP).map(([id, name]) => ({ id: +id, name }));
  errors: { [key: string]: string } = {};

  constructor(private ubigeoService: UbigeoService) {}

  get isEdit(): boolean { return this.mode === 'edit'; }
  get title():  string  { return this.isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'; }
  get subtitle(): string { return this.isEdit ? 'Actualiza los datos del proveedor' : 'Complete los datos del proveedor'; }
  get saveLabel(): string { 
    if (this.isSaving) return 'Procesando...';
    return this.isEdit ? 'Actualizar' : 'Registrar Proveedor'; 
  }

  ngOnInit(): void {
    this.loadUbigeos();
    this.fillForm();
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c['supplier'] || c['mode']) this.fillForm();
  }

  loadUbigeos() {
    this.ubigeoService.listar().subscribe({
      next: (data) => this.ubigeos = data,
      error: (err) => console.error('Error loading ubigeos', err)
    });
  }

  private fillForm(): void {
    if (this.isEdit && this.supplier) {
      this.form = {
        companyName: this.supplier.companyName,
        ruc:         this.supplier.ruc,
        categoryId:  this.supplier.category?.categoryId ?? 1,
        status:      this.supplier.status ?? true,
        address:     this.supplier.address,
        email:       this.supplier.email,
        phone:       this.supplier.phone,
        ubigeoCode:  this.supplier.ubigeo?.ubigeoCode ?? 0,
      };
    } else {
      this.form = {
        companyName: '',
        ruc:         '',
        categoryId:  1,
        status:      true,
        address:     '',
        email:       '',
        phone:       '',
        ubigeoCode:  0,
      };
    }
    this.errors = {};
  }

  validateField(field: string): void {
    switch (field) {
      case 'companyName':
        if (!this.form.companyName?.trim()) {
          this.errors['companyName'] = 'El nombre o razón social es requerido';
        } else {
          delete this.errors['companyName'];
        }
        break;
      case 'ruc':
        const rucVal = this.form.ruc?.trim() || '';
        if (!rucVal) {
          this.errors['ruc'] = 'El RUC es requerido';
        } else if (!/^\d+$/.test(rucVal)) {
          this.errors['ruc'] = 'El RUC debe contener solo números';
        } else if (rucVal.length !== 11) {
          this.errors['ruc'] = 'El RUC debe tener exactamente 11 dígitos';
        } else {
          delete this.errors['ruc'];
        }
        break;
      case 'email':
        const emailVal = this.form.email?.trim() || '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal) {
          this.errors['email'] = 'El email es requerido';
        } else if (!emailRegex.test(emailVal)) {
          this.errors['email'] = 'El email debe tener un formato válido (ejemplo@dominio.com)';
        } else {
          delete this.errors['email'];
        }
        break;
      case 'phone':
        const phoneVal = String(this.form.phone || '').trim();
        if (!phoneVal) {
          this.errors['phone'] = 'El teléfono es requerido';
        } else if (!/^\d+$/.test(phoneVal)) {
          this.errors['phone'] = 'El teléfono debe contener solo números';
        } else if (phoneVal.length !== 9) {
          this.errors['phone'] = 'El teléfono debe tener exactamente 9 dígitos';
        } else {
          delete this.errors['phone'];
        }
        break;
      case 'address':
        if (!this.form.address?.trim()) {
          this.errors['address'] = 'La dirección es requerida';
        } else {
          delete this.errors['address'];
        }
        break;
      case 'ubigeoCode':
      case 'ubigeo':
        if (!this.form.ubigeoCode) {
          this.errors['ubigeo'] = 'El ubigeo es requerido';
        } else {
          delete this.errors['ubigeo'];
        }
        break;
    }
  }

  validate(): boolean {
    this.errors = {};
    const fields = ['companyName', 'ruc', 'email', 'phone', 'address', 'ubigeoCode'];
    fields.forEach(f => this.validateField(f));
    return Object.keys(this.errors).length === 0;
  }

  onSave(): void {
    if (!this.validate()) return;

    const { ubigeoCode, categoryId, ...rest } = this.form;
    const payload: Supplier = {
      ...rest,
      ubigeo:   { ubigeoCode },
      category: { categoryId },
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
