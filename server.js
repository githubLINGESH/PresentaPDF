const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const app = express();
const port = 5500;

let browser;
let page;

app.use(express.static('public'));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-pdf', async (req, res) => {
    const { link,pages } = req.body;

    try {
        if (!browser) {
            browser = await puppeteer.launch({
                headless: "true",
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000,
                ignoreHTTPSErrors: true,
                waitUntil: 'networkidle0',
                slowMo: 250,
                devtools: false,
                protocolTimeout: 60000,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            page = await browser.newPage();
            await page.goto(link, { waitUntil: 'networkidle0' });
        }

        // Capture the content as PDF before clicking
        const initialPDFBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            landscape: true,
            scale: 2,
        });

        // Get the total number of slides
        const totalSlides = pages;

        const generatedPDFs = [initialPDFBuffer];

        for (let slideNumber = 1; slideNumber < totalSlides; slideNumber++) {
            // Simulate a click towards the right side of the screen
            const viewportSize = await page.viewport();
            const clickX = viewportSize.width * 0.9;
            const clickY = viewportSize.height / 2;  // Vertical center

            await page.mouse.click(clickX, clickY, { button: 'left' });

            // Wait for some time to let the content load
            await page.waitForTimeout(1000);

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true,
                landscape: true,
                scale:1.8,
            });

            // Restore the original viewport size
            await page.setViewport(viewportSize);


            generatedPDFs.push(pdfBuffer);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="presentation.pdf"');

        // Merge all PDFs into one
        const mergedPDFPath = 'presentation.pdf';
        await mergePDFs(generatedPDFs, mergedPDFPath);

        // Read the merged PDF file and send it as a response
        const mergedPDFBuffer = fs.readFileSync(mergedPDFPath);
        fs.unlinkSync(mergedPDFPath);

        res.send(mergedPDFBuffer);
    } catch (error) {
        console.error('An error occurred while generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Function to merge an array of PDF buffers into one PDF
const mergePDFs = async (pdfBuffers, outputPath) => {
    const mergedPDF = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPDF.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPDF.addPage(page));
    }

    const mergedPDFBytes = await mergedPDF.save();
    fs.writeFileSync(outputPath, mergedPDFBytes);
};

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
