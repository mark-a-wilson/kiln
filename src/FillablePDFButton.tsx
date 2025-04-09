// fillablePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateFillablePdf(formJson: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 750;

  const formFields = formJson.form_definition.data.items;
  console.log("formFields >> ", formFields);

  for (const field of formFields) {
    page.drawText(field.label, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });

    switch (field.type) {
      case 'text-input': {
        const textField = form.createTextField(field.id);
        textField.enableMultiline();
        textField.addToPage(page, {
          x: 50,
          y: y - 25,
          width: 300,
          height: 20,
        });
        y -= 60;
        break;
      }

      case 'checkbox': {
        const checkBox = form.createCheckBox(field.id);
        checkBox.addToPage(page, { x: 50, y: y - 5, width: 15, height: 15 });
        y -= 40;
        break;
      }

      // Extend for more types as needed
      default:
        y -= 40;
    }
  }

  const pdfBytes = await pdfDoc.save();

  // Download the file
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'fillable-form.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
