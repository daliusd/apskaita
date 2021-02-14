export function defaultOrFirst(param: string | string[]): string {
  if (typeof param === 'string') {
    return param;
  } else if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}
