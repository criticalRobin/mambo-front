import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

/**
 * Configuración para generar QR de firma electrónica
 */
export interface QrSignatureConfig {
  signerName: string;
  signerDocument: string; // Cédula o ID
  signatureDate: Date;
  documentId: string;
  documentTitle: string;
}

/**
 * Servicio para generar códigos QR de firma electrónica
 * Simula el comportamiento de FirmaEC de Ecuador
 */
@Injectable({
  providedIn: 'root',
})
export class QrGeneratorService {
  
  /**
   * Genera un código QR con la información de la firma electrónica
   * @param config Configuración de la firma
   * @returns Promesa con la URL del QR en base64
   */
  async generateSignatureQR(config: QrSignatureConfig): Promise<string> {
    // Construir el texto del QR similar a FirmaEC
    const qrData = this.buildQrData(config);

    try {
      // Generar QR con opciones optimizadas
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // Alto nivel de corrección
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generando QR:', error);
      throw new Error('No se pudo generar el código QR de firma');
    }
  }

  /**
   * Genera QR con texto personalizado
   * @param text Texto a codificar
   * @param size Tamaño del QR
   * @returns Promesa con la URL del QR
   */
  async generateQR(text: string, size: number = 200): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
    } catch (error) {
      console.error('Error generando QR:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Construye el texto del QR con formato FirmaEC
   * En producción, esto debería ser un token JWT o certificado digital
   */
  private buildQrData(config: QrSignatureConfig): string {
    const timestamp = config.signatureDate.getTime();
    
    // Formato simulado de FirmaEC
    // En producción: sería un JWT firmado o URL de validación
    const qrContent = {
      firmante: config.signerName,
      cedula: config.signerDocument,
      documento: config.documentId,
      titulo: config.documentTitle,
      fecha: this.formatDate(config.signatureDate),
      timestamp: timestamp,
      hash: this.generateMockHash(config),
      validar: `https://firmaec.gob.ec/validate/${this.generateMockHash(config)}`,
    };

    return JSON.stringify(qrContent, null, 2);
  }

  /**
   * Genera un hash simulado para la firma
   * En producción: usar algoritmo criptográfico real
   */
  private generateMockHash(config: QrSignatureConfig): string {
    const data = `${config.signerDocument}-${config.documentId}-${config.signatureDate.getTime()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase();
  }

  /**
   * Formatea fecha al estándar ecuatoriano
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }
}
