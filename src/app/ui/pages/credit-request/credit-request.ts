import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreditRequestUseCase } from '../../../application/use-cases/credit-request.usecase';
import { CardType, CreditRequest, RequestStatus } from '../../../domain/models/credit-request/credit-request.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-credit-request',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './credit-request.html',
  styleUrl: './credit-request.scss',
})
export class CreditRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private creditRequestsUseCase = inject(CreditRequestUseCase);

  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  requestsList = signal<CreditRequest[]>([]);
  isModalOpen = signal<boolean>(false);

  cardTypes: CardType[] = ['Clasica', 'Oro'];
  statuses: RequestStatus[] = ['Pendiente', 'Aceptada', 'Rechazada'];

  filterForm: FormGroup = this.fb.group({
    searchQuery: [''],
    statusFilter: [''],
    cardFilter: ['']
  });

  creditForm: FormGroup = this.fb.group({
    reference: ['', [Validators.required, Validators.pattern(/^REF-\d{5}$/)]],
    applicantName: ['', [Validators.required, Validators.minLength(3)]],
    document: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
    monthlyIncome: [0, [Validators.required, Validators.min(1)]],
    cardType: ['Clasica', [Validators.required]],
    requestedAmount: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadRequests();

    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(values => {
      this.loadRequests({
        query: values.searchQuery,
        status: values.statusFilter,
        cardType: values.cardFilter
      });
    });
  }

  loadRequests(criteria?: { query?: string; status?: any; cardType?: any }) {
    this.creditRequestsUseCase.getCreditRequest(criteria).subscribe({
      next: (data) => {
        this.requestsList.set(data.slice(0, 50));
      }
    });
  }

  openModal() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.creditForm.reset({ cardType: 'Clasica', monthlyIncome: 0, requestedAmount: 0 });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onSubmit() {
    if (this.creditForm.invalid) {
      this.creditForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formValues = this.creditForm.value;

    const newRequest: CreditRequest = {
      reference: formValues.reference,
      applicantName: formValues.applicantName,
      document: formValues.document,
      monthlyIncome: Number(formValues.monthlyIncome),
      cardType: formValues.cardType,
      requestedAmount: Number(formValues.requestedAmount),
      status: 'Pendiente',
      createdAt: Date.now()
    };

    this.creditRequestsUseCase.submitCreditResquest(newRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(`¡Solicitud procesada con éxito! Estado: ${response.status} ${response.reason ? '(' + response.reason + ')' : ''}`);

        const currentFilters = this.filterForm.value;
        this.loadRequests({
          query: currentFilters.searchQuery,
          status: currentFilters.statusFilter,
          cardType: currentFilters.cardFilter
        });

        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Ocurrió un error al procesar la solicitud.');
      }
    });
  }
}

