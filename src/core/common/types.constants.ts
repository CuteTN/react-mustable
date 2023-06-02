export type TMustableMemberTypes = "field" | "property" | "method" | undefined;

export type MustableOptions = {
  /**
   * Set this to ***true*** to enable mustable effect after executing the targeted field ***field*** whose type is ***function***.
   * This does ***not*** affect ***methods***.
   */
  isMustableFunction: boolean;

  /**
   * Create a lightweight immutable snapshot to compare before and after this member is called/set, if 2 snapshots are identical, a React rerender will be skipped.
   * @param instance An Mustable instance.
   * @param args The arguments that the member has been called with.
   * @returns Lightweight immutable snapshot.
   */
  snapshot?: (instance: any, args?: any[]) => any;

  /**
   * Custom comparer to check if 2 snapshots are identical after an update call.
   * @param snapshotBefore
   * @param snapshotAfter
   * @returns True if and only if 2 snapshots can be seen as identical.
   */
  sameSnapshotsChecker?: TSameSnapshotsChecker;
};

export type TMustableMemberDatum = {
  memberType: TMustableMemberTypes;
} & MustableOptions;

export type TMustableMemberData = { [key: string]: TMustableMemberDatum };

export type TClass<T extends object> = { new (...args: any[]): T };

export type TNullish = null | undefined;

export type TSameSnapshotsChecker = (snapshotBefore: any, snapshotAfter: any) => boolean;
