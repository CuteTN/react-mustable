import React from "react";
import { MustableBase } from "../../classes/index";
import { TNullish } from "../../common/types.constants";

export type TReactMustable<T extends MustableBase> = Omit<T, "version"> & { readonly version: number; readonly instance: T };

export type TNullableMustableFactory<T extends MustableBase> = () => T | TNullish;
export type TMustableFactory<T extends MustableBase> = () => T;

// TODO: Add documentation
export type TReactMustableRegistry = {
  /**
   * "Version" of one React rerender phase. This is not actually a version, its sole purpose is to reflect if there were any changes to the registered ***Mustable***.
   */
  version: number;

  /**
   * Get the React Mustable instance of a Mustable, which is able to observe every mutation and trigger React to rerender.
   * @param instance Mustable instance to observe on.
   * @param keepRef Default to ***true***. Whether to store the created React Mustable instance in a store in order not to re-create a new one later.
   * @returns the React Mustable instance.
   */
  register: <T extends MustableBase>(instance: T, keepRef?: boolean) => TReactMustable<T>;

  /**
   * Remove a Mustable registration if its ref were kept on creation. This function is for cleaning up purposes.
   * @param item Can be either a Mustable or a React Mustable instance
   */
  remove: <T extends MustableBase>(item: T | TReactMustable<T>) => void;

  /**
   * Recompute and register the memoized Mustable when one of the ***deps*** has changed.
   * @param factory a function to create a Mustable.
   * @param deps Similar to React useEffect, useMemo,... dependencies.
   * @returns A registered React Mustable (with the ref being kept).
   */
  useMustable: <T extends MustableBase>(factory: TMustableFactory<T>, deps: React.DependencyList) => TReactMustable<T>;

  /**
   * Same as ***useMemo*** but allow ***null*** and ***undefined***.
   * @param factory a function to create a Mustable.
   * @param deps Similar to React useEffect, useMemo,... dependencies.
   * @returns A registered React Mustable (with the ref being kept). Return the instance itself it the value was null or undefined.
   */
  useNullableMustable: <T extends MustableBase>(
    factory: TNullableMustableFactory<T>,
    deps: React.DependencyList
  ) => TReactMustable<T> | TNullish;
};
