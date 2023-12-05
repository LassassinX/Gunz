export class GameObject {
	// GameObjects have x, y and the update method
	position: {x: number, y: number}
	isAlive: boolean = true
	
	constructor(initializationObject : {position: {x: number, y: number}}) {
		this.position = {...initializationObject.position}
	}

	update() {
	}
	
}

export interface DrawableObject {
	// DrawableGameObjects have a color and a draw method
	color: string
	ctx: CanvasRenderingContext2D
	draw() : void;
}

export class DrawableGameObject extends GameObject implements DrawableObject {
	color: string
	ctx: CanvasRenderingContext2D
	
	constructor(initializationObject : {position: {x: number, y: number}, color: string, ctx: CanvasRenderingContext2D}) {
		super(initializationObject)
		this.color = initializationObject.color
		this.ctx = initializationObject.ctx
	}
	
	draw(): void {
	}
}


export class CircularRigidBody extends GameObject {
	// rigid body has a mesh type and a mesh size, and incorporates the mesh into the game object for collision detection with other game objects which have a rigid body
	radius: number
	gameObject: GameObject

	constructor(gameObject: GameObject, radius: number) {
		super({position: gameObject.position}) 
		this.gameObject = gameObject
		this.radius = radius
	}

	checkCollision(other: CircularRigidBody) {
		if (this === other) return false

		const distance = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y)
		return distance < this.radius + other.radius
	}

	updatePosition() {
		this.position = this.gameObject.position
	}

	update() {
		this.updatePosition()
	}
}
