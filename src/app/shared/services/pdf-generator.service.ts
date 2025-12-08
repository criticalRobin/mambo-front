import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { PdfConfig, PdfDocument, DocumentTemplate } from '../models/pdf-config.interface';
import type { AppliedSignature } from '../components/signature-canvas/signature-canvas.component';

/**
 * Servicio para generar documentos PDF
 * Utiliza jsPDF y html2canvas para convertir contenido HTML a PDF
 */
@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly DEFAULT_CONFIG: PdfConfig = {
    orientation: 'portrait',
    format: 'a4',
    compress: true,
    unit: 'mm',
  };

  private readonly DEFAULT_TEMPLATE: DocumentTemplate = {
    showHeader: true,
    showFooter: true,
    showMetadata: true,
    watermark: '',
  };

  /**
   * Genera un PDF desde contenido HTML simple
   * @param content Contenido HTML a convertir
   * @param config Configuración del PDF
   * @returns Promesa con el Blob del PDF generado
   */
  async generateFromHTML(content: string, config: Partial<PdfConfig> = {}): Promise<Blob> {
    const pdfConfig = { ...this.DEFAULT_CONFIG, ...config };
    const doc = this.createDocument(pdfConfig);

    // Crear elemento temporal para renderizar el HTML
    const tempElement = this.createTempElement(content);

    try {
      // Convertir HTML a canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calcular dimensiones para el PDF
      const imgWidth = pdfConfig.format === 'a4' ? 210 : 216; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Agregar imagen al PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      return doc.output('blob');
    } finally {
      // Limpiar elemento temporal
      document.body.removeChild(tempElement);
    }
  }

  /**
   * Genera un PDF de documento oficial completo con plantilla
   * @param document Datos del documento
   * @param template Configuración de la plantilla
   * @param config Configuración del PDF
   * @returns Promesa con el Blob del PDF generado
   */
  async generateDocument(
    document: PdfDocument,
    template: Partial<DocumentTemplate> = {},
    config: Partial<PdfConfig> = {}
  ): Promise<Blob> {
    const pdfConfig = { ...this.DEFAULT_CONFIG, ...config };
    const docTemplate = { ...this.DEFAULT_TEMPLATE, ...template };
    const doc = this.createDocument(pdfConfig);

    let yPosition = 20; // Posición Y inicial

    // Agregar encabezado si está habilitado
    if (docTemplate.showHeader) {
      yPosition = this.addHeader(doc, document, yPosition);
    }

    // Agregar metadata si está habilitada
    if (docTemplate.showMetadata) {
      yPosition = this.addMetadata(doc, document, yPosition);
    }

    // Agregar contenido HTML
    yPosition = await this.addHTMLContent(doc, document.content, yPosition);

    // Agregar pie de página si está habilitado
    if (docTemplate.showFooter) {
      this.addFooter(doc, document);
    }

    // Agregar marca de agua si existe
    if (docTemplate.watermark) {
      this.addWatermark(doc, docTemplate.watermark);
    }

    return doc.output('blob');
  }

  /**
   * Genera un PDF de documento con firma electrónica posicionada
   * @param document Datos del documento
   * @param signature Firma aplicada con posición
   * @param template Configuración de la plantilla
   * @param config Configuración del PDF
   * @returns Promesa con el Blob del PDF firmado
   */
  async generateDocumentWithSignature(
    document: PdfDocument,
    signature: AppliedSignature,
    template: Partial<DocumentTemplate> = {},
    config: Partial<PdfConfig> = {}
  ): Promise<Blob> {
    const pdfConfig = { ...this.DEFAULT_CONFIG, ...config };
    const docTemplate = { ...this.DEFAULT_TEMPLATE, ...template };
    const doc = this.createDocument(pdfConfig);

    let yPosition = 20;

    // Agregar encabezado
    if (docTemplate.showHeader) {
      yPosition = this.addHeader(doc, document, yPosition);
    }

    // Agregar metadata
    if (docTemplate.showMetadata) {
      yPosition = this.addMetadata(doc, document, yPosition);
    }

    // Agregar contenido HTML
    yPosition = await this.addHTMLContent(doc, document.content, yPosition);

    // Agregar firma electrónica en la posición especificada
    await this.addElectronicSignature(doc, signature, pdfConfig);

    // Agregar pie de página
    if (docTemplate.showFooter) {
      this.addFooter(doc, document);
    }

    return doc.output('blob');
  }

  /**
   * Genera una URL de vista previa del PDF
   * @param document Datos del documento
   * @param template Configuración de la plantilla
   * @returns Promesa con la URL del PDF
   */
  async generatePreviewURL(
    document: PdfDocument,
    template: Partial<DocumentTemplate> = {}
  ): Promise<string> {
    const blob = await this.generateDocument(document, template);
    return URL.createObjectURL(blob);
  }

  /**
   * Descarga el PDF en el navegador
   * @param blob Blob del PDF
   * @param filename Nombre del archivo
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Crea una instancia de jsPDF con la configuración especificada
   */
  private createDocument(config: PdfConfig): jsPDF {
    return new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
      compress: config.compress,
    });
  }

  /**
   * Crea un elemento temporal en el DOM para renderizar HTML
   */
  private createTempElement(content: string): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML = content;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.width = '210mm'; // A4 width
    element.style.padding = '20px';
    element.style.backgroundColor = '#ffffff';
    document.body.appendChild(element);
    return element;
  }

  /**
   * Agrega el encabezado del documento
   */
  private addHeader(doc: jsPDF, document: PdfDocument, yPosition: number): number {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(document.title, 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(document.subject, 105, yPosition, { align: 'center' });

    yPosition += 15;
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);

    return yPosition + 10;
  }

  /**
   * Agrega la metadata del documento
   */
  private addMetadata(doc: jsPDF, document: PdfDocument, yPosition: number): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const metadata = [
      `Tipo: ${document.metadata.type}`,
      `De: ${document.metadata.sender}`,
      `Para: ${document.metadata.recipient}`,
      `Fecha: ${this.formatDate(document.metadata.date)}`,
    ];

    metadata.forEach((line) => {
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);

    return yPosition + 10;
  }

  /**
   * Agrega contenido HTML al PDF
   */
  private async addHTMLContent(
    doc: jsPDF,
    content: string,
    yPosition: number
  ): Promise<number> {
    const tempElement = this.createTempElement(content);

    try {
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgWidth = 170; // Ancho disponible en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');

      // Verificar si necesitamos una nueva página
      const pageHeight = doc.internal.pageSize.getHeight();
      if (yPosition + imgHeight > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      return yPosition + imgHeight + 10;
    } finally {
      document.body.removeChild(tempElement);
    }
  }

  /**
   * Agrega el pie de página
   */
  private addFooter(doc: jsPDF, document: PdfDocument): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);

      const footerText = `Documento generado por MAMBO - Página ${i} de ${pageCount}`;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }

  /**
   * Agrega la firma electrónica al PDF en la posición especificada
   */
  private async addElectronicSignature(
    doc: jsPDF,
    signature: AppliedSignature,
    config: PdfConfig
  ): Promise<void> {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Diseño horizontal como FirmaEC: QR a la izquierda, texto a la derecha
    const qrSize = 25; // mm - Tamaño del QR cuadrado
    const totalWidth = 70; // mm - Ancho total de la firma (aumentado para más espacio de texto)
    const totalHeight = 25; // mm - Alto total de la firma
    
    // Calcular posición centrada en el punto de click
    const xPos = (signature.position.x / 100) * pageWidth - (totalWidth / 2);
    const yPos = (signature.position.y / 100) * pageHeight - (totalHeight / 2);

    try {
      // 1. Agregar QR a la izquierda
      doc.addImage(
        signature.qrDataUrl,
        'PNG',
        xPos,
        yPos,
        qrSize,
        qrSize
      );

      // 2. Agregar texto a la derecha del QR con alineación vertical centrada
      const textX = xPos + qrSize + 3; // 3mm de separación del QR
      const textStartY = yPos + 3; // Comenzar un poco más abajo para centrar verticalmente
      
      // Línea 1: "Firmado electrónicamente por:"
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Firmado electrónicamente por:', textX, textStartY);
      
      // Línea 2: Nombre del firmante en MAYÚSCULAS y BOLD
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(signature.config.signerName.toUpperCase(), textX, textStartY + 5);
      
      // Línea 3: "Validar únicamente con FirmaEC"
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Validar únicamente con FirmaEC', textX, textStartY + 10);
      
      // Línea 4: Fecha y hora
      const dateStr = new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(signature.config.signatureDate);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(dateStr, textX, textStartY + 15);
    } catch (error) {
      console.error('Error agregando firma al PDF:', error);
    }
  }

  /**
   * Agrega marca de agua al documento
   */
  private addWatermark(doc: jsPDF, watermarkText: string): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 200, 200);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.saveGraphicsState();
      doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
      doc.restoreGraphicsState();
    }
  }

  /**
   * Formatea una fecha al formato español
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}
