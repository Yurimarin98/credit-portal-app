export type CardType = 'Clasica' | 'Oro';
export type RequestStatus = 'Pendiente' | 'Aceptada' | 'Rechazada'

export interface CreditRequest {
    reference: string;
    id?: string;
    applicantName: string;
    document: string;
    monthlyIncome: number;
    cardType: CardType;
    requestedAmount: number;
    status: RequestStatus;
    reason?: string;
    createdAt: number;
}

export class CreditRequestRules {
    static isValidDocument(document: string): boolean {
        const DOCUMENT_PATTERN = /^\d{6,12}$/

        return DOCUMENT_PATTERN.test(document);
    }

    static isValidCardRange(cardType: CardType, amount: number): boolean {
        if (cardType === "Clasica")
            return amount >= 500000 && amount <= 5000000;

        if (cardType === "Oro")
            return amount >= 5000000 && amount <= 20000000;

        return false
    }

    static evaluateCapacity(income: number, amount: number): { status: RequestStatus, reason?: string } {
        const accepted = amount <= income * 2;

        return {
            status: accepted ? 'Aceptada' : 'Rechazada',
            reason: accepted ? undefined : 'Rechazada por capacidad de pago'
        }
    }
}