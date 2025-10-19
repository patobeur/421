// Générateur de pseudos "plausibles"
export const pseudoMaker = (function () {
	// Syllabes (onsets = débuts, nuclei = voyelles, codas = fins)
	const ONSETS = [
		"",
		"b",
		"br",
		"c",
		"cr",
		"ch",
		"d",
		"dr",
		"f",
		"fl",
		"g",
		"gr",
		"gl",
		"h",
		"j",
		"k",
		"kr",
		"l",
		"m",
		"n",
		"p",
		"pr",
		"ph",
		"qu",
		"r",
		"s",
		"sk",
		"sp",
		"st",
		"t",
		"tr",
		"v",
		"w",
		"y",
		"z",
	];
	const NUCLEI = [
		"a",
		"e",
		"i",
		"o",
		"u",
		"y",
		"ae",
		"ai",
		"au",
		"ea",
		"ei",
		"io",
		"ou",
		"ua",
		"oi",
	];
	const CODAS = [
		"",
		"n",
		"r",
		"s",
		"x",
		"l",
		"m",
		"th",
		"sh",
		"ch",
		"nd",
		"rk",
		"rd",
		"st",
		"sk",
		"z",
	];

	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

	// Évite quelques combinaisons moches (ex. "qu" suivi d'une voyelle non adaptée, triples lettres, etc.)
	const tidy = (str) => {
		// évite 3 mêmes lettres d'affilée
		str = str.replace(/([a-z])\1\1+/gi, "$1$1");
		// simplifie quelques digrammes répétitifs
		str = str
			.replace(/chh/gi, "ch")
			.replace(/shh/gi, "sh")
			.replace(/thh/gi, "th");
		// évite 'qu' + 'u' redondant (ex "quu")
		str = str.replace(/quu/gi, "qu");
		return str;
	};

	const makeCore = (opts = {}) => {
		const { syllablesMin = 2, syllablesMax = 3 } = opts;

		const syllables =
			Math.floor(Math.random() * (syllablesMax - syllablesMin + 1)) +
			syllablesMin;

		let name = "";
		for (let i = 0; i < syllables; i++) {
			// Laisse parfois l'ONSET vide, mais pas pour la première syllabe trop souvent
			const onset = i === 0 && Math.random() < 0.15 ? "" : pick(ONSETS);
			const nucleus = pick(NUCLEI);
			const coda = Math.random() < 0.75 ? pick(CODAS) : ""; // coda facultative
			name += onset + nucleus + coda;
		}
		return tidy(name);
	};

	const applyStyle = (str, opts = {}) => {
		const {
			casing = "capitalized", // "lower" | "upper" | "capitalized"
			separator = "", // "", "_", "-"
			withNumber = "false", // true | false | "auto"
			numberDigits = [1, 3], // min/max chiffres si number
			allowLeet = false, // remplacements 1337 légers
		} = opts;

		// casse
		if (casing === "upper") str = str.toUpperCase();
		else if (casing === "lower") str = str.toLowerCase();
		else str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

		// option l33t légère
		if (allowLeet) {
			str = str.replace(/a/gi, (m) =>
				Math.random() < 0.15 ? (m === m.toUpperCase() ? "4" : "4") : m
			);
			str = str.replace(/e/gi, (m) => (Math.random() < 0.15 ? "3" : m));
			str = str.replace(/i/gi, (m) => (Math.random() < 0.1 ? "1" : m));
			str = str.replace(/o/gi, (m) => (Math.random() < 0.1 ? "0" : m));
		}

		// nombre final
		const wantNumber =
			withNumber === true || (withNumber === "auto" && Math.random() < 0.35);
		if (wantNumber) {
			const [minD, maxD] = numberDigits;
			const digits = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
			const max = Math.pow(10, digits) - 1;
			const num = String(Math.floor(Math.random() * (max + 1))).padStart(
				digits,
				"0"
			);
			str = separator ? `${str}${separator}${num}` : `${str}${num}`;
		}

		return str;
	};

	const makeOne = (opts = {}) => applyStyle(makeCore(opts), opts);

	const makeMany = (n = 1, opts = {}) => {
		const results = new Set();
		const maxAttempts = Math.max(1000, n * 20);
		let attempts = 0;
		while (results.size < n && attempts < maxAttempts) {
			attempts++;
			results.add(makeOne(opts));
		}
		return Array.from(results).slice(0, n);
	};

	// API publique
	const api = (n = 1, opts = {}) => makeMany(n, opts);
	api.one = (opts = {}) => makeOne(opts);
	return api;
})();
