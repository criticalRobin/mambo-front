import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Document, CreateDocumentRequest } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {

    // Mock data
    private documents: Document[] = [
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
        }
    ];

    constructor() { }

    getDocuments(status: 'received' | 'sent'): Observable<Document[]> {
        // Filter mock data
        const filtered = this.documents.filter(d =>
            status === 'received' ? d.status === 'received' : d.status === 'sent'
        );
        return of(filtered).pipe(delay(500)); // Simulate network delay
    }

    getDocumentById(id: string): Observable<Document | undefined> {
        return of(this.documents.find(d => d.id === id)).pipe(delay(300));
    }

    createDocument(data: CreateDocumentRequest): Observable<Document> {
        const newDoc: Document = {
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
}
