import type { RequestHandler } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { buffer } from 'stream/consumers';
import path from 'path';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  const { offertnummer, name, adresse, plz, items, mwst } = await request.json();

  const doc = new PDFDocument({ size: 'A4', margin: 41 });
  const stream = Readable.from(doc);

  // Register Poppins fonts
  const fonts = {
    regular: path.resolve('static/Poppins-Regular.ttf'),
    bold: path.resolve('static/Poppins-Bold.ttf'),
    medium: path.resolve('static/Poppins-Medium.ttf'),
    semiBold: path.resolve('static/Poppins-SemiBold.ttf')
  };
  if (fs.existsSync(fonts.regular)) doc.registerFont('Poppins-Regular', fonts.regular);
  if (fs.existsSync(fonts.bold))    doc.registerFont('Poppins-Bold',    fonts.bold);
  if (fs.existsSync(fonts.medium))  doc.registerFont('Poppins-Medium',  fonts.medium);
  if (fs.existsSync(fonts.semiBold))doc.registerFont('Poppins-SemiBold',fonts.semiBold);

  // Logo oben links
  const logoPath = path.resolve('static/mirdita-logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 41, 40, { width: 80 });
    doc.moveDown(1.3);
  }

  // Subtitle
  doc.font('Poppins-Regular')
     .fontSize(10)
     .fillColor('#0175ff')
     .text('Professionelle Reinigungsdienste', 40, doc.y);
  doc.fillColor('#000000');
  doc.moveDown(3);

  // Address block
  const y0 = doc.y;
  doc.font('Poppins-SemiBold').fontSize(12).text('Mirdita Reinigung Berisha', 40, y0);
  doc.font('Poppins-Regular').fontSize(12).text('Fo-Strasse 4', 40, y0 + 15);
  doc.font('Poppins-Regular').fontSize(12).text('3904 Naters', 40, y0 + 30);

  // Customer info
  doc.font('Poppins-Regular').fontSize(12).text(`${name}\n${adresse}\n${plz}`, 400, y0);

  doc.moveDown(1);

  // Header Offerte #
  doc.font('Poppins-SemiBold').fontSize(12).text(`Offerte ${offertnummer}`, 40, doc.y);
  doc.moveDown();

  // ===== Table Section =====
  doc.font('Poppins-Bold').fontSize(14).text('Leistungen', 40, doc.y);
  doc.moveDown(0.5);

  // Column headers
  const headerY = doc.y;
  doc.font('Poppins-Medium').fontSize(12);
  doc.text('Bezeichnung', 40, headerY);
  doc.text('Menge',       250, headerY, { align: 'right', width: 50 });
  doc.text('Einzelpreis', 310, headerY, { align: 'right', width: 80 });
  doc.text('Gesamt',      400, headerY, { align: 'right', width: 100 });
  doc.moveDown(0.4);

  // Items
  doc.font('Poppins-Regular').fontSize(12);
  let subtotal = 0;
  for (const item of items) {
    const y = doc.y;
    const lineTotal = item.qty * item.price;
    subtotal += lineTotal;

    doc.text(item.title, 40, y, { width: 200, align: 'left' });
    doc.text(`${item.qty}`, 250, y, { align: 'right', width: 50 });
    doc.text(`Fr. ${item.price.toFixed(2)}`, 310, y, { align: 'right', width: 80 });
    doc.text(`Fr. ${lineTotal.toFixed(2)}`, 400, y, { align: 'right', width: 100 });

    doc.moveDown(0.3);
  }

  // Totals
  doc.moveDown();
  doc.font('Poppins-SemiBold').fontSize(12);
  doc.text(`Subtotal: Fr. ${subtotal.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });

  if (mwst) {
    const tax = subtotal * 0.081;
    const total = subtotal + tax;
    doc.text(`+ MwSt. (8.1%): Fr. ${tax.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
    doc.font('Poppins-Bold').fontSize(12);
    doc.text(`Total: Fr. ${total.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
  } else {
    doc.font('Poppins-Bold').fontSize(12);
    doc.text(`Total: Fr. ${subtotal.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
  }

  doc.end();

  const pdfBuffer = await buffer(stream);
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="offerte.pdf"'
    }
  });
};
