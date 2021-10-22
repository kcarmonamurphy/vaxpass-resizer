const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib

const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

import { downloadBlob } from './download.js'
import { exportAsPNG } from './png.js'

const LETTER_SIZE_DIM_IN_MM = [215.9, 279.4]

const readIt = async function(pdfBytes) {
    // Load the PDF document without updating its existing metadata
    const pdfDoc = await PDFDocument.load(pdfBytes, { 
        updateMetadata: false,
        ignoreEncryption: true
    })

    // Read all available metadata fields      
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const creator = pdfDoc.getCreator();
    const keywords = pdfDoc.getKeywords();
    const producer = pdfDoc.getProducer();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();
    
    // Display all available metadata fields   
    document.getElementById('metadata-list').innerHTML = `
    <li>Title: ${title}</li>
    <li>Author: ${author}</li>
    <li>Creator: ${creator}</li>
    <li>Keywords: ${keywords}</li>
    <li>Producer: ${producer}</li>
    <li>Creation Date: ${creationDate?.toISOString()}</li>
    <li>Modification Date: ${modificationDate?.toISOString()}</li>
    `;
}

const createPdf = async function(png) {
    const pdfDoc = await PDFDocument.create(LETTER_SIZE_DIM_IN_MM)
    const pngImage = await pdfDoc.embedPng(png)

    // Get the width/height of the PNG image scaled down to 50% of its original size
    const pngDims = pngImage.scale(0.25)

    // Add a blank page to the document
    const page = pdfDoc.addPage()

    // Draw the PNG image near the lower right corner of the JPG image
    page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width,
        y: page.getHeight() / 2 - pngDims.height,
        width: pngDims.width,
        height: pngDims.height,
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
}

const readPdfMetadata = async function() {
    const selectedFile = document.getElementById('input').files[0];
    
    const reader = new FileReader()
    
    reader.onload = async function() {
        let arrayBuffer = this.result
        readIt(arrayBuffer)

        let png = await exportAsPNG(arrayBuffer)
        const newPdfBytes = await createPdf(png)
        downloadBlob(newPdfBytes, 'your-file.pdf', 'application/octet-stream');
    }
    
    reader.readAsArrayBuffer(selectedFile);
}

document.querySelector('#readPDFButton').addEventListener('click', readPdfMetadata)
