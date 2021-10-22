const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib

const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

import { downloadBlob } from './download.js'
import { exportAsPNG, renderTaskToBase64PNG } from './png.js'

const LETTER_SIZE_DIM_IN_MM = [215.9, 279.4]

const createPdf = async function(png) {
    const pdfDoc = await PDFDocument.create(LETTER_SIZE_DIM_IN_MM)
    const pngImage = await pdfDoc.embedPng(png)

    // Get the width/height of the PNG image scaled down to 50% of its original size
    const pngDims = pngImage.scale(0.25)

    // Add a blank page to the document
    const page = pdfDoc.addPage()

    // Apply the proof of vaccination PNG
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
    const selectedFile = document.querySelector('input[type=file').files[0];
    
    const reader = new FileReader()
    
    reader.onload = async function() {
        let arrayBuffer = this.result

        let originalProofCanvas = document.querySelector('#original-proof');

        let renderTask = await exportAsPNG(arrayBuffer, originalProofCanvas)
        const base64PNG = await renderTaskToBase64PNG(renderTask, originalProofCanvas)
        const newPdfBytes = await createPdf(base64PNG)

        let resizedProofCanvas = document.querySelector('#resized-proof');

        let renderTask2 = await exportAsPNG(newPdfBytes, resizedProofCanvas)
        await renderTaskToBase64PNG(renderTask2, resizedProofCanvas)

        downloadBlob(newPdfBytes, 'your-file.pdf', 'application/octet-stream');
    }
    
    reader.readAsArrayBuffer(selectedFile);
}

const fileInput = document.querySelector('input[type=file]')
fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
        const fileName = document.querySelector('.file-name')
        fileName.textContent = fileInput.files[0].name
    }
}

document.querySelector('#convert-button').addEventListener('click', readPdfMetadata)
