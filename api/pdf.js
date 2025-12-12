const PDFDocument = require("pdfkit");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="rapport-mytouch.pdf"');

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(res);

  doc.fontSize(22).text("MyTouch — PDF test");
  doc.moveDown();
  doc.fontSize(12).text("Si tu vois ce PDF, l’API Vercel fonctionne.");
  doc.end();
};
