import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Energy Audit Endpoint
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { currentLoad, historySummary, activeAppliances, isPeakHour, anomalyStatus, customApiKey } = req.body;

      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "NO_API_KEY",
          message: "No Gemini API key provided. Falling back to edge ML heuristics.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert energy auditor analyzing a household electrical profile for a 9th-grade STEAM Expo smart energy edge system.
Current Load: ${currentLoad} kW.
Active Simulation Modifiers: ${activeAppliances && activeAppliances.length > 0 ? activeAppliances.join(", ") : "Standard baseline loads"}.
Current Time of Day Status: ${isPeakHour ? "PEAK HOURS (6:00 PM - 10:00 PM, High Tariff ₹11.20/kWh)" : "Off-Peak / Normal Hours (Base Tariff ₹7.50/kWh)"}.
System Edge Anomaly Status: ${anomalyStatus || "Nominal"}.
History: ${historySummary || "Rolling 24-hour baseline average 1.2 kW - 2.8 kW"}.
Tariff structure: Peak hours are 6PM-10PM.

Give 2 highly specific, punchy bullet points recommending exact behavior shifts to save electricity and lower utility bills based strictly on this data. Format with clear, crisp advice and estimated ₹ cost savings. Keep tone sharp, encouraging, and scientific.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      const text = response.text || "";
      return res.json({
        analysis: text,
        source: "gemini-3.7-flash",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({
        error: "GEMINI_ERROR",
        message: err?.message || "Failed to generate AI audit recommendations.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      device: "ESP32-EdgeAI-Node-01",
      firmware: "v2.4.1-steam-expo",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Vite middleware for development vs static build
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartEnergy Edge-AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
