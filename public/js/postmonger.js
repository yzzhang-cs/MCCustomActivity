(function (global) {
  function Session() {
    this.handlers = {};
  }

  Session.prototype.on = function (eventName, handler) {
    this.handlers[eventName] = this.handlers[eventName] || [];
    this.handlers[eventName].push(handler);
  };

  Session.prototype.trigger = function (eventName, data) {
    var listeners = this.handlers[eventName] || [];
    listeners.forEach(function (listener) {
      listener(data);
    });
  };

  global.Postmonger = global.Postmonger || {};
  global.Postmonger.Session = Session;
})(window);
