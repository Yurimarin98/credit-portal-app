import { Observable } from "rxjs";
import { CardType, CreditRequest, RequestStatus } from "../models/credit-request/credit-request.model";

export interface CreditFilterCriteria {
    query?: string,
    status?: RequestStatus,
    cardType?: CardType
}

export abstract class CreditRequestGateway{
    abstract getAll(criteria?: CreditFilterCriteria): Observable<CreditRequest[]>;
    abstract submit(request: CreditRequest): Observable<CreditRequest>;
}