const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

const exportAsPNG = async (pdfDoc, canvas) => {
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

const renderTaskToBase64PNG = async (renderTask, canvas) => {
    await renderTask.promise
    return canvas.toDataURL('image/png')
}

export { exportAsPNG, renderTaskToBase64PNG }