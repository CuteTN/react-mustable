import "reflect-metadata";
import { MUSTABLE_SYMBOL } from "../common/metadata.constants";
import { DEFAULT_MUSTABLE_OPTIONS } from "../common/utils.constants";
import { TMustableMemberTypes, TMustableMemberData, MustableOptions } from "../common/types.constants";
import { sameSnapshotsCheckers } from "../common/snapshots-comparers.utils";

function adjustMustableOptions(options: Partial<MustableOptions> = {}) {
  const fullOptions = { ...DEFAULT_MUSTABLE_OPTIONS, ...options };

  if (fullOptions.snapshot) fullOptions.sameSnapshotsChecker ??= sameSnapshotsCheckers.isTopLevelArrayShallowSame;
  else delete fullOptions.sameSnapshotsChecker;

  return fullOptions;
}

/**
 * Mark a class member as Mustable member. When a mustable member changes or get called, it will trigger React to rerender.
 * @param options Mustable member option
 */
export function mustable(options: Partial<MustableOptions> = {}) {
  const fullOptions = adjustMustableOptions(options);

  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    if (typeof target.constructor !== "function") return;

    //@ts-ignore
    const mustableMembers: TMustableMemberData = Reflect.getMetadata(MUSTABLE_SYMBOL, target) ?? {};
    let memberType: TMustableMemberTypes;

    if (typeof descriptor?.value === "function") memberType = "method";
    else if (!(descriptor?.get || descriptor?.set)) memberType = "field";
    else if (descriptor?.set) memberType = "property";

    if (memberType) {
      mustableMembers[propertyKey] = { memberType, ...fullOptions };
      //@ts-ignore
      Reflect.defineMetadata(MUSTABLE_SYMBOL, mustableMembers, target);
    }
  };
}
