(function () {
  var connection = new Postmonger.Session();
  var payload = {};

  function getMessageValue() {
    var input = document.getElementById('messageInput');
    return input ? input.value : '';
  }

  function updateStatus(message) {
    var statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.textContent = message;
    }
  }

  function sendToExecute() {
    var message = getMessageValue();
    updateStatus('Sending to execute endpoint...');

    fetch('/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inArguments: [
          { emailAddress: 'demo@example.com' },
          { message: message }
        ]
      })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        updateStatus('Response from execute: ' + data.echo);
      })
      .catch(function (err) {
        updateStatus('Error calling execute: ' + err.message);
      });
  }

  connection.on('initActivity', function (data) {
    if (data) {
      payload = data;
    }

    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.arguments.execute.inArguments = [
      { emailAddress: '{{Contact.Default.Email}}' },
      { message: getMessageValue() }
    ];

    payload.metaData = payload.metaData || {};
    payload.metaData.isConfigured = true;

    connection.trigger('updateActivity', payload);
  });

  window.addEventListener('load', function () {
    var input = document.getElementById('messageInput');
    var sendButton = document.getElementById('sendButton');

    if (input) {
      input.addEventListener('input', function () {
        updateStatus('Value ready to be sent: ' + input.value);
      });
    }

    if (sendButton) {
      sendButton.addEventListener('click', sendToExecute);
    }

    connection.trigger('ready');
  });
})();
