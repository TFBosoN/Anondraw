function Network (mainServer) {
	this.mainServer = mainServer;
	this.socket;

	this.callbacks = {};
}

// LoadRoom
// Params:

// room: string
// Name of the room you want to join

// callback: function (err, drawings)
// Function that gets an err: string and
// drawings: [drawingObject, ...]

Network.prototype.loadRoom = function loadRoom (room, callback) {
	this.getServerFromRoom(room, function (server) {
		// Change to the server
		this.changeServer(server);

		// Get the drawings
		this.socket.emit("getdrawings", room, callback);
	}.bind(this));
};

Network.prototype.getServerFromRoom = function getServerFromRoom (room, callback) {
	
};

// If we are not connected to the given server, change our socket
Network.prototype.changeServer = function changeServer (server) {
	// We are on another server, disconnect and destroy the socket
	if (this.socket.io.uri !== server) {
		this.socket.destroy();
		delete this.socket;
	}

	// No socket, connect to the server
	if (!this.socket) {
		this.socket = io(server);
		this.reBindHandlers();
	}
};

// Register an event
Network.prototype.on = function on (name, callback) {
	this.callbacks[name] = this.callbacks[name] || [];

	// The callback is already registered
	if (this.callbacks[name].indexOf(callback) !== -1) return;
	this.callbacks[name].push(callback);

	// Bind the callback on our socket
	this.socket.on(name, callback);
};

// Bind the handlers on our socket
Network.prototype.reBindHandlers = function reBindHandlers () {
	// Only do this once per socket
	if (!this.socket || this.socket.DT_handlersBound) return;

	// Bind the handlers on our socket
	for (var name in this.callbacks) {
		for (var k = 0; k < this.callbacks[name].length; k++)
			this.socket.on(name, this.callbacks[name][k]);

	this.socket.DT_handlersBound = true;
};