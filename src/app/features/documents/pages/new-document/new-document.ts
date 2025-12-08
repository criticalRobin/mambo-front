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
import { DocumentService } from '../../services/document.service';

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
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './new-document.html',
    styleUrl: './new-document.css'
})
export class NewDocument implements OnInit {
    items: MenuItem[] = [];
    activeIndex: number = 0;

    // Forms for validtion
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
