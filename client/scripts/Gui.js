function Gui (container) {
	this.container = container;
}

Gui.prototype.prompt = function prompt (question, options, callback) {
	// Asks a question to the user giving him the options
	// if options is an array of strings e.g. ["yes", "no"] then the options will be buttons
	// if options is the string 'freepick', the option is a text box
	// if no options are provided but is instead a function, it will be treated as the callback
	// additionally it will be defaulted to a text box

	if (typeof options == "function") {
		callback = options;
		options = "freepick";
	}

	callback = typeof callback == "function" ? callback : function () {};

	var promptContainer = this.container.appendChild(document.createElement("div"));
	var promptContent = promptContainer.appendChild(document.createElement("div"));
	var questionDom = promptContent.appendChild(document.createElement("span"));
	var answers = promptContent.appendChild(document.createElement("div"));

	promptContainer.className = "gui-prompt-container";
	promptContent.className = "gui-prompt-content";
	questionDom.className = "gui-prompt-question";
	answers.className = "gui-prompt-answers";

	questionDom.innerText = question;
	questionDom.textContent = question;

	if (options == "freepick") {
		answers.appendChild(this.createFreePick(question, function (answer) {
			callback(answer);
			this.container.removeChild(promptContainer);
		}.bind(this)));
	}

	if (typeof options == "object" && typeof options.length == "number") {
		for (var k = 0; k < options.length; k++) {
			if (options[k] == "freepick") {
				answers.appendChild(this.createFreePick(question, function (answer) {
					callback(answer);
					this.container.removeChild(promptContainer);
				}.bind(this)));
				continue;
			}
			var optionButton = answers.appendChild(document.createElement("div"));
			optionButton.className = "gui-prompt-button gui-prompt-option-button";

			optionButton.innerText = options[k];
			optionButton.textContent = options[k];
			optionButton.option = options[k];

			optionButton.addEventListener("click", function (event) {
				this.container.removeChild(promptContainer);
				callback(event.target.option);
			}.bind(this));
		}
	}

	return promptContainer;
};

Gui.prototype.createFreePick = function createFreePick (question, callback) {
	var container = document.createElement("div");

	var freepick = container.appendChild(document.createElement("input"));
	freepick.className = "gui-prompt-freepick-input";
	freepick.placeholder = question;

	freepick.addEventListener("keypress", function (event) {
		if (event.keyCode == 13) {
			callback(freepick.value);
		}
	});

	var freepickButton = container.appendChild(document.createElement("div"));
	freepickButton.className = "gui-prompt-button gui-prompt-freepick-button";

	freepickButton.innerText = "Submit";
	freepickButton.textContent = "Submit";

	freepickButton.addEventListener("click", function (event) {
		callback(freepick.value);
	});

	return container;
};

Gui.prototype.makeDraggable = function makeDraggable (targetElement, handleElement) {
	if (!handleElement) handleElement = targetElement;

	var startPos = [];
	var elementStartPos = [];
	var dragging = false;

	function handleStart () {
		dragging = true;
		startPos = [event.clientX || 0, event.clientY || 0];

		if (event.changedTouches && event.changedTouches[0])
			startPos = [event.changedTouches[0].clientX || 0,
			            event.changedTouches[0].clientY || 0]

		var boundingRect = targetElement.getBoundingClientRect();
		elementStartPos = [boundingRect.left, boundingRect.top];

		event.preventDefault();
	}

	function handleMove () {
		if (dragging) {
			targetElement.style.left = elementStartPos[0] - startPos[0] + (event.clientX || event.changedTouches[0].clientX) + "px";
			targetElement.style.top = elementStartPos[1] - startPos[1] + (event.clientY || event.changedTouches[0].clientY) + "px";
			event.preventDefault();
		}
	}

	handleElement.addEventListener("mousedown", handleStart);
	handleElement.addEventListener("touchstart", handleStart);

	document.addEventListener("mousemove", handleMove);
	document.addEventListener("touchmove", handleMove);

	handleElement.addEventListener("mouseup", function (event) {
		dragging = false;
	});

	handleElement.addEventListener("touchend", function (event) {
		dragging = false;
	});
};

/*
	Default settings = {
		title: "window",
		close: true
	}
*/
Gui.prototype.createWindow = function createWindow (settings) {
	var windowContainer = this.container.appendChild(document.createElement("div"));
	windowContainer.className = "gui-window";

	var titleContainer = windowContainer.appendChild(document.createElement("div"));
	titleContainer.className = "titlecontainer";

	var title = titleContainer.appendChild(document.createElement("span"));
	title.className = "title";
	title.appendChild(document.createTextNode(settings.title || "window"));

	if (typeof settings.close == "undefined" || settings.close) {
		var close = titleContainer.appendChild(document.createElement("span"));
		close.appendChild(document.createTextNode("X"))
		close.className = "close";
		close.addEventListener("click", function () {
			if (windowContainer.parentNode)
				windowContainer.parentNode.removeChild(windowContainer);

			if (typeof settings.onclose == "function")
				settings.onclose();
		});

		close.addEventListener("touchstart", function () {
			if (windowContainer.parentNode)
				windowContainer.parentNode.removeChild(windowContainer);

			if (typeof settings.onclose == "function")
				settings.onclose();
		});
	}

	this.makeDraggable(windowContainer, titleContainer);

	return windowContainer;
};