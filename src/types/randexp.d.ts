declare module 'randexp' {
  interface RandExpRange {
    add(from: number, to: number): void;
  }

  class RandExp {
    constructor(regexp: RegExp);
    defaultRange: RandExpRange;
    gen(): string;
  }

  export = RandExp;
}
