import { immustable, mustable } from "../../decorators/index";
import { MustableBase } from "../base/MustableBase.class";

export class MustableSet<TItem> extends MustableBase {
  private internalSet: Set<TItem>;

  constructor(initialValues?: Iterable<TItem>) {
    super();
    this.internalSet = new Set(initialValues);
  }

  @immustable()
  toSet() {
    return new Set(this.internalSet);
  }

  @mustable()
  fromIterable(items: Iterable<TItem>) {
    this.internalSet.clear();
    this.internalSet = new Set(items);
  }

  @immustable()
  shallowClone(): MustableSet<TItem> {
    return new MustableSet(this.internalSet);
  }

  //#region Built-in methods wrappers
  @mustable({
    snapshot: (instance) => instance.size,
    sameSnapshotsChecker: (size1, size2) => size1 === size2,
  })
  add(...values: TItem[]) {
    values.forEach((value) => this.internalSet.add(value));
  }

  @mustable({
    snapshot: (instance) => instance.size,
    sameSnapshotsChecker: (size1, size2) => size1 === size2,
  })
  clear(): void {
    this.internalSet.clear();
  }

  @mustable({
    snapshot: (instance) => instance.size,
    sameSnapshotsChecker: (size1, size2) => size1 === size2,
  })
  delete(...values: TItem[]) {
    values.forEach((value) => this.internalSet.delete(value));
  }

  @immustable()
  entries(): IterableIterator<[TItem, TItem]> {
    return this.internalSet.entries();
  }

  @immustable()
  forEach(callbackfn: (value: TItem, value2: TItem, set: MustableSet<TItem>) => void, thisArg?: any): void {
    this.internalSet.forEach((value, index) => callbackfn(value, index, this), thisArg);
  }

  @immustable()
  has(value: TItem): boolean {
    return this.internalSet.has(value);
  }

  @immustable()
  keys(): IterableIterator<TItem> {
    return this.internalSet.keys();
  }

  @immustable()
  get size(): number {
    return this.internalSet.size;
  }

  @immustable()
  values(): IterableIterator<TItem> {
    return this.internalSet.values();
  }
  //#endregion
}
