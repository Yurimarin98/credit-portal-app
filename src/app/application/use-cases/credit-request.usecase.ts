import { inject } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { CreditFilterCriteria, CreditRequestGateway } from "../../domain/gateways/credit-request.gateway";
import { CreditRequest, CreditRequestRules } from "../../domain/models/credit-request/credit-request.model";

export class CreditRequestUseCase {
    private creditRequestGateway = inject(CreditRequestGateway);

    getCreditRequest(criteria?: CreditFilterCriteria): Observable<CreditRequest[]> {
        return this.creditRequestGateway.getAll(criteria);
    }

    submitCreditResquest(request: CreditRequest): Observable<CreditRequest> {
        if (!CreditRequestRules.isValidDocument(request.document))
            return throwError(() => new Error('El documento debe contener entre 6 y 12 dígitos númericos.'))

        if (!CreditRequestRules.isValidCardRange(request.cardType, request.requestedAmount))
            return throwError(() => new Error(`El cupo solicitado no cumple con los rangos permitidos para la tarjeta ${request.cardType}`))

        if (request.monthlyIncome <= 0 || request.requestedAmount <= 0)
            return throwError(() => new Error(`El ingreso mensual y el cupo solicitado deben ser números positivos`))

        return this.creditRequestGateway.submit(request);
    }
}