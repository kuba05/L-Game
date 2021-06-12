
export class Piece {
  position: number[];
  rotation: number[];
  parts: number[][];
  color: string;
  plaincolor: string;

  constructor (color: string, position: number[], rotation: number[], parts: number[][]) {
    this.position = position;
    this.rotation = rotation;
    this.parts = parts;
    this.color = color;
    this.plaincolor = color;
  }

  makeDark (): void {
    this.color = this.plaincolor;
  }

  makeLight (): void {
    this.color = 'light' + this.plaincolor;
  }

  show (): number[][] {
    const parts = this.parts;
    const output = [];
    for (const part of parts) {
      let msg = [part[0] * this.rotation[0], part[1] * this.rotation[1]];

      if (this.rotation[2] === -1) {
        msg = msg.reverse();
      }

      msg[0] += this.position[0];
      msg[1] += this.position[1];

      output.push(msg);
    }

    return output;
  }

  rotate (clockwise: boolean): void {
    // bit of a magic here :)
    //
    // this is how states should follow each other
    // [1,1,0] => [1,-1,1] => [-1,-1,0] => [-1,1,1]
    // [-1,1,0] => [-1,-1,1] => [1,-1,0] => [1,1,1]

    const rotations = [[1, 1], [1, -1], [-1, -1], [-1, 1]];

    let nextIndex = this.rotation.reduce((a, b) => a * b, clockwise ? -1 : 1) +
      rotations.findIndex(a => JSON.stringify(a) === JSON.stringify(this.rotation.slice(0, 2)));

    nextIndex %= 4;
    if (nextIndex < 0) nextIndex += 4;

    this.rotation = rotations[nextIndex].concat([this.rotation[2] * -1]);
  }

  mirror (): void {
    this.rotation[0] *= -1;
  }

  move (x: number, y: number): void {
    this.position = [x, y];
  }

  // getters and setters
  getPosition (): number[] {
    return this.position;
  }

  getRotation (): number[] {
    return this.rotation;
  }

  setPosition (position: number[]): void {
    this.position = position;
  }

  setRotation (rotation: number[]): void {
    this.rotation = rotation;
  }
}
