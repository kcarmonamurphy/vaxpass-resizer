const PDFJS = window['pdfjs-dist/build/pdf']
PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

const exportAsPNG = async (pdfDoc) => {
    var loadingTask = PDFJS.getDocument({ data: pdfDoc })
    const pdf = await loadingTask.promise

    try {
        const page = await pdf.getPage(1)
        let viewport = page.getViewport({ scale: 1.5 });

        let canvas = document.querySelector('canvas');

        // Prepare canvas using PDF page dimensions
        let context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = { canvasContext: context, viewport: viewport }
        let renderTask = page.render(renderContext)

        const base64PNG = await renderTaskToBase64PNG(renderTask, canvas)
        return base64PNG
    } catch (error) {
        // PDF loading error
        console.error(error)
    }
}

const renderTaskToBase64PNG = async (renderTask, canvas) => {
    await renderTask.promise
    return canvas.toDataURL('image/png')
}

export { exportAsPNG }