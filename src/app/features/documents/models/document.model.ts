export type DocumentStatus = 'draft' | 'sent' | 'received';

export interface Document {
    id: string;
    title: string;
    subject: string;
    content: string;
    type: string;
    sender: string;
    recipient: string;
    date: Date;
    status: DocumentStatus;
    hasAttachments: boolean;
    pdfUrl?: string; // URL del PDF generado en el servidor
    pdfSize?: number; // Tamaño del PDF en bytes
}

export interface CreateDocumentRequest {
    title: string;
    subject: string;
    content: string;
    recipient: string;
    type: string;
}

export interface CreateDocumentWithPdfRequest extends CreateDocumentRequest {
    pdfFile?: Blob; // PDF generado en el cliente
}
