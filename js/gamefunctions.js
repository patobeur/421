export function lancerDe(diceBody) {
	// Reset la position et vélocité du dé
	diceBody.position.set(0, 2 + Math.random() * 1, 0);
	diceBody.velocity.set(
		(Math.random() - 0.5) * 8,
		5 + Math.random() * 3,
		(Math.random() - 0.5) * 8
	);
	diceBody.angularVelocity.set(
		(Math.random() - 0.5) * 25,
		(Math.random() - 0.5) * 25,
		(Math.random() - 0.5) * 25
	);
	diceBody.quaternion.setFromEuler(
		Math.random() * Math.PI,
		Math.random() * Math.PI,
		Math.random() * Math.PI
	);
}

export function updateGame(world, diceBody) {
	world.step(1 / 60);
}
