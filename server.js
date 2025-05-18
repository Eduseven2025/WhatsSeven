const express = require("express");
const qrcode = require("qrcode");
const venom = require("venom-bot");

const app = express();
const port = process.env.PORT || 8080;

const sessions = {};

app.get("/qr/:id", async (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    return res.json({ status: "already_connected", session: id });
  }

  try {
    sessions[id] = await venom.create(
      id,
      (base64Qr) => {
        qrcode.toDataURL(base64Qr).then((url) => {
          res.json({ status: "qr_code", qr: url });
        });
      },
      undefined,
      {
        headless: true,
        useChrome: false,
        browserArgs: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ]
      }
    );
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("API WhatsSeven está rodando.");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

