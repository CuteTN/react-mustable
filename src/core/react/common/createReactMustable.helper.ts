import "reflect-metadata";
import { MustableBase } from "../../classes/index";
import { MUSTABLE_SYMBOL } from "../../common/metadata.constants";
import { TMustableMemberData, TMustableMemberDatum, TMustableMemberTypes } from "../../common/types.constants";
import { TReactMustable } from "./types.constants";

export function createReactMustable<T extends MustableBase>(
  instance: T,
  setVersion: React.Dispatch<React.SetStateAction<number>>
): TReactMustable<T> {
  if (!(instance instanceof MustableBase)) {
    // TODO: need a specific error here
    throw new Error("Cannot create React Mustable as the referred item is not an instance of MustableBase");
  }

  //@ts-ignore
  const mustableMembers: TMustableMemberData = Reflect.getMetadata(MUSTABLE_SYMBOL, instance) ?? {};
  const result: any = {
    version: 0,
    instance,
  };

  const mutateValue = (fn: Function, mustableMember: TMustableMemberDatum | undefined, methodArgs?: any[]) => {
    setVersion((prev) => {
      // NOTE: This is to prevent React strict mode error.
      //@ts-ignore
      if (fn.version != null) return fn.version;

      const snapshotBefore = mustableMember?.snapshot?.(instance, methodArgs);
      fn();
      const snapshotAfter = mustableMember?.snapshot?.(instance, methodArgs);

      if (mustableMember?.snapshot && mustableMember.sameSnapshotsChecker?.(snapshotBefore, snapshotAfter)) {
        return prev;
      }

      const newVersion = prev + 1;
      result.version = newVersion;
      //@ts-ignore
      fn.version = newVersion;
      return newVersion;
    });
  };

  const memberNames = new Set([...Object.getOwnPropertyNames(Object.getPrototypeOf(instance)), ...Object.keys(instance)]);
  Object.keys(result).forEach((excludedKey) => memberNames.delete(excludedKey));

  memberNames.forEach((key) => {
    const mustableMember = mustableMembers[key];
    let descriptor: PropertyDescriptor = {};

    switch (mustableMember?.memberType as TMustableMemberTypes) {
      case "field":
      case "property":
      case undefined: {
        descriptor.get = () => {
          const value = (instance as any)[key];
          if (typeof value === "function") {
            if (mustableMember?.isMustableFunction) {
              return (...args: any[]) => {
                mutateValue(
                  () => {
                    (instance as any)[key](...args);
                  },
                  mustableMember,
                  args
                );
              };
            } else {
              return (...args: any[]) => {
                return (instance as any)[key](...args);
              };
            }
          }
          return value;
        };
        delete descriptor.value;

        if (mustableMember?.memberType) {
          descriptor.set = (value: any) => {
            mutateValue(
              () => {
                (instance as any)[key] = value;
              },
              mustableMember,
              [value]
            );
          };
        } else {
          descriptor.set = (value: any) => {
            (instance as any)[key] = value;
          };
        }
        break;
      }
      case "method": {
        descriptor.value = (...args: any[]) => {
          mutateValue(
            () => {
              (instance as any)[key](...args);
            },
            mustableMember,
            args
          );
        };
        break;
      }
    }

    Object.defineProperty(result, key, descriptor);
  });

  return result as TReactMustable<T>;
}
