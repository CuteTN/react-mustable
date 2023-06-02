import "reflect-metadata";
import React from "react";
import { MustableBase } from "../../classes/base/MustableBase.class";
import { TMustableFactory, TNullableMustableFactory, TReactMustable, TReactMustableRegistry } from "../common/types.constants";
import { createReactMustable } from "../common/createReactMustable.helper";
import { TNullish } from "../../common/types.constants";

export function useMustableRegistry(): TReactMustableRegistry {
  const [version, setVersion] = React.useState(0);
  const reactMustableInstancesMap = React.useRef<Map<MustableBase, TReactMustable<MustableBase>>>();

  const getReactMustableInstancesMap = React.useCallback(() => {
    if (!reactMustableInstancesMap.current) reactMustableInstancesMap.current = new Map();

    return reactMustableInstancesMap.current;
  }, []);

  React.useEffect(() => {
    return () => {
      reactMustableInstancesMap.current?.clear();
    };
  }, []);

  const registerReactMustableInstance = React.useCallback(
    <T extends MustableBase>(instance: T, keepRef: boolean = true): TReactMustable<T> => {
      let reactMustableInstance = getReactMustableInstancesMap().get(instance) as TReactMustable<T>;

      if (!reactMustableInstance) {
        reactMustableInstance = createReactMustable(instance, setVersion);
        if (keepRef) getReactMustableInstancesMap().set(instance, reactMustableInstance);
      }

      return reactMustableInstance;
    },
    []
  );

  const removeReactMustableInstance = React.useCallback(<T extends MustableBase>(item: T | TReactMustable<T> | TNullish) => {
    const instance = item?.instance;
    if (instance) reactMustableInstancesMap.current?.delete(instance);
  }, []);

  const useNullableMustable = React.useCallback(
    <T extends MustableBase>(factory: TNullableMustableFactory<T>, deps: React.DependencyList = []) => {
      const rawInstance = React.useRef<T | TNullish>();

      return React.useMemo(() => {
        removeReactMustableInstance(rawInstance.current);
        rawInstance.current = factory();
        // TODO: Throw proper errors
        if (rawInstance.current != null && !(rawInstance.current instanceof MustableBase))
          throw new Error("Factory produces a non-Mustable instance.");

        if (!rawInstance.current) return rawInstance.current;

        return registerReactMustableInstance(rawInstance.current);
      }, deps);
    },
    [removeReactMustableInstance, registerReactMustableInstance]
  );

  const useMustable = React.useCallback(
    <T extends MustableBase>(factory: TMustableFactory<T>, deps: React.DependencyList = []) => {
      const result = useNullableMustable(factory, deps);
      // TODO: Throw proper errors
      if (result == null) throw new Error(`Factory produces a ${result} value.`);

      return result;
    },
    [useNullableMustable]
  );

  return React.useMemo(
    () => ({
      register: registerReactMustableInstance,
      remove: removeReactMustableInstance,
      useNullableMustable,
      useMustable,
      version,
    }),
    [registerReactMustableInstance, removeReactMustableInstance, useNullableMustable, useMustable, version]
  );
}
