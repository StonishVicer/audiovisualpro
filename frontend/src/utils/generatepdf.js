import { jsPDF } from 'jspdf';

const MARGIN_LEFT = 15;
const DOC_WIDTH = 210; 
const MARGIN_RIGHT = DOC_WIDTH - MARGIN_LEFT;
const ROW_HEIGHT = 8;
const HEADER_FILL_COLOR = [230, 230, 230]; 
const LINE_COLOR = [200, 200, 200];

const COL_WIDTHS = [15, 30, 45, 25, 40]; 

function formatMonto(value) {
    const cleanValue = String(value).replace('$', '').trim();
    const numericValue = parseFloat(cleanValue);

    if (!isNaN(numericValue)) {
        return `$${numericValue.toFixed(2)}`;
    }
    return `$0.00`; 
}

function drawManualTable(doc, startY, headers, bodyData) {
    let currentY = startY;
    let currentX;
    doc.setFillColor(...HEADER_FILL_COLOR);
    const tableWidth = MARGIN_RIGHT - MARGIN_LEFT;
    doc.rect(MARGIN_LEFT, currentY, tableWidth, ROW_HEIGHT, 'F')

    doc.setFontSize(10);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.setTextColor(0, 0, 0);

    currentX = MARGIN_LEFT;
    headers.forEach((header, index) => {
        doc.text(header, currentX + 1, currentY + ROW_HEIGHT / 2 + 1.5);
        currentX += COL_WIDTHS[index];
    });

    currentY += ROW_HEIGHT;
    doc.setFont(doc.getFont().fontName, 'normal')
    bodyData.forEach(row => {
        currentX = MARGIN_LEFT;
        doc.setDrawColor(...LINE_COLOR);
        doc.setLineWidth(0.2);
        doc.line(MARGIN_LEFT, currentY, MARGIN_RIGHT, currentY);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        row.forEach((cellText, index) => {
            const width = COL_WIDTHS[index];
            if (index === 3) {
                 doc.text(String(cellText), currentX + width - 1, currentY + ROW_HEIGHT / 2 + 1.5, { align: 'right' });
            } else {
                 doc.text(String(cellText), currentX + 1, currentY + ROW_HEIGHT / 2 + 1.5);
            }
            currentX += width;
        });
        currentY += ROW_HEIGHT;
    });
    doc.line(MARGIN_LEFT, currentY, MARGIN_RIGHT, currentY);
    
    return currentY; 
}

export function generateReportePDF(pagos, gastos, totalPagos, totalGastos) {
    const doc = new jsPDF();
    const hoy = new Date();
    const fechaReporte = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;
    
    const pagosHeaders = ['ID', 'Personal', 'Asignación', 'Monto', 'Fecha'];
    const pagosBody = pagos.map(pago => [pago.id, pago.personal, pago.asignacion, formatMonto(pago.monto), pago.fecha]);
    
    const gastosHeaders = ['ID', 'Proyecto', 'Descripción', 'Monto', 'Fecha'];
    const gastosBody = gastos.map(gasto => [gasto.id, gasto.proyecto, gasto.descripcion, formatMonto(gasto.monto), gasto.fecha]);
    
    doc.setFontSize(18);
    doc.text('Reportes financieros', DOC_WIDTH / 2, 20, { align: 'center' }); 

    let currentY = 35; 
    
    doc.setFontSize(14);
    doc.setFont(doc.getFont().fontName, 'semibold');
    doc.text(`Gastos (${gastos.length})`, MARGIN_LEFT, currentY);
    
    doc.setFontSize(12);
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.text(`Total: ${totalGastos}`, MARGIN_RIGHT, currentY, { align: 'right' }); 
    
    currentY += 5; 
    
    if (gastosBody.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150); 
        doc.text('No se encontraron gastos.', DOC_WIDTH / 2, currentY + 10, { align: 'center' });
        currentY += 20; 
    } else {
        currentY = drawManualTable(doc, currentY, gastosHeaders, gastosBody); 
    }
    
    currentY += 10; 
    
    doc.setFontSize(14);
    doc.setFont(doc.getFont().fontName, 'semibold');
    doc.setTextColor(0, 0, 0); 
    doc.text(`Pagos (${pagos.length})`, MARGIN_LEFT, currentY);
    
    doc.setFontSize(12);
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.text(`Total: ${totalPagos}`, MARGIN_RIGHT, currentY, { align: 'right' }); 

    currentY += 5;
    
    currentY = drawManualTable(doc, currentY, pagosHeaders, pagosBody);
    
    doc.setFontSize(8);
    doc.text(`Generado el: ${fechaReporte}`, 10, 280, { align: 'left' });

    doc.save('Reporte_Freestyle_Personalizado.pdf');
}

export function generateTestPDF() {
    const testGastos = [];
    const testPagos = [
        { id: 1, personal: 1, asignacion: '—', monto: 1000.00, fecha: '11/12/2025' }
    ];
    const testTotalGastos = '$0.00';
    const testTotalPagos = '$1000.00';

    generateReportePDF(testPagos, testGastos, testTotalPagos, testTotalGastos);
}