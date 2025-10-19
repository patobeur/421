export function lancerDe(diceBody) {
	// Reset la position et vélocité du dé
	diceBody.position.set(3, 3, diceBody.index * 2);
	diceBody.velocity.set(-(5 + Math.random() * 3), 0, -(5 + Math.random() * 3));
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
