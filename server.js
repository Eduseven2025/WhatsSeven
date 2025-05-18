const venom = require('venom-bot');
const express = require('express');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const sessions = {}; // armazena sessões em memória { id: client }

// Rota para criar/conectar sessão e gerar QR Code
app.get('/qr/:id', async (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    return res.json({ status: 'success', message: 'Sessão já conectada' });
  }

  try {
    sessions[id] = await venom.create(
      id,
      (base64Qr, asciiQR) => {
        // QR code em base64 para exibir
        qrcode.toDataURL(base64Qr).then((url) => {
          res.json({ qr: url });
        });
      },
      undefined,
      { headless: true }
    );

    sessions[id].onStateChange((state) => {
      console.log(`Session ${id} state:`, state);
      if (state === 'CONNECTED') {
        console.log(`Sessão ${id} conectada!`);
      }
      if (state === 'DISCONNECTED' || state === 'UNPAIRED') {
        console.log(`Sessão ${id} desconectada! Removendo...`);
        sessions[id].close();
        delete sessions[id];
      }
    });
  } catch (error) {
    console.error('Erro criando sessão:', error);
    res.status(500).json({ status: 'error', error: error.toString() });
  }
});

// Rota para enviar mensagem via sessão existente
app.post('/send/:id', async (req, res) => {
  const id = req.params.id;
  const { to, message } = req.body;

  if (!sessions[id]) {
    return res.status(404).json({ status: 'error', error: 'Sessão não encontrada' });
  }

  if (!to || !message) {
    return res.status(400).json({ status: 'error', error: 'Parâmetros "to" e "message" são obrigatórios' });
  }

  try {
    await sessions[id].sendText(to, message);
    res.json({ status: 'success', message: 'Mensagem enviada' });
  } catch (error) {
    console.error('Erro enviando mensagem:', error);
    res.status(500).json({ status: 'error', error: error.toString() });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

