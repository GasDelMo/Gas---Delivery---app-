
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/send-whatsapp', (req, res) => {
  const { to, message } = req.body;
  client.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:' + to,
      body: message,
    })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Webhook للردود الآلية
app.post('/whatsapp-webhook', (req, res) => {
  const message = req.body.Body?.trim().toLowerCase();
  const from = req.body.From;
  let reply = "شكرًا على تواصلك. يرجى توضيح طلبك.";

  if (message === "نعم") {
    reply = "تم تأكيد طلبك. سنوافيك بالتفاصيل قريبًا.";
  } else if (message.includes("أين")) {
    reply = "طلبك قيد المعالجة. سنقوم بتوصيله قريبًا.";
  } else if (message.includes("إلغاء")) {
    reply = "تم إلغاء طلبك حسب رغبتك.";
  }

  client.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: from,
      body: reply,
    })
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
