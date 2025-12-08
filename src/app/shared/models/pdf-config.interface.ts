/**
 * Configuración para la generación de PDFs
 */
export interface PdfConfig {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  compress?: boolean;
  unit?: 'mm' | 'cm' | 'in' | 'pt';
}

/**
 * Estructura de un documento para generar PDF
 */
export interface PdfDocument {
  title: string;
  subject: string;
  content: string; // Contenido HTML del editor
  metadata: PdfMetadata;
}

/**
 * Metadatos del documento PDF
 */
export interface PdfMetadata {
  type: string;
  sender: string;
  recipient: string;
  date: Date;
}

/**
 * Opciones para la plantilla del documento oficial
 */
export interface DocumentTemplate {
  showHeader?: boolean;
  showFooter?: boolean;
  showMetadata?: boolean;
  headerLogo?: string;
  watermark?: string;
}
