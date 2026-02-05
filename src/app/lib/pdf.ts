import { jsPDF } from 'jspdf';

/**
 * Generates a simple PDF from text content.
 * This is a foundation for document tailoring.
 */
export const generatePDF = async (title: string, content: string, fileName?: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 7;

    let cursorY = 30;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');

    // Check if title needs splitting (unlikely for a title but good for robustness)
    const splitTitle = doc.splitTextToSize(title, contentWidth);
    for (const line of splitTitle) {
        if (cursorY > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 10;
    }
    cursorY += 5; // Extra space after title

    // Body
    doc.setFontSize(11); // Slightly smaller font for more content per page
    doc.setFont('helvetica', 'normal');

    const splitText = doc.splitTextToSize(content, contentWidth);

    for (const line of splitText) {
        if (cursorY > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
    }

    // Save or Return
    if (fileName) {
        doc.save(fileName);
    } else {
        return doc.output('blob');
    }
};
