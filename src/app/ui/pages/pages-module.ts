import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreditRequestMemoryAdapterMock } from '../../infrastructure/adapters/credit-request-api.adapter.mock';
import { CreditRequestUseCase } from '../../application/use-cases/credit-request.usecase';
import { CreditRequestGateway } from '../../domain/gateways/credit-request.gateway';
import { Pages } from './pages';
import { CreditRequestComponent } from './credit-request/credit-request';

export const routes: Routes = [
  {
    path: '',
    component: Pages,
    children: [
      {
        path: '',
        component: CreditRequestComponent
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    CreditRequestUseCase,
    { provide: CreditRequestGateway, useClass: CreditRequestMemoryAdapterMock }
  ]
})
export class PagesModule { }
