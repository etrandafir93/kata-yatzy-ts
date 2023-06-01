
export default class Yatzy {

  static ones(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.sumAllWhereValue(is(1), [d1, d2, d3, d4, d5]);
  }

  static twos(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.sumAllWhereValue(is(2), [d1, d2, d3, d4, d5]);
  }

  static threes(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.sumAllWhereValue(is(3), [d1, d2, d3, d4, d5]);
  }

  static fours(...p: number[]): number {
    return this.sumAllWhereValue(is(4), p);
  }

  static fives(...dice: number[]): number {
    return this.sumAllWhereValue(is(5), dice);
  }

  static sixes(...dice: number[]): number {
    return this.sumAllWhereValue(is(6), dice);
  }

  static chance(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.sumAllWhereValue(isAny(), [d1, d2, d3, d4, d5]);
  }

  private static sumAllWhereValue(diceFilter: (dice: number) => boolean, dices: number[]): number {
    return dices.filter(diceFilter).reduce(sum, 0);
  }



  static onePair(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.moreOfaKind(2, [d1, d2, d3, d4, d5]);
  }

  static twoPairs(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.moreOfaKindMultipleGroups(2, [d1, d2, d3, d4, d5], 2);
  }

  static threeOfAKind(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.moreOfaKind(3, [d1, d2, d3, d4, d5]);
  }

  static fourOfAKind(_1: number, _2: number, d3: number, d4: number, d5: number): number {
    return this.moreOfaKind(4, [_1, _2, d3, d4, d5]);
  }

  static yatzy(...args: number[]): number {
    return this.hasMoreOfaKind(5, args) ? 50 : 0;
  }

  static moreOfaKind(count: number, roll: number[]): number {
    return this.moreOfaKindMultipleGroups(count, roll, 1);
  }

  private static moreOfaKindMultipleGroups(count: number, dices: number[], nrOfGroups: number): number {
    const roll: Roll = dices.reduce(byFrequency, Roll.new());
    return roll.sortedByValue()
      .filter(dice => dice.count >= count)
      .map(dice => dice.value * count)
      .slice(0, nrOfGroups)
      .reduce(sumIfLength(is(nrOfGroups)), 0);
  }

  private static hasMoreOfaKind(nrOfElements: number, dices: number[]): boolean {
    return this.moreOfaKind(nrOfElements, dices) != 0;
  }

  static smallStraight(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.straight([d1, d2, d3, d4, d5], first(5), 15);
  }

  static largeStraight(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    return this.straight([d1, d2, d3, d4, d5], last(5), 20);
  }

  private static straight(dices: number[], takeFromList: (arr: any[]) => any[], score: number): number {
    const roll: Roll = dices.reduce(byFrequency, Roll.new());
    const doesMatch = takeFromList(roll.dices())
      .map(dice => dice.count)
      .filter(is(1))
      .length == 5;
    return doesMatch ? score : 0;
  }

  static fullHouse(d1: number, d2: number, d3: number, d4: number, d5: number): number {
    const roll: Roll = [d1, d2, d3, d4, d5].reduce(byFrequency, Roll.new());
    const doesMatch = roll.dices()
      .map(dice => dice.count)
      .filter(c => c == 2 || c == 3)
      .reduce(sum, 0) == 5;
    return doesMatch ? roll.dices().map(d => d.count * d.value).reduce(sum, 0) : 0;
  }
}

function sum(a: number, b: number): number {
  return a + b;
}

function sumIfLength(lengthPredicate: any): any {
  return (acc: number, val: number, index: number, arr: number[]) => {
    if (lengthPredicate(arr.length)) {
      return acc + val;
    }
    return 0;
  }

}

function is(expected: number) {
  return (x: number) => x == expected;
}
function isAny() {
  return (__: number) => true;
}

function byFrequency(roll: Roll, curr: number): Roll {
  return roll.add(curr);
}


class Roll {
  private readonly _dices: Dice[];

  public static new(): Roll {
    return new Roll(
      [1, 2, 3, 4, 5, 6].map(dice => new Dice(dice, 0))
    );
  }

  constructor(d: Dice[]) {
    this._dices = d;
  }

  public add(newDice: number): Roll {
    const newDices = this._dices
      .map(dice => dice.value == newDice ? dice.increased() : dice);
    return new Roll(newDices);
  }

  public sortedByValue(): Dice[] {
    return this._dices
      .sort((d1, d2) => d1.hasBiggerValueThan(d2) ? -1 : 1)
  }

  public dices(): Dice[] {
    return [...this._dices];
  }
}

class Dice {
  public readonly value: number;
  public readonly count: number;

  constructor(v: number, c: number) {
    this.value = v;
    this.count = c;
  }

  public increased(): Dice {
    return new Dice(
      this.value,
      this.count + 1
    )
  }

  public hasBiggerValueThan(other: Dice): boolean {
    return this.value > other.value;
  }
}

function last(nrOfElements: number): (arr: any[]) => any[] {
  return (arr: any[]) => [...arr].slice(arr.length - nrOfElements, arr.length);
}

function first(nrOfElements: number): (arr: any[]) => any[] {
  return (arr: any[]) => [...arr].slice(0, nrOfElements);
}