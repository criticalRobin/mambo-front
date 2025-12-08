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
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../services/document.service';
import { PdfGeneratorService } from '@app/shared/services/pdf-generator.service';
import { QrGeneratorService, QrSignatureConfig } from '@app/shared/services/qr-generator.service';
import { SignatureCanvasComponent, AppliedSignature } from '@app/shared/components/signature-canvas/signature-canvas.component';
import type { Document as DocumentModel } from '../../models/document.model';
import type { PdfDocument } from '@app/shared/models/pdf-config.interface';

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
        TooltipModule,
        DialogModule,
        SignatureCanvasComponent
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

    // PDF Preview
    showPreview: boolean = false;
    pdfPreviewUrl: SafeResourceUrl | null = null;
    generatingPDF: boolean = false;

    // Electronic Signature (Step 4)
    signatureConfig: QrSignatureConfig | null = null;
    appliedSignature: AppliedSignature | null = null;
    pdfBlobForSignature: Blob | null = null;
    pdfPreviewUrlForSignature: string | null = null;
    signaturePlaced: boolean = false;
    signatureSigned: boolean = false;
    generatingSignedPDF: boolean = false; // Estado de loading para generación de PDF firmado

    constructor(
        private fb: FormBuilder,
        private documentService: DocumentService,
        private pdfGeneratorService: PdfGeneratorService,
        private qrGeneratorService: QrGeneratorService,
        private messageService: MessageService,
        private sanitizer: DomSanitizer,
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
                label: 'Firma Electrónica',
                command: (event: any) => this.activeIndex = 2
            },
            {
                label: 'Revisión y Envío',
                command: (event: any) => this.activeIndex = 3
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
            case 2:
                return this.signatureSigned === true;
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

    async next() {
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
            // Preparar firma después del contenido con loading visible
            this.signaturePlaced = false;
            this.signatureSigned = false;
            this.generatingPDF = true;
            await this.prepareSignature();
            this.generatingPDF = false;
        }

        if (this.activeIndex === 2) {
            if (!this.signatureSigned) {
                this.messageService.add({ severity: 'warn', summary: 'Firma requerida', detail: 'Haz clic en el documento para colocar la firma antes de continuar.' });
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

    /**
     * Genera y muestra vista previa del PDF
     */
    async previewPDF(): Promise<void> {
        if (this.docForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Complete todos los campos antes de generar el PDF'
            });
            return;
        }

        try {
            this.generatingPDF = true;
            let blob: Blob;
            if (this.pdfBlobForSignature) {
                blob = this.pdfBlobForSignature;
            } else {
                const pdfDocument = this.buildPdfDocument();
                blob = await this.pdfGeneratorService.generateDocument(pdfDocument);
            }
            const url = URL.createObjectURL(blob);
            this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.showPreview = true;
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo generar la vista previa del PDF'
            });
            console.error('Error generando PDF preview:', error);
        } finally {
            this.generatingPDF = false;
        }
    }

    /**
     * Descarga el documento como PDF
     */
    async downloadPDF(): Promise<void> {
        if (this.docForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Complete todos los campos antes de descargar el PDF'
            });
            return;
        }

        try {
            this.generatingPDF = true;
            let blob: Blob;
            if (this.pdfBlobForSignature) {
                blob = this.pdfBlobForSignature;
            } else {
                const pdfDocument = this.buildPdfDocument();
                blob = await this.pdfGeneratorService.generateDocument(pdfDocument);
            }
            const filename = this.sanitizeFilename(this.docForm.get('title')?.value || 'documento');
            this.pdfGeneratorService.downloadPDF(blob, filename);

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'PDF descargado correctamente'
            });
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo descargar el PDF'
            });
            console.error('Error descargando PDF:', error);
        } finally {
            this.generatingPDF = false;
        }
    }

    /**
     * Cierra el modal de preview y limpia la URL
     */
    closePreview(): void {
        this.showPreview = false;
        if (this.pdfPreviewUrl) {
            // Liberar objeto URL para evitar memory leaks
            this.pdfPreviewUrl = null;
        }
    }

    /**
     * Construye el objeto PdfDocument desde el formulario
     */
    private buildPdfDocument(): PdfDocument {
        return {
            title: this.docForm.get('title')?.value || '',
            subject: this.docForm.get('subject')?.value || '',
            content: this.docForm.get('content')?.value || '',
            metadata: {
                type: this.docForm.get('type')?.value || 'Documento',
                sender: 'Sistema MAMBO',
                recipient: this.docForm.get('recipient')?.value || '',
                date: new Date()
            }
        };
    }

    /**
     * Sanitiza el nombre del archivo eliminando caracteres no válidos
     */
    private sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-z0-9áéíóúñü]/gi, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
    }

    /**
     * Prepara la configuración y PDF para la firma electrónica
     */
    private async prepareSignature(): Promise<void> {
        try {
            this.generatingPDF = true;

            // Generar PDF temporal para mostrar en canvas de firma
            const pdfDocument = this.buildPdfDocument();
            this.pdfBlobForSignature = await this.pdfGeneratorService.generateDocument(pdfDocument);
            
            // Convertir Blob a URL una sola vez
            if (this.pdfPreviewUrlForSignature) {
                URL.revokeObjectURL(this.pdfPreviewUrlForSignature);
            }
            this.pdfPreviewUrlForSignature = URL.createObjectURL(this.pdfBlobForSignature);
            
            // Configurar datos de firma
            this.signatureConfig = {
                signerName: 'Usuario Test', // Mock - En producción vendría del usuario autenticado
                signerDocument: '1234567890', // Mock - Cédula del usuario
                signatureDate: new Date(),
                documentId: `DOC-${Date.now()}`,
                documentTitle: this.docForm.get('title')?.value || 'Documento'
            };
            this.signaturePlaced = false;
            this.signatureSigned = false;
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo preparar el documento para firma'
            });
            console.error('Error preparando firma:', error);
        } finally {
            this.generatingPDF = false;
        }
    }

    /**
     * Maneja cuando el usuario aplica la firma
     */
    async onSignatureApplied(signature: AppliedSignature): Promise<void> {
        this.appliedSignature = signature;
        this.signatureSigned = true;
        
        this.messageService.add({
            severity: 'success',
            summary: 'Firma Aplicada',
            detail: 'La firma electrónica se ha agregado correctamente'
        });

        // Generar PDF final con firma en background con loading visible
        await this.generateFinalSignedPDF();
    }

    onSignaturePositioned(): void {
        this.signaturePlaced = true;
    }



    /**
     * Genera el PDF final con la firma posicionada
     */
    private async generateFinalSignedPDF(): Promise<void> {
        if (!this.appliedSignature) {
            return;
        }

        try {
            this.generatingSignedPDF = true;
            const pdfDocument = this.buildPdfDocument();
            
            // Generar PDF con firma incrustada
            const signedPdfBlob = await this.pdfGeneratorService.generateDocumentWithSignature(
                pdfDocument,
                this.appliedSignature
            );

            // Guardar para envío final
            this.pdfBlobForSignature = signedPdfBlob;
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo generar el PDF con firma'
            });
            console.error('Error generando PDF firmado:', error);
        } finally {
            this.generatingSignedPDF = false;
        }
    }

    /**
     * Finaliza y envía el documento
     */
    finalizeDocument(): void {
        this.loading = true;
        
        if (this.pdfBlobForSignature && this.appliedSignature) {
            // Enviar con PDF firmado
            this.documentService.createDocumentWithPdf(
                this.docForm.value,
                this.pdfBlobForSignature
            ).subscribe({
                next: (doc) => {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Éxito', 
                        detail: 'Documento firmado y enviado correctamente' 
                    });
                    setTimeout(() => {
                        this.router.navigate(['/documentos/enviados']);
                    }, 1500);
                },
                error: (err) => {
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'No se pudo enviar el documento' 
                    });
                    this.loading = false;
                }
            });
        } else {
            // Enviar sin firma
            this.documentService.createDocument(this.docForm.value).subscribe({
                next: (doc) => {
                    this.messageService.add({ 
                        severity: 'success', 
                        summary: 'Éxito', 
                        detail: 'Documento enviado correctamente' 
                    });
                    setTimeout(() => {
                        this.router.navigate(['/documentos/enviados']);
                    }, 1500);
                },
                error: (err) => {
                    this.messageService.add({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'No se pudo enviar el documento' 
                    });
                    this.loading = false;
                }
            });
        }
    }
}
