const UI = {
	current_player: 0,
	players: [
		// type = 1/human or 0/IA
		{ id: 0, pseudo: "Alice", fiches: 0, type: 1 },
		{ id: 1, pseudo: "IA_Bob", fiches: 0, type: 0 },
		{ id: 2, pseudo: "IA_Charles", fiches: 0, type: 0 },
	],
	players_divs: [],
	add_ia: function () {
		let new_id = this.players.length + 1;
		this.players.push({
			id: new_id,
			pseudo: "IA_" + new_id,
			fiches: 0,
			type: 0,
		});
	},
	init: function () {
		this.resultats_des = this.createDiv({
			attributes: { textContent: "...", id: "valeur-de" },
			append: document.body,
		});
		this.players_div = this.createDiv({
			attributes: { id: "players_div" },
			append: document.body,
		});
		this.players.forEach((player) => {
			let player_div = this.createDiv({
				attributes: {
					className:
						"player_div" +
						(player.id === this.current_player ? " active" : ""),
				},
				append: this.players_div,
			});
			let pseudo_div = this.createDiv({
				attributes: {
					textContent: player.pseudo,
					className: "pseudo_div",
				},
				append: player_div,
			});
			let fiches_div = this.createDiv({
				attributes: {
					textContent:
						player.fiches + " fiche" + (player.fiches > 1 ? "s" : ""),
					className: "fiches_div",
				},
				append: player_div,
			});
			this.players_divs[player.id] = {
				player_div: player_div,
				pseudo_div: pseudo_div,
				fiches_div: fiches_div,
			};
		});

		// this.players_div_pseudo = this.createDiv({
		// 	attributes: { textContent: "Alice", id: "players_div_pseudo" },
		// 	append: this.players_div,
		// });
		this.fiches_restantes = this.createDiv({
			attributes: { textContent: "Fiches : 11", id: "fiches_restantes" },
			append: document.body,
		});
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
		//en attente d'une image gratuit d'un plateau de jeu de dés rond vue du dessus.
		this.stepBoardDiv.style.backgroundImage = "url('')";
	},
};
export { UI };
