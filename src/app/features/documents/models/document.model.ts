export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'draft' | 'received' | 'sent';

export enum DocumentType {
    OFFICE = 'OFFICE',
    MEMORANDUM = 'MEMORANDUM',
    NONE = 'NONE'
}

export enum DocumentCategory {
    NORMAL = 'NORMAL',
    ENCRYPTED = 'ENCRYPTED'
}

// Respuesta del backend
export interface BackendDocumentResponse {
    id: number;
    category: DocumentCategory;
    type: DocumentType;
    name: string;
    url: string;
    id_strapi: number;
    password: string | null;
    creations: Array<{
        status: DocumentStatus;
        details: string;
    }>;
    encryptions: Array<{
        code_front: string;
        length_front: number;
        frequencies_front: string;
    }>;
}

// Modelo interno para uso en la aplicación
export interface Document {
    id: string;
    title: string;
    category: DocumentCategory;
    content: string;
    type: DocumentType;
    sender: string;
    recipient: string;
    date: Date;
    status: DocumentStatus;
    hasAttachments: boolean;
    pdfUrl?: string;
    pdfSize?: number;
    // Campos adicionales del backend
    name?: string;
    url?: string;
    id_strapi?: number;
    password?: string | null;
    encryptions?: Array<{
        code_front: string;
        length_front: number;
        frequencies_front: string;
    }>;
}

export interface CreateDocumentRequest {
    title: string;
    category: DocumentCategory;
    content: string;
    recipient: string;
    type: DocumentType;
}

export interface CreateDocumentWithPdfRequest extends CreateDocumentRequest {
    pdfFile?: Blob;
}
