import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import {
  Filesystem as CapFileSystem,
  Directory as CapDirectory,
  Encoding as CapEncoding,
  Directory,
} from '@capacitor/filesystem';
import { BehaviorSubject, from, fromEvent } from 'rxjs';
import { isPlatform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class JspdfUtilsService {
  finished$ = new BehaviorSubject<boolean>(false);
  constructor() {}
  private calculatePdfTextWidth(text: string, doc: jsPDF) {
    let width =
      (doc.getStringUnitWidth(text) * doc.getFontSize()) /
      doc.internal.scaleFactor;
    return width;
  }
  private writeBlobToFileSystem(blob: Blob, filename: string) {
    let reader = new FileReader();
    let p = new Promise((reject, resolve) => {
      reader.onloadend = async (readerEvent) => {
        if (reader.error) console.log(reader.error);
        else {
          let base64Data: any = readerEvent.target!['result'];
          try {
            await CapFileSystem.writeFile({
              path: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
              data: base64Data,
              directory: CapDirectory.Documents,
            });
            this.finished$.next(true);
          } catch (e) {
            console.error(`Unable to write file`, e);
          }
        }
      };
      reader.readAsDataURL(blob);
    });
    return p;
  }
  writePdfTitleText(doc: jsPDF, title: string) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    let pageWidth = doc.internal.pageSize.getWidth();
    let titleTextWidth = this.calculatePdfTextWidth(title, doc);
    let xPosition = (pageWidth - titleTextWidth) / 2;
    let titlePositionY = 10;
    doc.setFont('helvetica', 'bold');
    doc.text(title, xPosition, titlePositionY);
    return titlePositionY;
  }
  writePdfTextAlignedLeft(
    doc: jsPDF,
    label: string,
    value: string,
    positionY: number
  ) {
    let margins = 14;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let branchTextWidth = this.calculatePdfTextWidth(value, doc);
    let branchTextXPosition = margins; //branchTextWidth;
    doc.text(label, branchTextXPosition, positionY, { align: 'left' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(value, branchTextXPosition, positionY * 1.15, { align: 'left' });

    return [positionY, positionY * 1.15];
  }
  writePdfTextAlignedCenter(
    doc: jsPDF,
    label: string,
    value: string,
    positionY: number
  ) {
    let margins = 14;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let valueTextWidth = this.calculatePdfTextWidth(value, doc);
    let valueTextXPosition = (doc.internal.pageSize.getWidth() - margins) / 2;
    doc.text(label, valueTextXPosition, positionY, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(value, valueTextXPosition, positionY * 1.15, { align: 'center' });
    return [positionY, positionY * 1.15];
  }
  writePdfTextAlignedRight(
    doc: jsPDF,
    label: string,
    value: string,
    positionY: number
  ) {
    let margins = 14;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let valueTextWidth = this.calculatePdfTextWidth(value, doc);
    let valueTextXPosition = doc.internal.pageSize.getWidth() - margins;
    doc.text(label, valueTextXPosition, positionY, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(value, valueTextXPosition, positionY * 1.15, { align: 'right' });
    return [positionY, positionY * 1.15];
  }
  exportHtmlToPdf(element: HTMLElement) {
    let doc = new jsPDF(
      element.clientWidth > element.clientHeight ? 'l' : 'p',
      'mm',
      [element.clientWidth, element.clientHeight]
    );
    doc.html(element, {
      callback(doc) {
        doc.save('results.pdf');
      },
    });
  }
  exportJsPdfToPdf(doc: jsPDF, element: any, filename: string) {
    doc.html(element, {
      callback: (pdf) => {
        pdf.deletePage(pdf.getNumberOfPages());
        if (isPlatform('capacitor')) {
          this.writeBlobToFileSystem(pdf.output('blob'), filename);
        } else {
          filename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
          pdf.save(filename);
        }
      },
    });
  }
  exportHtml(element: HTMLElement, filename: string) {
    html2canvas(element)
      .then(async (canvas) => {
        const imgWidth = element.clientWidth; //208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        let pdf = new jsPDF(
          element.clientWidth > element.clientHeight ? 'l' : 'p',
          'mm',
          [element.clientWidth, element.clientHeight]
        );
        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        if (isPlatform('capacitor')) {
          await this.writeBlobToFileSystem(pdf.output('blob'), filename);
        } else {
          pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        }
      })
      .catch((err) => console.error('Failed to convert html to canvas', err));
  }
  getFileUri(filename: string) {
    let getUri = from(
      CapFileSystem.getUri({
        path: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        directory: CapDirectory.Documents,
      })
    );
    return getUri;
  }
  print(id: string, style?: string) {
    let popupWin: any, printContents: string;
    const section = document.getElementById(`${id}`);
    printContents = section ? section.innerHTML : '';
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
          <link rel="stylesheet" href="./../../styles.scss">
          <style>
            ${style}
            .containerbackground {
              margin: 3rem;
              position: absolute;
              top: 0;
              left: 10rem;
              bottom: 0;
              z-index: 2;
              transform: rotate(300deg);
              -webkit-transform: rotate(300deg);
              color: #c6afaf90;
            }
            @page { margin: 0; }
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
            }
          </style>
        </head>
        <body onload="window.print();">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }
}
