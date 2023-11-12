const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function mergePDFs(inputPDFs, outputPDF) {
    const mergedPDF = await PDFDocument.create();

    for (let i = 0; i < inputPDFs.length; i++) {
        const pdfBytes = fs.readFileSync(inputPDFs[i]);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPDF.addPage(page));
    }

    const mergedPDFBytes = await mergedPDF.save();
    fs.writeFileSync(outputPDF, mergedPDFBytes);
}

module.exports = mergePDFs;
