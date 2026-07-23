const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extract text from a PDF buffer or file path
 */
const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;

    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === 'string') {
      // It's a file path
      if (!fs.existsSync(input)) {
        throw new Error('PDF file not found');
      }
      dataBuffer = fs.readFileSync(input);
    } else {
      throw new Error('Invalid input: must be a Buffer or file path string');
    }

    const data = await pdfParse(dataBuffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The file may be scanned or image-based.');
    }

    return {
      text: data.text.trim(),
      pages: data.numpages,
      info: {
        title: data.info?.Title || 'Unknown',
        author: data.info?.Author || 'Unknown',
        subject: data.info?.Subject || 'Unknown',
        creationDate: data.info?.CreationDate || 'Unknown'
      }
    };
  } catch (error) {
    if (error.message.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF');
    }
    throw error;
  }
};

/**
 * Clean extracted text for better AI processing
 */
const cleanText = (text) => {
  return text
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
    .replace(/\s{2,}/g, ' ')      // Remove excessive spaces
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable chars
    .trim();
};

module.exports = { extractTextFromPDF, cleanText };
