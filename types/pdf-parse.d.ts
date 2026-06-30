// types/pdf-parse.d.ts
declare module "pdf-parse/lib/pdf-parse" {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: Date;
    ModDate?: Date;
  }

  interface PDFMetadata {
    [key: string]: string | number | Date | undefined;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    version: string;
    text: string;
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
