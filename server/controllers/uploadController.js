const { extractTextFromPDF, cleanText } = require('../services/pdfService');
const fs = require('fs');

const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF file.'
      });
    }

    const { originalname, size, buffer, path: filePath } = req.file;

    // Check file size (max 10MB)
    if (size > 10 * 1024 * 1024) {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit.'
      });
    }

    // Extract text
    const pdfData = await extractTextFromPDF(buffer || filePath);
    const cleanedText = cleanText(pdfData.text);

    // Clean up temp file if stored on disk
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      fileName: originalname,
      pages: pdfData.pages,
      fileSize: size,
      textLength: cleanedText.length,
      extractedText: cleanedText,
      info: pdfData.info
    });
  } catch (error) {
    console.error('Upload controller error:', error);

    // Clean up on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process PDF. Please try again.'
    });
  }
};

module.exports = { uploadPDF };
