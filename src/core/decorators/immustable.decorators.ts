/**
 * This decorator does nothing to the targeted member. However, it is recommended to decorate this in order to ensure no member is missing its (im)mustable decorator.
 */
export function immustable() {
  return function (_target: any, _propertyKey: string, _descriptor?: PropertyDescriptor) {};
}
