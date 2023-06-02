import { sameSnapshotsCheckers } from "../../common/index";
import { immustable, mustable } from "../../decorators/index";
import { MustableBase } from "../base/MustableBase.class";

type TMapEntry<TKey, TValue> = Iterable<[TKey, TValue]>;

export class MustableMap<TKey, TValue> extends MustableBase {
  private internalMap: Map<TKey, TValue>;

  constructor(initialEntries?: TMapEntry<TKey, TValue>) {
    super();
    this.internalMap = new Map(initialEntries);
  }

  @immustable()
  toMap() {
    return new Map(this.internalMap);
  }

  @mustable()
  fromEntries(entries: TMapEntry<TKey, TValue>) {
    this.internalMap.clear();
    this.internalMap = new Map(entries);
  }

  @immustable()
  shallowClone(): MustableMap<TKey, TValue> {
    return new MustableMap(this.internalMap);
  }

  //#region Built-in methods wrappers
  @mustable({
    snapshot: (instance) => instance.size,
    sameSnapshotsChecker: (size1, size2) => size1 === size2,
  })
  clear() {
    this.internalMap.clear();
  }

  @mustable({
    snapshot: (instance) => instance.size,
    sameSnapshotsChecker: (size1, size2) => size1 === size2,
  })
  delete(...keys: TKey[]) {
    keys.forEach((key) => this.internalMap.delete(key));
  }

  @immustable()
  entries(): IterableIterator<[TKey, TValue]> {
    return this.internalMap.entries();
  }

  @immustable()
  forEach(callbackfn: (value: TValue, key: TKey, map: MustableMap<TKey, TValue>) => void, thisArg?: any): void {
    this.internalMap.forEach((value, index) => callbackfn(value, index, this), thisArg);
  }

  @immustable()
  get(key: TKey): TValue | undefined {
    return this.internalMap.get(key);
  }

  @immustable()
  has(key: TKey): boolean {
    return this.internalMap.has(key);
  }

  @immustable()
  keys(): IterableIterator<TKey> {
    return this.internalMap.keys();
  }

  @mustable({
    snapshot: (instance, args) => {
      const key = args?.[0];
      return key && instance.get(key);
    },
    sameSnapshotsChecker: sameSnapshotsCheckers.isShallowSame,
  })
  set(key: TKey, value: TValue) {
    this.internalMap.set(key, value);
  }

  @immustable()
  get size(): number {
    return this.internalMap.size;
  }

  @immustable()
  values(): IterableIterator<TValue> {
    return this.internalMap.values();
  }
  //#endregion
}
