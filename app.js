const express = require('express');
const path = require('path');

const app = express();
const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 5;
const PORT = process.env.PORT || DEFAULT_PORT;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hello-world-custom-activity' });
});

function respondLifecycle(req, res) {
  console.log(`${req.path.toUpperCase()} called`, req.body);
  res.status(200).json({});
}

app.post('/save', respondLifecycle);
app.post('/validate', respondLifecycle);
app.post('/publish', respondLifecycle);
app.post('/stop', respondLifecycle);

app.post('/execute', (req, res) => {
  const body = req.body || {};
  const inArgs = body.inArguments || [];
  const firstArg = inArgs[0] || {};
  const secondArg = inArgs[1] || {};
  const emailAddress = firstArg.emailAddress || body.emailAddress || '';
  const message = secondArg.message ?? body.message ?? '';

  console.log('EXECUTE called', body);

  res.status(200).json({
    greeting: message ? `Hello ${emailAddress || 'there'}! Your message was: ${message}` : `Hello ${emailAddress || 'World'}!`,
    receivedMessage: message,
    emailAddress,
    echo: message
  });
});

function startServer(attempt = 1, candidatePort = PORT) {
  app.listen(candidatePort, () => {
    console.log(`Hello World custom activity server running on http://localhost:${candidatePort}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = candidatePort + 1;
      console.log(`Port ${candidatePort} is busy. Trying ${nextPort} (${attempt + 1}/${MAX_PORT_ATTEMPTS})...`);
      startServer(attempt + 1, nextPort);
    } else if (err.code === 'EADDRINUSE') {
      console.error(`Unable to start server after ${MAX_PORT_ATTEMPTS} attempts.`);
      process.exit(1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

startServer();
