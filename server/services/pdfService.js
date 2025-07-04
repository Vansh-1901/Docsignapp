import { PDFDocument } from "pdf-lib";
import fs from 'fs';
import path from 'path';

export const generateSignedPdf = async(originalPath, signatures) => {
    try {
        //1.Load the original PDF
        const pdfBytes = fs.readFileSync(originalPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        //2.Process each signature
        for(const sig of signatures){
            if(sig.status !== 'signed') continue;
            const page = pdfDoc.getPage(sig.pageNumber - 1);
            const {width, height} = page.getSize();

            //3.Calculate coordinates (PDF-Lib uses bottom-left origin)
            const x = (sig.x / 100) * width;
            const y = height - (sig.y / 100) * height;// Flip Y-axis

            //4.Embed signature (image or text)
            if(sig.signatureData?.startsWith('data:image')){
                //Handle image signature
                const image = await pdfDoc.embedPng(sig.signatureData);
                page.drawImage(image, {
                    x,
                    y: y - (sig.height / 100 * height), // Adjust for height
                    width: (sig.width / 100) * width,
                    height: (sig.height / 100) * height,
                });
            } else {
                //Fallback to text signature
                page.drawText('✍️ SIGNED', {
                    x, 
                    y,
                    size: (sig.height / 100) * height * 0.8,
                    color: rgb(0,0,0),
                });
            }
        }
        //5.ssave the modified PDF
        const modifiedBytes = await pdfDoc.save();
        const signedFilename = `signed_${path.basrname(originalPath)}`;
        const signedPath = path.join(path.dirname(originalPath), signedFilename);
        fs.writeFileSync(signedPath, modifiedBytes);
        return signedPath;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate signed PDF');
    }
};