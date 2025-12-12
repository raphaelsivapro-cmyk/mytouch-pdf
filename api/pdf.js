const chromium = require("@sparticuz/chromium");
const playwright = require("playwright-core");

module.exports = async (req, res) => {
  // CORS (utile si Lovable est sur un autre domaine)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    // 1) Lire le body (Lovable envoie le HTML en POST)
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });

    let html = "";
    try {
      const parsed = JSON.parse(body || "{}");
      html = parsed.html || "";
    } catch {
      html = body || "";
    }

    if (!html || html.trim().length < 20) {
      return res.status(400).json({ error: "Missing or empty HTML" });
    }

    // 2) Lancer Chromium compatible Vercel
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });

    const page = await browser.newPage();

    // 3) Rendre le HTML
    await page.setContent(html, { waitUntil: "networkidle" });

    // 4) Générer le PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" }
    });

    await browser.close();

    // 5) Renvoyer le PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="rapport-mytouch.pdf"');
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "PDF generation failed", details: String(err) });
  }
};
