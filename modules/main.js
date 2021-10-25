const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib

const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

import { downloadBlob } from './download.js'
import { exportAsPNG, renderTaskToBase64PNG } from './png.js'

const LETTER_SIZE_DIM_IN_MM = [215.9, 279.4]

let template

const createPdf = async function(png) {
    // const pdfDoc = await PDFDocument.create(LETTER_SIZE_DIM_IN_MM)
    const pngImage = await template.embedPng(png)

    const pages = template.getPages()
    const firstPage = pages[0]

    // Get the width/height of the PNG image scaled down to 50% of its original size
    const pngDims = pngImage.scale(0.25)

    // Add a blank page to the document
    // const page = pdfDoc.addPage()

    // Apply the proof of vaccination PNG
    firstPage.drawImage(pngImage, {
        x: 580,
        y: 500,
        width: pngDims.width,
        height: pngDims.height,
        rotate: degrees(90)
    })

    const pdfBytes = await template.save()
    return pdfBytes
}

const onReadFile = async function() {
    let arrayBuffer = this.result

    let originalProofCanvas = document.querySelector('#original-proof')

    let renderTask = await exportAsPNG(arrayBuffer, originalProofCanvas)
    const base64PNG = await renderTaskToBase64PNG(renderTask, originalProofCanvas)
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

const onReadTemplate = async function() {
    let arrayBuffer = this.result

    template = await PDFDocument.load(arrayBuffer, { 
        updateMetadata: false,
        ignoreEncryption: true
    })
}

async function loadVaxCertTemplate(){
    let response = await fetch('templates/vax_cert_template_en.pdf')

    await fetch('templates/vax_cert_template_en.pdf').then(res => res.arrayBuffer())

    let data = await response.blob()
    let metadata = {
      type: 'application/pdf'
    };
    let template = new File([data], "vax_cert_template_en.pdf", metadata)

    const reader = new FileReader()
    reader.onload = onReadTemplate
    reader.readAsArrayBuffer(template);
}
// loadVaxCertTemplate()

const templateBytes = await fetch('templates/vax_cert_template_en.pdf').then(res => res.arrayBuffer())
template = await PDFDocument.load(templateBytes)