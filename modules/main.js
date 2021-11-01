const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib

const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

import { downloadBlob } from './download.js'
import { exportAsPNG, renderTaskToBase64PNG } from './png.js'

const LETTER_SIZE_DIM_IN_MM = [215.9, 279.4]

const createPdf = async function(png) {
    const templateBytes = await fetch('templates/vax_cert_template_en.pdf').then(res => res.arrayBuffer())
    const template = await PDFDocument.load(templateBytes)

    const creditCardSizePng = await template.embedPng(png)

    const pages = template.getPages()
    const firstPage = pages[0]

    let pngDims = creditCardSizePng.scale(0.28)
    firstPage.drawImage(creditCardSizePng, {
        x: 574, // larget is more right
        y: 504, // larger is higher
        width: pngDims.width + 14.5,
        height: pngDims.height + 2,
        rotate: degrees(90)
    })

    const passportSizePng = await template.embedPng(png)
    pngDims = passportSizePng.scale(0.43)
    firstPage.drawImage(passportSizePng, {
        x: 574, 
        y: 101,
        width: pngDims.width + 4,
        height: pngDims.height + 32,
        rotate: degrees(90)
    })

    const pdfBytes = await template.save()
    return pdfBytes
}

const onReadFile = async function() {
    let arrayBuffer = this.result

    let originalProofCanvas = document.querySelector('#original-proof')

    let renderTask = await exportAsPNG(arrayBuffer, originalProofCanvas, true)
    const base64PNG = await renderTaskToBase64PNG(renderTask, originalProofCanvas, true)
    const newPdfBytes = await createPdf(base64PNG)

    let resizedProofCanvas = document.querySelector('#resized-proof')

    let renderTask2 = await exportAsPNG(newPdfBytes, resizedProofCanvas)
    await renderTaskToBase64PNG(renderTask2, resizedProofCanvas)

    downloadBlob(newPdfBytes, 'your-file.pdf', 'application/octet-stream')
}

const mainRoutine = async function() {
    const selectedFile = document.querySelector('input[type=file').files[0]
    
    const reader = new FileReader()
    reader.onload = onReadFile
    reader.readAsArrayBuffer(selectedFile);
}

const fileInput = document.querySelector('input[type=file]')
fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
        const fileName = document.querySelector('.file-name')
        fileName.textContent = fileInput.files[0].name
    }
}

document.querySelector('#convert-button').addEventListener('click', mainRoutine)

