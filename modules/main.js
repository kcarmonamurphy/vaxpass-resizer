const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib

const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

import { downloadBlob } from './download.js'
import { exportAsPNG } from './png.js'

const readIt = async function(pdfBytes) {
    // Load the PDF document without updating its existing metadata
    const pdfDoc = await PDFDocument.load(pdfBytes, { 
        updateMetadata: false,
        ignoreEncryption: true
    })

    // const bytes = await pdfDoc.save()
    let png = await exportAsPNG(pdfBytes)

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

    modifyIt(pdfDoc, png)
}

const modifyIt = async function(pdfDoc, png) {
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Get the width and height of the first page
    const { width, height } = firstPage.getSize()

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    firstPage.drawText('This text was added with JavaScript!', {
        x: 5,
        y: height / 2 + 300,
        size: 50,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(-45),
    })

    console.log(png)

    firstPage.setSize(width/2, height/2)

    const pdfBytes = await pdfDoc.save()

    downloadBlob(pdfBytes, 'your-file.pdf', 'application/octet-stream');
}

const readPdfMetadata = async function() {
    const selectedFile = document.getElementById('input').files[0];
    
    const reader = new FileReader()
    
    reader.onload = function() {
        let arrayBuffer = this.result
        readIt(arrayBuffer)
    }
    
    reader.readAsArrayBuffer(selectedFile);
}

document.querySelector('#readPDFButton').addEventListener('click', readPdfMetadata)
