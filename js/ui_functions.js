const UI = {
	init: function () {
		this.button_lancer_les_des = this.createDiv({
			attributes: { textContent: "...", id: "valeur-de" },
			append: document.body,
		});
		// document.body.appendChild(this.button_lancer_les_des);
	},
	createDiv: function (params) {
		let element = document.createElement(params.tag ?? "div");
		if (params.attributes) {
			for (const key in params.attributes) {
				if (Object.hasOwnProperty.call(params.attributes, key)) {
					element[key] = params.attributes[key];
				}
			}
		}
		if (params.style) {
			for (const key2 in params.style) {
				if (Object.hasOwnProperty.call(params.style, key2))
					element.style[key2] = params.style[key2];
			}
		}
		if (params.recenter === true && params.style.left && params.style.top) {
			let n =
				params.attributes && params.attributes.className
					? params.attributes.className
					: "vide";
			let t = params.style.top.slice(0, -2);
			let l = params.style.left.slice(0, -2);
			let w = params.style.width.slice(0, -2);
			let h = params.style.height.slice(0, -2);
			this.recentering(element, t, l, w, h, n);
		}
		if (params.prepend) {
			params.prepend.prepend(element);
		}
		if (params.append) {
			params.append.append(element);
		}
		return element;
	},
	recentering: function (element, t, l, w, h, n) {
		if (element.style.left && element.style.width) {
			element.style.left = l - w / 2 + "px";
		}
		if (element.style.top && element.style.height) {
			element.style.top = t - h / 2 + "px";
		}
		return element;
	},
	setStepBackgroundImage: function () {
		this.stepBoardDiv.style.backgroundImage = "url('')";
	},
};
export { UI };
