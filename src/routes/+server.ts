// src/routes/preview/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { buffer } from 'stream/consumers';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { offertnummer, name, adresse, plz, items, mwst } = await request.json();

    const doc = new PDFDocument({ size: 'A4', margin: 41 });
    const stream = Readable.from(doc);

    // Fallback fonts included with PDFKit
    doc.font('Helvetica');

    // Optional: Inline logo as base64 image
    // You can replace this string with your own base64-encoded PNG
    const base64Logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // shortened for brevity
    // doc.image(base64Logo, 41, 40, { width: 80 });
    doc.moveDown(1.3);

    // Subtitle
    doc.fontSize(10).fillColor('#0175ff').text('Professionelle Reinigungsdienste', 40, doc.y);
    doc.fillColor('#000000');
    doc.moveDown(3);

    // Address block
    const y0 = doc.y;
    doc.fontSize(12).text('Mirdita Reinigung Berisha', 40, y0);
    doc.text('Fo-Strasse 4', 40, y0 + 15);
    doc.text('3904 Naters', 40, y0 + 30);

    doc.text(`${name}\n${adresse}\n${plz}`, 400, y0);

    doc.moveDown(1);

    doc.fontSize(12).text(`Offerte ${offertnummer}`, 40, doc.y);
    doc.moveDown();

    doc.fontSize(14).text('Leistungen', 40, doc.y);
    doc.moveDown(0.5);

    const headerY = doc.y;
    doc.fontSize(12);
    doc.text('Bezeichnung', 40, headerY);
    doc.text('Menge', 250, headerY, { align: 'right', width: 50 });
    doc.text('Einzelpreis', 310, headerY, { align: 'right', width: 80 });
    doc.text('Gesamt', 400, headerY, { align: 'right', width: 100 });
    doc.moveDown(0.4);

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

    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Subtotal: Fr. ${subtotal.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });

    if (mwst) {
      const tax = subtotal * 0.081;
      const total = subtotal + tax;
      doc.text(`+ MwSt. (8.1%): Fr. ${tax.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
      doc.fontSize(12).text(`Total: Fr. ${total.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
    } else {
      doc.fontSize(12).text(`Total: Fr. ${subtotal.toFixed(2)}`, 400, doc.y, { align: 'right', width: 100 });
    }

    doc.end();
    const pdfBuffer = await buffer(stream);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=offerte-${offertnummer}.pdf`
      }
    });
  } catch (err) {
    console.error('PDF GENERATION ERROR:', err);
    return new Response('PDF generation failed', { status: 500 });
  }
};
