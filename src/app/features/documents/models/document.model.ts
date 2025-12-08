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
}

export interface CreateDocumentRequest {
    title: string;
    subject: string;
    content: string;
    recipient: string;
    type: string;
}
