import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Process Test Manifest
  app.post("/api/process-manifest", async (req, res) => {
    try {
      const { manifest } = req.body;
      if (!manifest || !Array.isArray(manifest)) {
        return res.status(400).json({
          status: "error",
          message: "What is this? I can’t read this garbage. Give me a JSON or keep walkin’.",
        });
      }

      const matrixRows = manifest.map((node: any) => {
        // Simulating similarity logic
        const similarity = Math.random() * (0.99 - 0.4) + 0.4;
        let recommendation = "Keep/Unique";
        if (similarity > 0.9) recommendation = "Direct Duplicate/Prune";
        else if (similarity > 0.7) recommendation = "Logic Merge";

        return {
          nodeId: node.id || `test-${Math.random().toString(36).substr(2, 9)}`,
          nodeName: node.name || "Untitled Test",
          similarityScore: Number(similarity.toFixed(2)),
          recommendation,
          confidenceScore: Math.random(),
          manualReviewRequired: Math.random() < 0.2,
          closestMatchId: similarity > 0.7 ? `existing-${Math.floor(Math.random() * 1000)}` : null,
        };
      });

      res.json({
        status: "success",
        timestamp: new Date().toISOString(),
        processedCount: matrixRows.length,
        matrixRows,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Fuggedaboutit. The server took a nosedive. We're workin' on it.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
