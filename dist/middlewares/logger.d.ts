declare const requestLogger: import("express").Handler;
declare const errorLogger: import("express").ErrorRequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export { requestLogger, errorLogger };
