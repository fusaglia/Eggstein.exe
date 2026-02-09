export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // nasconde il cursore di sistema
        this.input.setDefaultCursor('none');

        // posizione reale del mouse
        this.target = new Phaser.Math.Vector2(
            this.input.activePointer.x,
            this.input.activePointer.y
        );

        // posizione smooth del cursore
        this.cursorPos = this.target.clone();

        // grafica cursore
        this.cursor = this.add.circle(
            this.cursorPos.x,
            this.cursorPos.y,
            6,
            0xffffff
        );

        // scia
        this.trail = [];

        this.input.on('pointermove', pointer => {
            this.target.set(pointer.x, pointer.y);
        });
    }

    update() {
        // movimento smooth (lerp)
        this.cursorPos.x = Phaser.Math.Linear(this.cursorPos.x, this.target.x, 0.15);
        this.cursorPos.y = Phaser.Math.Linear(this.cursorPos.y, this.target.y, 0.15);

        this.cursor.setPosition(this.cursorPos.x, this.cursorPos.y);

        // crea punto scia
        const dot = this.add.circle(
            this.cursorPos.x,
            this.cursorPos.y,
            4,
            0xffffff,
            0.2
        );

        this.trail.push(dot);

        // limita lunghezza scia
        if (this.trail.length > 12) {
            const old = this.trail.shift();
            old.destroy();
        }
    }
}
