import WebSocket from 'ws';

console.log('Attempting to connect to ws://localhost:3030/ws...');

const ws = new WebSocket('ws://localhost:3030/ws');

ws.on('open', function open() {
  console.log('✅ WebSocket connection established!');

  // Send a test message
  const testMessage = {
    type: 'test',
    data: 'Hello from test client'
  };

  console.log('Sending test message:', testMessage);
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', function message(data) {
  console.log('📨 Received message:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close(code, reason) {
  console.log('🔌 WebSocket connection closed:', code, reason);
});

// Close after 5 seconds
setTimeout(() => {
  console.log('Closing connection...');
  ws.close();
  process.exit(0);
}, 5000);