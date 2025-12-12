import { chromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";

export default async function handler(req, res) {
  try {
    const { url, filename = "document.pdf" } = req.query;
    if (!url) return res.status(400).send("Missing url");

    const browser = await chromium.launch({
      args: chromiumPkg.args,
      executablePath: await chromiumPkg.executablePath(),
      headless: true
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" }
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(pdf);
  } catch (e) {
    res.status(500).send(String(e));
  }
}
