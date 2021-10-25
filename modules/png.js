const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

const exportAsPNG = async (pdfDoc, canvas, value) => {
    var loadingTask = PDFJS.getDocument({ data: pdfDoc })
    const pdf = await loadingTask.promise

    try {
        const page = await pdf.getPage(1)
        let viewport = page.getViewport({ scale: 1.5 });

        // Prepare canvas using PDF page dimensions
        let context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = { canvasContext: context, viewport: viewport }
        let renderTask = page.render(renderContext)

        return renderTask
    } catch (error) {
        // PDF loading error
        console.error(error)
    }
}

const cropCanvas = (sourceCanvas,left,top,right,bottom) => {
    let destCanvas = document.createElement('canvas');
    let width = sourceCanvas.width
    let height = sourceCanvas.height

    let croppedWidth = width-left-right
    let croppedHeight = height-top-bottom

    destCanvas.width = croppedWidth
    destCanvas.height = croppedHeight

    destCanvas.getContext("2d").drawImage(
        sourceCanvas,
        left,top,croppedWidth,croppedHeight,
        0,0,croppedWidth,croppedHeight)
    return destCanvas
}

const renderTaskToBase64PNG = async (renderTask, canvas, value) => {
    await renderTask.promise

    if (value) {
        let newCanv = cropCanvas(canvas, 50, 50, 50, 50)
        return newCanv.toDataURL('image/png')
    }

    return canvas.toDataURL('image/png')
}

export { exportAsPNG, renderTaskToBase64PNG }