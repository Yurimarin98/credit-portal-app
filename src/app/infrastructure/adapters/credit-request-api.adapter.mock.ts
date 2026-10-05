import { Injectable } from "@angular/core";
import { CreditFilterCriteria, CreditRequestGateway } from "../../domain/gateways/credit-request.gateway";
import { CardType, CreditRequest, CreditRequestRules } from "../../domain/models/credit-request/credit-request.model";
import { delay, Observable, of, throwError } from "rxjs";
import { environment } from "../../../environments/environment.development";

@Injectable({ providedIn: 'root' })
export class CreditRequestMemoryAdapterMock implements CreditRequestGateway {

    private requestsMap = new Map<string, CreditRequest>();

    constructor() {
        this.generateSyntheticData();
    }

    private generateSyntheticData() {
        this.seedSpecificUser("Ana Prueba", "12345678", 3000000, 'Clasica', 2000000);
        this.seedSpecificUser("Maria Prueba", "87654321", 8000000, 'Oro', 10000000);

        const firstNames = ['Carlos', 'Lucía', 'Andrés', 'Sofía', 'Mateo', 'Valentina', 'Diego', 'Camila'];
        const lastNames = ['Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez'];

        for (let i = 3; i <= 5000; i++) {
            const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]} ${i}`;
            const doc = (10000000 + i).toString();
            const income = Math.floor(Math.random() * 15000000) + 1000000;
            const cardType: CardType = income > 5000000 && Math.random() > 0.5 ? 'Oro' : 'Clasica';
            const maxAllowed = cardType === 'Oro' ? 20000000 : 5000000;
            const requested = Math.floor(Math.random() * maxAllowed) + 500000;

            const ref = `REF-${i.toString().padStart(5, '0')}`;

            const evaluation = CreditRequestRules.evaluateCapacity(income, requested);

            this.requestsMap.set(ref, {
                reference: ref,
                id: `ID-SYS-${i}`,
                applicantName: name,
                document: doc,
                monthlyIncome: income,
                cardType,
                requestedAmount: requested,
                status: evaluation.status,
                reason: evaluation.reason,
                createdAt: Date.now() - i * 1000
            });
        }
    }

    private seedSpecificUser(name: string, doc: string, income: number, card: CardType, requested: number) {
        const ref = `REF-${name.replace(/\s+/g, '-').toUpperCase()}`
        const evaluation = CreditRequestRules.evaluateCapacity(income, requested)

        this.requestsMap.set(ref, {
            reference: ref,
            id: `ID-SYS-${doc}`,
            applicantName: name,
            document: doc,
            monthlyIncome: income,
            cardType: card,
            requestedAmount: requested,
            status: evaluation.status,
            reason: evaluation.reason,
            createdAt: Date.now()
        });
    }

    getAll(criteria?: CreditFilterCriteria): Observable<CreditRequest[]> {
        let requests = Array.from(this.requestsMap.values());

        if (criteria) {
            const query = criteria.query?.toLowerCase().trim() || '';
            const status = criteria.status || '';
            const cardType = criteria.cardType || '';

            requests = requests.filter(req => {
                const matchQuery = !query ||
                    req.reference.toLowerCase().includes(query) ||
                    req.document.toLowerCase().includes(query) ||
                    req.applicantName.toLowerCase().includes(query);

                const matchStatus = !status || req.status === status;
                const matchCard = !cardType || req.cardType === cardType;

                return matchQuery && matchStatus && matchCard;
            });
        }

        return of(requests).pipe(delay(200));
    }

    submit(newReq: CreditRequest): Observable<CreditRequest> {
        const simulateMissingConfirmation = environment.simulateMissingConfirmation
        const existing = this.requestsMap.get(newReq.reference);

        if (existing) {
            const isSameData =
                existing.applicantName === newReq.applicantName &&
                existing.document === newReq.document &&
                existing.monthlyIncome === newReq.monthlyIncome &&
                existing.cardType === newReq.cardType &&
                existing.requestedAmount === newReq.requestedAmount;

            if (isSameData) {
                return of(existing).pipe(delay(400));
            } else {
                return throwError(() => new Error('La referencia ya existe con datos diferentes. No se reemplaza la solicitud original.'));
            }
        }

        if (simulateMissingConfirmation) {
            const pendingRecord: CreditRequest = { ...newReq, status: 'Pendiente' };
            this.requestsMap.set(newReq.reference, pendingRecord);
            return throwError(() => new Error('Timeout: La confirmación no llegó. La solicitud quedó pendiente y conserva su referencia.'));
        }

        const evaluation = CreditRequestRules.evaluateCapacity(newReq.monthlyIncome, newReq.requestedAmount);
        const processed: CreditRequest = {
            ...newReq,
            id: `ID-${Math.floor(Math.random() * 89999 + 10000)}`,
            status: evaluation.status,
            reason: evaluation.reason
        };

        this.requestsMap.set(newReq.reference, processed);
        return of(processed).pipe(delay(400));
    }
}