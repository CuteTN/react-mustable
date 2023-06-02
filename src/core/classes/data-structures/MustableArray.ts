import { mustable, immustable } from "../../decorators/index";
import { sameSnapshotsCheckers } from "../../common/snapshots-comparers.utils";
import { MustableBase } from "../base/MustableBase.class";

export class MustableArray<TItem> extends MustableBase {
  private internalArray: Array<TItem>;

  constructor(initialValues?: Iterable<TItem>) {
    super();
    this.internalArray = initialValues ? Array.from(initialValues) : [];
  }

  @immustable()
  toArray() {
    return [...this.internalArray];
  }

  @mustable()
  fromIterable(items: Iterable<TItem>) {
    this.internalArray = Array.from(items);
  }

  @immustable()
  shallowClone(): MustableArray<TItem> {
    return new MustableArray(this.internalArray);
  }

  @mustable({
    snapshot: (instance, args) => instance.at(args![0]),
    sameSnapshotsChecker: sameSnapshotsCheckers.isShallowSame,
  })
  set(index: number, value: TItem) {
    if (index >= this.internalArray.length) return;

    this.internalArray[index] = value;
  }

  //#region Built-in methods wrappers
  @immustable()
  at(index: number): TItem | undefined {
    return this.internalArray.at(index);
  }

  concat(...items: ConcatArray<TItem>[]): MustableArray<TItem>;
  concat(...items: (TItem | ConcatArray<TItem>)[]): MustableArray<TItem>;
  @immustable()
  concat(...items: unknown[]): MustableArray<TItem> {
    return new MustableArray(this.internalArray.concat(...(items as any[])));
  }

  @mustable()
  copyWithin(target: number, start: number, end?: number | undefined) {
    this.internalArray.copyWithin(target, start, end);
  }

  @immustable()
  entries(): IterableIterator<[number, TItem]> {
    return this.internalArray.entries();
  }

  @immustable()
  every(predicate: (value: TItem, index: number, array: MustableArray<TItem>) => unknown, thisArg?: any): boolean {
    return this.internalArray.every((value, index) => predicate(value, index, this), thisArg);
  }

  @mustable()
  fill(value: TItem, start?: number | undefined, end?: number | undefined) {
    this.internalArray.fill(value, start, end);
  }

  @immustable()
  filter(predicate: (value: TItem, index: number, array: MustableArray<TItem>) => unknown, thisArg?: any): MustableArray<TItem> {
    const rawArrayResult = this.internalArray.filter((value, index) => predicate(value, index, this), thisArg);
    return new MustableArray(rawArrayResult);
  }

  @immustable()
  find(predicate: (value: TItem, index: number, obj: MustableArray<TItem>) => unknown, thisArg?: any): TItem | undefined {
    return this.internalArray.find((value, index) => predicate(value, index, this), thisArg);
  }

  @immustable()
  findIndex(predicate: (value: TItem, index: number, obj: MustableArray<TItem>) => unknown, thisArg?: any): number {
    return this.internalArray.findIndex((value, index) => predicate(value, index, this), thisArg);
  }

  @immustable()
  findLast(predicate: (value: TItem, index: number, obj: MustableArray<TItem>) => unknown, thisArg?: any): TItem | undefined {
    //@ts-ignore
    return this.internalArray.findLast((value, index) => predicate(value, index, this), thisArg);
  }

  @immustable()
  findLastIndex(predicate: (value: TItem, index: number, obj: MustableArray<TItem>) => unknown, thisArg?: any): number {
    //@ts-ignore
    return this.internalArray.findLastIndex((value, index) => predicate(value, index, this), thisArg);
  }

  @immustable()
  flat(depth: number = 1): MustableArray<any> {
    if (depth === 0) return this.shallowClone();

    let rawArrayResult: any[] = [];
    function collectItems(item: any, depth: number) {
      if (depth === 0) rawArrayResult.push(item);

      if (Array.isArray(item)) rawArrayResult.push(...item.map((_item) => collectItems(_item, depth - 1)));
      if (item instanceof MustableArray) rawArrayResult.push(...item.toArray().map((_item) => collectItems(_item, depth - 1)));

      rawArrayResult.push(item);
    }

    collectItems(this.internalArray, depth);
    return new MustableArray(rawArrayResult);
  }

  @immustable()
  flatMap<TFlattenItem>(
    callback: (value: TItem, index: number, array: MustableArray<TItem>) => TFlattenItem[] | TFlattenItem,
    thisArg?: any
  ): MustableArray<TFlattenItem> {
    return new MustableArray(this.internalArray.flatMap((value, index) => callback(value, index, this), thisArg));
  }

  @immustable()
  forEach(callbackfn: (value: TItem, index: number, array: MustableArray<TItem>) => void, thisArg?: any): void {
    this.internalArray.forEach((value, index) => callbackfn(value, index, this), thisArg);
  }

  @immustable()
  includes(searchElement: TItem, fromIndex?: number | undefined): boolean {
    return this.internalArray.includes(searchElement, fromIndex);
  }

  @immustable()
  indexOf(searchElement: TItem, fromIndex?: number | undefined): number {
    return this.internalArray.indexOf(searchElement, fromIndex);
  }

  @immustable()
  join(separator?: string | undefined): string {
    return this.internalArray.join(separator);
  }

  @immustable()
  keys(): IterableIterator<number> {
    return this.internalArray.keys();
  }

  @immustable()
  lastIndexOf(searchElement: TItem, fromIndex?: number | undefined): number {
    return this.internalArray.lastIndexOf(searchElement, fromIndex);
  }

  @immustable()
  get length(): number {
    return this.internalArray.length;
  }

  @immustable()
  map<TMappedItem>(
    predicate: (value: TItem, index: number, array: MustableArray<TItem>) => TMappedItem,
    thisArg?: any
  ): MustableArray<TMappedItem> {
    const rawArrayResult = this.internalArray.map((value, index) => predicate(value, index, this), thisArg);
    return new MustableArray(rawArrayResult);
  }

  @mustable({
    snapshot: (instance) => instance.length,
    sameSnapshotsChecker: (length1, length2) => length1 === length2,
  })
  pop() {
    this.internalArray.pop();
  }

  @mustable({
    snapshot: (instance) => instance.length,
    sameSnapshotsChecker: (length1, length2) => length1 === length2,
  })
  push(...items: TItem[]) {
    this.internalArray.push(...items);
  }

  @immustable()
  reduce(
    callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: MustableArray<TItem>) => TItem,
    initialValue: TItem
  ): TItem {
    return this.internalArray.reduce(
      (previousValue, currentValue, currentIndex) => callbackfn(previousValue, currentValue, currentIndex, this),
      initialValue
    );
  }

  @immustable()
  reduceRight(
    callbackfn: (previousValue: TItem, currentValue: TItem, currentIndex: number, array: MustableArray<TItem>) => TItem,
    initialValue: TItem
  ): TItem {
    return this.internalArray.reduceRight(
      (previousValue, currentValue, currentIndex) => callbackfn(previousValue, currentValue, currentIndex, this),
      initialValue
    );
  }

  @mustable()
  reverse() {
    this.internalArray.reverse();
  }

  @mustable({
    snapshot: (instance) => instance.length,
    sameSnapshotsChecker: (length1, length2) => length1 === length2,
  })
  shift() {
    this.internalArray.shift();
  }

  @immustable()
  slice(start?: number | undefined, end?: number | undefined): MustableArray<TItem> {
    return new MustableArray(this.internalArray.slice(start, end));
  }

  @immustable()
  some(predicate: (value: TItem, index: number, array: MustableArray<TItem>) => unknown, thisArg?: any): boolean {
    return this.internalArray.some((value, index) => predicate(value, index, this), thisArg);
  }

  @mustable()
  sort(compareFn?: ((a: TItem, b: TItem) => number) | undefined) {
    this.internalArray.sort(compareFn);
  }

  @mustable()
  splice(start: number, deleteCount: number, ...items: TItem[]) {
    this.internalArray.splice(start, deleteCount, ...items);
  }

  @immustable()
  toLocaleString(): string {
    return this.internalArray.toLocaleString();
  }

  @immustable()
  toString(): string {
    return this.internalArray.toString();
  }

  @mustable({
    snapshot: (instance) => instance.length,
    sameSnapshotsChecker: (length1, length2) => length1 === length2,
  })
  unshift(...items: TItem[]) {
    this.internalArray.unshift(...items);
  }

  @immustable()
  values(): IterableIterator<TItem> {
    return this.internalArray.values();
  }
  //#endregion
}
