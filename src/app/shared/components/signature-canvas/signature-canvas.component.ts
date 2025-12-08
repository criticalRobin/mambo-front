import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { QrGeneratorService, QrSignatureConfig } from '../../services/qr-generator.service';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Posición de la firma en el documento
 */
export interface SignaturePosition {
  x: number; // Porcentaje (0-100)
  y: number; // Porcentaje (0-100)
}

/**
 * Datos de la firma aplicada
 */
export interface AppliedSignature {
  position: SignaturePosition;
  qrDataUrl: string;
  config: QrSignatureConfig;
}

/**
 * Componente para posicionar firma electrónica sobre PDF
 * Muestra el PDF renderizado y permite arrastrar un icono para posicionar la firma
 * El QR se genera y estampa cuando se confirma la firma
 */
@Component({
  selector: 'app-signature-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, ButtonModule, CardModule],
  templateUrl: './signature-canvas.component.html',
  styleUrl: './signature-canvas.component.css',
})
export class SignatureCanvasComponent implements OnInit, AfterViewInit {
  @Input() pdfPreviewUrl: string | null = null;
  @Input() signatureConfig!: QrSignatureConfig;
  
  @Output() signatureApplied = new EventEmitter<AppliedSignature>();
  @Output() signaturePlaced = new EventEmitter<SignaturePosition>();

  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('signatureIcon') signatureIconRef!: ElementRef<HTMLDivElement>;

  qrDataUrl: string = '';
  signaturePosition: SignaturePosition | null = null; // Se define al hacer clic
  hoverPosition: SignaturePosition | null = null; // Sigue el cursor
  loading: boolean = false;
  canvasReady: boolean = false;

  // Dimensiones
  canvasWidth: number = 800;
  canvasHeight: number = 1000;

  constructor(private qrGenerator: QrGeneratorService) {
    // Configurar worker de PDF.js desde assets locales
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.mjs';
  }

  ngOnInit() {
    // Generar QR al inicio
    this.generateQR();
  }

  ngAfterViewInit() {
    // Usar setTimeout para asegurar que el canvas esté renderizado
    setTimeout(() => {
      if (this.pdfPreviewUrl) {
        this.renderPdfPreview();
      }
    }, 100);
  }

  /**
   * Genera el QR de la firma electrónica
   */
  private async generateQR(): Promise<void> {
    try {
      this.loading = true;
      this.qrDataUrl = await this.qrGenerator.generateSignatureQR(this.signatureConfig);
    } catch (error) {
      console.error('Error generando QR de firma:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Renderiza el PDF en el canvas como preview usando PDF.js
   */
  private async renderPdfPreview(): Promise<void> {
    if (!this.pdfPreviewUrl) {
      console.error('No PDF preview URL provided');
      return;
    }
    if (!this.pdfCanvasRef?.nativeElement) {
      console.error('Canvas element not ready');
      return;
    }

    const canvas = this.pdfCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    try {
      this.loading = true;
      this.canvasReady = false;

      // Cargar el PDF usando PDF.js
      const loadingTask = pdfjsLib.getDocument(this.pdfPreviewUrl);
      const pdf = await loadingTask.promise;

      // Obtener la primera página
      const page = await pdf.getPage(1);

      // Calcular escala para ajustar al ancho del canvas
      const viewport = page.getViewport({ scale: 1 });
      const scale = this.canvasWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      // Ajustar dimensiones del canvas
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      this.canvasHeight = canvas.height;

      // Renderizar página en canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
        background: 'transparent'
      };

      await page.render(renderContext as any).promise;

      this.canvasReady = true;
      this.loading = false;
      console.log('PDF rendered successfully on canvas');
    } catch (error) {
      console.error('Error renderizando PDF preview:', error);
      this.loading = false;
    }
  }

  /**
   * Sigue el movimiento del cursor sobre el canvas
   * Calcula la posición exacta considerando el offset del contenedor
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.pdfCanvasRef?.nativeElement) return;
    
    const canvas = this.pdfCanvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calcular posición relativa al canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir a porcentaje del tamaño real del canvas
    this.hoverPosition = {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    };
  }

  onMouseLeave(): void {
    this.hoverPosition = null;
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.hoverPosition) return;
    this.signaturePosition = { ...this.hoverPosition };
    this.signaturePlaced.emit(this.signaturePosition);

    const signature: AppliedSignature = {
      position: this.signaturePosition,
      qrDataUrl: this.qrDataUrl,
      config: this.signatureConfig,
    };
    this.signatureApplied.emit(signature);
  }

  /**
   * Aplica la firma al documento
   */
  async applySignature(): Promise<void> {
    if (!this.signaturePosition) return;
    const signature: AppliedSignature = {
      position: this.signaturePosition,
      qrDataUrl: this.qrDataUrl,
      config: this.signatureConfig,
    };
    this.signatureApplied.emit(signature);
  }

  /**
   * Resetea la posición de la firma al centro
   */
  resetPosition(): void {
    this.signaturePosition = null;
    this.hoverPosition = null;
    this.signaturePlaced.emit(this.signaturePosition as any);
  }
}
