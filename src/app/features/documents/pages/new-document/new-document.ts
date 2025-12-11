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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../services/document.service';
import { UsersService } from '../../../users/services/users.service';
import { PdfGeneratorService } from '@app/shared/services/pdf-generator.service';
import { QrGeneratorService, QrSignatureConfig } from '@app/shared/services/qr-generator.service';
import { SignatureCanvasComponent, AppliedSignature } from '@app/shared/components/signature-canvas/signature-canvas.component';
import type { Document as DocumentModel } from '../../models/document.model';
import { DocumentType, DocumentCategory } from '../../models/document.model';
import type { PdfDocument } from '@app/shared/models/pdf-config.interface';
import type { User } from '../../../users/models/user.interface';
import { encodeArithmetic, type ArithmeticResult } from '@app/utils/arithmetic-coding.util';

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
        AutoCompleteModule,
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
    users: User[] = [];
    filteredUsers: User[] = [];
    selectedUser: User | null = null;
    loadingDrafts: boolean = false;
    loadingUsers: boolean = false;

    // Enums for template
    documentTypes = [
        { label: 'Oficio', value: DocumentType.OFFICE },
        { label: 'Memorando', value: DocumentType.MEMORANDUM },
        { label: 'Ninguno', value: DocumentType.NONE }
    ];

    documentCategories = [
        { label: 'Normal', value: DocumentCategory.NORMAL },
        { label: 'Encriptado', value: DocumentCategory.ENCRYPTED }
    ];

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
        private usersService: UsersService,
        private pdfGeneratorService: PdfGeneratorService,
        private qrGeneratorService: QrGeneratorService,
        private messageService: MessageService,
        private sanitizer: DomSanitizer,
        private router: Router
    ) {
        this.docForm = this.fb.group({
            title: ['', Validators.required],
            category: [DocumentCategory.NORMAL, Validators.required],
            recipient: ['', Validators.required],
            type: [DocumentType.MEMORANDUM, Validators.required],
            content: ['', Validators.required],
            password: [''] // Contraseña opcional para documentos normales
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
        this.loadUsers();
    }

    loadDrafts() {
        this.loadingDrafts = true;
        this.documentService.getDrafts().subscribe(data => {
            this.drafts = data;
            this.loadingDrafts = false;
        });
    }

    loadUsers() {
        this.loadingUsers = true;
        this.usersService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.filteredUsers = data;
                this.loadingUsers = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los usuarios'
                });
                this.loadingUsers = false;
            }
        });
    }

    searchUsers(event: any) {
        const query = event.query.toLowerCase();
        if (!query) {
            this.filteredUsers = this.users.map(u => ({
                ...u,
                displayName: `${u.name} ${u.lastname}`
            }));
        } else {
            this.filteredUsers = this.users
                .filter(user => 
                    user.name.toLowerCase().includes(query) ||
                    user.lastname.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
                )
                .map(u => ({
                    ...u,
                    displayName: `${u.name} ${u.lastname}`
                }));
        }
    }

    onUserSelect(event: any) {
        const user = event.value || event;
        if (user && user.name) {
            this.selectedUser = user;
            const displayValue = `${user.name} ${user.lastname}`;
            this.docForm.patchValue({
                recipient: displayValue
            });
        }
    }

    getUserDisplayName(user: User | null): string {
        if (!user) return '';
        return `${user.name} ${user.lastname}`;
    }

    startNewDocument() {
        this.showDrafts = false;
        this.activeIndex = 0;
        this.selectedUser = null;
        this.docForm.reset({ 
            type: DocumentType.MEMORANDUM,
            category: DocumentCategory.NORMAL
        });
    }

    editDraft(doc: DocumentModel) {
        this.showDrafts = false;
        this.activeIndex = 0;
        this.selectedUser = null;
        this.docForm.patchValue({
            title: doc.title,
            category: doc.category,
            recipient: doc.recipient,
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
                    this.docForm.get('category')?.valid === true;
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
                this.docForm.get('category')?.invalid ||
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
            subject: this.docForm.get('category')?.value || '',
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
    async finalizeDocument(): Promise<void> {
        this.loading = true;
        
        try {
            // Obtener el contenido del documento (texto plano sin HTML)
            const content = this.stripHtml(this.docForm.get('content')?.value || '');
            
            // Encriptar el contenido usando codificación aritmética
            const encryptedData: ArithmeticResult = encodeArithmetic(content);
            
            // Convertir el PDF a base64
            const pdfBase64 = this.pdfBlobForSignature ? await this.blobToBase64(this.pdfBlobForSignature) : null;
            
            // Preparar datos según la categoría
            const category = this.docForm.get('category')?.value;
            const isEncrypted = category === DocumentCategory.ENCRYPTED;
            
            // Enviar al endpoint con los datos encriptados
            this.documentService.uploadDocument({
                title: this.docForm.get('title')?.value,
                type: this.docForm.get('type')?.value,
                category: category,
                password: isEncrypted ? null : (this.docForm.get('password')?.value || null),
                code: encryptedData.code,
                length: encryptedData.length,
                frequencies: JSON.stringify(encryptedData.frequencies),
                file: pdfBase64
            }).subscribe({
                next: (response) => {
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
        } catch (error) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Error al procesar el documento' 
            });
            this.loading = false;
        }
    }

    /**
     * Convierte un Blob a string Base64
     */
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remover el prefijo "data:application/pdf;base64,"
                const base64 = base64String.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Elimina etiquetas HTML y retorna texto plano
     */
    private stripHtml(html: string): string {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
}
