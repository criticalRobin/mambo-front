import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentService } from '../../services/document.service';
import type { Document as DocumentModel } from '../../models/document.model';

@Component({
    selector: 'app-new-document',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        StepsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        EditorModule,
        ToastModule,
        SelectModule,
        TableModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './new-document.html',
    styleUrl: './new-document.css'
})
export class NewDocument implements OnInit {
    items: MenuItem[] = [];
    activeIndex: number = 0;

    // View State
    showDrafts: boolean = true;
    drafts: DocumentModel[] = [];
    recipients: any[] = [];
    loadingDrafts: boolean = false;

    // Forms for validation
    docForm: FormGroup;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private documentService: DocumentService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.docForm = this.fb.group({
            title: ['', Validators.required],
            subject: ['', Validators.required],
            recipient: ['', Validators.required],
            type: ['Memorando', Validators.required],
            content: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.items = [
            {
                label: 'Información General',
                command: (event: any) => this.activeIndex = 0
            },
            {
                label: 'Redacción del Contenido',
                command: (event: any) => this.activeIndex = 1
            },
            {
                label: 'Revisión y Envío',
                command: (event: any) => this.activeIndex = 2
            }
        ];

        this.loadDrafts();
        this.loadRecipients();
    }

    loadDrafts() {
        this.loadingDrafts = true;
        this.documentService.getDrafts().subscribe(data => {
            this.drafts = data;
            this.loadingDrafts = false;
        });
    }

    loadRecipients() {
        this.documentService.getRecipients().subscribe(data => {
            this.recipients = data;
        });
    }

    startNewDocument() {
        this.showDrafts = false;
        this.activeIndex = 0;
        this.docForm.reset({ type: 'Memorando' });
    }

    editDraft(doc: DocumentModel) {
        this.showDrafts = false;
        this.activeIndex = 0;
        this.docForm.patchValue({
            title: doc.title,
            subject: doc.subject,
            recipient: doc.recipient, // Assuming recipient is stored correctly in draft
            type: doc.type,
            content: doc.content
        });
    }

    cancel() {
        this.showDrafts = true;
    }

    isStepValid(stepIndex: number): boolean {
        switch (stepIndex) {
            case 0:
                return this.docForm.get('type')?.valid === true &&
                    this.docForm.get('title')?.valid === true &&
                    this.docForm.get('recipient')?.valid === true &&
                    this.docForm.get('subject')?.valid === true;
            case 1:
                return this.docForm.get('content')?.valid === true;
            default:
                return true;
        }
    }

    saveDraft() {
        this.loading = true;
        this.documentService.saveDraft(this.docForm.value).subscribe({
            next: (doc) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Borrador guardado correctamente'
                });
                this.loading = false;
                setTimeout(() => {
                    this.showDrafts = true;
                    this.loadDrafts();
                }, 1000);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar el borrador'
                });
                this.loading = false;
            }
        });
    }

    next() {
        if (this.activeIndex === 0) {
            if (this.docForm.get('title')?.invalid ||
                this.docForm.get('subject')?.invalid ||
                this.docForm.get('recipient')?.invalid) {
                this.docForm.markAllAsTouched();
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete los campos requeridos' });
                return;
            }
        }

        if (this.activeIndex === 1) {
            if (this.docForm.get('content')?.invalid) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El contenido del documento no puede estar vacío' });
                return;
            }
        }

        this.activeIndex++;
    }

    prev() {
        this.activeIndex--;
    }

    save() {
        this.loading = true;
        this.documentService.createDocument(this.docForm.value).subscribe({
            next: (doc) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento creado correctamente' });
                setTimeout(() => {
                    this.router.navigate(['/documentos/enviados']);
                }, 1500);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el documento' });
                this.loading = false;
            }
        });
    }
}
