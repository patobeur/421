export function lancerDe(diceBody, index = 0) {
	// Reset la position et vélocité du dé
	diceBody.position.set((index - 1) * 2.5, 4 + Math.random() * 2, (index - 1) * (Math.random() - 0.5) * 2);
	diceBody.velocity.set(
		(Math.random() - 0.5) * 10,
		6 + Math.random() * 4,
		(Math.random() - 0.5) * 10
	);
	diceBody.angularVelocity.set(
		(Math.random() - 0.5) * 30,
		(Math.random() - 0.5) * 30,
		(Math.random() - 0.5) * 30
	);
	diceBody.quaternion.setFromEuler(
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2,
		Math.random() * Math.PI * 2
	);
}

export function updateGame(world, diceBody) {
	world.step(1 / 60);
}
