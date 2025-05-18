const express = require('express');
const { create, ev } = require('venom-bot');
const app = express();

const sessions = {};

app.get('/', (req, res) => {
  res.send('WhatsSeven rodando com sucesso ✅');
});

app.get('/qr/:session', async (req, res) => {
  const sessionName = req.params.session;

  if (sessions[sessionName]) {
    return res.send(`Sessão "${sessionName}" já conectada! ✅`);
  }

  try {
    const client = await create({
      session: sessionName,
      multidevice: true,
      headless: true,
      disableWelcome: true,
      disableSpins: true,
      catchQR: (base64Qr) => {
        console.log(`QR gerado para ${sessionName}`);
        sessions[sessionName] = { qr: base64Qr };
      },
      statusFind: (statusSession, session) => {
        console.log(`Status da sessão ${session}:`, statusSession);
      },
    });

    sessions[sessionName].client = client;

    res.send({
      status: 'aguardando leitura do QR Code',
      qr: sessions[sessionName].qr,
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).send({ status: 'erro', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor WhatsSeven rodando na porta ${PORT} 🚀`);
});
