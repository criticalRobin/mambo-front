import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '@env/environment';
import type { Document as DocumentModel, CreateDocumentRequest, CreateDocumentWithPdfRequest, BackendDocumentResponse } from '../models/document.model';
import { DocumentType, DocumentCategory } from '../models/document.model';
import { AuthService } from '../../../core/auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {

    // Mock data
    private documents: DocumentModel[] = [
        {
            id: 'DOC-001',
            title: 'Informe Mensual de Actividades',
            category: DocumentCategory.NORMAL,
            content: '<p>Estimados, adjunto el informe...</p>',
            type: DocumentType.OFFICE,
            sender: 'Juan Pérez',
            recipient: 'Dirección General',
            date: new Date('2025-11-30'),
            status: 'received',
            hasAttachments: true
        },
        {
            id: 'DOC-002',
            title: 'Solicitud de Vacaciones',
            category: DocumentCategory.NORMAL,
            content: '<p>Solicito mis vacaciones...</p>',
            type: DocumentType.MEMORANDUM,
            sender: 'Maria Lopez',
            recipient: 'Recursos Humanos',
            date: new Date('2025-12-01'),
            status: 'received',
            hasAttachments: false
        },
        {
            id: 'DOC-003',
            title: 'Memorando Interno',
            category: DocumentCategory.ENCRYPTED,
            content: '<p>Se notifica el cambio...</p>',
            type: DocumentType.MEMORANDUM,
            sender: 'Dirección General',
            recipient: 'Todos',
            date: new Date('2025-12-05'),
            status: 'received',
            hasAttachments: false
        },
        {
            id: 'DOC-004',
            title: 'Propuesta de Proyecto',
            category: DocumentCategory.NORMAL,
            content: '<p>Adjunto propuesta...</p>',
            type: DocumentType.OFFICE,
            sender: 'Yo',
            recipient: 'Gerencia TI',
            date: new Date('2025-12-06'),
            status: 'sent',
            hasAttachments: true
        },
        {
            id: 'DOC-005',
            title: 'Borrador: Plan Estratégico',
            category: DocumentCategory.NORMAL,
            content: '<p>Este es un borrador...</p>',
            type: DocumentType.MEMORANDUM,
            sender: 'Yo',
            recipient: '',
            date: new Date('2025-12-07'),
            status: 'draft',
            hasAttachments: false
        },
        {
            id: 'DOC-006',
            title: 'Borrador: Solicitud de Equipos',
            category: DocumentCategory.NORMAL,
            content: '<p>Necesitamos 3 monitores...</p>',
            type: DocumentType.OFFICE,
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

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    getDocuments(status: 'received' | 'sent'): Observable<DocumentModel[]> {
        // Filter mock data
        const filtered = this.documents.filter(d =>
            status === 'received' ? d.status === 'received' : d.status === 'sent'
        );
        return of(filtered).pipe(delay(500)); // Simulate network delay
    }

    getDrafts(): Observable<DocumentModel[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });

        return this.http.get<BackendDocumentResponse[]>(`${environment.BASE_URL}/docs/my-documents`, { headers }).pipe(
            map(backendDocs => this.mapBackendDocuments(backendDocs))
        );
    }

    /**
     * Mapea los documentos del backend al modelo interno
     */
    private mapBackendDocuments(backendDocs: BackendDocumentResponse[]): DocumentModel[] {
        return backendDocs.map(doc => {
            // Obtener el status del primer elemento de creations
            const status = doc.creations && doc.creations.length > 0 
                ? doc.creations[0].status 
                : 'DRAFT' as const;

            // Determinar si tiene encriptación
            const isEncrypted = doc.encryptions && doc.encryptions.length > 0;

            return {
                id: doc.id.toString(),
                title: doc.name.replace('.pdf', ''), // Usar el nombre sin extensión como título
                category: doc.category,
                type: doc.type,
                content: doc.creations && doc.creations.length > 0 ? doc.creations[0].details : '',
                sender: 'Yo',
                recipient: '', // No viene en la respuesta
                date: new Date(), // No viene en la respuesta, usar fecha actual
                status: status,
                hasAttachments: true,
                pdfUrl: doc.url,
                name: doc.name,
                url: doc.url,
                id_strapi: doc.id_strapi,
                password: doc.password,
                encryptions: doc.encryptions
            };
        });
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
        formData.append('category', data.category);
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
            category: data.category || DocumentCategory.NORMAL,
            content: data.content || '',
            type: data.type || DocumentType.NONE,
            recipient: data.recipient || '',
            sender: 'Yo',
            date: new Date(),
            status: 'draft',
            hasAttachments: false
        };
        // Remove existing draft with same ID if exists (update scenario)
        const existingIndex = this.documents.findIndex(d => d.id === draftDoc.id && (d.status === 'draft' as any));
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

    /**
     * Sube un documento encriptado al servidor
     */
    uploadDocument(data: {
        title: string;
        type: string;
        category: string;
        password: string | null;
        code: string;
        length: number;
        frequencies: string;
        file: string | null;
    }): Observable<any> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('type', data.type);
        formData.append('category', data.category);
        
        if (data.password) {
            formData.append('password', data.password);
        }
        
        formData.append('code', data.code);
        formData.append('length', data.length.toString());
        formData.append('frequencies', data.frequencies);
        
        if (data.file) {
            // Convertir base64 a Blob
            const byteCharacters = atob(data.file);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            formData.append('file', blob, `${data.title}.pdf`);
        }

        return this.http.post(`${environment.BASE_URL}/docs/upload`, formData, { headers });
    }
}
