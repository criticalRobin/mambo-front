import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DocumentService } from '../../services/document.service';
import type { Document as DocumentModel } from '../../models/document.model';

@Component({
    selector: 'app-sent',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, TooltipModule, InputTextModule],
    templateUrl: './sent.html',
    styleUrl: './sent.css'
})
export class Sent implements OnInit {
    documents: DocumentModel[] = [];
    loading: boolean = true;

    constructor(private documentService: DocumentService) { }

    ngOnInit() {
        this.documentService.getDocuments('sent').subscribe(data => {
            this.documents = data;
            this.loading = false;
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'received':
                return 'success';
            case 'sent':
                return 'info';
            case 'draft':
                return 'warn';
            default:
                return 'secondary';
        }
    }
}
