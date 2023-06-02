import { TSameSnapshotsChecker } from "./types.constants";

const isAlwaysChanging: TSameSnapshotsChecker = () => false;

const isShallowSame: TSameSnapshotsChecker = (snapshotBefore: any, snapshotAfter) => {
  if (snapshotBefore === snapshotAfter) return true;

  if (snapshotBefore instanceof Date && snapshotAfter instanceof Date)
    return snapshotAfter.getTime() === snapshotBefore.getTime();

  return false;
};

const isTopLevelArrayShallowSame: TSameSnapshotsChecker = (snapshotBefore, snapshotAfter): boolean => {
  if (Array.isArray(snapshotBefore) && Array.isArray(snapshotAfter)) {
    if (snapshotBefore.length !== snapshotAfter.length) return false;

    return snapshotBefore.every((_, index) => isShallowSame(snapshotBefore[index], snapshotAfter[index]));
  }

  return isShallowSame(snapshotBefore, snapshotAfter);
};

const isDeepSame: TSameSnapshotsChecker = (snapshotBefore, snapshotAfter): boolean => {
  const type = Object.prototype.toString.call(snapshotBefore);
  const otherType = Object.prototype.toString.call(snapshotAfter);

  if (type !== otherType) {
    return false;
  }

  switch (type) {
    case "[object Array]":
      if (snapshotBefore.length !== snapshotAfter.length) {
        return false;
      }
      for (let i = 0; i < snapshotBefore.length; i++) {
        if (!isDeepSame(snapshotBefore[i], snapshotAfter[i])) {
          return false;
        }
      }

      return true;

    case "[object Object]": {
      const keys = Object.keys(snapshotBefore);
      const otherKeys = Object.keys(snapshotAfter);
      if (keys.length !== otherKeys.length) {
        return false;
      }
      for (const key of keys) {
        if (!snapshotAfter.hasOwnProperty(key) || !isDeepSame(snapshotBefore[key], snapshotAfter[key])) {
          return false;
        }
      }
      return true;
    }

    case "[object Date]":
      return snapshotBefore.getTime() === snapshotAfter.getTime();

    case "[object RegExp]":
      return snapshotBefore.toString() === snapshotAfter.toString();

    default:
      return snapshotBefore === snapshotAfter;
  }
};

export const sameSnapshotsCheckers = Object.freeze({
  isAlwaysChanging,
  isShallowSame,
  isTopLevelArrayShallowSame,
  isDeepSame,
});
