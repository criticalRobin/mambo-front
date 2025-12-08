import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '@env/environment';
import type { Document as DocumentModel, CreateDocumentRequest, CreateDocumentWithPdfRequest } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {

    // Mock data
    private documents: DocumentModel[] = [
        {
            id: 'DOC-001',
            title: 'Informe Mensual de Actividades',
            subject: 'Entrega de informe correspondiente a Noviembre',
            content: '<p>Estimados, adjunto el informe...</p>',
            type: 'Informe',
            sender: 'Juan Pérez',
            recipient: 'Dirección General',
            date: new Date('2025-11-30'),
            status: 'received',
            hasAttachments: true
        },
        {
            id: 'DOC-002',
            title: 'Solicitud de Vacaciones',
            subject: 'Permiso por vacaciones periodo 2025',
            content: '<p>Solicito mis vacaciones...</p>',
            type: 'Solicitud',
            sender: 'Maria Lopez',
            recipient: 'Recursos Humanos',
            date: new Date('2025-12-01'),
            status: 'received',
            hasAttachments: false
        },
        {
            id: 'DOC-003',
            title: 'Memorando Interno',
            subject: 'Cambio de horario de reuniones',
            content: '<p>Se notifica el cambio...</p>',
            type: 'Memorando',
            sender: 'Dirección General',
            recipient: 'Todos',
            date: new Date('2025-12-05'),
            status: 'received',
            hasAttachments: false
        },
        {
            id: 'DOC-004',
            title: 'Propuesta de Proyecto',
            subject: 'Nueva iniciativa de digitalización',
            content: '<p>Adjunto propuesta...</p>',
            type: 'Propuesta',
            sender: 'Yo',
            recipient: 'Gerencia TI',
            date: new Date('2025-12-06'),
            status: 'sent',
            hasAttachments: true
        },
        {
            id: 'DOC-005',
            title: 'Borrador: Plan Estratégico',
            subject: 'Borrador inicial del plan 2026',
            content: '<p>Este es un borrador...</p>',
            type: 'Plan',
            sender: 'Yo',
            recipient: '',
            date: new Date('2025-12-07'),
            status: 'draft',
            hasAttachments: false
        },
        {
            id: 'DOC-006',
            title: 'Borrador: Solicitud de Equipos',
            subject: 'Requerimiento de nuevos monitores',
            content: '<p>Necesitamos 3 monitores...</p>',
            type: 'Solicitud',
            sender: 'Yo',
            recipient: '',
            date: new Date('2025-12-07'),
            status: 'draft',
            hasAttachments: false
        }
    ];

    private recipients: any[] = [
        { label: 'Dirección General', value: 'Dirección General' },
        { label: 'Recursos Humanos', value: 'Recursos Humanos' },
        { label: 'Gerencia TI', value: 'Gerencia TI' },
        { label: 'Departamento Financiero', value: 'Departamento Financiero' },
        { label: 'Secretaría', value: 'Secretaría' }
    ];

    constructor(private http: HttpClient) { }

    getDocuments(status: 'received' | 'sent'): Observable<DocumentModel[]> {
        // Filter mock data
        const filtered = this.documents.filter(d =>
            status === 'received' ? d.status === 'received' : d.status === 'sent'
        );
        return of(filtered).pipe(delay(500)); // Simulate network delay
    }

    getDrafts(): Observable<DocumentModel[]> {
        return of(this.documents.filter(d => d.status === 'draft')).pipe(delay(300));
    }

    getRecipients(): Observable<any[]> {
        return of(this.recipients);
    }

    getDocumentById(id: string): Observable<DocumentModel | undefined> {
        return of(this.documents.find(d => d.id === id)).pipe(delay(300));
    }

    createDocument(data: CreateDocumentRequest): Observable<DocumentModel> {
        const newDoc: DocumentModel = {
            id: `DOC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            ...data,
            sender: 'Yo',
            date: new Date(),
            status: 'sent',
            hasAttachments: false // Simplification for now
        };
        this.documents.unshift(newDoc);
        return of(newDoc).pipe(delay(800));
    }

    /**
     * Crea un documento con archivo PDF adjunto
     * @param data Datos del documento
     * @param pdfBlob PDF generado
     * @returns Observable con el documento creado
     */
    createDocumentWithPdf(data: CreateDocumentRequest, pdfBlob: Blob): Observable<DocumentModel> {
        // En producción, esto enviaría FormData al backend
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subject', data.subject);
        formData.append('content', data.content);
        formData.append('recipient', data.recipient);
        formData.append('type', data.type);
        formData.append('pdf', pdfBlob, `${this.sanitizeFilename(data.title)}.pdf`);

        // return this.http.post<DocumentModel>(`${environment.BASE_URL}/api/documents`, formData);

        // Mock: Simular creación con PDF
        const newDoc: DocumentModel = {
            id: `DOC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            ...data,
            sender: 'Yo',
            date: new Date(),
            status: 'sent',
            hasAttachments: true,
            pdfUrl: URL.createObjectURL(pdfBlob), // En producción vendría del backend
            pdfSize: pdfBlob.size
        };
        this.documents.unshift(newDoc);
        return of(newDoc).pipe(delay(800));
    }

    saveDraft(data: Partial<CreateDocumentRequest>): Observable<DocumentModel> {
        const draftDoc: DocumentModel = {
            id: `DOC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            title: data.title || 'Borrador sin título',
            subject: data.subject || '',
            content: data.content || '',
            type: data.type || 'Borrador',
            recipient: data.recipient || '',
            sender: 'Yo',
            date: new Date(),
            status: 'draft',
            hasAttachments: false
        };
        // Remove existing draft with same ID if exists (update scenario)
        const existingIndex = this.documents.findIndex(d => d.id === draftDoc.id && d.status === 'draft');
        if (existingIndex !== -1) {
            this.documents[existingIndex] = draftDoc;
        } else {
            this.documents.unshift(draftDoc);
        }
        return of(draftDoc).pipe(delay(500));
    }

    /**
     * Sanitiza el nombre de archivo para uso seguro
     */
    private sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-z0-9áéíóúñü]/gi, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
    }
}
