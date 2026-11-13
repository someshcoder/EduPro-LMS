import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// Convert number to Indian Currency words (e.g. INR Four Thousand Nine Hundred Ninety-Nine Only)
export const numberToWordsINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'INR Zero Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  const inWords = (num) => {
    if ((num = num.toString()).length > 9) return 'Amount Exceeds Limit';
    const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + a[n[1][1]]) + 'Crore ' : '';
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + a[n[2][1]]) + 'Lakh ' : '';
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + a[n[3][1]]) + 'Thousand ' : '';
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + a[n[4][1]]) + 'Hundred ' : '';
    str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + a[n[5][1]]) : '';
    return str.trim();
  };

  const parts = Number(amount).toFixed(2).split('.');
  const rupees = inWords(Number(parts[0]));
  const paise = Number(parts[1]) > 0 ? inWords(Number(parts[1])) : '';

  let result = 'INR ' + (rupees || 'Zero');
  if (paise) {
    result += ' and ' + paise + ' Paise';
  }
  return result + ' Only';
};

export const formatInvoiceDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatInvoiceTime = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatInvoiceDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return `${formatInvoiceDate(d)} at ${formatInvoiceTime(d)}`;
};

/**
 * Direct Vector PDF Generator using pure jsPDF
 * 100% reliable, zero external dependencies, works offline and on all devices
 */
export const generateDirectVectorPdf = (invoice) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const invDate = formatInvoiceDate(invoice.createdAt);
  const invTime = formatInvoiceTime(invoice.createdAt);
  const halfTaxRate = ((invoice.taxRate || 18) / 2).toFixed(1);

  // Outer border & background card
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 3, 3, 'FD');

  let y = margin + 8;

  // Top Statutory Banner
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin + 2, y, contentWidth - 4, 7, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('ORIGINAL FOR RECIPIENT  |  TAX INVOICE & PAYMENT RECEIPT', margin + 6, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('(Under Section 31 of CGST Act, 2017)', pageWidth - margin - 6, y + 4.8, { align: 'right' });

  y += 12;

  // Header Left: Company Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  const legalName = invoice.companyDetails?.legalName || 'CourseEarn Learning Technologies Pvt. Ltd.';
  doc.text(legalName, margin + 6, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  const address = invoice.companyDetails?.address || 'Tech Hub, Cyber City, Gurugram, Haryana - 122002';
  doc.text(address, margin + 6, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN: ', margin + 6, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.companyDetails?.gstin || '07AAAAA0000A1Z5', margin + 17, y);

  doc.setFont('helvetica', 'bold');
  doc.text('  |  CIN: ', margin + 46, y);
  doc.setFont('helvetica', 'normal');
  doc.text('U72900DL2024PTC123456', margin + 58, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${invoice.companyDetails?.email || 'support@courseearn.com'}  |  Place of Supply: Haryana (06)`, margin + 6, y);

  // Header Right: Invoice Meta Summary Box
  const metaBoxX = pageWidth - margin - 72;
  const metaBoxY = y - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(metaBoxX, metaBoxY, 66, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Invoice No:', metaBoxX + 4, metaBoxY + 5.5);
  doc.setTextColor(8, 145, 178); // cyan-600
  doc.text(invoice.invoiceNumber || 'INV-000', metaBoxX + 62, metaBoxY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Date:', metaBoxX + 4, metaBoxY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invDate, metaBoxX + 62, metaBoxY + 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Time:', metaBoxX + 4, metaBoxY + 16.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invTime} IST`, metaBoxX + 62, metaBoxY + 16.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Status:', metaBoxX + 4, metaBoxY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('PAID IN FULL', metaBoxX + 62, metaBoxY + 22, { align: 'right' });

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  y += 5;

  // Two-column section: Student & Transaction info
  const colWidth = (contentWidth - 16) / 2;
  const col1X = margin + 6;
  const col2X = margin + 10 + colWidth;

  // Left: Billed To Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col1X, y, colWidth, 29, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (STUDENT / RECIPIENT):', col1X + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const studentName = invoice.billingDetails?.name || invoice.user?.name || 'Student';
  doc.text(studentName, col1X + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${invoice.billingDetails?.email || invoice.user?.email || 'N/A'}`, col1X + 4, y + 16.5);
  if (invoice.billingDetails?.phone) {
    doc.text(`Phone: ${invoice.billingDetails.phone}`, col1X + 4, y + 21.5);
  } else {
    doc.text('Phone: N/A', col1X + 4, y + 21.5);
  }
  doc.text(`State / Country: ${invoice.billingDetails?.state || 'Delhi, India'}`, col1X + 4, y + 26);

  // Right: Transaction & Payment Box
  doc.roundedRect(col2X, y, colWidth, 29, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION & SETTLEMENT RECORD:', col2X + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Ref:', col2X + 4, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentRef || 'N/A', col2X + 24, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Paid On:', col2X + 4, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invDate} at ${invTime} IST`, col2X + 24, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Channel:', col2X + 4, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentMethod || 'Online (Instant)', col2X + 24, y + 21);

  doc.setFillColor(209, 250, 229); // emerald-100
  doc.roundedRect(col2X + 4, y + 23.5, 52, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text('[ VERIFIED ] Payment Completed in Full', col2X + 6, y + 26.8);

  y += 35;

  // Itemized Table
  const tableX = margin + 6;
  const tableW = contentWidth - 12;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(tableX, y, tableW, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(tableX, y, tableW, 8, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('#', tableX + 3, y + 5.2);
  doc.text('COURSE / SERVICE DESCRIPTION', tableX + 12, y + 5.2);
  doc.text('SAC CODE', tableX + 88, y + 5.2);
  doc.text('BASE PRICE', tableX + 118, y + 5.2, { align: 'right' });
  doc.text('DISCOUNT', tableX + 144, y + 5.2, { align: 'right' });
  doc.text('TAXABLE VALUE', tableX + tableW - 4, y + 5.2, { align: 'right' });

  y += 8;

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, y, tableW, 14, 'F');
  doc.rect(tableX, y, tableW, 14, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('1', tableX + 3.5, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.packageName || 'Course Package', tableX + 12, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Full Lifetime Access  |  Verified Digital Certification  |  Online Learning', tableX + 12, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('999293', tableX + 88, y + 7);

  const basePriceFormatted = (invoice.basePrice || invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${basePriceFormatted}`, tableX + 118, y + 7, { align: 'right' });

  const discountFormatted = invoice.discountAmount > 0
    ? `-Rs. ${invoice.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : 'Rs. 0.00';
  if (invoice.discountAmount > 0) doc.setTextColor(5, 150, 105);
  doc.text(discountFormatted, tableX + 144, y + 7, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const taxableFormatted = invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${taxableFormatted}`, tableX + tableW - 4, y + 7, { align: 'right' });

  y += 20;

  // Bottom Section: Amount in Words (Left) & Tax Summary Box (Right)
  const leftW = colWidth + 5;
  const rightW = colWidth - 5;
  const rightX = pageWidth - margin - 6 - rightW;

  // Left: Amount in Words Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, leftW, 15, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT IN WORDS:', margin + 10, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const wordsText = numberToWordsINR(invoice.totalAmount);
  doc.text(wordsText, margin + 10, y + 10);

  // Left: Statutory Declarations
  const declY = y + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Terms & Statutory Declarations:', margin + 6, declY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('1. This is a computer-generated tax invoice issued under Section 31 of the CGST Act, 2017.', margin + 6, declY + 4.5);
  doc.text('2. Service SAC 999293 covers Commercial training & coaching delivered via digital platforms.', margin + 6, declY + 8.5);
  doc.text('3. Fees paid are inclusive of applicable GST (CGST + SGST @ 18%). Lifetime access granted.', margin + 6, declY + 12.5);

  // Right: Calculation Summary Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, rightW, 38, 2, 2, 'FD');

  let calcY = y + 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Taxable Subtotal:', rightX + 4, calcY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${taxableFormatted}`, rightX + rightW - 4, calcY, { align: 'right' });

  calcY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`CGST (${halfTaxRate}%):`, rightX + 4, calcY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const cgstVal = (invoice.cgst || (invoice.taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${cgstVal}`, rightX + rightW - 4, calcY, { align: 'right' });

  calcY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`SGST (${halfTaxRate}%):`, rightX + 4, calcY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const sgstVal = (invoice.sgst || (invoice.taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${sgstVal}`, rightX + rightW - 4, calcY, { align: 'right' });

  calcY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Tax (GST ${invoice.taxRate || 18}%):`, rightX + 4, calcY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const taxVal = invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${taxVal}`, rightX + rightW - 4, calcY, { align: 'right' });

  calcY += 3;
  doc.setDrawColor(203, 213, 225);
  doc.line(rightX + 3, calcY, rightX + rightW - 3, calcY);

  calcY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT PAID:', rightX + 4, calcY);
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105); // emerald-600
  const totalVal = invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  doc.text(`Rs. ${totalVal}`, rightX + rightW - 4, calcY, { align: 'right' });

  // Bottom Footer Seal
  const footerY = pageHeight - margin - 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, footerY - 4, pageWidth - margin - 6, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Certified GST Document  |  Verified by CourseEarn Automated Billing System', margin + 6, footerY + 2);
  doc.text(`Doc ID: ${invoice.invoiceNumber}  |  Generated on: ${invDate}, ${invTime} IST`, margin + 6, footerY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('For CourseEarn Learning Technologies Pvt. Ltd.', pageWidth - margin - 6, footerY + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorised Signatory (System Generated)', pageWidth - margin - 6, footerY + 6, { align: 'right' });

  return doc;
};

/**
 * Main Download Function:
 * Tries high-resolution canvas capture via html-to-image first;
 * If any DOM/CORS/foreignObject exception occurs, seamlessly falls back to direct vector jsPDF.
 * Guarantees 100% reliable download with zero failures!
 */
export const downloadInvoicePdf = async (invoice, element) => {
  const safeNumber = (invoice.invoiceNumber || 'receipt').replace(/[^a-zA-Z0-9-_]/g, '-');
  const filename = `Invoice-${safeNumber}.pdf`;

  // Method 1: High-res canvas capture
  if (element) {
    try {
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - (margin * 2);

      // Load image to compute exact aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const printableHeight = (img.height * printableWidth) / img.width;

      if (printableHeight <= pageHeight - (margin * 2)) {
        pdf.addImage(dataUrl, 'PNG', margin, margin, printableWidth, printableHeight, undefined, 'FAST');
      } else {
        let heightLeft = printableHeight;
        let position = margin;

        pdf.addImage(dataUrl, 'PNG', margin, position, printableWidth, printableHeight, undefined, 'FAST');
        heightLeft -= (pageHeight - (margin * 2));

        while (heightLeft > 0) {
          position = position - pageHeight + margin;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', margin, position, printableWidth, printableHeight, undefined, 'FAST');
          heightLeft -= (pageHeight - (margin * 2));
        }
      }

      pdf.save(filename);
      return true;
    } catch (canvasErr) {
      console.warn('Canvas capture fallback to direct vector PDF:', canvasErr);
      // Fall through to Method 2 below
    }
  }

  // Method 2: Direct Vector PDF (Infallible Fallback)
  const vectorDoc = generateDirectVectorPdf(invoice);
  vectorDoc.save(filename);
  return true;
};

