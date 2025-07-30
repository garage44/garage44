var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// ../../node_modules/classnames/index.js
var require_classnames = __commonJS((exports, module) => {
  /*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  */
  (function() {
    var hasOwn = {}.hasOwnProperty;
    function classNames() {
      var classes = "";
      for (var i = 0;i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg) {
          classes = appendClass(classes, parseValue(arg));
        }
      }
      return classes;
    }
    function parseValue(arg) {
      if (typeof arg === "string" || typeof arg === "number") {
        return arg;
      }
      if (typeof arg !== "object") {
        return "";
      }
      if (Array.isArray(arg)) {
        return classNames.apply(null, arg);
      }
      if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
        return arg.toString();
      }
      var classes = "";
      for (var key in arg) {
        if (hasOwn.call(arg, key) && arg[key]) {
          classes = appendClass(classes, key);
        }
      }
      return classes;
    }
    function appendClass(value, newClass) {
      if (!newClass) {
        return value;
      }
      if (value) {
        return value + " " + newClass;
      }
      return value + newClass;
    }
    if (typeof module !== "undefined" && module.exports) {
      classNames.default = classNames;
      module.exports = classNames;
    } else if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
      define("classnames", [], function() {
        return classNames;
      });
    } else {
      window.classNames = classNames;
    }
  })();
});

// ../../node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS((exports, module) => {
  var has = Object.prototype.hasOwnProperty;
  var prefix = "~";
  function Events() {}
  if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events;
    else
      delete emitter._events[evt];
  }
  function EventEmitter2() {
    this._events = new Events;
    this._eventsCount = 0;
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i4 = 0, l5 = handlers.length, ee = new Array(l5);i4 < l5; i4++) {
      ee[i4] = handlers[i4].fn;
    }
    return ee;
  };
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter2.prototype.emit = function emit(event, a1, a22, a32, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i4;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, undefined, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a22), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a22, a32), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a22, a32, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a22, a32, a4, a5), true;
      }
      for (i4 = 1, args = new Array(len - 1);i4 < len; i4++) {
        args[i4 - 1] = arguments[i4];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j3;
      for (i4 = 0;i4 < length; i4++) {
        if (listeners[i4].once)
          this.removeListener(event, listeners[i4].fn, undefined, true);
        switch (len) {
          case 1:
            listeners[i4].fn.call(listeners[i4].context);
            break;
          case 2:
            listeners[i4].fn.call(listeners[i4].context, a1);
            break;
          case 3:
            listeners[i4].fn.call(listeners[i4].context, a1, a22);
            break;
          case 4:
            listeners[i4].fn.call(listeners[i4].context, a1, a22, a32);
            break;
          default:
            if (!args)
              for (j3 = 1, args = new Array(len - 1);j3 < len; j3++) {
                args[j3 - 1] = arguments[j3];
              }
            listeners[i4].fn.apply(listeners[i4].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter2.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter2.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i4 = 0, events = [], length = listeners.length;i4 < length; i4++) {
        if (listeners[i4].fn !== fn || once && !listeners[i4].once || context && listeners[i4].context !== context) {
          events.push(listeners[i4]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events;
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
  EventEmitter2.prefixed = prefix;
  EventEmitter2.EventEmitter = EventEmitter2;
  if (typeof module !== "undefined") {
    module.exports = EventEmitter2;
  }
});

// node:path
var exports_path = {};
__export(exports_path, {
  sep: () => sep,
  resolve: () => resolve,
  relative: () => relative,
  posix: () => posix,
  parse: () => parse,
  normalize: () => normalize,
  join: () => join,
  isAbsolute: () => isAbsolute,
  format: () => format,
  extname: () => extname,
  dirname: () => dirname,
  delimiter: () => delimiter,
  default: () => path_default,
  basename: () => basename,
  _makeLong: () => _makeLong
});
function assertPath(path) {
  if (typeof path !== "string")
    throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
}
function normalizeStringPosix(path, allowAboveRoot) {
  var res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code;
  for (var i4 = 0;i4 <= path.length; ++i4) {
    if (i4 < path.length)
      code = path.charCodeAt(i4);
    else if (code === 47)
      break;
    else
      code = 47;
    if (code === 47) {
      if (lastSlash === i4 - 1 || dots === 1)
        ;
      else if (lastSlash !== i4 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1)
                res = "", lastSegmentLength = 0;
              else
                res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              lastSlash = i4, dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "", lastSegmentLength = 0, lastSlash = i4, dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += "/..";
          else
            res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += "/" + path.slice(lastSlash + 1, i4);
        else
          res = path.slice(lastSlash + 1, i4);
        lastSegmentLength = i4 - lastSlash - 1;
      }
      lastSlash = i4, dots = 0;
    } else if (code === 46 && dots !== -1)
      ++dots;
    else
      dots = -1;
  }
  return res;
}
function _format(sep, pathObject) {
  var dir2 = pathObject.dir || pathObject.root, base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir2)
    return base;
  if (dir2 === pathObject.root)
    return dir2 + base;
  return dir2 + sep + base;
}
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false, cwd;
  for (var i4 = arguments.length - 1;i4 >= -1 && !resolvedAbsolute; i4--) {
    var path;
    if (i4 >= 0)
      path = arguments[i4];
    else {
      if (cwd === undefined)
        cwd = process.cwd();
      path = cwd;
    }
    if (assertPath(path), path.length === 0)
      continue;
    resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  if (resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute), resolvedAbsolute)
    if (resolvedPath.length > 0)
      return "/" + resolvedPath;
    else
      return "/";
  else if (resolvedPath.length > 0)
    return resolvedPath;
  else
    return ".";
}
function normalize(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var isAbsolute = path.charCodeAt(0) === 47, trailingSeparator = path.charCodeAt(path.length - 1) === 47;
  if (path = normalizeStringPosix(path, !isAbsolute), path.length === 0 && !isAbsolute)
    path = ".";
  if (path.length > 0 && trailingSeparator)
    path += "/";
  if (isAbsolute)
    return "/" + path;
  return path;
}
function isAbsolute(path) {
  return assertPath(path), path.length > 0 && path.charCodeAt(0) === 47;
}
function join() {
  if (arguments.length === 0)
    return ".";
  var joined;
  for (var i4 = 0;i4 < arguments.length; ++i4) {
    var arg = arguments[i4];
    if (assertPath(arg), arg.length > 0)
      if (joined === undefined)
        joined = arg;
      else
        joined += "/" + arg;
  }
  if (joined === undefined)
    return ".";
  return normalize(joined);
}
function relative(from, to) {
  if (assertPath(from), assertPath(to), from === to)
    return "";
  if (from = resolve(from), to = resolve(to), from === to)
    return "";
  var fromStart = 1;
  for (;fromStart < from.length; ++fromStart)
    if (from.charCodeAt(fromStart) !== 47)
      break;
  var fromEnd = from.length, fromLen = fromEnd - fromStart, toStart = 1;
  for (;toStart < to.length; ++toStart)
    if (to.charCodeAt(toStart) !== 47)
      break;
  var toEnd = to.length, toLen = toEnd - toStart, length = fromLen < toLen ? fromLen : toLen, lastCommonSep = -1, i4 = 0;
  for (;i4 <= length; ++i4) {
    if (i4 === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i4) === 47)
          return to.slice(toStart + i4 + 1);
        else if (i4 === 0)
          return to.slice(toStart + i4);
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i4) === 47)
          lastCommonSep = i4;
        else if (i4 === 0)
          lastCommonSep = 0;
      }
      break;
    }
    var fromCode = from.charCodeAt(fromStart + i4), toCode = to.charCodeAt(toStart + i4);
    if (fromCode !== toCode)
      break;
    else if (fromCode === 47)
      lastCommonSep = i4;
  }
  var out = "";
  for (i4 = fromStart + lastCommonSep + 1;i4 <= fromEnd; ++i4)
    if (i4 === fromEnd || from.charCodeAt(i4) === 47)
      if (out.length === 0)
        out += "..";
      else
        out += "/..";
  if (out.length > 0)
    return out + to.slice(toStart + lastCommonSep);
  else {
    if (toStart += lastCommonSep, to.charCodeAt(toStart) === 47)
      ++toStart;
    return to.slice(toStart);
  }
}
function _makeLong(path) {
  return path;
}
function dirname(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var code = path.charCodeAt(0), hasRoot = code === 47, end = -1, matchedSlash = true;
  for (var i4 = path.length - 1;i4 >= 1; --i4)
    if (code = path.charCodeAt(i4), code === 47) {
      if (!matchedSlash) {
        end = i4;
        break;
      }
    } else
      matchedSlash = false;
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== "string")
    throw new TypeError('"ext" argument must be a string');
  assertPath(path);
  var start = 0, end = -1, matchedSlash = true, i4;
  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
    if (ext.length === path.length && ext === path)
      return "";
    var extIdx = ext.length - 1, firstNonSlashEnd = -1;
    for (i4 = path.length - 1;i4 >= 0; --i4) {
      var code = path.charCodeAt(i4);
      if (code === 47) {
        if (!matchedSlash) {
          start = i4 + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1)
          matchedSlash = false, firstNonSlashEnd = i4 + 1;
        if (extIdx >= 0)
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1)
              end = i4;
          } else
            extIdx = -1, end = firstNonSlashEnd;
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  } else {
    for (i4 = path.length - 1;i4 >= 0; --i4)
      if (path.charCodeAt(i4) === 47) {
        if (!matchedSlash) {
          start = i4 + 1;
          break;
        }
      } else if (end === -1)
        matchedSlash = false, end = i4 + 1;
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
}
function extname(path) {
  assertPath(path);
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, preDotState = 0;
  for (var i4 = path.length - 1;i4 >= 0; --i4) {
    var code = path.charCodeAt(i4);
    if (code === 47) {
      if (!matchedSlash) {
        startPart = i4 + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i4 + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i4;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    return "";
  return path.slice(startDot, end);
}
function format(pathObject) {
  if (pathObject === null || typeof pathObject !== "object")
    throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
  return _format("/", pathObject);
}
function parse(path) {
  assertPath(path);
  var ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0)
    return ret;
  var code = path.charCodeAt(0), isAbsolute2 = code === 47, start;
  if (isAbsolute2)
    ret.root = "/", start = 1;
  else
    start = 0;
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, i4 = path.length - 1, preDotState = 0;
  for (;i4 >= start; --i4) {
    if (code = path.charCodeAt(i4), code === 47) {
      if (!matchedSlash) {
        startPart = i4 + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i4 + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i4;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1)
      if (startPart === 0 && isAbsolute2)
        ret.base = ret.name = path.slice(1, end);
      else
        ret.base = ret.name = path.slice(startPart, end);
  } else {
    if (startPart === 0 && isAbsolute2)
      ret.name = path.slice(1, startDot), ret.base = path.slice(1, end);
    else
      ret.name = path.slice(startPart, startDot), ret.base = path.slice(startPart, end);
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0)
    ret.dir = path.slice(0, startPart - 1);
  else if (isAbsolute2)
    ret.dir = "/";
  return ret;
}
var sep = "/", delimiter = ":", posix, path_default;
var init_path = __esm(() => {
  posix = ((p4) => (p4.posix = p4, p4))({ resolve, normalize, isAbsolute, join, relative, _makeLong, dirname, basename, extname, format, parse, sep, delimiter, win32: null, posix: null });
  path_default = posix;
});

// ../common/lib/logger.node.ts
var exports_logger_node = {};
__export(exports_logger_node, {
  Logger: () => Logger2
});

class Logger2 {
  level;
  fileStream;
  constructor({ level = "info", file } = {}) {
    this.level = level;
    if (file) {
      const fs = (() => ({}));
      const path = (init_path(), __toCommonJS(exports_path));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      this.fileStream = fs.createWriteStream(file, { flags: "a" });
    }
  }
  shouldLog(level) {
    return LEVELS[level] <= LEVELS[this.level];
  }
  format(level, msg) {
    const now = new Date;
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const color = COLORS[level] || "";
    const levelStr = level.toUpperCase();
    if (level === "debug") {
      const mediumGrey = "\x1B[38;5;244m";
      return `${color}[${levelStr[0]}]${COLORS.reset} ${mediumGrey}[${ts}] ${msg}${COLORS.reset}`;
    }
    if (level === "warn") {
      const lightOrange = "\x1B[38;5;215m";
      return `${color}[${levelStr[0]}]${COLORS.reset} ${lightOrange}[${ts}] ${msg}${COLORS.reset}`;
    }
    if (level === "success") {
      const lightGreen = "\x1B[38;5;156m";
      return `${color}[${levelStr[0]}]${COLORS.reset} ${lightGreen}[${ts}] ${msg}${COLORS.reset}`;
    }
    if (level === "info") {
      const pastelBlue = "\x1B[38;5;153m";
      return `${color}[${levelStr[0]}]${COLORS.reset} ${pastelBlue}[${ts}] ${msg}${COLORS.reset}`;
    }
    if (level === "error") {
      const pastelRed = "\x1B[38;5;210m";
      return `${color}[${levelStr[0]}]${COLORS.reset} ${pastelRed}[${ts}] ${msg}${COLORS.reset}`;
    }
    return `${color}[${levelStr[0]}]${COLORS.reset} [${ts}] ${msg}`;
  }
  logToFile(msg) {
    if (this.fileStream) {
      this.fileStream.write(msg + `
`);
    }
  }
  log(level, msg, ...args) {
    if (!this.shouldLog(level)) {
      return;
    }
    const formatted = this.format(level, msg);
    if (level === "error") {
      console.error(formatted, ...args);
    } else if (level === "warn") {
      console.warn(formatted, ...args);
    } else {
      console.log(formatted, ...args);
    }
    this.logToFile(formatted.replaceAll(new RegExp(`${ESC}\\[[0-9;]*m`, "g"), ""));
  }
  error(msg, ...args) {
    this.log("error", msg, ...args);
  }
  warn(msg, ...args) {
    this.log("warn", msg, ...args);
  }
  info(msg, ...args) {
    this.log("info", msg, ...args);
  }
  success(msg, ...args) {
    this.log("success", msg, ...args);
  }
  verbose(msg, ...args) {
    this.log("verbose", msg, ...args);
  }
  debug(msg, ...args) {
    this.log("debug", msg, ...args);
  }
  setLevel(level) {
    this.level = level;
  }
  close() {
    if (this.fileStream) {
      this.fileStream.end();
    }
  }
}
var LEVELS, ESC, COLORS;
var init_logger_node = __esm(() => {
  LEVELS = {
    debug: 5,
    error: 0,
    info: 2,
    success: 3,
    verbose: 4,
    warn: 1
  };
  ESC = String.fromCodePoint(27);
  COLORS = {
    debug: `${ESC}[90m`,
    error: `${ESC}[31m`,
    info: `${ESC}[34m`,
    reset: `${ESC}[0m`,
    success: `${ESC}[38;2;39;174;96m`,
    verbose: `${ESC}[36m`,
    warn: `${ESC}[33m`
  };
});

// ../common/lib/logger.browser.ts
var exports_logger_browser = {};
__export(exports_logger_browser, {
  logger: () => logger2,
  Logger: () => Logger3
});

class Logger3 {
  level;
  constructor({ level = "info" } = {}) {
    this.level = level;
  }
  shouldLog(level) {
    return LEVELS2[level] <= LEVELS2[this.level];
  }
  log(level, msg, ...args) {
    if (!this.shouldLog(level)) {
      return;
    }
    const now = new Date;
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const levelStr = level.toUpperCase();
    const style = COLORS2[level] || "";
    if (level === "debug") {
      const mediumGreyStyle = "color: #888888";
      const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`;
      console.log(prefix, style, mediumGreyStyle, ...args);
    } else if (level === "warn") {
      const lightOrangeStyle = "color: #ffb366";
      const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`;
      console.warn(prefix, style, lightOrangeStyle, ...args);
    } else if (level === "success") {
      const lightGreenStyle = "color: #90ee90";
      const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`;
      console.log(prefix, style, lightGreenStyle, ...args);
    } else if (level === "info") {
      const pastelBlueStyle = "color: #87ceeb";
      const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`;
      console.log(prefix, style, pastelBlueStyle, ...args);
    } else if (level === "error") {
      const pastelRedStyle = "color: #ff9999";
      const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`;
      console.error(prefix, style, pastelRedStyle, ...args);
    } else {
      const prefix = `%c[${levelStr[0]}]%c [${ts}]`;
      if (level === "verbose") {
        console.log(`${prefix} ${msg}`, style, "", ...args);
      }
    }
  }
  error(msg, ...args) {
    this.log("error", msg, ...args);
  }
  warn(msg, ...args) {
    this.log("warn", msg, ...args);
  }
  info(msg, ...args) {
    this.log("info", msg, ...args);
  }
  success(msg, ...args) {
    this.log("success", msg, ...args);
  }
  verbose(msg, ...args) {
    this.log("verbose", msg, ...args);
  }
  debug(msg, ...args) {
    this.log("debug", msg, ...args);
  }
  setLevel(level) {
    this.level = level;
  }
  close() {}
}
var LEVELS2, COLORS2, logger2;
var init_logger_browser = __esm(() => {
  LEVELS2 = {
    debug: 0,
    error: 1,
    info: 2,
    success: 3,
    verbose: 4,
    warn: 5
  };
  COLORS2 = {
    debug: "color: #7f8c8d",
    error: "color: #e74c3c",
    info: "color: #3498db",
    success: "color: #27ae60",
    verbose: "color: #1abc9c",
    warn: "color: #f1c40f"
  };
  logger2 = new Logger3;
});

// ../common/lib/i18n.ts
var exports_i18n = {};
__export(exports_i18n, {
  init: () => init2,
  i18nFormat: () => i18nFormat,
  $t: () => $t
});

// ../../node_modules/i18next/dist/esm/i18next.js
var isString = (obj) => typeof obj === "string";
var defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};
var makeString = (object) => {
  if (object == null)
    return "";
  return "" + object;
};
var copy = (a, s, t) => {
  a.forEach((m) => {
    if (s[m])
      t[m] = s[m];
  });
};
var lastOfPathSeparatorRegExp = /###/g;
var cleanKey = (key) => key && key.indexOf("###") > -1 ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
var canNotTraverseDeeper = (object) => !object || isString(object);
var getLastOfPath = (object, path, Empty) => {
  const stack = !isString(path) ? path : path.split(".");
  let stackIndex = 0;
  while (stackIndex < stack.length - 1) {
    if (canNotTraverseDeeper(object))
      return {};
    const key = cleanKey(stack[stackIndex]);
    if (!object[key] && Empty)
      object[key] = new Empty;
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      object = object[key];
    } else {
      object = {};
    }
    ++stackIndex;
  }
  if (canNotTraverseDeeper(object))
    return {};
  return {
    obj: object,
    k: cleanKey(stack[stackIndex])
  };
};
var setPath = (object, path, newValue) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  if (obj !== undefined || path.length === 1) {
    obj[k] = newValue;
    return;
  }
  let e = path[path.length - 1];
  let p = path.slice(0, path.length - 1);
  let last = getLastOfPath(object, p, Object);
  while (last.obj === undefined && p.length) {
    e = `${p[p.length - 1]}.${e}`;
    p = p.slice(0, p.length - 1);
    last = getLastOfPath(object, p, Object);
    if (last?.obj && typeof last.obj[`${last.k}.${e}`] !== "undefined") {
      last.obj = undefined;
    }
  }
  last.obj[`${last.k}.${e}`] = newValue;
};
var pushPath = (object, path, newValue, concat) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path, Object);
  obj[k] = obj[k] || [];
  obj[k].push(newValue);
};
var getPath = (object, path) => {
  const {
    obj,
    k
  } = getLastOfPath(object, path);
  if (!obj)
    return;
  if (!Object.prototype.hasOwnProperty.call(obj, k))
    return;
  return obj[k];
};
var getPathWithDefaults = (data, defaultData, key) => {
  const value = getPath(data, key);
  if (value !== undefined) {
    return value;
  }
  return getPath(defaultData, key);
};
var deepExtend = (target, source, overwrite) => {
  for (const prop in source) {
    if (prop !== "__proto__" && prop !== "constructor") {
      if (prop in target) {
        if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
          if (overwrite)
            target[prop] = source[prop];
        } else {
          deepExtend(target[prop], source[prop], overwrite);
        }
      } else {
        target[prop] = source[prop];
      }
    }
  }
  return target;
};
var regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var _entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;"
};
var escape = (data) => {
  if (isString(data)) {
    return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
  }
  return data;
};

class RegExpCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.regExpMap = new Map;
    this.regExpQueue = [];
  }
  getRegExp(pattern) {
    const regExpFromCache = this.regExpMap.get(pattern);
    if (regExpFromCache !== undefined) {
      return regExpFromCache;
    }
    const regExpNew = new RegExp(pattern);
    if (this.regExpQueue.length === this.capacity) {
      this.regExpMap.delete(this.regExpQueue.shift());
    }
    this.regExpMap.set(pattern, regExpNew);
    this.regExpQueue.push(pattern);
    return regExpNew;
  }
}
var chars = [" ", ",", "?", "!", ";"];
var looksLikeObjectPathRegExpCache = new RegExpCache(20);
var looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
  nsSeparator = nsSeparator || "";
  keySeparator = keySeparator || "";
  const possibleChars = chars.filter((c) => nsSeparator.indexOf(c) < 0 && keySeparator.indexOf(c) < 0);
  if (possibleChars.length === 0)
    return true;
  const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
  let matched = !r.test(key);
  if (!matched) {
    const ki = key.indexOf(keySeparator);
    if (ki > 0 && !r.test(key.substring(0, ki))) {
      matched = true;
    }
  }
  return matched;
};
var deepFind = function(obj, path) {
  let keySeparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ".";
  if (!obj)
    return;
  if (obj[path]) {
    if (!Object.prototype.hasOwnProperty.call(obj, path))
      return;
    return obj[path];
  }
  const tokens = path.split(keySeparator);
  let current = obj;
  for (let i = 0;i < tokens.length; ) {
    if (!current || typeof current !== "object") {
      return;
    }
    let next;
    let nextPath = "";
    for (let j = i;j < tokens.length; ++j) {
      if (j !== i) {
        nextPath += keySeparator;
      }
      nextPath += tokens[j];
      next = current[nextPath];
      if (next !== undefined) {
        if (["string", "number", "boolean"].indexOf(typeof next) > -1 && j < tokens.length - 1) {
          continue;
        }
        i += j - i + 1;
        break;
      }
    }
    current = next;
  }
  return current;
};
var getCleanedCode = (code) => code?.replace("_", "-");
var consoleLogger = {
  type: "logger",
  log(args) {
    this.output("log", args);
  },
  warn(args) {
    this.output("warn", args);
  },
  error(args) {
    this.output("error", args);
  },
  output(type, args) {
    console?.[type]?.apply?.(console, args);
  }
};

class Logger {
  constructor(concreteLogger) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.init(concreteLogger, options);
  }
  init(concreteLogger) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.prefix = options.prefix || "i18next:";
    this.logger = concreteLogger || consoleLogger;
    this.options = options;
    this.debug = options.debug;
  }
  log() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return this.forward(args, "log", "", true);
  }
  warn() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;_key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    return this.forward(args, "warn", "", true);
  }
  error() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;_key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    return this.forward(args, "error", "");
  }
  deprecate() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0;_key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
  }
  forward(args, lvl, prefix, debugOnly) {
    if (debugOnly && !this.debug)
      return null;
    if (isString(args[0]))
      args[0] = `${prefix}${this.prefix} ${args[0]}`;
    return this.logger[lvl](args);
  }
  create(moduleName) {
    return new Logger(this.logger, {
      ...{
        prefix: `${this.prefix}:${moduleName}:`
      },
      ...this.options
    });
  }
  clone(options) {
    options = options || this.options;
    options.prefix = options.prefix || this.prefix;
    return new Logger(this.logger, options);
  }
}
var baseLogger = new Logger;

class EventEmitter {
  constructor() {
    this.observers = {};
  }
  on(events, listener) {
    events.split(" ").forEach((event) => {
      if (!this.observers[event])
        this.observers[event] = new Map;
      const numListeners = this.observers[event].get(listener) || 0;
      this.observers[event].set(listener, numListeners + 1);
    });
    return this;
  }
  off(event, listener) {
    if (!this.observers[event])
      return;
    if (!listener) {
      delete this.observers[event];
      return;
    }
    this.observers[event].delete(listener);
  }
  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (this.observers[event]) {
      const cloned = Array.from(this.observers[event].entries());
      cloned.forEach((_ref) => {
        let [observer, numTimesAdded] = _ref;
        for (let i = 0;i < numTimesAdded; i++) {
          observer(...args);
        }
      });
    }
    if (this.observers["*"]) {
      const cloned = Array.from(this.observers["*"].entries());
      cloned.forEach((_ref2) => {
        let [observer, numTimesAdded] = _ref2;
        for (let i = 0;i < numTimesAdded; i++) {
          observer.apply(observer, [event, ...args]);
        }
      });
    }
  }
}

class ResourceStore extends EventEmitter {
  constructor(data) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      ns: ["translation"],
      defaultNS: "translation"
    };
    super();
    this.data = data || {};
    this.options = options;
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = ".";
    }
    if (this.options.ignoreJSONStructure === undefined) {
      this.options.ignoreJSONStructure = true;
    }
  }
  addNamespaces(ns) {
    if (this.options.ns.indexOf(ns) < 0) {
      this.options.ns.push(ns);
    }
  }
  removeNamespaces(ns) {
    const index = this.options.ns.indexOf(ns);
    if (index > -1) {
      this.options.ns.splice(index, 1);
    }
  }
  getResource(lng, ns, key) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    const ignoreJSONStructure = options.ignoreJSONStructure !== undefined ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
    let path;
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
    } else {
      path = [lng, ns];
      if (key) {
        if (Array.isArray(key)) {
          path.push(...key);
        } else if (isString(key) && keySeparator) {
          path.push(...key.split(keySeparator));
        } else {
          path.push(key);
        }
      }
    }
    const result = getPath(this.data, path);
    if (!result && !ns && !key && lng.indexOf(".") > -1) {
      lng = path[0];
      ns = path[1];
      key = path.slice(2).join(".");
    }
    if (result || !ignoreJSONStructure || !isString(key))
      return result;
    return deepFind(this.data?.[lng]?.[ns], key, keySeparator);
  }
  addResource(lng, ns, key, value) {
    let options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
      silent: false
    };
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    let path = [lng, ns];
    if (key)
      path = path.concat(keySeparator ? key.split(keySeparator) : key);
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      value = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    setPath(this.data, path, value);
    if (!options.silent)
      this.emit("added", lng, ns, key, value);
  }
  addResources(lng, ns, resources) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      silent: false
    };
    for (const m in resources) {
      if (isString(resources[m]) || Array.isArray(resources[m]))
        this.addResource(lng, ns, m, resources[m], {
          silent: true
        });
    }
    if (!options.silent)
      this.emit("added", lng, ns, resources);
  }
  addResourceBundle(lng, ns, resources, deep, overwrite) {
    let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
      silent: false,
      skipCopy: false
    };
    let path = [lng, ns];
    if (lng.indexOf(".") > -1) {
      path = lng.split(".");
      deep = resources;
      resources = ns;
      ns = path[1];
    }
    this.addNamespaces(ns);
    let pack = getPath(this.data, path) || {};
    if (!options.skipCopy)
      resources = JSON.parse(JSON.stringify(resources));
    if (deep) {
      deepExtend(pack, resources, overwrite);
    } else {
      pack = {
        ...pack,
        ...resources
      };
    }
    setPath(this.data, path, pack);
    if (!options.silent)
      this.emit("added", lng, ns, resources);
  }
  removeResourceBundle(lng, ns) {
    if (this.hasResourceBundle(lng, ns)) {
      delete this.data[lng][ns];
    }
    this.removeNamespaces(ns);
    this.emit("removed", lng, ns);
  }
  hasResourceBundle(lng, ns) {
    return this.getResource(lng, ns) !== undefined;
  }
  getResourceBundle(lng, ns) {
    if (!ns)
      ns = this.options.defaultNS;
    return this.getResource(lng, ns);
  }
  getDataByLanguage(lng) {
    return this.data[lng];
  }
  hasLanguageSomeTranslations(lng) {
    const data = this.getDataByLanguage(lng);
    const n = data && Object.keys(data) || [];
    return !!n.find((v) => data[v] && Object.keys(data[v]).length > 0);
  }
  toJSON() {
    return this.data;
  }
}
var postProcessor = {
  processors: {},
  addPostProcessor(module) {
    this.processors[module.name] = module;
  },
  handle(processors, value, key, options, translator) {
    processors.forEach((processor) => {
      value = this.processors[processor]?.process(value, key, options, translator) ?? value;
    });
    return value;
  }
};
var checkedLoadedFor = {};
var shouldHandleAsObject = (res) => !isString(res) && typeof res !== "boolean" && typeof res !== "number";

class Translator extends EventEmitter {
  constructor(services) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super();
    copy(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], services, this);
    this.options = options;
    if (this.options.keySeparator === undefined) {
      this.options.keySeparator = ".";
    }
    this.logger = baseLogger.create("translator");
  }
  changeLanguage(lng) {
    if (lng)
      this.language = lng;
  }
  exists(key) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      interpolation: {}
    };
    if (key == null) {
      return false;
    }
    const resolved = this.resolve(key, options);
    return resolved?.res !== undefined;
  }
  extractFromKey(key, options) {
    let nsSeparator = options.nsSeparator !== undefined ? options.nsSeparator : this.options.nsSeparator;
    if (nsSeparator === undefined)
      nsSeparator = ":";
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    let namespaces = options.ns || this.options.defaultNS || [];
    const wouldCheckForNsInKey = nsSeparator && key.indexOf(nsSeparator) > -1;
    const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !options.keySeparator && !this.options.userDefinedNsSeparator && !options.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
    if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
      const m = key.match(this.interpolator.nestingRegexp);
      if (m && m.length > 0) {
        return {
          key,
          namespaces: isString(namespaces) ? [namespaces] : namespaces
        };
      }
      const parts = key.split(nsSeparator);
      if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1)
        namespaces = parts.shift();
      key = parts.join(keySeparator);
    }
    return {
      key,
      namespaces: isString(namespaces) ? [namespaces] : namespaces
    };
  }
  translate(keys, options, lastKey) {
    if (typeof options !== "object" && this.options.overloadTranslationOptionHandler) {
      options = this.options.overloadTranslationOptionHandler(arguments);
    }
    if (typeof options === "object")
      options = {
        ...options
      };
    if (!options)
      options = {};
    if (keys == null)
      return "";
    if (!Array.isArray(keys))
      keys = [String(keys)];
    const returnDetails = options.returnDetails !== undefined ? options.returnDetails : this.options.returnDetails;
    const keySeparator = options.keySeparator !== undefined ? options.keySeparator : this.options.keySeparator;
    const {
      key,
      namespaces
    } = this.extractFromKey(keys[keys.length - 1], options);
    const namespace = namespaces[namespaces.length - 1];
    const lng = options.lng || this.language;
    const appendNamespaceToCIMode = options.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
    if (lng?.toLowerCase() === "cimode") {
      if (appendNamespaceToCIMode) {
        const nsSeparator = options.nsSeparator || this.options.nsSeparator;
        if (returnDetails) {
          return {
            res: `${namespace}${nsSeparator}${key}`,
            usedKey: key,
            exactUsedKey: key,
            usedLng: lng,
            usedNS: namespace,
            usedParams: this.getUsedParamsDetails(options)
          };
        }
        return `${namespace}${nsSeparator}${key}`;
      }
      if (returnDetails) {
        return {
          res: key,
          usedKey: key,
          exactUsedKey: key,
          usedLng: lng,
          usedNS: namespace,
          usedParams: this.getUsedParamsDetails(options)
        };
      }
      return key;
    }
    const resolved = this.resolve(keys, options);
    let res = resolved?.res;
    const resUsedKey = resolved?.usedKey || key;
    const resExactUsedKey = resolved?.exactUsedKey || key;
    const noObject = ["[object Number]", "[object Function]", "[object RegExp]"];
    const joinArrays = options.joinArrays !== undefined ? options.joinArrays : this.options.joinArrays;
    const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
    const needsPluralHandling = options.count !== undefined && !isString(options.count);
    const hasDefaultValue = Translator.hasDefaultValue(options);
    const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, options.count, options) : "";
    const defaultValueSuffixOrdinalFallback = options.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, options.count, {
      ordinal: false
    }) : "";
    const needsZeroSuffixLookup = needsPluralHandling && !options.ordinal && options.count === 0;
    const defaultValue = needsZeroSuffixLookup && options[`defaultValue${this.options.pluralSeparator}zero`] || options[`defaultValue${defaultValueSuffix}`] || options[`defaultValue${defaultValueSuffixOrdinalFallback}`] || options.defaultValue;
    let resForObjHndl = res;
    if (handleAsObjectInI18nFormat && !res && hasDefaultValue) {
      resForObjHndl = defaultValue;
    }
    const handleAsObject = shouldHandleAsObject(resForObjHndl);
    const resType = Object.prototype.toString.apply(resForObjHndl);
    if (handleAsObjectInI18nFormat && resForObjHndl && handleAsObject && noObject.indexOf(resType) < 0 && !(isString(joinArrays) && Array.isArray(resForObjHndl))) {
      if (!options.returnObjects && !this.options.returnObjects) {
        if (!this.options.returnedObjectHandler) {
          this.logger.warn("accessing an object - but returnObjects options is not enabled!");
        }
        const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, resForObjHndl, {
          ...options,
          ns: namespaces
        }) : `key '${key} (${this.language})' returned an object instead of string.`;
        if (returnDetails) {
          resolved.res = r;
          resolved.usedParams = this.getUsedParamsDetails(options);
          return resolved;
        }
        return r;
      }
      if (keySeparator) {
        const resTypeIsArray = Array.isArray(resForObjHndl);
        const copy2 = resTypeIsArray ? [] : {};
        const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
        for (const m in resForObjHndl) {
          if (Object.prototype.hasOwnProperty.call(resForObjHndl, m)) {
            const deepKey = `${newKeyToUse}${keySeparator}${m}`;
            if (hasDefaultValue && !res) {
              copy2[m] = this.translate(deepKey, {
                ...options,
                defaultValue: shouldHandleAsObject(defaultValue) ? defaultValue[m] : undefined,
                ...{
                  joinArrays: false,
                  ns: namespaces
                }
              });
            } else {
              copy2[m] = this.translate(deepKey, {
                ...options,
                ...{
                  joinArrays: false,
                  ns: namespaces
                }
              });
            }
            if (copy2[m] === deepKey)
              copy2[m] = resForObjHndl[m];
          }
        }
        res = copy2;
      }
    } else if (handleAsObjectInI18nFormat && isString(joinArrays) && Array.isArray(res)) {
      res = res.join(joinArrays);
      if (res)
        res = this.extendTranslation(res, keys, options, lastKey);
    } else {
      let usedDefault = false;
      let usedKey = false;
      if (!this.isValidLookup(res) && hasDefaultValue) {
        usedDefault = true;
        res = defaultValue;
      }
      if (!this.isValidLookup(res)) {
        usedKey = true;
        res = key;
      }
      const missingKeyNoValueFallbackToKey = options.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey;
      const resForMissing = missingKeyNoValueFallbackToKey && usedKey ? undefined : res;
      const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
      if (usedKey || usedDefault || updateMissing) {
        this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, key, updateMissing ? defaultValue : res);
        if (keySeparator) {
          const fk = this.resolve(key, {
            ...options,
            keySeparator: false
          });
          if (fk && fk.res)
            this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
        }
        let lngs = [];
        const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, options.lng || this.language);
        if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) {
          for (let i = 0;i < fallbackLngs.length; i++) {
            lngs.push(fallbackLngs[i]);
          }
        } else if (this.options.saveMissingTo === "all") {
          lngs = this.languageUtils.toResolveHierarchy(options.lng || this.language);
        } else {
          lngs.push(options.lng || this.language);
        }
        const send = (l, k, specificDefaultValue) => {
          const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
          if (this.options.missingKeyHandler) {
            this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, options);
          } else if (this.backendConnector?.saveMissing) {
            this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, options);
          }
          this.emit("missingKey", l, namespace, k, res);
        };
        if (this.options.saveMissing) {
          if (this.options.saveMissingPlurals && needsPluralHandling) {
            lngs.forEach((language) => {
              const suffixes = this.pluralResolver.getSuffixes(language, options);
              if (needsZeroSuffixLookup && options[`defaultValue${this.options.pluralSeparator}zero`] && suffixes.indexOf(`${this.options.pluralSeparator}zero`) < 0) {
                suffixes.push(`${this.options.pluralSeparator}zero`);
              }
              suffixes.forEach((suffix) => {
                send([language], key + suffix, options[`defaultValue${suffix}`] || defaultValue);
              });
            });
          } else {
            send(lngs, key, defaultValue);
          }
        }
      }
      res = this.extendTranslation(res, keys, options, resolved, lastKey);
      if (usedKey && res === key && this.options.appendNamespaceToMissingKey)
        res = `${namespace}:${key}`;
      if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) {
        res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}:${key}` : key, usedDefault ? res : undefined);
      }
    }
    if (returnDetails) {
      resolved.res = res;
      resolved.usedParams = this.getUsedParamsDetails(options);
      return resolved;
    }
    return res;
  }
  extendTranslation(res, key, options, resolved, lastKey) {
    var _this = this;
    if (this.i18nFormat?.parse) {
      res = this.i18nFormat.parse(res, {
        ...this.options.interpolation.defaultVariables,
        ...options
      }, options.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, {
        resolved
      });
    } else if (!options.skipInterpolation) {
      if (options.interpolation)
        this.interpolator.init({
          ...options,
          ...{
            interpolation: {
              ...this.options.interpolation,
              ...options.interpolation
            }
          }
        });
      const skipOnVariables = isString(res) && (options?.interpolation?.skipOnVariables !== undefined ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
      let nestBef;
      if (skipOnVariables) {
        const nb = res.match(this.interpolator.nestingRegexp);
        nestBef = nb && nb.length;
      }
      let data = options.replace && !isString(options.replace) ? options.replace : options;
      if (this.options.interpolation.defaultVariables)
        data = {
          ...this.options.interpolation.defaultVariables,
          ...data
        };
      res = this.interpolator.interpolate(res, data, options.lng || this.language || resolved.usedLng, options);
      if (skipOnVariables) {
        const na = res.match(this.interpolator.nestingRegexp);
        const nestAft = na && na.length;
        if (nestBef < nestAft)
          options.nest = false;
      }
      if (!options.lng && resolved && resolved.res)
        options.lng = this.language || resolved.usedLng;
      if (options.nest !== false)
        res = this.interpolator.nest(res, function() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          if (lastKey?.[0] === args[0] && !options.context) {
            _this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
            return null;
          }
          return _this.translate(...args, key);
        }, options);
      if (options.interpolation)
        this.interpolator.reset();
    }
    const postProcess = options.postProcess || this.options.postProcess;
    const postProcessorNames = isString(postProcess) ? [postProcess] : postProcess;
    if (res != null && postProcessorNames?.length && options.applyPostProcessor !== false) {
      res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
        i18nResolved: {
          ...resolved,
          usedParams: this.getUsedParamsDetails(options)
        },
        ...options
      } : options, this);
    }
    return res;
  }
  resolve(keys) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let found;
    let usedKey;
    let exactUsedKey;
    let usedLng;
    let usedNS;
    if (isString(keys))
      keys = [keys];
    keys.forEach((k) => {
      if (this.isValidLookup(found))
        return;
      const extracted = this.extractFromKey(k, options);
      const key = extracted.key;
      usedKey = key;
      let namespaces = extracted.namespaces;
      if (this.options.fallbackNS)
        namespaces = namespaces.concat(this.options.fallbackNS);
      const needsPluralHandling = options.count !== undefined && !isString(options.count);
      const needsZeroSuffixLookup = needsPluralHandling && !options.ordinal && options.count === 0;
      const needsContextHandling = options.context !== undefined && (isString(options.context) || typeof options.context === "number") && options.context !== "";
      const codes = options.lngs ? options.lngs : this.languageUtils.toResolveHierarchy(options.lng || this.language, options.fallbackLng);
      namespaces.forEach((ns) => {
        if (this.isValidLookup(found))
          return;
        usedNS = ns;
        if (!checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(usedNS)) {
          checkedLoadedFor[`${codes[0]}-${ns}`] = true;
          this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
        }
        codes.forEach((code) => {
          if (this.isValidLookup(found))
            return;
          usedLng = code;
          const finalKeys = [key];
          if (this.i18nFormat?.addLookupKeys) {
            this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, options);
          } else {
            let pluralSuffix;
            if (needsPluralHandling)
              pluralSuffix = this.pluralResolver.getSuffix(code, options.count, options);
            const zeroSuffix = `${this.options.pluralSeparator}zero`;
            const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
            if (needsPluralHandling) {
              finalKeys.push(key + pluralSuffix);
              if (options.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
              }
              if (needsZeroSuffixLookup) {
                finalKeys.push(key + zeroSuffix);
              }
            }
            if (needsContextHandling) {
              const contextKey = `${key}${this.options.contextSeparator}${options.context}`;
              finalKeys.push(contextKey);
              if (needsPluralHandling) {
                finalKeys.push(contextKey + pluralSuffix);
                if (options.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                  finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                }
                if (needsZeroSuffixLookup) {
                  finalKeys.push(contextKey + zeroSuffix);
                }
              }
            }
          }
          let possibleKey;
          while (possibleKey = finalKeys.pop()) {
            if (!this.isValidLookup(found)) {
              exactUsedKey = possibleKey;
              found = this.getResource(code, ns, possibleKey, options);
            }
          }
        });
      });
    });
    return {
      res: found,
      usedKey,
      exactUsedKey,
      usedLng,
      usedNS
    };
  }
  isValidLookup(res) {
    return res !== undefined && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
  }
  getResource(code, ns, key) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    if (this.i18nFormat?.getResource)
      return this.i18nFormat.getResource(code, ns, key, options);
    return this.resourceStore.getResource(code, ns, key, options);
  }
  getUsedParamsDetails() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const optionsKeys = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"];
    const useOptionsReplaceForData = options.replace && !isString(options.replace);
    let data = useOptionsReplaceForData ? options.replace : options;
    if (useOptionsReplaceForData && typeof options.count !== "undefined") {
      data.count = options.count;
    }
    if (this.options.interpolation.defaultVariables) {
      data = {
        ...this.options.interpolation.defaultVariables,
        ...data
      };
    }
    if (!useOptionsReplaceForData) {
      data = {
        ...data
      };
      for (const key of optionsKeys) {
        delete data[key];
      }
    }
    return data;
  }
  static hasDefaultValue(options) {
    const prefix = "defaultValue";
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option) && prefix === option.substring(0, prefix.length) && options[option] !== undefined) {
        return true;
      }
    }
    return false;
  }
}

class LanguageUtil {
  constructor(options) {
    this.options = options;
    this.supportedLngs = this.options.supportedLngs || false;
    this.logger = baseLogger.create("languageUtils");
  }
  getScriptPartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0)
      return null;
    const p = code.split("-");
    if (p.length === 2)
      return null;
    p.pop();
    if (p[p.length - 1].toLowerCase() === "x")
      return null;
    return this.formatLanguageCode(p.join("-"));
  }
  getLanguagePartFromCode(code) {
    code = getCleanedCode(code);
    if (!code || code.indexOf("-") < 0)
      return code;
    const p = code.split("-");
    return this.formatLanguageCode(p[0]);
  }
  formatLanguageCode(code) {
    if (isString(code) && code.indexOf("-") > -1) {
      let formattedCode;
      try {
        formattedCode = Intl.getCanonicalLocales(code)[0];
      } catch (e) {}
      if (formattedCode && this.options.lowerCaseLng) {
        formattedCode = formattedCode.toLowerCase();
      }
      if (formattedCode)
        return formattedCode;
      if (this.options.lowerCaseLng) {
        return code.toLowerCase();
      }
      return code;
    }
    return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
  }
  isSupportedCode(code) {
    if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) {
      code = this.getLanguagePartFromCode(code);
    }
    return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1;
  }
  getBestMatchFromCodes(codes) {
    if (!codes)
      return null;
    let found;
    codes.forEach((code) => {
      if (found)
        return;
      const cleanedLng = this.formatLanguageCode(code);
      if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng))
        found = cleanedLng;
    });
    if (!found && this.options.supportedLngs) {
      codes.forEach((code) => {
        if (found)
          return;
        const lngOnly = this.getLanguagePartFromCode(code);
        if (this.isSupportedCode(lngOnly))
          return found = lngOnly;
        found = this.options.supportedLngs.find((supportedLng) => {
          if (supportedLng === lngOnly)
            return supportedLng;
          if (supportedLng.indexOf("-") < 0 && lngOnly.indexOf("-") < 0)
            return;
          if (supportedLng.indexOf("-") > 0 && lngOnly.indexOf("-") < 0 && supportedLng.substring(0, supportedLng.indexOf("-")) === lngOnly)
            return supportedLng;
          if (supportedLng.indexOf(lngOnly) === 0 && lngOnly.length > 1)
            return supportedLng;
        });
      });
    }
    if (!found)
      found = this.getFallbackCodes(this.options.fallbackLng)[0];
    return found;
  }
  getFallbackCodes(fallbacks, code) {
    if (!fallbacks)
      return [];
    if (typeof fallbacks === "function")
      fallbacks = fallbacks(code);
    if (isString(fallbacks))
      fallbacks = [fallbacks];
    if (Array.isArray(fallbacks))
      return fallbacks;
    if (!code)
      return fallbacks.default || [];
    let found = fallbacks[code];
    if (!found)
      found = fallbacks[this.getScriptPartFromCode(code)];
    if (!found)
      found = fallbacks[this.formatLanguageCode(code)];
    if (!found)
      found = fallbacks[this.getLanguagePartFromCode(code)];
    if (!found)
      found = fallbacks.default;
    return found || [];
  }
  toResolveHierarchy(code, fallbackCode) {
    const fallbackCodes = this.getFallbackCodes(fallbackCode || this.options.fallbackLng || [], code);
    const codes = [];
    const addCode = (c) => {
      if (!c)
        return;
      if (this.isSupportedCode(c)) {
        codes.push(c);
      } else {
        this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
      }
    };
    if (isString(code) && (code.indexOf("-") > -1 || code.indexOf("_") > -1)) {
      if (this.options.load !== "languageOnly")
        addCode(this.formatLanguageCode(code));
      if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly")
        addCode(this.getScriptPartFromCode(code));
      if (this.options.load !== "currentOnly")
        addCode(this.getLanguagePartFromCode(code));
    } else if (isString(code)) {
      addCode(this.formatLanguageCode(code));
    }
    fallbackCodes.forEach((fc) => {
      if (codes.indexOf(fc) < 0)
        addCode(this.formatLanguageCode(fc));
    });
    return codes;
  }
}
var suffixesOrder = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5
};
var dummyRule = {
  select: (count) => count === 1 ? "one" : "other",
  resolvedOptions: () => ({
    pluralCategories: ["one", "other"]
  })
};

class PluralResolver {
  constructor(languageUtils) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.languageUtils = languageUtils;
    this.options = options;
    this.logger = baseLogger.create("pluralResolver");
    this.pluralRulesCache = {};
  }
  addRule(lng, obj) {
    this.rules[lng] = obj;
  }
  clearCache() {
    this.pluralRulesCache = {};
  }
  getRule(code) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
    const type = options.ordinal ? "ordinal" : "cardinal";
    const cacheKey = JSON.stringify({
      cleanedCode,
      type
    });
    if (cacheKey in this.pluralRulesCache) {
      return this.pluralRulesCache[cacheKey];
    }
    let rule;
    try {
      rule = new Intl.PluralRules(cleanedCode, {
        type
      });
    } catch (err) {
      if (!Intl) {
        this.logger.error("No Intl support, please use an Intl polyfill!");
        return dummyRule;
      }
      if (!code.match(/-|_/))
        return dummyRule;
      const lngPart = this.languageUtils.getLanguagePartFromCode(code);
      rule = this.getRule(lngPart, options);
    }
    this.pluralRulesCache[cacheKey] = rule;
    return rule;
  }
  needsPlural(code) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let rule = this.getRule(code, options);
    if (!rule)
      rule = this.getRule("dev", options);
    return rule?.resolvedOptions().pluralCategories.length > 1;
  }
  getPluralFormsOfKey(code, key) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
  }
  getSuffixes(code) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let rule = this.getRule(code, options);
    if (!rule)
      rule = this.getRule("dev", options);
    if (!rule)
      return [];
    return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
  }
  getSuffix(code, count) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const rule = this.getRule(code, options);
    if (rule) {
      return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
    }
    this.logger.warn(`no plural rule found for: ${code}`);
    return this.getSuffix("dev", count, options);
  }
}
var deepFindWithDefaults = function(data, defaultData, key) {
  let keySeparator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ".";
  let ignoreJSONStructure = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  let path = getPathWithDefaults(data, defaultData, key);
  if (!path && ignoreJSONStructure && isString(key)) {
    path = deepFind(data, key, keySeparator);
    if (path === undefined)
      path = deepFind(defaultData, key, keySeparator);
  }
  return path;
};
var regexSafe = (val) => val.replace(/\$/g, "$$$$");

class Interpolator {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.logger = baseLogger.create("interpolator");
    this.options = options;
    this.format = options?.interpolation?.format || ((value) => value);
    this.init(options);
  }
  init() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (!options.interpolation)
      options.interpolation = {
        escapeValue: true
      };
    const {
      escape: escape$1,
      escapeValue,
      useRawValueToEscape,
      prefix,
      prefixEscaped,
      suffix,
      suffixEscaped,
      formatSeparator,
      unescapeSuffix,
      unescapePrefix,
      nestingPrefix,
      nestingPrefixEscaped,
      nestingSuffix,
      nestingSuffixEscaped,
      nestingOptionsSeparator,
      maxReplaces,
      alwaysFormat
    } = options.interpolation;
    this.escape = escape$1 !== undefined ? escape$1 : escape;
    this.escapeValue = escapeValue !== undefined ? escapeValue : true;
    this.useRawValueToEscape = useRawValueToEscape !== undefined ? useRawValueToEscape : false;
    this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
    this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
    this.formatSeparator = formatSeparator || ",";
    this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix || "-";
    this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix || "";
    this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
    this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
    this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
    this.maxReplaces = maxReplaces || 1000;
    this.alwaysFormat = alwaysFormat !== undefined ? alwaysFormat : false;
    this.resetRegExp();
  }
  reset() {
    if (this.options)
      this.init(this.options);
  }
  resetRegExp() {
    const getOrResetRegExp = (existingRegExp, pattern) => {
      if (existingRegExp?.source === pattern) {
        existingRegExp.lastIndex = 0;
        return existingRegExp;
      }
      return new RegExp(pattern, "g");
    };
    this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
    this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
    this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}(.+?)${this.nestingSuffix}`);
  }
  interpolate(str, data, lng, options) {
    let match;
    let value;
    let replaces;
    const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
    const handleFormat = (key) => {
      if (key.indexOf(this.formatSeparator) < 0) {
        const path = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
        return this.alwaysFormat ? this.format(path, undefined, lng, {
          ...options,
          ...data,
          interpolationkey: key
        }) : path;
      }
      const p = key.split(this.formatSeparator);
      const k = p.shift().trim();
      const f = p.join(this.formatSeparator).trim();
      return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
        ...options,
        ...data,
        interpolationkey: k
      });
    };
    this.resetRegExp();
    const missingInterpolationHandler = options?.missingInterpolationHandler || this.options.missingInterpolationHandler;
    const skipOnVariables = options?.interpolation?.skipOnVariables !== undefined ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
    const todos = [{
      regex: this.regexpUnescape,
      safeValue: (val) => regexSafe(val)
    }, {
      regex: this.regexp,
      safeValue: (val) => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
    }];
    todos.forEach((todo) => {
      replaces = 0;
      while (match = todo.regex.exec(str)) {
        const matchedVar = match[1].trim();
        value = handleFormat(matchedVar);
        if (value === undefined) {
          if (typeof missingInterpolationHandler === "function") {
            const temp = missingInterpolationHandler(str, match, options);
            value = isString(temp) ? temp : "";
          } else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) {
            value = "";
          } else if (skipOnVariables) {
            value = match[0];
            continue;
          } else {
            this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
            value = "";
          }
        } else if (!isString(value) && !this.useRawValueToEscape) {
          value = makeString(value);
        }
        const safeValue = todo.safeValue(value);
        str = str.replace(match[0], safeValue);
        if (skipOnVariables) {
          todo.regex.lastIndex += value.length;
          todo.regex.lastIndex -= match[0].length;
        } else {
          todo.regex.lastIndex = 0;
        }
        replaces++;
        if (replaces >= this.maxReplaces) {
          break;
        }
      }
    });
    return str;
  }
  nest(str, fc) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let match;
    let value;
    let clonedOptions;
    const handleHasOptions = (key, inheritedOptions) => {
      const sep = this.nestingOptionsSeparator;
      if (key.indexOf(sep) < 0)
        return key;
      const c = key.split(new RegExp(`${sep}[ ]*{`));
      let optionsString = `{${c[1]}`;
      key = c[0];
      optionsString = this.interpolate(optionsString, clonedOptions);
      const matchedSingleQuotes = optionsString.match(/'/g);
      const matchedDoubleQuotes = optionsString.match(/"/g);
      if ((matchedSingleQuotes?.length ?? 0) % 2 === 0 && !matchedDoubleQuotes || matchedDoubleQuotes.length % 2 !== 0) {
        optionsString = optionsString.replace(/'/g, '"');
      }
      try {
        clonedOptions = JSON.parse(optionsString);
        if (inheritedOptions)
          clonedOptions = {
            ...inheritedOptions,
            ...clonedOptions
          };
      } catch (e) {
        this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
        return `${key}${sep}${optionsString}`;
      }
      if (clonedOptions.defaultValue && clonedOptions.defaultValue.indexOf(this.prefix) > -1)
        delete clonedOptions.defaultValue;
      return key;
    };
    while (match = this.nestingRegexp.exec(str)) {
      let formatters = [];
      clonedOptions = {
        ...options
      };
      clonedOptions = clonedOptions.replace && !isString(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
      clonedOptions.applyPostProcessor = false;
      delete clonedOptions.defaultValue;
      let doReduce = false;
      if (match[0].indexOf(this.formatSeparator) !== -1 && !/{.*}/.test(match[1])) {
        const r = match[1].split(this.formatSeparator).map((elem) => elem.trim());
        match[1] = r.shift();
        formatters = r;
        doReduce = true;
      }
      value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
      if (value && match[0] === str && !isString(value))
        return value;
      if (!isString(value))
        value = makeString(value);
      if (!value) {
        this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
        value = "";
      }
      if (doReduce) {
        value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
          ...options,
          interpolationkey: match[1].trim()
        }), value.trim());
      }
      str = str.replace(match[0], value);
      this.regexp.lastIndex = 0;
    }
    return str;
  }
}
var parseFormatStr = (formatStr) => {
  let formatName = formatStr.toLowerCase().trim();
  const formatOptions = {};
  if (formatStr.indexOf("(") > -1) {
    const p = formatStr.split("(");
    formatName = p[0].toLowerCase().trim();
    const optStr = p[1].substring(0, p[1].length - 1);
    if (formatName === "currency" && optStr.indexOf(":") < 0) {
      if (!formatOptions.currency)
        formatOptions.currency = optStr.trim();
    } else if (formatName === "relativetime" && optStr.indexOf(":") < 0) {
      if (!formatOptions.range)
        formatOptions.range = optStr.trim();
    } else {
      const opts = optStr.split(";");
      opts.forEach((opt) => {
        if (opt) {
          const [key, ...rest] = opt.split(":");
          const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
          const trimmedKey = key.trim();
          if (!formatOptions[trimmedKey])
            formatOptions[trimmedKey] = val;
          if (val === "false")
            formatOptions[trimmedKey] = false;
          if (val === "true")
            formatOptions[trimmedKey] = true;
          if (!isNaN(val))
            formatOptions[trimmedKey] = parseInt(val, 10);
        }
      });
    }
  }
  return {
    formatName,
    formatOptions
  };
};
var createCachedFormatter = (fn) => {
  const cache = {};
  return (val, lng, options) => {
    let optForCache = options;
    if (options && options.interpolationkey && options.formatParams && options.formatParams[options.interpolationkey] && options[options.interpolationkey]) {
      optForCache = {
        ...optForCache,
        [options.interpolationkey]: undefined
      };
    }
    const key = lng + JSON.stringify(optForCache);
    let formatter = cache[key];
    if (!formatter) {
      formatter = fn(getCleanedCode(lng), options);
      cache[key] = formatter;
    }
    return formatter(val);
  };
};

class Formatter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.logger = baseLogger.create("formatter");
    this.options = options;
    this.formats = {
      number: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      currency: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.NumberFormat(lng, {
          ...opt,
          style: "currency"
        });
        return (val) => formatter.format(val);
      }),
      datetime: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.DateTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      }),
      relativetime: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.RelativeTimeFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val, opt.range || "day");
      }),
      list: createCachedFormatter((lng, opt) => {
        const formatter = new Intl.ListFormat(lng, {
          ...opt
        });
        return (val) => formatter.format(val);
      })
    };
    this.init(options);
  }
  init(services) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      interpolation: {}
    };
    this.formatSeparator = options.interpolation.formatSeparator || ",";
  }
  add(name, fc) {
    this.formats[name.toLowerCase().trim()] = fc;
  }
  addCached(name, fc) {
    this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
  }
  format(value, format, lng) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    const formats = format.split(this.formatSeparator);
    if (formats.length > 1 && formats[0].indexOf("(") > 1 && formats[0].indexOf(")") < 0 && formats.find((f) => f.indexOf(")") > -1)) {
      const lastIndex = formats.findIndex((f) => f.indexOf(")") > -1);
      formats[0] = [formats[0], ...formats.splice(1, lastIndex)].join(this.formatSeparator);
    }
    const result = formats.reduce((mem, f) => {
      const {
        formatName,
        formatOptions
      } = parseFormatStr(f);
      if (this.formats[formatName]) {
        let formatted = mem;
        try {
          const valOptions = options?.formatParams?.[options.interpolationkey] || {};
          const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
          formatted = this.formats[formatName](mem, l, {
            ...formatOptions,
            ...options,
            ...valOptions
          });
        } catch (error) {
          this.logger.warn(error);
        }
        return formatted;
      } else {
        this.logger.warn(`there was no format function for ${formatName}`);
      }
      return mem;
    }, value);
    return result;
  }
}
var removePending = (q, name) => {
  if (q.pending[name] !== undefined) {
    delete q.pending[name];
    q.pendingCount--;
  }
};

class Connector extends EventEmitter {
  constructor(backend, store, services) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    super();
    this.backend = backend;
    this.store = store;
    this.services = services;
    this.languageUtils = services.languageUtils;
    this.options = options;
    this.logger = baseLogger.create("backendConnector");
    this.waitingReads = [];
    this.maxParallelReads = options.maxParallelReads || 10;
    this.readingCalls = 0;
    this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
    this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
    this.state = {};
    this.queue = [];
    this.backend?.init?.(services, options.backend, options);
  }
  queueLoad(languages, namespaces, options, callback) {
    const toLoad = {};
    const pending = {};
    const toLoadLanguages = {};
    const toLoadNamespaces = {};
    languages.forEach((lng) => {
      let hasAllNamespaces = true;
      namespaces.forEach((ns) => {
        const name = `${lng}|${ns}`;
        if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
          this.state[name] = 2;
        } else if (this.state[name] < 0)
          ;
        else if (this.state[name] === 1) {
          if (pending[name] === undefined)
            pending[name] = true;
        } else {
          this.state[name] = 1;
          hasAllNamespaces = false;
          if (pending[name] === undefined)
            pending[name] = true;
          if (toLoad[name] === undefined)
            toLoad[name] = true;
          if (toLoadNamespaces[ns] === undefined)
            toLoadNamespaces[ns] = true;
        }
      });
      if (!hasAllNamespaces)
        toLoadLanguages[lng] = true;
    });
    if (Object.keys(toLoad).length || Object.keys(pending).length) {
      this.queue.push({
        pending,
        pendingCount: Object.keys(pending).length,
        loaded: {},
        errors: [],
        callback
      });
    }
    return {
      toLoad: Object.keys(toLoad),
      pending: Object.keys(pending),
      toLoadLanguages: Object.keys(toLoadLanguages),
      toLoadNamespaces: Object.keys(toLoadNamespaces)
    };
  }
  loaded(name, err, data) {
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    if (err)
      this.emit("failedLoading", lng, ns, err);
    if (!err && data) {
      this.store.addResourceBundle(lng, ns, data, undefined, undefined, {
        skipCopy: true
      });
    }
    this.state[name] = err ? -1 : 2;
    if (err && data)
      this.state[name] = 0;
    const loaded = {};
    this.queue.forEach((q) => {
      pushPath(q.loaded, [lng], ns);
      removePending(q, name);
      if (err)
        q.errors.push(err);
      if (q.pendingCount === 0 && !q.done) {
        Object.keys(q.loaded).forEach((l) => {
          if (!loaded[l])
            loaded[l] = {};
          const loadedKeys = q.loaded[l];
          if (loadedKeys.length) {
            loadedKeys.forEach((n) => {
              if (loaded[l][n] === undefined)
                loaded[l][n] = true;
            });
          }
        });
        q.done = true;
        if (q.errors.length) {
          q.callback(q.errors);
        } else {
          q.callback();
        }
      }
    });
    this.emit("loaded", loaded);
    this.queue = this.queue.filter((q) => !q.done);
  }
  read(lng, ns, fcName) {
    let tried = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    let wait = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.retryTimeout;
    let callback = arguments.length > 5 ? arguments[5] : undefined;
    if (!lng.length)
      return callback(null, {});
    if (this.readingCalls >= this.maxParallelReads) {
      this.waitingReads.push({
        lng,
        ns,
        fcName,
        tried,
        wait,
        callback
      });
      return;
    }
    this.readingCalls++;
    const resolver = (err, data) => {
      this.readingCalls--;
      if (this.waitingReads.length > 0) {
        const next = this.waitingReads.shift();
        this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
      }
      if (err && data && tried < this.maxRetries) {
        setTimeout(() => {
          this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
        }, wait);
        return;
      }
      callback(err, data);
    };
    const fc = this.backend[fcName].bind(this.backend);
    if (fc.length === 2) {
      try {
        const r = fc(lng, ns);
        if (r && typeof r.then === "function") {
          r.then((data) => resolver(null, data)).catch(resolver);
        } else {
          resolver(null, r);
        }
      } catch (err) {
        resolver(err);
      }
      return;
    }
    return fc(lng, ns, resolver);
  }
  prepareLoading(languages, namespaces) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let callback = arguments.length > 3 ? arguments[3] : undefined;
    if (!this.backend) {
      this.logger.warn("No backend was added via i18next.use. Will not load resources.");
      return callback && callback();
    }
    if (isString(languages))
      languages = this.languageUtils.toResolveHierarchy(languages);
    if (isString(namespaces))
      namespaces = [namespaces];
    const toLoad = this.queueLoad(languages, namespaces, options, callback);
    if (!toLoad.toLoad.length) {
      if (!toLoad.pending.length)
        callback();
      return null;
    }
    toLoad.toLoad.forEach((name) => {
      this.loadOne(name);
    });
  }
  load(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {}, callback);
  }
  reload(languages, namespaces, callback) {
    this.prepareLoading(languages, namespaces, {
      reload: true
    }, callback);
  }
  loadOne(name) {
    let prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    const s = name.split("|");
    const lng = s[0];
    const ns = s[1];
    this.read(lng, ns, "read", undefined, undefined, (err, data) => {
      if (err)
        this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
      if (!err && data)
        this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
      this.loaded(name, err, data);
    });
  }
  saveMissing(languages, namespace, key, fallbackValue, isUpdate) {
    let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
    let clb = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : () => {};
    if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(namespace)) {
      this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
      return;
    }
    if (key === undefined || key === null || key === "")
      return;
    if (this.backend?.create) {
      const opts = {
        ...options,
        isUpdate
      };
      const fc = this.backend.create.bind(this.backend);
      if (fc.length < 6) {
        try {
          let r;
          if (fc.length === 5) {
            r = fc(languages, namespace, key, fallbackValue, opts);
          } else {
            r = fc(languages, namespace, key, fallbackValue);
          }
          if (r && typeof r.then === "function") {
            r.then((data) => clb(null, data)).catch(clb);
          } else {
            clb(null, r);
          }
        } catch (err) {
          clb(err);
        }
      } else {
        fc(languages, namespace, key, fallbackValue, clb, opts);
      }
    }
    if (!languages || !languages[0])
      return;
    this.store.addResource(languages[0], namespace, key, fallbackValue);
  }
}
var get = () => ({
  debug: false,
  initAsync: true,
  ns: ["translation"],
  defaultNS: ["translation"],
  fallbackLng: ["dev"],
  fallbackNS: false,
  supportedLngs: false,
  nonExplicitSupportedLngs: false,
  load: "all",
  preload: false,
  simplifyPluralSuffix: true,
  keySeparator: ".",
  nsSeparator: ":",
  pluralSeparator: "_",
  contextSeparator: "_",
  partialBundledLanguages: false,
  saveMissing: false,
  updateMissing: false,
  saveMissingTo: "fallback",
  saveMissingPlurals: true,
  missingKeyHandler: false,
  missingInterpolationHandler: false,
  postProcess: false,
  postProcessPassResolved: false,
  returnNull: false,
  returnEmptyString: true,
  returnObjects: false,
  joinArrays: false,
  returnedObjectHandler: false,
  parseMissingKeyHandler: false,
  appendNamespaceToMissingKey: false,
  appendNamespaceToCIMode: false,
  overloadTranslationOptionHandler: (args) => {
    let ret = {};
    if (typeof args[1] === "object")
      ret = args[1];
    if (isString(args[1]))
      ret.defaultValue = args[1];
    if (isString(args[2]))
      ret.tDescription = args[2];
    if (typeof args[2] === "object" || typeof args[3] === "object") {
      const options = args[3] || args[2];
      Object.keys(options).forEach((key) => {
        ret[key] = options[key];
      });
    }
    return ret;
  },
  interpolation: {
    escapeValue: true,
    format: (value) => value,
    prefix: "{{",
    suffix: "}}",
    formatSeparator: ",",
    unescapePrefix: "-",
    nestingPrefix: "$t(",
    nestingSuffix: ")",
    nestingOptionsSeparator: ",",
    maxReplaces: 1000,
    skipOnVariables: true
  }
});
var transformOptions = (options) => {
  if (isString(options.ns))
    options.ns = [options.ns];
  if (isString(options.fallbackLng))
    options.fallbackLng = [options.fallbackLng];
  if (isString(options.fallbackNS))
    options.fallbackNS = [options.fallbackNS];
  if (options.supportedLngs?.indexOf?.("cimode") < 0) {
    options.supportedLngs = options.supportedLngs.concat(["cimode"]);
  }
  if (typeof options.initImmediate === "boolean")
    options.initAsync = options.initImmediate;
  return options;
};
var noop = () => {};
var bindMemberFunctions = (inst) => {
  const mems = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
  mems.forEach((mem) => {
    if (typeof inst[mem] === "function") {
      inst[mem] = inst[mem].bind(inst);
    }
  });
};

class I18n extends EventEmitter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : undefined;
    super();
    this.options = transformOptions(options);
    this.services = {};
    this.logger = baseLogger;
    this.modules = {
      external: []
    };
    bindMemberFunctions(this);
    if (callback && !this.isInitialized && !options.isClone) {
      if (!this.options.initAsync) {
        this.init(options, callback);
        return this;
      }
      setTimeout(() => {
        this.init(options, callback);
      }, 0);
    }
  }
  init() {
    var _this = this;
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : undefined;
    this.isInitializing = true;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (options.defaultNS == null && options.ns) {
      if (isString(options.ns)) {
        options.defaultNS = options.ns;
      } else if (options.ns.indexOf("translation") < 0) {
        options.defaultNS = options.ns[0];
      }
    }
    const defOpts = get();
    this.options = {
      ...defOpts,
      ...this.options,
      ...transformOptions(options)
    };
    this.options.interpolation = {
      ...defOpts.interpolation,
      ...this.options.interpolation
    };
    if (options.keySeparator !== undefined) {
      this.options.userDefinedKeySeparator = options.keySeparator;
    }
    if (options.nsSeparator !== undefined) {
      this.options.userDefinedNsSeparator = options.nsSeparator;
    }
    const createClassOnDemand = (ClassOrObject) => {
      if (!ClassOrObject)
        return null;
      if (typeof ClassOrObject === "function")
        return new ClassOrObject;
      return ClassOrObject;
    };
    if (!this.options.isClone) {
      if (this.modules.logger) {
        baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
      } else {
        baseLogger.init(null, this.options);
      }
      let formatter;
      if (this.modules.formatter) {
        formatter = this.modules.formatter;
      } else {
        formatter = Formatter;
      }
      const lu = new LanguageUtil(this.options);
      this.store = new ResourceStore(this.options.resources, this.options);
      const s = this.services;
      s.logger = baseLogger;
      s.resourceStore = this.store;
      s.languageUtils = lu;
      s.pluralResolver = new PluralResolver(lu, {
        prepend: this.options.pluralSeparator,
        simplifyPluralSuffix: this.options.simplifyPluralSuffix
      });
      if (formatter && (!this.options.interpolation.format || this.options.interpolation.format === defOpts.interpolation.format)) {
        s.formatter = createClassOnDemand(formatter);
        s.formatter.init(s, this.options);
        this.options.interpolation.format = s.formatter.format.bind(s.formatter);
      }
      s.interpolator = new Interpolator(this.options);
      s.utils = {
        hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
      };
      s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
      s.backendConnector.on("*", function(event) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        _this.emit(event, ...args);
      });
      if (this.modules.languageDetector) {
        s.languageDetector = createClassOnDemand(this.modules.languageDetector);
        if (s.languageDetector.init)
          s.languageDetector.init(s, this.options.detection, this.options);
      }
      if (this.modules.i18nFormat) {
        s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
        if (s.i18nFormat.init)
          s.i18nFormat.init(this);
      }
      this.translator = new Translator(this.services, this.options);
      this.translator.on("*", function(event) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;_key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        _this.emit(event, ...args);
      });
      this.modules.external.forEach((m) => {
        if (m.init)
          m.init(this);
      });
    }
    this.format = this.options.interpolation.format;
    if (!callback)
      callback = noop;
    if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
      const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
      if (codes.length > 0 && codes[0] !== "dev")
        this.options.lng = codes[0];
    }
    if (!this.services.languageDetector && !this.options.lng) {
      this.logger.warn("init: no languageDetector is used and no lng is defined");
    }
    const storeApi = ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"];
    storeApi.forEach((fcName) => {
      this[fcName] = function() {
        return _this.store[fcName](...arguments);
      };
    });
    const storeApiChained = ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"];
    storeApiChained.forEach((fcName) => {
      this[fcName] = function() {
        _this.store[fcName](...arguments);
        return _this;
      };
    });
    const deferred = defer();
    const load = () => {
      const finish = (err, t) => {
        this.isInitializing = false;
        if (this.isInitialized && !this.initializedStoreOnce)
          this.logger.warn("init: i18next is already initialized. You should call init just once!");
        this.isInitialized = true;
        if (!this.options.isClone)
          this.logger.log("initialized", this.options);
        this.emit("initialized", this.options);
        deferred.resolve(t);
        callback(err, t);
      };
      if (this.languages && !this.isInitialized)
        return finish(null, this.t.bind(this));
      this.changeLanguage(this.options.lng, finish);
    };
    if (this.options.resources || !this.options.initAsync) {
      load();
    } else {
      setTimeout(load, 0);
    }
    return deferred;
  }
  loadResources(language) {
    let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
    let usedCallback = callback;
    const usedLng = isString(language) ? language : this.language;
    if (typeof language === "function")
      usedCallback = language;
    if (!this.options.resources || this.options.partialBundledLanguages) {
      if (usedLng?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0))
        return usedCallback();
      const toLoad = [];
      const append = (lng) => {
        if (!lng)
          return;
        if (lng === "cimode")
          return;
        const lngs = this.services.languageUtils.toResolveHierarchy(lng);
        lngs.forEach((l) => {
          if (l === "cimode")
            return;
          if (toLoad.indexOf(l) < 0)
            toLoad.push(l);
        });
      };
      if (!usedLng) {
        const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        fallbacks.forEach((l) => append(l));
      } else {
        append(usedLng);
      }
      this.options.preload?.forEach?.((l) => append(l));
      this.services.backendConnector.load(toLoad, this.options.ns, (e) => {
        if (!e && !this.resolvedLanguage && this.language)
          this.setResolvedLanguage(this.language);
        usedCallback(e);
      });
    } else {
      usedCallback(null);
    }
  }
  reloadResources(lngs, ns, callback) {
    const deferred = defer();
    if (typeof lngs === "function") {
      callback = lngs;
      lngs = undefined;
    }
    if (typeof ns === "function") {
      callback = ns;
      ns = undefined;
    }
    if (!lngs)
      lngs = this.languages;
    if (!ns)
      ns = this.options.ns;
    if (!callback)
      callback = noop;
    this.services.backendConnector.reload(lngs, ns, (err) => {
      deferred.resolve();
      callback(err);
    });
    return deferred;
  }
  use(module) {
    if (!module)
      throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
    if (!module.type)
      throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
    if (module.type === "backend") {
      this.modules.backend = module;
    }
    if (module.type === "logger" || module.log && module.warn && module.error) {
      this.modules.logger = module;
    }
    if (module.type === "languageDetector") {
      this.modules.languageDetector = module;
    }
    if (module.type === "i18nFormat") {
      this.modules.i18nFormat = module;
    }
    if (module.type === "postProcessor") {
      postProcessor.addPostProcessor(module);
    }
    if (module.type === "formatter") {
      this.modules.formatter = module;
    }
    if (module.type === "3rdParty") {
      this.modules.external.push(module);
    }
    return this;
  }
  setResolvedLanguage(l) {
    if (!l || !this.languages)
      return;
    if (["cimode", "dev"].indexOf(l) > -1)
      return;
    for (let li = 0;li < this.languages.length; li++) {
      const lngInLngs = this.languages[li];
      if (["cimode", "dev"].indexOf(lngInLngs) > -1)
        continue;
      if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
        this.resolvedLanguage = lngInLngs;
        break;
      }
    }
  }
  changeLanguage(lng, callback) {
    var _this2 = this;
    this.isLanguageChangingTo = lng;
    const deferred = defer();
    this.emit("languageChanging", lng);
    const setLngProps = (l) => {
      this.language = l;
      this.languages = this.services.languageUtils.toResolveHierarchy(l);
      this.resolvedLanguage = undefined;
      this.setResolvedLanguage(l);
    };
    const done = (err, l) => {
      if (l) {
        setLngProps(l);
        this.translator.changeLanguage(l);
        this.isLanguageChangingTo = undefined;
        this.emit("languageChanged", l);
        this.logger.log("languageChanged", l);
      } else {
        this.isLanguageChangingTo = undefined;
      }
      deferred.resolve(function() {
        return _this2.t(...arguments);
      });
      if (callback)
        callback(err, function() {
          return _this2.t(...arguments);
        });
    };
    const setLng = (lngs) => {
      if (!lng && !lngs && this.services.languageDetector)
        lngs = [];
      const l = isString(lngs) ? lngs : this.services.languageUtils.getBestMatchFromCodes(lngs);
      if (l) {
        if (!this.language) {
          setLngProps(l);
        }
        if (!this.translator.language)
          this.translator.changeLanguage(l);
        this.services.languageDetector?.cacheUserLanguage?.(l);
      }
      this.loadResources(l, (err) => {
        done(err, l);
      });
    };
    if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
      setLng(this.services.languageDetector.detect());
    } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
      if (this.services.languageDetector.detect.length === 0) {
        this.services.languageDetector.detect().then(setLng);
      } else {
        this.services.languageDetector.detect(setLng);
      }
    } else {
      setLng(lng);
    }
    return deferred;
  }
  getFixedT(lng, ns, keyPrefix) {
    var _this3 = this;
    const fixedT = function(key, opts) {
      let options;
      if (typeof opts !== "object") {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2;_key3 < _len3; _key3++) {
          rest[_key3 - 2] = arguments[_key3];
        }
        options = _this3.options.overloadTranslationOptionHandler([key, opts].concat(rest));
      } else {
        options = {
          ...opts
        };
      }
      options.lng = options.lng || fixedT.lng;
      options.lngs = options.lngs || fixedT.lngs;
      options.ns = options.ns || fixedT.ns;
      if (options.keyPrefix !== "")
        options.keyPrefix = options.keyPrefix || keyPrefix || fixedT.keyPrefix;
      const keySeparator = _this3.options.keySeparator || ".";
      let resultKey;
      if (options.keyPrefix && Array.isArray(key)) {
        resultKey = key.map((k) => `${options.keyPrefix}${keySeparator}${k}`);
      } else {
        resultKey = options.keyPrefix ? `${options.keyPrefix}${keySeparator}${key}` : key;
      }
      return _this3.t(resultKey, options);
    };
    if (isString(lng)) {
      fixedT.lng = lng;
    } else {
      fixedT.lngs = lng;
    }
    fixedT.ns = ns;
    fixedT.keyPrefix = keyPrefix;
    return fixedT;
  }
  t() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0;_key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return this.translator?.translate(...args);
  }
  exists() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0;_key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }
    return this.translator?.exists(...args);
  }
  setDefaultNamespace(ns) {
    this.options.defaultNS = ns;
  }
  hasLoadedNamespace(ns) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!this.isInitialized) {
      this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
      return false;
    }
    if (!this.languages || !this.languages.length) {
      this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
      return false;
    }
    const lng = options.lng || this.resolvedLanguage || this.languages[0];
    const fallbackLng = this.options ? this.options.fallbackLng : false;
    const lastLng = this.languages[this.languages.length - 1];
    if (lng.toLowerCase() === "cimode")
      return true;
    const loadNotPending = (l, n) => {
      const loadState = this.services.backendConnector.state[`${l}|${n}`];
      return loadState === -1 || loadState === 0 || loadState === 2;
    };
    if (options.precheck) {
      const preResult = options.precheck(this, loadNotPending);
      if (preResult !== undefined)
        return preResult;
    }
    if (this.hasResourceBundle(lng, ns))
      return true;
    if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages)
      return true;
    if (loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns)))
      return true;
    return false;
  }
  loadNamespaces(ns, callback) {
    const deferred = defer();
    if (!this.options.ns) {
      if (callback)
        callback();
      return Promise.resolve();
    }
    if (isString(ns))
      ns = [ns];
    ns.forEach((n) => {
      if (this.options.ns.indexOf(n) < 0)
        this.options.ns.push(n);
    });
    this.loadResources((err) => {
      deferred.resolve();
      if (callback)
        callback(err);
    });
    return deferred;
  }
  loadLanguages(lngs, callback) {
    const deferred = defer();
    if (isString(lngs))
      lngs = [lngs];
    const preloaded = this.options.preload || [];
    const newLngs = lngs.filter((lng) => preloaded.indexOf(lng) < 0 && this.services.languageUtils.isSupportedCode(lng));
    if (!newLngs.length) {
      if (callback)
        callback();
      return Promise.resolve();
    }
    this.options.preload = preloaded.concat(newLngs);
    this.loadResources((err) => {
      deferred.resolve();
      if (callback)
        callback(err);
    });
    return deferred;
  }
  dir(lng) {
    if (!lng)
      lng = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language);
    if (!lng)
      return "rtl";
    const rtlLngs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"];
    const languageUtils = this.services?.languageUtils || new LanguageUtil(get());
    return rtlLngs.indexOf(languageUtils.getLanguagePartFromCode(lng)) > -1 || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
  }
  static createInstance() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : undefined;
    return new I18n(options, callback);
  }
  cloneInstance() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
    const forkResourceStore = options.forkResourceStore;
    if (forkResourceStore)
      delete options.forkResourceStore;
    const mergedOptions = {
      ...this.options,
      ...options,
      ...{
        isClone: true
      }
    };
    const clone = new I18n(mergedOptions);
    if (options.debug !== undefined || options.prefix !== undefined) {
      clone.logger = clone.logger.clone(options);
    }
    const membersToCopy = ["store", "services", "language"];
    membersToCopy.forEach((m) => {
      clone[m] = this[m];
    });
    clone.services = {
      ...this.services
    };
    clone.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    if (forkResourceStore) {
      const clonedData = Object.keys(this.store.data).reduce((prev, l) => {
        prev[l] = {
          ...this.store.data[l]
        };
        return Object.keys(prev[l]).reduce((acc, n) => {
          acc[n] = {
            ...prev[l][n]
          };
          return acc;
        }, {});
      }, {});
      clone.store = new ResourceStore(clonedData, mergedOptions);
      clone.services.resourceStore = clone.store;
    }
    clone.translator = new Translator(clone.services, mergedOptions);
    clone.translator.on("*", function(event) {
      for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1;_key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }
      clone.emit(event, ...args);
    });
    clone.init(mergedOptions, callback);
    clone.translator.options = mergedOptions;
    clone.translator.backendConnector.services.utils = {
      hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
    };
    return clone;
  }
  toJSON() {
    return {
      options: this.options,
      store: this.store,
      language: this.language,
      languages: this.languages,
      resolvedLanguage: this.resolvedLanguage
    };
  }
}
var instance = I18n.createInstance();
instance.createInstance = I18n.createInstance;
var createInstance = instance.createInstance;
var dir = instance.dir;
var init = instance.init;
var loadResources = instance.loadResources;
var reloadResources = instance.reloadResources;
var use = instance.use;
var changeLanguage = instance.changeLanguage;
var getFixedT = instance.getFixedT;
var t = instance.t;
var exists = instance.exists;
var setDefaultNamespace = instance.setDefaultNamespace;
var hasLoadedNamespace = instance.hasLoadedNamespace;
var loadNamespaces = instance.loadNamespaces;
var loadLanguages = instance.loadLanguages;

// ../common/lib/utils.ts
var import_classnames = __toESM(require_classnames(), 1);
var copyObject = (obj) => JSON.parse(JSON.stringify(obj));
function keyMod(reference, apply, refPath = [], nestingLevel = 0) {
  apply(reference, null, refPath, nestingLevel);
  const keys = Object.keys(reference);
  for (const key of keys) {
    if (!key.startsWith("_") && !["src", "target"].includes(key)) {
      refPath.push(key);
      if (typeof reference[key] === "object" && reference[key] !== null) {
        keyMod(reference[key], apply, refPath, nestingLevel + 1);
      } else if (typeof reference[key] === "string") {
        apply(reference, key, refPath, nestingLevel + 1);
      }
      refPath.pop();
    }
  }
}
function keyPath(obj, refPath, create = false) {
  if (!Array.isArray(refPath)) {
    throw new TypeError("refPath must be an array");
  }
  if (!refPath.length) {
    return obj;
  }
  const _refPath = [...refPath];
  let _obj = obj;
  while (_refPath.length) {
    const key = _refPath.shift();
    if (typeof _obj === "object" && key in _obj) {
      _obj = _obj[key];
    } else if (create) {
      _obj[key] = {};
      _obj = _obj[key];
    }
  }
  return _obj;
}
function isObject(argument) {
  return argument && typeof argument === "object" && !Array.isArray(argument);
}
function mergeDeep(target, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
}

// ../../node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t2;
var i;
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var y = [];
var v = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var w = Array.isArray;
function d(n2, l2) {
  for (var u2 in l2)
    n2[u2] = l2[u2];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l2, u2, t3) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2)
    o2 == "key" ? i2 = u2[o2] : o2 == "ref" ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t3), typeof l2 == "function" && l2.defaultProps != null)
    for (o2 in l2.defaultProps)
      e2[o2] == null && (e2[o2] = l2.defaultProps[o2]);
  return m(l2, e2, i2, r2, null);
}
function m(n2, t3, i2, r2, o2) {
  var e2 = { type: n2, props: t3, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: undefined, __v: o2 == null ? ++u : o2, __i: -1, __u: 0 };
  return o2 == null && l.vnode != null && l.vnode(e2), e2;
}
function k(n2) {
  return n2.children;
}
function x(n2, l2) {
  this.props = n2, this.context = l2;
}
function S(n2, l2) {
  if (l2 == null)
    return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u2;l2 < n2.__k.length; l2++)
    if ((u2 = n2.__k[l2]) != null && u2.__e != null)
      return u2.__e;
  return typeof n2.type == "function" ? S(n2) : null;
}
function C(n2) {
  var l2, u2;
  if ((n2 = n2.__) != null && n2.__c != null) {
    for (n2.__e = n2.__c.base = null, l2 = 0;l2 < n2.__k.length; l2++)
      if ((u2 = n2.__k[l2]) != null && u2.__e != null) {
        n2.__e = n2.__c.base = u2.__e;
        break;
      }
    return C(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)($);
}
function $() {
  for (var n2, u2, t3, r2, o2, f2, c2, s2 = 1;i.length; )
    i.length > s2 && i.sort(e), n2 = i.shift(), s2 = i.length, n2.__d && (t3 = undefined, o2 = (r2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t3 = d({}, r2)).__v = r2.__v + 1, l.vnode && l.vnode(t3), O(u2.__P, t3, r2, u2.__n, u2.__P.namespaceURI, 32 & r2.__u ? [o2] : null, f2, o2 == null ? S(r2) : o2, !!(32 & r2.__u), c2), t3.__v = r2.__v, t3.__.__k[t3.__i] = t3, z(f2, t3, c2), t3.__e != o2 && C(t3)));
  $.__r = 0;
}
function I(n2, l2, u2, t3, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, v2, w2, d2, g2, _2 = t3 && t3.__k || y, m2 = l2.length;
  for (f2 = P(u2, l2, _2, f2, m2), a2 = 0;a2 < m2; a2++)
    (v2 = u2.__k[a2]) != null && (h2 = v2.__i == -1 ? p : _2[v2.__i] || p, v2.__i = a2, g2 = O(n2, v2, h2, i2, r2, o2, e2, f2, c2, s2), w2 = v2.__e, v2.ref && h2.ref != v2.ref && (h2.ref && q(h2.ref, null, v2), s2.push(v2.ref, v2.__c || w2, v2)), d2 == null && w2 != null && (d2 = w2), 4 & v2.__u || h2.__k === v2.__k ? f2 = A(v2, f2, n2) : typeof v2.type == "function" && g2 !== undefined ? f2 = g2 : w2 && (f2 = w2.nextSibling), v2.__u &= -7);
  return u2.__e = d2, f2;
}
function P(n2, l2, u2, t3, i2) {
  var r2, o2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0;r2 < i2; r2++)
    (o2 = l2[r2]) != null && typeof o2 != "boolean" && typeof o2 != "function" ? (f2 = r2 + h2, (o2 = n2.__k[r2] = typeof o2 == "string" || typeof o2 == "number" || typeof o2 == "bigint" || o2.constructor == String ? m(null, o2, null, null, null) : w(o2) ? m(k, { children: o2 }, null, null, null) : o2.constructor == null && o2.__b > 0 ? m(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : o2).__ = n2, o2.__b = n2.__b + 1, e2 = null, (c2 = o2.__i = L(o2, u2, f2, a2)) != -1 && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), e2 == null || e2.__v == null ? (c2 == -1 && (i2 > s2 ? h2-- : i2 < s2 && h2++), typeof o2.type != "function" && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (a2)
    for (r2 = 0;r2 < s2; r2++)
      (e2 = u2[r2]) != null && (2 & e2.__u) == 0 && (e2.__e == t3 && (t3 = S(e2)), B(e2, e2));
  return t3;
}
function A(n2, l2, u2) {
  var t3, i2;
  if (typeof n2.type == "function") {
    for (t3 = n2.__k, i2 = 0;t3 && i2 < t3.length; i2++)
      t3[i2] && (t3[i2].__ = n2, l2 = A(t3[i2], l2, u2));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !u2.contains(l2) && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null), l2 = n2.__e);
  do {
    l2 = l2 && l2.nextSibling;
  } while (l2 != null && l2.nodeType == 8);
  return l2;
}
function H(n2, l2) {
  return l2 = l2 || [], n2 == null || typeof n2 == "boolean" || (w(n2) ? n2.some(function(n3) {
    H(n3, l2);
  }) : l2.push(n2)), l2;
}
function L(n2, l2, u2, t3) {
  var i2, r2, o2 = n2.key, e2 = n2.type, f2 = l2[u2];
  if (f2 === null && n2.key == null || f2 && o2 == f2.key && e2 == f2.type && (2 & f2.__u) == 0)
    return u2;
  if (t3 > (f2 != null && (2 & f2.__u) == 0 ? 1 : 0))
    for (i2 = u2 - 1, r2 = u2 + 1;i2 >= 0 || r2 < l2.length; ) {
      if (i2 >= 0) {
        if ((f2 = l2[i2]) && (2 & f2.__u) == 0 && o2 == f2.key && e2 == f2.type)
          return i2;
        i2--;
      }
      if (r2 < l2.length) {
        if ((f2 = l2[r2]) && (2 & f2.__u) == 0 && o2 == f2.key && e2 == f2.type)
          return r2;
        r2++;
      }
    }
  return -1;
}
function T(n2, l2, u2) {
  l2[0] == "-" ? n2.setProperty(l2, u2 == null ? "" : u2) : n2[l2] = u2 == null ? "" : typeof u2 != "number" || v.test(l2) ? u2 : u2 + "px";
}
function j(n2, l2, u2, t3, i2) {
  var r2;
  n:
    if (l2 == "style")
      if (typeof u2 == "string")
        n2.style.cssText = u2;
      else {
        if (typeof t3 == "string" && (n2.style.cssText = t3 = ""), t3)
          for (l2 in t3)
            u2 && l2 in u2 || T(n2.style, l2, "");
        if (u2)
          for (l2 in u2)
            t3 && u2[l2] == t3[l2] || T(n2.style, l2, u2[l2]);
      }
    else if (l2[0] == "o" && l2[1] == "n")
      r2 = l2 != (l2 = l2.replace(f, "$1")), l2 = l2.toLowerCase() in n2 || l2 == "onFocusOut" || l2 == "onFocusIn" ? l2.toLowerCase().slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t3 ? u2.u = t3.u : (u2.u = c, n2.addEventListener(l2, r2 ? a : s, r2)) : n2.removeEventListener(l2, r2 ? a : s, r2);
    else {
      if (i2 == "http://www.w3.org/2000/svg")
        l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (l2 != "width" && l2 != "height" && l2 != "href" && l2 != "list" && l2 != "form" && l2 != "tabIndex" && l2 != "download" && l2 != "rowSpan" && l2 != "colSpan" && l2 != "role" && l2 != "popover" && l2 in n2)
        try {
          n2[l2] = u2 == null ? "" : u2;
          break n;
        } catch (n3) {}
      typeof u2 == "function" || (u2 == null || u2 === false && l2[4] != "-" ? n2.removeAttribute(l2) : n2.setAttribute(l2, l2 == "popover" && u2 == 1 ? "" : u2));
    }
}
function F(n2) {
  return function(u2) {
    if (this.l) {
      var t3 = this.l[u2.type + n2];
      if (u2.t == null)
        u2.t = c++;
      else if (u2.t < t3.u)
        return;
      return t3(l.event ? l.event(u2) : u2);
    }
  };
}
function O(n2, u2, t3, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, p2, y2, v2, _2, m2, b, S2, C2, M2, $2, P2, A2, H2, L2, T2, j2 = u2.type;
  if (u2.constructor != null)
    return null;
  128 & t3.__u && (c2 = !!(32 & t3.__u), o2 = [f2 = u2.__e = t3.__e]), (a2 = l.__b) && a2(u2);
  n:
    if (typeof j2 == "function")
      try {
        if (b = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t3.__c ? m2 = (h2 = u2.__c = t3.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b, M2) : (u2.__c = h2 = new x(b, M2), h2.constructor = j2, h2.render = D), C2 && C2.sub(h2), h2.props = b, h2.state || (h2.state = {}), h2.context = M2, h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && h2.__s == null && (h2.__s = h2.state), S2 && j2.getDerivedStateFromProps != null && (h2.__s == h2.state && (h2.__s = d({}, h2.__s)), d(h2.__s, j2.getDerivedStateFromProps(b, h2.__s))), y2 = h2.props, v2 = h2.state, h2.__v = u2, p2)
          S2 && j2.getDerivedStateFromProps == null && h2.componentWillMount != null && h2.componentWillMount(), S2 && h2.componentDidMount != null && h2.__h.push(h2.componentDidMount);
        else {
          if (S2 && j2.getDerivedStateFromProps == null && b !== y2 && h2.componentWillReceiveProps != null && h2.componentWillReceiveProps(b, M2), !h2.__e && h2.shouldComponentUpdate != null && h2.shouldComponentUpdate(b, h2.__s, M2) === false || u2.__v == t3.__v) {
            for (u2.__v != t3.__v && (h2.props = b, h2.state = h2.__s, h2.__d = false), u2.__e = t3.__e, u2.__k = t3.__k, u2.__k.some(function(n3) {
              n3 && (n3.__ = u2);
            }), $2 = 0;$2 < h2._sb.length; $2++)
              h2.__h.push(h2._sb[$2]);
            h2._sb = [], h2.__h.length && e2.push(h2);
            break n;
          }
          h2.componentWillUpdate != null && h2.componentWillUpdate(b, h2.__s, M2), S2 && h2.componentDidUpdate != null && h2.__h.push(function() {
            h2.componentDidUpdate(y2, v2, _2);
          });
        }
        if (h2.context = M2, h2.props = b, h2.__P = n2, h2.__e = false, P2 = l.__r, A2 = 0, S2) {
          for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H2 = 0;H2 < h2._sb.length; H2++)
            h2.__h.push(h2._sb[H2]);
          h2._sb = [];
        } else
          do {
            h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
          } while (h2.__d && ++A2 < 25);
        h2.state = h2.__s, h2.getChildContext != null && (i2 = d(d({}, i2), h2.getChildContext())), S2 && !p2 && h2.getSnapshotBeforeUpdate != null && (_2 = h2.getSnapshotBeforeUpdate(y2, v2)), L2 = a2, a2 != null && a2.type === k && a2.key == null && (L2 = N(a2.props.children)), f2 = I(n2, w(L2) ? L2 : [L2], u2, t3, i2, r2, o2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
      } catch (n3) {
        if (u2.__v = null, c2 || o2 != null)
          if (n3.then) {
            for (u2.__u |= c2 ? 160 : 128;f2 && f2.nodeType == 8 && f2.nextSibling; )
              f2 = f2.nextSibling;
            o2[o2.indexOf(f2)] = null, u2.__e = f2;
          } else
            for (T2 = o2.length;T2--; )
              g(o2[T2]);
        else
          u2.__e = t3.__e, u2.__k = t3.__k;
        l.__e(n3, u2, t3);
      }
    else
      o2 == null && u2.__v == t3.__v ? (u2.__k = t3.__k, u2.__e = t3.__e) : f2 = u2.__e = V(t3.__e, u2, t3, i2, r2, o2, e2, c2, s2);
  return (a2 = l.diffed) && a2(u2), 128 & u2.__u ? undefined : f2;
}
function z(n2, u2, t3) {
  for (var i2 = 0;i2 < t3.length; i2++)
    q(t3[i2], t3[++i2], t3[++i2]);
  l.__c && l.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l.__e(n3, u3.__v);
    }
  });
}
function N(n2) {
  return typeof n2 != "object" || n2 == null || n2.__b && n2.__b > 0 ? n2 : w(n2) ? n2.map(N) : d({}, n2);
}
function V(u2, t3, i2, r2, o2, e2, f2, c2, s2) {
  var a2, h2, y2, v2, d2, _2, m2, b = i2.props, k2 = t3.props, x2 = t3.type;
  if (x2 == "svg" ? o2 = "http://www.w3.org/2000/svg" : x2 == "math" ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), e2 != null) {
    for (a2 = 0;a2 < e2.length; a2++)
      if ((d2 = e2[a2]) && "setAttribute" in d2 == !!x2 && (x2 ? d2.localName == x2 : d2.nodeType == 3)) {
        u2 = d2, e2[a2] = null;
        break;
      }
  }
  if (u2 == null) {
    if (x2 == null)
      return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l.__m && l.__m(t3, e2), c2 = false), e2 = null;
  }
  if (x2 == null)
    b === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = e2 && n.call(u2.childNodes), b = i2.props || p, !c2 && e2 != null)
      for (b = {}, a2 = 0;a2 < u2.attributes.length; a2++)
        b[(d2 = u2.attributes[a2]).name] = d2.value;
    for (a2 in b)
      if (d2 = b[a2], a2 == "children")
        ;
      else if (a2 == "dangerouslySetInnerHTML")
        y2 = d2;
      else if (!(a2 in k2)) {
        if (a2 == "value" && "defaultValue" in k2 || a2 == "checked" && "defaultChecked" in k2)
          continue;
        j(u2, a2, null, d2, o2);
      }
    for (a2 in k2)
      d2 = k2[a2], a2 == "children" ? v2 = d2 : a2 == "dangerouslySetInnerHTML" ? h2 = d2 : a2 == "value" ? _2 = d2 : a2 == "checked" ? m2 = d2 : c2 && typeof d2 != "function" || b[a2] === d2 || j(u2, a2, d2, b[a2], o2);
    if (h2)
      c2 || y2 && (h2.__html == y2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t3.__k = [];
    else if (y2 && (u2.innerHTML = ""), I(t3.type == "template" ? u2.content : u2, w(v2) ? v2 : [v2], t3, i2, r2, x2 == "foreignObject" ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), e2 != null)
      for (a2 = e2.length;a2--; )
        g(e2[a2]);
    c2 || (a2 = "value", x2 == "progress" && _2 == null ? u2.removeAttribute("value") : _2 != null && (_2 !== u2[a2] || x2 == "progress" && !_2 || x2 == "option" && _2 != b[a2]) && j(u2, a2, _2, b[a2], o2), a2 = "checked", m2 != null && m2 != u2[a2] && j(u2, a2, m2, b[a2], o2));
  }
  return u2;
}
function q(n2, u2, t3) {
  try {
    if (typeof n2 == "function") {
      var i2 = typeof n2.__u == "function";
      i2 && n2.__u(), i2 && u2 == null || (n2.__u = n2(u2));
    } else
      n2.current = u2;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function B(n2, u2, t3) {
  var i2, r2;
  if (l.unmount && l.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || q(i2, null, u2)), (i2 = n2.__c) != null) {
    if (i2.componentWillUnmount)
      try {
        i2.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u2);
      }
    i2.base = i2.__P = null;
  }
  if (i2 = n2.__k)
    for (r2 = 0;r2 < i2.length; r2++)
      i2[r2] && B(i2[r2], u2, t3 || typeof n2.type != "function");
  t3 || g(n2.__e), n2.__c = n2.__ = n2.__e = undefined;
}
function D(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function E(u2, t3, i2) {
  var r2, o2, e2, f2;
  t3 == document && (t3 = document.documentElement), l.__ && l.__(u2, t3), o2 = (r2 = typeof i2 == "function") ? null : i2 && i2.__k || t3.__k, e2 = [], f2 = [], O(t3, u2 = (!r2 && i2 || t3).__k = _(k, null, [u2]), o2 || p, p, t3.namespaceURI, !r2 && i2 ? [i2] : o2 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e2, !r2 && i2 ? i2 : o2 ? o2.__e : t3.firstChild, r2, f2), z(e2, u2, f2);
}
function J(l2, u2, t3) {
  var i2, r2, o2, e2, f2 = d({}, l2.props);
  for (o2 in l2.type && l2.type.defaultProps && (e2 = l2.type.defaultProps), u2)
    o2 == "key" ? i2 = u2[o2] : o2 == "ref" ? r2 = u2[o2] : f2[o2] = u2[o2] == null && e2 != null ? e2[o2] : u2[o2];
  return arguments.length > 2 && (f2.children = arguments.length > 3 ? n.call(arguments, 2) : t3), m(l2.type, f2, i2 || l2.key, r2 || l2.ref, null);
}
function K(n2) {
  function l2(n3) {
    var u2, t3;
    return this.getChildContext || (u2 = new Set, (t3 = {})[l2.__c] = this, this.getChildContext = function() {
      return t3;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, M(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + h++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n = y.slice, l = { __e: function(n2, l2, u2, t3) {
  for (var i2, r2, o2;l2 = l2.__; )
    if ((i2 = l2.__c) && !i2.__)
      try {
        if ((r2 = i2.constructor) && r2.getDerivedStateFromError != null && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), i2.componentDidCatch != null && (i2.componentDidCatch(n2, t3 || {}), o2 = i2.__d), o2)
          return i2.__E = i2;
      } catch (l3) {
        n2 = l3;
      }
  throw n2;
} }, u = 0, t2 = function(n2) {
  return n2 != null && n2.constructor == null;
}, x.prototype.setState = function(n2, l2) {
  var u2;
  u2 = this.__s != null && this.__s != this.state ? this.__s : this.__s = d({}, this.state), typeof n2 == "function" && (n2 = n2(d({}, u2), this.props)), n2 && d(u2, n2), n2 != null && this.__v && (l2 && this._sb.push(l2), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], o = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

// ../../node_modules/preact/hooks/dist/hooks.module.js
var t3;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n2, t4) {
  c2.__h && c2.__h(r2, n2, o2 || t4), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
}
function T2(n2, r3) {
  var u3 = p2(t3++, 7);
  return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
}
function j2() {
  for (var n2;n2 = f2.shift(); )
    if (n2.__P && n2.__H)
      try {
        n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
      } catch (t4) {
        n2.__H.__h = [], c2.__e(t4, n2.__v);
      }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t4) {
  n2 && t4.__k && t4.__k.__m && (n2.__m = t4.__k.__m), s2 && s2(n2, t4);
}, c2.__r = function(n2) {
  a2 && a2(n2), t3 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = undefined;
  })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t3 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t4 = n2.__c;
  t4 && t4.__H && (t4.__H.__h.length && (f2.push(t4) !== 1 && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = undefined;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t4) {
  t4.some(function(n3) {
    try {
      n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t4.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t4 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t4);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t4, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t4 = n4;
    }
  }), r3.__H = undefined, t4 && c2.__e(t4, r3.__v));
};
var k2 = typeof requestAnimationFrame == "function";
function w2(n2) {
  var t4, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t4), setTimeout(n2);
  }, u3 = setTimeout(r3, 100);
  k2 && (t4 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t4 = r2, u3 = n2.__c;
  typeof u3 == "function" && (n2.__c = undefined, u3()), r2 = t4;
}
function B2(n2) {
  var t4 = r2;
  n2.__c = n2.__(), r2 = t4;
}
function C2(n2, t4) {
  return !n2 || n2.length !== t4.length || t4.some(function(t5, r3) {
    return t5 !== n2[r3];
  });
}

// ../../node_modules/@preact/signals-core/dist/signals-core.module.js
var i3 = Symbol.for("preact-signals");
function t4() {
  if (!(s3 > 1)) {
    var i4, t5 = false;
    while (h2 !== undefined) {
      var r3 = h2;
      h2 = undefined;
      f3++;
      while (r3 !== undefined) {
        var o3 = r3.o;
        r3.o = undefined;
        r3.f &= -3;
        if (!(8 & r3.f) && c3(r3))
          try {
            r3.c();
          } catch (r4) {
            if (!t5) {
              i4 = r4;
              t5 = true;
            }
          }
        r3 = o3;
      }
    }
    f3 = 0;
    s3--;
    if (t5)
      throw i4;
  } else
    s3--;
}
function r3(i4) {
  if (s3 > 0)
    return i4();
  s3++;
  try {
    return i4();
  } finally {
    t4();
  }
}
var o3 = undefined;
var h2 = undefined;
var s3 = 0;
var f3 = 0;
var v3 = 0;
function e3(i4) {
  if (o3 !== undefined) {
    var t5 = i4.n;
    if (t5 === undefined || t5.t !== o3) {
      t5 = { i: 0, S: i4, p: o3.s, n: undefined, t: o3, e: undefined, x: undefined, r: t5 };
      if (o3.s !== undefined)
        o3.s.n = t5;
      o3.s = t5;
      i4.n = t5;
      if (32 & o3.f)
        i4.S(t5);
      return t5;
    } else if (t5.i === -1) {
      t5.i = 0;
      if (t5.n !== undefined) {
        t5.n.p = t5.p;
        if (t5.p !== undefined)
          t5.p.n = t5.n;
        t5.p = o3.s;
        t5.n = undefined;
        o3.s.n = t5;
        o3.s = t5;
      }
      return t5;
    }
  }
}
function u3(i4) {
  this.v = i4;
  this.i = 0;
  this.n = undefined;
  this.t = undefined;
}
u3.prototype.brand = i3;
u3.prototype.h = function() {
  return true;
};
u3.prototype.S = function(i4) {
  if (this.t !== i4 && i4.e === undefined) {
    i4.x = this.t;
    if (this.t !== undefined)
      this.t.e = i4;
    this.t = i4;
  }
};
u3.prototype.U = function(i4) {
  if (this.t !== undefined) {
    var { e: t5, x: r4 } = i4;
    if (t5 !== undefined) {
      t5.x = r4;
      i4.e = undefined;
    }
    if (r4 !== undefined) {
      r4.e = t5;
      i4.x = undefined;
    }
    if (i4 === this.t)
      this.t = r4;
  }
};
u3.prototype.subscribe = function(i4) {
  var t5 = this;
  return E2(function() {
    var r4 = t5.value, n2 = o3;
    o3 = undefined;
    try {
      i4(r4);
    } finally {
      o3 = n2;
    }
  });
};
u3.prototype.valueOf = function() {
  return this.value;
};
u3.prototype.toString = function() {
  return this.value + "";
};
u3.prototype.toJSON = function() {
  return this.value;
};
u3.prototype.peek = function() {
  var i4 = o3;
  o3 = undefined;
  try {
    return this.value;
  } finally {
    o3 = i4;
  }
};
Object.defineProperty(u3.prototype, "value", { get: function() {
  var i4 = e3(this);
  if (i4 !== undefined)
    i4.i = this.i;
  return this.v;
}, set: function(i4) {
  if (i4 !== this.v) {
    if (f3 > 100)
      throw new Error("Cycle detected");
    this.v = i4;
    this.i++;
    v3++;
    s3++;
    try {
      for (var r4 = this.t;r4 !== undefined; r4 = r4.x)
        r4.t.N();
    } finally {
      t4();
    }
  }
} });
function d2(i4) {
  return new u3(i4);
}
function c3(i4) {
  for (var t5 = i4.s;t5 !== undefined; t5 = t5.n)
    if (t5.S.i !== t5.i || !t5.S.h() || t5.S.i !== t5.i)
      return true;
  return false;
}
function a3(i4) {
  for (var t5 = i4.s;t5 !== undefined; t5 = t5.n) {
    var r4 = t5.S.n;
    if (r4 !== undefined)
      t5.r = r4;
    t5.S.n = t5;
    t5.i = -1;
    if (t5.n === undefined) {
      i4.s = t5;
      break;
    }
  }
}
function l3(i4) {
  var t5 = i4.s, r4 = undefined;
  while (t5 !== undefined) {
    var o4 = t5.p;
    if (t5.i === -1) {
      t5.S.U(t5);
      if (o4 !== undefined)
        o4.n = t5.n;
      if (t5.n !== undefined)
        t5.n.p = o4;
    } else
      r4 = t5;
    t5.S.n = t5.r;
    if (t5.r !== undefined)
      t5.r = undefined;
    t5 = o4;
  }
  i4.s = r4;
}
function y2(i4) {
  u3.call(this, undefined);
  this.x = i4;
  this.s = undefined;
  this.g = v3 - 1;
  this.f = 4;
}
(y2.prototype = new u3).h = function() {
  this.f &= -3;
  if (1 & this.f)
    return false;
  if ((36 & this.f) == 32)
    return true;
  this.f &= -5;
  if (this.g === v3)
    return true;
  this.g = v3;
  this.f |= 1;
  if (this.i > 0 && !c3(this)) {
    this.f &= -2;
    return true;
  }
  var i4 = o3;
  try {
    a3(this);
    o3 = this;
    var t5 = this.x();
    if (16 & this.f || this.v !== t5 || this.i === 0) {
      this.v = t5;
      this.f &= -17;
      this.i++;
    }
  } catch (i5) {
    this.v = i5;
    this.f |= 16;
    this.i++;
  }
  o3 = i4;
  l3(this);
  this.f &= -2;
  return true;
};
y2.prototype.S = function(i4) {
  if (this.t === undefined) {
    this.f |= 36;
    for (var t5 = this.s;t5 !== undefined; t5 = t5.n)
      t5.S.S(t5);
  }
  u3.prototype.S.call(this, i4);
};
y2.prototype.U = function(i4) {
  if (this.t !== undefined) {
    u3.prototype.U.call(this, i4);
    if (this.t === undefined) {
      this.f &= -33;
      for (var t5 = this.s;t5 !== undefined; t5 = t5.n)
        t5.S.U(t5);
    }
  }
};
y2.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (var i4 = this.t;i4 !== undefined; i4 = i4.x)
      i4.t.N();
  }
};
Object.defineProperty(y2.prototype, "value", { get: function() {
  if (1 & this.f)
    throw new Error("Cycle detected");
  var i4 = e3(this);
  this.h();
  if (i4 !== undefined)
    i4.i = this.i;
  if (16 & this.f)
    throw this.v;
  return this.v;
} });
function w3(i4) {
  return new y2(i4);
}
function _2(i4) {
  var r4 = i4.u;
  i4.u = undefined;
  if (typeof r4 == "function") {
    s3++;
    var n2 = o3;
    o3 = undefined;
    try {
      r4();
    } catch (t5) {
      i4.f &= -2;
      i4.f |= 8;
      g2(i4);
      throw t5;
    } finally {
      o3 = n2;
      t4();
    }
  }
}
function g2(i4) {
  for (var t5 = i4.s;t5 !== undefined; t5 = t5.n)
    t5.S.U(t5);
  i4.x = undefined;
  i4.s = undefined;
  _2(i4);
}
function p3(i4) {
  if (o3 !== this)
    throw new Error("Out-of-order effect");
  l3(this);
  o3 = i4;
  this.f &= -2;
  if (8 & this.f)
    g2(this);
  t4();
}
function b(i4) {
  this.x = i4;
  this.u = undefined;
  this.s = undefined;
  this.o = undefined;
  this.f = 32;
}
b.prototype.c = function() {
  var i4 = this.S();
  try {
    if (8 & this.f)
      return;
    if (this.x === undefined)
      return;
    var t5 = this.x();
    if (typeof t5 == "function")
      this.u = t5;
  } finally {
    i4();
  }
};
b.prototype.S = function() {
  if (1 & this.f)
    throw new Error("Cycle detected");
  this.f |= 1;
  this.f &= -9;
  _2(this);
  a3(this);
  s3++;
  var i4 = o3;
  o3 = this;
  return p3.bind(this, i4);
};
b.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 2;
    this.o = h2;
    h2 = this;
  }
};
b.prototype.d = function() {
  this.f |= 8;
  if (!(1 & this.f))
    g2(this);
};
function E2(i4) {
  var t5 = new b(i4);
  try {
    t5.c();
  } catch (i5) {
    t5.d();
    throw i5;
  }
  return t5.d.bind(t5);
}

// ../../node_modules/@preact/signals/dist/signals.module.js
var h3;
var l4;
var d3;
var m3 = [];
E2(function() {
  h3 = this.N;
})();
function _3(i4, r4) {
  l[i4] = r4.bind(null, l[i4] || function() {});
}
function g3(i4) {
  if (d3)
    d3();
  d3 = i4 && i4.S();
}
function b2(i4) {
  var n3 = this, t5 = i4.data, o4 = useSignal(t5);
  o4.value = t5;
  var e4 = T2(function() {
    var i5 = n3, t6 = n3.__v;
    while (t6 = t6.__)
      if (t6.__c) {
        t6.__c.__$f |= 4;
        break;
      }
    var f4 = w3(function() {
      var i6 = o4.value.value;
      return i6 === 0 ? 0 : i6 === true ? "" : i6 || "";
    }), e5 = w3(function() {
      return !Array.isArray(f4.value) && !t2(f4.value);
    }), a5 = E2(function() {
      this.N = T3;
      if (e5.value) {
        var n4 = f4.value;
        if (i5.__v && i5.__v.__e && i5.__v.__e.nodeType === 3)
          i5.__v.__e.data = n4;
      }
    }), v5 = n3.__$u.d;
    n3.__$u.d = function() {
      a5();
      v5.call(this);
    };
    return [e5, f4];
  }, []), a4 = e4[0], v4 = e4[1];
  return a4.value ? v4.peek() : v4.value;
}
b2.displayName = "_st";
Object.defineProperties(u3.prototype, { constructor: { configurable: true, value: undefined }, type: { configurable: true, value: b2 }, props: { configurable: true, get: function() {
  return { data: this };
} }, __b: { configurable: true, value: 1 } });
_3("__b", function(i4, n3) {
  if (typeof n3.type == "string") {
    var r4, t5 = n3.props;
    for (var f4 in t5)
      if (f4 !== "children") {
        var o4 = t5[f4];
        if (o4 instanceof u3) {
          if (!r4)
            n3.__np = r4 = {};
          r4[f4] = o4;
          t5[f4] = o4.peek();
        }
      }
  }
  i4(n3);
});
_3("__r", function(i4, n3) {
  if (n3.type !== k) {
    g3();
    var r4, f4 = n3.__c;
    if (f4) {
      f4.__$f &= -2;
      if ((r4 = f4.__$u) === undefined)
        f4.__$u = r4 = function(i5) {
          var n4;
          E2(function() {
            n4 = this;
          });
          n4.c = function() {
            f4.__$f |= 1;
            f4.setState({});
          };
          return n4;
        }();
    }
    l4 = f4;
    g3(r4);
  }
  i4(n3);
});
_3("__e", function(i4, n3, r4, t5) {
  g3();
  l4 = undefined;
  i4(n3, r4, t5);
});
_3("diffed", function(i4, n3) {
  g3();
  l4 = undefined;
  var r4;
  if (typeof n3.type == "string" && (r4 = n3.__e)) {
    var { __np: t5, props: f4 } = n3;
    if (t5) {
      var o4 = r4.U;
      if (o4)
        for (var e4 in o4) {
          var u4 = o4[e4];
          if (u4 !== undefined && !(e4 in t5)) {
            u4.d();
            o4[e4] = undefined;
          }
        }
      else {
        o4 = {};
        r4.U = o4;
      }
      for (var a4 in t5) {
        var c4 = o4[a4], v4 = t5[a4];
        if (c4 === undefined) {
          c4 = y4(r4, a4, v4, f4);
          o4[a4] = c4;
        } else
          c4.o(v4, f4);
      }
    }
  }
  i4(n3);
});
function y4(i4, n3, r4, t5) {
  var f4 = n3 in i4 && i4.ownerSVGElement === undefined, o4 = d2(r4);
  return { o: function(i5, n4) {
    o4.value = i5;
    t5 = n4;
  }, d: E2(function() {
    this.N = T3;
    var r5 = o4.value.value;
    if (t5[n3] !== r5) {
      t5[n3] = r5;
      if (f4)
        i4[n3] = r5;
      else if (r5)
        i4.setAttribute(n3, r5);
      else
        i4.removeAttribute(n3);
    }
  }) };
}
_3("unmount", function(i4, n3) {
  if (typeof n3.type == "string") {
    var r4 = n3.__e;
    if (r4) {
      var t5 = r4.U;
      if (t5) {
        r4.U = undefined;
        for (var f4 in t5) {
          var o4 = t5[f4];
          if (o4)
            o4.d();
        }
      }
    }
  } else {
    var e4 = n3.__c;
    if (e4) {
      var u4 = e4.__$u;
      if (u4) {
        e4.__$u = undefined;
        u4.d();
      }
    }
  }
  i4(n3);
});
_3("__h", function(i4, n3, r4, t5) {
  if (t5 < 3 || t5 === 9)
    n3.__$f |= 2;
  i4(n3, r4, t5);
});
x.prototype.shouldComponentUpdate = function(i4, n3) {
  var r4 = this.__$u, t5 = r4 && r4.s !== undefined;
  for (var f4 in n3)
    return true;
  if (this.__f || typeof this.u == "boolean" && this.u === true) {
    var o4 = 2 & this.__$f;
    if (!(t5 || o4 || 4 & this.__$f))
      return true;
    if (1 & this.__$f)
      return true;
  } else {
    if (!(t5 || 4 & this.__$f))
      return true;
    if (3 & this.__$f)
      return true;
  }
  for (var e4 in i4)
    if (e4 !== "__source" && i4[e4] !== this.props[e4])
      return true;
  for (var u4 in this.props)
    if (!(u4 in i4))
      return true;
  return false;
};
function useSignal(i4) {
  return T2(function() {
    return d2(i4);
  }, []);
}
var q2 = function(i4) {
  queueMicrotask(function() {
    queueMicrotask(i4);
  });
};
function F2() {
  r3(function() {
    var i4;
    while (i4 = m3.shift())
      h3.call(i4);
  });
}
function T3() {
  if (m3.push(this) === 1)
    (l.requestAnimationFrame || q2)(F2);
}

// ../common/lib/i18n.ts
function i18nFormat(i18n, targetLanguages) {
  const _i18n = copyObject(i18n);
  const i18nextFormatted = {};
  for (const language of targetLanguages) {
    i18nextFormatted[language.id] = { translation: {} };
  }
  keyMod(_i18n, (_srcRef, _id, refPath) => {
    const _i18nObject = keyPath(_i18n, refPath);
    if (typeof _i18nObject === "object" && "target" in _i18nObject) {
      for (const [language_id] of Object.entries(_i18nObject.target)) {
        if (!i18nextFormatted[language_id]) {
          i18nextFormatted[language_id] = { translation: {} };
        }
        const _18nextObject = keyPath(i18nextFormatted[language_id].translation, refPath.slice(0, -1), true);
        _18nextObject[refPath[refPath.length - 1]] = _i18nObject.target[language_id];
      }
    }
  });
  return i18nextFormatted;
}
async function init2(translations = null) {
  let resources = null;
  if (translations) {
    resources = translations;
    logger.debug(`loading languages from bundle: ${Object.keys(resources).join(", ")}`);
  } else {
    resources = await api.get("/api/translations");
    logger.debug(`loading languages from endpoint: ${Object.keys(resources).join(", ")}`);
  }
  for (const language_id of Object.keys(resources)) {
    $s.language_ui.i18n[language_id] = {};
  }
  init({
    debug: true,
    fallbackLng: "eng-gbr",
    interpolation: {
      escapeValue: false
    },
    lng: $s.language_ui.selection,
    resources
  });
  E2(() => {
    const language = $s.language_ui.selection;
    changeLanguage(language);
    logger.debug(`language changed to: ${language}`);
    store.save();
  });
}
var $t = (key, context = null) => {
  if (!$s.language_ui.i18n[$s.language_ui.selection]) {
    $s.language_ui.i18n[$s.language_ui.selection] = {};
  }
  const cacheKey = context ? `${key}:${JSON.stringify(context)}` : key;
  if (!$s.language_ui.i18n[$s.language_ui.selection][cacheKey]) {
    $s.language_ui.i18n[$s.language_ui.selection][cacheKey] = t(key, context);
  }
  return $s.language_ui.i18n[$s.language_ui.selection][cacheKey];
};

// ../common/lib/api.ts
class Api {
  async delete(endpoint, data) {
    const response = await fetch(endpoint, {
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "DELETE"
    });
    return await response.json();
  }
  async get(endpoint, params = null) {
    const url = new URL(endpoint, globalThis.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (!value) {
          value = "";
        }
        url.searchParams.append(key, String(value));
      });
    }
    const res = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "GET"
    });
    if (res.status === 401) {
      return { status: "unauthorized" };
    }
    return await res.json();
  }
  async post(endpoint, data) {
    const response = await fetch(endpoint, {
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    return await response.json();
  }
  async put(endpoint, data) {
    const response = await fetch(endpoint, {
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "PUT"
    });
    return await response.json();
  }
}

// ../common/lib/env.ts
function env(env2) {
  env2.ua = navigator.userAgent.toLowerCase();
  if (globalThis.navigator) {
    env2.isBrowser = true;
    if (env2.ua.includes("safari") && !env2.ua.includes("chrome")) {
      env2.isSafari = true;
      env2.browserName = "Safari";
    }
    if (env2.ua.includes("firefox")) {
      env2.isFirefox = env2.ua.includes("firefox");
      env2.browserName = "Firefox";
    }
  }
  const mediaQuery = globalThis.matchMedia("(max-width: 768px)");
  env2.layout = mediaQuery.matches ? "tablet" : "desktop";
  mediaQuery.addListener((event) => {
    env2.layout = event.matches ? "tablet" : "desktop";
  });
  document.addEventListener("keydown", (event) => {
    if (event.altKey) {
      env2.altKey = true;
    }
    if (event.ctrlKey) {
      env2.ctrlKey = true;
    }
    if (event.shiftKey) {
      env2.shiftKey = true;
    }
  });
  document.addEventListener("keyup", (event) => {
    if (!event.altKey) {
      env2.altKey = false;
    }
    if (!event.ctrlKey) {
      env2.ctrlKey = false;
    }
    if (!event.shiftKey) {
      env2.shiftKey = false;
    }
  });
}

// ../../node_modules/eventemitter3/index.mjs
var import__ = __toESM(require_eventemitter3(), 1);

// ../common/lib/logger.ts
var LoggerImpl;
var loggerImpl;
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  const node = (init_logger_node(), __toCommonJS(exports_logger_node));
  LoggerImpl = node.Logger;
  loggerImpl = node.logger;
} else {
  const browser = (init_logger_browser(), __toCommonJS(exports_logger_browser));
  LoggerImpl = browser.Logger;
  loggerImpl = browser.logger;
}
var Logger4 = LoggerImpl;

// ../../node_modules/deepsignal/dist/deepsignal.module.js
var a4 = new WeakMap;
var o4 = new WeakMap;
var s4 = new WeakMap;
var u4 = new WeakSet;
var c4 = new WeakMap;
var f4 = /^\$/;
var i4 = Object.getOwnPropertyDescriptor;
var l5 = false;
var g4 = function(e4) {
  if (!k3(e4))
    throw new Error("This object can't be observed.");
  return o4.has(e4) || o4.set(e4, v4(e4, d4)), o4.get(e4);
};
var v4 = function(e4, t5) {
  var r4 = new Proxy(e4, t5);
  return u4.add(r4), r4;
};
var y5 = function() {
  throw new Error("Don't mutate the signals directly.");
};
var w4 = function(e4) {
  return function(t5, u5, c5) {
    var g5;
    if (l5)
      return Reflect.get(t5, u5, c5);
    var p4 = e4 || u5[0] === "$";
    if (!e4 && p4 && Array.isArray(t5)) {
      if (u5 === "$")
        return s4.has(t5) || s4.set(t5, v4(t5, m4)), s4.get(t5);
      p4 = u5 === "$length";
    }
    a4.has(c5) || a4.set(c5, new Map);
    var h4 = a4.get(c5), y6 = p4 ? u5.replace(f4, "") : u5;
    if (h4.has(y6) || typeof ((g5 = i4(t5, y6)) == null ? undefined : g5.get) != "function") {
      var w5 = Reflect.get(t5, y6, c5);
      if (p4 && typeof w5 == "function")
        return;
      if (typeof y6 == "symbol" && b3.has(y6))
        return w5;
      h4.has(y6) || (k3(w5) && (o4.has(w5) || o4.set(w5, v4(w5, d4)), w5 = o4.get(w5)), h4.set(y6, d2(w5)));
    } else
      h4.set(y6, w3(function() {
        return Reflect.get(t5, y6, c5);
      }));
    return p4 ? h4.get(y6) : h4.get(y6).value;
  };
};
var d4 = { get: w4(false), set: function(e4, n3, s5, u5) {
  var l6;
  if (typeof ((l6 = i4(e4, n3)) == null ? undefined : l6.set) == "function")
    return Reflect.set(e4, n3, s5, u5);
  a4.has(u5) || a4.set(u5, new Map);
  var g5 = a4.get(u5);
  if (n3[0] === "$") {
    s5 instanceof u3 || y5();
    var p4 = n3.replace(f4, "");
    return g5.set(p4, s5), Reflect.set(e4, p4, s5.peek(), u5);
  }
  var h4 = s5;
  k3(s5) && (o4.has(s5) || o4.set(s5, v4(s5, d4)), h4 = o4.get(s5));
  var w5 = !(n3 in e4), m4 = Reflect.set(e4, n3, s5, u5);
  return g5.has(n3) ? g5.get(n3).value = h4 : g5.set(n3, d2(h4)), w5 && c4.has(e4) && c4.get(e4).value++, Array.isArray(e4) && g5.has("length") && (g5.get("length").value = e4.length), m4;
}, deleteProperty: function(e4, t5) {
  t5[0] === "$" && y5();
  var r4 = a4.get(o4.get(e4)), n3 = Reflect.deleteProperty(e4, t5);
  return r4 && r4.has(t5) && (r4.get(t5).value = undefined), c4.has(e4) && c4.get(e4).value++, n3;
}, ownKeys: function(e4) {
  return c4.has(e4) || c4.set(e4, d2(0)), c4._ = c4.get(e4).value, Reflect.ownKeys(e4);
} };
var m4 = { get: w4(true), set: y5, deleteProperty: y5 };
var b3 = new Set(Object.getOwnPropertyNames(Symbol).map(function(e4) {
  return Symbol[e4];
}).filter(function(e4) {
  return typeof e4 == "symbol";
}));
var R = new Set([Object, Array]);
var k3 = function(e4) {
  return typeof e4 == "object" && e4 !== null && R.has(e4.constructor) && !u4.has(e4);
};

// ../common/lib/store.ts
class Store {
  state;
  persistantState;
  constructor() {
    this.state = g4({});
  }
  load(persistantState, volatileState) {
    this.persistantState = copyObject(persistantState);
    let restoredState = {};
    try {
      restoredState = JSON.parse(localStorage.getItem("store") || "{}");
    } catch {
      restoredState = {};
    }
    Object.assign(this.state, mergeDeep(mergeDeep(persistantState, restoredState), volatileState));
  }
  filterKeys(obj, blueprint) {
    const result = {};
    for (const key in blueprint) {
      if (Object.hasOwn(obj, key)) {
        if (typeof blueprint[key] === "object" && blueprint[key] !== null) {
          result[key] = this.filterKeys(obj[key], blueprint[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }
  save() {
    localStorage.setItem("store", JSON.stringify(this.filterKeys(this.state, this.persistantState)));
  }
}

// ../common/app.ts
var logger = new Logger4;
logger.setLevel("debug");
var store = new Store;
var i18n = exports_i18n;
var $s = store.state;
var api = new Api;
var events = new import__.default;

class App {
  async init(Main, renderFn, hFn, translations) {
    env($s.env);
    await i18n.init(translations);
    try {
      renderFn(hFn(Main, {}), document.body);
    } catch (error) {
      console.error("Error rendering Main component:", error);
    }
    events.emit("app:init");
  }
}
globalThis.$s = $s;

// ../common/lib/state.ts
var persistentState = {
  language_ui: {
    selection: "eng-gbr"
  },
  panel: {
    collapsed: false
  }
};
var volatileState = {
  env: {
    layout: "desktop"
  },
  language_ui: {
    i18n: {},
    options: [
      { id: "ara", name: "Arabic" },
      { id: "zho", name: "Chinese (Simplified)" },
      { id: "nld", name: "Dutch" },
      { id: "eng-gbr", name: "English" },
      { id: "fra", name: "French" },
      { id: "deu", name: "German" }
    ]
  },
  notifications: [],
  user: {
    admin: false,
    authenticated: null,
    password: "",
    username: ""
  }
};

// src/lib/state.ts
var persistantState = mergeDeep({}, persistentState);
var volatileState2 = mergeDeep({
  currentRoute: "/components",
  env: {},
  selectedComponent: null
}, volatileState);

// ../common/lib/ws-client.ts
function constructMessage(url, data, id, method) {
  return { data, id, method, url };
}
class WebSocketClient extends import__.default {
  ws = null;
  activeSubscriptions = new Set;
  authFailure = false;
  baseReconnectDelay = 100;
  eventHandlers = {};
  intentionalClose = false;
  maxReconnectAttempts = 10;
  maxReconnectDelay = 30000;
  messageListeners = [];
  pendingRequests = new Map;
  reconnectAttempts = 0;
  reconnectTimeout = null;
  requestTimeout = 30000;
  url;
  messageQueue = [];
  constructor(baseUrl) {
    super();
    if (baseUrl.startsWith("ws://") || baseUrl.startsWith("wss://")) {
      this.url = baseUrl;
    } else {
      this.url = baseUrl.endsWith("/ws") ? baseUrl : `${baseUrl}/ws`;
    }
  }
  addEventListener(type, listener) {
    if (type === "message") {
      this.messageListeners.push(listener);
    } else if (this.ws) {
      this.ws.addEventListener(type, listener);
    }
  }
  addSubscription(topic) {
    this.activeSubscriptions.add(topic);
  }
  onRoute(url, handler) {
    if (!this.eventHandlers[url]) {
      this.eventHandlers[url] = [];
    }
    this.eventHandlers[url].push(handler);
  }
  offRoute(url, handler) {
    if (!this.eventHandlers[url]) {
      return;
    }
    if (handler) {
      this.eventHandlers[url] = this.eventHandlers[url].filter((h4) => h4 !== handler);
    } else {
      delete this.eventHandlers[url];
    }
  }
  close() {
    logger.debug("[WS] closing connection intentionally");
    this.intentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      logger.debug("[WS] already connected, skipping");
      return;
    }
    if (this.authFailure) {
      logger.debug("[WS] Not reconnecting due to previous authentication failure");
      return;
    }
    logger.debug(`[WS] connecting to ${this.url}`);
    this.intentionalClose = false;
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      logger.success(`[WS] connection established: ${this.url}`);
      this.reconnectAttempts = 0;
      this.emit("open");
      this.processMessageQueue();
    };
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (this.handleResponse(message)) {
          return;
        }
        this.emit("message", message);
        if (message.url && this.eventHandlers[message.url]) {
          this.eventHandlers[message.url].forEach((handler) => handler(message.data));
        }
        if (message.url) {
          this.emit(message.url, message.data);
        }
        this.messageListeners.forEach((listener) => listener(event));
      } catch (error) {
        logger.error("[WS] failed to parse message", error);
      }
    };
    this.ws.onclose = (event) => {
      logger.debug(`[WS] connection closed: code=${event.code}, reason=${event.reason}`);
      this.emit("close", event);
      if (event.code === 1008) {
        logger.debug("[WS] authentication failed; not reconnecting");
        this.authFailure = true;
        this.emit("unauthorized", event);
        return;
      }
      if (this.intentionalClose) {
        logger.debug("[WS] connection closed intentionally; not reconnecting");
        return;
      }
      this.reconnect();
    };
    this.ws.onerror = (error) => {
      logger.error("[WS] connection error", error);
      this.emit("error", error);
    };
  }
  isConnected() {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn(`[WS] max reconnection attempts (${this.maxReconnectAttempts}) reached; giving up`);
      this.emit("max_reconnect_attempts");
      return;
    }
    const delay = Math.min(this.baseReconnectDelay * 1.5 ** this.reconnectAttempts, this.maxReconnectDelay);
    this.reconnectAttempts++;
    logger.debug(`[WS] reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.emit("reconnecting", { attempt: this.reconnectAttempts, delay });
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  removeEventListener(type, listener) {
    if (type === "message") {
      this.messageListeners = this.messageListeners.filter((l6) => l6 !== listener);
    } else if (this.ws) {
      this.ws.removeEventListener(type, listener);
    }
  }
  resetAuthFailure() {
    logger.debug("[WS] resetting authentication failure state");
    this.authFailure = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
  processMessageQueue() {
    logger.debug(`[WS] processing message queue, ${this.messageQueue.length} messages`);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        logger.debug(`[WS] processing queued message: ${message.id}`);
        if (message.method) {
          const wsMessage = constructMessage(message.url, message.data, message.id, message.method);
          if (this.ws) {
            this.ws.send(JSON.stringify(wsMessage));
          }
        } else {
          logger.debug(`[WS] sending queued non-request message`);
          this.send(message.url, message.data);
        }
      }
    }
    logger.debug(`[WS] finished processing message queue`);
  }
  handleResponse(message) {
    if (!message.id) {
      logger.debug(`[WS] message has no id, not a response`);
      return false;
    }
    const pending = this.pendingRequests.get(message.id);
    if (!pending) {
      logger.debug(`[WS] no pending request found for id: ${message.id}`);
      return false;
    }
    logger.debug(`[WS] resolving pending request: ${message.id}`);
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(message.id);
    pending.resolve(message.data || null);
    return true;
  }
  async request(method, url, data) {
    return new Promise((resolve2, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        logger.debug("[WS] connection not open, queuing request");
        const id2 = Math.random().toString(36).slice(2, 15);
        logger.debug(`[WS] generated request id for queue: ${id2}`);
        this.messageQueue.push({ data, id: id2, method, url });
        const timeout2 = setTimeout(() => {
          logger.debug(`[WS] timeout triggered for queued request: ${id2}`);
          this.pendingRequests.delete(id2);
          reject(new Error("Request timeout while waiting for connection"));
        }, this.requestTimeout);
        this.pendingRequests.set(id2, {
          reject,
          resolve: resolve2,
          timeout: timeout2
        });
        logger.debug(`[WS] stored pending request with id: ${id2}`);
        return;
      }
      const id = Math.random().toString(36).slice(2, 15);
      logger.debug(`[WS] sending request with id: ${id}`);
      const message = constructMessage(url, data, id, method);
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for: ${url}`));
      }, this.requestTimeout);
      this.pendingRequests.set(id, {
        reject,
        resolve: resolve2,
        timeout
      });
      this.ws.send(JSON.stringify(message));
    });
  }
  async get(url, data) {
    return this.request("GET", url, data);
  }
  async post(url, data) {
    return this.request("POST", url, data);
  }
  async put(url, data) {
    return this.request("PUT", url, data);
  }
  async delete(url, data) {
    return this.request("DELETE", url, data);
  }
  send(url, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.debug("[WS] connection not open, queuing message");
      this.messageQueue.push({ data, url });
      return;
    }
    const message = constructMessage(url, data);
    this.ws.send(JSON.stringify(message));
  }
}

// ../bunchy/client.ts
var pendingStylesheetUpdates = new Set;
var exceptionOverlay = null;
function updateStylesheet(filename, publicPath) {
  if (pendingStylesheetUpdates.has(filename)) {
    return;
  }
  pendingStylesheetUpdates.add(filename);
  const allLinks = Array.from(document.querySelectorAll(`link[rel=stylesheet]`)).map((link) => link);
  const baseFileName = filename.split(".")[0];
  const linkElements = allLinks.filter((link) => {
    const href = link.href;
    const pattern = new RegExp(`/public/${baseFileName}\\.[^/]*\\.css`);
    return pattern.test(href);
  });
  if (linkElements.length === 0) {
    pendingStylesheetUpdates.delete(filename);
    return;
  }
  const newLink = document.createElement("link");
  newLink.rel = "stylesheet";
  newLink.href = `/public/${filename}?${new Date().getTime()}`;
  newLink.onload = () => {
    linkElements.forEach((oldLink) => {
      oldLink.remove();
    });
    pendingStylesheetUpdates.delete(filename);
  };
  newLink.onerror = () => {
    console.error(`Failed to load stylesheet: ${newLink.href}`);
    pendingStylesheetUpdates.delete(filename);
  };
  if (linkElements.length > 0) {
    const firstLink = linkElements[0];
    firstLink.parentNode?.insertBefore(newLink, firstLink.nextSibling);
  } else {
    document.head.appendChild(newLink);
  }
}
function showExceptionPage(task, error, details, timestamp) {
  if (exceptionOverlay) {
    exceptionOverlay.remove();
  }
  exceptionOverlay = document.createElement("div");
  exceptionOverlay.id = "bunchy-exception-overlay";
  exceptionOverlay.innerHTML = `
        <div class="bunchy-exception-container">
            <div class="bunchy-exception-header">
                <h1>\uD83D\uDEA8 Build Error</h1>
                <button class="bunchy-exception-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="bunchy-exception-content">
                <div class="bunchy-exception-task">
                    <strong>Task:</strong> ${task}
                </div>
                <div class="bunchy-exception-error">
                    <strong>Error:</strong> ${error}
                </div>
                <div class="bunchy-exception-details">
                    <strong>Details:</strong>
                    <pre>${details}</pre>
                </div>
                <div class="bunchy-exception-timestamp">
                    <strong>Time:</strong> ${new Date(timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    `;
  const styles = document.createElement("style");
  styles.textContent = `
        #bunchy-exception-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
        }

        .bunchy-exception-container {
            background: #1a1a1a;
            color: #fff;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            border: 2px solid #dc2626;
        }

        .bunchy-exception-header {
            background: #dc2626;
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px 6px 0 0;
        }

        .bunchy-exception-header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }

        .bunchy-exception-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .bunchy-exception-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .bunchy-exception-content {
            padding: 20px;
        }

        .bunchy-exception-task,
        .bunchy-exception-error,
        .bunchy-exception-details,
        .bunchy-exception-timestamp {
            margin-bottom: 16px;
        }

        .bunchy-exception-task strong,
        .bunchy-exception-error strong,
        .bunchy-exception-details strong,
        .bunchy-exception-timestamp strong {
            color: #fbbf24;
            display: block;
            margin-bottom: 4px;
        }

        .bunchy-exception-details pre {
            background: #2d2d2d;
            border: 1px solid #404040;
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 12px;
            line-height: 1.4;
            color: #f87171;
        }

        .bunchy-exception-timestamp {
            font-size: 14px;
            color: #9ca3af;
            border-top: 1px solid #404040;
            padding-top: 12px;
        }
    `;
  if (!document.querySelector("#bunchy-exception-styles")) {
    styles.id = "bunchy-exception-styles";
    document.head.appendChild(styles);
  }
  document.body.appendChild(exceptionOverlay);
  const escapeHandler = (e4) => {
    if (e4.key === "Escape" && exceptionOverlay) {
      exceptionOverlay.remove();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);
}
function hideExceptionPage() {
  if (exceptionOverlay) {
    exceptionOverlay.remove();
    exceptionOverlay = null;
  }
}

class BunchyClient extends WebSocketClient {
  constructor() {
    const url = `ws://${window.location.hostname}:${window.location.port}/bunchy`;
    super(url);
    this.setupRouter();
    setTimeout(() => {
      this.connect();
    }, 100);
  }
  setupRouter() {
    this.onRoute("/tasks/code_frontend", () => {
      hideExceptionPage();
      window.location.reload();
    });
    this.onRoute("/tasks/html", () => {
      hideExceptionPage();
      window.location.reload();
    });
    this.onRoute("/tasks/styles/app", (data) => {
      const { filename, publicPath } = data;
      hideExceptionPage();
      updateStylesheet(filename, publicPath);
    });
    this.onRoute("/tasks/styles/components", (data) => {
      const { filename, publicPath } = data;
      hideExceptionPage();
      updateStylesheet(filename, publicPath);
    });
    this.onRoute("/tasks/error", (data) => {
      const { task, error, details, timestamp } = data;
      showExceptionPage(task, error, details, timestamp);
    });
  }
}
// ../../node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f5 = 0;
function u5(e4, t5, n3, o5, i5, u6) {
  t5 || (t5 = {});
  var a5, c5, p4 = t5;
  if ("ref" in p4)
    for (c5 in p4 = {}, t5)
      c5 == "ref" ? a5 = t5[c5] : p4[c5] = t5[c5];
  var l6 = { type: e4, props: p4, key: n3, ref: a5, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: undefined, __v: --f5, __i: -1, __u: 0, __source: i5, __self: u6 };
  if (typeof e4 == "function" && (a5 = e4.defaultProps))
    for (c5 in a5)
      p4[c5] === undefined && (p4[c5] = a5[c5]);
  return l.vnode && l.vnode(l6), l6;
}

// src/components/pages/components.tsx
var state = g4({
  model: "test"
});
var Components = () => /* @__PURE__ */ u5("div", {
  class: "styleguide__page",
  children: [
    /* @__PURE__ */ u5("h1", {
      children: "Components"
    }, undefined, false, undefined, this),
    /* @__PURE__ */ u5("p", {
      children: "All available components from @garage44/common"
    }, undefined, false, undefined, this)
  ]
}, undefined, true, undefined, this);

// ../../node_modules/preact-router/dist/preact-router.mjs
var a5 = {};
function c5(n3, t5) {
  for (var r4 in t5)
    n3[r4] = t5[r4];
  return n3;
}
function s5(n3, t5, r4) {
  var i5, o5 = /(?:\?([^#]*))?(#.*)?$/, e4 = n3.match(o5), u6 = {};
  if (e4 && e4[1])
    for (var f6 = e4[1].split("&"), c6 = 0;c6 < f6.length; c6++) {
      var s6 = f6[c6].split("=");
      u6[decodeURIComponent(s6[0])] = decodeURIComponent(s6.slice(1).join("="));
    }
  n3 = d6(n3.replace(o5, "")), t5 = d6(t5 || "");
  for (var h4 = Math.max(n3.length, t5.length), v5 = 0;v5 < h4; v5++)
    if (t5[v5] && t5[v5].charAt(0) === ":") {
      var l6 = t5[v5].replace(/(^:|[+*?]+$)/g, ""), p4 = (t5[v5].match(/[+*?]+$/) || a5)[0] || "", m5 = ~p4.indexOf("+"), y6 = ~p4.indexOf("*"), U = n3[v5] || "";
      if (!U && !y6 && (p4.indexOf("?") < 0 || m5)) {
        i5 = false;
        break;
      }
      if (u6[l6] = decodeURIComponent(U), m5 || y6) {
        u6[l6] = n3.slice(v5).map(decodeURIComponent).join("/");
        break;
      }
    } else if (t5[v5] !== n3[v5]) {
      i5 = false;
      break;
    }
  return (r4.default === true || i5 !== false) && u6;
}
function h4(n3, t5) {
  return n3.rank < t5.rank ? 1 : n3.rank > t5.rank ? -1 : n3.index - t5.index;
}
function v5(n3, t5) {
  return n3.index = t5, n3.rank = function(n4) {
    return n4.props.default ? 0 : d6(n4.props.path).map(l6).join("");
  }(n3), n3.props;
}
function d6(n3) {
  return n3.replace(/(^\/+|\/+$)/g, "").split("/");
}
function l6(n3) {
  return n3.charAt(0) == ":" ? 1 + "*+?".indexOf(n3.charAt(n3.length - 1)) || 4 : 5;
}
var p4 = {};
var m5 = [];
var y6 = [];
var U = null;
var g5 = { url: R2() };
var k4 = K(g5);
function R2() {
  var n3;
  return "" + ((n3 = U && U.location ? U.location : U && U.getCurrentLocation ? U.getCurrentLocation() : typeof location != "undefined" ? location : p4).pathname || "") + (n3.search || "");
}
function $2(n3, t5) {
  return t5 === undefined && (t5 = false), typeof n3 != "string" && n3.url && (t5 = n3.replace, n3 = n3.url), function(n4) {
    for (var t6 = m5.length;t6--; )
      if (m5[t6].canRoute(n4))
        return true;
    return false;
  }(n3) && function(n4, t6) {
    t6 === undefined && (t6 = "push"), U && U[t6] ? U[t6](n4) : typeof history != "undefined" && history[t6 + "State"] && history[t6 + "State"](null, null, n4);
  }(n3, t5 ? "replace" : "push"), I2(n3);
}
function I2(n3) {
  for (var t5 = false, r4 = 0;r4 < m5.length; r4++)
    m5[r4].routeTo(n3) && (t5 = true);
  return t5;
}
function M2(n3) {
  if (n3 && n3.getAttribute) {
    var t5 = n3.getAttribute("href"), r4 = n3.getAttribute("target");
    if (t5 && t5.match(/^\//g) && (!r4 || r4.match(/^_?self$/i)))
      return $2(t5);
  }
}
function b4(n3) {
  return n3.stopImmediatePropagation && n3.stopImmediatePropagation(), n3.stopPropagation && n3.stopPropagation(), n3.preventDefault(), false;
}
function W(n3) {
  if (!(n3.ctrlKey || n3.metaKey || n3.altKey || n3.shiftKey || n3.button)) {
    var t5 = n3.target;
    do {
      if (t5.localName === "a" && t5.getAttribute("href")) {
        if (t5.hasAttribute("data-native") || t5.hasAttribute("native"))
          return;
        if (M2(t5))
          return b4(n3);
      }
    } while (t5 = t5.parentNode);
  }
}
var w5 = false;
function D2(n3) {
  n3.history && (U = n3.history), this.state = { url: n3.url || R2() };
}
c5(D2.prototype = new x, { shouldComponentUpdate: function(n3) {
  return n3.static !== true || n3.url !== this.props.url || n3.onChange !== this.props.onChange;
}, canRoute: function(n3) {
  var t5 = H(this.props.children);
  return this.g(t5, n3) !== undefined;
}, routeTo: function(n3) {
  this.setState({ url: n3 });
  var t5 = this.canRoute(n3);
  return this.p || this.forceUpdate(), t5;
}, componentWillMount: function() {
  this.p = true;
}, componentDidMount: function() {
  var n3 = this;
  w5 || (w5 = true, U || addEventListener("popstate", function() {
    I2(R2());
  }), addEventListener("click", W)), m5.push(this), U && (this.u = U.listen(function(t5) {
    var r4 = t5.location || t5;
    n3.routeTo("" + (r4.pathname || "") + (r4.search || ""));
  })), this.p = false;
}, componentWillUnmount: function() {
  typeof this.u == "function" && this.u(), m5.splice(m5.indexOf(this), 1);
}, componentWillUpdate: function() {
  this.p = true;
}, componentDidUpdate: function() {
  this.p = false;
}, g: function(n3, t5) {
  n3 = n3.filter(v5).sort(h4);
  for (var r4 = 0;r4 < n3.length; r4++) {
    var i5 = n3[r4], o5 = s5(t5, i5.props.path, i5.props);
    if (o5)
      return [i5, o5];
  }
}, render: function(n3, t5) {
  var e4, u6, f6 = n3.onChange, a6 = t5.url, s6 = this.c, h5 = this.g(H(n3.children), a6);
  if (h5 && (u6 = J(h5[0], c5(c5({ url: a6, matches: e4 = h5[1] }, e4), { key: undefined, ref: undefined }))), a6 !== (s6 && s6.url)) {
    c5(g5, s6 = this.c = { url: a6, previous: s6 && s6.url, current: u6, path: u6 ? u6.props.path : null, matches: e4 }), s6.router = this, s6.active = u6 ? [u6] : [];
    for (var v6 = y6.length;v6--; )
      y6[v6]({});
    typeof f6 == "function" && f6(s6);
  }
  return _(k4.Provider, { value: s6 }, u6);
} });

// src/components/navigation.tsx
var Navigation = () => /* @__PURE__ */ u5("nav", {
  class: "styleguide__nav",
  children: [
    /* @__PURE__ */ u5("h1", {
      class: "styleguide__title",
      children: "Garage44 Common"
    }, undefined, false, undefined, this),
    /* @__PURE__ */ u5("ul", {
      class: "styleguide__nav-list",
      children: [
        /* @__PURE__ */ u5("li", {
          children: /* @__PURE__ */ u5("button", {
            class: `styleguide__nav-link ${$s2.currentRoute === "/components" ? "active" : ""}`,
            onClick: () => {
              $s2.currentRoute = "/components";
              $2("/components");
            },
            children: "Components"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("li", {
          children: /* @__PURE__ */ u5("button", {
            class: `styleguide__nav-link ${$s2.currentRoute === "/tokens" ? "active" : ""}`,
            onClick: () => {
              $s2.currentRoute = "/tokens";
              $2("/tokens");
            },
            children: "Design Tokens"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/pages/tokens.tsx
var Tokens = () => /* @__PURE__ */ u5("div", {
  class: "styleguide__page",
  children: [
    /* @__PURE__ */ u5("h1", {
      children: "Design Tokens"
    }, undefined, false, undefined, this),
    /* @__PURE__ */ u5("p", {
      children: "Colors, typography, spacing, and other design system values"
    }, undefined, false, undefined, this),
    /* @__PURE__ */ u5("section", {
      class: "token-section",
      children: [
        /* @__PURE__ */ u5("h2", {
          children: "Colors"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("h3", {
          children: "Surface (Neutral)"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "color-grid",
          children: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i5) => /* @__PURE__ */ u5("div", {
            class: "color-swatch",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__color",
                style: `background: var(--surface-${i5})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__label",
                children: /* @__PURE__ */ u5("code", {
                  children: [
                    "--surface-",
                    i5
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, i5, true, undefined, this))
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("h3", {
          children: "Primary"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "color-grid",
          children: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i5) => /* @__PURE__ */ u5("div", {
            class: "color-swatch",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__color",
                style: `background: var(--primary-${i5})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__label",
                children: /* @__PURE__ */ u5("code", {
                  children: [
                    "--primary-",
                    i5
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, i5, true, undefined, this))
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("h3", {
          children: "Success"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "color-grid",
          children: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i5) => /* @__PURE__ */ u5("div", {
            class: "color-swatch",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__color",
                style: `background: var(--success-${i5})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__label",
                children: /* @__PURE__ */ u5("code", {
                  children: [
                    "--success-",
                    i5
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, i5, true, undefined, this))
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("h3", {
          children: "Danger"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "color-grid",
          children: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i5) => /* @__PURE__ */ u5("div", {
            class: "color-swatch",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__color",
                style: `background: var(--danger-${i5})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__label",
                children: /* @__PURE__ */ u5("code", {
                  children: [
                    "--danger-",
                    i5
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, i5, true, undefined, this))
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("h3", {
          children: "Warning"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "color-grid",
          children: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i5) => /* @__PURE__ */ u5("div", {
            class: "color-swatch",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__color",
                style: `background: var(--warning-${i5})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "color-swatch__label",
                children: /* @__PURE__ */ u5("code", {
                  children: [
                    "--warning-",
                    i5
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, i5, true, undefined, this))
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this),
    /* @__PURE__ */ u5("section", {
      class: "token-section",
      children: [
        /* @__PURE__ */ u5("h2", {
          children: "Typography"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "typography-scale",
          children: [
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-xxs)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-xxs (0.61rem / 10px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-xs)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-xs (0.74rem / 12px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-s)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-s (0.8rem / 13px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-d)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-d (0.9rem / 14px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-l)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-l (1.05rem / 17px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-xl)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-xl (1.3rem / 21px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ u5("div", {
              class: "typography-item",
              children: [
                /* @__PURE__ */ u5("div", {
                  class: "typography-example",
                  style: "font-size: var(--font-xxl)",
                  children: "The quick brown fox jumps over the lazy dog"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ u5("code", {
                  children: "--font-xxl (3rem / 48px)"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this),
    /* @__PURE__ */ u5("section", {
      class: "token-section",
      children: [
        /* @__PURE__ */ u5("h2", {
          children: "Spacing"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "spacing-scale",
          children: [
            { name: "--spacer-025", value: "calc(var(--spacer-1) * 0.25)", px: "2px" },
            { name: "--spacer-05", value: "calc(var(--spacer-1) * 0.5)", px: "4px" },
            { name: "--spacer-1", value: "8px", px: "8px" },
            { name: "--spacer-2", value: "calc(var(--spacer-1) * 2)", px: "16px" },
            { name: "--spacer-3", value: "calc(var(--spacer-1) * 3)", px: "24px" },
            { name: "--spacer-4", value: "calc(var(--spacer-1) * 4)", px: "32px" },
            { name: "--spacer-5", value: "calc(var(--spacer-1) * 5)", px: "40px" },
            { name: "--spacer-6", value: "calc(var(--spacer-1) * 6)", px: "48px" },
            { name: "--spacer-7", value: "calc(var(--spacer-1) * 7)", px: "56px" },
            { name: "--spacer-8", value: "calc(var(--spacer-1) * 8)", px: "64px" }
          ].map(({ name, value, px }) => /* @__PURE__ */ u5("div", {
            class: "spacing-item",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "spacing-visual",
                style: `width: var(${name}); height: var(${name})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "spacing-info",
                children: [
                  /* @__PURE__ */ u5("code", {
                    children: name
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u5("div", {
                    class: "spacing-value",
                    children: [
                      value,
                      " (",
                      px,
                      ")"
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, name, true, undefined, this))
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this),
    /* @__PURE__ */ u5("section", {
      class: "token-section",
      children: [
        /* @__PURE__ */ u5("h2", {
          children: "Icons"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "icon-scale",
          children: [
            { name: "--icon-xs", px: "14px" },
            { name: "--icon-s", px: "16px" },
            { name: "--icon-d", px: "24px" },
            { name: "--icon-l", px: "32px" },
            { name: "--icon-xl", px: "36px" }
          ].map(({ name, px }) => /* @__PURE__ */ u5("div", {
            class: "icon-size-item",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "icon-size-visual",
                style: `width: var(${name}); height: var(${name})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "icon-size-info",
                children: [
                  /* @__PURE__ */ u5("code", {
                    children: name
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u5("div", {
                    class: "icon-size-value",
                    children: px
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, name, true, undefined, this))
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this),
    /* @__PURE__ */ u5("section", {
      class: "token-section",
      children: [
        /* @__PURE__ */ u5("h2", {
          children: "Border Radius"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ u5("div", {
          class: "radius-scale",
          children: [
            { name: "--border-radius-xs", px: "4px" },
            { name: "--border-radius-s", px: "4px" },
            { name: "--border-radius-d", px: "8px" },
            { name: "--border-radius-l", px: "12px" },
            { name: "--border-radius-xl", px: "16px" }
          ].map(({ name, px }) => /* @__PURE__ */ u5("div", {
            class: "radius-item",
            children: [
              /* @__PURE__ */ u5("div", {
                class: "radius-visual",
                style: `border-radius: var(${name})`
              }, undefined, false, undefined, this),
              /* @__PURE__ */ u5("div", {
                class: "radius-info",
                children: [
                  /* @__PURE__ */ u5("code", {
                    children: name
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ u5("div", {
                    class: "radius-value",
                    children: px
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, name, true, undefined, this))
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/main.tsx
var Main = () => /* @__PURE__ */ u5("div", {
  class: "styleguide",
  children: [
    /* @__PURE__ */ u5(Navigation, {}, undefined, false, undefined, this),
    /* @__PURE__ */ u5("main", {
      class: "styleguide__content",
      children: /* @__PURE__ */ u5(D2, {
        children: [
          /* @__PURE__ */ u5(Components, {
            path: "/components"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ u5(Components, {
            path: "/",
            default: true
          }, undefined, false, undefined, this),
          /* @__PURE__ */ u5(Tokens, {
            path: "/tokens"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/app.ts
new BunchyClient;
var $s2 = $s;
store.load(persistantState, volatileState2);
var app = new App;
var mockTranslations = {
  "nav.components": "Components",
  "nav.tokens": "Design Tokens",
  "styleguide.components": "Components",
  "styleguide.title": "Garage44 Common Styleguide",
  "styleguide.tokens": "Design Tokens"
};
app.init(Main, E, _, mockTranslations);
export {
  app,
  $s2 as $s
};

//# debugId=BDB276A5C07CE1D964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCAibm9kZTpwYXRoIiwgIi4uLy4uL2NvbW1vbi9saWIvbG9nZ2VyLm5vZGUudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9sb2dnZXIuYnJvd3Nlci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaTE4bmV4dC9kaXN0L2VzbS9pMThuZXh0LmpzIiwgIi4uLy4uL2NvbW1vbi9saWIvdXRpbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5tb2R1bGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3ByZWFjdC9ob29rcy9kaXN0L2hvb2tzLm1vZHVsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHByZWFjdC9zaWduYWxzLWNvcmUvZGlzdC9zaWduYWxzLWNvcmUubW9kdWxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AcHJlYWN0L3NpZ25hbHMvZGlzdC9zaWduYWxzLm1vZHVsZS5qcyIsICIuLi8uLi9jb21tb24vbGliL2kxOG4udHMiLCAiLi4vLi4vY29tbW9uL2xpYi9hcGkudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9lbnYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXgubWpzIiwgIi4uLy4uL2NvbW1vbi9saWIvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kZWVwc2lnbmFsL2Rpc3QvZGVlcHNpZ25hbC5tb2R1bGUuanMiLCAiLi4vLi4vY29tbW9uL2xpYi9zdG9yZS50cyIsICIuLi8uLi9jb21tb24vYXBwLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvc3RhdGUudHMiLCAiLi4vc3JjL2xpYi9zdGF0ZS50cyIsICIuLi8uLi9jb21tb24vbGliL3dzLWNsaWVudC50cyIsICIuLi8uLi9idW5jaHkvY2xpZW50LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcmVhY3QvanN4LXJ1bnRpbWUvZGlzdC9qc3hSdW50aW1lLm1vZHVsZS5qcyIsICIuLi9zcmMvY29tcG9uZW50cy9wYWdlcy9jb21wb25lbnRzLnRzeCIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcHJlYWN0LXJvdXRlci9kaXN0L3ByZWFjdC1yb3V0ZXIubWpzIiwgIi4uL3NyYy9jb21wb25lbnRzL25hdmlnYXRpb24udHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL3BhZ2VzL3Rva2Vucy50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvbWFpbi50c3giLCAiLi4vc3JjL2FwcC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKiFcblx0Q29weXJpZ2h0IChjKSAyMDE4IEplZCBXYXRzb24uXG5cdExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG5cdGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG4vKiBnbG9iYWwgZGVmaW5lICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgaGFzT3duID0ge30uaGFzT3duUHJvcGVydHk7XG5cblx0ZnVuY3Rpb24gY2xhc3NOYW1lcyAoKSB7XG5cdFx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKGFyZykge1xuXHRcdFx0XHRjbGFzc2VzID0gYXBwZW5kQ2xhc3MoY2xhc3NlcywgcGFyc2VWYWx1ZShhcmcpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3Nlcztcblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlVmFsdWUgKGFyZykge1xuXHRcdGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmV0dXJuIGFyZztcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGFyZyAhPT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpO1xuXHRcdH1cblxuXHRcdGlmIChhcmcudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgJiYgIWFyZy50b1N0cmluZy50b1N0cmluZygpLmluY2x1ZGVzKCdbbmF0aXZlIGNvZGVdJykpIHtcblx0XHRcdHJldHVybiBhcmcudG9TdHJpbmcoKTtcblx0XHR9XG5cblx0XHR2YXIgY2xhc3NlcyA9ICcnO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0aWYgKGhhc093bi5jYWxsKGFyZywga2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRjbGFzc2VzID0gYXBwZW5kQ2xhc3MoY2xhc3Nlcywga2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3Nlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGFwcGVuZENsYXNzICh2YWx1ZSwgbmV3Q2xhc3MpIHtcblx0XHRpZiAoIW5ld0NsYXNzKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHRcblx0XHRpZiAodmFsdWUpIHtcblx0XHRcdHJldHVybiB2YWx1ZSArICcgJyArIG5ld0NsYXNzO1xuXHRcdH1cblx0XG5cdFx0cmV0dXJuIHZhbHVlICsgbmV3Q2xhc3M7XG5cdH1cblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRjbGFzc05hbWVzLmRlZmF1bHQgPSBjbGFzc05hbWVzO1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gcmVnaXN0ZXIgYXMgJ2NsYXNzbmFtZXMnLCBjb25zaXN0ZW50IHdpdGggbnBtIHBhY2thZ2UgbmFtZVxuXHRcdGRlZmluZSgnY2xhc3NuYW1lcycsIFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG5cdH1cbn0oKSk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbiAgLCBwcmVmaXggPSAnfic7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgdG8gY3JlYXRlIGEgc3RvcmFnZSBmb3Igb3VyIGBFRWAgb2JqZWN0cy5cbiAqIEFuIGBFdmVudHNgIGluc3RhbmNlIGlzIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRXZlbnRzKCkge31cblxuLy9cbi8vIFdlIHRyeSB0byBub3QgaW5oZXJpdCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC4gSW4gc29tZSBlbmdpbmVzIGNyZWF0aW5nIGFuXG4vLyBpbnN0YW5jZSBpbiB0aGlzIHdheSBpcyBmYXN0ZXIgdGhhbiBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKG51bGwpYCBkaXJlY3RseS5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBjaGFyYWN0ZXIgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Rcbi8vIG92ZXJyaWRkZW4gb3IgdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy9cbmlmIChPYmplY3QuY3JlYXRlKSB7XG4gIEV2ZW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vXG4gIC8vIFRoaXMgaGFjayBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgYF9fcHJvdG9fX2AgcHJvcGVydHkgaXMgc3RpbGwgaW5oZXJpdGVkIGluXG4gIC8vIHNvbWUgb2xkIGJyb3dzZXJzIGxpa2UgQW5kcm9pZCA0LCBpUGhvbmUgNS4xLCBPcGVyYSAxMSBhbmQgU2FmYXJpIDUuXG4gIC8vXG4gIGlmICghbmV3IEV2ZW50cygpLl9fcHJvdG9fXykgcHJlZml4ID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgZXZlbnQgbGlzdGVuZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBjb250ZXh0IFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29uY2U9ZmFsc2VdIFNwZWNpZnkgaWYgdGhlIGxpc3RlbmVyIGlzIGEgb25lLXRpbWUgbGlzdGVuZXIuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50RW1pdHRlcn0gZW1pdHRlciBSZWZlcmVuY2UgdG8gdGhlIGBFdmVudEVtaXR0ZXJgIGluc3RhbmNlLlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBjb250ZXh0IFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBTcGVjaWZ5IGlmIHRoZSBsaXN0ZW5lciBpcyBhIG9uZS10aW1lIGxpc3RlbmVyLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKGVtaXR0ZXIsIGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGxpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB9XG5cbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IGVtaXR0ZXIsIG9uY2UpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghZW1pdHRlci5fZXZlbnRzW2V2dF0pIGVtaXR0ZXIuX2V2ZW50c1tldnRdID0gbGlzdGVuZXIsIGVtaXR0ZXIuX2V2ZW50c0NvdW50Kys7XG4gIGVsc2UgaWYgKCFlbWl0dGVyLl9ldmVudHNbZXZ0XS5mbikgZW1pdHRlci5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2UgZW1pdHRlci5fZXZlbnRzW2V2dF0gPSBbZW1pdHRlci5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXTtcblxuICByZXR1cm4gZW1pdHRlcjtcbn1cblxuLyoqXG4gKiBDbGVhciBldmVudCBieSBuYW1lLlxuICpcbiAqIEBwYXJhbSB7RXZlbnRFbWl0dGVyfSBlbWl0dGVyIFJlZmVyZW5jZSB0byB0aGUgYEV2ZW50RW1pdHRlcmAgaW5zdGFuY2UuXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZ0IFRoZSBFdmVudCBuYW1lLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY2xlYXJFdmVudChlbWl0dGVyLCBldnQpIHtcbiAgaWYgKC0tZW1pdHRlci5fZXZlbnRzQ291bnQgPT09IDApIGVtaXR0ZXIuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgZWxzZSBkZWxldGUgZW1pdHRlci5fZXZlbnRzW2V2dF07XG59XG5cbi8qKlxuICogTWluaW1hbCBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBsaXN0aW5nIHRoZSBldmVudHMgZm9yIHdoaWNoIHRoZSBlbWl0dGVyIGhhcyByZWdpc3RlcmVkXG4gKiBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge0FycmF5fVxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICB2YXIgbmFtZXMgPSBbXVxuICAgICwgZXZlbnRzXG4gICAgLCBuYW1lO1xuXG4gIGlmICh0aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgcmV0dXJuIG5hbWVzO1xuXG4gIGZvciAobmFtZSBpbiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzKSkge1xuICAgIGlmIChoYXMuY2FsbChldmVudHMsIG5hbWUpKSBuYW1lcy5wdXNoKHByZWZpeCA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lKTtcbiAgfVxuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgcmV0dXJuIG5hbWVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGV2ZW50cykpO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtBcnJheX0gVGhlIHJlZ2lzdGVyZWQgbGlzdGVuZXJzLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoIWhhbmRsZXJzKSByZXR1cm4gW107XG4gIGlmIChoYW5kbGVycy5mbikgcmV0dXJuIFtoYW5kbGVycy5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBoYW5kbGVycy5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBoYW5kbGVyc1tpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGxpc3RlbmluZyB0byBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiBsaXN0ZW5lckNvdW50KGV2ZW50KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoIWxpc3RlbmVycykgcmV0dXJuIDA7XG4gIGlmIChsaXN0ZW5lcnMuZm4pIHJldHVybiAxO1xuICByZXR1cm4gbGlzdGVuZXJzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQ2FsbHMgZWFjaCBvZiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgZWxzZSBgZmFsc2VgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBjYXNlIDQ6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIsIGEzKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQWRkIGEgbGlzdGVuZXIgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBbY29udGV4dD10aGlzXSBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRoaXMsIGV2ZW50LCBmbiwgY29udGV4dCwgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBBZGQgYSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRoaXMsIGV2ZW50LCBmbiwgY29udGV4dCwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgbGlzdGVuZXJzIG9mIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IG1hdGNoIHRoaXMgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IGNvbnRleHQgT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IGhhdmUgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uZS10aW1lIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcbiAgaWYgKCFmbikge1xuICAgIGNsZWFyRXZlbnQodGhpcywgZXZ0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKFxuICAgICAgbGlzdGVuZXJzLmZuID09PSBmbiAmJlxuICAgICAgKCFvbmNlIHx8IGxpc3RlbmVycy5vbmNlKSAmJlxuICAgICAgKCFjb250ZXh0IHx8IGxpc3RlbmVycy5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICkge1xuICAgICAgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZXZlbnRzID0gW10sIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKFxuICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuIHx8XG4gICAgICAgIChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSkgfHxcbiAgICAgICAgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgICAvL1xuICAgIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gICAgZWxzZSBjbGVhckV2ZW50KHRoaXMsIGV2dCk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIG9mIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IFtldmVudF0gVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQ7XG5cbiAgaWYgKGV2ZW50KSB7XG4gICAgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2dF0pIGNsZWFyRXZlbnQodGhpcywgZXZ0KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEFsbG93IGBFdmVudEVtaXR0ZXJgIHRvIGJlIGltcG9ydGVkIGFzIG1vZHVsZSBuYW1lc3BhY2UuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsCiAgICAiZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoKXtpZih0eXBlb2YgcGF0aCE9PVwic3RyaW5nXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhdGggbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQgXCIrSlNPTi5zdHJpbmdpZnkocGF0aCkpfWZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsYWxsb3dBYm92ZVJvb3Qpe3ZhciByZXM9XCJcIixsYXN0U2VnbWVudExlbmd0aD0wLGxhc3RTbGFzaD0tMSxkb3RzPTAsY29kZTtmb3IodmFyIGk9MDtpPD1wYXRoLmxlbmd0aDsrK2kpe2lmKGk8cGF0aC5sZW5ndGgpY29kZT1wYXRoLmNoYXJDb2RlQXQoaSk7ZWxzZSBpZihjb2RlPT09NDcpYnJlYWs7ZWxzZSBjb2RlPTQ3O2lmKGNvZGU9PT00Nyl7aWYobGFzdFNsYXNoPT09aS0xfHxkb3RzPT09MSk7ZWxzZSBpZihsYXN0U2xhc2ghPT1pLTEmJmRvdHM9PT0yKXtpZihyZXMubGVuZ3RoPDJ8fGxhc3RTZWdtZW50TGVuZ3RoIT09Mnx8cmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aC0xKSE9PTQ2fHxyZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoLTIpIT09NDYpe2lmKHJlcy5sZW5ndGg+Mil7dmFyIGxhc3RTbGFzaEluZGV4PXJlcy5sYXN0SW5kZXhPZihcIi9cIik7aWYobGFzdFNsYXNoSW5kZXghPT1yZXMubGVuZ3RoLTEpe2lmKGxhc3RTbGFzaEluZGV4PT09LTEpcmVzPVwiXCIsbGFzdFNlZ21lbnRMZW5ndGg9MDtlbHNlIHJlcz1yZXMuc2xpY2UoMCxsYXN0U2xhc2hJbmRleCksbGFzdFNlZ21lbnRMZW5ndGg9cmVzLmxlbmd0aC0xLXJlcy5sYXN0SW5kZXhPZihcIi9cIik7bGFzdFNsYXNoPWksZG90cz0wO2NvbnRpbnVlfX1lbHNlIGlmKHJlcy5sZW5ndGg9PT0yfHxyZXMubGVuZ3RoPT09MSl7cmVzPVwiXCIsbGFzdFNlZ21lbnRMZW5ndGg9MCxsYXN0U2xhc2g9aSxkb3RzPTA7Y29udGludWV9fWlmKGFsbG93QWJvdmVSb290KXtpZihyZXMubGVuZ3RoPjApcmVzKz1cIi8uLlwiO2Vsc2UgcmVzPVwiLi5cIjtsYXN0U2VnbWVudExlbmd0aD0yfX1lbHNle2lmKHJlcy5sZW5ndGg+MClyZXMrPVwiL1wiK3BhdGguc2xpY2UobGFzdFNsYXNoKzEsaSk7ZWxzZSByZXM9cGF0aC5zbGljZShsYXN0U2xhc2grMSxpKTtsYXN0U2VnbWVudExlbmd0aD1pLWxhc3RTbGFzaC0xfWxhc3RTbGFzaD1pLGRvdHM9MH1lbHNlIGlmKGNvZGU9PT00NiYmZG90cyE9PS0xKSsrZG90cztlbHNlIGRvdHM9LTF9cmV0dXJuIHJlc31mdW5jdGlvbiBfZm9ybWF0KHNlcCxwYXRoT2JqZWN0KXt2YXIgZGlyPXBhdGhPYmplY3QuZGlyfHxwYXRoT2JqZWN0LnJvb3QsYmFzZT1wYXRoT2JqZWN0LmJhc2V8fChwYXRoT2JqZWN0Lm5hbWV8fFwiXCIpKyhwYXRoT2JqZWN0LmV4dHx8XCJcIik7aWYoIWRpcilyZXR1cm4gYmFzZTtpZihkaXI9PT1wYXRoT2JqZWN0LnJvb3QpcmV0dXJuIGRpcitiYXNlO3JldHVybiBkaXIrc2VwK2Jhc2V9ZnVuY3Rpb24gcmVzb2x2ZSgpe3ZhciByZXNvbHZlZFBhdGg9XCJcIixyZXNvbHZlZEFic29sdXRlPSExLGN3ZDtmb3IodmFyIGk9YXJndW1lbnRzLmxlbmd0aC0xO2k+PS0xJiYhcmVzb2x2ZWRBYnNvbHV0ZTtpLS0pe3ZhciBwYXRoO2lmKGk+PTApcGF0aD1hcmd1bWVudHNbaV07ZWxzZXtpZihjd2Q9PT12b2lkIDApY3dkPXByb2Nlc3MuY3dkKCk7cGF0aD1jd2R9aWYoYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD09PTApY29udGludWU7cmVzb2x2ZWRQYXRoPXBhdGgrXCIvXCIrcmVzb2x2ZWRQYXRoLHJlc29sdmVkQWJzb2x1dGU9cGF0aC5jaGFyQ29kZUF0KDApPT09NDd9aWYocmVzb2x2ZWRQYXRoPW5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwhcmVzb2x2ZWRBYnNvbHV0ZSkscmVzb2x2ZWRBYnNvbHV0ZSlpZihyZXNvbHZlZFBhdGgubGVuZ3RoPjApcmV0dXJuXCIvXCIrcmVzb2x2ZWRQYXRoO2Vsc2UgcmV0dXJuXCIvXCI7ZWxzZSBpZihyZXNvbHZlZFBhdGgubGVuZ3RoPjApcmV0dXJuIHJlc29sdmVkUGF0aDtlbHNlIHJldHVyblwiLlwifWZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKXtpZihhc3NlcnRQYXRoKHBhdGgpLHBhdGgubGVuZ3RoPT09MClyZXR1cm5cIi5cIjt2YXIgaXNBYnNvbHV0ZT1wYXRoLmNoYXJDb2RlQXQoMCk9PT00Nyx0cmFpbGluZ1NlcGFyYXRvcj1wYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGgtMSk9PT00NztpZihwYXRoPW5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsIWlzQWJzb2x1dGUpLHBhdGgubGVuZ3RoPT09MCYmIWlzQWJzb2x1dGUpcGF0aD1cIi5cIjtpZihwYXRoLmxlbmd0aD4wJiZ0cmFpbGluZ1NlcGFyYXRvcilwYXRoKz1cIi9cIjtpZihpc0Fic29sdXRlKXJldHVyblwiL1wiK3BhdGg7cmV0dXJuIHBhdGh9ZnVuY3Rpb24gaXNBYnNvbHV0ZShwYXRoKXtyZXR1cm4gYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD4wJiZwYXRoLmNoYXJDb2RlQXQoMCk9PT00N31mdW5jdGlvbiBqb2luKCl7aWYoYXJndW1lbnRzLmxlbmd0aD09PTApcmV0dXJuXCIuXCI7dmFyIGpvaW5lZDtmb3IodmFyIGk9MDtpPGFyZ3VtZW50cy5sZW5ndGg7KytpKXt2YXIgYXJnPWFyZ3VtZW50c1tpXTtpZihhc3NlcnRQYXRoKGFyZyksYXJnLmxlbmd0aD4wKWlmKGpvaW5lZD09PXZvaWQgMClqb2luZWQ9YXJnO2Vsc2Ugam9pbmVkKz1cIi9cIithcmd9aWYoam9pbmVkPT09dm9pZCAwKXJldHVyblwiLlwiO3JldHVybiBub3JtYWxpemUoam9pbmVkKX1mdW5jdGlvbiByZWxhdGl2ZShmcm9tLHRvKXtpZihhc3NlcnRQYXRoKGZyb20pLGFzc2VydFBhdGgodG8pLGZyb209PT10bylyZXR1cm5cIlwiO2lmKGZyb209cmVzb2x2ZShmcm9tKSx0bz1yZXNvbHZlKHRvKSxmcm9tPT09dG8pcmV0dXJuXCJcIjt2YXIgZnJvbVN0YXJ0PTE7Zm9yKDtmcm9tU3RhcnQ8ZnJvbS5sZW5ndGg7Kytmcm9tU3RhcnQpaWYoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkhPT00NylicmVhazt2YXIgZnJvbUVuZD1mcm9tLmxlbmd0aCxmcm9tTGVuPWZyb21FbmQtZnJvbVN0YXJ0LHRvU3RhcnQ9MTtmb3IoO3RvU3RhcnQ8dG8ubGVuZ3RoOysrdG9TdGFydClpZih0by5jaGFyQ29kZUF0KHRvU3RhcnQpIT09NDcpYnJlYWs7dmFyIHRvRW5kPXRvLmxlbmd0aCx0b0xlbj10b0VuZC10b1N0YXJ0LGxlbmd0aD1mcm9tTGVuPHRvTGVuP2Zyb21MZW46dG9MZW4sbGFzdENvbW1vblNlcD0tMSxpPTA7Zm9yKDtpPD1sZW5ndGg7KytpKXtpZihpPT09bGVuZ3RoKXtpZih0b0xlbj5sZW5ndGgpe2lmKHRvLmNoYXJDb2RlQXQodG9TdGFydCtpKT09PTQ3KXJldHVybiB0by5zbGljZSh0b1N0YXJ0K2krMSk7ZWxzZSBpZihpPT09MClyZXR1cm4gdG8uc2xpY2UodG9TdGFydCtpKX1lbHNlIGlmKGZyb21MZW4+bGVuZ3RoKXtpZihmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0K2kpPT09NDcpbGFzdENvbW1vblNlcD1pO2Vsc2UgaWYoaT09PTApbGFzdENvbW1vblNlcD0wfWJyZWFrfXZhciBmcm9tQ29kZT1mcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0K2kpLHRvQ29kZT10by5jaGFyQ29kZUF0KHRvU3RhcnQraSk7aWYoZnJvbUNvZGUhPT10b0NvZGUpYnJlYWs7ZWxzZSBpZihmcm9tQ29kZT09PTQ3KWxhc3RDb21tb25TZXA9aX12YXIgb3V0PVwiXCI7Zm9yKGk9ZnJvbVN0YXJ0K2xhc3RDb21tb25TZXArMTtpPD1mcm9tRW5kOysraSlpZihpPT09ZnJvbUVuZHx8ZnJvbS5jaGFyQ29kZUF0KGkpPT09NDcpaWYob3V0Lmxlbmd0aD09PTApb3V0Kz1cIi4uXCI7ZWxzZSBvdXQrPVwiLy4uXCI7aWYob3V0Lmxlbmd0aD4wKXJldHVybiBvdXQrdG8uc2xpY2UodG9TdGFydCtsYXN0Q29tbW9uU2VwKTtlbHNle2lmKHRvU3RhcnQrPWxhc3RDb21tb25TZXAsdG8uY2hhckNvZGVBdCh0b1N0YXJ0KT09PTQ3KSsrdG9TdGFydDtyZXR1cm4gdG8uc2xpY2UodG9TdGFydCl9fWZ1bmN0aW9uIF9tYWtlTG9uZyhwYXRoKXtyZXR1cm4gcGF0aH1mdW5jdGlvbiBkaXJuYW1lKHBhdGgpe2lmKGFzc2VydFBhdGgocGF0aCkscGF0aC5sZW5ndGg9PT0wKXJldHVyblwiLlwiO3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdCgwKSxoYXNSb290PWNvZGU9PT00NyxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwO2Zvcih2YXIgaT1wYXRoLmxlbmd0aC0xO2k+PTE7LS1pKWlmKGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpLGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7ZW5kPWk7YnJlYWt9fWVsc2UgbWF0Y2hlZFNsYXNoPSExO2lmKGVuZD09PS0xKXJldHVybiBoYXNSb290P1wiL1wiOlwiLlwiO2lmKGhhc1Jvb3QmJmVuZD09PTEpcmV0dXJuXCIvL1wiO3JldHVybiBwYXRoLnNsaWNlKDAsZW5kKX1mdW5jdGlvbiBiYXNlbmFtZShwYXRoLGV4dCl7aWYoZXh0IT09dm9pZCAwJiZ0eXBlb2YgZXh0IT09XCJzdHJpbmdcIil0aHJvdyBuZXcgVHlwZUVycm9yKCdcImV4dFwiIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTthc3NlcnRQYXRoKHBhdGgpO3ZhciBzdGFydD0wLGVuZD0tMSxtYXRjaGVkU2xhc2g9ITAsaTtpZihleHQhPT12b2lkIDAmJmV4dC5sZW5ndGg+MCYmZXh0Lmxlbmd0aDw9cGF0aC5sZW5ndGgpe2lmKGV4dC5sZW5ndGg9PT1wYXRoLmxlbmd0aCYmZXh0PT09cGF0aClyZXR1cm5cIlwiO3ZhciBleHRJZHg9ZXh0Lmxlbmd0aC0xLGZpcnN0Tm9uU2xhc2hFbmQ9LTE7Zm9yKGk9cGF0aC5sZW5ndGgtMTtpPj0wOy0taSl7dmFyIGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpO2lmKGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnQ9aSsxO2JyZWFrfX1lbHNle2lmKGZpcnN0Tm9uU2xhc2hFbmQ9PT0tMSltYXRjaGVkU2xhc2g9ITEsZmlyc3ROb25TbGFzaEVuZD1pKzE7aWYoZXh0SWR4Pj0wKWlmKGNvZGU9PT1leHQuY2hhckNvZGVBdChleHRJZHgpKXtpZigtLWV4dElkeD09PS0xKWVuZD1pfWVsc2UgZXh0SWR4PS0xLGVuZD1maXJzdE5vblNsYXNoRW5kfX1pZihzdGFydD09PWVuZCllbmQ9Zmlyc3ROb25TbGFzaEVuZDtlbHNlIGlmKGVuZD09PS0xKWVuZD1wYXRoLmxlbmd0aDtyZXR1cm4gcGF0aC5zbGljZShzdGFydCxlbmQpfWVsc2V7Zm9yKGk9cGF0aC5sZW5ndGgtMTtpPj0wOy0taSlpZihwYXRoLmNoYXJDb2RlQXQoaSk9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnQ9aSsxO2JyZWFrfX1lbHNlIGlmKGVuZD09PS0xKW1hdGNoZWRTbGFzaD0hMSxlbmQ9aSsxO2lmKGVuZD09PS0xKXJldHVyblwiXCI7cmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsZW5kKX19ZnVuY3Rpb24gZXh0bmFtZShwYXRoKXthc3NlcnRQYXRoKHBhdGgpO3ZhciBzdGFydERvdD0tMSxzdGFydFBhcnQ9MCxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwLHByZURvdFN0YXRlPTA7Zm9yKHZhciBpPXBhdGgubGVuZ3RoLTE7aT49MDstLWkpe3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdChpKTtpZihjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0UGFydD1pKzE7YnJlYWt9Y29udGludWV9aWYoZW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGVuZD1pKzE7aWYoY29kZT09PTQ2KXtpZihzdGFydERvdD09PS0xKXN0YXJ0RG90PWk7ZWxzZSBpZihwcmVEb3RTdGF0ZSE9PTEpcHJlRG90U3RhdGU9MX1lbHNlIGlmKHN0YXJ0RG90IT09LTEpcHJlRG90U3RhdGU9LTF9aWYoc3RhcnREb3Q9PT0tMXx8ZW5kPT09LTF8fHByZURvdFN0YXRlPT09MHx8cHJlRG90U3RhdGU9PT0xJiZzdGFydERvdD09PWVuZC0xJiZzdGFydERvdD09PXN0YXJ0UGFydCsxKXJldHVyblwiXCI7cmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsZW5kKX1mdW5jdGlvbiBmb3JtYXQocGF0aE9iamVjdCl7aWYocGF0aE9iamVjdD09PW51bGx8fHR5cGVvZiBwYXRoT2JqZWN0IT09XCJvYmplY3RcIil0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJwYXRoT2JqZWN0XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnK3R5cGVvZiBwYXRoT2JqZWN0KTtyZXR1cm4gX2Zvcm1hdChcIi9cIixwYXRoT2JqZWN0KX1mdW5jdGlvbiBwYXJzZShwYXRoKXthc3NlcnRQYXRoKHBhdGgpO3ZhciByZXQ9e3Jvb3Q6XCJcIixkaXI6XCJcIixiYXNlOlwiXCIsZXh0OlwiXCIsbmFtZTpcIlwifTtpZihwYXRoLmxlbmd0aD09PTApcmV0dXJuIHJldDt2YXIgY29kZT1wYXRoLmNoYXJDb2RlQXQoMCksaXNBYnNvbHV0ZTI9Y29kZT09PTQ3LHN0YXJ0O2lmKGlzQWJzb2x1dGUyKXJldC5yb290PVwiL1wiLHN0YXJ0PTE7ZWxzZSBzdGFydD0wO3ZhciBzdGFydERvdD0tMSxzdGFydFBhcnQ9MCxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwLGk9cGF0aC5sZW5ndGgtMSxwcmVEb3RTdGF0ZT0wO2Zvcig7aT49c3RhcnQ7LS1pKXtpZihjb2RlPXBhdGguY2hhckNvZGVBdChpKSxjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0UGFydD1pKzE7YnJlYWt9Y29udGludWV9aWYoZW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGVuZD1pKzE7aWYoY29kZT09PTQ2KXtpZihzdGFydERvdD09PS0xKXN0YXJ0RG90PWk7ZWxzZSBpZihwcmVEb3RTdGF0ZSE9PTEpcHJlRG90U3RhdGU9MX1lbHNlIGlmKHN0YXJ0RG90IT09LTEpcHJlRG90U3RhdGU9LTF9aWYoc3RhcnREb3Q9PT0tMXx8ZW5kPT09LTF8fHByZURvdFN0YXRlPT09MHx8cHJlRG90U3RhdGU9PT0xJiZzdGFydERvdD09PWVuZC0xJiZzdGFydERvdD09PXN0YXJ0UGFydCsxKXtpZihlbmQhPT0tMSlpZihzdGFydFBhcnQ9PT0wJiZpc0Fic29sdXRlMilyZXQuYmFzZT1yZXQubmFtZT1wYXRoLnNsaWNlKDEsZW5kKTtlbHNlIHJldC5iYXNlPXJldC5uYW1lPXBhdGguc2xpY2Uoc3RhcnRQYXJ0LGVuZCl9ZWxzZXtpZihzdGFydFBhcnQ9PT0wJiZpc0Fic29sdXRlMilyZXQubmFtZT1wYXRoLnNsaWNlKDEsc3RhcnREb3QpLHJldC5iYXNlPXBhdGguc2xpY2UoMSxlbmQpO2Vsc2UgcmV0Lm5hbWU9cGF0aC5zbGljZShzdGFydFBhcnQsc3RhcnREb3QpLHJldC5iYXNlPXBhdGguc2xpY2Uoc3RhcnRQYXJ0LGVuZCk7cmV0LmV4dD1wYXRoLnNsaWNlKHN0YXJ0RG90LGVuZCl9aWYoc3RhcnRQYXJ0PjApcmV0LmRpcj1wYXRoLnNsaWNlKDAsc3RhcnRQYXJ0LTEpO2Vsc2UgaWYoaXNBYnNvbHV0ZTIpcmV0LmRpcj1cIi9cIjtyZXR1cm4gcmV0fXZhciBzZXA9XCIvXCIsZGVsaW1pdGVyPVwiOlwiLHBvc2l4PSgocCk9PihwLnBvc2l4PXAscCkpKHtyZXNvbHZlLG5vcm1hbGl6ZSxpc0Fic29sdXRlLGpvaW4scmVsYXRpdmUsX21ha2VMb25nLGRpcm5hbWUsYmFzZW5hbWUsZXh0bmFtZSxmb3JtYXQscGFyc2Usc2VwLGRlbGltaXRlcix3aW4zMjpudWxsLHBvc2l4Om51bGx9KTt2YXIgcGF0aF9kZWZhdWx0PXBvc2l4O2V4cG9ydHtzZXAscmVzb2x2ZSxyZWxhdGl2ZSxwb3NpeCxwYXJzZSxub3JtYWxpemUsam9pbixpc0Fic29sdXRlLGZvcm1hdCxleHRuYW1lLGRpcm5hbWUsZGVsaW1pdGVyLHBhdGhfZGVmYXVsdCBhcyBkZWZhdWx0LGJhc2VuYW1lLF9tYWtlTG9uZ307IiwKICAgICJ0eXBlIExvZ0xldmVsID0gJ2Vycm9yJyB8ICd3YXJuJyB8ICdpbmZvJyB8ICdzdWNjZXNzJyB8ICd2ZXJib3NlJyB8ICdkZWJ1Zyc7XG5cbmNvbnN0IExFVkVMUzogUmVjb3JkPExvZ0xldmVsLCBudW1iZXI+ID0ge1xuICAgIGRlYnVnOiA1LFxuICAgIGVycm9yOiAwLFxuICAgIGluZm86IDIsXG4gICAgc3VjY2VzczogMyxcbiAgICB2ZXJib3NlOiA0LFxuICAgIHdhcm46IDEsXG59XG5cbmNvbnN0IEVTQyA9IFN0cmluZy5mcm9tQ29kZVBvaW50KDI3KVxuY29uc3QgQ09MT1JTID0ge1xuICAgIGRlYnVnOiBgJHtFU0N9WzkwbWAsIC8vIGdyYXlcbiAgICBlcnJvcjogYCR7RVNDfVszMW1gLCAvLyByZWRcbiAgICBpbmZvOiBgJHtFU0N9WzM0bWAsIC8vIGJsdWVcbiAgICByZXNldDogYCR7RVNDfVswbWAsXG4gICAgc3VjY2VzczogYCR7RVNDfVszODsyOzM5OzE3NDs5Nm1gLCAvLyBtdXRlZCBncmVlbiAobWF0Y2hlcyBicm93c2VyICMyN2FlNjApXG4gICAgdmVyYm9zZTogYCR7RVNDfVszNm1gLCAvLyBjeWFuXG4gICAgd2FybjogYCR7RVNDfVszM21gLCAvLyB5ZWxsb3dcbn1cblxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG4gICAgcHJpdmF0ZSBsZXZlbDogTG9nTGV2ZWxcbiAgICBwcml2YXRlIGZpbGVTdHJlYW0/OiBhbnlcblxuICAgIGNvbnN0cnVjdG9yKHsgbGV2ZWwgPSAnaW5mbycsIGZpbGUgfTogeyBsZXZlbD86IExvZ0xldmVsOyBmaWxlPzogc3RyaW5nIH0gPSB7fSkge1xuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKHBhdGguZGlybmFtZShmaWxlKSwgeyByZWN1cnNpdmU6IHRydWUgfSlcbiAgICAgICAgICAgIHRoaXMuZmlsZVN0cmVhbSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGUsIHsgZmxhZ3M6ICdhJyB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRMb2cobGV2ZWw6IExvZ0xldmVsKSB7XG4gICAgICAgIHJldHVybiBMRVZFTFNbbGV2ZWxdIDw9IExFVkVMU1t0aGlzLmxldmVsXVxuICAgIH1cblxuICAgIHByaXZhdGUgZm9ybWF0KGxldmVsOiBMb2dMZXZlbCwgbXNnOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgICBjb25zdCB0cyA9IGAke25vdy5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9ICR7U3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0U2Vjb25kcygpKS5wYWRTdGFydCgyLCAnMCcpfWBcbiAgICAgICAgY29uc3QgY29sb3IgPSBDT0xPUlNbbGV2ZWxdIHx8ICcnXG4gICAgICAgIGNvbnN0IGxldmVsU3RyID0gbGV2ZWwudG9VcHBlckNhc2UoKVxuXG4gICAgICAgICAgICAgICAgaWYgKGxldmVsID09PSAnZGVidWcnKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHByZWZpeCBjb2xvciwgYnV0IG1ha2UgdGltZXN0YW1wIGFuZCBtZXNzYWdlIHRleHQgbWVkaXVtIGdyZXlcbiAgICAgICAgICAgIGNvbnN0IG1lZGl1bUdyZXkgPSAnXFx1MDAxQlszODs1OzI0NG0nIC8vIG1lZGl1bSBncmF5XG4gICAgICAgICAgICByZXR1cm4gYCR7Y29sb3J9WyR7bGV2ZWxTdHJbMF19XSR7Q09MT1JTLnJlc2V0fSAke21lZGl1bUdyZXl9WyR7dHN9XSAke21zZ30ke0NPTE9SUy5yZXNldH1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICAgICAgLy8gS2VlcCBwcmVmaXggY29sb3IsIGJ1dCBtYWtlIHRpbWVzdGFtcCBhbmQgbWVzc2FnZSB0ZXh0IGxpZ2h0IG9yYW5nZVxuICAgICAgICAgICAgY29uc3QgbGlnaHRPcmFuZ2UgPSAnXFx1MDAxQlszODs1OzIxNW0nIC8vIGxpZ2h0IG9yYW5nZSBwYXN0ZWxcbiAgICAgICAgICAgIHJldHVybiBgJHtjb2xvcn1bJHtsZXZlbFN0clswXX1dJHtDT0xPUlMucmVzZXR9ICR7bGlnaHRPcmFuZ2V9WyR7dHN9XSAke21zZ30ke0NPTE9SUy5yZXNldH1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGV2ZWwgPT09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgLy8gS2VlcCBwcmVmaXggY29sb3IsIGJ1dCBtYWtlIHRpbWVzdGFtcCBhbmQgbWVzc2FnZSB0ZXh0IGxpZ2h0IGdyZWVuXG4gICAgICAgICAgICBjb25zdCBsaWdodEdyZWVuID0gJ1xcdTAwMUJbMzg7NTsxNTZtJyAvLyBsaWdodCBncmVlbiBwYXN0ZWxcbiAgICAgICAgICAgIHJldHVybiBgJHtjb2xvcn1bJHtsZXZlbFN0clswXX1dJHtDT0xPUlMucmVzZXR9ICR7bGlnaHRHcmVlbn1bJHt0c31dICR7bXNnfSR7Q09MT1JTLnJlc2V0fWBcbiAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxldmVsID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgcHJlZml4IGNvbG9yLCBidXQgbWFrZSB0aW1lc3RhbXAgYW5kIG1lc3NhZ2UgdGV4dCBwYXN0ZWwgYmx1ZVxuICAgICAgICAgICAgY29uc3QgcGFzdGVsQmx1ZSA9ICdcXHUwMDFCWzM4OzU7MTUzbScgLy8gcGFzdGVsIGJsdWVcbiAgICAgICAgICAgIHJldHVybiBgJHtjb2xvcn1bJHtsZXZlbFN0clswXX1dJHtDT0xPUlMucmVzZXR9ICR7cGFzdGVsQmx1ZX1bJHt0c31dICR7bXNnfSR7Q09MT1JTLnJlc2V0fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsZXZlbCA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgLy8gS2VlcCBwcmVmaXggY29sb3IsIGJ1dCBtYWtlIHRpbWVzdGFtcCBhbmQgbWVzc2FnZSB0ZXh0IHBhc3RlbCByZWRcbiAgICAgICAgICAgIGNvbnN0IHBhc3RlbFJlZCA9ICdcXHUwMDFCWzM4OzU7MjEwbScgLy8gcGFzdGVsIHJlZFxuICAgICAgICAgICAgcmV0dXJuIGAke2NvbG9yfVske2xldmVsU3RyWzBdfV0ke0NPTE9SUy5yZXNldH0gJHtwYXN0ZWxSZWR9WyR7dHN9XSAke21zZ30ke0NPTE9SUy5yZXNldH1gXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYCR7Y29sb3J9WyR7bGV2ZWxTdHJbMF19XSR7Q09MT1JTLnJlc2V0fSBbJHt0c31dICR7bXNnfWBcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZ1RvRmlsZShtc2c6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5maWxlU3RyZWFtKSB7dGhpcy5maWxlU3RyZWFtLndyaXRlKG1zZyArICdcXG4nKX1cbiAgICB9XG5cbiAgICBsb2cobGV2ZWw6IExvZ0xldmVsLCBtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZExvZyhsZXZlbCkpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IHRoaXMuZm9ybWF0KGxldmVsLCBtc2cpXG4gICAgICAgIGlmIChsZXZlbCA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihmb3JtYXR0ZWQsIC4uLmFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdHRlZCwgLi4uYXJncylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZvcm1hdHRlZCwgLi4uYXJncylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvZ1RvRmlsZShmb3JtYXR0ZWQucmVwbGFjZUFsbChuZXcgUmVnRXhwKGAke0VTQ31cXFxcW1swLTk7XSptYCwgJ2cnKSwgJycpKVxuICAgIH1cblxuICAgIGVycm9yKG1zZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge3RoaXMubG9nKCdlcnJvcicsIG1zZywgLi4uYXJncyl9XG4gICAgd2Fybihtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHt0aGlzLmxvZygnd2FybicsIG1zZywgLi4uYXJncyl9XG4gICAgaW5mbyhtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHt0aGlzLmxvZygnaW5mbycsIG1zZywgLi4uYXJncyl9XG4gICAgc3VjY2Vzcyhtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHt0aGlzLmxvZygnc3VjY2VzcycsIG1zZywgLi4uYXJncyl9XG4gICAgdmVyYm9zZShtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHt0aGlzLmxvZygndmVyYm9zZScsIG1zZywgLi4uYXJncyl9XG4gICAgZGVidWcobXNnOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7dGhpcy5sb2coJ2RlYnVnJywgbXNnLCAuLi5hcmdzKX1cblxuICAgIHNldExldmVsKGxldmVsOiBMb2dMZXZlbCkge3RoaXMubGV2ZWwgPSBsZXZlbH1cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsZVN0cmVhbSkge3RoaXMuZmlsZVN0cmVhbS5lbmQoKX1cbiAgICB9XG59IiwKICAgICJ0eXBlIExvZ0xldmVsID0gJ2Vycm9yJyB8ICd3YXJuJyB8ICdpbmZvJyB8ICdzdWNjZXNzJyB8ICd2ZXJib3NlJyB8ICdkZWJ1ZydcblxuY29uc3QgTEVWRUxTOiBSZWNvcmQ8TG9nTGV2ZWwsIG51bWJlcj4gPSB7XG4gICAgZGVidWc6IDAsXG4gICAgZXJyb3I6IDEsXG4gICAgaW5mbzogMixcbiAgICBzdWNjZXNzOiAzLFxuICAgIHZlcmJvc2U6IDQsXG4gICAgd2FybjogNSxcbn1cblxuY29uc3QgQ09MT1JTID0ge1xuICAgIGRlYnVnOiAnY29sb3I6ICM3ZjhjOGQnLFxuICAgIGVycm9yOiAnY29sb3I6ICNlNzRjM2MnLFxuICAgIGluZm86ICdjb2xvcjogIzM0OThkYicsXG4gICAgc3VjY2VzczogJ2NvbG9yOiAjMjdhZTYwJyxcbiAgICB2ZXJib3NlOiAnY29sb3I6ICMxYWJjOWMnLFxuICAgIHdhcm46ICdjb2xvcjogI2YxYzQwZicsXG59O1xuXG5jbGFzcyBMb2dnZXIge1xuICAgIHByaXZhdGUgbGV2ZWw6IExvZ0xldmVsXG5cbiAgICBjb25zdHJ1Y3Rvcih7IGxldmVsID0gJ2luZm8nIH06IHsgbGV2ZWw/OiBMb2dMZXZlbCB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRMb2cobGV2ZWw6IExvZ0xldmVsKSB7XG4gICAgICAgIHJldHVybiBMRVZFTFNbbGV2ZWxdIDw9IExFVkVMU1t0aGlzLmxldmVsXVxuICAgIH1cblxuICAgIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1zZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkTG9nKGxldmVsKSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgICAgICBjb25zdCB0cyA9IGAke25vdy5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9LSR7U3RyaW5nKG5vdy5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsICcwJyl9ICR7U3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfToke1N0cmluZyhub3cuZ2V0U2Vjb25kcygpKS5wYWRTdGFydCgyLCAnMCcpfWBcbiAgICAgICAgY29uc3QgbGV2ZWxTdHIgPSBsZXZlbC50b1VwcGVyQ2FzZSgpXG4gICAgICAgIGNvbnN0IHN0eWxlID0gQ09MT1JTW2xldmVsXSB8fCAnJ1xuXG4gICAgICAgIGlmIChsZXZlbCA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgICAgLy8gS2VlcCBwcmVmaXggY29sb3IsIGJ1dCBtYWtlIHRpbWVzdGFtcCBhbmQgbWVzc2FnZSB0ZXh0IG1lZGl1bSBncmV5XG4gICAgICAgICAgICBjb25zdCBtZWRpdW1HcmV5U3R5bGUgPSAnY29sb3I6ICM4ODg4ODgnXG4gICAgICAgICAgICBjb25zdCBwcmVmaXggPSBgJWNbJHtsZXZlbFN0clswXX1dJWMgWyR7dHN9XSAke21zZ31gXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwcmVmaXgsIHN0eWxlLCBtZWRpdW1HcmV5U3R5bGUsIC4uLmFyZ3MpXG4gICAgICAgIH0gZWxzZSBpZiAobGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICAgICAgLy8gS2VlcCBwcmVmaXggY29sb3IsIGJ1dCBtYWtlIHRpbWVzdGFtcCBhbmQgbWVzc2FnZSB0ZXh0IGxpZ2h0IG9yYW5nZVxuICAgICAgICAgICAgY29uc3QgbGlnaHRPcmFuZ2VTdHlsZSA9ICdjb2xvcjogI2ZmYjM2NidcbiAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGAlY1ske2xldmVsU3RyWzBdfV0lYyBbJHt0c31dICR7bXNnfWBcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihwcmVmaXgsIHN0eWxlLCBsaWdodE9yYW5nZVN0eWxlLCAuLi5hcmdzKVxuICAgICAgICB9IGVsc2UgaWYgKGxldmVsID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgcHJlZml4IGNvbG9yLCBidXQgbWFrZSB0aW1lc3RhbXAgYW5kIG1lc3NhZ2UgdGV4dCBsaWdodCBncmVlblxuICAgICAgICAgICAgY29uc3QgbGlnaHRHcmVlblN0eWxlID0gJ2NvbG9yOiAjOTBlZTkwJ1xuICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gYCVjWyR7bGV2ZWxTdHJbMF19XSVjIFske3RzfV0gJHttc2d9YFxuICAgICAgICAgICAgY29uc29sZS5sb2cocHJlZml4LCBzdHlsZSwgbGlnaHRHcmVlblN0eWxlLCAuLi5hcmdzKVxuICAgICAgICB9IGVsc2UgaWYgKGxldmVsID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgcHJlZml4IGNvbG9yLCBidXQgbWFrZSB0aW1lc3RhbXAgYW5kIG1lc3NhZ2UgdGV4dCBwYXN0ZWwgYmx1ZVxuICAgICAgICAgICAgY29uc3QgcGFzdGVsQmx1ZVN0eWxlID0gJ2NvbG9yOiAjODdjZWViJ1xuICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gYCVjWyR7bGV2ZWxTdHJbMF19XSVjIFske3RzfV0gJHttc2d9YFxuICAgICAgICAgICAgY29uc29sZS5sb2cocHJlZml4LCBzdHlsZSwgcGFzdGVsQmx1ZVN0eWxlLCAuLi5hcmdzKVxuICAgICAgICB9IGVsc2UgaWYgKGxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHByZWZpeCBjb2xvciwgYnV0IG1ha2UgdGltZXN0YW1wIGFuZCBtZXNzYWdlIHRleHQgcGFzdGVsIHJlZFxuICAgICAgICAgICAgY29uc3QgcGFzdGVsUmVkU3R5bGUgPSAnY29sb3I6ICNmZjk5OTknXG4gICAgICAgICAgICBjb25zdCBwcmVmaXggPSBgJWNbJHtsZXZlbFN0clswXX1dJWMgWyR7dHN9XSAke21zZ31gXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHByZWZpeCwgc3R5bGUsIHBhc3RlbFJlZFN0eWxlLCAuLi5hcmdzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gYCVjWyR7bGV2ZWxTdHJbMF19XSVjIFske3RzfV1gXG4gICAgICAgICAgICBpZiAobGV2ZWwgPT09ICd2ZXJib3NlJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3ByZWZpeH0gJHttc2d9YCwgc3R5bGUsICcnLCAuLi5hcmdzKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVycm9yKG1zZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgeyB0aGlzLmxvZygnZXJyb3InLCBtc2csIC4uLmFyZ3MpOyB9XG4gICAgd2Fybihtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHsgdGhpcy5sb2coJ3dhcm4nLCBtc2csIC4uLmFyZ3MpOyB9XG4gICAgaW5mbyhtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHsgdGhpcy5sb2coJ2luZm8nLCBtc2csIC4uLmFyZ3MpOyB9XG4gICAgc3VjY2Vzcyhtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHsgdGhpcy5sb2coJ3N1Y2Nlc3MnLCBtc2csIC4uLmFyZ3MpOyB9XG4gICAgdmVyYm9zZShtc2c6IHN0cmluZywgLi4uYXJnczogYW55W10pIHsgdGhpcy5sb2coJ3ZlcmJvc2UnLCBtc2csIC4uLmFyZ3MpOyB9XG4gICAgZGVidWcobXNnOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7IHRoaXMubG9nKCdkZWJ1ZycsIG1zZywgLi4uYXJncyk7IH1cbiAgICBzZXRMZXZlbChsZXZlbDogTG9nTGV2ZWwpIHsgdGhpcy5sZXZlbCA9IGxldmVsOyB9XG4gICAgY2xvc2UoKSB7fVxufVxuXG5jb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKClcblxuZXhwb3J0IHtcbiAgICBsb2dnZXIsXG4gICAgTG9nZ2VyLFxufSIsCiAgICAiY29uc3QgaXNTdHJpbmcgPSBvYmogPT4gdHlwZW9mIG9iaiA9PT0gJ3N0cmluZyc7XG5jb25zdCBkZWZlciA9ICgpID0+IHtcbiAgbGV0IHJlcztcbiAgbGV0IHJlajtcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXMgPSByZXNvbHZlO1xuICAgIHJlaiA9IHJlamVjdDtcbiAgfSk7XG4gIHByb21pc2UucmVzb2x2ZSA9IHJlcztcbiAgcHJvbWlzZS5yZWplY3QgPSByZWo7XG4gIHJldHVybiBwcm9taXNlO1xufTtcbmNvbnN0IG1ha2VTdHJpbmcgPSBvYmplY3QgPT4ge1xuICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAnJztcbiAgcmV0dXJuICcnICsgb2JqZWN0O1xufTtcbmNvbnN0IGNvcHkgPSAoYSwgcywgdCkgPT4ge1xuICBhLmZvckVhY2gobSA9PiB7XG4gICAgaWYgKHNbbV0pIHRbbV0gPSBzW21dO1xuICB9KTtcbn07XG5jb25zdCBsYXN0T2ZQYXRoU2VwYXJhdG9yUmVnRXhwID0gLyMjIy9nO1xuY29uc3QgY2xlYW5LZXkgPSBrZXkgPT4ga2V5ICYmIGtleS5pbmRleE9mKCcjIyMnKSA+IC0xID8ga2V5LnJlcGxhY2UobGFzdE9mUGF0aFNlcGFyYXRvclJlZ0V4cCwgJy4nKSA6IGtleTtcbmNvbnN0IGNhbk5vdFRyYXZlcnNlRGVlcGVyID0gb2JqZWN0ID0+ICFvYmplY3QgfHwgaXNTdHJpbmcob2JqZWN0KTtcbmNvbnN0IGdldExhc3RPZlBhdGggPSAob2JqZWN0LCBwYXRoLCBFbXB0eSkgPT4ge1xuICBjb25zdCBzdGFjayA9ICFpc1N0cmluZyhwYXRoKSA/IHBhdGggOiBwYXRoLnNwbGl0KCcuJyk7XG4gIGxldCBzdGFja0luZGV4ID0gMDtcbiAgd2hpbGUgKHN0YWNrSW5kZXggPCBzdGFjay5sZW5ndGggLSAxKSB7XG4gICAgaWYgKGNhbk5vdFRyYXZlcnNlRGVlcGVyKG9iamVjdCkpIHJldHVybiB7fTtcbiAgICBjb25zdCBrZXkgPSBjbGVhbktleShzdGFja1tzdGFja0luZGV4XSk7XG4gICAgaWYgKCFvYmplY3Rba2V5XSAmJiBFbXB0eSkgb2JqZWN0W2tleV0gPSBuZXcgRW1wdHkoKTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgb2JqZWN0ID0gb2JqZWN0W2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdCA9IHt9O1xuICAgIH1cbiAgICArK3N0YWNrSW5kZXg7XG4gIH1cbiAgaWYgKGNhbk5vdFRyYXZlcnNlRGVlcGVyKG9iamVjdCkpIHJldHVybiB7fTtcbiAgcmV0dXJuIHtcbiAgICBvYmo6IG9iamVjdCxcbiAgICBrOiBjbGVhbktleShzdGFja1tzdGFja0luZGV4XSlcbiAgfTtcbn07XG5jb25zdCBzZXRQYXRoID0gKG9iamVjdCwgcGF0aCwgbmV3VmFsdWUpID0+IHtcbiAgY29uc3Qge1xuICAgIG9iaixcbiAgICBrXG4gIH0gPSBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcGF0aCwgT2JqZWN0KTtcbiAgaWYgKG9iaiAhPT0gdW5kZWZpbmVkIHx8IHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgb2JqW2tdID0gbmV3VmFsdWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBlID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdO1xuICBsZXQgcCA9IHBhdGguc2xpY2UoMCwgcGF0aC5sZW5ndGggLSAxKTtcbiAgbGV0IGxhc3QgPSBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcCwgT2JqZWN0KTtcbiAgd2hpbGUgKGxhc3Qub2JqID09PSB1bmRlZmluZWQgJiYgcC5sZW5ndGgpIHtcbiAgICBlID0gYCR7cFtwLmxlbmd0aCAtIDFdfS4ke2V9YDtcbiAgICBwID0gcC5zbGljZSgwLCBwLmxlbmd0aCAtIDEpO1xuICAgIGxhc3QgPSBnZXRMYXN0T2ZQYXRoKG9iamVjdCwgcCwgT2JqZWN0KTtcbiAgICBpZiAobGFzdD8ub2JqICYmIHR5cGVvZiBsYXN0Lm9ialtgJHtsYXN0Lmt9LiR7ZX1gXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxhc3Qub2JqID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuICBsYXN0Lm9ialtgJHtsYXN0Lmt9LiR7ZX1gXSA9IG5ld1ZhbHVlO1xufTtcbmNvbnN0IHB1c2hQYXRoID0gKG9iamVjdCwgcGF0aCwgbmV3VmFsdWUsIGNvbmNhdCkgPT4ge1xuICBjb25zdCB7XG4gICAgb2JqLFxuICAgIGtcbiAgfSA9IGdldExhc3RPZlBhdGgob2JqZWN0LCBwYXRoLCBPYmplY3QpO1xuICBvYmpba10gPSBvYmpba10gfHwgW107XG4gIG9ialtrXS5wdXNoKG5ld1ZhbHVlKTtcbn07XG5jb25zdCBnZXRQYXRoID0gKG9iamVjdCwgcGF0aCkgPT4ge1xuICBjb25zdCB7XG4gICAgb2JqLFxuICAgIGtcbiAgfSA9IGdldExhc3RPZlBhdGgob2JqZWN0LCBwYXRoKTtcbiAgaWYgKCFvYmopIHJldHVybiB1bmRlZmluZWQ7XG4gIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaykpIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiBvYmpba107XG59O1xuY29uc3QgZ2V0UGF0aFdpdGhEZWZhdWx0cyA9IChkYXRhLCBkZWZhdWx0RGF0YSwga2V5KSA9PiB7XG4gIGNvbnN0IHZhbHVlID0gZ2V0UGF0aChkYXRhLCBrZXkpO1xuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gZ2V0UGF0aChkZWZhdWx0RGF0YSwga2V5KTtcbn07XG5jb25zdCBkZWVwRXh0ZW5kID0gKHRhcmdldCwgc291cmNlLCBvdmVyd3JpdGUpID0+IHtcbiAgZm9yIChjb25zdCBwcm9wIGluIHNvdXJjZSkge1xuICAgIGlmIChwcm9wICE9PSAnX19wcm90b19fJyAmJiBwcm9wICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgICBpZiAocHJvcCBpbiB0YXJnZXQpIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nKHRhcmdldFtwcm9wXSkgfHwgdGFyZ2V0W3Byb3BdIGluc3RhbmNlb2YgU3RyaW5nIHx8IGlzU3RyaW5nKHNvdXJjZVtwcm9wXSkgfHwgc291cmNlW3Byb3BdIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgICAgaWYgKG92ZXJ3cml0ZSkgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZXBFeHRlbmQodGFyZ2V0W3Byb3BdLCBzb3VyY2VbcHJvcF0sIG92ZXJ3cml0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5jb25zdCByZWdleEVzY2FwZSA9IHN0ciA9PiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csICdcXFxcJCYnKTtcbnZhciBfZW50aXR5TWFwID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnLFxuICAnLyc6ICcmI3gyRjsnXG59O1xuY29uc3QgZXNjYXBlID0gZGF0YSA9PiB7XG4gIGlmIChpc1N0cmluZyhkYXRhKSkge1xuICAgIHJldHVybiBkYXRhLnJlcGxhY2UoL1smPD5cIidcXC9dL2csIHMgPT4gX2VudGl0eU1hcFtzXSk7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59O1xuY2xhc3MgUmVnRXhwQ2FjaGUge1xuICBjb25zdHJ1Y3RvcihjYXBhY2l0eSkge1xuICAgIHRoaXMuY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICB0aGlzLnJlZ0V4cE1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnJlZ0V4cFF1ZXVlID0gW107XG4gIH1cbiAgZ2V0UmVnRXhwKHBhdHRlcm4pIHtcbiAgICBjb25zdCByZWdFeHBGcm9tQ2FjaGUgPSB0aGlzLnJlZ0V4cE1hcC5nZXQocGF0dGVybik7XG4gICAgaWYgKHJlZ0V4cEZyb21DYWNoZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gcmVnRXhwRnJvbUNhY2hlO1xuICAgIH1cbiAgICBjb25zdCByZWdFeHBOZXcgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgIGlmICh0aGlzLnJlZ0V4cFF1ZXVlLmxlbmd0aCA9PT0gdGhpcy5jYXBhY2l0eSkge1xuICAgICAgdGhpcy5yZWdFeHBNYXAuZGVsZXRlKHRoaXMucmVnRXhwUXVldWUuc2hpZnQoKSk7XG4gICAgfVxuICAgIHRoaXMucmVnRXhwTWFwLnNldChwYXR0ZXJuLCByZWdFeHBOZXcpO1xuICAgIHRoaXMucmVnRXhwUXVldWUucHVzaChwYXR0ZXJuKTtcbiAgICByZXR1cm4gcmVnRXhwTmV3O1xuICB9XG59XG5jb25zdCBjaGFycyA9IFsnICcsICcsJywgJz8nLCAnIScsICc7J107XG5jb25zdCBsb29rc0xpa2VPYmplY3RQYXRoUmVnRXhwQ2FjaGUgPSBuZXcgUmVnRXhwQ2FjaGUoMjApO1xuY29uc3QgbG9va3NMaWtlT2JqZWN0UGF0aCA9IChrZXksIG5zU2VwYXJhdG9yLCBrZXlTZXBhcmF0b3IpID0+IHtcbiAgbnNTZXBhcmF0b3IgPSBuc1NlcGFyYXRvciB8fCAnJztcbiAga2V5U2VwYXJhdG9yID0ga2V5U2VwYXJhdG9yIHx8ICcnO1xuICBjb25zdCBwb3NzaWJsZUNoYXJzID0gY2hhcnMuZmlsdGVyKGMgPT4gbnNTZXBhcmF0b3IuaW5kZXhPZihjKSA8IDAgJiYga2V5U2VwYXJhdG9yLmluZGV4T2YoYykgPCAwKTtcbiAgaWYgKHBvc3NpYmxlQ2hhcnMubGVuZ3RoID09PSAwKSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgciA9IGxvb2tzTGlrZU9iamVjdFBhdGhSZWdFeHBDYWNoZS5nZXRSZWdFeHAoYCgke3Bvc3NpYmxlQ2hhcnMubWFwKGMgPT4gYyA9PT0gJz8nID8gJ1xcXFw/JyA6IGMpLmpvaW4oJ3wnKX0pYCk7XG4gIGxldCBtYXRjaGVkID0gIXIudGVzdChrZXkpO1xuICBpZiAoIW1hdGNoZWQpIHtcbiAgICBjb25zdCBraSA9IGtleS5pbmRleE9mKGtleVNlcGFyYXRvcik7XG4gICAgaWYgKGtpID4gMCAmJiAhci50ZXN0KGtleS5zdWJzdHJpbmcoMCwga2kpKSkge1xuICAgICAgbWF0Y2hlZCA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXRjaGVkO1xufTtcbmNvbnN0IGRlZXBGaW5kID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICBsZXQga2V5U2VwYXJhdG9yID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnLic7XG4gIGlmICghb2JqKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAob2JqW3BhdGhdKSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwYXRoKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gb2JqW3BhdGhdO1xuICB9XG4gIGNvbnN0IHRva2VucyA9IHBhdGguc3BsaXQoa2V5U2VwYXJhdG9yKTtcbiAgbGV0IGN1cnJlbnQgPSBvYmo7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDspIHtcbiAgICBpZiAoIWN1cnJlbnQgfHwgdHlwZW9mIGN1cnJlbnQgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZXQgbmV4dDtcbiAgICBsZXQgbmV4dFBhdGggPSAnJztcbiAgICBmb3IgKGxldCBqID0gaTsgaiA8IHRva2Vucy5sZW5ndGg7ICsraikge1xuICAgICAgaWYgKGogIT09IGkpIHtcbiAgICAgICAgbmV4dFBhdGggKz0ga2V5U2VwYXJhdG9yO1xuICAgICAgfVxuICAgICAgbmV4dFBhdGggKz0gdG9rZW5zW2pdO1xuICAgICAgbmV4dCA9IGN1cnJlbnRbbmV4dFBhdGhdO1xuICAgICAgaWYgKG5leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXS5pbmRleE9mKHR5cGVvZiBuZXh0KSA+IC0xICYmIGogPCB0b2tlbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGkgKz0gaiAtIGkgKyAxO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgY3VycmVudCA9IG5leHQ7XG4gIH1cbiAgcmV0dXJuIGN1cnJlbnQ7XG59O1xuY29uc3QgZ2V0Q2xlYW5lZENvZGUgPSBjb2RlID0+IGNvZGU/LnJlcGxhY2UoJ18nLCAnLScpO1xuXG5jb25zdCBjb25zb2xlTG9nZ2VyID0ge1xuICB0eXBlOiAnbG9nZ2VyJyxcbiAgbG9nKGFyZ3MpIHtcbiAgICB0aGlzLm91dHB1dCgnbG9nJywgYXJncyk7XG4gIH0sXG4gIHdhcm4oYXJncykge1xuICAgIHRoaXMub3V0cHV0KCd3YXJuJywgYXJncyk7XG4gIH0sXG4gIGVycm9yKGFyZ3MpIHtcbiAgICB0aGlzLm91dHB1dCgnZXJyb3InLCBhcmdzKTtcbiAgfSxcbiAgb3V0cHV0KHR5cGUsIGFyZ3MpIHtcbiAgICBjb25zb2xlPy5bdHlwZV0/LmFwcGx5Py4oY29uc29sZSwgYXJncyk7XG4gIH1cbn07XG5jbGFzcyBMb2dnZXIge1xuICBjb25zdHJ1Y3Rvcihjb25jcmV0ZUxvZ2dlcikge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICB0aGlzLmluaXQoY29uY3JldGVMb2dnZXIsIG9wdGlvbnMpO1xuICB9XG4gIGluaXQoY29uY3JldGVMb2dnZXIpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdGhpcy5wcmVmaXggPSBvcHRpb25zLnByZWZpeCB8fCAnaTE4bmV4dDonO1xuICAgIHRoaXMubG9nZ2VyID0gY29uY3JldGVMb2dnZXIgfHwgY29uc29sZUxvZ2dlcjtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuZGVidWcgPSBvcHRpb25zLmRlYnVnO1xuICB9XG4gIGxvZygpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZvcndhcmQoYXJncywgJ2xvZycsICcnLCB0cnVlKTtcbiAgfVxuICB3YXJuKCkge1xuICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5mb3J3YXJkKGFyZ3MsICd3YXJuJywgJycsIHRydWUpO1xuICB9XG4gIGVycm9yKCkge1xuICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMyksIF9rZXkzID0gMDsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgICAgYXJnc1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5mb3J3YXJkKGFyZ3MsICdlcnJvcicsICcnKTtcbiAgfVxuICBkZXByZWNhdGUoKSB7XG4gICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW40KSwgX2tleTQgPSAwOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICBhcmdzW19rZXk0XSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZvcndhcmQoYXJncywgJ3dhcm4nLCAnV0FSTklORyBERVBSRUNBVEVEOiAnLCB0cnVlKTtcbiAgfVxuICBmb3J3YXJkKGFyZ3MsIGx2bCwgcHJlZml4LCBkZWJ1Z09ubHkpIHtcbiAgICBpZiAoZGVidWdPbmx5ICYmICF0aGlzLmRlYnVnKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoaXNTdHJpbmcoYXJnc1swXSkpIGFyZ3NbMF0gPSBgJHtwcmVmaXh9JHt0aGlzLnByZWZpeH0gJHthcmdzWzBdfWA7XG4gICAgcmV0dXJuIHRoaXMubG9nZ2VyW2x2bF0oYXJncyk7XG4gIH1cbiAgY3JlYXRlKG1vZHVsZU5hbWUpIHtcbiAgICByZXR1cm4gbmV3IExvZ2dlcih0aGlzLmxvZ2dlciwge1xuICAgICAgLi4ue1xuICAgICAgICBwcmVmaXg6IGAke3RoaXMucHJlZml4fToke21vZHVsZU5hbWV9OmBcbiAgICAgIH0sXG4gICAgICAuLi50aGlzLm9wdGlvbnNcbiAgICB9KTtcbiAgfVxuICBjbG9uZShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zO1xuICAgIG9wdGlvbnMucHJlZml4ID0gb3B0aW9ucy5wcmVmaXggfHwgdGhpcy5wcmVmaXg7XG4gICAgcmV0dXJuIG5ldyBMb2dnZXIodGhpcy5sb2dnZXIsIG9wdGlvbnMpO1xuICB9XG59XG52YXIgYmFzZUxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblxuY2xhc3MgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcbiAgfVxuICBvbihldmVudHMsIGxpc3RlbmVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoIXRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkgdGhpcy5vYnNlcnZlcnNbZXZlbnRdID0gbmV3IE1hcCgpO1xuICAgICAgY29uc3QgbnVtTGlzdGVuZXJzID0gdGhpcy5vYnNlcnZlcnNbZXZlbnRdLmdldChsaXN0ZW5lcikgfHwgMDtcbiAgICAgIHRoaXMub2JzZXJ2ZXJzW2V2ZW50XS5zZXQobGlzdGVuZXIsIG51bUxpc3RlbmVycyArIDEpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG9mZihldmVudCwgbGlzdGVuZXIpIHtcbiAgICBpZiAoIXRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkgcmV0dXJuO1xuICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLm9ic2VydmVyc1tldmVudF07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMub2JzZXJ2ZXJzW2V2ZW50XS5kZWxldGUobGlzdGVuZXIpO1xuICB9XG4gIGVtaXQoZXZlbnQpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG4gICAgaWYgKHRoaXMub2JzZXJ2ZXJzW2V2ZW50XSkge1xuICAgICAgY29uc3QgY2xvbmVkID0gQXJyYXkuZnJvbSh0aGlzLm9ic2VydmVyc1tldmVudF0uZW50cmllcygpKTtcbiAgICAgIGNsb25lZC5mb3JFYWNoKF9yZWYgPT4ge1xuICAgICAgICBsZXQgW29ic2VydmVyLCBudW1UaW1lc0FkZGVkXSA9IF9yZWY7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVGltZXNBZGRlZDsgaSsrKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5vYnNlcnZlcnNbJyonXSkge1xuICAgICAgY29uc3QgY2xvbmVkID0gQXJyYXkuZnJvbSh0aGlzLm9ic2VydmVyc1snKiddLmVudHJpZXMoKSk7XG4gICAgICBjbG9uZWQuZm9yRWFjaChfcmVmMiA9PiB7XG4gICAgICAgIGxldCBbb2JzZXJ2ZXIsIG51bVRpbWVzQWRkZWRdID0gX3JlZjI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVGltZXNBZGRlZDsgaSsrKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkob2JzZXJ2ZXIsIFtldmVudCwgLi4uYXJnc10pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUmVzb3VyY2VTdG9yZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge1xuICAgICAgbnM6IFsndHJhbnNsYXRpb24nXSxcbiAgICAgIGRlZmF1bHROUzogJ3RyYW5zbGF0aW9uJ1xuICAgIH07XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhIHx8IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5vcHRpb25zLmtleVNlcGFyYXRvciA9ICcuJztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5pZ25vcmVKU09OU3RydWN0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5pZ25vcmVKU09OU3RydWN0dXJlID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgYWRkTmFtZXNwYWNlcyhucykge1xuICAgIGlmICh0aGlzLm9wdGlvbnMubnMuaW5kZXhPZihucykgPCAwKSB7XG4gICAgICB0aGlzLm9wdGlvbnMubnMucHVzaChucyk7XG4gICAgfVxuICB9XG4gIHJlbW92ZU5hbWVzcGFjZXMobnMpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMub3B0aW9ucy5ucy5pbmRleE9mKG5zKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5vcHRpb25zLm5zLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG4gIGdldFJlc291cmNlKGxuZywgbnMsIGtleSkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiB7fTtcbiAgICBjb25zdCBrZXlTZXBhcmF0b3IgPSBvcHRpb25zLmtleVNlcGFyYXRvciAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5rZXlTZXBhcmF0b3IgOiB0aGlzLm9wdGlvbnMua2V5U2VwYXJhdG9yO1xuICAgIGNvbnN0IGlnbm9yZUpTT05TdHJ1Y3R1cmUgPSBvcHRpb25zLmlnbm9yZUpTT05TdHJ1Y3R1cmUgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuaWdub3JlSlNPTlN0cnVjdHVyZSA6IHRoaXMub3B0aW9ucy5pZ25vcmVKU09OU3RydWN0dXJlO1xuICAgIGxldCBwYXRoO1xuICAgIGlmIChsbmcuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgIHBhdGggPSBsbmcuc3BsaXQoJy4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGF0aCA9IFtsbmcsIG5zXTtcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5KSkge1xuICAgICAgICAgIHBhdGgucHVzaCguLi5rZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKGtleSkgJiYga2V5U2VwYXJhdG9yKSB7XG4gICAgICAgICAgcGF0aC5wdXNoKC4uLmtleS5zcGxpdChrZXlTZXBhcmF0b3IpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBnZXRQYXRoKHRoaXMuZGF0YSwgcGF0aCk7XG4gICAgaWYgKCFyZXN1bHQgJiYgIW5zICYmICFrZXkgJiYgbG5nLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICBsbmcgPSBwYXRoWzBdO1xuICAgICAgbnMgPSBwYXRoWzFdO1xuICAgICAga2V5ID0gcGF0aC5zbGljZSgyKS5qb2luKCcuJyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgfHwgIWlnbm9yZUpTT05TdHJ1Y3R1cmUgfHwgIWlzU3RyaW5nKGtleSkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIGRlZXBGaW5kKHRoaXMuZGF0YT8uW2xuZ10/Lltuc10sIGtleSwga2V5U2VwYXJhdG9yKTtcbiAgfVxuICBhZGRSZXNvdXJjZShsbmcsIG5zLCBrZXksIHZhbHVlKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IHtcbiAgICAgIHNpbGVudDogZmFsc2VcbiAgICB9O1xuICAgIGNvbnN0IGtleVNlcGFyYXRvciA9IG9wdGlvbnMua2V5U2VwYXJhdG9yICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmtleVNlcGFyYXRvciA6IHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3I7XG4gICAgbGV0IHBhdGggPSBbbG5nLCBuc107XG4gICAgaWYgKGtleSkgcGF0aCA9IHBhdGguY29uY2F0KGtleVNlcGFyYXRvciA/IGtleS5zcGxpdChrZXlTZXBhcmF0b3IpIDoga2V5KTtcbiAgICBpZiAobG5nLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICBwYXRoID0gbG5nLnNwbGl0KCcuJyk7XG4gICAgICB2YWx1ZSA9IG5zO1xuICAgICAgbnMgPSBwYXRoWzFdO1xuICAgIH1cbiAgICB0aGlzLmFkZE5hbWVzcGFjZXMobnMpO1xuICAgIHNldFBhdGgodGhpcy5kYXRhLCBwYXRoLCB2YWx1ZSk7XG4gICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy5lbWl0KCdhZGRlZCcsIGxuZywgbnMsIGtleSwgdmFsdWUpO1xuICB9XG4gIGFkZFJlc291cmNlcyhsbmcsIG5zLCByZXNvdXJjZXMpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDoge1xuICAgICAgc2lsZW50OiBmYWxzZVxuICAgIH07XG4gICAgZm9yIChjb25zdCBtIGluIHJlc291cmNlcykge1xuICAgICAgaWYgKGlzU3RyaW5nKHJlc291cmNlc1ttXSkgfHwgQXJyYXkuaXNBcnJheShyZXNvdXJjZXNbbV0pKSB0aGlzLmFkZFJlc291cmNlKGxuZywgbnMsIG0sIHJlc291cmNlc1ttXSwge1xuICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMuc2lsZW50KSB0aGlzLmVtaXQoJ2FkZGVkJywgbG5nLCBucywgcmVzb3VyY2VzKTtcbiAgfVxuICBhZGRSZXNvdXJjZUJ1bmRsZShsbmcsIG5zLCByZXNvdXJjZXMsIGRlZXAsIG92ZXJ3cml0ZSkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDUgJiYgYXJndW1lbnRzWzVdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNV0gOiB7XG4gICAgICBzaWxlbnQ6IGZhbHNlLFxuICAgICAgc2tpcENvcHk6IGZhbHNlXG4gICAgfTtcbiAgICBsZXQgcGF0aCA9IFtsbmcsIG5zXTtcbiAgICBpZiAobG5nLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICBwYXRoID0gbG5nLnNwbGl0KCcuJyk7XG4gICAgICBkZWVwID0gcmVzb3VyY2VzO1xuICAgICAgcmVzb3VyY2VzID0gbnM7XG4gICAgICBucyA9IHBhdGhbMV07XG4gICAgfVxuICAgIHRoaXMuYWRkTmFtZXNwYWNlcyhucyk7XG4gICAgbGV0IHBhY2sgPSBnZXRQYXRoKHRoaXMuZGF0YSwgcGF0aCkgfHwge307XG4gICAgaWYgKCFvcHRpb25zLnNraXBDb3B5KSByZXNvdXJjZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlc291cmNlcykpO1xuICAgIGlmIChkZWVwKSB7XG4gICAgICBkZWVwRXh0ZW5kKHBhY2ssIHJlc291cmNlcywgb3ZlcndyaXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFjayA9IHtcbiAgICAgICAgLi4ucGFjayxcbiAgICAgICAgLi4ucmVzb3VyY2VzXG4gICAgICB9O1xuICAgIH1cbiAgICBzZXRQYXRoKHRoaXMuZGF0YSwgcGF0aCwgcGFjayk7XG4gICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy5lbWl0KCdhZGRlZCcsIGxuZywgbnMsIHJlc291cmNlcyk7XG4gIH1cbiAgcmVtb3ZlUmVzb3VyY2VCdW5kbGUobG5nLCBucykge1xuICAgIGlmICh0aGlzLmhhc1Jlc291cmNlQnVuZGxlKGxuZywgbnMpKSB7XG4gICAgICBkZWxldGUgdGhpcy5kYXRhW2xuZ11bbnNdO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZU5hbWVzcGFjZXMobnMpO1xuICAgIHRoaXMuZW1pdCgncmVtb3ZlZCcsIGxuZywgbnMpO1xuICB9XG4gIGhhc1Jlc291cmNlQnVuZGxlKGxuZywgbnMpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZXNvdXJjZShsbmcsIG5zKSAhPT0gdW5kZWZpbmVkO1xuICB9XG4gIGdldFJlc291cmNlQnVuZGxlKGxuZywgbnMpIHtcbiAgICBpZiAoIW5zKSBucyA9IHRoaXMub3B0aW9ucy5kZWZhdWx0TlM7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVzb3VyY2UobG5nLCBucyk7XG4gIH1cbiAgZ2V0RGF0YUJ5TGFuZ3VhZ2UobG5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVtsbmddO1xuICB9XG4gIGhhc0xhbmd1YWdlU29tZVRyYW5zbGF0aW9ucyhsbmcpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXREYXRhQnlMYW5ndWFnZShsbmcpO1xuICAgIGNvbnN0IG4gPSBkYXRhICYmIE9iamVjdC5rZXlzKGRhdGEpIHx8IFtdO1xuICAgIHJldHVybiAhIW4uZmluZCh2ID0+IGRhdGFbdl0gJiYgT2JqZWN0LmtleXMoZGF0YVt2XSkubGVuZ3RoID4gMCk7XG4gIH1cbiAgdG9KU09OKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGE7XG4gIH1cbn1cblxudmFyIHBvc3RQcm9jZXNzb3IgPSB7XG4gIHByb2Nlc3NvcnM6IHt9LFxuICBhZGRQb3N0UHJvY2Vzc29yKG1vZHVsZSkge1xuICAgIHRoaXMucHJvY2Vzc29yc1ttb2R1bGUubmFtZV0gPSBtb2R1bGU7XG4gIH0sXG4gIGhhbmRsZShwcm9jZXNzb3JzLCB2YWx1ZSwga2V5LCBvcHRpb25zLCB0cmFuc2xhdG9yKSB7XG4gICAgcHJvY2Vzc29ycy5mb3JFYWNoKHByb2Nlc3NvciA9PiB7XG4gICAgICB2YWx1ZSA9IHRoaXMucHJvY2Vzc29yc1twcm9jZXNzb3JdPy5wcm9jZXNzKHZhbHVlLCBrZXksIG9wdGlvbnMsIHRyYW5zbGF0b3IpID8/IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcblxuY29uc3QgY2hlY2tlZExvYWRlZEZvciA9IHt9O1xuY29uc3Qgc2hvdWxkSGFuZGxlQXNPYmplY3QgPSByZXMgPT4gIWlzU3RyaW5nKHJlcykgJiYgdHlwZW9mIHJlcyAhPT0gJ2Jvb2xlYW4nICYmIHR5cGVvZiByZXMgIT09ICdudW1iZXInO1xuY2xhc3MgVHJhbnNsYXRvciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKHNlcnZpY2VzKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIHN1cGVyKCk7XG4gICAgY29weShbJ3Jlc291cmNlU3RvcmUnLCAnbGFuZ3VhZ2VVdGlscycsICdwbHVyYWxSZXNvbHZlcicsICdpbnRlcnBvbGF0b3InLCAnYmFja2VuZENvbm5lY3RvcicsICdpMThuRm9ybWF0JywgJ3V0aWxzJ10sIHNlcnZpY2VzLCB0aGlzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLm9wdGlvbnMua2V5U2VwYXJhdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IgPSAnLic7XG4gICAgfVxuICAgIHRoaXMubG9nZ2VyID0gYmFzZUxvZ2dlci5jcmVhdGUoJ3RyYW5zbGF0b3InKTtcbiAgfVxuICBjaGFuZ2VMYW5ndWFnZShsbmcpIHtcbiAgICBpZiAobG5nKSB0aGlzLmxhbmd1YWdlID0gbG5nO1xuICB9XG4gIGV4aXN0cyhrZXkpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge1xuICAgICAgaW50ZXJwb2xhdGlvbjoge31cbiAgICB9O1xuICAgIGlmIChrZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZShrZXksIG9wdGlvbnMpO1xuICAgIHJldHVybiByZXNvbHZlZD8ucmVzICE9PSB1bmRlZmluZWQ7XG4gIH1cbiAgZXh0cmFjdEZyb21LZXkoa2V5LCBvcHRpb25zKSB7XG4gICAgbGV0IG5zU2VwYXJhdG9yID0gb3B0aW9ucy5uc1NlcGFyYXRvciAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5uc1NlcGFyYXRvciA6IHRoaXMub3B0aW9ucy5uc1NlcGFyYXRvcjtcbiAgICBpZiAobnNTZXBhcmF0b3IgPT09IHVuZGVmaW5lZCkgbnNTZXBhcmF0b3IgPSAnOic7XG4gICAgY29uc3Qga2V5U2VwYXJhdG9yID0gb3B0aW9ucy5rZXlTZXBhcmF0b3IgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMua2V5U2VwYXJhdG9yIDogdGhpcy5vcHRpb25zLmtleVNlcGFyYXRvcjtcbiAgICBsZXQgbmFtZXNwYWNlcyA9IG9wdGlvbnMubnMgfHwgdGhpcy5vcHRpb25zLmRlZmF1bHROUyB8fCBbXTtcbiAgICBjb25zdCB3b3VsZENoZWNrRm9yTnNJbktleSA9IG5zU2VwYXJhdG9yICYmIGtleS5pbmRleE9mKG5zU2VwYXJhdG9yKSA+IC0xO1xuICAgIGNvbnN0IHNlZW1zTmF0dXJhbExhbmd1YWdlID0gIXRoaXMub3B0aW9ucy51c2VyRGVmaW5lZEtleVNlcGFyYXRvciAmJiAhb3B0aW9ucy5rZXlTZXBhcmF0b3IgJiYgIXRoaXMub3B0aW9ucy51c2VyRGVmaW5lZE5zU2VwYXJhdG9yICYmICFvcHRpb25zLm5zU2VwYXJhdG9yICYmICFsb29rc0xpa2VPYmplY3RQYXRoKGtleSwgbnNTZXBhcmF0b3IsIGtleVNlcGFyYXRvcik7XG4gICAgaWYgKHdvdWxkQ2hlY2tGb3JOc0luS2V5ICYmICFzZWVtc05hdHVyYWxMYW5ndWFnZSkge1xuICAgICAgY29uc3QgbSA9IGtleS5tYXRjaCh0aGlzLmludGVycG9sYXRvci5uZXN0aW5nUmVnZXhwKTtcbiAgICAgIGlmIChtICYmIG0ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGtleSxcbiAgICAgICAgICBuYW1lc3BhY2VzOiBpc1N0cmluZyhuYW1lc3BhY2VzKSA/IFtuYW1lc3BhY2VzXSA6IG5hbWVzcGFjZXNcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KG5zU2VwYXJhdG9yKTtcbiAgICAgIGlmIChuc1NlcGFyYXRvciAhPT0ga2V5U2VwYXJhdG9yIHx8IG5zU2VwYXJhdG9yID09PSBrZXlTZXBhcmF0b3IgJiYgdGhpcy5vcHRpb25zLm5zLmluZGV4T2YocGFydHNbMF0pID4gLTEpIG5hbWVzcGFjZXMgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAga2V5ID0gcGFydHMuam9pbihrZXlTZXBhcmF0b3IpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAga2V5LFxuICAgICAgbmFtZXNwYWNlczogaXNTdHJpbmcobmFtZXNwYWNlcykgPyBbbmFtZXNwYWNlc10gOiBuYW1lc3BhY2VzXG4gICAgfTtcbiAgfVxuICB0cmFuc2xhdGUoa2V5cywgb3B0aW9ucywgbGFzdEtleSkge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcgJiYgdGhpcy5vcHRpb25zLm92ZXJsb2FkVHJhbnNsYXRpb25PcHRpb25IYW5kbGVyKSB7XG4gICAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zLm92ZXJsb2FkVHJhbnNsYXRpb25PcHRpb25IYW5kbGVyKGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIG9wdGlvbnMgPSB7XG4gICAgICAuLi5vcHRpb25zXG4gICAgfTtcbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICBpZiAoa2V5cyA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGtleXMpKSBrZXlzID0gW1N0cmluZyhrZXlzKV07XG4gICAgY29uc3QgcmV0dXJuRGV0YWlscyA9IG9wdGlvbnMucmV0dXJuRGV0YWlscyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5yZXR1cm5EZXRhaWxzIDogdGhpcy5vcHRpb25zLnJldHVybkRldGFpbHM7XG4gICAgY29uc3Qga2V5U2VwYXJhdG9yID0gb3B0aW9ucy5rZXlTZXBhcmF0b3IgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMua2V5U2VwYXJhdG9yIDogdGhpcy5vcHRpb25zLmtleVNlcGFyYXRvcjtcbiAgICBjb25zdCB7XG4gICAgICBrZXksXG4gICAgICBuYW1lc3BhY2VzXG4gICAgfSA9IHRoaXMuZXh0cmFjdEZyb21LZXkoa2V5c1trZXlzLmxlbmd0aCAtIDFdLCBvcHRpb25zKTtcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzW25hbWVzcGFjZXMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgbG5nID0gb3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZTtcbiAgICBjb25zdCBhcHBlbmROYW1lc3BhY2VUb0NJTW9kZSA9IG9wdGlvbnMuYXBwZW5kTmFtZXNwYWNlVG9DSU1vZGUgfHwgdGhpcy5vcHRpb25zLmFwcGVuZE5hbWVzcGFjZVRvQ0lNb2RlO1xuICAgIGlmIChsbmc/LnRvTG93ZXJDYXNlKCkgPT09ICdjaW1vZGUnKSB7XG4gICAgICBpZiAoYXBwZW5kTmFtZXNwYWNlVG9DSU1vZGUpIHtcbiAgICAgICAgY29uc3QgbnNTZXBhcmF0b3IgPSBvcHRpb25zLm5zU2VwYXJhdG9yIHx8IHRoaXMub3B0aW9ucy5uc1NlcGFyYXRvcjtcbiAgICAgICAgaWYgKHJldHVybkRldGFpbHMpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzOiBgJHtuYW1lc3BhY2V9JHtuc1NlcGFyYXRvcn0ke2tleX1gLFxuICAgICAgICAgICAgdXNlZEtleToga2V5LFxuICAgICAgICAgICAgZXhhY3RVc2VkS2V5OiBrZXksXG4gICAgICAgICAgICB1c2VkTG5nOiBsbmcsXG4gICAgICAgICAgICB1c2VkTlM6IG5hbWVzcGFjZSxcbiAgICAgICAgICAgIHVzZWRQYXJhbXM6IHRoaXMuZ2V0VXNlZFBhcmFtc0RldGFpbHMob3B0aW9ucylcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHtuYW1lc3BhY2V9JHtuc1NlcGFyYXRvcn0ke2tleX1gO1xuICAgICAgfVxuICAgICAgaWYgKHJldHVybkRldGFpbHMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXM6IGtleSxcbiAgICAgICAgICB1c2VkS2V5OiBrZXksXG4gICAgICAgICAgZXhhY3RVc2VkS2V5OiBrZXksXG4gICAgICAgICAgdXNlZExuZzogbG5nLFxuICAgICAgICAgIHVzZWROUzogbmFtZXNwYWNlLFxuICAgICAgICAgIHVzZWRQYXJhbXM6IHRoaXMuZ2V0VXNlZFBhcmFtc0RldGFpbHMob3B0aW9ucylcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkID0gdGhpcy5yZXNvbHZlKGtleXMsIG9wdGlvbnMpO1xuICAgIGxldCByZXMgPSByZXNvbHZlZD8ucmVzO1xuICAgIGNvbnN0IHJlc1VzZWRLZXkgPSByZXNvbHZlZD8udXNlZEtleSB8fCBrZXk7XG4gICAgY29uc3QgcmVzRXhhY3RVc2VkS2V5ID0gcmVzb2x2ZWQ/LmV4YWN0VXNlZEtleSB8fCBrZXk7XG4gICAgY29uc3Qgbm9PYmplY3QgPSBbJ1tvYmplY3QgTnVtYmVyXScsICdbb2JqZWN0IEZ1bmN0aW9uXScsICdbb2JqZWN0IFJlZ0V4cF0nXTtcbiAgICBjb25zdCBqb2luQXJyYXlzID0gb3B0aW9ucy5qb2luQXJyYXlzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmpvaW5BcnJheXMgOiB0aGlzLm9wdGlvbnMuam9pbkFycmF5cztcbiAgICBjb25zdCBoYW5kbGVBc09iamVjdEluSTE4bkZvcm1hdCA9ICF0aGlzLmkxOG5Gb3JtYXQgfHwgdGhpcy5pMThuRm9ybWF0LmhhbmRsZUFzT2JqZWN0O1xuICAgIGNvbnN0IG5lZWRzUGx1cmFsSGFuZGxpbmcgPSBvcHRpb25zLmNvdW50ICE9PSB1bmRlZmluZWQgJiYgIWlzU3RyaW5nKG9wdGlvbnMuY291bnQpO1xuICAgIGNvbnN0IGhhc0RlZmF1bHRWYWx1ZSA9IFRyYW5zbGF0b3IuaGFzRGVmYXVsdFZhbHVlKG9wdGlvbnMpO1xuICAgIGNvbnN0IGRlZmF1bHRWYWx1ZVN1ZmZpeCA9IG5lZWRzUGx1cmFsSGFuZGxpbmcgPyB0aGlzLnBsdXJhbFJlc29sdmVyLmdldFN1ZmZpeChsbmcsIG9wdGlvbnMuY291bnQsIG9wdGlvbnMpIDogJyc7XG4gICAgY29uc3QgZGVmYXVsdFZhbHVlU3VmZml4T3JkaW5hbEZhbGxiYWNrID0gb3B0aW9ucy5vcmRpbmFsICYmIG5lZWRzUGx1cmFsSGFuZGxpbmcgPyB0aGlzLnBsdXJhbFJlc29sdmVyLmdldFN1ZmZpeChsbmcsIG9wdGlvbnMuY291bnQsIHtcbiAgICAgIG9yZGluYWw6IGZhbHNlXG4gICAgfSkgOiAnJztcbiAgICBjb25zdCBuZWVkc1plcm9TdWZmaXhMb29rdXAgPSBuZWVkc1BsdXJhbEhhbmRsaW5nICYmICFvcHRpb25zLm9yZGluYWwgJiYgb3B0aW9ucy5jb3VudCA9PT0gMDtcbiAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBuZWVkc1plcm9TdWZmaXhMb29rdXAgJiYgb3B0aW9uc1tgZGVmYXVsdFZhbHVlJHt0aGlzLm9wdGlvbnMucGx1cmFsU2VwYXJhdG9yfXplcm9gXSB8fCBvcHRpb25zW2BkZWZhdWx0VmFsdWUke2RlZmF1bHRWYWx1ZVN1ZmZpeH1gXSB8fCBvcHRpb25zW2BkZWZhdWx0VmFsdWUke2RlZmF1bHRWYWx1ZVN1ZmZpeE9yZGluYWxGYWxsYmFja31gXSB8fCBvcHRpb25zLmRlZmF1bHRWYWx1ZTtcbiAgICBsZXQgcmVzRm9yT2JqSG5kbCA9IHJlcztcbiAgICBpZiAoaGFuZGxlQXNPYmplY3RJbkkxOG5Gb3JtYXQgJiYgIXJlcyAmJiBoYXNEZWZhdWx0VmFsdWUpIHtcbiAgICAgIHJlc0Zvck9iakhuZGwgPSBkZWZhdWx0VmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGhhbmRsZUFzT2JqZWN0ID0gc2hvdWxkSGFuZGxlQXNPYmplY3QocmVzRm9yT2JqSG5kbCk7XG4gICAgY29uc3QgcmVzVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkocmVzRm9yT2JqSG5kbCk7XG4gICAgaWYgKGhhbmRsZUFzT2JqZWN0SW5JMThuRm9ybWF0ICYmIHJlc0Zvck9iakhuZGwgJiYgaGFuZGxlQXNPYmplY3QgJiYgbm9PYmplY3QuaW5kZXhPZihyZXNUeXBlKSA8IDAgJiYgIShpc1N0cmluZyhqb2luQXJyYXlzKSAmJiBBcnJheS5pc0FycmF5KHJlc0Zvck9iakhuZGwpKSkge1xuICAgICAgaWYgKCFvcHRpb25zLnJldHVybk9iamVjdHMgJiYgIXRoaXMub3B0aW9ucy5yZXR1cm5PYmplY3RzKSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnJldHVybmVkT2JqZWN0SGFuZGxlcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ2FjY2Vzc2luZyBhbiBvYmplY3QgLSBidXQgcmV0dXJuT2JqZWN0cyBvcHRpb25zIGlzIG5vdCBlbmFibGVkIScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHIgPSB0aGlzLm9wdGlvbnMucmV0dXJuZWRPYmplY3RIYW5kbGVyID8gdGhpcy5vcHRpb25zLnJldHVybmVkT2JqZWN0SGFuZGxlcihyZXNVc2VkS2V5LCByZXNGb3JPYmpIbmRsLCB7XG4gICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICBuczogbmFtZXNwYWNlc1xuICAgICAgICB9KSA6IGBrZXkgJyR7a2V5fSAoJHt0aGlzLmxhbmd1YWdlfSknIHJldHVybmVkIGFuIG9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZy5gO1xuICAgICAgICBpZiAocmV0dXJuRGV0YWlscykge1xuICAgICAgICAgIHJlc29sdmVkLnJlcyA9IHI7XG4gICAgICAgICAgcmVzb2x2ZWQudXNlZFBhcmFtcyA9IHRoaXMuZ2V0VXNlZFBhcmFtc0RldGFpbHMob3B0aW9ucyk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfVxuICAgICAgaWYgKGtleVNlcGFyYXRvcikge1xuICAgICAgICBjb25zdCByZXNUeXBlSXNBcnJheSA9IEFycmF5LmlzQXJyYXkocmVzRm9yT2JqSG5kbCk7XG4gICAgICAgIGNvbnN0IGNvcHkgPSByZXNUeXBlSXNBcnJheSA/IFtdIDoge307XG4gICAgICAgIGNvbnN0IG5ld0tleVRvVXNlID0gcmVzVHlwZUlzQXJyYXkgPyByZXNFeGFjdFVzZWRLZXkgOiByZXNVc2VkS2V5O1xuICAgICAgICBmb3IgKGNvbnN0IG0gaW4gcmVzRm9yT2JqSG5kbCkge1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzRm9yT2JqSG5kbCwgbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZXBLZXkgPSBgJHtuZXdLZXlUb1VzZX0ke2tleVNlcGFyYXRvcn0ke219YDtcbiAgICAgICAgICAgIGlmIChoYXNEZWZhdWx0VmFsdWUgJiYgIXJlcykge1xuICAgICAgICAgICAgICBjb3B5W21dID0gdGhpcy50cmFuc2xhdGUoZGVlcEtleSwge1xuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBzaG91bGRIYW5kbGVBc09iamVjdChkZWZhdWx0VmFsdWUpID8gZGVmYXVsdFZhbHVlW21dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIC4uLntcbiAgICAgICAgICAgICAgICAgIGpvaW5BcnJheXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgbnM6IG5hbWVzcGFjZXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29weVttXSA9IHRoaXMudHJhbnNsYXRlKGRlZXBLZXksIHtcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgICAgIC4uLntcbiAgICAgICAgICAgICAgICAgIGpvaW5BcnJheXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgbnM6IG5hbWVzcGFjZXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvcHlbbV0gPT09IGRlZXBLZXkpIGNvcHlbbV0gPSByZXNGb3JPYmpIbmRsW21dO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXMgPSBjb3B5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFuZGxlQXNPYmplY3RJbkkxOG5Gb3JtYXQgJiYgaXNTdHJpbmcoam9pbkFycmF5cykgJiYgQXJyYXkuaXNBcnJheShyZXMpKSB7XG4gICAgICByZXMgPSByZXMuam9pbihqb2luQXJyYXlzKTtcbiAgICAgIGlmIChyZXMpIHJlcyA9IHRoaXMuZXh0ZW5kVHJhbnNsYXRpb24ocmVzLCBrZXlzLCBvcHRpb25zLCBsYXN0S2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHVzZWREZWZhdWx0ID0gZmFsc2U7XG4gICAgICBsZXQgdXNlZEtleSA9IGZhbHNlO1xuICAgICAgaWYgKCF0aGlzLmlzVmFsaWRMb29rdXAocmVzKSAmJiBoYXNEZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgdXNlZERlZmF1bHQgPSB0cnVlO1xuICAgICAgICByZXMgPSBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZExvb2t1cChyZXMpKSB7XG4gICAgICAgIHVzZWRLZXkgPSB0cnVlO1xuICAgICAgICByZXMgPSBrZXk7XG4gICAgICB9XG4gICAgICBjb25zdCBtaXNzaW5nS2V5Tm9WYWx1ZUZhbGxiYWNrVG9LZXkgPSBvcHRpb25zLm1pc3NpbmdLZXlOb1ZhbHVlRmFsbGJhY2tUb0tleSB8fCB0aGlzLm9wdGlvbnMubWlzc2luZ0tleU5vVmFsdWVGYWxsYmFja1RvS2V5O1xuICAgICAgY29uc3QgcmVzRm9yTWlzc2luZyA9IG1pc3NpbmdLZXlOb1ZhbHVlRmFsbGJhY2tUb0tleSAmJiB1c2VkS2V5ID8gdW5kZWZpbmVkIDogcmVzO1xuICAgICAgY29uc3QgdXBkYXRlTWlzc2luZyA9IGhhc0RlZmF1bHRWYWx1ZSAmJiBkZWZhdWx0VmFsdWUgIT09IHJlcyAmJiB0aGlzLm9wdGlvbnMudXBkYXRlTWlzc2luZztcbiAgICAgIGlmICh1c2VkS2V5IHx8IHVzZWREZWZhdWx0IHx8IHVwZGF0ZU1pc3NpbmcpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKHVwZGF0ZU1pc3NpbmcgPyAndXBkYXRlS2V5JyA6ICdtaXNzaW5nS2V5JywgbG5nLCBuYW1lc3BhY2UsIGtleSwgdXBkYXRlTWlzc2luZyA/IGRlZmF1bHRWYWx1ZSA6IHJlcyk7XG4gICAgICAgIGlmIChrZXlTZXBhcmF0b3IpIHtcbiAgICAgICAgICBjb25zdCBmayA9IHRoaXMucmVzb2x2ZShrZXksIHtcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBrZXlTZXBhcmF0b3I6IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGZrICYmIGZrLnJlcykgdGhpcy5sb2dnZXIud2FybignU2VlbXMgdGhlIGxvYWRlZCB0cmFuc2xhdGlvbnMgd2VyZSBpbiBmbGF0IEpTT04gZm9ybWF0IGluc3RlYWQgb2YgbmVzdGVkLiBFaXRoZXIgc2V0IGtleVNlcGFyYXRvcjogZmFsc2Ugb24gaW5pdCBvciBtYWtlIHN1cmUgeW91ciB0cmFuc2xhdGlvbnMgYXJlIHB1Ymxpc2hlZCBpbiBuZXN0ZWQgZm9ybWF0LicpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsbmdzID0gW107XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrTG5ncyA9IHRoaXMubGFuZ3VhZ2VVdGlscy5nZXRGYWxsYmFja0NvZGVzKHRoaXMub3B0aW9ucy5mYWxsYmFja0xuZywgb3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2F2ZU1pc3NpbmdUbyA9PT0gJ2ZhbGxiYWNrJyAmJiBmYWxsYmFja0xuZ3MgJiYgZmFsbGJhY2tMbmdzWzBdKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWxsYmFja0xuZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxuZ3MucHVzaChmYWxsYmFja0xuZ3NbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuc2F2ZU1pc3NpbmdUbyA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICBsbmdzID0gdGhpcy5sYW5ndWFnZVV0aWxzLnRvUmVzb2x2ZUhpZXJhcmNoeShvcHRpb25zLmxuZyB8fCB0aGlzLmxhbmd1YWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsbmdzLnB1c2gob3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VuZCA9IChsLCBrLCBzcGVjaWZpY0RlZmF1bHRWYWx1ZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRGb3JNaXNzaW5nID0gaGFzRGVmYXVsdFZhbHVlICYmIHNwZWNpZmljRGVmYXVsdFZhbHVlICE9PSByZXMgPyBzcGVjaWZpY0RlZmF1bHRWYWx1ZSA6IHJlc0Zvck1pc3Npbmc7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taXNzaW5nS2V5SGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1pc3NpbmdLZXlIYW5kbGVyKGwsIG5hbWVzcGFjZSwgaywgZGVmYXVsdEZvck1pc3NpbmcsIHVwZGF0ZU1pc3NpbmcsIG9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5iYWNrZW5kQ29ubmVjdG9yPy5zYXZlTWlzc2luZykge1xuICAgICAgICAgICAgdGhpcy5iYWNrZW5kQ29ubmVjdG9yLnNhdmVNaXNzaW5nKGwsIG5hbWVzcGFjZSwgaywgZGVmYXVsdEZvck1pc3NpbmcsIHVwZGF0ZU1pc3NpbmcsIG9wdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmVtaXQoJ21pc3NpbmdLZXknLCBsLCBuYW1lc3BhY2UsIGssIHJlcyk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2F2ZU1pc3NpbmcpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNhdmVNaXNzaW5nUGx1cmFscyAmJiBuZWVkc1BsdXJhbEhhbmRsaW5nKSB7XG4gICAgICAgICAgICBsbmdzLmZvckVhY2gobGFuZ3VhZ2UgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdWZmaXhlcyA9IHRoaXMucGx1cmFsUmVzb2x2ZXIuZ2V0U3VmZml4ZXMobGFuZ3VhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICBpZiAobmVlZHNaZXJvU3VmZml4TG9va3VwICYmIG9wdGlvbnNbYGRlZmF1bHRWYWx1ZSR7dGhpcy5vcHRpb25zLnBsdXJhbFNlcGFyYXRvcn16ZXJvYF0gJiYgc3VmZml4ZXMuaW5kZXhPZihgJHt0aGlzLm9wdGlvbnMucGx1cmFsU2VwYXJhdG9yfXplcm9gKSA8IDApIHtcbiAgICAgICAgICAgICAgICBzdWZmaXhlcy5wdXNoKGAke3RoaXMub3B0aW9ucy5wbHVyYWxTZXBhcmF0b3J9emVyb2ApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN1ZmZpeGVzLmZvckVhY2goc3VmZml4ID0+IHtcbiAgICAgICAgICAgICAgICBzZW5kKFtsYW5ndWFnZV0sIGtleSArIHN1ZmZpeCwgb3B0aW9uc1tgZGVmYXVsdFZhbHVlJHtzdWZmaXh9YF0gfHwgZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZChsbmdzLCBrZXksIGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXMgPSB0aGlzLmV4dGVuZFRyYW5zbGF0aW9uKHJlcywga2V5cywgb3B0aW9ucywgcmVzb2x2ZWQsIGxhc3RLZXkpO1xuICAgICAgaWYgKHVzZWRLZXkgJiYgcmVzID09PSBrZXkgJiYgdGhpcy5vcHRpb25zLmFwcGVuZE5hbWVzcGFjZVRvTWlzc2luZ0tleSkgcmVzID0gYCR7bmFtZXNwYWNlfToke2tleX1gO1xuICAgICAgaWYgKCh1c2VkS2V5IHx8IHVzZWREZWZhdWx0KSAmJiB0aGlzLm9wdGlvbnMucGFyc2VNaXNzaW5nS2V5SGFuZGxlcikge1xuICAgICAgICByZXMgPSB0aGlzLm9wdGlvbnMucGFyc2VNaXNzaW5nS2V5SGFuZGxlcih0aGlzLm9wdGlvbnMuYXBwZW5kTmFtZXNwYWNlVG9NaXNzaW5nS2V5ID8gYCR7bmFtZXNwYWNlfToke2tleX1gIDoga2V5LCB1c2VkRGVmYXVsdCA/IHJlcyA6IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXR1cm5EZXRhaWxzKSB7XG4gICAgICByZXNvbHZlZC5yZXMgPSByZXM7XG4gICAgICByZXNvbHZlZC51c2VkUGFyYW1zID0gdGhpcy5nZXRVc2VkUGFyYW1zRGV0YWlscyhvcHRpb25zKTtcbiAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBleHRlbmRUcmFuc2xhdGlvbihyZXMsIGtleSwgb3B0aW9ucywgcmVzb2x2ZWQsIGxhc3RLZXkpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmICh0aGlzLmkxOG5Gb3JtYXQ/LnBhcnNlKSB7XG4gICAgICByZXMgPSB0aGlzLmkxOG5Gb3JtYXQucGFyc2UocmVzLCB7XG4gICAgICAgIC4uLnRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uLmRlZmF1bHRWYXJpYWJsZXMsXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH0sIG9wdGlvbnMubG5nIHx8IHRoaXMubGFuZ3VhZ2UgfHwgcmVzb2x2ZWQudXNlZExuZywgcmVzb2x2ZWQudXNlZE5TLCByZXNvbHZlZC51c2VkS2V5LCB7XG4gICAgICAgIHJlc29sdmVkXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFvcHRpb25zLnNraXBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbnRlcnBvbGF0aW9uKSB0aGlzLmludGVycG9sYXRvci5pbml0KHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4ue1xuICAgICAgICAgIGludGVycG9sYXRpb246IHtcbiAgICAgICAgICAgIC4uLnRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uLFxuICAgICAgICAgICAgLi4ub3B0aW9ucy5pbnRlcnBvbGF0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHNraXBPblZhcmlhYmxlcyA9IGlzU3RyaW5nKHJlcykgJiYgKG9wdGlvbnM/LmludGVycG9sYXRpb24/LnNraXBPblZhcmlhYmxlcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5pbnRlcnBvbGF0aW9uLnNraXBPblZhcmlhYmxlcyA6IHRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uLnNraXBPblZhcmlhYmxlcyk7XG4gICAgICBsZXQgbmVzdEJlZjtcbiAgICAgIGlmIChza2lwT25WYXJpYWJsZXMpIHtcbiAgICAgICAgY29uc3QgbmIgPSByZXMubWF0Y2godGhpcy5pbnRlcnBvbGF0b3IubmVzdGluZ1JlZ2V4cCk7XG4gICAgICAgIG5lc3RCZWYgPSBuYiAmJiBuYi5sZW5ndGg7XG4gICAgICB9XG4gICAgICBsZXQgZGF0YSA9IG9wdGlvbnMucmVwbGFjZSAmJiAhaXNTdHJpbmcob3B0aW9ucy5yZXBsYWNlKSA/IG9wdGlvbnMucmVwbGFjZSA6IG9wdGlvbnM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcykgZGF0YSA9IHtcbiAgICAgICAgLi4udGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcyxcbiAgICAgICAgLi4uZGF0YVxuICAgICAgfTtcbiAgICAgIHJlcyA9IHRoaXMuaW50ZXJwb2xhdG9yLmludGVycG9sYXRlKHJlcywgZGF0YSwgb3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZSB8fCByZXNvbHZlZC51c2VkTG5nLCBvcHRpb25zKTtcbiAgICAgIGlmIChza2lwT25WYXJpYWJsZXMpIHtcbiAgICAgICAgY29uc3QgbmEgPSByZXMubWF0Y2godGhpcy5pbnRlcnBvbGF0b3IubmVzdGluZ1JlZ2V4cCk7XG4gICAgICAgIGNvbnN0IG5lc3RBZnQgPSBuYSAmJiBuYS5sZW5ndGg7XG4gICAgICAgIGlmIChuZXN0QmVmIDwgbmVzdEFmdCkgb3B0aW9ucy5uZXN0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIW9wdGlvbnMubG5nICYmIHJlc29sdmVkICYmIHJlc29sdmVkLnJlcykgb3B0aW9ucy5sbmcgPSB0aGlzLmxhbmd1YWdlIHx8IHJlc29sdmVkLnVzZWRMbmc7XG4gICAgICBpZiAob3B0aW9ucy5uZXN0ICE9PSBmYWxzZSkgcmVzID0gdGhpcy5pbnRlcnBvbGF0b3IubmVzdChyZXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdEtleT8uWzBdID09PSBhcmdzWzBdICYmICFvcHRpb25zLmNvbnRleHQpIHtcbiAgICAgICAgICBfdGhpcy5sb2dnZXIud2FybihgSXQgc2VlbXMgeW91IGFyZSBuZXN0aW5nIHJlY3Vyc2l2ZWx5IGtleTogJHthcmdzWzBdfSBpbiBrZXk6ICR7a2V5WzBdfWApO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy50cmFuc2xhdGUoLi4uYXJncywga2V5KTtcbiAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMuaW50ZXJwb2xhdGlvbikgdGhpcy5pbnRlcnBvbGF0b3IucmVzZXQoKTtcbiAgICB9XG4gICAgY29uc3QgcG9zdFByb2Nlc3MgPSBvcHRpb25zLnBvc3RQcm9jZXNzIHx8IHRoaXMub3B0aW9ucy5wb3N0UHJvY2VzcztcbiAgICBjb25zdCBwb3N0UHJvY2Vzc29yTmFtZXMgPSBpc1N0cmluZyhwb3N0UHJvY2VzcykgPyBbcG9zdFByb2Nlc3NdIDogcG9zdFByb2Nlc3M7XG4gICAgaWYgKHJlcyAhPSBudWxsICYmIHBvc3RQcm9jZXNzb3JOYW1lcz8ubGVuZ3RoICYmIG9wdGlvbnMuYXBwbHlQb3N0UHJvY2Vzc29yICE9PSBmYWxzZSkge1xuICAgICAgcmVzID0gcG9zdFByb2Nlc3Nvci5oYW5kbGUocG9zdFByb2Nlc3Nvck5hbWVzLCByZXMsIGtleSwgdGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5wb3N0UHJvY2Vzc1Bhc3NSZXNvbHZlZCA/IHtcbiAgICAgICAgaTE4blJlc29sdmVkOiB7XG4gICAgICAgICAgLi4ucmVzb2x2ZWQsXG4gICAgICAgICAgdXNlZFBhcmFtczogdGhpcy5nZXRVc2VkUGFyYW1zRGV0YWlscyhvcHRpb25zKVxuICAgICAgICB9LFxuICAgICAgICAuLi5vcHRpb25zXG4gICAgICB9IDogb3B0aW9ucywgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmVzb2x2ZShrZXlzKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIGxldCBmb3VuZDtcbiAgICBsZXQgdXNlZEtleTtcbiAgICBsZXQgZXhhY3RVc2VkS2V5O1xuICAgIGxldCB1c2VkTG5nO1xuICAgIGxldCB1c2VkTlM7XG4gICAgaWYgKGlzU3RyaW5nKGtleXMpKSBrZXlzID0gW2tleXNdO1xuICAgIGtleXMuZm9yRWFjaChrID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWRMb29rdXAoZm91bmQpKSByZXR1cm47XG4gICAgICBjb25zdCBleHRyYWN0ZWQgPSB0aGlzLmV4dHJhY3RGcm9tS2V5KGssIG9wdGlvbnMpO1xuICAgICAgY29uc3Qga2V5ID0gZXh0cmFjdGVkLmtleTtcbiAgICAgIHVzZWRLZXkgPSBrZXk7XG4gICAgICBsZXQgbmFtZXNwYWNlcyA9IGV4dHJhY3RlZC5uYW1lc3BhY2VzO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5mYWxsYmFja05TKSBuYW1lc3BhY2VzID0gbmFtZXNwYWNlcy5jb25jYXQodGhpcy5vcHRpb25zLmZhbGxiYWNrTlMpO1xuICAgICAgY29uc3QgbmVlZHNQbHVyYWxIYW5kbGluZyA9IG9wdGlvbnMuY291bnQgIT09IHVuZGVmaW5lZCAmJiAhaXNTdHJpbmcob3B0aW9ucy5jb3VudCk7XG4gICAgICBjb25zdCBuZWVkc1plcm9TdWZmaXhMb29rdXAgPSBuZWVkc1BsdXJhbEhhbmRsaW5nICYmICFvcHRpb25zLm9yZGluYWwgJiYgb3B0aW9ucy5jb3VudCA9PT0gMDtcbiAgICAgIGNvbnN0IG5lZWRzQ29udGV4dEhhbmRsaW5nID0gb3B0aW9ucy5jb250ZXh0ICE9PSB1bmRlZmluZWQgJiYgKGlzU3RyaW5nKG9wdGlvbnMuY29udGV4dCkgfHwgdHlwZW9mIG9wdGlvbnMuY29udGV4dCA9PT0gJ251bWJlcicpICYmIG9wdGlvbnMuY29udGV4dCAhPT0gJyc7XG4gICAgICBjb25zdCBjb2RlcyA9IG9wdGlvbnMubG5ncyA/IG9wdGlvbnMubG5ncyA6IHRoaXMubGFuZ3VhZ2VVdGlscy50b1Jlc29sdmVIaWVyYXJjaHkob3B0aW9ucy5sbmcgfHwgdGhpcy5sYW5ndWFnZSwgb3B0aW9ucy5mYWxsYmFja0xuZyk7XG4gICAgICBuYW1lc3BhY2VzLmZvckVhY2gobnMgPT4ge1xuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkTG9va3VwKGZvdW5kKSkgcmV0dXJuO1xuICAgICAgICB1c2VkTlMgPSBucztcbiAgICAgICAgaWYgKCFjaGVja2VkTG9hZGVkRm9yW2Ake2NvZGVzWzBdfS0ke25zfWBdICYmIHRoaXMudXRpbHM/Lmhhc0xvYWRlZE5hbWVzcGFjZSAmJiAhdGhpcy51dGlscz8uaGFzTG9hZGVkTmFtZXNwYWNlKHVzZWROUykpIHtcbiAgICAgICAgICBjaGVja2VkTG9hZGVkRm9yW2Ake2NvZGVzWzBdfS0ke25zfWBdID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmxvZ2dlci53YXJuKGBrZXkgXCIke3VzZWRLZXl9XCIgZm9yIGxhbmd1YWdlcyBcIiR7Y29kZXMuam9pbignLCAnKX1cIiB3b24ndCBnZXQgcmVzb2x2ZWQgYXMgbmFtZXNwYWNlIFwiJHt1c2VkTlN9XCIgd2FzIG5vdCB5ZXQgbG9hZGVkYCwgJ1RoaXMgbWVhbnMgc29tZXRoaW5nIElTIFdST05HIGluIHlvdXIgc2V0dXAuIFlvdSBhY2Nlc3MgdGhlIHQgZnVuY3Rpb24gYmVmb3JlIGkxOG5leHQuaW5pdCAvIGkxOG5leHQubG9hZE5hbWVzcGFjZSAvIGkxOG5leHQuY2hhbmdlTGFuZ3VhZ2Ugd2FzIGRvbmUuIFdhaXQgZm9yIHRoZSBjYWxsYmFjayBvciBQcm9taXNlIHRvIHJlc29sdmUgYmVmb3JlIGFjY2Vzc2luZyBpdCEhIScpO1xuICAgICAgICB9XG4gICAgICAgIGNvZGVzLmZvckVhY2goY29kZSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZExvb2t1cChmb3VuZCkpIHJldHVybjtcbiAgICAgICAgICB1c2VkTG5nID0gY29kZTtcbiAgICAgICAgICBjb25zdCBmaW5hbEtleXMgPSBba2V5XTtcbiAgICAgICAgICBpZiAodGhpcy5pMThuRm9ybWF0Py5hZGRMb29rdXBLZXlzKSB7XG4gICAgICAgICAgICB0aGlzLmkxOG5Gb3JtYXQuYWRkTG9va3VwS2V5cyhmaW5hbEtleXMsIGtleSwgY29kZSwgbnMsIG9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgcGx1cmFsU3VmZml4O1xuICAgICAgICAgICAgaWYgKG5lZWRzUGx1cmFsSGFuZGxpbmcpIHBsdXJhbFN1ZmZpeCA9IHRoaXMucGx1cmFsUmVzb2x2ZXIuZ2V0U3VmZml4KGNvZGUsIG9wdGlvbnMuY291bnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgemVyb1N1ZmZpeCA9IGAke3RoaXMub3B0aW9ucy5wbHVyYWxTZXBhcmF0b3J9emVyb2A7XG4gICAgICAgICAgICBjb25zdCBvcmRpbmFsUHJlZml4ID0gYCR7dGhpcy5vcHRpb25zLnBsdXJhbFNlcGFyYXRvcn1vcmRpbmFsJHt0aGlzLm9wdGlvbnMucGx1cmFsU2VwYXJhdG9yfWA7XG4gICAgICAgICAgICBpZiAobmVlZHNQbHVyYWxIYW5kbGluZykge1xuICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChrZXkgKyBwbHVyYWxTdWZmaXgpO1xuICAgICAgICAgICAgICBpZiAob3B0aW9ucy5vcmRpbmFsICYmIHBsdXJhbFN1ZmZpeC5pbmRleE9mKG9yZGluYWxQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZmluYWxLZXlzLnB1c2goa2V5ICsgcGx1cmFsU3VmZml4LnJlcGxhY2Uob3JkaW5hbFByZWZpeCwgdGhpcy5vcHRpb25zLnBsdXJhbFNlcGFyYXRvcikpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChuZWVkc1plcm9TdWZmaXhMb29rdXApIHtcbiAgICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChrZXkgKyB6ZXJvU3VmZml4KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5lZWRzQ29udGV4dEhhbmRsaW5nKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRleHRLZXkgPSBgJHtrZXl9JHt0aGlzLm9wdGlvbnMuY29udGV4dFNlcGFyYXRvcn0ke29wdGlvbnMuY29udGV4dH1gO1xuICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChjb250ZXh0S2V5KTtcbiAgICAgICAgICAgICAgaWYgKG5lZWRzUGx1cmFsSGFuZGxpbmcpIHtcbiAgICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChjb250ZXh0S2V5ICsgcGx1cmFsU3VmZml4KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5vcmRpbmFsICYmIHBsdXJhbFN1ZmZpeC5pbmRleE9mKG9yZGluYWxQcmVmaXgpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChjb250ZXh0S2V5ICsgcGx1cmFsU3VmZml4LnJlcGxhY2Uob3JkaW5hbFByZWZpeCwgdGhpcy5vcHRpb25zLnBsdXJhbFNlcGFyYXRvcikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmVlZHNaZXJvU3VmZml4TG9va3VwKSB7XG4gICAgICAgICAgICAgICAgICBmaW5hbEtleXMucHVzaChjb250ZXh0S2V5ICsgemVyb1N1ZmZpeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBwb3NzaWJsZUtleTtcbiAgICAgICAgICB3aGlsZSAocG9zc2libGVLZXkgPSBmaW5hbEtleXMucG9wKCkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkTG9va3VwKGZvdW5kKSkge1xuICAgICAgICAgICAgICBleGFjdFVzZWRLZXkgPSBwb3NzaWJsZUtleTtcbiAgICAgICAgICAgICAgZm91bmQgPSB0aGlzLmdldFJlc291cmNlKGNvZGUsIG5zLCBwb3NzaWJsZUtleSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZXM6IGZvdW5kLFxuICAgICAgdXNlZEtleSxcbiAgICAgIGV4YWN0VXNlZEtleSxcbiAgICAgIHVzZWRMbmcsXG4gICAgICB1c2VkTlNcbiAgICB9O1xuICB9XG4gIGlzVmFsaWRMb29rdXAocmVzKSB7XG4gICAgcmV0dXJuIHJlcyAhPT0gdW5kZWZpbmVkICYmICEoIXRoaXMub3B0aW9ucy5yZXR1cm5OdWxsICYmIHJlcyA9PT0gbnVsbCkgJiYgISghdGhpcy5vcHRpb25zLnJldHVybkVtcHR5U3RyaW5nICYmIHJlcyA9PT0gJycpO1xuICB9XG4gIGdldFJlc291cmNlKGNvZGUsIG5zLCBrZXkpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDoge307XG4gICAgaWYgKHRoaXMuaTE4bkZvcm1hdD8uZ2V0UmVzb3VyY2UpIHJldHVybiB0aGlzLmkxOG5Gb3JtYXQuZ2V0UmVzb3VyY2UoY29kZSwgbnMsIGtleSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VTdG9yZS5nZXRSZXNvdXJjZShjb2RlLCBucywga2V5LCBvcHRpb25zKTtcbiAgfVxuICBnZXRVc2VkUGFyYW1zRGV0YWlscygpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgY29uc3Qgb3B0aW9uc0tleXMgPSBbJ2RlZmF1bHRWYWx1ZScsICdvcmRpbmFsJywgJ2NvbnRleHQnLCAncmVwbGFjZScsICdsbmcnLCAnbG5ncycsICdmYWxsYmFja0xuZycsICducycsICdrZXlTZXBhcmF0b3InLCAnbnNTZXBhcmF0b3InLCAncmV0dXJuT2JqZWN0cycsICdyZXR1cm5EZXRhaWxzJywgJ2pvaW5BcnJheXMnLCAncG9zdFByb2Nlc3MnLCAnaW50ZXJwb2xhdGlvbiddO1xuICAgIGNvbnN0IHVzZU9wdGlvbnNSZXBsYWNlRm9yRGF0YSA9IG9wdGlvbnMucmVwbGFjZSAmJiAhaXNTdHJpbmcob3B0aW9ucy5yZXBsYWNlKTtcbiAgICBsZXQgZGF0YSA9IHVzZU9wdGlvbnNSZXBsYWNlRm9yRGF0YSA/IG9wdGlvbnMucmVwbGFjZSA6IG9wdGlvbnM7XG4gICAgaWYgKHVzZU9wdGlvbnNSZXBsYWNlRm9yRGF0YSAmJiB0eXBlb2Ygb3B0aW9ucy5jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGRhdGEuY291bnQgPSBvcHRpb25zLmNvdW50O1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcykge1xuICAgICAgZGF0YSA9IHtcbiAgICAgICAgLi4udGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcyxcbiAgICAgICAgLi4uZGF0YVxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCF1c2VPcHRpb25zUmVwbGFjZUZvckRhdGEpIHtcbiAgICAgIGRhdGEgPSB7XG4gICAgICAgIC4uLmRhdGFcbiAgICAgIH07XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBvcHRpb25zS2V5cykge1xuICAgICAgICBkZWxldGUgZGF0YVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBzdGF0aWMgaGFzRGVmYXVsdFZhbHVlKG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcmVmaXggPSAnZGVmYXVsdFZhbHVlJztcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIG9wdGlvbikgJiYgcHJlZml4ID09PSBvcHRpb24uc3Vic3RyaW5nKDAsIHByZWZpeC5sZW5ndGgpICYmIHVuZGVmaW5lZCAhPT0gb3B0aW9uc1tvcHRpb25dKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuY2xhc3MgTGFuZ3VhZ2VVdGlsIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5zdXBwb3J0ZWRMbmdzID0gdGhpcy5vcHRpb25zLnN1cHBvcnRlZExuZ3MgfHwgZmFsc2U7XG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgnbGFuZ3VhZ2VVdGlscycpO1xuICB9XG4gIGdldFNjcmlwdFBhcnRGcm9tQ29kZShjb2RlKSB7XG4gICAgY29kZSA9IGdldENsZWFuZWRDb2RlKGNvZGUpO1xuICAgIGlmICghY29kZSB8fCBjb2RlLmluZGV4T2YoJy0nKSA8IDApIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHAgPSBjb2RlLnNwbGl0KCctJyk7XG4gICAgaWYgKHAubGVuZ3RoID09PSAyKSByZXR1cm4gbnVsbDtcbiAgICBwLnBvcCgpO1xuICAgIGlmIChwW3AubGVuZ3RoIC0gMV0udG9Mb3dlckNhc2UoKSA9PT0gJ3gnKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUocC5qb2luKCctJykpO1xuICB9XG4gIGdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpIHtcbiAgICBjb2RlID0gZ2V0Q2xlYW5lZENvZGUoY29kZSk7XG4gICAgaWYgKCFjb2RlIHx8IGNvZGUuaW5kZXhPZignLScpIDwgMCkgcmV0dXJuIGNvZGU7XG4gICAgY29uc3QgcCA9IGNvZGUuc3BsaXQoJy0nKTtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUocFswXSk7XG4gIH1cbiAgZm9ybWF0TGFuZ3VhZ2VDb2RlKGNvZGUpIHtcbiAgICBpZiAoaXNTdHJpbmcoY29kZSkgJiYgY29kZS5pbmRleE9mKCctJykgPiAtMSkge1xuICAgICAgbGV0IGZvcm1hdHRlZENvZGU7XG4gICAgICB0cnkge1xuICAgICAgICBmb3JtYXR0ZWRDb2RlID0gSW50bC5nZXRDYW5vbmljYWxMb2NhbGVzKGNvZGUpWzBdO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIGlmIChmb3JtYXR0ZWRDb2RlICYmIHRoaXMub3B0aW9ucy5sb3dlckNhc2VMbmcpIHtcbiAgICAgICAgZm9ybWF0dGVkQ29kZSA9IGZvcm1hdHRlZENvZGUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChmb3JtYXR0ZWRDb2RlKSByZXR1cm4gZm9ybWF0dGVkQ29kZTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubG93ZXJDYXNlTG5nKSB7XG4gICAgICAgIHJldHVybiBjb2RlLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29kZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jbGVhbkNvZGUgfHwgdGhpcy5vcHRpb25zLmxvd2VyQ2FzZUxuZyA/IGNvZGUudG9Mb3dlckNhc2UoKSA6IGNvZGU7XG4gIH1cbiAgaXNTdXBwb3J0ZWRDb2RlKGNvZGUpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvYWQgPT09ICdsYW5ndWFnZU9ubHknIHx8IHRoaXMub3B0aW9ucy5ub25FeHBsaWNpdFN1cHBvcnRlZExuZ3MpIHtcbiAgICAgIGNvZGUgPSB0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gIXRoaXMuc3VwcG9ydGVkTG5ncyB8fCAhdGhpcy5zdXBwb3J0ZWRMbmdzLmxlbmd0aCB8fCB0aGlzLnN1cHBvcnRlZExuZ3MuaW5kZXhPZihjb2RlKSA+IC0xO1xuICB9XG4gIGdldEJlc3RNYXRjaEZyb21Db2Rlcyhjb2Rlcykge1xuICAgIGlmICghY29kZXMpIHJldHVybiBudWxsO1xuICAgIGxldCBmb3VuZDtcbiAgICBjb2Rlcy5mb3JFYWNoKGNvZGUgPT4ge1xuICAgICAgaWYgKGZvdW5kKSByZXR1cm47XG4gICAgICBjb25zdCBjbGVhbmVkTG5nID0gdGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUoY29kZSk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5zdXBwb3J0ZWRMbmdzIHx8IHRoaXMuaXNTdXBwb3J0ZWRDb2RlKGNsZWFuZWRMbmcpKSBmb3VuZCA9IGNsZWFuZWRMbmc7XG4gICAgfSk7XG4gICAgaWYgKCFmb3VuZCAmJiB0aGlzLm9wdGlvbnMuc3VwcG9ydGVkTG5ncykge1xuICAgICAgY29kZXMuZm9yRWFjaChjb2RlID0+IHtcbiAgICAgICAgaWYgKGZvdW5kKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGxuZ09ubHkgPSB0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpO1xuICAgICAgICBpZiAodGhpcy5pc1N1cHBvcnRlZENvZGUobG5nT25seSkpIHJldHVybiBmb3VuZCA9IGxuZ09ubHk7XG4gICAgICAgIGZvdW5kID0gdGhpcy5vcHRpb25zLnN1cHBvcnRlZExuZ3MuZmluZChzdXBwb3J0ZWRMbmcgPT4ge1xuICAgICAgICAgIGlmIChzdXBwb3J0ZWRMbmcgPT09IGxuZ09ubHkpIHJldHVybiBzdXBwb3J0ZWRMbmc7XG4gICAgICAgICAgaWYgKHN1cHBvcnRlZExuZy5pbmRleE9mKCctJykgPCAwICYmIGxuZ09ubHkuaW5kZXhPZignLScpIDwgMCkgcmV0dXJuO1xuICAgICAgICAgIGlmIChzdXBwb3J0ZWRMbmcuaW5kZXhPZignLScpID4gMCAmJiBsbmdPbmx5LmluZGV4T2YoJy0nKSA8IDAgJiYgc3VwcG9ydGVkTG5nLnN1YnN0cmluZygwLCBzdXBwb3J0ZWRMbmcuaW5kZXhPZignLScpKSA9PT0gbG5nT25seSkgcmV0dXJuIHN1cHBvcnRlZExuZztcbiAgICAgICAgICBpZiAoc3VwcG9ydGVkTG5nLmluZGV4T2YobG5nT25seSkgPT09IDAgJiYgbG5nT25seS5sZW5ndGggPiAxKSByZXR1cm4gc3VwcG9ydGVkTG5nO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWZvdW5kKSBmb3VuZCA9IHRoaXMuZ2V0RmFsbGJhY2tDb2Rlcyh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcpWzBdO1xuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuICBnZXRGYWxsYmFja0NvZGVzKGZhbGxiYWNrcywgY29kZSkge1xuICAgIGlmICghZmFsbGJhY2tzKSByZXR1cm4gW107XG4gICAgaWYgKHR5cGVvZiBmYWxsYmFja3MgPT09ICdmdW5jdGlvbicpIGZhbGxiYWNrcyA9IGZhbGxiYWNrcyhjb2RlKTtcbiAgICBpZiAoaXNTdHJpbmcoZmFsbGJhY2tzKSkgZmFsbGJhY2tzID0gW2ZhbGxiYWNrc107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZmFsbGJhY2tzKSkgcmV0dXJuIGZhbGxiYWNrcztcbiAgICBpZiAoIWNvZGUpIHJldHVybiBmYWxsYmFja3MuZGVmYXVsdCB8fCBbXTtcbiAgICBsZXQgZm91bmQgPSBmYWxsYmFja3NbY29kZV07XG4gICAgaWYgKCFmb3VuZCkgZm91bmQgPSBmYWxsYmFja3NbdGhpcy5nZXRTY3JpcHRQYXJ0RnJvbUNvZGUoY29kZSldO1xuICAgIGlmICghZm91bmQpIGZvdW5kID0gZmFsbGJhY2tzW3RoaXMuZm9ybWF0TGFuZ3VhZ2VDb2RlKGNvZGUpXTtcbiAgICBpZiAoIWZvdW5kKSBmb3VuZCA9IGZhbGxiYWNrc1t0aGlzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGNvZGUpXTtcbiAgICBpZiAoIWZvdW5kKSBmb3VuZCA9IGZhbGxiYWNrcy5kZWZhdWx0O1xuICAgIHJldHVybiBmb3VuZCB8fCBbXTtcbiAgfVxuICB0b1Jlc29sdmVIaWVyYXJjaHkoY29kZSwgZmFsbGJhY2tDb2RlKSB7XG4gICAgY29uc3QgZmFsbGJhY2tDb2RlcyA9IHRoaXMuZ2V0RmFsbGJhY2tDb2RlcyhmYWxsYmFja0NvZGUgfHwgdGhpcy5vcHRpb25zLmZhbGxiYWNrTG5nIHx8IFtdLCBjb2RlKTtcbiAgICBjb25zdCBjb2RlcyA9IFtdO1xuICAgIGNvbnN0IGFkZENvZGUgPSBjID0+IHtcbiAgICAgIGlmICghYykgcmV0dXJuO1xuICAgICAgaWYgKHRoaXMuaXNTdXBwb3J0ZWRDb2RlKGMpKSB7XG4gICAgICAgIGNvZGVzLnB1c2goYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKGByZWplY3RpbmcgbGFuZ3VhZ2UgY29kZSBub3QgZm91bmQgaW4gc3VwcG9ydGVkTG5nczogJHtjfWApO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGlzU3RyaW5nKGNvZGUpICYmIChjb2RlLmluZGV4T2YoJy0nKSA+IC0xIHx8IGNvZGUuaW5kZXhPZignXycpID4gLTEpKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxvYWQgIT09ICdsYW5ndWFnZU9ubHknKSBhZGRDb2RlKHRoaXMuZm9ybWF0TGFuZ3VhZ2VDb2RlKGNvZGUpKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9hZCAhPT0gJ2xhbmd1YWdlT25seScgJiYgdGhpcy5vcHRpb25zLmxvYWQgIT09ICdjdXJyZW50T25seScpIGFkZENvZGUodGhpcy5nZXRTY3JpcHRQYXJ0RnJvbUNvZGUoY29kZSkpO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2FkICE9PSAnY3VycmVudE9ubHknKSBhZGRDb2RlKHRoaXMuZ2V0TGFuZ3VhZ2VQYXJ0RnJvbUNvZGUoY29kZSkpO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcoY29kZSkpIHtcbiAgICAgIGFkZENvZGUodGhpcy5mb3JtYXRMYW5ndWFnZUNvZGUoY29kZSkpO1xuICAgIH1cbiAgICBmYWxsYmFja0NvZGVzLmZvckVhY2goZmMgPT4ge1xuICAgICAgaWYgKGNvZGVzLmluZGV4T2YoZmMpIDwgMCkgYWRkQ29kZSh0aGlzLmZvcm1hdExhbmd1YWdlQ29kZShmYykpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb2RlcztcbiAgfVxufVxuXG5jb25zdCBzdWZmaXhlc09yZGVyID0ge1xuICB6ZXJvOiAwLFxuICBvbmU6IDEsXG4gIHR3bzogMixcbiAgZmV3OiAzLFxuICBtYW55OiA0LFxuICBvdGhlcjogNVxufTtcbmNvbnN0IGR1bW15UnVsZSA9IHtcbiAgc2VsZWN0OiBjb3VudCA9PiBjb3VudCA9PT0gMSA/ICdvbmUnIDogJ290aGVyJyxcbiAgcmVzb2x2ZWRPcHRpb25zOiAoKSA9PiAoe1xuICAgIHBsdXJhbENhdGVnb3JpZXM6IFsnb25lJywgJ290aGVyJ11cbiAgfSlcbn07XG5jbGFzcyBQbHVyYWxSZXNvbHZlciB7XG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlVXRpbHMpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdGhpcy5sYW5ndWFnZVV0aWxzID0gbGFuZ3VhZ2VVdGlscztcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9nZ2VyID0gYmFzZUxvZ2dlci5jcmVhdGUoJ3BsdXJhbFJlc29sdmVyJyk7XG4gICAgdGhpcy5wbHVyYWxSdWxlc0NhY2hlID0ge307XG4gIH1cbiAgYWRkUnVsZShsbmcsIG9iaikge1xuICAgIHRoaXMucnVsZXNbbG5nXSA9IG9iajtcbiAgfVxuICBjbGVhckNhY2hlKCkge1xuICAgIHRoaXMucGx1cmFsUnVsZXNDYWNoZSA9IHt9O1xuICB9XG4gIGdldFJ1bGUoY29kZSkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICBjb25zdCBjbGVhbmVkQ29kZSA9IGdldENsZWFuZWRDb2RlKGNvZGUgPT09ICdkZXYnID8gJ2VuJyA6IGNvZGUpO1xuICAgIGNvbnN0IHR5cGUgPSBvcHRpb25zLm9yZGluYWwgPyAnb3JkaW5hbCcgOiAnY2FyZGluYWwnO1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY2xlYW5lZENvZGUsXG4gICAgICB0eXBlXG4gICAgfSk7XG4gICAgaWYgKGNhY2hlS2V5IGluIHRoaXMucGx1cmFsUnVsZXNDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGx1cmFsUnVsZXNDYWNoZVtjYWNoZUtleV07XG4gICAgfVxuICAgIGxldCBydWxlO1xuICAgIHRyeSB7XG4gICAgICBydWxlID0gbmV3IEludGwuUGx1cmFsUnVsZXMoY2xlYW5lZENvZGUsIHtcbiAgICAgICAgdHlwZVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoIUludGwpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ05vIEludGwgc3VwcG9ydCwgcGxlYXNlIHVzZSBhbiBJbnRsIHBvbHlmaWxsIScpO1xuICAgICAgICByZXR1cm4gZHVtbXlSdWxlO1xuICAgICAgfVxuICAgICAgaWYgKCFjb2RlLm1hdGNoKC8tfF8vKSkgcmV0dXJuIGR1bW15UnVsZTtcbiAgICAgIGNvbnN0IGxuZ1BhcnQgPSB0aGlzLmxhbmd1YWdlVXRpbHMuZ2V0TGFuZ3VhZ2VQYXJ0RnJvbUNvZGUoY29kZSk7XG4gICAgICBydWxlID0gdGhpcy5nZXRSdWxlKGxuZ1BhcnQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICB0aGlzLnBsdXJhbFJ1bGVzQ2FjaGVbY2FjaGVLZXldID0gcnVsZTtcbiAgICByZXR1cm4gcnVsZTtcbiAgfVxuICBuZWVkc1BsdXJhbChjb2RlKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIGxldCBydWxlID0gdGhpcy5nZXRSdWxlKGNvZGUsIG9wdGlvbnMpO1xuICAgIGlmICghcnVsZSkgcnVsZSA9IHRoaXMuZ2V0UnVsZSgnZGV2Jywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHJ1bGU/LnJlc29sdmVkT3B0aW9ucygpLnBsdXJhbENhdGVnb3JpZXMubGVuZ3RoID4gMTtcbiAgfVxuICBnZXRQbHVyYWxGb3Jtc09mS2V5KGNvZGUsIGtleSkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgICByZXR1cm4gdGhpcy5nZXRTdWZmaXhlcyhjb2RlLCBvcHRpb25zKS5tYXAoc3VmZml4ID0+IGAke2tleX0ke3N1ZmZpeH1gKTtcbiAgfVxuICBnZXRTdWZmaXhlcyhjb2RlKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIGxldCBydWxlID0gdGhpcy5nZXRSdWxlKGNvZGUsIG9wdGlvbnMpO1xuICAgIGlmICghcnVsZSkgcnVsZSA9IHRoaXMuZ2V0UnVsZSgnZGV2Jywgb3B0aW9ucyk7XG4gICAgaWYgKCFydWxlKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHJ1bGUucmVzb2x2ZWRPcHRpb25zKCkucGx1cmFsQ2F0ZWdvcmllcy5zb3J0KChwbHVyYWxDYXRlZ29yeTEsIHBsdXJhbENhdGVnb3J5MikgPT4gc3VmZml4ZXNPcmRlcltwbHVyYWxDYXRlZ29yeTFdIC0gc3VmZml4ZXNPcmRlcltwbHVyYWxDYXRlZ29yeTJdKS5tYXAocGx1cmFsQ2F0ZWdvcnkgPT4gYCR7dGhpcy5vcHRpb25zLnByZXBlbmR9JHtvcHRpb25zLm9yZGluYWwgPyBgb3JkaW5hbCR7dGhpcy5vcHRpb25zLnByZXBlbmR9YCA6ICcnfSR7cGx1cmFsQ2F0ZWdvcnl9YCk7XG4gIH1cbiAgZ2V0U3VmZml4KGNvZGUsIGNvdW50KSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgIGNvbnN0IHJ1bGUgPSB0aGlzLmdldFJ1bGUoY29kZSwgb3B0aW9ucyk7XG4gICAgaWYgKHJ1bGUpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm9wdGlvbnMucHJlcGVuZH0ke29wdGlvbnMub3JkaW5hbCA/IGBvcmRpbmFsJHt0aGlzLm9wdGlvbnMucHJlcGVuZH1gIDogJyd9JHtydWxlLnNlbGVjdChjb3VudCl9YDtcbiAgICB9XG4gICAgdGhpcy5sb2dnZXIud2Fybihgbm8gcGx1cmFsIHJ1bGUgZm91bmQgZm9yOiAke2NvZGV9YCk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3VmZml4KCdkZXYnLCBjb3VudCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuY29uc3QgZGVlcEZpbmRXaXRoRGVmYXVsdHMgPSBmdW5jdGlvbiAoZGF0YSwgZGVmYXVsdERhdGEsIGtleSkge1xuICBsZXQga2V5U2VwYXJhdG9yID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAnLic7XG4gIGxldCBpZ25vcmVKU09OU3RydWN0dXJlID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiB0cnVlO1xuICBsZXQgcGF0aCA9IGdldFBhdGhXaXRoRGVmYXVsdHMoZGF0YSwgZGVmYXVsdERhdGEsIGtleSk7XG4gIGlmICghcGF0aCAmJiBpZ25vcmVKU09OU3RydWN0dXJlICYmIGlzU3RyaW5nKGtleSkpIHtcbiAgICBwYXRoID0gZGVlcEZpbmQoZGF0YSwga2V5LCBrZXlTZXBhcmF0b3IpO1xuICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHBhdGggPSBkZWVwRmluZChkZWZhdWx0RGF0YSwga2V5LCBrZXlTZXBhcmF0b3IpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufTtcbmNvbnN0IHJlZ2V4U2FmZSA9IHZhbCA9PiB2YWwucmVwbGFjZSgvXFwkL2csICckJCQkJyk7XG5jbGFzcyBJbnRlcnBvbGF0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgnaW50ZXJwb2xhdG9yJyk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmZvcm1hdCA9IG9wdGlvbnM/LmludGVycG9sYXRpb24/LmZvcm1hdCB8fCAodmFsdWUgPT4gdmFsdWUpO1xuICAgIHRoaXMuaW5pdChvcHRpb25zKTtcbiAgfVxuICBpbml0KCkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICBpZiAoIW9wdGlvbnMuaW50ZXJwb2xhdGlvbikgb3B0aW9ucy5pbnRlcnBvbGF0aW9uID0ge1xuICAgICAgZXNjYXBlVmFsdWU6IHRydWVcbiAgICB9O1xuICAgIGNvbnN0IHtcbiAgICAgIGVzY2FwZTogZXNjYXBlJDEsXG4gICAgICBlc2NhcGVWYWx1ZSxcbiAgICAgIHVzZVJhd1ZhbHVlVG9Fc2NhcGUsXG4gICAgICBwcmVmaXgsXG4gICAgICBwcmVmaXhFc2NhcGVkLFxuICAgICAgc3VmZml4LFxuICAgICAgc3VmZml4RXNjYXBlZCxcbiAgICAgIGZvcm1hdFNlcGFyYXRvcixcbiAgICAgIHVuZXNjYXBlU3VmZml4LFxuICAgICAgdW5lc2NhcGVQcmVmaXgsXG4gICAgICBuZXN0aW5nUHJlZml4LFxuICAgICAgbmVzdGluZ1ByZWZpeEVzY2FwZWQsXG4gICAgICBuZXN0aW5nU3VmZml4LFxuICAgICAgbmVzdGluZ1N1ZmZpeEVzY2FwZWQsXG4gICAgICBuZXN0aW5nT3B0aW9uc1NlcGFyYXRvcixcbiAgICAgIG1heFJlcGxhY2VzLFxuICAgICAgYWx3YXlzRm9ybWF0XG4gICAgfSA9IG9wdGlvbnMuaW50ZXJwb2xhdGlvbjtcbiAgICB0aGlzLmVzY2FwZSA9IGVzY2FwZSQxICE9PSB1bmRlZmluZWQgPyBlc2NhcGUkMSA6IGVzY2FwZTtcbiAgICB0aGlzLmVzY2FwZVZhbHVlID0gZXNjYXBlVmFsdWUgIT09IHVuZGVmaW5lZCA/IGVzY2FwZVZhbHVlIDogdHJ1ZTtcbiAgICB0aGlzLnVzZVJhd1ZhbHVlVG9Fc2NhcGUgPSB1c2VSYXdWYWx1ZVRvRXNjYXBlICE9PSB1bmRlZmluZWQgPyB1c2VSYXdWYWx1ZVRvRXNjYXBlIDogZmFsc2U7XG4gICAgdGhpcy5wcmVmaXggPSBwcmVmaXggPyByZWdleEVzY2FwZShwcmVmaXgpIDogcHJlZml4RXNjYXBlZCB8fCAne3snO1xuICAgIHRoaXMuc3VmZml4ID0gc3VmZml4ID8gcmVnZXhFc2NhcGUoc3VmZml4KSA6IHN1ZmZpeEVzY2FwZWQgfHwgJ319JztcbiAgICB0aGlzLmZvcm1hdFNlcGFyYXRvciA9IGZvcm1hdFNlcGFyYXRvciB8fCAnLCc7XG4gICAgdGhpcy51bmVzY2FwZVByZWZpeCA9IHVuZXNjYXBlU3VmZml4ID8gJycgOiB1bmVzY2FwZVByZWZpeCB8fCAnLSc7XG4gICAgdGhpcy51bmVzY2FwZVN1ZmZpeCA9IHRoaXMudW5lc2NhcGVQcmVmaXggPyAnJyA6IHVuZXNjYXBlU3VmZml4IHx8ICcnO1xuICAgIHRoaXMubmVzdGluZ1ByZWZpeCA9IG5lc3RpbmdQcmVmaXggPyByZWdleEVzY2FwZShuZXN0aW5nUHJlZml4KSA6IG5lc3RpbmdQcmVmaXhFc2NhcGVkIHx8IHJlZ2V4RXNjYXBlKCckdCgnKTtcbiAgICB0aGlzLm5lc3RpbmdTdWZmaXggPSBuZXN0aW5nU3VmZml4ID8gcmVnZXhFc2NhcGUobmVzdGluZ1N1ZmZpeCkgOiBuZXN0aW5nU3VmZml4RXNjYXBlZCB8fCByZWdleEVzY2FwZSgnKScpO1xuICAgIHRoaXMubmVzdGluZ09wdGlvbnNTZXBhcmF0b3IgPSBuZXN0aW5nT3B0aW9uc1NlcGFyYXRvciB8fCAnLCc7XG4gICAgdGhpcy5tYXhSZXBsYWNlcyA9IG1heFJlcGxhY2VzIHx8IDEwMDA7XG4gICAgdGhpcy5hbHdheXNGb3JtYXQgPSBhbHdheXNGb3JtYXQgIT09IHVuZGVmaW5lZCA/IGFsd2F5c0Zvcm1hdCA6IGZhbHNlO1xuICAgIHRoaXMucmVzZXRSZWdFeHAoKTtcbiAgfVxuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zKSB0aGlzLmluaXQodGhpcy5vcHRpb25zKTtcbiAgfVxuICByZXNldFJlZ0V4cCgpIHtcbiAgICBjb25zdCBnZXRPclJlc2V0UmVnRXhwID0gKGV4aXN0aW5nUmVnRXhwLCBwYXR0ZXJuKSA9PiB7XG4gICAgICBpZiAoZXhpc3RpbmdSZWdFeHA/LnNvdXJjZSA9PT0gcGF0dGVybikge1xuICAgICAgICBleGlzdGluZ1JlZ0V4cC5sYXN0SW5kZXggPSAwO1xuICAgICAgICByZXR1cm4gZXhpc3RpbmdSZWdFeHA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpO1xuICAgIH07XG4gICAgdGhpcy5yZWdleHAgPSBnZXRPclJlc2V0UmVnRXhwKHRoaXMucmVnZXhwLCBgJHt0aGlzLnByZWZpeH0oLis/KSR7dGhpcy5zdWZmaXh9YCk7XG4gICAgdGhpcy5yZWdleHBVbmVzY2FwZSA9IGdldE9yUmVzZXRSZWdFeHAodGhpcy5yZWdleHBVbmVzY2FwZSwgYCR7dGhpcy5wcmVmaXh9JHt0aGlzLnVuZXNjYXBlUHJlZml4fSguKz8pJHt0aGlzLnVuZXNjYXBlU3VmZml4fSR7dGhpcy5zdWZmaXh9YCk7XG4gICAgdGhpcy5uZXN0aW5nUmVnZXhwID0gZ2V0T3JSZXNldFJlZ0V4cCh0aGlzLm5lc3RpbmdSZWdleHAsIGAke3RoaXMubmVzdGluZ1ByZWZpeH0oLis/KSR7dGhpcy5uZXN0aW5nU3VmZml4fWApO1xuICB9XG4gIGludGVycG9sYXRlKHN0ciwgZGF0YSwgbG5nLCBvcHRpb25zKSB7XG4gICAgbGV0IG1hdGNoO1xuICAgIGxldCB2YWx1ZTtcbiAgICBsZXQgcmVwbGFjZXM7XG4gICAgY29uc3QgZGVmYXVsdERhdGEgPSB0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLmludGVycG9sYXRpb24gJiYgdGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZGVmYXVsdFZhcmlhYmxlcyB8fCB7fTtcbiAgICBjb25zdCBoYW5kbGVGb3JtYXQgPSBrZXkgPT4ge1xuICAgICAgaWYgKGtleS5pbmRleE9mKHRoaXMuZm9ybWF0U2VwYXJhdG9yKSA8IDApIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGRlZXBGaW5kV2l0aERlZmF1bHRzKGRhdGEsIGRlZmF1bHREYXRhLCBrZXksIHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IsIHRoaXMub3B0aW9ucy5pZ25vcmVKU09OU3RydWN0dXJlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx3YXlzRm9ybWF0ID8gdGhpcy5mb3JtYXQocGF0aCwgdW5kZWZpbmVkLCBsbmcsIHtcbiAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgIC4uLmRhdGEsXG4gICAgICAgICAgaW50ZXJwb2xhdGlvbmtleToga2V5XG4gICAgICAgIH0pIDogcGF0aDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHAgPSBrZXkuc3BsaXQodGhpcy5mb3JtYXRTZXBhcmF0b3IpO1xuICAgICAgY29uc3QgayA9IHAuc2hpZnQoKS50cmltKCk7XG4gICAgICBjb25zdCBmID0gcC5qb2luKHRoaXMuZm9ybWF0U2VwYXJhdG9yKS50cmltKCk7XG4gICAgICByZXR1cm4gdGhpcy5mb3JtYXQoZGVlcEZpbmRXaXRoRGVmYXVsdHMoZGF0YSwgZGVmYXVsdERhdGEsIGssIHRoaXMub3B0aW9ucy5rZXlTZXBhcmF0b3IsIHRoaXMub3B0aW9ucy5pZ25vcmVKU09OU3RydWN0dXJlKSwgZiwgbG5nLCB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIC4uLmRhdGEsXG4gICAgICAgIGludGVycG9sYXRpb25rZXk6IGtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgdGhpcy5yZXNldFJlZ0V4cCgpO1xuICAgIGNvbnN0IG1pc3NpbmdJbnRlcnBvbGF0aW9uSGFuZGxlciA9IG9wdGlvbnM/Lm1pc3NpbmdJbnRlcnBvbGF0aW9uSGFuZGxlciB8fCB0aGlzLm9wdGlvbnMubWlzc2luZ0ludGVycG9sYXRpb25IYW5kbGVyO1xuICAgIGNvbnN0IHNraXBPblZhcmlhYmxlcyA9IG9wdGlvbnM/LmludGVycG9sYXRpb24/LnNraXBPblZhcmlhYmxlcyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5pbnRlcnBvbGF0aW9uLnNraXBPblZhcmlhYmxlcyA6IHRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uLnNraXBPblZhcmlhYmxlcztcbiAgICBjb25zdCB0b2RvcyA9IFt7XG4gICAgICByZWdleDogdGhpcy5yZWdleHBVbmVzY2FwZSxcbiAgICAgIHNhZmVWYWx1ZTogdmFsID0+IHJlZ2V4U2FmZSh2YWwpXG4gICAgfSwge1xuICAgICAgcmVnZXg6IHRoaXMucmVnZXhwLFxuICAgICAgc2FmZVZhbHVlOiB2YWwgPT4gdGhpcy5lc2NhcGVWYWx1ZSA/IHJlZ2V4U2FmZSh0aGlzLmVzY2FwZSh2YWwpKSA6IHJlZ2V4U2FmZSh2YWwpXG4gICAgfV07XG4gICAgdG9kb3MuZm9yRWFjaCh0b2RvID0+IHtcbiAgICAgIHJlcGxhY2VzID0gMDtcbiAgICAgIHdoaWxlIChtYXRjaCA9IHRvZG8ucmVnZXguZXhlYyhzdHIpKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZWRWYXIgPSBtYXRjaFsxXS50cmltKCk7XG4gICAgICAgIHZhbHVlID0gaGFuZGxlRm9ybWF0KG1hdGNoZWRWYXIpO1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbWlzc2luZ0ludGVycG9sYXRpb25IYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gbWlzc2luZ0ludGVycG9sYXRpb25IYW5kbGVyKHN0ciwgbWF0Y2gsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdmFsdWUgPSBpc1N0cmluZyh0ZW1wKSA/IHRlbXAgOiAnJztcbiAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIG1hdGNoZWRWYXIpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc2tpcE9uVmFyaWFibGVzKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG1hdGNoWzBdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYG1pc3NlZCB0byBwYXNzIGluIHZhcmlhYmxlICR7bWF0Y2hlZFZhcn0gZm9yIGludGVycG9sYXRpbmcgJHtzdHJ9YCk7XG4gICAgICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaXNTdHJpbmcodmFsdWUpICYmICF0aGlzLnVzZVJhd1ZhbHVlVG9Fc2NhcGUpIHtcbiAgICAgICAgICB2YWx1ZSA9IG1ha2VTdHJpbmcodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYWx1ZSA9IHRvZG8uc2FmZVZhbHVlKHZhbHVlKTtcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobWF0Y2hbMF0sIHNhZmVWYWx1ZSk7XG4gICAgICAgIGlmIChza2lwT25WYXJpYWJsZXMpIHtcbiAgICAgICAgICB0b2RvLnJlZ2V4Lmxhc3RJbmRleCArPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgdG9kby5yZWdleC5sYXN0SW5kZXggLT0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvZG8ucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlcysrO1xuICAgICAgICBpZiAocmVwbGFjZXMgPj0gdGhpcy5tYXhSZXBsYWNlcykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuICBuZXN0KHN0ciwgZmMpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG4gICAgbGV0IG1hdGNoO1xuICAgIGxldCB2YWx1ZTtcbiAgICBsZXQgY2xvbmVkT3B0aW9ucztcbiAgICBjb25zdCBoYW5kbGVIYXNPcHRpb25zID0gKGtleSwgaW5oZXJpdGVkT3B0aW9ucykgPT4ge1xuICAgICAgY29uc3Qgc2VwID0gdGhpcy5uZXN0aW5nT3B0aW9uc1NlcGFyYXRvcjtcbiAgICAgIGlmIChrZXkuaW5kZXhPZihzZXApIDwgMCkgcmV0dXJuIGtleTtcbiAgICAgIGNvbnN0IGMgPSBrZXkuc3BsaXQobmV3IFJlZ0V4cChgJHtzZXB9WyBdKntgKSk7XG4gICAgICBsZXQgb3B0aW9uc1N0cmluZyA9IGB7JHtjWzFdfWA7XG4gICAgICBrZXkgPSBjWzBdO1xuICAgICAgb3B0aW9uc1N0cmluZyA9IHRoaXMuaW50ZXJwb2xhdGUob3B0aW9uc1N0cmluZywgY2xvbmVkT3B0aW9ucyk7XG4gICAgICBjb25zdCBtYXRjaGVkU2luZ2xlUXVvdGVzID0gb3B0aW9uc1N0cmluZy5tYXRjaCgvJy9nKTtcbiAgICAgIGNvbnN0IG1hdGNoZWREb3VibGVRdW90ZXMgPSBvcHRpb25zU3RyaW5nLm1hdGNoKC9cIi9nKTtcbiAgICAgIGlmICgobWF0Y2hlZFNpbmdsZVF1b3Rlcz8ubGVuZ3RoID8/IDApICUgMiA9PT0gMCAmJiAhbWF0Y2hlZERvdWJsZVF1b3RlcyB8fCBtYXRjaGVkRG91YmxlUXVvdGVzLmxlbmd0aCAlIDIgIT09IDApIHtcbiAgICAgICAgb3B0aW9uc1N0cmluZyA9IG9wdGlvbnNTdHJpbmcucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNsb25lZE9wdGlvbnMgPSBKU09OLnBhcnNlKG9wdGlvbnNTdHJpbmcpO1xuICAgICAgICBpZiAoaW5oZXJpdGVkT3B0aW9ucykgY2xvbmVkT3B0aW9ucyA9IHtcbiAgICAgICAgICAuLi5pbmhlcml0ZWRPcHRpb25zLFxuICAgICAgICAgIC4uLmNsb25lZE9wdGlvbnNcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybihgZmFpbGVkIHBhcnNpbmcgb3B0aW9ucyBzdHJpbmcgaW4gbmVzdGluZyBmb3Iga2V5ICR7a2V5fWAsIGUpO1xuICAgICAgICByZXR1cm4gYCR7a2V5fSR7c2VwfSR7b3B0aW9uc1N0cmluZ31gO1xuICAgICAgfVxuICAgICAgaWYgKGNsb25lZE9wdGlvbnMuZGVmYXVsdFZhbHVlICYmIGNsb25lZE9wdGlvbnMuZGVmYXVsdFZhbHVlLmluZGV4T2YodGhpcy5wcmVmaXgpID4gLTEpIGRlbGV0ZSBjbG9uZWRPcHRpb25zLmRlZmF1bHRWYWx1ZTtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfTtcbiAgICB3aGlsZSAobWF0Y2ggPSB0aGlzLm5lc3RpbmdSZWdleHAuZXhlYyhzdHIpKSB7XG4gICAgICBsZXQgZm9ybWF0dGVycyA9IFtdO1xuICAgICAgY2xvbmVkT3B0aW9ucyA9IHtcbiAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgfTtcbiAgICAgIGNsb25lZE9wdGlvbnMgPSBjbG9uZWRPcHRpb25zLnJlcGxhY2UgJiYgIWlzU3RyaW5nKGNsb25lZE9wdGlvbnMucmVwbGFjZSkgPyBjbG9uZWRPcHRpb25zLnJlcGxhY2UgOiBjbG9uZWRPcHRpb25zO1xuICAgICAgY2xvbmVkT3B0aW9ucy5hcHBseVBvc3RQcm9jZXNzb3IgPSBmYWxzZTtcbiAgICAgIGRlbGV0ZSBjbG9uZWRPcHRpb25zLmRlZmF1bHRWYWx1ZTtcbiAgICAgIGxldCBkb1JlZHVjZSA9IGZhbHNlO1xuICAgICAgaWYgKG1hdGNoWzBdLmluZGV4T2YodGhpcy5mb3JtYXRTZXBhcmF0b3IpICE9PSAtMSAmJiAhL3suKn0vLnRlc3QobWF0Y2hbMV0pKSB7XG4gICAgICAgIGNvbnN0IHIgPSBtYXRjaFsxXS5zcGxpdCh0aGlzLmZvcm1hdFNlcGFyYXRvcikubWFwKGVsZW0gPT4gZWxlbS50cmltKCkpO1xuICAgICAgICBtYXRjaFsxXSA9IHIuc2hpZnQoKTtcbiAgICAgICAgZm9ybWF0dGVycyA9IHI7XG4gICAgICAgIGRvUmVkdWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gZmMoaGFuZGxlSGFzT3B0aW9ucy5jYWxsKHRoaXMsIG1hdGNoWzFdLnRyaW0oKSwgY2xvbmVkT3B0aW9ucyksIGNsb25lZE9wdGlvbnMpO1xuICAgICAgaWYgKHZhbHVlICYmIG1hdGNoWzBdID09PSBzdHIgJiYgIWlzU3RyaW5nKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgICAgaWYgKCFpc1N0cmluZyh2YWx1ZSkpIHZhbHVlID0gbWFrZVN0cmluZyh2YWx1ZSk7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYG1pc3NlZCB0byByZXNvbHZlICR7bWF0Y2hbMV19IGZvciBuZXN0aW5nICR7c3RyfWApO1xuICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgfVxuICAgICAgaWYgKGRvUmVkdWNlKSB7XG4gICAgICAgIHZhbHVlID0gZm9ybWF0dGVycy5yZWR1Y2UoKHYsIGYpID0+IHRoaXMuZm9ybWF0KHYsIGYsIG9wdGlvbnMubG5nLCB7XG4gICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICBpbnRlcnBvbGF0aW9ua2V5OiBtYXRjaFsxXS50cmltKClcbiAgICAgICAgfSksIHZhbHVlLnRyaW0oKSk7XG4gICAgICB9XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZShtYXRjaFswXSwgdmFsdWUpO1xuICAgICAgdGhpcy5yZWdleHAubGFzdEluZGV4ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5jb25zdCBwYXJzZUZvcm1hdFN0ciA9IGZvcm1hdFN0ciA9PiB7XG4gIGxldCBmb3JtYXROYW1lID0gZm9ybWF0U3RyLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICBjb25zdCBmb3JtYXRPcHRpb25zID0ge307XG4gIGlmIChmb3JtYXRTdHIuaW5kZXhPZignKCcpID4gLTEpIHtcbiAgICBjb25zdCBwID0gZm9ybWF0U3RyLnNwbGl0KCcoJyk7XG4gICAgZm9ybWF0TmFtZSA9IHBbMF0udG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgY29uc3Qgb3B0U3RyID0gcFsxXS5zdWJzdHJpbmcoMCwgcFsxXS5sZW5ndGggLSAxKTtcbiAgICBpZiAoZm9ybWF0TmFtZSA9PT0gJ2N1cnJlbmN5JyAmJiBvcHRTdHIuaW5kZXhPZignOicpIDwgMCkge1xuICAgICAgaWYgKCFmb3JtYXRPcHRpb25zLmN1cnJlbmN5KSBmb3JtYXRPcHRpb25zLmN1cnJlbmN5ID0gb3B0U3RyLnRyaW0oKTtcbiAgICB9IGVsc2UgaWYgKGZvcm1hdE5hbWUgPT09ICdyZWxhdGl2ZXRpbWUnICYmIG9wdFN0ci5pbmRleE9mKCc6JykgPCAwKSB7XG4gICAgICBpZiAoIWZvcm1hdE9wdGlvbnMucmFuZ2UpIGZvcm1hdE9wdGlvbnMucmFuZ2UgPSBvcHRTdHIudHJpbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBvcHRzID0gb3B0U3RyLnNwbGl0KCc7Jyk7XG4gICAgICBvcHRzLmZvckVhY2gob3B0ID0+IHtcbiAgICAgICAgaWYgKG9wdCkge1xuICAgICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gb3B0LnNwbGl0KCc6Jyk7XG4gICAgICAgICAgY29uc3QgdmFsID0gcmVzdC5qb2luKCc6JykudHJpbSgpLnJlcGxhY2UoL14nK3wnKyQvZywgJycpO1xuICAgICAgICAgIGNvbnN0IHRyaW1tZWRLZXkgPSBrZXkudHJpbSgpO1xuICAgICAgICAgIGlmICghZm9ybWF0T3B0aW9uc1t0cmltbWVkS2V5XSkgZm9ybWF0T3B0aW9uc1t0cmltbWVkS2V5XSA9IHZhbDtcbiAgICAgICAgICBpZiAodmFsID09PSAnZmFsc2UnKSBmb3JtYXRPcHRpb25zW3RyaW1tZWRLZXldID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHZhbCA9PT0gJ3RydWUnKSBmb3JtYXRPcHRpb25zW3RyaW1tZWRLZXldID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIWlzTmFOKHZhbCkpIGZvcm1hdE9wdGlvbnNbdHJpbW1lZEtleV0gPSBwYXJzZUludCh2YWwsIDEwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgZm9ybWF0TmFtZSxcbiAgICBmb3JtYXRPcHRpb25zXG4gIH07XG59O1xuY29uc3QgY3JlYXRlQ2FjaGVkRm9ybWF0dGVyID0gZm4gPT4ge1xuICBjb25zdCBjYWNoZSA9IHt9O1xuICByZXR1cm4gKHZhbCwgbG5nLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IG9wdEZvckNhY2hlID0gb3B0aW9ucztcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmludGVycG9sYXRpb25rZXkgJiYgb3B0aW9ucy5mb3JtYXRQYXJhbXMgJiYgb3B0aW9ucy5mb3JtYXRQYXJhbXNbb3B0aW9ucy5pbnRlcnBvbGF0aW9ua2V5XSAmJiBvcHRpb25zW29wdGlvbnMuaW50ZXJwb2xhdGlvbmtleV0pIHtcbiAgICAgIG9wdEZvckNhY2hlID0ge1xuICAgICAgICAuLi5vcHRGb3JDYWNoZSxcbiAgICAgICAgW29wdGlvbnMuaW50ZXJwb2xhdGlvbmtleV06IHVuZGVmaW5lZFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gbG5nICsgSlNPTi5zdHJpbmdpZnkob3B0Rm9yQ2FjaGUpO1xuICAgIGxldCBmb3JtYXR0ZXIgPSBjYWNoZVtrZXldO1xuICAgIGlmICghZm9ybWF0dGVyKSB7XG4gICAgICBmb3JtYXR0ZXIgPSBmbihnZXRDbGVhbmVkQ29kZShsbmcpLCBvcHRpb25zKTtcbiAgICAgIGNhY2hlW2tleV0gPSBmb3JtYXR0ZXI7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZXIodmFsKTtcbiAgfTtcbn07XG5jbGFzcyBGb3JtYXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgnZm9ybWF0dGVyJyk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmZvcm1hdHMgPSB7XG4gICAgICBudW1iZXI6IGNyZWF0ZUNhY2hlZEZvcm1hdHRlcigobG5nLCBvcHQpID0+IHtcbiAgICAgICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KGxuZywge1xuICAgICAgICAgIC4uLm9wdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbCA9PiBmb3JtYXR0ZXIuZm9ybWF0KHZhbCk7XG4gICAgICB9KSxcbiAgICAgIGN1cnJlbmN5OiBjcmVhdGVDYWNoZWRGb3JtYXR0ZXIoKGxuZywgb3B0KSA9PiB7XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBJbnRsLk51bWJlckZvcm1hdChsbmcsIHtcbiAgICAgICAgICAuLi5vcHQsXG4gICAgICAgICAgc3R5bGU6ICdjdXJyZW5jeSdcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWwgPT4gZm9ybWF0dGVyLmZvcm1hdCh2YWwpO1xuICAgICAgfSksXG4gICAgICBkYXRldGltZTogY3JlYXRlQ2FjaGVkRm9ybWF0dGVyKChsbmcsIG9wdCkgPT4ge1xuICAgICAgICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsbmcsIHtcbiAgICAgICAgICAuLi5vcHRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWwgPT4gZm9ybWF0dGVyLmZvcm1hdCh2YWwpO1xuICAgICAgfSksXG4gICAgICByZWxhdGl2ZXRpbWU6IGNyZWF0ZUNhY2hlZEZvcm1hdHRlcigobG5nLCBvcHQpID0+IHtcbiAgICAgICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuUmVsYXRpdmVUaW1lRm9ybWF0KGxuZywge1xuICAgICAgICAgIC4uLm9wdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbCA9PiBmb3JtYXR0ZXIuZm9ybWF0KHZhbCwgb3B0LnJhbmdlIHx8ICdkYXknKTtcbiAgICAgIH0pLFxuICAgICAgbGlzdDogY3JlYXRlQ2FjaGVkRm9ybWF0dGVyKChsbmcsIG9wdCkgPT4ge1xuICAgICAgICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5MaXN0Rm9ybWF0KGxuZywge1xuICAgICAgICAgIC4uLm9wdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbCA9PiBmb3JtYXR0ZXIuZm9ybWF0KHZhbCk7XG4gICAgICB9KVxuICAgIH07XG4gICAgdGhpcy5pbml0KG9wdGlvbnMpO1xuICB9XG4gIGluaXQoc2VydmljZXMpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge1xuICAgICAgaW50ZXJwb2xhdGlvbjoge31cbiAgICB9O1xuICAgIHRoaXMuZm9ybWF0U2VwYXJhdG9yID0gb3B0aW9ucy5pbnRlcnBvbGF0aW9uLmZvcm1hdFNlcGFyYXRvciB8fCAnLCc7XG4gIH1cbiAgYWRkKG5hbWUsIGZjKSB7XG4gICAgdGhpcy5mb3JtYXRzW25hbWUudG9Mb3dlckNhc2UoKS50cmltKCldID0gZmM7XG4gIH1cbiAgYWRkQ2FjaGVkKG5hbWUsIGZjKSB7XG4gICAgdGhpcy5mb3JtYXRzW25hbWUudG9Mb3dlckNhc2UoKS50cmltKCldID0gY3JlYXRlQ2FjaGVkRm9ybWF0dGVyKGZjKTtcbiAgfVxuICBmb3JtYXQodmFsdWUsIGZvcm1hdCwgbG5nKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IHt9O1xuICAgIGNvbnN0IGZvcm1hdHMgPSBmb3JtYXQuc3BsaXQodGhpcy5mb3JtYXRTZXBhcmF0b3IpO1xuICAgIGlmIChmb3JtYXRzLmxlbmd0aCA+IDEgJiYgZm9ybWF0c1swXS5pbmRleE9mKCcoJykgPiAxICYmIGZvcm1hdHNbMF0uaW5kZXhPZignKScpIDwgMCAmJiBmb3JtYXRzLmZpbmQoZiA9PiBmLmluZGV4T2YoJyknKSA+IC0xKSkge1xuICAgICAgY29uc3QgbGFzdEluZGV4ID0gZm9ybWF0cy5maW5kSW5kZXgoZiA9PiBmLmluZGV4T2YoJyknKSA+IC0xKTtcbiAgICAgIGZvcm1hdHNbMF0gPSBbZm9ybWF0c1swXSwgLi4uZm9ybWF0cy5zcGxpY2UoMSwgbGFzdEluZGV4KV0uam9pbih0aGlzLmZvcm1hdFNlcGFyYXRvcik7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGZvcm1hdHMucmVkdWNlKChtZW0sIGYpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZm9ybWF0TmFtZSxcbiAgICAgICAgZm9ybWF0T3B0aW9uc1xuICAgICAgfSA9IHBhcnNlRm9ybWF0U3RyKGYpO1xuICAgICAgaWYgKHRoaXMuZm9ybWF0c1tmb3JtYXROYW1lXSkge1xuICAgICAgICBsZXQgZm9ybWF0dGVkID0gbWVtO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHZhbE9wdGlvbnMgPSBvcHRpb25zPy5mb3JtYXRQYXJhbXM/LltvcHRpb25zLmludGVycG9sYXRpb25rZXldIHx8IHt9O1xuICAgICAgICAgIGNvbnN0IGwgPSB2YWxPcHRpb25zLmxvY2FsZSB8fCB2YWxPcHRpb25zLmxuZyB8fCBvcHRpb25zLmxvY2FsZSB8fCBvcHRpb25zLmxuZyB8fCBsbmc7XG4gICAgICAgICAgZm9ybWF0dGVkID0gdGhpcy5mb3JtYXRzW2Zvcm1hdE5hbWVdKG1lbSwgbCwge1xuICAgICAgICAgICAgLi4uZm9ybWF0T3B0aW9ucyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAuLi52YWxPcHRpb25zXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybihlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oYHRoZXJlIHdhcyBubyBmb3JtYXQgZnVuY3Rpb24gZm9yICR7Zm9ybWF0TmFtZX1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW07XG4gICAgfSwgdmFsdWUpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuY29uc3QgcmVtb3ZlUGVuZGluZyA9IChxLCBuYW1lKSA9PiB7XG4gIGlmIChxLnBlbmRpbmdbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgIGRlbGV0ZSBxLnBlbmRpbmdbbmFtZV07XG4gICAgcS5wZW5kaW5nQ291bnQtLTtcbiAgfVxufTtcbmNsYXNzIENvbm5lY3RvciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKGJhY2tlbmQsIHN0b3JlLCBzZXJ2aWNlcykge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiB7fTtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYmFja2VuZCA9IGJhY2tlbmQ7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuc2VydmljZXMgPSBzZXJ2aWNlcztcbiAgICB0aGlzLmxhbmd1YWdlVXRpbHMgPSBzZXJ2aWNlcy5sYW5ndWFnZVV0aWxzO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb2dnZXIgPSBiYXNlTG9nZ2VyLmNyZWF0ZSgnYmFja2VuZENvbm5lY3RvcicpO1xuICAgIHRoaXMud2FpdGluZ1JlYWRzID0gW107XG4gICAgdGhpcy5tYXhQYXJhbGxlbFJlYWRzID0gb3B0aW9ucy5tYXhQYXJhbGxlbFJlYWRzIHx8IDEwO1xuICAgIHRoaXMucmVhZGluZ0NhbGxzID0gMDtcbiAgICB0aGlzLm1heFJldHJpZXMgPSBvcHRpb25zLm1heFJldHJpZXMgPj0gMCA/IG9wdGlvbnMubWF4UmV0cmllcyA6IDU7XG4gICAgdGhpcy5yZXRyeVRpbWVvdXQgPSBvcHRpb25zLnJldHJ5VGltZW91dCA+PSAxID8gb3B0aW9ucy5yZXRyeVRpbWVvdXQgOiAzNTA7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmJhY2tlbmQ/LmluaXQ/LihzZXJ2aWNlcywgb3B0aW9ucy5iYWNrZW5kLCBvcHRpb25zKTtcbiAgfVxuICBxdWV1ZUxvYWQobGFuZ3VhZ2VzLCBuYW1lc3BhY2VzLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHRvTG9hZCA9IHt9O1xuICAgIGNvbnN0IHBlbmRpbmcgPSB7fTtcbiAgICBjb25zdCB0b0xvYWRMYW5ndWFnZXMgPSB7fTtcbiAgICBjb25zdCB0b0xvYWROYW1lc3BhY2VzID0ge307XG4gICAgbGFuZ3VhZ2VzLmZvckVhY2gobG5nID0+IHtcbiAgICAgIGxldCBoYXNBbGxOYW1lc3BhY2VzID0gdHJ1ZTtcbiAgICAgIG5hbWVzcGFjZXMuZm9yRWFjaChucyA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtsbmd9fCR7bnN9YDtcbiAgICAgICAgaWYgKCFvcHRpb25zLnJlbG9hZCAmJiB0aGlzLnN0b3JlLmhhc1Jlc291cmNlQnVuZGxlKGxuZywgbnMpKSB7XG4gICAgICAgICAgdGhpcy5zdGF0ZVtuYW1lXSA9IDI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZVtuYW1lXSA8IDApIDsgZWxzZSBpZiAodGhpcy5zdGF0ZVtuYW1lXSA9PT0gMSkge1xuICAgICAgICAgIGlmIChwZW5kaW5nW25hbWVdID09PSB1bmRlZmluZWQpIHBlbmRpbmdbbmFtZV0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc3RhdGVbbmFtZV0gPSAxO1xuICAgICAgICAgIGhhc0FsbE5hbWVzcGFjZXMgPSBmYWxzZTtcbiAgICAgICAgICBpZiAocGVuZGluZ1tuYW1lXSA9PT0gdW5kZWZpbmVkKSBwZW5kaW5nW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodG9Mb2FkW25hbWVdID09PSB1bmRlZmluZWQpIHRvTG9hZFtuYW1lXSA9IHRydWU7XG4gICAgICAgICAgaWYgKHRvTG9hZE5hbWVzcGFjZXNbbnNdID09PSB1bmRlZmluZWQpIHRvTG9hZE5hbWVzcGFjZXNbbnNdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWhhc0FsbE5hbWVzcGFjZXMpIHRvTG9hZExhbmd1YWdlc1tsbmddID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBpZiAoT2JqZWN0LmtleXModG9Mb2FkKS5sZW5ndGggfHwgT2JqZWN0LmtleXMocGVuZGluZykubGVuZ3RoKSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goe1xuICAgICAgICBwZW5kaW5nLFxuICAgICAgICBwZW5kaW5nQ291bnQ6IE9iamVjdC5rZXlzKHBlbmRpbmcpLmxlbmd0aCxcbiAgICAgICAgbG9hZGVkOiB7fSxcbiAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgY2FsbGJhY2tcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdG9Mb2FkOiBPYmplY3Qua2V5cyh0b0xvYWQpLFxuICAgICAgcGVuZGluZzogT2JqZWN0LmtleXMocGVuZGluZyksXG4gICAgICB0b0xvYWRMYW5ndWFnZXM6IE9iamVjdC5rZXlzKHRvTG9hZExhbmd1YWdlcyksXG4gICAgICB0b0xvYWROYW1lc3BhY2VzOiBPYmplY3Qua2V5cyh0b0xvYWROYW1lc3BhY2VzKVxuICAgIH07XG4gIH1cbiAgbG9hZGVkKG5hbWUsIGVyciwgZGF0YSkge1xuICAgIGNvbnN0IHMgPSBuYW1lLnNwbGl0KCd8Jyk7XG4gICAgY29uc3QgbG5nID0gc1swXTtcbiAgICBjb25zdCBucyA9IHNbMV07XG4gICAgaWYgKGVycikgdGhpcy5lbWl0KCdmYWlsZWRMb2FkaW5nJywgbG5nLCBucywgZXJyKTtcbiAgICBpZiAoIWVyciAmJiBkYXRhKSB7XG4gICAgICB0aGlzLnN0b3JlLmFkZFJlc291cmNlQnVuZGxlKGxuZywgbnMsIGRhdGEsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7XG4gICAgICAgIHNraXBDb3B5OiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZVtuYW1lXSA9IGVyciA/IC0xIDogMjtcbiAgICBpZiAoZXJyICYmIGRhdGEpIHRoaXMuc3RhdGVbbmFtZV0gPSAwO1xuICAgIGNvbnN0IGxvYWRlZCA9IHt9O1xuICAgIHRoaXMucXVldWUuZm9yRWFjaChxID0+IHtcbiAgICAgIHB1c2hQYXRoKHEubG9hZGVkLCBbbG5nXSwgbnMpO1xuICAgICAgcmVtb3ZlUGVuZGluZyhxLCBuYW1lKTtcbiAgICAgIGlmIChlcnIpIHEuZXJyb3JzLnB1c2goZXJyKTtcbiAgICAgIGlmIChxLnBlbmRpbmdDb3VudCA9PT0gMCAmJiAhcS5kb25lKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHEubG9hZGVkKS5mb3JFYWNoKGwgPT4ge1xuICAgICAgICAgIGlmICghbG9hZGVkW2xdKSBsb2FkZWRbbF0gPSB7fTtcbiAgICAgICAgICBjb25zdCBsb2FkZWRLZXlzID0gcS5sb2FkZWRbbF07XG4gICAgICAgICAgaWYgKGxvYWRlZEtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsb2FkZWRLZXlzLmZvckVhY2gobiA9PiB7XG4gICAgICAgICAgICAgIGlmIChsb2FkZWRbbF1bbl0gPT09IHVuZGVmaW5lZCkgbG9hZGVkW2xdW25dID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHEuZG9uZSA9IHRydWU7XG4gICAgICAgIGlmIChxLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBxLmNhbGxiYWNrKHEuZXJyb3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxLmNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmVtaXQoJ2xvYWRlZCcsIGxvYWRlZCk7XG4gICAgdGhpcy5xdWV1ZSA9IHRoaXMucXVldWUuZmlsdGVyKHEgPT4gIXEuZG9uZSk7XG4gIH1cbiAgcmVhZChsbmcsIG5zLCBmY05hbWUpIHtcbiAgICBsZXQgdHJpZWQgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDA7XG4gICAgbGV0IHdhaXQgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IHRoaXMucmV0cnlUaW1lb3V0O1xuICAgIGxldCBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ID8gYXJndW1lbnRzWzVdIDogdW5kZWZpbmVkO1xuICAgIGlmICghbG5nLmxlbmd0aCkgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHt9KTtcbiAgICBpZiAodGhpcy5yZWFkaW5nQ2FsbHMgPj0gdGhpcy5tYXhQYXJhbGxlbFJlYWRzKSB7XG4gICAgICB0aGlzLndhaXRpbmdSZWFkcy5wdXNoKHtcbiAgICAgICAgbG5nLFxuICAgICAgICBucyxcbiAgICAgICAgZmNOYW1lLFxuICAgICAgICB0cmllZCxcbiAgICAgICAgd2FpdCxcbiAgICAgICAgY2FsbGJhY2tcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlYWRpbmdDYWxscysrO1xuICAgIGNvbnN0IHJlc29sdmVyID0gKGVyciwgZGF0YSkgPT4ge1xuICAgICAgdGhpcy5yZWFkaW5nQ2FsbHMtLTtcbiAgICAgIGlmICh0aGlzLndhaXRpbmdSZWFkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLndhaXRpbmdSZWFkcy5zaGlmdCgpO1xuICAgICAgICB0aGlzLnJlYWQobmV4dC5sbmcsIG5leHQubnMsIG5leHQuZmNOYW1lLCBuZXh0LnRyaWVkLCBuZXh0LndhaXQsIG5leHQuY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgaWYgKGVyciAmJiBkYXRhICYmIHRyaWVkIDwgdGhpcy5tYXhSZXRyaWVzKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMucmVhZC5jYWxsKHRoaXMsIGxuZywgbnMsIGZjTmFtZSwgdHJpZWQgKyAxLCB3YWl0ICogMiwgY2FsbGJhY2spO1xuICAgICAgICB9LCB3YWl0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICB9O1xuICAgIGNvbnN0IGZjID0gdGhpcy5iYWNrZW5kW2ZjTmFtZV0uYmluZCh0aGlzLmJhY2tlbmQpO1xuICAgIGlmIChmYy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHIgPSBmYyhsbmcsIG5zKTtcbiAgICAgICAgaWYgKHIgJiYgdHlwZW9mIHIudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHIudGhlbihkYXRhID0+IHJlc29sdmVyKG51bGwsIGRhdGEpKS5jYXRjaChyZXNvbHZlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZXIobnVsbCwgcik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXNvbHZlcihlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gZmMobG5nLCBucywgcmVzb2x2ZXIpO1xuICB9XG4gIHByZXBhcmVMb2FkaW5nKGxhbmd1YWdlcywgbmFtZXNwYWNlcykge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgICBsZXQgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1szXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAoIXRoaXMuYmFja2VuZCkge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignTm8gYmFja2VuZCB3YXMgYWRkZWQgdmlhIGkxOG5leHQudXNlLiBXaWxsIG5vdCBsb2FkIHJlc291cmNlcy4nKTtcbiAgICAgIHJldHVybiBjYWxsYmFjayAmJiBjYWxsYmFjaygpO1xuICAgIH1cbiAgICBpZiAoaXNTdHJpbmcobGFuZ3VhZ2VzKSkgbGFuZ3VhZ2VzID0gdGhpcy5sYW5ndWFnZVV0aWxzLnRvUmVzb2x2ZUhpZXJhcmNoeShsYW5ndWFnZXMpO1xuICAgIGlmIChpc1N0cmluZyhuYW1lc3BhY2VzKSkgbmFtZXNwYWNlcyA9IFtuYW1lc3BhY2VzXTtcbiAgICBjb25zdCB0b0xvYWQgPSB0aGlzLnF1ZXVlTG9hZChsYW5ndWFnZXMsIG5hbWVzcGFjZXMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICBpZiAoIXRvTG9hZC50b0xvYWQubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRvTG9hZC5wZW5kaW5nLmxlbmd0aCkgY2FsbGJhY2soKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0b0xvYWQudG9Mb2FkLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICB0aGlzLmxvYWRPbmUobmFtZSk7XG4gICAgfSk7XG4gIH1cbiAgbG9hZChsYW5ndWFnZXMsIG5hbWVzcGFjZXMsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5wcmVwYXJlTG9hZGluZyhsYW5ndWFnZXMsIG5hbWVzcGFjZXMsIHt9LCBjYWxsYmFjayk7XG4gIH1cbiAgcmVsb2FkKGxhbmd1YWdlcywgbmFtZXNwYWNlcywgY2FsbGJhY2spIHtcbiAgICB0aGlzLnByZXBhcmVMb2FkaW5nKGxhbmd1YWdlcywgbmFtZXNwYWNlcywge1xuICAgICAgcmVsb2FkOiB0cnVlXG4gICAgfSwgY2FsbGJhY2spO1xuICB9XG4gIGxvYWRPbmUobmFtZSkge1xuICAgIGxldCBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICcnO1xuICAgIGNvbnN0IHMgPSBuYW1lLnNwbGl0KCd8Jyk7XG4gICAgY29uc3QgbG5nID0gc1swXTtcbiAgICBjb25zdCBucyA9IHNbMV07XG4gICAgdGhpcy5yZWFkKGxuZywgbnMsICdyZWFkJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgIGlmIChlcnIpIHRoaXMubG9nZ2VyLndhcm4oYCR7cHJlZml4fWxvYWRpbmcgbmFtZXNwYWNlICR7bnN9IGZvciBsYW5ndWFnZSAke2xuZ30gZmFpbGVkYCwgZXJyKTtcbiAgICAgIGlmICghZXJyICYmIGRhdGEpIHRoaXMubG9nZ2VyLmxvZyhgJHtwcmVmaXh9bG9hZGVkIG5hbWVzcGFjZSAke25zfSBmb3IgbGFuZ3VhZ2UgJHtsbmd9YCwgZGF0YSk7XG4gICAgICB0aGlzLmxvYWRlZChuYW1lLCBlcnIsIGRhdGEpO1xuICAgIH0pO1xuICB9XG4gIHNhdmVNaXNzaW5nKGxhbmd1YWdlcywgbmFtZXNwYWNlLCBrZXksIGZhbGxiYWNrVmFsdWUsIGlzVXBkYXRlKSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gNSAmJiBhcmd1bWVudHNbNV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s1XSA6IHt9O1xuICAgIGxldCBjbGIgPSBhcmd1bWVudHMubGVuZ3RoID4gNiAmJiBhcmd1bWVudHNbNl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s2XSA6ICgpID0+IHt9O1xuICAgIGlmICh0aGlzLnNlcnZpY2VzPy51dGlscz8uaGFzTG9hZGVkTmFtZXNwYWNlICYmICF0aGlzLnNlcnZpY2VzPy51dGlscz8uaGFzTG9hZGVkTmFtZXNwYWNlKG5hbWVzcGFjZSkpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oYGRpZCBub3Qgc2F2ZSBrZXkgXCIke2tleX1cIiBhcyB0aGUgbmFtZXNwYWNlIFwiJHtuYW1lc3BhY2V9XCIgd2FzIG5vdCB5ZXQgbG9hZGVkYCwgJ1RoaXMgbWVhbnMgc29tZXRoaW5nIElTIFdST05HIGluIHlvdXIgc2V0dXAuIFlvdSBhY2Nlc3MgdGhlIHQgZnVuY3Rpb24gYmVmb3JlIGkxOG5leHQuaW5pdCAvIGkxOG5leHQubG9hZE5hbWVzcGFjZSAvIGkxOG5leHQuY2hhbmdlTGFuZ3VhZ2Ugd2FzIGRvbmUuIFdhaXQgZm9yIHRoZSBjYWxsYmFjayBvciBQcm9taXNlIHRvIHJlc29sdmUgYmVmb3JlIGFjY2Vzc2luZyBpdCEhIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsIHx8IGtleSA9PT0gJycpIHJldHVybjtcbiAgICBpZiAodGhpcy5iYWNrZW5kPy5jcmVhdGUpIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIGlzVXBkYXRlXG4gICAgICB9O1xuICAgICAgY29uc3QgZmMgPSB0aGlzLmJhY2tlbmQuY3JlYXRlLmJpbmQodGhpcy5iYWNrZW5kKTtcbiAgICAgIGlmIChmYy5sZW5ndGggPCA2KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHI7XG4gICAgICAgICAgaWYgKGZjLmxlbmd0aCA9PT0gNSkge1xuICAgICAgICAgICAgciA9IGZjKGxhbmd1YWdlcywgbmFtZXNwYWNlLCBrZXksIGZhbGxiYWNrVmFsdWUsIG9wdHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByID0gZmMobGFuZ3VhZ2VzLCBuYW1lc3BhY2UsIGtleSwgZmFsbGJhY2tWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyICYmIHR5cGVvZiByLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHIudGhlbihkYXRhID0+IGNsYihudWxsLCBkYXRhKSkuY2F0Y2goY2xiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xiKG51bGwsIHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY2xiKGVycik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZjKGxhbmd1YWdlcywgbmFtZXNwYWNlLCBrZXksIGZhbGxiYWNrVmFsdWUsIGNsYiwgb3B0cyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbGFuZ3VhZ2VzIHx8ICFsYW5ndWFnZXNbMF0pIHJldHVybjtcbiAgICB0aGlzLnN0b3JlLmFkZFJlc291cmNlKGxhbmd1YWdlc1swXSwgbmFtZXNwYWNlLCBrZXksIGZhbGxiYWNrVmFsdWUpO1xuICB9XG59XG5cbmNvbnN0IGdldCA9ICgpID0+ICh7XG4gIGRlYnVnOiBmYWxzZSxcbiAgaW5pdEFzeW5jOiB0cnVlLFxuICBuczogWyd0cmFuc2xhdGlvbiddLFxuICBkZWZhdWx0TlM6IFsndHJhbnNsYXRpb24nXSxcbiAgZmFsbGJhY2tMbmc6IFsnZGV2J10sXG4gIGZhbGxiYWNrTlM6IGZhbHNlLFxuICBzdXBwb3J0ZWRMbmdzOiBmYWxzZSxcbiAgbm9uRXhwbGljaXRTdXBwb3J0ZWRMbmdzOiBmYWxzZSxcbiAgbG9hZDogJ2FsbCcsXG4gIHByZWxvYWQ6IGZhbHNlLFxuICBzaW1wbGlmeVBsdXJhbFN1ZmZpeDogdHJ1ZSxcbiAga2V5U2VwYXJhdG9yOiAnLicsXG4gIG5zU2VwYXJhdG9yOiAnOicsXG4gIHBsdXJhbFNlcGFyYXRvcjogJ18nLFxuICBjb250ZXh0U2VwYXJhdG9yOiAnXycsXG4gIHBhcnRpYWxCdW5kbGVkTGFuZ3VhZ2VzOiBmYWxzZSxcbiAgc2F2ZU1pc3Npbmc6IGZhbHNlLFxuICB1cGRhdGVNaXNzaW5nOiBmYWxzZSxcbiAgc2F2ZU1pc3NpbmdUbzogJ2ZhbGxiYWNrJyxcbiAgc2F2ZU1pc3NpbmdQbHVyYWxzOiB0cnVlLFxuICBtaXNzaW5nS2V5SGFuZGxlcjogZmFsc2UsXG4gIG1pc3NpbmdJbnRlcnBvbGF0aW9uSGFuZGxlcjogZmFsc2UsXG4gIHBvc3RQcm9jZXNzOiBmYWxzZSxcbiAgcG9zdFByb2Nlc3NQYXNzUmVzb2x2ZWQ6IGZhbHNlLFxuICByZXR1cm5OdWxsOiBmYWxzZSxcbiAgcmV0dXJuRW1wdHlTdHJpbmc6IHRydWUsXG4gIHJldHVybk9iamVjdHM6IGZhbHNlLFxuICBqb2luQXJyYXlzOiBmYWxzZSxcbiAgcmV0dXJuZWRPYmplY3RIYW5kbGVyOiBmYWxzZSxcbiAgcGFyc2VNaXNzaW5nS2V5SGFuZGxlcjogZmFsc2UsXG4gIGFwcGVuZE5hbWVzcGFjZVRvTWlzc2luZ0tleTogZmFsc2UsXG4gIGFwcGVuZE5hbWVzcGFjZVRvQ0lNb2RlOiBmYWxzZSxcbiAgb3ZlcmxvYWRUcmFuc2xhdGlvbk9wdGlvbkhhbmRsZXI6IGFyZ3MgPT4ge1xuICAgIGxldCByZXQgPSB7fTtcbiAgICBpZiAodHlwZW9mIGFyZ3NbMV0gPT09ICdvYmplY3QnKSByZXQgPSBhcmdzWzFdO1xuICAgIGlmIChpc1N0cmluZyhhcmdzWzFdKSkgcmV0LmRlZmF1bHRWYWx1ZSA9IGFyZ3NbMV07XG4gICAgaWYgKGlzU3RyaW5nKGFyZ3NbMl0pKSByZXQudERlc2NyaXB0aW9uID0gYXJnc1syXTtcbiAgICBpZiAodHlwZW9mIGFyZ3NbMl0gPT09ICdvYmplY3QnIHx8IHR5cGVvZiBhcmdzWzNdID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGFyZ3NbM10gfHwgYXJnc1syXTtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmV0W2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgaW50ZXJwb2xhdGlvbjoge1xuICAgIGVzY2FwZVZhbHVlOiB0cnVlLFxuICAgIGZvcm1hdDogdmFsdWUgPT4gdmFsdWUsXG4gICAgcHJlZml4OiAne3snLFxuICAgIHN1ZmZpeDogJ319JyxcbiAgICBmb3JtYXRTZXBhcmF0b3I6ICcsJyxcbiAgICB1bmVzY2FwZVByZWZpeDogJy0nLFxuICAgIG5lc3RpbmdQcmVmaXg6ICckdCgnLFxuICAgIG5lc3RpbmdTdWZmaXg6ICcpJyxcbiAgICBuZXN0aW5nT3B0aW9uc1NlcGFyYXRvcjogJywnLFxuICAgIG1heFJlcGxhY2VzOiAxMDAwLFxuICAgIHNraXBPblZhcmlhYmxlczogdHJ1ZVxuICB9XG59KTtcbmNvbnN0IHRyYW5zZm9ybU9wdGlvbnMgPSBvcHRpb25zID0+IHtcbiAgaWYgKGlzU3RyaW5nKG9wdGlvbnMubnMpKSBvcHRpb25zLm5zID0gW29wdGlvbnMubnNdO1xuICBpZiAoaXNTdHJpbmcob3B0aW9ucy5mYWxsYmFja0xuZykpIG9wdGlvbnMuZmFsbGJhY2tMbmcgPSBbb3B0aW9ucy5mYWxsYmFja0xuZ107XG4gIGlmIChpc1N0cmluZyhvcHRpb25zLmZhbGxiYWNrTlMpKSBvcHRpb25zLmZhbGxiYWNrTlMgPSBbb3B0aW9ucy5mYWxsYmFja05TXTtcbiAgaWYgKG9wdGlvbnMuc3VwcG9ydGVkTG5ncz8uaW5kZXhPZj8uKCdjaW1vZGUnKSA8IDApIHtcbiAgICBvcHRpb25zLnN1cHBvcnRlZExuZ3MgPSBvcHRpb25zLnN1cHBvcnRlZExuZ3MuY29uY2F0KFsnY2ltb2RlJ10pO1xuICB9XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbml0SW1tZWRpYXRlID09PSAnYm9vbGVhbicpIG9wdGlvbnMuaW5pdEFzeW5jID0gb3B0aW9ucy5pbml0SW1tZWRpYXRlO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcbmNvbnN0IGJpbmRNZW1iZXJGdW5jdGlvbnMgPSBpbnN0ID0+IHtcbiAgY29uc3QgbWVtcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE9iamVjdC5nZXRQcm90b3R5cGVPZihpbnN0KSk7XG4gIG1lbXMuZm9yRWFjaChtZW0gPT4ge1xuICAgIGlmICh0eXBlb2YgaW5zdFttZW1dID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpbnN0W21lbV0gPSBpbnN0W21lbV0uYmluZChpbnN0KTtcbiAgICB9XG4gIH0pO1xufTtcbmNsYXNzIEkxOG4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgbGV0IGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSB0cmFuc2Zvcm1PcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuc2VydmljZXMgPSB7fTtcbiAgICB0aGlzLmxvZ2dlciA9IGJhc2VMb2dnZXI7XG4gICAgdGhpcy5tb2R1bGVzID0ge1xuICAgICAgZXh0ZXJuYWw6IFtdXG4gICAgfTtcbiAgICBiaW5kTWVtYmVyRnVuY3Rpb25zKHRoaXMpO1xuICAgIGlmIChjYWxsYmFjayAmJiAhdGhpcy5pc0luaXRpYWxpemVkICYmICFvcHRpb25zLmlzQ2xvbmUpIHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmluaXRBc3luYykge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9XG4gIGluaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgbGV0IGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0luaXRpYWxpemluZyA9IHRydWU7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRlZmF1bHROUyA9PSBudWxsICYmIG9wdGlvbnMubnMpIHtcbiAgICAgIGlmIChpc1N0cmluZyhvcHRpb25zLm5zKSkge1xuICAgICAgICBvcHRpb25zLmRlZmF1bHROUyA9IG9wdGlvbnMubnM7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubnMuaW5kZXhPZigndHJhbnNsYXRpb24nKSA8IDApIHtcbiAgICAgICAgb3B0aW9ucy5kZWZhdWx0TlMgPSBvcHRpb25zLm5zWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZWZPcHRzID0gZ2V0KCk7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLi4uZGVmT3B0cyxcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIC4uLnRyYW5zZm9ybU9wdGlvbnMob3B0aW9ucylcbiAgICB9O1xuICAgIHRoaXMub3B0aW9ucy5pbnRlcnBvbGF0aW9uID0ge1xuICAgICAgLi4uZGVmT3B0cy5pbnRlcnBvbGF0aW9uLFxuICAgICAgLi4udGhpcy5vcHRpb25zLmludGVycG9sYXRpb25cbiAgICB9O1xuICAgIGlmIChvcHRpb25zLmtleVNlcGFyYXRvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudXNlckRlZmluZWRLZXlTZXBhcmF0b3IgPSBvcHRpb25zLmtleVNlcGFyYXRvcjtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubnNTZXBhcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5vcHRpb25zLnVzZXJEZWZpbmVkTnNTZXBhcmF0b3IgPSBvcHRpb25zLm5zU2VwYXJhdG9yO1xuICAgIH1cbiAgICBjb25zdCBjcmVhdGVDbGFzc09uRGVtYW5kID0gQ2xhc3NPck9iamVjdCA9PiB7XG4gICAgICBpZiAoIUNsYXNzT3JPYmplY3QpIHJldHVybiBudWxsO1xuICAgICAgaWYgKHR5cGVvZiBDbGFzc09yT2JqZWN0ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gbmV3IENsYXNzT3JPYmplY3QoKTtcbiAgICAgIHJldHVybiBDbGFzc09yT2JqZWN0O1xuICAgIH07XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuaXNDbG9uZSkge1xuICAgICAgaWYgKHRoaXMubW9kdWxlcy5sb2dnZXIpIHtcbiAgICAgICAgYmFzZUxvZ2dlci5pbml0KGNyZWF0ZUNsYXNzT25EZW1hbmQodGhpcy5tb2R1bGVzLmxvZ2dlciksIHRoaXMub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiYXNlTG9nZ2VyLmluaXQobnVsbCwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIGxldCBmb3JtYXR0ZXI7XG4gICAgICBpZiAodGhpcy5tb2R1bGVzLmZvcm1hdHRlcikge1xuICAgICAgICBmb3JtYXR0ZXIgPSB0aGlzLm1vZHVsZXMuZm9ybWF0dGVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybWF0dGVyID0gRm9ybWF0dGVyO1xuICAgICAgfVxuICAgICAgY29uc3QgbHUgPSBuZXcgTGFuZ3VhZ2VVdGlsKHRoaXMub3B0aW9ucyk7XG4gICAgICB0aGlzLnN0b3JlID0gbmV3IFJlc291cmNlU3RvcmUodGhpcy5vcHRpb25zLnJlc291cmNlcywgdGhpcy5vcHRpb25zKTtcbiAgICAgIGNvbnN0IHMgPSB0aGlzLnNlcnZpY2VzO1xuICAgICAgcy5sb2dnZXIgPSBiYXNlTG9nZ2VyO1xuICAgICAgcy5yZXNvdXJjZVN0b3JlID0gdGhpcy5zdG9yZTtcbiAgICAgIHMubGFuZ3VhZ2VVdGlscyA9IGx1O1xuICAgICAgcy5wbHVyYWxSZXNvbHZlciA9IG5ldyBQbHVyYWxSZXNvbHZlcihsdSwge1xuICAgICAgICBwcmVwZW5kOiB0aGlzLm9wdGlvbnMucGx1cmFsU2VwYXJhdG9yLFxuICAgICAgICBzaW1wbGlmeVBsdXJhbFN1ZmZpeDogdGhpcy5vcHRpb25zLnNpbXBsaWZ5UGx1cmFsU3VmZml4XG4gICAgICB9KTtcbiAgICAgIGlmIChmb3JtYXR0ZXIgJiYgKCF0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5mb3JtYXQgfHwgdGhpcy5vcHRpb25zLmludGVycG9sYXRpb24uZm9ybWF0ID09PSBkZWZPcHRzLmludGVycG9sYXRpb24uZm9ybWF0KSkge1xuICAgICAgICBzLmZvcm1hdHRlciA9IGNyZWF0ZUNsYXNzT25EZW1hbmQoZm9ybWF0dGVyKTtcbiAgICAgICAgcy5mb3JtYXR0ZXIuaW5pdChzLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5mb3JtYXQgPSBzLmZvcm1hdHRlci5mb3JtYXQuYmluZChzLmZvcm1hdHRlcik7XG4gICAgICB9XG4gICAgICBzLmludGVycG9sYXRvciA9IG5ldyBJbnRlcnBvbGF0b3IodGhpcy5vcHRpb25zKTtcbiAgICAgIHMudXRpbHMgPSB7XG4gICAgICAgIGhhc0xvYWRlZE5hbWVzcGFjZTogdGhpcy5oYXNMb2FkZWROYW1lc3BhY2UuYmluZCh0aGlzKVxuICAgICAgfTtcbiAgICAgIHMuYmFja2VuZENvbm5lY3RvciA9IG5ldyBDb25uZWN0b3IoY3JlYXRlQ2xhc3NPbkRlbWFuZCh0aGlzLm1vZHVsZXMuYmFja2VuZCksIHMucmVzb3VyY2VTdG9yZSwgcywgdGhpcy5vcHRpb25zKTtcbiAgICAgIHMuYmFja2VuZENvbm5lY3Rvci5vbignKicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLm1vZHVsZXMubGFuZ3VhZ2VEZXRlY3Rvcikge1xuICAgICAgICBzLmxhbmd1YWdlRGV0ZWN0b3IgPSBjcmVhdGVDbGFzc09uRGVtYW5kKHRoaXMubW9kdWxlcy5sYW5ndWFnZURldGVjdG9yKTtcbiAgICAgICAgaWYgKHMubGFuZ3VhZ2VEZXRlY3Rvci5pbml0KSBzLmxhbmd1YWdlRGV0ZWN0b3IuaW5pdChzLCB0aGlzLm9wdGlvbnMuZGV0ZWN0aW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubW9kdWxlcy5pMThuRm9ybWF0KSB7XG4gICAgICAgIHMuaTE4bkZvcm1hdCA9IGNyZWF0ZUNsYXNzT25EZW1hbmQodGhpcy5tb2R1bGVzLmkxOG5Gb3JtYXQpO1xuICAgICAgICBpZiAocy5pMThuRm9ybWF0LmluaXQpIHMuaTE4bkZvcm1hdC5pbml0KHRoaXMpO1xuICAgICAgfVxuICAgICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IodGhpcy5zZXJ2aWNlcywgdGhpcy5vcHRpb25zKTtcbiAgICAgIHRoaXMudHJhbnNsYXRvci5vbignKicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjIgPiAxID8gX2xlbjIgLSAxIDogMCksIF9rZXkyID0gMTsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubW9kdWxlcy5leHRlcm5hbC5mb3JFYWNoKG0gPT4ge1xuICAgICAgICBpZiAobS5pbml0KSBtLmluaXQodGhpcyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5mb3JtYXQgPSB0aGlzLm9wdGlvbnMuaW50ZXJwb2xhdGlvbi5mb3JtYXQ7XG4gICAgaWYgKCFjYWxsYmFjaykgY2FsbGJhY2sgPSBub29wO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcgJiYgIXRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3RvciAmJiAhdGhpcy5vcHRpb25zLmxuZykge1xuICAgICAgY29uc3QgY29kZXMgPSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMuZ2V0RmFsbGJhY2tDb2Rlcyh0aGlzLm9wdGlvbnMuZmFsbGJhY2tMbmcpO1xuICAgICAgaWYgKGNvZGVzLmxlbmd0aCA+IDAgJiYgY29kZXNbMF0gIT09ICdkZXYnKSB0aGlzLm9wdGlvbnMubG5nID0gY29kZXNbMF07XG4gICAgfVxuICAgIGlmICghdGhpcy5zZXJ2aWNlcy5sYW5ndWFnZURldGVjdG9yICYmICF0aGlzLm9wdGlvbnMubG5nKSB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdpbml0OiBubyBsYW5ndWFnZURldGVjdG9yIGlzIHVzZWQgYW5kIG5vIGxuZyBpcyBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGNvbnN0IHN0b3JlQXBpID0gWydnZXRSZXNvdXJjZScsICdoYXNSZXNvdXJjZUJ1bmRsZScsICdnZXRSZXNvdXJjZUJ1bmRsZScsICdnZXREYXRhQnlMYW5ndWFnZSddO1xuICAgIHN0b3JlQXBpLmZvckVhY2goZmNOYW1lID0+IHtcbiAgICAgIHRoaXNbZmNOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnN0b3JlW2ZjTmFtZV0oLi4uYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3Qgc3RvcmVBcGlDaGFpbmVkID0gWydhZGRSZXNvdXJjZScsICdhZGRSZXNvdXJjZXMnLCAnYWRkUmVzb3VyY2VCdW5kbGUnLCAncmVtb3ZlUmVzb3VyY2VCdW5kbGUnXTtcbiAgICBzdG9yZUFwaUNoYWluZWQuZm9yRWFjaChmY05hbWUgPT4ge1xuICAgICAgdGhpc1tmY05hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5zdG9yZVtmY05hbWVdKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIGNvbnN0IGxvYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBmaW5pc2ggPSAoZXJyLCB0KSA9PiB7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCAmJiAhdGhpcy5pbml0aWFsaXplZFN0b3JlT25jZSkgdGhpcy5sb2dnZXIud2FybignaW5pdDogaTE4bmV4dCBpcyBhbHJlYWR5IGluaXRpYWxpemVkLiBZb3Ugc2hvdWxkIGNhbGwgaW5pdCBqdXN0IG9uY2UhJyk7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmlzQ2xvbmUpIHRoaXMubG9nZ2VyLmxvZygnaW5pdGlhbGl6ZWQnLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVtaXQoJ2luaXRpYWxpemVkJywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0KTtcbiAgICAgICAgY2FsbGJhY2soZXJyLCB0KTtcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5sYW5ndWFnZXMgJiYgIXRoaXMuaXNJbml0aWFsaXplZCkgcmV0dXJuIGZpbmlzaChudWxsLCB0aGlzLnQuYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLmNoYW5nZUxhbmd1YWdlKHRoaXMub3B0aW9ucy5sbmcsIGZpbmlzaCk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlc291cmNlcyB8fCAhdGhpcy5vcHRpb25zLmluaXRBc3luYykge1xuICAgICAgbG9hZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGxvYWQsIDApO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQ7XG4gIH1cbiAgbG9hZFJlc291cmNlcyhsYW5ndWFnZSkge1xuICAgIGxldCBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbm9vcDtcbiAgICBsZXQgdXNlZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgY29uc3QgdXNlZExuZyA9IGlzU3RyaW5nKGxhbmd1YWdlKSA/IGxhbmd1YWdlIDogdGhpcy5sYW5ndWFnZTtcbiAgICBpZiAodHlwZW9mIGxhbmd1YWdlID09PSAnZnVuY3Rpb24nKSB1c2VkQ2FsbGJhY2sgPSBsYW5ndWFnZTtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5yZXNvdXJjZXMgfHwgdGhpcy5vcHRpb25zLnBhcnRpYWxCdW5kbGVkTGFuZ3VhZ2VzKSB7XG4gICAgICBpZiAodXNlZExuZz8udG9Mb3dlckNhc2UoKSA9PT0gJ2NpbW9kZScgJiYgKCF0aGlzLm9wdGlvbnMucHJlbG9hZCB8fCB0aGlzLm9wdGlvbnMucHJlbG9hZC5sZW5ndGggPT09IDApKSByZXR1cm4gdXNlZENhbGxiYWNrKCk7XG4gICAgICBjb25zdCB0b0xvYWQgPSBbXTtcbiAgICAgIGNvbnN0IGFwcGVuZCA9IGxuZyA9PiB7XG4gICAgICAgIGlmICghbG5nKSByZXR1cm47XG4gICAgICAgIGlmIChsbmcgPT09ICdjaW1vZGUnKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGxuZ3MgPSB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMudG9SZXNvbHZlSGllcmFyY2h5KGxuZyk7XG4gICAgICAgIGxuZ3MuZm9yRWFjaChsID0+IHtcbiAgICAgICAgICBpZiAobCA9PT0gJ2NpbW9kZScpIHJldHVybjtcbiAgICAgICAgICBpZiAodG9Mb2FkLmluZGV4T2YobCkgPCAwKSB0b0xvYWQucHVzaChsKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgaWYgKCF1c2VkTG5nKSB7XG4gICAgICAgIGNvbnN0IGZhbGxiYWNrcyA9IHRoaXMuc2VydmljZXMubGFuZ3VhZ2VVdGlscy5nZXRGYWxsYmFja0NvZGVzKHRoaXMub3B0aW9ucy5mYWxsYmFja0xuZyk7XG4gICAgICAgIGZhbGxiYWNrcy5mb3JFYWNoKGwgPT4gYXBwZW5kKGwpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFwcGVuZCh1c2VkTG5nKTtcbiAgICAgIH1cbiAgICAgIHRoaXMub3B0aW9ucy5wcmVsb2FkPy5mb3JFYWNoPy4obCA9PiBhcHBlbmQobCkpO1xuICAgICAgdGhpcy5zZXJ2aWNlcy5iYWNrZW5kQ29ubmVjdG9yLmxvYWQodG9Mb2FkLCB0aGlzLm9wdGlvbnMubnMsIGUgPT4ge1xuICAgICAgICBpZiAoIWUgJiYgIXRoaXMucmVzb2x2ZWRMYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlKSB0aGlzLnNldFJlc29sdmVkTGFuZ3VhZ2UodGhpcy5sYW5ndWFnZSk7XG4gICAgICAgIHVzZWRDYWxsYmFjayhlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB1c2VkQ2FsbGJhY2sobnVsbCk7XG4gICAgfVxuICB9XG4gIHJlbG9hZFJlc291cmNlcyhsbmdzLCBucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgaWYgKHR5cGVvZiBsbmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGxuZ3M7XG4gICAgICBsbmdzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG5zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG5zO1xuICAgICAgbnMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICghbG5ncykgbG5ncyA9IHRoaXMubGFuZ3VhZ2VzO1xuICAgIGlmICghbnMpIG5zID0gdGhpcy5vcHRpb25zLm5zO1xuICAgIGlmICghY2FsbGJhY2spIGNhbGxiYWNrID0gbm9vcDtcbiAgICB0aGlzLnNlcnZpY2VzLmJhY2tlbmRDb25uZWN0b3IucmVsb2FkKGxuZ3MsIG5zLCBlcnIgPT4ge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQ7XG4gIH1cbiAgdXNlKG1vZHVsZSkge1xuICAgIGlmICghbW9kdWxlKSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBhcmUgcGFzc2luZyBhbiB1bmRlZmluZWQgbW9kdWxlISBQbGVhc2UgY2hlY2sgdGhlIG9iamVjdCB5b3UgYXJlIHBhc3NpbmcgdG8gaTE4bmV4dC51c2UoKScpO1xuICAgIGlmICghbW9kdWxlLnR5cGUpIHRocm93IG5ldyBFcnJvcignWW91IGFyZSBwYXNzaW5nIGEgd3JvbmcgbW9kdWxlISBQbGVhc2UgY2hlY2sgdGhlIG9iamVjdCB5b3UgYXJlIHBhc3NpbmcgdG8gaTE4bmV4dC51c2UoKScpO1xuICAgIGlmIChtb2R1bGUudHlwZSA9PT0gJ2JhY2tlbmQnKSB7XG4gICAgICB0aGlzLm1vZHVsZXMuYmFja2VuZCA9IG1vZHVsZTtcbiAgICB9XG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnbG9nZ2VyJyB8fCBtb2R1bGUubG9nICYmIG1vZHVsZS53YXJuICYmIG1vZHVsZS5lcnJvcikge1xuICAgICAgdGhpcy5tb2R1bGVzLmxvZ2dlciA9IG1vZHVsZTtcbiAgICB9XG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnbGFuZ3VhZ2VEZXRlY3RvcicpIHtcbiAgICAgIHRoaXMubW9kdWxlcy5sYW5ndWFnZURldGVjdG9yID0gbW9kdWxlO1xuICAgIH1cbiAgICBpZiAobW9kdWxlLnR5cGUgPT09ICdpMThuRm9ybWF0Jykge1xuICAgICAgdGhpcy5tb2R1bGVzLmkxOG5Gb3JtYXQgPSBtb2R1bGU7XG4gICAgfVxuICAgIGlmIChtb2R1bGUudHlwZSA9PT0gJ3Bvc3RQcm9jZXNzb3InKSB7XG4gICAgICBwb3N0UHJvY2Vzc29yLmFkZFBvc3RQcm9jZXNzb3IobW9kdWxlKTtcbiAgICB9XG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnZm9ybWF0dGVyJykge1xuICAgICAgdGhpcy5tb2R1bGVzLmZvcm1hdHRlciA9IG1vZHVsZTtcbiAgICB9XG4gICAgaWYgKG1vZHVsZS50eXBlID09PSAnM3JkUGFydHknKSB7XG4gICAgICB0aGlzLm1vZHVsZXMuZXh0ZXJuYWwucHVzaChtb2R1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzZXRSZXNvbHZlZExhbmd1YWdlKGwpIHtcbiAgICBpZiAoIWwgfHwgIXRoaXMubGFuZ3VhZ2VzKSByZXR1cm47XG4gICAgaWYgKFsnY2ltb2RlJywgJ2RldiddLmluZGV4T2YobCkgPiAtMSkgcmV0dXJuO1xuICAgIGZvciAobGV0IGxpID0gMDsgbGkgPCB0aGlzLmxhbmd1YWdlcy5sZW5ndGg7IGxpKyspIHtcbiAgICAgIGNvbnN0IGxuZ0luTG5ncyA9IHRoaXMubGFuZ3VhZ2VzW2xpXTtcbiAgICAgIGlmIChbJ2NpbW9kZScsICdkZXYnXS5pbmRleE9mKGxuZ0luTG5ncykgPiAtMSkgY29udGludWU7XG4gICAgICBpZiAodGhpcy5zdG9yZS5oYXNMYW5ndWFnZVNvbWVUcmFuc2xhdGlvbnMobG5nSW5MbmdzKSkge1xuICAgICAgICB0aGlzLnJlc29sdmVkTGFuZ3VhZ2UgPSBsbmdJbkxuZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjaGFuZ2VMYW5ndWFnZShsbmcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG4gICAgdGhpcy5pc0xhbmd1YWdlQ2hhbmdpbmdUbyA9IGxuZztcbiAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdGhpcy5lbWl0KCdsYW5ndWFnZUNoYW5naW5nJywgbG5nKTtcbiAgICBjb25zdCBzZXRMbmdQcm9wcyA9IGwgPT4ge1xuICAgICAgdGhpcy5sYW5ndWFnZSA9IGw7XG4gICAgICB0aGlzLmxhbmd1YWdlcyA9IHRoaXMuc2VydmljZXMubGFuZ3VhZ2VVdGlscy50b1Jlc29sdmVIaWVyYXJjaHkobCk7XG4gICAgICB0aGlzLnJlc29sdmVkTGFuZ3VhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNldFJlc29sdmVkTGFuZ3VhZ2UobCk7XG4gICAgfTtcbiAgICBjb25zdCBkb25lID0gKGVyciwgbCkgPT4ge1xuICAgICAgaWYgKGwpIHtcbiAgICAgICAgc2V0TG5nUHJvcHMobCk7XG4gICAgICAgIHRoaXMudHJhbnNsYXRvci5jaGFuZ2VMYW5ndWFnZShsKTtcbiAgICAgICAgdGhpcy5pc0xhbmd1YWdlQ2hhbmdpbmdUbyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lbWl0KCdsYW5ndWFnZUNoYW5nZWQnLCBsKTtcbiAgICAgICAgdGhpcy5sb2dnZXIubG9nKCdsYW5ndWFnZUNoYW5nZWQnLCBsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaXNMYW5ndWFnZUNoYW5naW5nVG8gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMi50KC4uLmFyZ3VtZW50cyk7XG4gICAgICB9KTtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIudCguLi5hcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBjb25zdCBzZXRMbmcgPSBsbmdzID0+IHtcbiAgICAgIGlmICghbG5nICYmICFsbmdzICYmIHRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3RvcikgbG5ncyA9IFtdO1xuICAgICAgY29uc3QgbCA9IGlzU3RyaW5nKGxuZ3MpID8gbG5ncyA6IHRoaXMuc2VydmljZXMubGFuZ3VhZ2VVdGlscy5nZXRCZXN0TWF0Y2hGcm9tQ29kZXMobG5ncyk7XG4gICAgICBpZiAobCkge1xuICAgICAgICBpZiAoIXRoaXMubGFuZ3VhZ2UpIHtcbiAgICAgICAgICBzZXRMbmdQcm9wcyhsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMudHJhbnNsYXRvci5sYW5ndWFnZSkgdGhpcy50cmFuc2xhdG9yLmNoYW5nZUxhbmd1YWdlKGwpO1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3I/LmNhY2hlVXNlckxhbmd1YWdlPy4obCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxvYWRSZXNvdXJjZXMobCwgZXJyID0+IHtcbiAgICAgICAgZG9uZShlcnIsIGwpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBpZiAoIWxuZyAmJiB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IgJiYgIXRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3Rvci5hc3luYykge1xuICAgICAgc2V0TG5nKHRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3Rvci5kZXRlY3QoKSk7XG4gICAgfSBlbHNlIGlmICghbG5nICYmIHRoaXMuc2VydmljZXMubGFuZ3VhZ2VEZXRlY3RvciAmJiB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuYXN5bmMpIHtcbiAgICAgIGlmICh0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuZGV0ZWN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlRGV0ZWN0b3IuZGV0ZWN0KCkudGhlbihzZXRMbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy5sYW5ndWFnZURldGVjdG9yLmRldGVjdChzZXRMbmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRMbmcobG5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkO1xuICB9XG4gIGdldEZpeGVkVChsbmcsIG5zLCBrZXlQcmVmaXgpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcbiAgICBjb25zdCBmaXhlZFQgPSBmdW5jdGlvbiAoa2V5LCBvcHRzKSB7XG4gICAgICBsZXQgb3B0aW9ucztcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCByZXN0ID0gbmV3IEFycmF5KF9sZW4zID4gMiA/IF9sZW4zIC0gMiA6IDApLCBfa2V5MyA9IDI7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgICByZXN0W19rZXkzIC0gMl0gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMgPSBfdGhpczMub3B0aW9ucy5vdmVybG9hZFRyYW5zbGF0aW9uT3B0aW9uSGFuZGxlcihba2V5LCBvcHRzXS5jb25jYXQocmVzdCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAuLi5vcHRzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRpb25zLmxuZyA9IG9wdGlvbnMubG5nIHx8IGZpeGVkVC5sbmc7XG4gICAgICBvcHRpb25zLmxuZ3MgPSBvcHRpb25zLmxuZ3MgfHwgZml4ZWRULmxuZ3M7XG4gICAgICBvcHRpb25zLm5zID0gb3B0aW9ucy5ucyB8fCBmaXhlZFQubnM7XG4gICAgICBpZiAob3B0aW9ucy5rZXlQcmVmaXggIT09ICcnKSBvcHRpb25zLmtleVByZWZpeCA9IG9wdGlvbnMua2V5UHJlZml4IHx8IGtleVByZWZpeCB8fCBmaXhlZFQua2V5UHJlZml4O1xuICAgICAgY29uc3Qga2V5U2VwYXJhdG9yID0gX3RoaXMzLm9wdGlvbnMua2V5U2VwYXJhdG9yIHx8ICcuJztcbiAgICAgIGxldCByZXN1bHRLZXk7XG4gICAgICBpZiAob3B0aW9ucy5rZXlQcmVmaXggJiYgQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgICAgIHJlc3VsdEtleSA9IGtleS5tYXAoayA9PiBgJHtvcHRpb25zLmtleVByZWZpeH0ke2tleVNlcGFyYXRvcn0ke2t9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRLZXkgPSBvcHRpb25zLmtleVByZWZpeCA/IGAke29wdGlvbnMua2V5UHJlZml4fSR7a2V5U2VwYXJhdG9yfSR7a2V5fWAgOiBrZXk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3RoaXMzLnQocmVzdWx0S2V5LCBvcHRpb25zKTtcbiAgICB9O1xuICAgIGlmIChpc1N0cmluZyhsbmcpKSB7XG4gICAgICBmaXhlZFQubG5nID0gbG5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXhlZFQubG5ncyA9IGxuZztcbiAgICB9XG4gICAgZml4ZWRULm5zID0gbnM7XG4gICAgZml4ZWRULmtleVByZWZpeCA9IGtleVByZWZpeDtcbiAgICByZXR1cm4gZml4ZWRUO1xuICB9XG4gIHQoKSB7XG4gICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW40KSwgX2tleTQgPSAwOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICBhcmdzW19rZXk0XSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3I/LnRyYW5zbGF0ZSguLi5hcmdzKTtcbiAgfVxuICBleGlzdHMoKSB7XG4gICAgZm9yICh2YXIgX2xlbjUgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW41KSwgX2tleTUgPSAwOyBfa2V5NSA8IF9sZW41OyBfa2V5NSsrKSB7XG4gICAgICBhcmdzW19rZXk1XSA9IGFyZ3VtZW50c1tfa2V5NV07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3I/LmV4aXN0cyguLi5hcmdzKTtcbiAgfVxuICBzZXREZWZhdWx0TmFtZXNwYWNlKG5zKSB7XG4gICAgdGhpcy5vcHRpb25zLmRlZmF1bHROUyA9IG5zO1xuICB9XG4gIGhhc0xvYWRlZE5hbWVzcGFjZShucykge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICBpZiAoIXRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignaGFzTG9hZGVkTmFtZXNwYWNlOiBpMThuZXh0IHdhcyBub3QgaW5pdGlhbGl6ZWQnLCB0aGlzLmxhbmd1YWdlcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghdGhpcy5sYW5ndWFnZXMgfHwgIXRoaXMubGFuZ3VhZ2VzLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignaGFzTG9hZGVkTmFtZXNwYWNlOiBpMThuLmxhbmd1YWdlcyB3ZXJlIHVuZGVmaW5lZCBvciBlbXB0eScsIHRoaXMubGFuZ3VhZ2VzKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgbG5nID0gb3B0aW9ucy5sbmcgfHwgdGhpcy5yZXNvbHZlZExhbmd1YWdlIHx8IHRoaXMubGFuZ3VhZ2VzWzBdO1xuICAgIGNvbnN0IGZhbGxiYWNrTG5nID0gdGhpcy5vcHRpb25zID8gdGhpcy5vcHRpb25zLmZhbGxiYWNrTG5nIDogZmFsc2U7XG4gICAgY29uc3QgbGFzdExuZyA9IHRoaXMubGFuZ3VhZ2VzW3RoaXMubGFuZ3VhZ2VzLmxlbmd0aCAtIDFdO1xuICAgIGlmIChsbmcudG9Mb3dlckNhc2UoKSA9PT0gJ2NpbW9kZScpIHJldHVybiB0cnVlO1xuICAgIGNvbnN0IGxvYWROb3RQZW5kaW5nID0gKGwsIG4pID0+IHtcbiAgICAgIGNvbnN0IGxvYWRTdGF0ZSA9IHRoaXMuc2VydmljZXMuYmFja2VuZENvbm5lY3Rvci5zdGF0ZVtgJHtsfXwke259YF07XG4gICAgICByZXR1cm4gbG9hZFN0YXRlID09PSAtMSB8fCBsb2FkU3RhdGUgPT09IDAgfHwgbG9hZFN0YXRlID09PSAyO1xuICAgIH07XG4gICAgaWYgKG9wdGlvbnMucHJlY2hlY2spIHtcbiAgICAgIGNvbnN0IHByZVJlc3VsdCA9IG9wdGlvbnMucHJlY2hlY2sodGhpcywgbG9hZE5vdFBlbmRpbmcpO1xuICAgICAgaWYgKHByZVJlc3VsdCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJlUmVzdWx0O1xuICAgIH1cbiAgICBpZiAodGhpcy5oYXNSZXNvdXJjZUJ1bmRsZShsbmcsIG5zKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKCF0aGlzLnNlcnZpY2VzLmJhY2tlbmRDb25uZWN0b3IuYmFja2VuZCB8fCB0aGlzLm9wdGlvbnMucmVzb3VyY2VzICYmICF0aGlzLm9wdGlvbnMucGFydGlhbEJ1bmRsZWRMYW5ndWFnZXMpIHJldHVybiB0cnVlO1xuICAgIGlmIChsb2FkTm90UGVuZGluZyhsbmcsIG5zKSAmJiAoIWZhbGxiYWNrTG5nIHx8IGxvYWROb3RQZW5kaW5nKGxhc3RMbmcsIG5zKSkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBsb2FkTmFtZXNwYWNlcyhucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubnMpIHtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgaWYgKGlzU3RyaW5nKG5zKSkgbnMgPSBbbnNdO1xuICAgIG5zLmZvckVhY2gobiA9PiB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm5zLmluZGV4T2YobikgPCAwKSB0aGlzLm9wdGlvbnMubnMucHVzaChuKTtcbiAgICB9KTtcbiAgICB0aGlzLmxvYWRSZXNvdXJjZXMoZXJyID0+IHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQ7XG4gIH1cbiAgbG9hZExhbmd1YWdlcyhsbmdzLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBpZiAoaXNTdHJpbmcobG5ncykpIGxuZ3MgPSBbbG5nc107XG4gICAgY29uc3QgcHJlbG9hZGVkID0gdGhpcy5vcHRpb25zLnByZWxvYWQgfHwgW107XG4gICAgY29uc3QgbmV3TG5ncyA9IGxuZ3MuZmlsdGVyKGxuZyA9PiBwcmVsb2FkZWQuaW5kZXhPZihsbmcpIDwgMCAmJiB0aGlzLnNlcnZpY2VzLmxhbmd1YWdlVXRpbHMuaXNTdXBwb3J0ZWRDb2RlKGxuZykpO1xuICAgIGlmICghbmV3TG5ncy5sZW5ndGgpIHtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zLnByZWxvYWQgPSBwcmVsb2FkZWQuY29uY2F0KG5ld0xuZ3MpO1xuICAgIHRoaXMubG9hZFJlc291cmNlcyhlcnIgPT4ge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfVxuICBkaXIobG5nKSB7XG4gICAgaWYgKCFsbmcpIGxuZyA9IHRoaXMucmVzb2x2ZWRMYW5ndWFnZSB8fCAodGhpcy5sYW5ndWFnZXM/Lmxlbmd0aCA+IDAgPyB0aGlzLmxhbmd1YWdlc1swXSA6IHRoaXMubGFuZ3VhZ2UpO1xuICAgIGlmICghbG5nKSByZXR1cm4gJ3J0bCc7XG4gICAgY29uc3QgcnRsTG5ncyA9IFsnYXInLCAnc2h1JywgJ3NxcicsICdzc2gnLCAneGFhJywgJ3loZCcsICd5dWQnLCAnYWFvJywgJ2FiaCcsICdhYnYnLCAnYWNtJywgJ2FjcScsICdhY3cnLCAnYWN4JywgJ2FjeScsICdhZGYnLCAnYWRzJywgJ2FlYicsICdhZWMnLCAnYWZiJywgJ2FqcCcsICdhcGMnLCAnYXBkJywgJ2FyYicsICdhcnEnLCAnYXJzJywgJ2FyeScsICdhcnonLCAnYXV6JywgJ2F2bCcsICdheWgnLCAnYXlsJywgJ2F5bicsICdheXAnLCAnYmJ6JywgJ3BnYScsICdoZScsICdpdycsICdwcycsICdwYnQnLCAncGJ1JywgJ3BzdCcsICdwcnAnLCAncHJkJywgJ3VnJywgJ3VyJywgJ3lkZCcsICd5ZHMnLCAneWloJywgJ2ppJywgJ3lpJywgJ2hibycsICdtZW4nLCAneG1uJywgJ2ZhJywgJ2pwcicsICdwZW8nLCAncGVzJywgJ3BycycsICdkdicsICdzYW0nLCAnY2tiJ107XG4gICAgY29uc3QgbGFuZ3VhZ2VVdGlscyA9IHRoaXMuc2VydmljZXM/Lmxhbmd1YWdlVXRpbHMgfHwgbmV3IExhbmd1YWdlVXRpbChnZXQoKSk7XG4gICAgcmV0dXJuIHJ0bExuZ3MuaW5kZXhPZihsYW5ndWFnZVV0aWxzLmdldExhbmd1YWdlUGFydEZyb21Db2RlKGxuZykpID4gLTEgfHwgbG5nLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignLWFyYWInKSA+IDEgPyAncnRsJyA6ICdsdHInO1xuICB9XG4gIHN0YXRpYyBjcmVhdGVJbnN0YW5jZSgpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgbGV0IGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBJMThuKG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgfVxuICBjbG9uZUluc3RhbmNlKCkge1xuICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICBsZXQgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG5vb3A7XG4gICAgY29uc3QgZm9ya1Jlc291cmNlU3RvcmUgPSBvcHRpb25zLmZvcmtSZXNvdXJjZVN0b3JlO1xuICAgIGlmIChmb3JrUmVzb3VyY2VTdG9yZSkgZGVsZXRlIG9wdGlvbnMuZm9ya1Jlc291cmNlU3RvcmU7XG4gICAgY29uc3QgbWVyZ2VkT3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAuLi57XG4gICAgICAgIGlzQ2xvbmU6IHRydWVcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGNsb25lID0gbmV3IEkxOG4obWVyZ2VkT3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMuZGVidWcgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnByZWZpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbG9uZS5sb2dnZXIgPSBjbG9uZS5sb2dnZXIuY2xvbmUob3B0aW9ucyk7XG4gICAgfVxuICAgIGNvbnN0IG1lbWJlcnNUb0NvcHkgPSBbJ3N0b3JlJywgJ3NlcnZpY2VzJywgJ2xhbmd1YWdlJ107XG4gICAgbWVtYmVyc1RvQ29weS5mb3JFYWNoKG0gPT4ge1xuICAgICAgY2xvbmVbbV0gPSB0aGlzW21dO1xuICAgIH0pO1xuICAgIGNsb25lLnNlcnZpY2VzID0ge1xuICAgICAgLi4udGhpcy5zZXJ2aWNlc1xuICAgIH07XG4gICAgY2xvbmUuc2VydmljZXMudXRpbHMgPSB7XG4gICAgICBoYXNMb2FkZWROYW1lc3BhY2U6IGNsb25lLmhhc0xvYWRlZE5hbWVzcGFjZS5iaW5kKGNsb25lKVxuICAgIH07XG4gICAgaWYgKGZvcmtSZXNvdXJjZVN0b3JlKSB7XG4gICAgICBjb25zdCBjbG9uZWREYXRhID0gT2JqZWN0LmtleXModGhpcy5zdG9yZS5kYXRhKS5yZWR1Y2UoKHByZXYsIGwpID0+IHtcbiAgICAgICAgcHJldltsXSA9IHtcbiAgICAgICAgICAuLi50aGlzLnN0b3JlLmRhdGFbbF1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHByZXZbbF0pLnJlZHVjZSgoYWNjLCBuKSA9PiB7XG4gICAgICAgICAgYWNjW25dID0ge1xuICAgICAgICAgICAgLi4ucHJldltsXVtuXVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pO1xuICAgICAgfSwge30pO1xuICAgICAgY2xvbmUuc3RvcmUgPSBuZXcgUmVzb3VyY2VTdG9yZShjbG9uZWREYXRhLCBtZXJnZWRPcHRpb25zKTtcbiAgICAgIGNsb25lLnNlcnZpY2VzLnJlc291cmNlU3RvcmUgPSBjbG9uZS5zdG9yZTtcbiAgICB9XG4gICAgY2xvbmUudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKGNsb25lLnNlcnZpY2VzLCBtZXJnZWRPcHRpb25zKTtcbiAgICBjbG9uZS50cmFuc2xhdG9yLm9uKCcqJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjYgPiAxID8gX2xlbjYgLSAxIDogMCksIF9rZXk2ID0gMTsgX2tleTYgPCBfbGVuNjsgX2tleTYrKykge1xuICAgICAgICBhcmdzW19rZXk2IC0gMV0gPSBhcmd1bWVudHNbX2tleTZdO1xuICAgICAgfVxuICAgICAgY2xvbmUuZW1pdChldmVudCwgLi4uYXJncyk7XG4gICAgfSk7XG4gICAgY2xvbmUuaW5pdChtZXJnZWRPcHRpb25zLCBjYWxsYmFjayk7XG4gICAgY2xvbmUudHJhbnNsYXRvci5vcHRpb25zID0gbWVyZ2VkT3B0aW9ucztcbiAgICBjbG9uZS50cmFuc2xhdG9yLmJhY2tlbmRDb25uZWN0b3Iuc2VydmljZXMudXRpbHMgPSB7XG4gICAgICBoYXNMb2FkZWROYW1lc3BhY2U6IGNsb25lLmhhc0xvYWRlZE5hbWVzcGFjZS5iaW5kKGNsb25lKVxuICAgIH07XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgc3RvcmU6IHRoaXMuc3RvcmUsXG4gICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgIGxhbmd1YWdlczogdGhpcy5sYW5ndWFnZXMsXG4gICAgICByZXNvbHZlZExhbmd1YWdlOiB0aGlzLnJlc29sdmVkTGFuZ3VhZ2VcbiAgICB9O1xuICB9XG59XG5jb25zdCBpbnN0YW5jZSA9IEkxOG4uY3JlYXRlSW5zdGFuY2UoKTtcbmluc3RhbmNlLmNyZWF0ZUluc3RhbmNlID0gSTE4bi5jcmVhdGVJbnN0YW5jZTtcblxuY29uc3QgY3JlYXRlSW5zdGFuY2UgPSBpbnN0YW5jZS5jcmVhdGVJbnN0YW5jZTtcbmNvbnN0IGRpciA9IGluc3RhbmNlLmRpcjtcbmNvbnN0IGluaXQgPSBpbnN0YW5jZS5pbml0O1xuY29uc3QgbG9hZFJlc291cmNlcyA9IGluc3RhbmNlLmxvYWRSZXNvdXJjZXM7XG5jb25zdCByZWxvYWRSZXNvdXJjZXMgPSBpbnN0YW5jZS5yZWxvYWRSZXNvdXJjZXM7XG5jb25zdCB1c2UgPSBpbnN0YW5jZS51c2U7XG5jb25zdCBjaGFuZ2VMYW5ndWFnZSA9IGluc3RhbmNlLmNoYW5nZUxhbmd1YWdlO1xuY29uc3QgZ2V0Rml4ZWRUID0gaW5zdGFuY2UuZ2V0Rml4ZWRUO1xuY29uc3QgdCA9IGluc3RhbmNlLnQ7XG5jb25zdCBleGlzdHMgPSBpbnN0YW5jZS5leGlzdHM7XG5jb25zdCBzZXREZWZhdWx0TmFtZXNwYWNlID0gaW5zdGFuY2Uuc2V0RGVmYXVsdE5hbWVzcGFjZTtcbmNvbnN0IGhhc0xvYWRlZE5hbWVzcGFjZSA9IGluc3RhbmNlLmhhc0xvYWRlZE5hbWVzcGFjZTtcbmNvbnN0IGxvYWROYW1lc3BhY2VzID0gaW5zdGFuY2UubG9hZE5hbWVzcGFjZXM7XG5jb25zdCBsb2FkTGFuZ3VhZ2VzID0gaW5zdGFuY2UubG9hZExhbmd1YWdlcztcblxuZXhwb3J0IHsgY2hhbmdlTGFuZ3VhZ2UsIGNyZWF0ZUluc3RhbmNlLCBpbnN0YW5jZSBhcyBkZWZhdWx0LCBkaXIsIGV4aXN0cywgZ2V0Rml4ZWRULCBoYXNMb2FkZWROYW1lc3BhY2UsIGluaXQsIGxvYWRMYW5ndWFnZXMsIGxvYWROYW1lc3BhY2VzLCBsb2FkUmVzb3VyY2VzLCByZWxvYWRSZXNvdXJjZXMsIHNldERlZmF1bHROYW1lc3BhY2UsIHQsIHVzZSB9O1xuIiwKICAgICIvLyBBY2NlcHRzIG11bHRpcGxlIGFyZ3VtZW50cyBhbmQgdHlwZXMgKCcnLCBbXSwge30pXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0plZFdhdHNvbi9jbGFzc25hbWVzXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJ1xuXG5jb25zdCBjbGFzc2VzID0gY2xhc3NuYW1lc1xuXG5jb25zdCBjb3B5T2JqZWN0ID0gKG9iaikgPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxuXG5mdW5jdGlvbiBmbGF0dGVuRW52KG9iaiwgcGFyZW50LCByZXMgPSB7fSkge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgICAgY29uc3QgcHJvcE5hbWUgPSAocGFyZW50ID8gcGFyZW50ICsgJ18nICsga2V5IDoga2V5KS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmbGF0dGVuRW52KG9ialtrZXldLCBwcm9wTmFtZSwgcmVzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzW2BQWVJfJHtwcm9wTmFtZX1gXSA9IG9ialtrZXldXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBmb3JtYXRCeXRlcyhzaXplKSB7XG4gICAgaWYgKHNpemUgPiAxMDI0ICoqIDMpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQoKHNpemUgLyAxMDI0ICoqIDMpICogMTApIC8gMTB9R2lCYFxuICAgIH1pZiAoc2l6ZSA+IDEwMjQgKiogMikge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZCgoc2l6ZSAvIDEwMjQgKiogMikgKiAxMCkgLyAxMH1NaUJgXG4gICAgfWlmIChzaXplID4gMTAyNCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZCgoc2l6ZSAvIDEwMjQpICogMTApIC8gMTB9S2lCYFxuICAgIH1cbiAgICAgICAgcmV0dXJuIGAke3NpemV9QmBcblxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGhhc2ggc3RyaW5nIGZyb20gYSBzdHJpbmcgaW5wdXQgdGhhdCB3b3JrcyBjb25zaXN0ZW50bHkgaW4gYm90aCBicm93c2VyIGFuZCBOb2RlIGVudmlyb25tZW50cy5cbiAqIFVzZXMgRk5WLTFhIGFsZ29yaXRobSB3aGljaCBwcm92aWRlcyBnb29kIGRpc3RyaWJ1dGlvbiBhbmQgbG93IGNvbGxpc2lvbiByYXRlIGZvciBzdHJpbmcgaW5wdXRzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBUaGUgc3RyaW5nIHRvIGhhc2hcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEEgNjQtYml0IGhleCBzdHJpbmcgaGFzaCB2YWx1ZVxuICovXG5mdW5jdGlvbiBoYXNoKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBGTlYtMWEgaGFzaCBhbGdvcml0aG0gY29uc3RhbnRzXG4gICAgbGV0IGgxID0gMHhERV9BRF9CRV9FRiAvLyBGaXJzdCBoYWxmXG4gICAgbGV0IGgyID0gMHg0MV9DNl9DRV81NyAvLyBTZWNvbmQgaGFsZlxuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHN0ci5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHN0ci5jb2RlUG9pbnRBdChpbmRleClcbiAgICAgICAgaDEgPSBNYXRoLmltdWwoaDEgXiBjaGFyLCAyXzY1NF80MzVfNzYxKVxuICAgICAgICBoMiA9IE1hdGguaW11bChoMiBeIGNoYXIsIDFfNTk3XzMzNF82NzcpXG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgMTYtY2hhciBoZXggc3RyaW5nIGZyb20gdGhlIHR3byBoYWx2ZXNcbiAgICBjb25zdCBoYXNoMSA9IChoMS50b1N0cmluZygxNikpLnBhZFN0YXJ0KDgsICcwJylcbiAgICBjb25zdCBoYXNoMiA9IChoMi50b1N0cmluZygxNikpLnBhZFN0YXJ0KDgsICcwJylcblxuICAgIHJldHVybiBoYXNoMSArIGhhc2gyXG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgYXBwbGllcyBhIG1vZGlmaWNhdGlvbiBmdW5jdGlvbiB0byBldmVyeSBrZXktdmFsdWUgcGFpciB3aXRoaW4gYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWZlcmVuY2UgLSBUaGUgb2JqZWN0IHRvIGJlIHRyYXZlcnNlZCBhbmQgbW9kaWZpZWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhcHBseSAtIFRoZSBtb2RpZmljYXRpb24gZnVuY3Rpb24gdG8gYXBwbHkuIEl0J3MgY2FsbGVkIHdpdGggdGhlIHJlZmVyZW5jZSBvYmplY3QsIHRoZSBjdXJyZW50IGtleSwgYW5kIHRoZSBjdXJyZW50IHBhdGguXG4gKiBAcGFyYW0ge0FycmF5fSBbcmVmUGF0aD1bXV0gLSBBbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgcGF0aCB3aXRoaW4gdGhlIG9iamVjdC4gQXV0b21hdGljYWxseSBwb3B1bGF0ZWQgZHVyaW5nIHJlY3Vyc2lvbi5cbiAqL1xuZnVuY3Rpb24ga2V5TW9kKHJlZmVyZW5jZSwgYXBwbHksIHJlZlBhdGggPSBbXSwgbmVzdGluZ0xldmVsID0gMCkge1xuICAgIGFwcGx5KHJlZmVyZW5jZSwgbnVsbCwgcmVmUGF0aCwgbmVzdGluZ0xldmVsKVxuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHJlZmVyZW5jZSlcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ18nKSAmJiAhWydzcmMnLCAndGFyZ2V0J10uaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICAgICAgcmVmUGF0aC5wdXNoKGtleSlcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZWZlcmVuY2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgcmVmZXJlbmNlW2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBrZXlNb2QocmVmZXJlbmNlW2tleV0sIGFwcGx5LCByZWZQYXRoLCBuZXN0aW5nTGV2ZWwgKyAxKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVmZXJlbmNlW2tleV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgYXBwbHkocmVmZXJlbmNlLCBrZXksIHJlZlBhdGgsIG5lc3RpbmdMZXZlbCArIDEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZQYXRoLnBvcCgpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWNjZXNzZXMgb3IgY3JlYXRlcyBhIHZhbHVlIGluIGFuIG9iamVjdCBhbG9uZyBhIHNwZWNpZmllZCBwYXRoLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogLSBUaGUgb2JqZWN0IHRvIGJlIGFjY2Vzc2VkIG9yIG1vZGlmaWVkLlxuICogQHBhcmFtIHtBcnJheX0gcmVmUGF0aCAtIEFuIGFycmF5IG9mIGtleXMgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHRvIGJlIG5hdmlnYXRlZCB0aHJvdWdoIHRoZSBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtjcmVhdGU9ZmFsc2VdIC0gRGV0ZXJtaW5lcyB3aGV0aGVyIG1pc3NpbmcgcGF0aCBzZWdtZW50cyB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcmV0dXJucyB7YW55fSAtIFRoZSB2YWx1ZSBhdCB0aGUgZW5kIG9mIHRoZSBwYXRoLCBvciB0aGUgbW9kaWZpZWQgb2JqZWN0IGlmIHNlZ21lbnRzIHdlcmUgY3JlYXRlZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgcmVmUGF0aGAgaXMgbm90IGFuIGFycmF5LlxuICovXG5mdW5jdGlvbiBrZXlQYXRoKG9iaiwgcmVmUGF0aCwgY3JlYXRlID0gZmFsc2UpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVmUGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVmUGF0aCBtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gICAgaWYgKCFyZWZQYXRoLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb2JqXG4gICAgfVxuXG4gICAgY29uc3QgX3JlZlBhdGggPSBbLi4ucmVmUGF0aF1cbiAgICBsZXQgX29iaiA9IG9ialxuICAgIHdoaWxlIChfcmVmUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gX3JlZlBhdGguc2hpZnQoKVxuICAgICAgICBpZiAodHlwZW9mIF9vYmogPT09ICdvYmplY3QnICYmIGtleSBpbiBfb2JqKSB7XG4gICAgICAgICAgICBfb2JqID0gX29ialtrZXldXG4gICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlKSB7XG4gICAgICAgICAgICBfb2JqW2tleV0gPSB7fVxuICAgICAgICAgICAgX29iaiA9IF9vYmpba2V5XVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9vYmpcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJndW1lbnQpIHtcbiAgICByZXR1cm4gKGFyZ3VtZW50ICYmIHR5cGVvZiBhcmd1bWVudCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoYXJndW1lbnQpKVxufVxuXG5mdW5jdGlvbiBtZXJnZURlZXAodGFyZ2V0LCAuLi5zb3VyY2VzKSB7XG4gICAgaWYgKCFzb3VyY2VzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKVxuXG4gICAgaWYgKGlzT2JqZWN0KHRhcmdldCkgJiYgaXNPYmplY3Qoc291cmNlKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChpc09iamVjdChzb3VyY2Vba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7W2tleV06IHt9fSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWVyZ2VEZWVwKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHtba2V5XTogc291cmNlW2tleV19KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlRGVlcCh0YXJnZXQsIC4uLnNvdXJjZXMpXG59XG5cbi8qKlxuICogUGFkcyBhIHN0cmluZyBvciBudW1iZXIgd2l0aCBsZWFkaW5nIGNoYXJhY3RlcnMgdG8gcmVhY2ggYSBzcGVjaWZpZWQgbGVuZ3RoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gcGFkXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gVGhlIGRlc2lyZWQgdG90YWwgbGVuZ3RoXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NoYXI9JzAnXSAtIFRoZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGggKGRlZmF1bHRzIHRvICcwJylcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBwYWRkZWQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHBhZExlZnQodmFsdWU6IHN0cmluZyB8IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsIGNoYXIgPSAnMCcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0ciA9IFN0cmluZyh2YWx1ZSlcbiAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSBsZW5ndGggPyBzdHIgOiAoY2hhci5yZXBlYXQobGVuZ3RoKSArIHN0cikuc2xpY2UoLWxlbmd0aClcbn1cblxuZnVuY3Rpb24gcmFuZG9tSWQoc2l6ZSA9IDgpIHtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSdcbiAgICBsZXQgcmVzdWx0ID0gJydcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc2l6ZTsgaW5kZXgrKykge1xuICAgICAgICByZXN1bHQgKz0gY2hhcmFjdGVycy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcmFjdGVycy5sZW5ndGgpKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogU29ydHMgdGhlIGtleXMgb2YgYW4gb2JqZWN0LCBhbmQgcmVjdXJzaXZlbHkgc29ydHMgdGhlIGtleXMgb2YgYW55IG5lc3RlZCBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fG51bGx9IG9iaiAtIFRoZSBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgdG8gYmUgc29ydGVkLiBJZiB0aGUgaW5wdXQgaXMgbm90IGFuIG9iamVjdCBvciBpcyBudWxsLCBpdCBpcyByZXR1cm5lZCBhcyBpcy5cbiAqIEByZXR1cm5zIHtPYmplY3R8bnVsbH0gVGhlIG5ldyBvYmplY3Qgd2l0aCBzb3J0ZWQga2V5cywgb3IgdGhlIG9yaWdpbmFsIGlucHV0IGlmIGl0IHdhcyBub3QgYW4gb2JqZWN0LlxuICovXG5mdW5jdGlvbiBzb3J0TmVzdGVkT2JqZWN0S2V5cyhvYmopIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShvYmopIHx8IG9iaiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gb2JqXG4gICAgfVxuXG4gICAgY29uc3Qgc29ydGVkS2V5cyA9IE9iamVjdC5rZXlzKG9iaikuc29ydCgpXG5cbiAgICBjb25zdCBzb3J0ZWRPYmogPSB7fVxuICAgIHNvcnRlZEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV1cbiAgICAgICAgc29ydGVkT2JqW2tleV0gPSBzb3J0TmVzdGVkT2JqZWN0S2V5cyh2YWx1ZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHNvcnRlZE9ialxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgd2FpdCBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IC0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgaW52b2NhdGlvbnMgdG8uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMgPSB7dHJhaWxpbmc6IHRydWV9IGFzIHt0cmFpbGluZzogYm9vbGVhbn0pIHtcbiAgICBsZXQgbGFzdENhbGxUaW1lID0gMFxuICAgIGxldCB0aW1lb3V0SWQgPSBudWxsXG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdGhyb3R0bGVkKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCByZW1haW5pbmdUaW1lID0gd2FpdCAtIChub3cgLSBsYXN0Q2FsbFRpbWUpXG5cbiAgICAgICAgaWYgKHJlbWFpbmluZ1RpbWUgPD0gMCkge1xuICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gICAgICAgICAgICAgICAgdGltZW91dElkID0gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdENhbGxUaW1lID0gbm93XG4gICAgICAgICAgICBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXRJZCAmJiBvcHRpb25zLnRyYWlsaW5nKSB7XG4gICAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsYXN0Q2FsbFRpbWUgPSBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgdGltZW91dElkID0gbnVsbFxuICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgICAgIH0sIHJlbWFpbmluZ1RpbWUpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCB7XG4gICAgY2xhc3NlcyxcbiAgICBjb3B5T2JqZWN0LFxuICAgIGZsYXR0ZW5FbnYsXG4gICAgZm9ybWF0Qnl0ZXMsXG4gICAgaGFzaCxcbiAgICBrZXlNb2QsXG4gICAga2V5UGF0aCxcbiAgICBpc09iamVjdCxcbiAgICBtZXJnZURlZXAsXG4gICAgcGFkTGVmdCxcbiAgICByYW5kb21JZCxcbiAgICBzb3J0TmVzdGVkT2JqZWN0S2V5cyxcbiAgICB0aHJvdHRsZSxcbn0iLAogICAgInZhciBuLGwsdSx0LGkscixvLGUsZixjLHMsYSxoLHA9e30seT1bXSx2PS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2ksdz1BcnJheS5pc0FycmF5O2Z1bmN0aW9uIGQobixsKXtmb3IodmFyIHUgaW4gbCluW3VdPWxbdV07cmV0dXJuIG59ZnVuY3Rpb24gZyhuKXtuJiZuLnBhcmVudE5vZGUmJm4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKX1mdW5jdGlvbiBfKGwsdSx0KXt2YXIgaSxyLG8sZT17fTtmb3IobyBpbiB1KVwia2V5XCI9PW8/aT11W29dOlwicmVmXCI9PW8/cj11W29dOmVbb109dVtvXTtpZihhcmd1bWVudHMubGVuZ3RoPjImJihlLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOnQpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGwmJm51bGwhPWwuZGVmYXVsdFByb3BzKWZvcihvIGluIGwuZGVmYXVsdFByb3BzKW51bGw9PWVbb10mJihlW29dPWwuZGVmYXVsdFByb3BzW29dKTtyZXR1cm4gbShsLGUsaSxyLG51bGwpfWZ1bmN0aW9uIG0obix0LGkscixvKXt2YXIgZT17dHlwZTpuLHByb3BzOnQsa2V5OmkscmVmOnIsX19rOm51bGwsX186bnVsbCxfX2I6MCxfX2U6bnVsbCxfX2M6bnVsbCxjb25zdHJ1Y3Rvcjp2b2lkIDAsX192Om51bGw9PW8/Kyt1Om8sX19pOi0xLF9fdTowfTtyZXR1cm4gbnVsbD09byYmbnVsbCE9bC52bm9kZSYmbC52bm9kZShlKSxlfWZ1bmN0aW9uIGIoKXtyZXR1cm57Y3VycmVudDpudWxsfX1mdW5jdGlvbiBrKG4pe3JldHVybiBuLmNoaWxkcmVufWZ1bmN0aW9uIHgobixsKXt0aGlzLnByb3BzPW4sdGhpcy5jb250ZXh0PWx9ZnVuY3Rpb24gUyhuLGwpe2lmKG51bGw9PWwpcmV0dXJuIG4uX18/UyhuLl9fLG4uX19pKzEpOm51bGw7Zm9yKHZhciB1O2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXJldHVybiB1Ll9fZTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuLnR5cGU/UyhuKTpudWxsfWZ1bmN0aW9uIEMobil7dmFyIGwsdTtpZihudWxsIT0obj1uLl9fKSYmbnVsbCE9bi5fX2Mpe2ZvcihuLl9fZT1uLl9fYy5iYXNlPW51bGwsbD0wO2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXtuLl9fZT1uLl9fYy5iYXNlPXUuX19lO2JyZWFrfXJldHVybiBDKG4pfX1mdW5jdGlvbiBNKG4peyghbi5fX2QmJihuLl9fZD0hMCkmJmkucHVzaChuKSYmISQuX19yKyt8fHIhPWwuZGVib3VuY2VSZW5kZXJpbmcpJiYoKHI9bC5kZWJvdW5jZVJlbmRlcmluZyl8fG8pKCQpfWZ1bmN0aW9uICQoKXtmb3IodmFyIG4sdSx0LHIsbyxmLGMscz0xO2kubGVuZ3RoOylpLmxlbmd0aD5zJiZpLnNvcnQoZSksbj1pLnNoaWZ0KCkscz1pLmxlbmd0aCxuLl9fZCYmKHQ9dm9pZCAwLG89KHI9KHU9bikuX192KS5fX2UsZj1bXSxjPVtdLHUuX19QJiYoKHQ9ZCh7fSxyKSkuX192PXIuX192KzEsbC52bm9kZSYmbC52bm9kZSh0KSxPKHUuX19QLHQscix1Ll9fbix1Ll9fUC5uYW1lc3BhY2VVUkksMzImci5fX3U/W29dOm51bGwsZixudWxsPT1vP1Mocik6bywhISgzMiZyLl9fdSksYyksdC5fX3Y9ci5fX3YsdC5fXy5fX2tbdC5fX2ldPXQseihmLHQsYyksdC5fX2UhPW8mJkModCkpKTskLl9fcj0wfWZ1bmN0aW9uIEkobixsLHUsdCxpLHIsbyxlLGYsYyxzKXt2YXIgYSxoLHYsdyxkLGcsXz10JiZ0Ll9fa3x8eSxtPWwubGVuZ3RoO2ZvcihmPVAodSxsLF8sZixtKSxhPTA7YTxtO2ErKyludWxsIT0odj11Ll9fa1thXSkmJihoPS0xPT12Ll9faT9wOl9bdi5fX2ldfHxwLHYuX19pPWEsZz1PKG4sdixoLGkscixvLGUsZixjLHMpLHc9di5fX2Usdi5yZWYmJmgucmVmIT12LnJlZiYmKGgucmVmJiZxKGgucmVmLG51bGwsdikscy5wdXNoKHYucmVmLHYuX19jfHx3LHYpKSxudWxsPT1kJiZudWxsIT13JiYoZD13KSw0JnYuX191fHxoLl9faz09PXYuX19rP2Y9QSh2LGYsbik6XCJmdW5jdGlvblwiPT10eXBlb2Ygdi50eXBlJiZ2b2lkIDAhPT1nP2Y9Zzp3JiYoZj13Lm5leHRTaWJsaW5nKSx2Ll9fdSY9LTcpO3JldHVybiB1Ll9fZT1kLGZ9ZnVuY3Rpb24gUChuLGwsdSx0LGkpe3ZhciByLG8sZSxmLGMscz11Lmxlbmd0aCxhPXMsaD0wO2ZvcihuLl9faz1uZXcgQXJyYXkoaSkscj0wO3I8aTtyKyspbnVsbCE9KG89bFtyXSkmJlwiYm9vbGVhblwiIT10eXBlb2YgbyYmXCJmdW5jdGlvblwiIT10eXBlb2Ygbz8oZj1yK2gsKG89bi5fX2tbcl09XCJzdHJpbmdcIj09dHlwZW9mIG98fFwibnVtYmVyXCI9PXR5cGVvZiBvfHxcImJpZ2ludFwiPT10eXBlb2Ygb3x8by5jb25zdHJ1Y3Rvcj09U3RyaW5nP20obnVsbCxvLG51bGwsbnVsbCxudWxsKTp3KG8pP20oayx7Y2hpbGRyZW46b30sbnVsbCxudWxsLG51bGwpOm51bGw9PW8uY29uc3RydWN0b3ImJm8uX19iPjA/bShvLnR5cGUsby5wcm9wcyxvLmtleSxvLnJlZj9vLnJlZjpudWxsLG8uX192KTpvKS5fXz1uLG8uX19iPW4uX19iKzEsZT1udWxsLC0xIT0oYz1vLl9faT1MKG8sdSxmLGEpKSYmKGEtLSwoZT11W2NdKSYmKGUuX191fD0yKSksbnVsbD09ZXx8bnVsbD09ZS5fX3Y/KC0xPT1jJiYoaT5zP2gtLTppPHMmJmgrKyksXCJmdW5jdGlvblwiIT10eXBlb2Ygby50eXBlJiYoby5fX3V8PTQpKTpjIT1mJiYoYz09Zi0xP2gtLTpjPT1mKzE/aCsrOihjPmY/aC0tOmgrKyxvLl9fdXw9NCkpKTpuLl9fa1tyXT1udWxsO2lmKGEpZm9yKHI9MDtyPHM7cisrKW51bGwhPShlPXVbcl0pJiYwPT0oMiZlLl9fdSkmJihlLl9fZT09dCYmKHQ9UyhlKSksQihlLGUpKTtyZXR1cm4gdH1mdW5jdGlvbiBBKG4sbCx1KXt2YXIgdCxpO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIG4udHlwZSl7Zm9yKHQ9bi5fX2ssaT0wO3QmJmk8dC5sZW5ndGg7aSsrKXRbaV0mJih0W2ldLl9fPW4sbD1BKHRbaV0sbCx1KSk7cmV0dXJuIGx9bi5fX2UhPWwmJihsJiZuLnR5cGUmJiF1LmNvbnRhaW5zKGwpJiYobD1TKG4pKSx1Lmluc2VydEJlZm9yZShuLl9fZSxsfHxudWxsKSxsPW4uX19lKTtkb3tsPWwmJmwubmV4dFNpYmxpbmd9d2hpbGUobnVsbCE9bCYmOD09bC5ub2RlVHlwZSk7cmV0dXJuIGx9ZnVuY3Rpb24gSChuLGwpe3JldHVybiBsPWx8fFtdLG51bGw9PW58fFwiYm9vbGVhblwiPT10eXBlb2Ygbnx8KHcobik/bi5zb21lKGZ1bmN0aW9uKG4pe0gobixsKX0pOmwucHVzaChuKSksbH1mdW5jdGlvbiBMKG4sbCx1LHQpe3ZhciBpLHIsbz1uLmtleSxlPW4udHlwZSxmPWxbdV07aWYobnVsbD09PWYmJm51bGw9PW4ua2V5fHxmJiZvPT1mLmtleSYmZT09Zi50eXBlJiYwPT0oMiZmLl9fdSkpcmV0dXJuIHU7aWYodD4obnVsbCE9ZiYmMD09KDImZi5fX3UpPzE6MCkpZm9yKGk9dS0xLHI9dSsxO2k+PTB8fHI8bC5sZW5ndGg7KXtpZihpPj0wKXtpZigoZj1sW2ldKSYmMD09KDImZi5fX3UpJiZvPT1mLmtleSYmZT09Zi50eXBlKXJldHVybiBpO2ktLX1pZihyPGwubGVuZ3RoKXtpZigoZj1sW3JdKSYmMD09KDImZi5fX3UpJiZvPT1mLmtleSYmZT09Zi50eXBlKXJldHVybiByO3IrK319cmV0dXJuLTF9ZnVuY3Rpb24gVChuLGwsdSl7XCItXCI9PWxbMF0/bi5zZXRQcm9wZXJ0eShsLG51bGw9PXU/XCJcIjp1KTpuW2xdPW51bGw9PXU/XCJcIjpcIm51bWJlclwiIT10eXBlb2YgdXx8di50ZXN0KGwpP3U6dStcInB4XCJ9ZnVuY3Rpb24gaihuLGwsdSx0LGkpe3ZhciByO246aWYoXCJzdHlsZVwiPT1sKWlmKFwic3RyaW5nXCI9PXR5cGVvZiB1KW4uc3R5bGUuY3NzVGV4dD11O2Vsc2V7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQmJihuLnN0eWxlLmNzc1RleHQ9dD1cIlwiKSx0KWZvcihsIGluIHQpdSYmbCBpbiB1fHxUKG4uc3R5bGUsbCxcIlwiKTtpZih1KWZvcihsIGluIHUpdCYmdVtsXT09dFtsXXx8VChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09bFswXSYmXCJuXCI9PWxbMV0pcj1sIT0obD1sLnJlcGxhY2UoZixcIiQxXCIpKSxsPWwudG9Mb3dlckNhc2UoKWluIG58fFwib25Gb2N1c091dFwiPT1sfHxcIm9uRm9jdXNJblwiPT1sP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrcl09dSx1P3Q/dS51PXQudToodS51PWMsbi5hZGRFdmVudExpc3RlbmVyKGwscj9hOnMscikpOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLHI/YTpzLHIpO2Vsc2V7aWYoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPT1pKWw9bC5yZXBsYWNlKC94bGluayhIfDpoKS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJ3aWR0aFwiIT1sJiZcImhlaWdodFwiIT1sJiZcImhyZWZcIiE9bCYmXCJsaXN0XCIhPWwmJlwiZm9ybVwiIT1sJiZcInRhYkluZGV4XCIhPWwmJlwiZG93bmxvYWRcIiE9bCYmXCJyb3dTcGFuXCIhPWwmJlwiY29sU3BhblwiIT1sJiZcInJvbGVcIiE9bCYmXCJwb3BvdmVyXCIhPWwmJmwgaW4gbil0cnl7bltsXT1udWxsPT11P1wiXCI6dTticmVhayBufWNhdGNoKG4pe31cImZ1bmN0aW9uXCI9PXR5cGVvZiB1fHwobnVsbD09dXx8ITE9PT11JiZcIi1cIiE9bFs0XT9uLnJlbW92ZUF0dHJpYnV0ZShsKTpuLnNldEF0dHJpYnV0ZShsLFwicG9wb3ZlclwiPT1sJiYxPT11P1wiXCI6dSkpfX1mdW5jdGlvbiBGKG4pe3JldHVybiBmdW5jdGlvbih1KXtpZih0aGlzLmwpe3ZhciB0PXRoaXMubFt1LnR5cGUrbl07aWYobnVsbD09dS50KXUudD1jKys7ZWxzZSBpZih1LnQ8dC51KXJldHVybjtyZXR1cm4gdChsLmV2ZW50P2wuZXZlbnQodSk6dSl9fX1mdW5jdGlvbiBPKG4sdSx0LGkscixvLGUsZixjLHMpe3ZhciBhLGgscCx5LHYsXyxtLGIsUyxDLE0sJCxQLEEsSCxMLFQsaj11LnR5cGU7aWYobnVsbCE9dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDsxMjgmdC5fX3UmJihjPSEhKDMyJnQuX191KSxvPVtmPXUuX19lPXQuX19lXSksKGE9bC5fX2IpJiZhKHUpO246aWYoXCJmdW5jdGlvblwiPT10eXBlb2Ygail0cnl7aWYoYj11LnByb3BzLFM9XCJwcm90b3R5cGVcImluIGomJmoucHJvdG90eXBlLnJlbmRlcixDPShhPWouY29udGV4dFR5cGUpJiZpW2EuX19jXSxNPWE/Qz9DLnByb3BzLnZhbHVlOmEuX186aSx0Ll9fYz9tPShoPXUuX19jPXQuX19jKS5fXz1oLl9fRTooUz91Ll9fYz1oPW5ldyBqKGIsTSk6KHUuX19jPWg9bmV3IHgoYixNKSxoLmNvbnN0cnVjdG9yPWosaC5yZW5kZXI9RCksQyYmQy5zdWIoaCksaC5wcm9wcz1iLGguc3RhdGV8fChoLnN0YXRlPXt9KSxoLmNvbnRleHQ9TSxoLl9fbj1pLHA9aC5fX2Q9ITAsaC5fX2g9W10saC5fc2I9W10pLFMmJm51bGw9PWguX19zJiYoaC5fX3M9aC5zdGF0ZSksUyYmbnVsbCE9ai5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJihoLl9fcz09aC5zdGF0ZSYmKGguX19zPWQoe30saC5fX3MpKSxkKGguX19zLGouZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKGIsaC5fX3MpKSkseT1oLnByb3BzLHY9aC5zdGF0ZSxoLl9fdj11LHApUyYmbnVsbD09ai5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPWguY29tcG9uZW50V2lsbE1vdW50JiZoLmNvbXBvbmVudFdpbGxNb3VudCgpLFMmJm51bGwhPWguY29tcG9uZW50RGlkTW91bnQmJmguX19oLnB1c2goaC5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihTJiZudWxsPT1qLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmYiE9PXkmJm51bGwhPWguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKGIsTSksIWguX19lJiZudWxsIT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZShiLGguX19zLE0pfHx1Ll9fdj09dC5fX3Ype2Zvcih1Ll9fdiE9dC5fX3YmJihoLnByb3BzPWIsaC5zdGF0ZT1oLl9fcyxoLl9fZD0hMSksdS5fX2U9dC5fX2UsdS5fX2s9dC5fX2ssdS5fX2suc29tZShmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLCQ9MDskPGguX3NiLmxlbmd0aDskKyspaC5fX2gucHVzaChoLl9zYlskXSk7aC5fc2I9W10saC5fX2gubGVuZ3RoJiZlLnB1c2goaCk7YnJlYWsgbn1udWxsIT1oLmNvbXBvbmVudFdpbGxVcGRhdGUmJmguY29tcG9uZW50V2lsbFVwZGF0ZShiLGguX19zLE0pLFMmJm51bGwhPWguY29tcG9uZW50RGlkVXBkYXRlJiZoLl9faC5wdXNoKGZ1bmN0aW9uKCl7aC5jb21wb25lbnREaWRVcGRhdGUoeSx2LF8pfSl9aWYoaC5jb250ZXh0PU0saC5wcm9wcz1iLGguX19QPW4saC5fX2U9ITEsUD1sLl9fcixBPTAsUyl7Zm9yKGguc3RhdGU9aC5fX3MsaC5fX2Q9ITEsUCYmUCh1KSxhPWgucmVuZGVyKGgucHJvcHMsaC5zdGF0ZSxoLmNvbnRleHQpLEg9MDtIPGguX3NiLmxlbmd0aDtIKyspaC5fX2gucHVzaChoLl9zYltIXSk7aC5fc2I9W119ZWxzZSBkb3toLl9fZD0hMSxQJiZQKHUpLGE9aC5yZW5kZXIoaC5wcm9wcyxoLnN0YXRlLGguY29udGV4dCksaC5zdGF0ZT1oLl9fc313aGlsZShoLl9fZCYmKytBPDI1KTtoLnN0YXRlPWguX19zLG51bGwhPWguZ2V0Q2hpbGRDb250ZXh0JiYoaT1kKGQoe30saSksaC5nZXRDaGlsZENvbnRleHQoKSkpLFMmJiFwJiZudWxsIT1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlJiYoXz1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlKHksdikpLEw9YSxudWxsIT1hJiZhLnR5cGU9PT1rJiZudWxsPT1hLmtleSYmKEw9TihhLnByb3BzLmNoaWxkcmVuKSksZj1JKG4sdyhMKT9MOltMXSx1LHQsaSxyLG8sZSxmLGMscyksaC5iYXNlPXUuX19lLHUuX191Jj0tMTYxLGguX19oLmxlbmd0aCYmZS5wdXNoKGgpLG0mJihoLl9fRT1oLl9fPW51bGwpfWNhdGNoKG4pe2lmKHUuX192PW51bGwsY3x8bnVsbCE9bylpZihuLnRoZW4pe2Zvcih1Ll9fdXw9Yz8xNjA6MTI4O2YmJjg9PWYubm9kZVR5cGUmJmYubmV4dFNpYmxpbmc7KWY9Zi5uZXh0U2libGluZztvW28uaW5kZXhPZihmKV09bnVsbCx1Ll9fZT1mfWVsc2UgZm9yKFQ9by5sZW5ndGg7VC0tOylnKG9bVF0pO2Vsc2UgdS5fX2U9dC5fX2UsdS5fX2s9dC5fX2s7bC5fX2Uobix1LHQpfWVsc2UgbnVsbD09byYmdS5fX3Y9PXQuX192Pyh1Ll9faz10Ll9fayx1Ll9fZT10Ll9fZSk6Zj11Ll9fZT1WKHQuX19lLHUsdCxpLHIsbyxlLGMscyk7cmV0dXJuKGE9bC5kaWZmZWQpJiZhKHUpLDEyOCZ1Ll9fdT92b2lkIDA6Zn1mdW5jdGlvbiB6KG4sdSx0KXtmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKylxKHRbaV0sdFsrK2ldLHRbKytpXSk7bC5fX2MmJmwuX19jKHUsbiksbi5zb21lKGZ1bmN0aW9uKHUpe3RyeXtuPXUuX19oLHUuX19oPVtdLG4uc29tZShmdW5jdGlvbihuKXtuLmNhbGwodSl9KX1jYXRjaChuKXtsLl9fZShuLHUuX192KX19KX1mdW5jdGlvbiBOKG4pe3JldHVyblwib2JqZWN0XCIhPXR5cGVvZiBufHxudWxsPT1ufHxuLl9fYiYmbi5fX2I+MD9uOncobik/bi5tYXAoTik6ZCh7fSxuKX1mdW5jdGlvbiBWKHUsdCxpLHIsbyxlLGYsYyxzKXt2YXIgYSxoLHksdixkLF8sbSxiPWkucHJvcHMsaz10LnByb3BzLHg9dC50eXBlO2lmKFwic3ZnXCI9PXg/bz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI6XCJtYXRoXCI9PXg/bz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUxcIjpvfHwobz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiksbnVsbCE9ZSlmb3IoYT0wO2E8ZS5sZW5ndGg7YSsrKWlmKChkPWVbYV0pJiZcInNldEF0dHJpYnV0ZVwiaW4gZD09ISF4JiYoeD9kLmxvY2FsTmFtZT09eDozPT1kLm5vZGVUeXBlKSl7dT1kLGVbYV09bnVsbDticmVha31pZihudWxsPT11KXtpZihudWxsPT14KXJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShrKTt1PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhvLHgsay5pcyYmayksYyYmKGwuX19tJiZsLl9fbSh0LGUpLGM9ITEpLGU9bnVsbH1pZihudWxsPT14KWI9PT1rfHxjJiZ1LmRhdGE9PWt8fCh1LmRhdGE9ayk7ZWxzZXtpZihlPWUmJm4uY2FsbCh1LmNoaWxkTm9kZXMpLGI9aS5wcm9wc3x8cCwhYyYmbnVsbCE9ZSlmb3IoYj17fSxhPTA7YTx1LmF0dHJpYnV0ZXMubGVuZ3RoO2ErKyliWyhkPXUuYXR0cmlidXRlc1thXSkubmFtZV09ZC52YWx1ZTtmb3IoYSBpbiBiKWlmKGQ9YlthXSxcImNoaWxkcmVuXCI9PWEpO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiPT1hKXk9ZDtlbHNlIGlmKCEoYSBpbiBrKSl7aWYoXCJ2YWx1ZVwiPT1hJiZcImRlZmF1bHRWYWx1ZVwiaW4ga3x8XCJjaGVja2VkXCI9PWEmJlwiZGVmYXVsdENoZWNrZWRcImluIGspY29udGludWU7aih1LGEsbnVsbCxkLG8pfWZvcihhIGluIGspZD1rW2FdLFwiY2hpbGRyZW5cIj09YT92PWQ6XCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiPT1hP2g9ZDpcInZhbHVlXCI9PWE/Xz1kOlwiY2hlY2tlZFwiPT1hP209ZDpjJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBkfHxiW2FdPT09ZHx8aih1LGEsZCxiW2FdLG8pO2lmKGgpY3x8eSYmKGguX19odG1sPT15Ll9faHRtbHx8aC5fX2h0bWw9PXUuaW5uZXJIVE1MKXx8KHUuaW5uZXJIVE1MPWguX19odG1sKSx0Ll9faz1bXTtlbHNlIGlmKHkmJih1LmlubmVySFRNTD1cIlwiKSxJKFwidGVtcGxhdGVcIj09dC50eXBlP3UuY29udGVudDp1LHcodik/djpbdl0sdCxpLHIsXCJmb3JlaWduT2JqZWN0XCI9PXg/XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI6byxlLGYsZT9lWzBdOmkuX19rJiZTKGksMCksYyxzKSxudWxsIT1lKWZvcihhPWUubGVuZ3RoO2EtLTspZyhlW2FdKTtjfHwoYT1cInZhbHVlXCIsXCJwcm9ncmVzc1wiPT14JiZudWxsPT1fP3UucmVtb3ZlQXR0cmlidXRlKFwidmFsdWVcIik6bnVsbCE9XyYmKF8hPT11W2FdfHxcInByb2dyZXNzXCI9PXgmJiFffHxcIm9wdGlvblwiPT14JiZfIT1iW2FdKSYmaih1LGEsXyxiW2FdLG8pLGE9XCJjaGVja2VkXCIsbnVsbCE9bSYmbSE9dVthXSYmaih1LGEsbSxiW2FdLG8pKX1yZXR1cm4gdX1mdW5jdGlvbiBxKG4sdSx0KXt0cnl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2Ygbil7dmFyIGk9XCJmdW5jdGlvblwiPT10eXBlb2Ygbi5fX3U7aSYmbi5fX3UoKSxpJiZudWxsPT11fHwobi5fX3U9bih1KSl9ZWxzZSBuLmN1cnJlbnQ9dX1jYXRjaChuKXtsLl9fZShuLHQpfX1mdW5jdGlvbiBCKG4sdSx0KXt2YXIgaSxyO2lmKGwudW5tb3VudCYmbC51bm1vdW50KG4pLChpPW4ucmVmKSYmKGkuY3VycmVudCYmaS5jdXJyZW50IT1uLl9fZXx8cShpLG51bGwsdSkpLG51bGwhPShpPW4uX19jKSl7aWYoaS5jb21wb25lbnRXaWxsVW5tb3VudCl0cnl7aS5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKG4pe2wuX19lKG4sdSl9aS5iYXNlPWkuX19QPW51bGx9aWYoaT1uLl9faylmb3Iocj0wO3I8aS5sZW5ndGg7cisrKWlbcl0mJkIoaVtyXSx1LHR8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4udHlwZSk7dHx8ZyhuLl9fZSksbi5fX2M9bi5fXz1uLl9fZT12b2lkIDB9ZnVuY3Rpb24gRChuLGwsdSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3Iobix1KX1mdW5jdGlvbiBFKHUsdCxpKXt2YXIgcixvLGUsZjt0PT1kb2N1bWVudCYmKHQ9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSxsLl9fJiZsLl9fKHUsdCksbz0ocj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpKT9udWxsOmkmJmkuX19rfHx0Ll9fayxlPVtdLGY9W10sTyh0LHU9KCFyJiZpfHx0KS5fX2s9XyhrLG51bGwsW3VdKSxvfHxwLHAsdC5uYW1lc3BhY2VVUkksIXImJmk/W2ldOm8/bnVsbDp0LmZpcnN0Q2hpbGQ/bi5jYWxsKHQuY2hpbGROb2Rlcyk6bnVsbCxlLCFyJiZpP2k6bz9vLl9fZTp0LmZpcnN0Q2hpbGQscixmKSx6KGUsdSxmKX1mdW5jdGlvbiBHKG4sbCl7RShuLGwsRyl9ZnVuY3Rpb24gSihsLHUsdCl7dmFyIGkscixvLGUsZj1kKHt9LGwucHJvcHMpO2ZvcihvIGluIGwudHlwZSYmbC50eXBlLmRlZmF1bHRQcm9wcyYmKGU9bC50eXBlLmRlZmF1bHRQcm9wcyksdSlcImtleVwiPT1vP2k9dVtvXTpcInJlZlwiPT1vP3I9dVtvXTpmW29dPW51bGw9PXVbb10mJm51bGwhPWU/ZVtvXTp1W29dO3JldHVybiBhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOnQpLG0obC50eXBlLGYsaXx8bC5rZXkscnx8bC5yZWYsbnVsbCl9ZnVuY3Rpb24gSyhuKXtmdW5jdGlvbiBsKG4pe3ZhciB1LHQ7cmV0dXJuIHRoaXMuZ2V0Q2hpbGRDb250ZXh0fHwodT1uZXcgU2V0LCh0PXt9KVtsLl9fY109dGhpcyx0aGlzLmdldENoaWxkQ29udGV4dD1mdW5jdGlvbigpe3JldHVybiB0fSx0aGlzLmNvbXBvbmVudFdpbGxVbm1vdW50PWZ1bmN0aW9uKCl7dT1udWxsfSx0aGlzLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLnByb3BzLnZhbHVlIT1uLnZhbHVlJiZ1LmZvckVhY2goZnVuY3Rpb24obil7bi5fX2U9ITAsTShuKX0pfSx0aGlzLnN1Yj1mdW5jdGlvbihuKXt1LmFkZChuKTt2YXIgbD1uLmNvbXBvbmVudFdpbGxVbm1vdW50O24uY29tcG9uZW50V2lsbFVubW91bnQ9ZnVuY3Rpb24oKXt1JiZ1LmRlbGV0ZShuKSxsJiZsLmNhbGwobil9fSksbi5jaGlsZHJlbn1yZXR1cm4gbC5fX2M9XCJfX2NDXCIraCsrLGwuX189bixsLlByb3ZpZGVyPWwuX19sPShsLkNvbnN1bWVyPWZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uY2hpbGRyZW4obCl9KS5jb250ZXh0VHlwZT1sLGx9bj15LnNsaWNlLGw9e19fZTpmdW5jdGlvbihuLGwsdSx0KXtmb3IodmFyIGkscixvO2w9bC5fXzspaWYoKGk9bC5fX2MpJiYhaS5fXyl0cnl7aWYoKHI9aS5jb25zdHJ1Y3RvcikmJm51bGwhPXIuZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yJiYoaS5zZXRTdGF0ZShyLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihuKSksbz1pLl9fZCksbnVsbCE9aS5jb21wb25lbnREaWRDYXRjaCYmKGkuY29tcG9uZW50RGlkQ2F0Y2gobix0fHx7fSksbz1pLl9fZCksbylyZXR1cm4gaS5fX0U9aX1jYXRjaChsKXtuPWx9dGhyb3cgbn19LHU9MCx0PWZ1bmN0aW9uKG4pe3JldHVybiBudWxsIT1uJiZudWxsPT1uLmNvbnN0cnVjdG9yfSx4LnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihuLGwpe3ZhciB1O3U9bnVsbCE9dGhpcy5fX3MmJnRoaXMuX19zIT10aGlzLnN0YXRlP3RoaXMuX19zOnRoaXMuX19zPWQoe30sdGhpcy5zdGF0ZSksXCJmdW5jdGlvblwiPT10eXBlb2YgbiYmKG49bihkKHt9LHUpLHRoaXMucHJvcHMpKSxuJiZkKHUsbiksbnVsbCE9biYmdGhpcy5fX3YmJihsJiZ0aGlzLl9zYi5wdXNoKGwpLE0odGhpcykpfSx4LnByb3RvdHlwZS5mb3JjZVVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLl9fdiYmKHRoaXMuX19lPSEwLG4mJnRoaXMuX19oLnB1c2gobiksTSh0aGlzKSl9LHgucHJvdG90eXBlLnJlbmRlcj1rLGk9W10sbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm9taXNlP1Byb21pc2UucHJvdG90eXBlLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSk6c2V0VGltZW91dCxlPWZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uX192Ll9fYi1sLl9fdi5fX2J9LCQuX19yPTAsZj0vKFBvaW50ZXJDYXB0dXJlKSR8Q2FwdHVyZSQvaSxjPTAscz1GKCExKSxhPUYoITApLGg9MDtleHBvcnR7eCBhcyBDb21wb25lbnQsayBhcyBGcmFnbWVudCxKIGFzIGNsb25lRWxlbWVudCxLIGFzIGNyZWF0ZUNvbnRleHQsXyBhcyBjcmVhdGVFbGVtZW50LGIgYXMgY3JlYXRlUmVmLF8gYXMgaCxHIGFzIGh5ZHJhdGUsdCBhcyBpc1ZhbGlkRWxlbWVudCxsIGFzIG9wdGlvbnMsRSBhcyByZW5kZXIsSCBhcyB0b0NoaWxkQXJyYXl9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0Lm1vZHVsZS5qcy5tYXBcbiIsCiAgICAiaW1wb3J0e29wdGlvbnMgYXMgbn1mcm9tXCJwcmVhY3RcIjt2YXIgdCxyLHUsaSxvPTAsZj1bXSxjPW4sZT1jLl9fYixhPWMuX19yLHY9Yy5kaWZmZWQsbD1jLl9fYyxtPWMudW5tb3VudCxzPWMuX187ZnVuY3Rpb24gcChuLHQpe2MuX19oJiZjLl9faChyLG4sb3x8dCksbz0wO3ZhciB1PXIuX19IfHwoci5fX0g9e19fOltdLF9faDpbXX0pO3JldHVybiBuPj11Ll9fLmxlbmd0aCYmdS5fXy5wdXNoKHt9KSx1Ll9fW25dfWZ1bmN0aW9uIGQobil7cmV0dXJuIG89MSxoKEQsbil9ZnVuY3Rpb24gaChuLHUsaSl7dmFyIG89cCh0KyssMik7aWYoby50PW4sIW8uX19jJiYoby5fXz1baT9pKHUpOkQodm9pZCAwLHUpLGZ1bmN0aW9uKG4pe3ZhciB0PW8uX19OP28uX19OWzBdOm8uX19bMF0scj1vLnQodCxuKTt0IT09ciYmKG8uX19OPVtyLG8uX19bMV1dLG8uX19jLnNldFN0YXRlKHt9KSl9XSxvLl9fYz1yLCFyLl9fZikpe3ZhciBmPWZ1bmN0aW9uKG4sdCxyKXtpZighby5fX2MuX19IKXJldHVybiEwO3ZhciB1PW8uX19jLl9fSC5fXy5maWx0ZXIoZnVuY3Rpb24obil7cmV0dXJuISFuLl9fY30pO2lmKHUuZXZlcnkoZnVuY3Rpb24obil7cmV0dXJuIW4uX19OfSkpcmV0dXJuIWN8fGMuY2FsbCh0aGlzLG4sdCxyKTt2YXIgaT1vLl9fYy5wcm9wcyE9PW47cmV0dXJuIHUuZm9yRWFjaChmdW5jdGlvbihuKXtpZihuLl9fTil7dmFyIHQ9bi5fX1swXTtuLl9fPW4uX19OLG4uX19OPXZvaWQgMCx0IT09bi5fX1swXSYmKGk9ITApfX0pLGMmJmMuY2FsbCh0aGlzLG4sdCxyKXx8aX07ci5fX2Y9ITA7dmFyIGM9ci5zaG91bGRDb21wb25lbnRVcGRhdGUsZT1yLmNvbXBvbmVudFdpbGxVcGRhdGU7ci5jb21wb25lbnRXaWxsVXBkYXRlPWZ1bmN0aW9uKG4sdCxyKXtpZih0aGlzLl9fZSl7dmFyIHU9YztjPXZvaWQgMCxmKG4sdCxyKSxjPXV9ZSYmZS5jYWxsKHRoaXMsbix0LHIpfSxyLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mfXJldHVybiBvLl9fTnx8by5fX31mdW5jdGlvbiB5KG4sdSl7dmFyIGk9cCh0KyssMyk7IWMuX19zJiZDKGkuX19ILHUpJiYoaS5fXz1uLGkudT11LHIuX19ILl9faC5wdXNoKGkpKX1mdW5jdGlvbiBfKG4sdSl7dmFyIGk9cCh0KyssNCk7IWMuX19zJiZDKGkuX19ILHUpJiYoaS5fXz1uLGkudT11LHIuX19oLnB1c2goaSkpfWZ1bmN0aW9uIEEobil7cmV0dXJuIG89NSxUKGZ1bmN0aW9uKCl7cmV0dXJue2N1cnJlbnQ6bn19LFtdKX1mdW5jdGlvbiBGKG4sdCxyKXtvPTYsXyhmdW5jdGlvbigpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIG4pe3ZhciByPW4odCgpKTtyZXR1cm4gZnVuY3Rpb24oKXtuKG51bGwpLHImJlwiZnVuY3Rpb25cIj09dHlwZW9mIHImJnIoKX19aWYobilyZXR1cm4gbi5jdXJyZW50PXQoKSxmdW5jdGlvbigpe3JldHVybiBuLmN1cnJlbnQ9bnVsbH19LG51bGw9PXI/cjpyLmNvbmNhdChuKSl9ZnVuY3Rpb24gVChuLHIpe3ZhciB1PXAodCsrLDcpO3JldHVybiBDKHUuX19ILHIpJiYodS5fXz1uKCksdS5fX0g9cix1Ll9faD1uKSx1Ll9ffWZ1bmN0aW9uIHEobix0KXtyZXR1cm4gbz04LFQoZnVuY3Rpb24oKXtyZXR1cm4gbn0sdCl9ZnVuY3Rpb24geChuKXt2YXIgdT1yLmNvbnRleHRbbi5fX2NdLGk9cCh0KyssOSk7cmV0dXJuIGkuYz1uLHU/KG51bGw9PWkuX18mJihpLl9fPSEwLHUuc3ViKHIpKSx1LnByb3BzLnZhbHVlKTpuLl9ffWZ1bmN0aW9uIFAobix0KXtjLnVzZURlYnVnVmFsdWUmJmMudXNlRGVidWdWYWx1ZSh0P3Qobik6bil9ZnVuY3Rpb24gYihuKXt2YXIgdT1wKHQrKywxMCksaT1kKCk7cmV0dXJuIHUuX189bixyLmNvbXBvbmVudERpZENhdGNofHwoci5jb21wb25lbnREaWRDYXRjaD1mdW5jdGlvbihuLHQpe3UuX18mJnUuX18obix0KSxpWzFdKG4pfSksW2lbMF0sZnVuY3Rpb24oKXtpWzFdKHZvaWQgMCl9XX1mdW5jdGlvbiBnKCl7dmFyIG49cCh0KyssMTEpO2lmKCFuLl9fKXtmb3IodmFyIHU9ci5fX3Y7bnVsbCE9PXUmJiF1Ll9fbSYmbnVsbCE9PXUuX187KXU9dS5fXzt2YXIgaT11Ll9fbXx8KHUuX19tPVswLDBdKTtuLl9fPVwiUFwiK2lbMF0rXCItXCIraVsxXSsrfXJldHVybiBuLl9ffWZ1bmN0aW9uIGooKXtmb3IodmFyIG47bj1mLnNoaWZ0KCk7KWlmKG4uX19QJiZuLl9fSCl0cnl7bi5fX0guX19oLmZvckVhY2goeiksbi5fX0guX19oLmZvckVhY2goQiksbi5fX0guX19oPVtdfWNhdGNoKHQpe24uX19ILl9faD1bXSxjLl9fZSh0LG4uX192KX19Yy5fX2I9ZnVuY3Rpb24obil7cj1udWxsLGUmJmUobil9LGMuX189ZnVuY3Rpb24obix0KXtuJiZ0Ll9fayYmdC5fX2suX19tJiYobi5fX209dC5fX2suX19tKSxzJiZzKG4sdCl9LGMuX19yPWZ1bmN0aW9uKG4pe2EmJmEobiksdD0wO3ZhciBpPShyPW4uX19jKS5fX0g7aSYmKHU9PT1yPyhpLl9faD1bXSxyLl9faD1bXSxpLl9fLmZvckVhY2goZnVuY3Rpb24obil7bi5fX04mJihuLl9fPW4uX19OKSxuLnU9bi5fX049dm9pZCAwfSkpOihpLl9faC5mb3JFYWNoKHopLGkuX19oLmZvckVhY2goQiksaS5fX2g9W10sdD0wKSksdT1yfSxjLmRpZmZlZD1mdW5jdGlvbihuKXt2JiZ2KG4pO3ZhciB0PW4uX19jO3QmJnQuX19IJiYodC5fX0guX19oLmxlbmd0aCYmKDEhPT1mLnB1c2godCkmJmk9PT1jLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8KChpPWMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKXx8dykoaikpLHQuX19ILl9fLmZvckVhY2goZnVuY3Rpb24obil7bi51JiYobi5fX0g9bi51KSxuLnU9dm9pZCAwfSkpLHU9cj1udWxsfSxjLl9fYz1mdW5jdGlvbihuLHQpe3Quc29tZShmdW5jdGlvbihuKXt0cnl7bi5fX2guZm9yRWFjaCh6KSxuLl9faD1uLl9faC5maWx0ZXIoZnVuY3Rpb24obil7cmV0dXJuIW4uX198fEIobil9KX1jYXRjaChyKXt0LnNvbWUoZnVuY3Rpb24obil7bi5fX2gmJihuLl9faD1bXSl9KSx0PVtdLGMuX19lKHIsbi5fX3YpfX0pLGwmJmwobix0KX0sYy51bm1vdW50PWZ1bmN0aW9uKG4pe20mJm0obik7dmFyIHQscj1uLl9fYztyJiZyLl9fSCYmKHIuX19ILl9fLmZvckVhY2goZnVuY3Rpb24obil7dHJ5e3oobil9Y2F0Y2gobil7dD1ufX0pLHIuX19IPXZvaWQgMCx0JiZjLl9fZSh0LHIuX192KSl9O3ZhciBrPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZTtmdW5jdGlvbiB3KG4pe3ZhciB0LHI9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodSksayYmY2FuY2VsQW5pbWF0aW9uRnJhbWUodCksc2V0VGltZW91dChuKX0sdT1zZXRUaW1lb3V0KHIsMTAwKTtrJiYodD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocikpfWZ1bmN0aW9uIHoobil7dmFyIHQ9cix1PW4uX19jO1wiZnVuY3Rpb25cIj09dHlwZW9mIHUmJihuLl9fYz12b2lkIDAsdSgpKSxyPXR9ZnVuY3Rpb24gQihuKXt2YXIgdD1yO24uX19jPW4uX18oKSxyPXR9ZnVuY3Rpb24gQyhuLHQpe3JldHVybiFufHxuLmxlbmd0aCE9PXQubGVuZ3RofHx0LnNvbWUoZnVuY3Rpb24odCxyKXtyZXR1cm4gdCE9PW5bcl19KX1mdW5jdGlvbiBEKG4sdCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdD90KG4pOnR9ZXhwb3J0e3EgYXMgdXNlQ2FsbGJhY2sseCBhcyB1c2VDb250ZXh0LFAgYXMgdXNlRGVidWdWYWx1ZSx5IGFzIHVzZUVmZmVjdCxiIGFzIHVzZUVycm9yQm91bmRhcnksZyBhcyB1c2VJZCxGIGFzIHVzZUltcGVyYXRpdmVIYW5kbGUsXyBhcyB1c2VMYXlvdXRFZmZlY3QsVCBhcyB1c2VNZW1vLGggYXMgdXNlUmVkdWNlcixBIGFzIHVzZVJlZixkIGFzIHVzZVN0YXRlfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhvb2tzLm1vZHVsZS5qcy5tYXBcbiIsCiAgICAidmFyIGk9U3ltYm9sLmZvcihcInByZWFjdC1zaWduYWxzXCIpO2Z1bmN0aW9uIHQoKXtpZighKHM+MSkpe3ZhciBpLHQ9ITE7d2hpbGUodm9pZCAwIT09aCl7dmFyIHI9aDtoPXZvaWQgMDtmKys7d2hpbGUodm9pZCAwIT09cil7dmFyIG89ci5vO3Iubz12b2lkIDA7ci5mJj0tMztpZighKDgmci5mKSYmYyhyKSl0cnl7ci5jKCl9Y2F0Y2gocil7aWYoIXQpe2k9cjt0PSEwfX1yPW99fWY9MDtzLS07aWYodCl0aHJvdyBpfWVsc2Ugcy0tfWZ1bmN0aW9uIHIoaSl7aWYocz4wKXJldHVybiBpKCk7cysrO3RyeXtyZXR1cm4gaSgpfWZpbmFsbHl7dCgpfX12YXIgbz12b2lkIDA7ZnVuY3Rpb24gbihpKXt2YXIgdD1vO289dm9pZCAwO3RyeXtyZXR1cm4gaSgpfWZpbmFsbHl7bz10fX12YXIgaD12b2lkIDAscz0wLGY9MCx2PTA7ZnVuY3Rpb24gZShpKXtpZih2b2lkIDAhPT1vKXt2YXIgdD1pLm47aWYodm9pZCAwPT09dHx8dC50IT09byl7dD17aTowLFM6aSxwOm8ucyxuOnZvaWQgMCx0Om8sZTp2b2lkIDAseDp2b2lkIDAscjp0fTtpZih2b2lkIDAhPT1vLnMpby5zLm49dDtvLnM9dDtpLm49dDtpZigzMiZvLmYpaS5TKHQpO3JldHVybiB0fWVsc2UgaWYoLTE9PT10Lmkpe3QuaT0wO2lmKHZvaWQgMCE9PXQubil7dC5uLnA9dC5wO2lmKHZvaWQgMCE9PXQucCl0LnAubj10Lm47dC5wPW8uczt0Lm49dm9pZCAwO28ucy5uPXQ7by5zPXR9cmV0dXJuIHR9fX1mdW5jdGlvbiB1KGkpe3RoaXMudj1pO3RoaXMuaT0wO3RoaXMubj12b2lkIDA7dGhpcy50PXZvaWQgMH11LnByb3RvdHlwZS5icmFuZD1pO3UucHJvdG90eXBlLmg9ZnVuY3Rpb24oKXtyZXR1cm4hMH07dS5wcm90b3R5cGUuUz1mdW5jdGlvbihpKXtpZih0aGlzLnQhPT1pJiZ2b2lkIDA9PT1pLmUpe2kueD10aGlzLnQ7aWYodm9pZCAwIT09dGhpcy50KXRoaXMudC5lPWk7dGhpcy50PWl9fTt1LnByb3RvdHlwZS5VPWZ1bmN0aW9uKGkpe2lmKHZvaWQgMCE9PXRoaXMudCl7dmFyIHQ9aS5lLHI9aS54O2lmKHZvaWQgMCE9PXQpe3QueD1yO2kuZT12b2lkIDB9aWYodm9pZCAwIT09cil7ci5lPXQ7aS54PXZvaWQgMH1pZihpPT09dGhpcy50KXRoaXMudD1yfX07dS5wcm90b3R5cGUuc3Vic2NyaWJlPWZ1bmN0aW9uKGkpe3ZhciB0PXRoaXM7cmV0dXJuIEUoZnVuY3Rpb24oKXt2YXIgcj10LnZhbHVlLG49bztvPXZvaWQgMDt0cnl7aShyKX1maW5hbGx5e289bn19KX07dS5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTt1LnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlK1wiXCJ9O3UucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTt1LnByb3RvdHlwZS5wZWVrPWZ1bmN0aW9uKCl7dmFyIGk9bztvPXZvaWQgMDt0cnl7cmV0dXJuIHRoaXMudmFsdWV9ZmluYWxseXtvPWl9fTtPYmplY3QuZGVmaW5lUHJvcGVydHkodS5wcm90b3R5cGUsXCJ2YWx1ZVwiLHtnZXQ6ZnVuY3Rpb24oKXt2YXIgaT1lKHRoaXMpO2lmKHZvaWQgMCE9PWkpaS5pPXRoaXMuaTtyZXR1cm4gdGhpcy52fSxzZXQ6ZnVuY3Rpb24oaSl7aWYoaSE9PXRoaXMudil7aWYoZj4xMDApdGhyb3cgbmV3IEVycm9yKFwiQ3ljbGUgZGV0ZWN0ZWRcIik7dGhpcy52PWk7dGhpcy5pKys7disrO3MrKzt0cnl7Zm9yKHZhciByPXRoaXMudDt2b2lkIDAhPT1yO3I9ci54KXIudC5OKCl9ZmluYWxseXt0KCl9fX19KTtmdW5jdGlvbiBkKGkpe3JldHVybiBuZXcgdShpKX1mdW5jdGlvbiBjKGkpe2Zvcih2YXIgdD1pLnM7dm9pZCAwIT09dDt0PXQubilpZih0LlMuaSE9PXQuaXx8IXQuUy5oKCl8fHQuUy5pIT09dC5pKXJldHVybiEwO3JldHVybiExfWZ1bmN0aW9uIGEoaSl7Zm9yKHZhciB0PWkuczt2b2lkIDAhPT10O3Q9dC5uKXt2YXIgcj10LlMubjtpZih2b2lkIDAhPT1yKXQucj1yO3QuUy5uPXQ7dC5pPS0xO2lmKHZvaWQgMD09PXQubil7aS5zPXQ7YnJlYWt9fX1mdW5jdGlvbiBsKGkpe3ZhciB0PWkucyxyPXZvaWQgMDt3aGlsZSh2b2lkIDAhPT10KXt2YXIgbz10LnA7aWYoLTE9PT10Lmkpe3QuUy5VKHQpO2lmKHZvaWQgMCE9PW8pby5uPXQubjtpZih2b2lkIDAhPT10Lm4pdC5uLnA9b31lbHNlIHI9dDt0LlMubj10LnI7aWYodm9pZCAwIT09dC5yKXQucj12b2lkIDA7dD1vfWkucz1yfWZ1bmN0aW9uIHkoaSl7dS5jYWxsKHRoaXMsdm9pZCAwKTt0aGlzLng9aTt0aGlzLnM9dm9pZCAwO3RoaXMuZz12LTE7dGhpcy5mPTR9KHkucHJvdG90eXBlPW5ldyB1KS5oPWZ1bmN0aW9uKCl7dGhpcy5mJj0tMztpZigxJnRoaXMuZilyZXR1cm4hMTtpZigzMj09KDM2JnRoaXMuZikpcmV0dXJuITA7dGhpcy5mJj0tNTtpZih0aGlzLmc9PT12KXJldHVybiEwO3RoaXMuZz12O3RoaXMuZnw9MTtpZih0aGlzLmk+MCYmIWModGhpcykpe3RoaXMuZiY9LTI7cmV0dXJuITB9dmFyIGk9bzt0cnl7YSh0aGlzKTtvPXRoaXM7dmFyIHQ9dGhpcy54KCk7aWYoMTYmdGhpcy5mfHx0aGlzLnYhPT10fHwwPT09dGhpcy5pKXt0aGlzLnY9dDt0aGlzLmYmPS0xNzt0aGlzLmkrK319Y2F0Y2goaSl7dGhpcy52PWk7dGhpcy5mfD0xNjt0aGlzLmkrK31vPWk7bCh0aGlzKTt0aGlzLmYmPS0yO3JldHVybiEwfTt5LnByb3RvdHlwZS5TPWZ1bmN0aW9uKGkpe2lmKHZvaWQgMD09PXRoaXMudCl7dGhpcy5mfD0zNjtmb3IodmFyIHQ9dGhpcy5zO3ZvaWQgMCE9PXQ7dD10Lm4pdC5TLlModCl9dS5wcm90b3R5cGUuUy5jYWxsKHRoaXMsaSl9O3kucHJvdG90eXBlLlU9ZnVuY3Rpb24oaSl7aWYodm9pZCAwIT09dGhpcy50KXt1LnByb3RvdHlwZS5VLmNhbGwodGhpcyxpKTtpZih2b2lkIDA9PT10aGlzLnQpe3RoaXMuZiY9LTMzO2Zvcih2YXIgdD10aGlzLnM7dm9pZCAwIT09dDt0PXQubil0LlMuVSh0KX19fTt5LnByb3RvdHlwZS5OPWZ1bmN0aW9uKCl7aWYoISgyJnRoaXMuZikpe3RoaXMuZnw9Njtmb3IodmFyIGk9dGhpcy50O3ZvaWQgMCE9PWk7aT1pLngpaS50Lk4oKX19O09iamVjdC5kZWZpbmVQcm9wZXJ0eSh5LnByb3RvdHlwZSxcInZhbHVlXCIse2dldDpmdW5jdGlvbigpe2lmKDEmdGhpcy5mKXRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkXCIpO3ZhciBpPWUodGhpcyk7dGhpcy5oKCk7aWYodm9pZCAwIT09aSlpLmk9dGhpcy5pO2lmKDE2JnRoaXMuZil0aHJvdyB0aGlzLnY7cmV0dXJuIHRoaXMudn19KTtmdW5jdGlvbiB3KGkpe3JldHVybiBuZXcgeShpKX1mdW5jdGlvbiBfKGkpe3ZhciByPWkudTtpLnU9dm9pZCAwO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHIpe3MrKzt2YXIgbj1vO289dm9pZCAwO3RyeXtyKCl9Y2F0Y2godCl7aS5mJj0tMjtpLmZ8PTg7ZyhpKTt0aHJvdyB0fWZpbmFsbHl7bz1uO3QoKX19fWZ1bmN0aW9uIGcoaSl7Zm9yKHZhciB0PWkuczt2b2lkIDAhPT10O3Q9dC5uKXQuUy5VKHQpO2kueD12b2lkIDA7aS5zPXZvaWQgMDtfKGkpfWZ1bmN0aW9uIHAoaSl7aWYobyE9PXRoaXMpdGhyb3cgbmV3IEVycm9yKFwiT3V0LW9mLW9yZGVyIGVmZmVjdFwiKTtsKHRoaXMpO289aTt0aGlzLmYmPS0yO2lmKDgmdGhpcy5mKWcodGhpcyk7dCgpfWZ1bmN0aW9uIGIoaSl7dGhpcy54PWk7dGhpcy51PXZvaWQgMDt0aGlzLnM9dm9pZCAwO3RoaXMubz12b2lkIDA7dGhpcy5mPTMyfWIucHJvdG90eXBlLmM9ZnVuY3Rpb24oKXt2YXIgaT10aGlzLlMoKTt0cnl7aWYoOCZ0aGlzLmYpcmV0dXJuO2lmKHZvaWQgMD09PXRoaXMueClyZXR1cm47dmFyIHQ9dGhpcy54KCk7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgdCl0aGlzLnU9dH1maW5hbGx5e2koKX19O2IucHJvdG90eXBlLlM9ZnVuY3Rpb24oKXtpZigxJnRoaXMuZil0aHJvdyBuZXcgRXJyb3IoXCJDeWNsZSBkZXRlY3RlZFwiKTt0aGlzLmZ8PTE7dGhpcy5mJj0tOTtfKHRoaXMpO2EodGhpcyk7cysrO3ZhciBpPW87bz10aGlzO3JldHVybiBwLmJpbmQodGhpcyxpKX07Yi5wcm90b3R5cGUuTj1mdW5jdGlvbigpe2lmKCEoMiZ0aGlzLmYpKXt0aGlzLmZ8PTI7dGhpcy5vPWg7aD10aGlzfX07Yi5wcm90b3R5cGUuZD1mdW5jdGlvbigpe3RoaXMuZnw9ODtpZighKDEmdGhpcy5mKSlnKHRoaXMpfTtmdW5jdGlvbiBFKGkpe3ZhciB0PW5ldyBiKGkpO3RyeXt0LmMoKX1jYXRjaChpKXt0LmQoKTt0aHJvdyBpfXJldHVybiB0LmQuYmluZCh0KX1leHBvcnR7dSBhcyBTaWduYWwsciBhcyBiYXRjaCx3IGFzIGNvbXB1dGVkLEUgYXMgZWZmZWN0LGQgYXMgc2lnbmFsLG4gYXMgdW50cmFja2VkfTsvLyMgc291cmNlTWFwcGluZ1VSTD1zaWduYWxzLWNvcmUubW9kdWxlLmpzLm1hcFxuIiwKICAgICJpbXBvcnR7Q29tcG9uZW50IGFzIGksb3B0aW9ucyBhcyBuLGlzVmFsaWRFbGVtZW50IGFzIHIsRnJhZ21lbnQgYXMgdH1mcm9tXCJwcmVhY3RcIjtpbXBvcnR7dXNlTWVtbyBhcyBmLHVzZVJlZiBhcyBvLHVzZUVmZmVjdCBhcyBlfWZyb21cInByZWFjdC9ob29rc1wiO2ltcG9ydHtlZmZlY3QgYXMgdSxTaWduYWwgYXMgYSxjb21wdXRlZCBhcyBjLHNpZ25hbCBhcyB2LGJhdGNoIGFzIHN9ZnJvbVwiQHByZWFjdC9zaWduYWxzLWNvcmVcIjtleHBvcnR7U2lnbmFsLGJhdGNoLGNvbXB1dGVkLGVmZmVjdCxzaWduYWwsdW50cmFja2VkfWZyb21cIkBwcmVhY3Qvc2lnbmFscy1jb3JlXCI7dmFyIGgsbCxkLHA9W10sbT1bXTt1KGZ1bmN0aW9uKCl7aD10aGlzLk59KSgpO2Z1bmN0aW9uIF8oaSxyKXtuW2ldPXIuYmluZChudWxsLG5baV18fGZ1bmN0aW9uKCl7fSl9ZnVuY3Rpb24gZyhpKXtpZihkKWQoKTtkPWkmJmkuUygpfWZ1bmN0aW9uIGIoaSl7dmFyIG49dGhpcyx0PWkuZGF0YSxvPXVzZVNpZ25hbCh0KTtvLnZhbHVlPXQ7dmFyIGU9ZihmdW5jdGlvbigpe3ZhciBpPW4sdD1uLl9fdjt3aGlsZSh0PXQuX18paWYodC5fX2Mpe3QuX19jLl9fJGZ8PTQ7YnJlYWt9dmFyIGY9YyhmdW5jdGlvbigpe3ZhciBpPW8udmFsdWUudmFsdWU7cmV0dXJuIDA9PT1pPzA6ITA9PT1pP1wiXCI6aXx8XCJcIn0pLGU9YyhmdW5jdGlvbigpe3JldHVybiFBcnJheS5pc0FycmF5KGYudmFsdWUpJiYhcihmLnZhbHVlKX0pLGE9dShmdW5jdGlvbigpe3RoaXMuTj1UO2lmKGUudmFsdWUpe3ZhciBuPWYudmFsdWU7aWYoaS5fX3YmJmkuX192Ll9fZSYmMz09PWkuX192Ll9fZS5ub2RlVHlwZSlpLl9fdi5fX2UuZGF0YT1ufX0pLHY9bi5fXyR1LmQ7bi5fXyR1LmQ9ZnVuY3Rpb24oKXthKCk7di5jYWxsKHRoaXMpfTtyZXR1cm5bZSxmXX0sW10pLGE9ZVswXSx2PWVbMV07cmV0dXJuIGEudmFsdWU/di5wZWVrKCk6di52YWx1ZX1iLmRpc3BsYXlOYW1lPVwiX3N0XCI7T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoYS5wcm90b3R5cGUse2NvbnN0cnVjdG9yOntjb25maWd1cmFibGU6ITAsdmFsdWU6dm9pZCAwfSx0eXBlOntjb25maWd1cmFibGU6ITAsdmFsdWU6Yn0scHJvcHM6e2NvbmZpZ3VyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm57ZGF0YTp0aGlzfX19LF9fYjp7Y29uZmlndXJhYmxlOiEwLHZhbHVlOjF9fSk7XyhcIl9fYlwiLGZ1bmN0aW9uKGksbil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIG4udHlwZSl7dmFyIHIsdD1uLnByb3BzO2Zvcih2YXIgZiBpbiB0KWlmKFwiY2hpbGRyZW5cIiE9PWYpe3ZhciBvPXRbZl07aWYobyBpbnN0YW5jZW9mIGEpe2lmKCFyKW4uX19ucD1yPXt9O3JbZl09bzt0W2ZdPW8ucGVlaygpfX19aShuKX0pO18oXCJfX3JcIixmdW5jdGlvbihpLG4pe2lmKG4udHlwZSE9PXQpe2coKTt2YXIgcixmPW4uX19jO2lmKGYpe2YuX18kZiY9LTI7aWYodm9pZCAwPT09KHI9Zi5fXyR1KSlmLl9fJHU9cj1mdW5jdGlvbihpKXt2YXIgbjt1KGZ1bmN0aW9uKCl7bj10aGlzfSk7bi5jPWZ1bmN0aW9uKCl7Zi5fXyRmfD0xO2Yuc2V0U3RhdGUoe30pfTtyZXR1cm4gbn0oKX1sPWY7ZyhyKX1pKG4pfSk7XyhcIl9fZVwiLGZ1bmN0aW9uKGksbixyLHQpe2coKTtsPXZvaWQgMDtpKG4scix0KX0pO18oXCJkaWZmZWRcIixmdW5jdGlvbihpLG4pe2coKTtsPXZvaWQgMDt2YXIgcjtpZihcInN0cmluZ1wiPT10eXBlb2Ygbi50eXBlJiYocj1uLl9fZSkpe3ZhciB0PW4uX19ucCxmPW4ucHJvcHM7aWYodCl7dmFyIG89ci5VO2lmKG8pZm9yKHZhciBlIGluIG8pe3ZhciB1PW9bZV07aWYodm9pZCAwIT09dSYmIShlIGluIHQpKXt1LmQoKTtvW2VdPXZvaWQgMH19ZWxzZXtvPXt9O3IuVT1vfWZvcih2YXIgYSBpbiB0KXt2YXIgYz1vW2FdLHY9dFthXTtpZih2b2lkIDA9PT1jKXtjPXkocixhLHYsZik7b1thXT1jfWVsc2UgYy5vKHYsZil9fX1pKG4pfSk7ZnVuY3Rpb24geShpLG4scix0KXt2YXIgZj1uIGluIGkmJnZvaWQgMD09PWkub3duZXJTVkdFbGVtZW50LG89dihyKTtyZXR1cm57bzpmdW5jdGlvbihpLG4pe28udmFsdWU9aTt0PW59LGQ6dShmdW5jdGlvbigpe3RoaXMuTj1UO3ZhciByPW8udmFsdWUudmFsdWU7aWYodFtuXSE9PXIpe3Rbbl09cjtpZihmKWlbbl09cjtlbHNlIGlmKHIpaS5zZXRBdHRyaWJ1dGUobixyKTtlbHNlIGkucmVtb3ZlQXR0cmlidXRlKG4pfX0pfX1fKFwidW5tb3VudFwiLGZ1bmN0aW9uKGksbil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIG4udHlwZSl7dmFyIHI9bi5fX2U7aWYocil7dmFyIHQ9ci5VO2lmKHQpe3IuVT12b2lkIDA7Zm9yKHZhciBmIGluIHQpe3ZhciBvPXRbZl07aWYobylvLmQoKX19fX1lbHNle3ZhciBlPW4uX19jO2lmKGUpe3ZhciB1PWUuX18kdTtpZih1KXtlLl9fJHU9dm9pZCAwO3UuZCgpfX19aShuKX0pO18oXCJfX2hcIixmdW5jdGlvbihpLG4scix0KXtpZih0PDN8fDk9PT10KW4uX18kZnw9MjtpKG4scix0KX0pO2kucHJvdG90eXBlLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mdW5jdGlvbihpLG4pe3ZhciByPXRoaXMuX18kdSx0PXImJnZvaWQgMCE9PXIucztmb3IodmFyIGYgaW4gbilyZXR1cm4hMDtpZih0aGlzLl9fZnx8XCJib29sZWFuXCI9PXR5cGVvZiB0aGlzLnUmJiEwPT09dGhpcy51KXt2YXIgbz0yJnRoaXMuX18kZjtpZighKHR8fG98fDQmdGhpcy5fXyRmKSlyZXR1cm4hMDtpZigxJnRoaXMuX18kZilyZXR1cm4hMH1lbHNle2lmKCEodHx8NCZ0aGlzLl9fJGYpKXJldHVybiEwO2lmKDMmdGhpcy5fXyRmKXJldHVybiEwfWZvcih2YXIgZSBpbiBpKWlmKFwiX19zb3VyY2VcIiE9PWUmJmlbZV0hPT10aGlzLnByb3BzW2VdKXJldHVybiEwO2Zvcih2YXIgdSBpbiB0aGlzLnByb3BzKWlmKCEodSBpbiBpKSlyZXR1cm4hMDtyZXR1cm4hMX07ZnVuY3Rpb24gdXNlU2lnbmFsKGkpe3JldHVybiBmKGZ1bmN0aW9uKCl7cmV0dXJuIHYoaSl9LFtdKX1mdW5jdGlvbiB1c2VDb21wdXRlZChpKXt2YXIgbj1vKGkpO24uY3VycmVudD1pO2wuX18kZnw9NDtyZXR1cm4gZihmdW5jdGlvbigpe3JldHVybiBjKGZ1bmN0aW9uKCl7cmV0dXJuIG4uY3VycmVudCgpfSl9LFtdKX12YXIgaz1cInVuZGVmaW5lZFwiPT10eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lP3NldFRpbWVvdXQ6ZnVuY3Rpb24oaSl7dmFyIG49ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQocik7Y2FuY2VsQW5pbWF0aW9uRnJhbWUodCk7aSgpfSxyPXNldFRpbWVvdXQobiwzNSksdD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobil9LHE9ZnVuY3Rpb24oaSl7cXVldWVNaWNyb3Rhc2soZnVuY3Rpb24oKXtxdWV1ZU1pY3JvdGFzayhpKX0pfTtmdW5jdGlvbiBBKCl7cyhmdW5jdGlvbigpe3ZhciBpO3doaWxlKGk9cC5zaGlmdCgpKWguY2FsbChpKX0pfWZ1bmN0aW9uIHcoKXtpZigxPT09cC5wdXNoKHRoaXMpKShuLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8aykoQSl9ZnVuY3Rpb24gRigpe3MoZnVuY3Rpb24oKXt2YXIgaTt3aGlsZShpPW0uc2hpZnQoKSloLmNhbGwoaSl9KX1mdW5jdGlvbiBUKCl7aWYoMT09PW0ucHVzaCh0aGlzKSkobi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHEpKEYpfWZ1bmN0aW9uIHVzZVNpZ25hbEVmZmVjdChpKXt2YXIgbj1vKGkpO24uY3VycmVudD1pO2UoZnVuY3Rpb24oKXtyZXR1cm4gdShmdW5jdGlvbigpe3RoaXMuTj13O3JldHVybiBuLmN1cnJlbnQoKX0pfSxbXSl9ZXhwb3J0e3VzZUNvbXB1dGVkLHVzZVNpZ25hbCx1c2VTaWduYWxFZmZlY3R9Oy8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpZ25hbHMubW9kdWxlLmpzLm1hcFxuIiwKICAgICJpbXBvcnQgeyRzLCBhcGksIGxvZ2dlciwgc3RvcmV9IGZyb20gJ0AvYXBwJ1xuaW1wb3J0IHtjaGFuZ2VMYW5ndWFnZSwgaW5pdCBhcyBpMThuZXh0SW5pdCwgdCBhcyBpMThuZXh0VH0gZnJvbSAnaTE4bmV4dCdcbmltcG9ydCB7Y29weU9iamVjdCwga2V5TW9kLCBrZXlQYXRofSBmcm9tICcuL3V0aWxzLnRzJ1xuaW1wb3J0IHtlZmZlY3R9IGZyb20gJ0BwcmVhY3Qvc2lnbmFscydcblxuZnVuY3Rpb24gaTE4bkZvcm1hdChpMThuLCB0YXJnZXRMYW5ndWFnZXMpIHtcbiAgICBjb25zdCBfaTE4biA9IGNvcHlPYmplY3QoaTE4bilcbiAgICBjb25zdCBpMThuZXh0Rm9ybWF0dGVkID0ge31cbiAgICBmb3IgKGNvbnN0IGxhbmd1YWdlIG9mIHRhcmdldExhbmd1YWdlcykge1xuICAgICAgICBpMThuZXh0Rm9ybWF0dGVkW2xhbmd1YWdlLmlkXSA9IHt0cmFuc2xhdGlvbjoge319XG4gICAgfVxuXG4gICAga2V5TW9kKF9pMThuLCAoX3NyY1JlZiwgX2lkLCByZWZQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IF9pMThuT2JqZWN0ID0ga2V5UGF0aChfaTE4biwgcmVmUGF0aClcblxuICAgICAgICBpZiAodHlwZW9mIF9pMThuT2JqZWN0ID09PSAnb2JqZWN0JyAmJiAndGFyZ2V0JyBpbiBfaTE4bk9iamVjdCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbbGFuZ3VhZ2VfaWRdIG9mIE9iamVjdC5lbnRyaWVzKF9pMThuT2JqZWN0LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWkxOG5leHRGb3JtYXR0ZWRbbGFuZ3VhZ2VfaWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGkxOG5leHRGb3JtYXR0ZWRbbGFuZ3VhZ2VfaWRdID0ge3RyYW5zbGF0aW9uOiB7fX1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgXzE4bmV4dE9iamVjdCA9IGtleVBhdGgoaTE4bmV4dEZvcm1hdHRlZFtsYW5ndWFnZV9pZF0udHJhbnNsYXRpb24sIHJlZlBhdGguc2xpY2UoMCwgLTEpLCB0cnVlKVxuICAgICAgICAgICAgICAgIF8xOG5leHRPYmplY3RbcmVmUGF0aFtyZWZQYXRoLmxlbmd0aCAtIDFdXSA9IF9pMThuT2JqZWN0LnRhcmdldFtsYW5ndWFnZV9pZF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gaTE4bmV4dEZvcm1hdHRlZFxufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KHRyYW5zbGF0aW9ucyA9IG51bGwpIHtcbiAgICBsZXQgcmVzb3VyY2VzID0gbnVsbFxuXG4gICAgaWYgKHRyYW5zbGF0aW9ucykge1xuICAgICAgICByZXNvdXJjZXMgPSB0cmFuc2xhdGlvbnNcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBsb2FkaW5nIGxhbmd1YWdlcyBmcm9tIGJ1bmRsZTogJHtPYmplY3Qua2V5cyhyZXNvdXJjZXMpLmpvaW4oJywgJyl9YClcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXNvdXJjZXMgPSBhd2FpdCBhcGkuZ2V0KCcvYXBpL3RyYW5zbGF0aW9ucycpXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgbG9hZGluZyBsYW5ndWFnZXMgZnJvbSBlbmRwb2ludDogJHtPYmplY3Qua2V5cyhyZXNvdXJjZXMpLmpvaW4oJywgJyl9YClcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGxhbmd1YWdlX2lkIG9mIE9iamVjdC5rZXlzKHJlc291cmNlcykpIHtcbiAgICAgICAgJHMubGFuZ3VhZ2VfdWkuaTE4bltsYW5ndWFnZV9pZF0gPSB7fVxuICAgIH1cblxuICAgIGkxOG5leHRJbml0KHtcbiAgICAgICAgZGVidWc6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG4gICAgICAgIGZhbGxiYWNrTG5nOiAnZW5nLWdicicsXG4gICAgICAgIGludGVycG9sYXRpb246IHtcbiAgICAgICAgICAgIGVzY2FwZVZhbHVlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgbG5nOiAkcy5sYW5ndWFnZV91aS5zZWxlY3Rpb24sXG4gICAgICAgIHJlc291cmNlcyxcbiAgICB9KVxuXG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSAkcy5sYW5ndWFnZV91aS5zZWxlY3Rpb25cbiAgICAgICAgY2hhbmdlTGFuZ3VhZ2UobGFuZ3VhZ2UpXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgbGFuZ3VhZ2UgY2hhbmdlZCB0bzogJHtsYW5ndWFnZX1gKVxuICAgICAgICBzdG9yZS5zYXZlKClcbiAgICB9KVxufVxuXG4vKipcbiAqIEEgc2ltcGxlIHJlYWN0aXZlIHNpZ25hbCBiYXNlZCB0cmFuc2xhdGlvbiBmdW5jdGlvbiwgd2hpY2hcbiAqIGFsbG93cyB0byBzd2l0Y2ggbGFuZ3VhZ2VzIHdpdGhvdXQgaGF2aW5nIHRvIHJlbG9hZCB0aGUgcGFnZS5cbiAqIEBwYXJhbSBrZXkgVHJhbnNsYXRpb24ga2V5XG4gKiBAcGFyYW0gY29udGV4dCBUcmFuc2xhdGlvbiBjb250ZXh0XG4gKi9cbmNvbnN0ICR0ID0gKGtleTogc3RyaW5nLCBjb250ZXh0ID0gbnVsbCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCEkcy5sYW5ndWFnZV91aS5pMThuWyRzLmxhbmd1YWdlX3VpLnNlbGVjdGlvbl0pIHtcbiAgICAgICAgJHMubGFuZ3VhZ2VfdWkuaTE4blskcy5sYW5ndWFnZV91aS5zZWxlY3Rpb25dID0ge31cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBjYWNoZSBrZXkgdGhhdCBpbmNsdWRlcyBib3RoIHRoZSBrZXkgYW5kIGNvbnRleHRcbiAgICBjb25zdCBjYWNoZUtleSA9IGNvbnRleHQgPyBgJHtrZXl9OiR7SlNPTi5zdHJpbmdpZnkoY29udGV4dCl9YCA6IGtleVxuXG4gICAgaWYgKCEkcy5sYW5ndWFnZV91aS5pMThuWyRzLmxhbmd1YWdlX3VpLnNlbGVjdGlvbl1bY2FjaGVLZXldKSB7XG4gICAgICAgICRzLmxhbmd1YWdlX3VpLmkxOG5bJHMubGFuZ3VhZ2VfdWkuc2VsZWN0aW9uXVtjYWNoZUtleV0gPSBpMThuZXh0VChrZXksIGNvbnRleHQpIGFzIHN0cmluZ1xuICAgIH1cbiAgICByZXR1cm4gJHMubGFuZ3VhZ2VfdWkuaTE4blskcy5sYW5ndWFnZV91aS5zZWxlY3Rpb25dW2NhY2hlS2V5XVxufVxuXG5leHBvcnQge1xuICAgICR0LFxuICAgIGkxOG5Gb3JtYXQsXG4gICAgaW5pdCxcbn0iLAogICAgImV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwaSB7XG5cbiAgICBhc3luYyBkZWxldGUoZW5kcG9pbnQsIGRhdGEpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICB9XG5cbiAgICBhc3luYyBnZXQoZW5kcG9pbnQsIHBhcmFtcyA9IG51bGwpIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChlbmRwb2ludCwgZ2xvYmFsVGhpcy5sb2NhdGlvbi5vcmlnaW4pXG4gICAgICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHBhcmFtcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge3ZhbHVlID0gJyd9XG4gICAgICAgICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoa2V5LCBTdHJpbmcodmFsdWUpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdHVzOiAndW5hdXRob3JpemVkJ31cbiAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJlcy5qc29uKClcblxuICAgIH1cblxuICAgIGFzeW5jIHBvc3QoZW5kcG9pbnQsIGRhdGEpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgfVxuXG4gICAgYXN5bmMgcHV0KGVuZHBvaW50LCBkYXRhKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHtcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgfVxufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlbnYoZW52KSB7XG4gICAgZW52LnVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpXG5cbiAgICBpZiAoZ2xvYmFsVGhpcy5uYXZpZ2F0b3IpIHtcbiAgICAgICAgZW52LmlzQnJvd3NlciA9IHRydWVcblxuICAgICAgICBpZiAoZW52LnVhLmluY2x1ZGVzKCdzYWZhcmknKSAmJiAhZW52LnVhLmluY2x1ZGVzKCdjaHJvbWUnKSkge1xuICAgICAgICAgICAgZW52LmlzU2FmYXJpID0gdHJ1ZVxuICAgICAgICAgICAgZW52LmJyb3dzZXJOYW1lID0gJ1NhZmFyaSdcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW52LnVhLmluY2x1ZGVzKCdmaXJlZm94JykpIHtcbiAgICAgICAgICAgIGVudi5pc0ZpcmVmb3ggPSBlbnYudWEuaW5jbHVkZXMoJ2ZpcmVmb3gnKVxuICAgICAgICAgICAgZW52LmJyb3dzZXJOYW1lID0gJ0ZpcmVmb3gnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtZWRpYVF1ZXJ5ID0gZ2xvYmFsVGhpcy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA3NjhweCknKVxuICAgIGVudi5sYXlvdXQgPSBtZWRpYVF1ZXJ5Lm1hdGNoZXMgPyAndGFibGV0JyA6ICdkZXNrdG9wJ1xuICAgIG1lZGlhUXVlcnkuYWRkTGlzdGVuZXIoKGV2ZW50KSA9PiB7XG4gICAgICAgIGVudi5sYXlvdXQgPSBldmVudC5tYXRjaGVzID8gJ3RhYmxldCcgOiAnZGVza3RvcCdcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBlbnYuYWx0S2V5ID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBlbnYuY3RybEtleSA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGVudi5zaGlmdEtleSA9IHRydWVcbiAgICAgICAgfVxuICAgIH0pXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5hbHRLZXkpIHtlbnYuYWx0S2V5ID0gZmFsc2V9XG4gICAgICAgIGlmICghZXZlbnQuY3RybEtleSkge2Vudi5jdHJsS2V5ID0gZmFsc2V9XG4gICAgICAgIGlmICghZXZlbnQuc2hpZnRLZXkpIHtlbnYuc2hpZnRLZXkgPSBmYWxzZX1cbiAgICB9KVxufVxuIiwKICAgICJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vaW5kZXguanMnXG5cbmV4cG9ydCB7IEV2ZW50RW1pdHRlciB9XG5leHBvcnQgZGVmYXVsdCBFdmVudEVtaXR0ZXJcbiIsCiAgICAiLy8gVW5pdmVyc2FsIGxvZ2dlciBlbnRyeXBvaW50XG4vLyBUaGlzIGZpbGUgY29uZGl0aW9uYWxseSBleHBvcnRzIHRoZSBOb2RlIG9yIGJyb3dzZXIgbG9nZ2VyIGltcGxlbWVudGF0aW9uXG5cbi8vIG94bGludC1kaXNhYmxlLW5leHQtbGluZSBpbml0LWRlY2xhcmF0aW9uc1xubGV0IExvZ2dlckltcGw6IGFueSwgbG9nZ2VySW1wbDogYW55XG5cbmlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAvLyBOb2RlL0J1blxuICAgIGNvbnN0IG5vZGUgPSByZXF1aXJlKCcuL2xvZ2dlci5ub2RlLnRzJylcbiAgICBMb2dnZXJJbXBsID0gbm9kZS5Mb2dnZXJcbiAgICBsb2dnZXJJbXBsID0gbm9kZS5sb2dnZXJcbn0gZWxzZSB7XG4gICAgLy8gQnJvd3NlclxuICAgIGNvbnN0IGJyb3dzZXIgPSByZXF1aXJlKCcuL2xvZ2dlci5icm93c2VyLnRzJylcbiAgICBMb2dnZXJJbXBsID0gYnJvd3Nlci5Mb2dnZXJcbiAgICBsb2dnZXJJbXBsID0gYnJvd3Nlci5sb2dnZXJcbn1cblxuY29uc3QgTG9nZ2VyID0gTG9nZ2VySW1wbFxuY29uc3QgbG9nZ2VyID0gbG9nZ2VySW1wbFxuXG5leHBvcnQge2xvZ2dlciwgTG9nZ2VyfSIsCiAgICAiaW1wb3J0XCJAcHJlYWN0L3NpZ25hbHNcIjtpbXBvcnR7dXNlTWVtbyBhcyBlfWZyb21cInByZWFjdC9ob29rc1wiO2ltcG9ydHtTaWduYWwgYXMgdCxzaWduYWwgYXMgcixjb21wdXRlZCBhcyBufWZyb21cIkBwcmVhY3Qvc2lnbmFscy1jb3JlXCI7dmFyIGE9bmV3IFdlYWtNYXAsbz1uZXcgV2Vha01hcCxzPW5ldyBXZWFrTWFwLHU9bmV3IFdlYWtTZXQsYz1uZXcgV2Vha01hcCxmPS9eXFwkLyxpPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsbD0hMSxnPWZ1bmN0aW9uKGUpe2lmKCFrKGUpKXRocm93IG5ldyBFcnJvcihcIlRoaXMgb2JqZWN0IGNhbid0IGJlIG9ic2VydmVkLlwiKTtyZXR1cm4gby5oYXMoZSl8fG8uc2V0KGUsdihlLGQpKSxvLmdldChlKX0scD1mdW5jdGlvbihlLHQpe2w9ITA7dmFyIHI9ZVt0XTt0cnl7bD0hMX1jYXRjaChlKXt9cmV0dXJuIHJ9O2Z1bmN0aW9uIGgoZSl7cmV0dXJuIHUuYWRkKGUpLGV9dmFyIHY9ZnVuY3Rpb24oZSx0KXt2YXIgcj1uZXcgUHJveHkoZSx0KTtyZXR1cm4gdS5hZGQocikscn0seT1mdW5jdGlvbigpe3Rocm93IG5ldyBFcnJvcihcIkRvbid0IG11dGF0ZSB0aGUgc2lnbmFscyBkaXJlY3RseS5cIil9LHc9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsdSxjKXt2YXIgZztpZihsKXJldHVybiBSZWZsZWN0LmdldCh0LHUsYyk7dmFyIHA9ZXx8XCIkXCI9PT11WzBdO2lmKCFlJiZwJiZBcnJheS5pc0FycmF5KHQpKXtpZihcIiRcIj09PXUpcmV0dXJuIHMuaGFzKHQpfHxzLnNldCh0LHYodCxtKSkscy5nZXQodCk7cD1cIiRsZW5ndGhcIj09PXV9YS5oYXMoYyl8fGEuc2V0KGMsbmV3IE1hcCk7dmFyIGg9YS5nZXQoYykseT1wP3UucmVwbGFjZShmLFwiXCIpOnU7aWYoaC5oYXMoeSl8fFwiZnVuY3Rpb25cIiE9dHlwZW9mKG51bGw9PShnPWkodCx5KSk/dm9pZCAwOmcuZ2V0KSl7dmFyIHc9UmVmbGVjdC5nZXQodCx5LGMpO2lmKHAmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHcpcmV0dXJuO2lmKFwic3ltYm9sXCI9PXR5cGVvZiB5JiZiLmhhcyh5KSlyZXR1cm4gdztoLmhhcyh5KXx8KGsodykmJihvLmhhcyh3KXx8by5zZXQodyx2KHcsZCkpLHc9by5nZXQodykpLGguc2V0KHkscih3KSkpfWVsc2UgaC5zZXQoeSxuKGZ1bmN0aW9uKCl7cmV0dXJuIFJlZmxlY3QuZ2V0KHQseSxjKX0pKTtyZXR1cm4gcD9oLmdldCh5KTpoLmdldCh5KS52YWx1ZX19LGQ9e2dldDp3KCExKSxzZXQ6ZnVuY3Rpb24oZSxuLHMsdSl7dmFyIGw7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YobnVsbD09KGw9aShlLG4pKT92b2lkIDA6bC5zZXQpKXJldHVybiBSZWZsZWN0LnNldChlLG4scyx1KTthLmhhcyh1KXx8YS5zZXQodSxuZXcgTWFwKTt2YXIgZz1hLmdldCh1KTtpZihcIiRcIj09PW5bMF0pe3MgaW5zdGFuY2VvZiB0fHx5KCk7dmFyIHA9bi5yZXBsYWNlKGYsXCJcIik7cmV0dXJuIGcuc2V0KHAscyksUmVmbGVjdC5zZXQoZSxwLHMucGVlaygpLHUpfXZhciBoPXM7ayhzKSYmKG8uaGFzKHMpfHxvLnNldChzLHYocyxkKSksaD1vLmdldChzKSk7dmFyIHc9IShuIGluIGUpLG09UmVmbGVjdC5zZXQoZSxuLHMsdSk7cmV0dXJuIGcuaGFzKG4pP2cuZ2V0KG4pLnZhbHVlPWg6Zy5zZXQobixyKGgpKSx3JiZjLmhhcyhlKSYmYy5nZXQoZSkudmFsdWUrKyxBcnJheS5pc0FycmF5KGUpJiZnLmhhcyhcImxlbmd0aFwiKSYmKGcuZ2V0KFwibGVuZ3RoXCIpLnZhbHVlPWUubGVuZ3RoKSxtfSxkZWxldGVQcm9wZXJ0eTpmdW5jdGlvbihlLHQpe1wiJFwiPT09dFswXSYmeSgpO3ZhciByPWEuZ2V0KG8uZ2V0KGUpKSxuPVJlZmxlY3QuZGVsZXRlUHJvcGVydHkoZSx0KTtyZXR1cm4gciYmci5oYXModCkmJihyLmdldCh0KS52YWx1ZT12b2lkIDApLGMuaGFzKGUpJiZjLmdldChlKS52YWx1ZSsrLG59LG93bktleXM6ZnVuY3Rpb24oZSl7cmV0dXJuIGMuaGFzKGUpfHxjLnNldChlLHIoMCkpLGMuXz1jLmdldChlKS52YWx1ZSxSZWZsZWN0Lm93bktleXMoZSl9fSxtPXtnZXQ6dyghMCksc2V0OnksZGVsZXRlUHJvcGVydHk6eX0sYj1uZXcgU2V0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKFN5bWJvbCkubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBTeW1ib2xbZV19KS5maWx0ZXIoZnVuY3Rpb24oZSl7cmV0dXJuXCJzeW1ib2xcIj09dHlwZW9mIGV9KSksUj1uZXcgU2V0KFtPYmplY3QsQXJyYXldKSxrPWZ1bmN0aW9uKGUpe3JldHVyblwib2JqZWN0XCI9PXR5cGVvZiBlJiZudWxsIT09ZSYmUi5oYXMoZS5jb25zdHJ1Y3RvcikmJiF1LmhhcyhlKX0sTT1mdW5jdGlvbih0KXtyZXR1cm4gZShmdW5jdGlvbigpe3JldHVybiBnKHQpfSxbXSl9O2V4cG9ydHtnIGFzIGRlZXBTaWduYWwscCBhcyBwZWVrLGggYXMgc2hhbGxvdyxNIGFzIHVzZURlZXBTaWduYWx9Oy8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlZXBzaWduYWwubW9kdWxlLmpzLm1hcFxuIiwKICAgICIvLyBveGxpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC10eXBlLXNwZWNpZmllci1zdHlsZVxuaW1wb3J0IHt0eXBlIERlZXBTaWduYWwsIGRlZXBTaWduYWx9IGZyb20gJ2RlZXBzaWduYWwnXG5pbXBvcnQge2NvcHlPYmplY3QsIG1lcmdlRGVlcH0gZnJvbSAnQC9saWIvdXRpbHMnXG5cbmNsYXNzIFN0b3JlPFN0YXRlVHlwZSBleHRlbmRzIG9iamVjdCA9IG9iamVjdD4ge1xuXG4gICAgc3RhdGU6IERlZXBTaWduYWw8U3RhdGVUeXBlPlxuICAgIHBlcnNpc3RhbnRTdGF0ZT86IFN0YXRlVHlwZVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBkZWVwU2lnbmFsKHt9IGFzIFN0YXRlVHlwZSlcbiAgICB9XG5cbiAgICBsb2FkKHBlcnNpc3RhbnRTdGF0ZTogU3RhdGVUeXBlLCB2b2xhdGlsZVN0YXRlOiBQYXJ0aWFsPFN0YXRlVHlwZT4pIHtcbiAgICAgICAgdGhpcy5wZXJzaXN0YW50U3RhdGUgPSBjb3B5T2JqZWN0KHBlcnNpc3RhbnRTdGF0ZSlcblxuICAgICAgICBsZXQgcmVzdG9yZWRTdGF0ZSA9IHt9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN0b3JlZFN0YXRlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RvcmUnKSB8fCAne30nKVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJlc3RvcmVkU3RhdGUgPSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCBtZXJnZURlZXAobWVyZ2VEZWVwKHBlcnNpc3RhbnRTdGF0ZSwgcmVzdG9yZWRTdGF0ZSksIHZvbGF0aWxlU3RhdGUpKVxuICAgIH1cblxuICAgIGZpbHRlcktleXMob2JqOiBhbnksIGJsdWVwcmludDogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGJsdWVwcmludCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5oYXNPd24ob2JqLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBibHVlcHJpbnRba2V5XSA9PT0gJ29iamVjdCcgJiYgYmx1ZXByaW50W2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB0aGlzLmZpbHRlcktleXMob2JqW2tleV0sIGJsdWVwcmludFtrZXldKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqW2tleV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cblxuICAgIHNhdmUoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzdG9yZScsIEpTT04uc3RyaW5naWZ5KHRoaXMuZmlsdGVyS2V5cyh0aGlzLnN0YXRlLCB0aGlzLnBlcnNpc3RhbnRTdGF0ZSkpKVxuICAgIH1cbn1cblxuZXhwb3J0IHtTdG9yZX1cbiIsCiAgICAiLy8gb3hsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5hbWVzcGFjZVxuaW1wb3J0ICogYXMgX2kxOG4gZnJvbSAnQC9saWIvaTE4bidcbmltcG9ydCB7JHR9IGZyb20gJy4vbGliL2kxOG4nXG5pbXBvcnQgQXBpIGZyb20gJ0AvbGliL2FwaSdcbmltcG9ydCBlbnYgZnJvbSAnQC9saWIvZW52J1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjMnXG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnQGdhcmFnZTQ0L2NvbW1vbi9saWIvbG9nZ2VyLnRzJ1xuaW1wb3J0IHtub3RpZnl9IGZyb20gJ0AvbGliL25vdGlmaWVyJ1xuaW1wb3J0IHtTdG9yZX0gZnJvbSAnQC9saWIvc3RvcmUnXG5pbXBvcnQgdHlwZSB7Q29tbW9uU3RhdGV9IGZyb20gJ0AvdHlwZXMnXG5cbmNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKVxubG9nZ2VyLnNldExldmVsKCdkZWJ1ZycpXG5cbmNvbnN0IHN0b3JlID0gbmV3IFN0b3JlPENvbW1vblN0YXRlPigpXG5jb25zdCBpMThuID0gX2kxOG5cbmNvbnN0ICRzID0gc3RvcmUuc3RhdGVcblxuY29uc3QgYXBpID0gbmV3IEFwaSgpXG5jb25zdCBldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKClcblxuY2xhc3MgQXBwIHtcblxuICAgIGFzeW5jIGluaXQoTWFpbiwgcmVuZGVyRm4sIGhGbiwgdHJhbnNsYXRpb25zKSB7XG4gICAgICAgIGVudigkcy5lbnYpXG4gICAgICAgIGF3YWl0IGkxOG4uaW5pdCh0cmFuc2xhdGlvbnMpXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlbmRlckZuKGhGbihNYWluLCB7fSksIGRvY3VtZW50LmJvZHkpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBveGxpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcmVuZGVyaW5nIE1haW4gY29tcG9uZW50OicsIGVycm9yKVxuICAgICAgICB9XG4gICAgICAgIGV2ZW50cy5lbWl0KCdhcHA6aW5pdCcpXG4gICAgfVxufVxuXG5nbG9iYWxUaGlzLiRzID0gJHNcblxuZXhwb3J0IHtcbiAgICAkcyxcbiAgICAkdCxcbiAgICBhcGksXG4gICAgQXBwLFxuICAgIGV2ZW50cyxcbiAgICBsb2dnZXIsXG4gICAgaTE4bixcbiAgICBzdG9yZSxcbiAgICBub3RpZnksXG59IiwKICAgICJjb25zdCBwZXJzaXN0ZW50U3RhdGUgPSB7XG4gICAgbGFuZ3VhZ2VfdWk6IHtcbiAgICAgICAgc2VsZWN0aW9uOiAnZW5nLWdicicsXG4gICAgfSxcbiAgICBwYW5lbDoge1xuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgIH0sXG59IGFzIGNvbnN0XG5cbmNvbnN0IHZvbGF0aWxlU3RhdGUgPSB7XG4gICAgZW52OiB7XG4gICAgICAgIGxheW91dDogJ2Rlc2t0b3AnLFxuICAgIH0sXG4gICAgbGFuZ3VhZ2VfdWk6IHtcbiAgICAgICAgLyoqIFN0b3JlcyB0aGUgY2FsbHMgdG8gaTE4bmV4dC50LCBhbGxvd2luZyB0byByZWFjdGl2ZWx5IHVwZGF0ZSAkdCAqL1xuICAgICAgICBpMThuOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PixcbiAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAge2lkOiAnYXJhJywgbmFtZTogJ0FyYWJpYyd9LFxuICAgICAgICAgICAge2lkOiAnemhvJywgbmFtZTogJ0NoaW5lc2UgKFNpbXBsaWZpZWQpJ30sXG4gICAgICAgICAgICB7aWQ6ICdubGQnLCBuYW1lOiAnRHV0Y2gnfSxcbiAgICAgICAgICAgIHtpZDogJ2VuZy1nYnInLCBuYW1lOiAnRW5nbGlzaCd9LFxuICAgICAgICAgICAge2lkOiAnZnJhJywgbmFtZTogJ0ZyZW5jaCd9LFxuICAgICAgICAgICAge2lkOiAnZGV1JywgbmFtZTogJ0dlcm1hbid9LFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgbm90aWZpY2F0aW9uczogW10gYXMgdW5rbm93bltdLFxuICAgIHVzZXI6IHtcbiAgICAgICAgYWRtaW46IGZhbHNlLFxuICAgICAgICBhdXRoZW50aWNhdGVkOiBudWxsLFxuICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICB9LFxufVxuXG5leHBvcnQge1xuICAgIHBlcnNpc3RlbnRTdGF0ZSxcbiAgICB2b2xhdGlsZVN0YXRlLFxufSIsCiAgICAiaW1wb3J0IHtcbiAgICBwZXJzaXN0ZW50U3RhdGUgYXMgY29tbW9uUGVyc2lzdGFudFN0YXRlLFxuICAgIHZvbGF0aWxlU3RhdGUgYXMgY29tbW9uVm9sYXRpbGVTdGF0ZSxcbn0gZnJvbSAnQGdhcmFnZTQ0L2NvbW1vbi9saWIvc3RhdGUnXG5pbXBvcnQge21lcmdlRGVlcH0gZnJvbSAnQGdhcmFnZTQ0L2NvbW1vbi9saWIvdXRpbHMnXG5cbmNvbnN0IHBlcnNpc3RhbnRTdGF0ZSA9IG1lcmdlRGVlcCh7fSwgY29tbW9uUGVyc2lzdGFudFN0YXRlKVxuXG5jb25zdCB2b2xhdGlsZVN0YXRlID0gbWVyZ2VEZWVwKHtcbiAgICBjdXJyZW50Um91dGU6ICcvY29tcG9uZW50cycsXG4gICAgZW52OiB7fSxcbiAgICBzZWxlY3RlZENvbXBvbmVudDogbnVsbCxcbn0sIGNvbW1vblZvbGF0aWxlU3RhdGUpXG5cbmV4cG9ydCB7cGVyc2lzdGFudFN0YXRlLCB2b2xhdGlsZVN0YXRlfSIsCiAgICAiaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50ZW1pdHRlcjMnXG5pbXBvcnQge2xvZ2dlcn0gZnJvbSAnQGdhcmFnZTQ0L2NvbW1vbi9hcHAnXG5cbnR5cGUgTWVzc2FnZURhdGEgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXG5pbnRlcmZhY2UgV2ViU29ja2V0TWVzc2FnZSB7XG4gICAgZGF0YT86IE1lc3NhZ2VEYXRhXG4gICAgaWQ/OiBzdHJpbmdcbiAgICBtZXRob2Q/OiBzdHJpbmdcbiAgICB1cmw6IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RNZXNzYWdlKHVybDogc3RyaW5nLCBkYXRhPzogTWVzc2FnZURhdGEsIGlkPzogc3RyaW5nLCBtZXRob2Q/OiBzdHJpbmcpOiBXZWJTb2NrZXRNZXNzYWdlIHtcbiAgICByZXR1cm4ge2RhdGEsIGlkLCBtZXRob2QsIHVybH1cbn1cblxuZnVuY3Rpb24gcGFyc2VNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IFdlYlNvY2tldE1lc3NhZ2Uge1xuICAgIHJldHVybiBKU09OLnBhcnNlKG1lc3NhZ2UpXG59XG5cbmNsYXNzIFdlYlNvY2tldENsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgcHJpdmF0ZSB3czogV2ViU29ja2V0IHwgbnVsbCA9IG51bGxcblxuICAgIHByaXZhdGUgYWN0aXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgcHJpdmF0ZSBhdXRoRmFpbHVyZSA9IGZhbHNlXG4gICAgcHJpdmF0ZSBiYXNlUmVjb25uZWN0RGVsYXkgPSAxMDAgLy8gMSBzZWNvbmRcbiAgICBwcml2YXRlIGV2ZW50SGFuZGxlcnM6IFJlY29yZDxzdHJpbmcsICgoZGF0YTogTWVzc2FnZURhdGEpID0+IHZvaWQpW10+ID0ge31cbiAgICBwcml2YXRlIGludGVudGlvbmFsQ2xvc2UgPSBmYWxzZVxuICAgIHByaXZhdGUgbWF4UmVjb25uZWN0QXR0ZW1wdHMgPSAxMFxuICAgIHByaXZhdGUgbWF4UmVjb25uZWN0RGVsYXkgPSAzMF8wMDAgLy8gMzAgc2Vjb25kc1xuICAgIHByaXZhdGUgbWVzc2FnZUxpc3RlbmVyczogRXZlbnRMaXN0ZW5lcltdID0gW11cbiAgICBwcml2YXRlIHBlbmRpbmdSZXF1ZXN0cyA9IG5ldyBNYXA8c3RyaW5nLCB7XG4gICAgICAgIHJlamVjdDogKHJlYXNvbj86IHVua25vd24pID0+IHZvaWRcbiAgICAgICAgcmVzb2x2ZTogKHZhbHVlOiBNZXNzYWdlRGF0YSB8IG51bGwpID0+IHZvaWRcbiAgICAgICAgdGltZW91dDogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD5cbiAgICB9PigpXG4gICAgcHJpdmF0ZSByZWNvbm5lY3RBdHRlbXB0cyA9IDBcbiAgICBwcml2YXRlIHJlY29ubmVjdFRpbWVvdXQ6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGxcbiAgICBwcml2YXRlIHJlcXVlc3RUaW1lb3V0ID0gMzBfMDAwIC8vIDMwIHNlY29uZHNcbiAgICBwcml2YXRlIHVybDogc3RyaW5nXG4gICAgcHJpdmF0ZSBtZXNzYWdlUXVldWU6IHtkYXRhPzogTWVzc2FnZURhdGE7IGlkPzogc3RyaW5nOyBtZXRob2Q/OiBzdHJpbmc7IHVybDogc3RyaW5nfVtdID0gW11cblxuICAgIGNvbnN0cnVjdG9yKGJhc2VVcmw6IHN0cmluZykge1xuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmIChiYXNlVXJsLnN0YXJ0c1dpdGgoJ3dzOi8vJykgfHwgYmFzZVVybC5zdGFydHNXaXRoKCd3c3M6Ly8nKSkge1xuICAgICAgICAgICAgdGhpcy51cmwgPSBiYXNlVXJsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVybCA9IGJhc2VVcmwuZW5kc1dpdGgoJy93cycpID8gYmFzZVVybCA6IGAke2Jhc2VVcmx9L3dzYFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZUxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud3MpIHtcbiAgICAgICAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFN1YnNjcmlwdGlvbih0b3BpYzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQodG9waWMpXG4gICAgfVxuXG4gICAgICAgIC8vIFVSTC1iYXNlZCBtZXNzYWdlIHJvdXRpbmcgbWV0aG9kXG4gICAgb25Sb3V0ZSh1cmw6IHN0cmluZywgaGFuZGxlcjogKGRhdGE6IE1lc3NhZ2VEYXRhKSA9PiB2b2lkKSB7XG4gICAgICAgIGlmICghdGhpcy5ldmVudEhhbmRsZXJzW3VybF0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1t1cmxdID0gW11cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbdXJsXS5wdXNoKGhhbmRsZXIpXG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIFVSTC1iYXNlZCBoYW5kbGVyXG4gICAgb2ZmUm91dGUodXJsOiBzdHJpbmcsIGhhbmRsZXI/OiAoZGF0YTogTWVzc2FnZURhdGEpID0+IHZvaWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50SGFuZGxlcnNbdXJsXSkge3JldHVybn1cblxuICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW3VybF0gPSB0aGlzLmV2ZW50SGFuZGxlcnNbdXJsXS5maWx0ZXIoaCA9PiBoICE9PSBoYW5kbGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZXZlbnRIYW5kbGVyc1t1cmxdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdbV1NdIGNsb3NpbmcgY29ubmVjdGlvbiBpbnRlbnRpb25hbGx5JylcbiAgICAgICAgdGhpcy5pbnRlbnRpb25hbENsb3NlID0gdHJ1ZVxuXG4gICAgICAgIGlmICh0aGlzLnJlY29ubmVjdFRpbWVvdXQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlY29ubmVjdFRpbWVvdXQpXG4gICAgICAgICAgICB0aGlzLnJlY29ubmVjdFRpbWVvdXQgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53cykge1xuICAgICAgICAgICAgdGhpcy53cy5jbG9zZSgpXG4gICAgICAgICAgICB0aGlzLndzID0gbnVsbFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgLy8gRG9uJ3QgdHJ5IHRvIGNvbm5lY3QgaWYgd2UncmUgYWxyZWFkeSBjb25uZWN0aW5nL2Nvbm5lY3RlZCBvciBoYWQgYW4gYXV0aCBmYWlsdXJlXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMud3MgJiYgKFxuICAgICAgICAgICAgICAgIHRoaXMud3MucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNPTk5FQ1RJTkcgfHxcbiAgICAgICAgICAgICAgICB0aGlzLndzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1tXU10gYWxyZWFkeSBjb25uZWN0ZWQsIHNraXBwaW5nJylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG9uJ3QgcmVjb25uZWN0IGFmdGVyIGF1dGhlbnRpY2F0aW9uIGZhaWx1cmVzIHVudGlsIGV4cGxpY2l0bHkgdG9sZCB0b1xuICAgICAgICBpZiAodGhpcy5hdXRoRmFpbHVyZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdbV1NdIE5vdCByZWNvbm5lY3RpbmcgZHVlIHRvIHByZXZpb3VzIGF1dGhlbnRpY2F0aW9uIGZhaWx1cmUnKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIuZGVidWcoYFtXU10gY29ubmVjdGluZyB0byAke3RoaXMudXJsfWApXG4gICAgICAgIHRoaXMuaW50ZW50aW9uYWxDbG9zZSA9IGZhbHNlXG4gICAgICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KHRoaXMudXJsKVxuXG4gICAgICAgIHRoaXMud3Mub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLnN1Y2Nlc3MoYFtXU10gY29ubmVjdGlvbiBlc3RhYmxpc2hlZDogJHt0aGlzLnVybH1gKVxuICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA9IDBcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnb3BlbicpXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NNZXNzYWdlUXVldWUoKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53cy5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSlcblxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSByZXF1ZXN0LXJlc3BvbnNlIG1lc3NhZ2VzIGZpcnN0XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFuZGxlUmVzcG9uc2UobWVzc2FnZSkpIHtyZXR1cm59XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBtZXNzYWdlKVxuXG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIHJvdXRlLXNwZWNpZmljIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UudXJsICYmIHRoaXMuZXZlbnRIYW5kbGVyc1ttZXNzYWdlLnVybF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW21lc3NhZ2UudXJsXS5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihtZXNzYWdlLmRhdGEpKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEVtaXQgb24gdGhlIFVSTCBhcyBhbiBldmVudFxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnVybCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZS51cmwsIG1lc3NhZ2UuZGF0YSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBQYXNzIHRvIGdlbmVyaWMgbWVzc2FnZSBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VMaXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihldmVudCkpXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcignW1dTXSBmYWlsZWQgdG8gcGFyc2UgbWVzc2FnZScsIGVycm9yKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53cy5vbmNsb3NlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYFtXU10gY29ubmVjdGlvbiBjbG9zZWQ6IGNvZGU9JHtldmVudC5jb2RlfSwgcmVhc29uPSR7ZXZlbnQucmVhc29ufWApXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlJywgZXZlbnQpXG5cbiAgICAgICAgICAgIC8vIERvbid0IHJlY29ubmVjdCBpZiB0aGlzIHdhcyBhbiBhdXRoZW50aWNhdGlvbiBmYWlsdXJlICgxMDA4KVxuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09IDEwMDgpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1tXU10gYXV0aGVudGljYXRpb24gZmFpbGVkOyBub3QgcmVjb25uZWN0aW5nJylcbiAgICAgICAgICAgICAgICB0aGlzLmF1dGhGYWlsdXJlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndW5hdXRob3JpemVkJywgZXZlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC8vIERvbid0IHJlY29ubmVjdCAtIGF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERvbid0IHJlY29ubmVjdCBpZiB0aGlzIHdhcyBhbiBpbnRlbnRpb25hbCBjbG9zZVxuICAgICAgICAgICAgaWYgKHRoaXMuaW50ZW50aW9uYWxDbG9zZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnW1dTXSBjb25uZWN0aW9uIGNsb3NlZCBpbnRlbnRpb25hbGx5OyBub3QgcmVjb25uZWN0aW5nJylcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3QoKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53cy5vbmVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1tXU10gY29ubmVjdGlvbiBlcnJvcicsIGVycm9yKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLndzICE9PSBudWxsICYmIHRoaXMud3MucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU5cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlY29ubmVjdCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucmVjb25uZWN0VGltZW91dCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVjb25uZWN0VGltZW91dClcbiAgICAgICAgICAgIHRoaXMucmVjb25uZWN0VGltZW91dCA9IG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJlY29ubmVjdEF0dGVtcHRzID49IHRoaXMubWF4UmVjb25uZWN0QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBbV1NdIG1heCByZWNvbm5lY3Rpb24gYXR0ZW1wdHMgKCR7dGhpcy5tYXhSZWNvbm5lY3RBdHRlbXB0c30pIHJlYWNoZWQ7IGdpdmluZyB1cGApXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ21heF9yZWNvbm5lY3RfYXR0ZW1wdHMnKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgZGVsYXkgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gTWF0aC5taW4oXG4gICAgICAgICAgICB0aGlzLmJhc2VSZWNvbm5lY3REZWxheSAqICgxLjUgKiogdGhpcy5yZWNvbm5lY3RBdHRlbXB0cyksXG4gICAgICAgICAgICB0aGlzLm1heFJlY29ubmVjdERlbGF5LFxuICAgICAgICApXG5cbiAgICAgICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0cysrXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSByZWNvbm5lY3RpbmcgaW4gJHtkZWxheX1tcyAoYXR0ZW1wdCAke3RoaXMucmVjb25uZWN0QXR0ZW1wdHN9LyR7dGhpcy5tYXhSZWNvbm5lY3RBdHRlbXB0c30pYClcbiAgICAgICAgdGhpcy5lbWl0KCdyZWNvbm5lY3RpbmcnLCB7YXR0ZW1wdDogdGhpcy5yZWNvbm5lY3RBdHRlbXB0cywgZGVsYXl9KVxuXG4gICAgICAgIHRoaXMucmVjb25uZWN0VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0KClcbiAgICAgICAgfSwgZGVsYXkpXG4gICAgfVxuXG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZUxpc3RlbmVycyA9IHRoaXMubWVzc2FnZUxpc3RlbmVycy5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLndzKSB7XG4gICAgICAgICAgICB0aGlzLndzLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldEF1dGhGYWlsdXJlKCkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ1tXU10gcmVzZXR0aW5nIGF1dGhlbnRpY2F0aW9uIGZhaWx1cmUgc3RhdGUnKVxuICAgICAgICB0aGlzLmF1dGhGYWlsdXJlID0gZmFsc2VcbiAgICAgICAgdGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA9IDBcbiAgICAgICAgdGhpcy5jb25uZWN0KClcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NNZXNzYWdlUXVldWUoKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBwcm9jZXNzaW5nIG1lc3NhZ2UgcXVldWUsICR7dGhpcy5tZXNzYWdlUXVldWUubGVuZ3RofSBtZXNzYWdlc2ApXG4gICAgICAgIHdoaWxlICh0aGlzLm1lc3NhZ2VRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5tZXNzYWdlUXVldWUuc2hpZnQoKVxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYFtXU10gcHJvY2Vzc2luZyBxdWV1ZWQgbWVzc2FnZTogJHttZXNzYWdlLmlkfWApXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UubWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZSBhIG5ldyByZXF1ZXN0LCBqdXN0IHNlbmQgdGhlIHF1ZXVlZCBtZXNzYWdlIHdpdGggaXRzIGV4aXN0aW5nIElEXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdzTWVzc2FnZSA9IGNvbnN0cnVjdE1lc3NhZ2UobWVzc2FnZS51cmwsIG1lc3NhZ2UuZGF0YSwgbWVzc2FnZS5pZCwgbWVzc2FnZS5tZXRob2QpXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLndzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkod3NNZXNzYWdlKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBzZW5kaW5nIHF1ZXVlZCBub24tcmVxdWVzdCBtZXNzYWdlYClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kKG1lc3NhZ2UudXJsLCBtZXNzYWdlLmRhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBmaW5pc2hlZCBwcm9jZXNzaW5nIG1lc3NhZ2UgcXVldWVgKVxuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmVzcG9uc2UobWVzc2FnZTogV2ViU29ja2V0TWVzc2FnZSkge1xuICAgICAgICBpZiAoIW1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBtZXNzYWdlIGhhcyBubyBpZCwgbm90IGEgcmVzcG9uc2VgKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwZW5kaW5nID0gdGhpcy5wZW5kaW5nUmVxdWVzdHMuZ2V0KG1lc3NhZ2UuaWQpXG4gICAgICAgIGlmICghcGVuZGluZykge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBbV1NdIG5vIHBlbmRpbmcgcmVxdWVzdCBmb3VuZCBmb3IgaWQ6ICR7bWVzc2FnZS5pZH1gKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIuZGVidWcoYFtXU10gcmVzb2x2aW5nIHBlbmRpbmcgcmVxdWVzdDogJHttZXNzYWdlLmlkfWApXG4gICAgICAgIGNsZWFyVGltZW91dChwZW5kaW5nLnRpbWVvdXQpXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RzLmRlbGV0ZShtZXNzYWdlLmlkKVxuICAgICAgICBwZW5kaW5nLnJlc29sdmUobWVzc2FnZS5kYXRhIHx8IG51bGwpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgZGF0YT86IE1lc3NhZ2VEYXRhKTogUHJvbWlzZTxNZXNzYWdlRGF0YSB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy53cyB8fCB0aGlzLndzLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdbV1NdIGNvbm5lY3Rpb24gbm90IG9wZW4sIHF1ZXVpbmcgcmVxdWVzdCcpXG4gICAgICAgICAgICAgICAgLy8gSW5zdGVhZCBvZiByZXNvbHZpbmcgbnVsbCBpbW1lZGlhdGVseSwgcXVldWUgYm90aCB0aGUgbWVzc2FnZSBhbmQgaXRzIHByb21pc2UgaGFuZGxlcnNcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDE1KVxuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBnZW5lcmF0ZWQgcmVxdWVzdCBpZCBmb3IgcXVldWU6ICR7aWR9YClcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VRdWV1ZS5wdXNoKHtkYXRhLCBpZCwgbWV0aG9kLCB1cmx9KVxuXG4gICAgICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoYFtXU10gdGltZW91dCB0cmlnZ2VyZWQgZm9yIHF1ZXVlZCByZXF1ZXN0OiAke2lkfWApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RzLmRlbGV0ZShpZClcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lb3V0IHdoaWxlIHdhaXRpbmcgZm9yIGNvbm5lY3Rpb24nKSlcbiAgICAgICAgICAgICAgICB9LCB0aGlzLnJlcXVlc3RUaW1lb3V0KVxuXG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHMuc2V0KGlkLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBzdG9yZWQgcGVuZGluZyByZXF1ZXN0IHdpdGggaWQ6ICR7aWR9YClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaWQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxNSlcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgW1dTXSBzZW5kaW5nIHJlcXVlc3Qgd2l0aCBpZDogJHtpZH1gKVxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGNvbnN0cnVjdE1lc3NhZ2UodXJsLCBkYXRhLCBpZCwgbWV0aG9kKVxuXG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHMuZGVsZXRlKGlkKVxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFJlcXVlc3QgdGltZW91dCBmb3I6ICR7dXJsfWApKVxuICAgICAgICAgICAgfSwgdGhpcy5yZXF1ZXN0VGltZW91dClcblxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdHMuc2V0KGlkLCB7XG4gICAgICAgICAgICAgICAgcmVqZWN0LFxuICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgdGltZW91dCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gUkVTVC1saWtlIG1ldGhvZHNcbiAgICBhc3luYyBnZXQodXJsOiBzdHJpbmcsIGRhdGE/OiBNZXNzYWdlRGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdHRVQnLCB1cmwsIGRhdGEpXG4gICAgfVxuXG4gICAgYXN5bmMgcG9zdCh1cmw6IHN0cmluZywgZGF0YT86IE1lc3NhZ2VEYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ1BPU1QnLCB1cmwsIGRhdGEpXG4gICAgfVxuXG4gICAgYXN5bmMgcHV0KHVybDogc3RyaW5nLCBkYXRhPzogTWVzc2FnZURhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUFVUJywgdXJsLCBkYXRhKVxuICAgIH1cblxuICAgIGFzeW5jIGRlbGV0ZSh1cmw6IHN0cmluZywgZGF0YT86IE1lc3NhZ2VEYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVlc3QoJ0RFTEVURScsIHVybCwgZGF0YSlcbiAgICB9XG5cbiAgICAvLyBPcmlnaW5hbCBzZW5kIG1ldGhvZCBmb3Igbm9uLXJlcXVlc3QtcmVzcG9uc2UgbWVzc2FnZXMgKGxpa2Ugc3Vic2NyaXB0aW9ucylcbiAgICBzZW5kKHVybDogc3RyaW5nLCBkYXRhPzogTWVzc2FnZURhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLndzIHx8IHRoaXMud3MucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnW1dTXSBjb25uZWN0aW9uIG5vdCBvcGVuLCBxdWV1aW5nIG1lc3NhZ2UnKVxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUucHVzaCh7ZGF0YSwgdXJsfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGNvbnN0cnVjdE1lc3NhZ2UodXJsLCBkYXRhKVxuICAgICAgICB0aGlzLndzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpXG4gICAgfVxufVxuXG5jb25zdCBXZWJTb2NrZXRFdmVudHMgPSB7XG4gICAgQ09OTkVDVEVEOiAnY29ubmVjdGVkJyxcbiAgICBESVNDT05ORUNURUQ6ICdkaXNjb25uZWN0ZWQnLFxuICAgIE1FU1NBR0U6ICdtZXNzYWdlJyxcbiAgICBPUEVOOiAnb3BlbicsXG4gICAgUkVDT05ORUNUSU5HOiAncmVjb25uZWN0aW5nJyxcbiAgICBVTkFVVEhPUklaRUQ6ICd1bmF1dGhvcml6ZWQnLFxufVxuXG5leHBvcnQge1xuICAgIGNvbnN0cnVjdE1lc3NhZ2UsXG4gICAgcGFyc2VNZXNzYWdlLFxuICAgIFdlYlNvY2tldENsaWVudCxcbiAgICBXZWJTb2NrZXRFdmVudHMsXG59IiwKICAgICJpbXBvcnQge1dlYlNvY2tldENsaWVudH0gZnJvbSAnQGdhcmFnZTQ0L2NvbW1vbi9saWIvd3MtY2xpZW50J1xuXG4vLyBLZWVwIHRyYWNrIG9mIHdoaWNoIHN0eWxlc2hlZXRzIGFyZSBjdXJyZW50bHkgYmVpbmcgdXBkYXRlZFxuY29uc3QgcGVuZGluZ1N0eWxlc2hlZXRVcGRhdGVzID0gbmV3IFNldDxzdHJpbmc+KClcblxuLy8gRXhjZXB0aW9uIHBhZ2Ugc3RhdGVcbmxldCBleGNlcHRpb25PdmVybGF5OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsXG5cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxlc2hlZXQoZmlsZW5hbWU6IHN0cmluZywgcHVibGljUGF0aDogc3RyaW5nKSB7XG4gICAgLy8gU2tpcCBpZiB0aGlzIHN0eWxlc2hlZXQgaXMgYWxyZWFkeSBiZWluZyB1cGRhdGVkXG4gICAgaWYgKHBlbmRpbmdTdHlsZXNoZWV0VXBkYXRlcy5oYXMoZmlsZW5hbWUpKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIE1hcmsgdGhpcyBzdHlsZXNoZWV0IGFzIGJlaW5nIHVwZGF0ZWRcbiAgICBwZW5kaW5nU3R5bGVzaGVldFVwZGF0ZXMuYWRkKGZpbGVuYW1lKVxuXG4gICAgLy8gR2V0IGFsbCBzdHlsZXNoZWV0IGxpbmtzXG4gICAgY29uc3QgYWxsTGlua3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYGxpbmtbcmVsPXN0eWxlc2hlZXRdYCkpXG4gICAgICAgIC5tYXAobGluayA9PiBsaW5rIGFzIEhUTUxMaW5rRWxlbWVudClcblxuICAgIC8vIEZpbmQgbWF0Y2hpbmcgc3R5bGVzaGVldCBieSBiYXNlIG5hbWUgKHdpdGhvdXQgaGFzaClcbiAgICBjb25zdCBiYXNlRmlsZU5hbWUgPSBmaWxlbmFtZS5zcGxpdCgnLicpWzBdIC8vIEV4dHJhY3QgJ2FwcCcgZnJvbSAnYXBwLmF4dWFzbGxvci5jc3MnXG4gICAgY29uc3QgbGlua0VsZW1lbnRzID0gYWxsTGlua3MuZmlsdGVyKGxpbmsgPT4ge1xuICAgICAgICBjb25zdCBocmVmID0gbGluay5ocmVmXG4gICAgICAgIC8vIE1hdGNoIC9wdWJsaWMvYXBwLiouY3NzIG9yIC9wdWJsaWMvY29tcG9uZW50cy4qLmNzcyBwYXR0ZXJuXG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGAvcHVibGljLyR7YmFzZUZpbGVOYW1lfVxcXFwuW14vXSpcXFxcLmNzc2ApXG4gICAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QoaHJlZilcbiAgICB9KVxuXG4gICAgaWYgKGxpbmtFbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcGVuZGluZ1N0eWxlc2hlZXRVcGRhdGVzLmRlbGV0ZShmaWxlbmFtZSlcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIG5ldyBzdHlsZXNoZWV0IGxpbmsgLSB1c2UgcHVibGljIHBhdGggc2luY2Ugc3RhdGljIGZpbGVzIGFyZSBzZXJ2ZWQgZnJvbSAvcHVibGljL1xuICAgIGNvbnN0IG5ld0xpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJylcbiAgICBuZXdMaW5rLnJlbCA9ICdzdHlsZXNoZWV0J1xuICAgIG5ld0xpbmsuaHJlZiA9IGAvcHVibGljLyR7ZmlsZW5hbWV9PyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gICAgLy8gV2hlbiB0aGUgbmV3IHN0eWxlc2hlZXQgbG9hZHMsIHJlbW92ZSBhbGwgb2xkIG9uZXNcbiAgICBuZXdMaW5rLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCBtYXRjaGluZyBvbGQgc3R5bGVzaGVldHNcbiAgICAgICAgbGlua0VsZW1lbnRzLmZvckVhY2gob2xkTGluayA9PiB7XG4gICAgICAgICAgICBvbGRMaW5rLnJlbW92ZSgpXG4gICAgICAgIH0pXG4gICAgICAgIHBlbmRpbmdTdHlsZXNoZWV0VXBkYXRlcy5kZWxldGUoZmlsZW5hbWUpXG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGxvYWRpbmcgZXJyb3JzXG4gICAgbmV3TGluay5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gbG9hZCBzdHlsZXNoZWV0OiAke25ld0xpbmsuaHJlZn1gKVxuICAgICAgICBwZW5kaW5nU3R5bGVzaGVldFVwZGF0ZXMuZGVsZXRlKGZpbGVuYW1lKVxuICAgIH1cblxuICAgIC8vIEluc2VydCB0aGUgbmV3IHN0eWxlc2hlZXQgYWZ0ZXIgdGhlIGZpcnN0IG1hdGNoaW5nIG9uZVxuICAgIGlmIChsaW5rRWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdExpbmsgPSBsaW5rRWxlbWVudHNbMF1cbiAgICAgICAgZmlyc3RMaW5rLnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShuZXdMaW5rLCBmaXJzdExpbmsubmV4dFNpYmxpbmcpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmFsbGJhY2s6IGFwcGVuZCB0byBoZWFkIGlmIG5vIGV4aXN0aW5nIHN0eWxlc2hlZXRzIGZvdW5kXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3TGluaylcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3dFeGNlcHRpb25QYWdlKHRhc2s6IHN0cmluZywgZXJyb3I6IHN0cmluZywgZGV0YWlsczogc3RyaW5nLCB0aW1lc3RhbXA6IHN0cmluZykge1xuICAgIC8vIFJlbW92ZSBleGlzdGluZyBleGNlcHRpb24gb3ZlcmxheSBpZiBpdCBleGlzdHNcbiAgICBpZiAoZXhjZXB0aW9uT3ZlcmxheSkge1xuICAgICAgICBleGNlcHRpb25PdmVybGF5LnJlbW92ZSgpXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGV4Y2VwdGlvbiBvdmVybGF5XG4gICAgZXhjZXB0aW9uT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZXhjZXB0aW9uT3ZlcmxheS5pZCA9ICdidW5jaHktZXhjZXB0aW9uLW92ZXJsYXknXG4gICAgZXhjZXB0aW9uT3ZlcmxheS5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJidW5jaHktZXhjZXB0aW9uLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1bmNoeS1leGNlcHRpb24taGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGgxPvCfmqggQnVpbGQgRXJyb3I8L2gxPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidW5jaHktZXhjZXB0aW9uLWNsb3NlXCIgb25jbGljaz1cInRoaXMucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlKClcIj7DlzwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnVuY2h5LWV4Y2VwdGlvbi1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1bmNoeS1leGNlcHRpb24tdGFza1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlRhc2s6PC9zdHJvbmc+ICR7dGFza31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnVuY2h5LWV4Y2VwdGlvbi1lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPkVycm9yOjwvc3Ryb25nPiAke2Vycm9yfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidW5jaHktZXhjZXB0aW9uLWRldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5EZXRhaWxzOjwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8cHJlPiR7ZGV0YWlsc308L3ByZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnVuY2h5LWV4Y2VwdGlvbi10aW1lc3RhbXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5UaW1lOjwvc3Ryb25nPiAke25ldyBEYXRlKHRpbWVzdGFtcCkudG9Mb2NhbGVTdHJpbmcoKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgXG5cbiAgICAvLyBBZGQgc3R5bGVzXG4gICAgY29uc3Qgc3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIHN0eWxlcy50ZXh0Q29udGVudCA9IGBcbiAgICAgICAgI2J1bmNoeS1leGNlcHRpb24tb3ZlcmxheSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuOCk7XG4gICAgICAgICAgICB6LWluZGV4OiAxMDAwMDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICAgICBmb250LWZhbWlseTogJ0NvdXJpZXIgTmV3JywgbW9ub3NwYWNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLmJ1bmNoeS1leGNlcHRpb24tY29udGFpbmVyIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICMxYTFhMWE7XG4gICAgICAgICAgICBjb2xvcjogI2ZmZjtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgICAgICAgIG1heC13aWR0aDogODAwcHg7XG4gICAgICAgICAgICB3aWR0aDogOTAlO1xuICAgICAgICAgICAgbWF4LWhlaWdodDogODB2aDtcbiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDRweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC41KTtcbiAgICAgICAgICAgIGJvcmRlcjogMnB4IHNvbGlkICNkYzI2MjY7XG4gICAgICAgIH1cblxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1oZWFkZXIge1xuICAgICAgICAgICAgYmFja2dyb3VuZDogI2RjMjYyNjtcbiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgICAgIHBhZGRpbmc6IDE2cHggMjBweDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNnB4IDZweCAwIDA7XG4gICAgICAgIH1cblxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1oZWFkZXIgaDEge1xuICAgICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICAgIH1cblxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1jbG9zZSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgICAgICAgZm9udC1zaXplOiAyNHB4O1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgICAgIHdpZHRoOiAzMHB4O1xuICAgICAgICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4ycztcbiAgICAgICAgfVxuXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLWNsb3NlOmhvdmVyIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLWNvbnRlbnQge1xuICAgICAgICAgICAgcGFkZGluZzogMjBweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLXRhc2ssXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLWVycm9yLFxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1kZXRhaWxzLFxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi10aW1lc3RhbXAge1xuICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTZweDtcbiAgICAgICAgfVxuXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLXRhc2sgc3Ryb25nLFxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1lcnJvciBzdHJvbmcsXG4gICAgICAgIC5idW5jaHktZXhjZXB0aW9uLWRldGFpbHMgc3Ryb25nLFxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi10aW1lc3RhbXAgc3Ryb25nIHtcbiAgICAgICAgICAgIGNvbG9yOiAjZmJiZjI0O1xuICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA0cHg7XG4gICAgICAgIH1cblxuICAgICAgICAuYnVuY2h5LWV4Y2VwdGlvbi1kZXRhaWxzIHByZSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjMmQyZDJkO1xuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzQwNDA0MDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgICAgIHBhZGRpbmc6IDEycHg7XG4gICAgICAgICAgICBvdmVyZmxvdy14OiBhdXRvO1xuICAgICAgICAgICAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICAgICAgICAgICAgd29yZC13cmFwOiBicmVhay13b3JkO1xuICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcbiAgICAgICAgICAgIGNvbG9yOiAjZjg3MTcxO1xuICAgICAgICB9XG5cbiAgICAgICAgLmJ1bmNoeS1leGNlcHRpb24tdGltZXN0YW1wIHtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgICAgIGNvbG9yOiAjOWNhM2FmO1xuICAgICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICM0MDQwNDA7XG4gICAgICAgICAgICBwYWRkaW5nLXRvcDogMTJweDtcbiAgICAgICAgfVxuICAgIGBcblxuICAgIC8vIEFkZCBzdHlsZXMgdG8gaGVhZCBpZiBub3QgYWxyZWFkeSBwcmVzZW50XG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYnVuY2h5LWV4Y2VwdGlvbi1zdHlsZXMnKSkge1xuICAgICAgICBzdHlsZXMuaWQgPSAnYnVuY2h5LWV4Y2VwdGlvbi1zdHlsZXMnXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVzKVxuICAgIH1cblxuICAgIC8vIEFkZCBvdmVybGF5IHRvIGJvZHlcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGV4Y2VwdGlvbk92ZXJsYXkpXG5cbiAgICAvLyBBZGQgZXNjYXBlIGtleSBoYW5kbGVyXG4gICAgY29uc3QgZXNjYXBlSGFuZGxlciA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScgJiYgZXhjZXB0aW9uT3ZlcmxheSkge1xuICAgICAgICAgICAgZXhjZXB0aW9uT3ZlcmxheS5yZW1vdmUoKVxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGVzY2FwZUhhbmRsZXIpXG4gICAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGVzY2FwZUhhbmRsZXIpXG59XG5cbmZ1bmN0aW9uIGhpZGVFeGNlcHRpb25QYWdlKCkge1xuICAgIGlmIChleGNlcHRpb25PdmVybGF5KSB7XG4gICAgICAgIGV4Y2VwdGlvbk92ZXJsYXkucmVtb3ZlKClcbiAgICAgICAgZXhjZXB0aW9uT3ZlcmxheSA9IG51bGxcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCdW5jaHlDbGllbnQgZXh0ZW5kcyBXZWJTb2NrZXRDbGllbnQge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBVc2UgdGhlIGZ1bGwgcGF0aCB0byBwcmV2ZW50IFdlYlNvY2tldENsaWVudCBmcm9tIGFwcGVuZGluZyAvd3NcbiAgICAgICAgLy8gVGhlIGVuZHBvaW50IHNob3VsZCBtYXRjaCB0aGUgcGF0aCBwcm92aWRlZCBpbiB0aGUgc2VydmVyIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgY29uc3QgdXJsID0gYHdzOi8vJHt3aW5kb3cubG9jYXRpb24uaG9zdG5hbWV9OiR7d2luZG93LmxvY2F0aW9uLnBvcnR9L2J1bmNoeWBcblxuICAgICAgICBzdXBlcih1cmwpXG5cbiAgICAgICAgLy8gU2V0IHVwIHJvdXRlIGhhbmRsZXJzIEJFRk9SRSBjb25uZWN0aW5nIHRvIGF2b2lkIHJhY2UgY29uZGl0aW9uXG4gICAgICAgIHRoaXMuc2V0dXBSb3V0ZXIoKVxuXG4gICAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSBoYW5kbGVycyBhcmUgZnVsbHkgcmVnaXN0ZXJlZCBiZWZvcmUgY29ubmVjdGluZ1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICAgIH0sIDEwMClcbiAgICB9XG5cbiAgICAgICAgc2V0dXBSb3V0ZXIoKSB7XG4gICAgICAgIC8vIFVzaW5nIFVSTC1iYXNlZCByb3V0aW5nIG1ldGhvZCBmb3IgaGFuZGxpbmcgYnVuY2h5IHRhc2sgbWVzc2FnZXNcbiAgICAgICAgdGhpcy5vblJvdXRlKCcvdGFza3MvY29kZV9mcm9udGVuZCcsICgpID0+IHtcbiAgICAgICAgICAgIGhpZGVFeGNlcHRpb25QYWdlKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMub25Sb3V0ZSgnL3Rhc2tzL2h0bWwnLCAoKSA9PiB7XG4gICAgICAgICAgICBoaWRlRXhjZXB0aW9uUGFnZSgpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLm9uUm91dGUoJy90YXNrcy9zdHlsZXMvYXBwJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtmaWxlbmFtZSwgcHVibGljUGF0aH0gPSBkYXRhIGFzIHtmaWxlbmFtZTogc3RyaW5nLCBwdWJsaWNQYXRoOiBzdHJpbmd9XG4gICAgICAgICAgICBoaWRlRXhjZXB0aW9uUGFnZSgpXG4gICAgICAgICAgICB1cGRhdGVTdHlsZXNoZWV0KGZpbGVuYW1lLCBwdWJsaWNQYXRoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMub25Sb3V0ZSgnL3Rhc2tzL3N0eWxlcy9jb21wb25lbnRzJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtmaWxlbmFtZSwgcHVibGljUGF0aH0gPSBkYXRhIGFzIHtmaWxlbmFtZTogc3RyaW5nLCBwdWJsaWNQYXRoOiBzdHJpbmd9XG4gICAgICAgICAgICBoaWRlRXhjZXB0aW9uUGFnZSgpXG4gICAgICAgICAgICB1cGRhdGVTdHlsZXNoZWV0KGZpbGVuYW1lLCBwdWJsaWNQYXRoKVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMub25Sb3V0ZSgnL3Rhc2tzL2Vycm9yJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHt0YXNrLCBlcnJvciwgZGV0YWlscywgdGltZXN0YW1wfSA9IGRhdGEgYXMge3Rhc2s6IHN0cmluZywgZXJyb3I6IHN0cmluZywgZGV0YWlsczogc3RyaW5nLCB0aW1lc3RhbXA6IHN0cmluZ31cbiAgICAgICAgICAgIHNob3dFeGNlcHRpb25QYWdlKHRhc2ssIGVycm9yLCBkZXRhaWxzLCB0aW1lc3RhbXApXG4gICAgICAgIH0pXG4gICAgfVxufVxuIiwKICAgICJpbXBvcnR7b3B0aW9ucyBhcyByLEZyYWdtZW50IGFzIGV9ZnJvbVwicHJlYWN0XCI7ZXhwb3J0e0ZyYWdtZW50fWZyb21cInByZWFjdFwiO3ZhciB0PS9bXCImPF0vO2Z1bmN0aW9uIG4ocil7aWYoMD09PXIubGVuZ3RofHwhMT09PXQudGVzdChyKSlyZXR1cm4gcjtmb3IodmFyIGU9MCxuPTAsbz1cIlwiLGY9XCJcIjtuPHIubGVuZ3RoO24rKyl7c3dpdGNoKHIuY2hhckNvZGVBdChuKSl7Y2FzZSAzNDpmPVwiJnF1b3Q7XCI7YnJlYWs7Y2FzZSAzODpmPVwiJmFtcDtcIjticmVhaztjYXNlIDYwOmY9XCImbHQ7XCI7YnJlYWs7ZGVmYXVsdDpjb250aW51ZX1uIT09ZSYmKG8rPXIuc2xpY2UoZSxuKSksbys9ZixlPW4rMX1yZXR1cm4gbiE9PWUmJihvKz1yLnNsaWNlKGUsbikpLG99dmFyIG89L2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxncmlkfG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmR8aXRlcmEvaSxmPTAsaT1BcnJheS5pc0FycmF5O2Z1bmN0aW9uIHUoZSx0LG4sbyxpLHUpe3R8fCh0PXt9KTt2YXIgYSxjLHA9dDtpZihcInJlZlwiaW4gcClmb3IoYyBpbiBwPXt9LHQpXCJyZWZcIj09Yz9hPXRbY106cFtjXT10W2NdO3ZhciBsPXt0eXBlOmUscHJvcHM6cCxrZXk6bixyZWY6YSxfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fYzpudWxsLGNvbnN0cnVjdG9yOnZvaWQgMCxfX3Y6LS1mLF9faTotMSxfX3U6MCxfX3NvdXJjZTppLF9fc2VsZjp1fTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBlJiYoYT1lLmRlZmF1bHRQcm9wcykpZm9yKGMgaW4gYSl2b2lkIDA9PT1wW2NdJiYocFtjXT1hW2NdKTtyZXR1cm4gci52bm9kZSYmci52bm9kZShsKSxsfWZ1bmN0aW9uIGEocil7dmFyIHQ9dShlLHt0cGw6cixleHByczpbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKX0pO3JldHVybiB0LmtleT10Ll9fdix0fXZhciBjPXt9LHA9L1tBLVpdL2c7ZnVuY3Rpb24gbChlLHQpe2lmKHIuYXR0cil7dmFyIGY9ci5hdHRyKGUsdCk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGYpcmV0dXJuIGZ9aWYoXCJyZWZcIj09PWV8fFwia2V5XCI9PT1lKXJldHVyblwiXCI7aWYoXCJzdHlsZVwiPT09ZSYmXCJvYmplY3RcIj09dHlwZW9mIHQpe3ZhciBpPVwiXCI7Zm9yKHZhciB1IGluIHQpe3ZhciBhPXRbdV07aWYobnVsbCE9YSYmXCJcIiE9PWEpe3ZhciBsPVwiLVwiPT11WzBdP3U6Y1t1XXx8KGNbdV09dS5yZXBsYWNlKHAsXCItJCZcIikudG9Mb3dlckNhc2UoKSkscz1cIjtcIjtcIm51bWJlclwiIT10eXBlb2YgYXx8bC5zdGFydHNXaXRoKFwiLS1cIil8fG8udGVzdChsKXx8KHM9XCJweDtcIiksaT1pK2wrXCI6XCIrYStzfX1yZXR1cm4gZSsnPVwiJytpKydcIid9cmV0dXJuIG51bGw9PXR8fCExPT09dHx8XCJmdW5jdGlvblwiPT10eXBlb2YgdHx8XCJvYmplY3RcIj09dHlwZW9mIHQ/XCJcIjohMD09PXQ/ZTplKyc9XCInK24odCkrJ1wiJ31mdW5jdGlvbiBzKHIpe2lmKG51bGw9PXJ8fFwiYm9vbGVhblwiPT10eXBlb2Ygcnx8XCJmdW5jdGlvblwiPT10eXBlb2YgcilyZXR1cm4gbnVsbDtpZihcIm9iamVjdFwiPT10eXBlb2Ygcil7aWYodm9pZCAwPT09ci5jb25zdHJ1Y3RvcilyZXR1cm4gcjtpZihpKHIpKXtmb3IodmFyIGU9MDtlPHIubGVuZ3RoO2UrKylyW2VdPXMocltlXSk7cmV0dXJuIHJ9fXJldHVybiBuKFwiXCIrcil9ZXhwb3J0e3UgYXMganN4LGwgYXMganN4QXR0cix1IGFzIGpzeERFVixzIGFzIGpzeEVzY2FwZSxhIGFzIGpzeFRlbXBsYXRlLHUgYXMganN4c307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qc3hSdW50aW1lLm1vZHVsZS5qcy5tYXBcbiIsCiAgICAiaW1wb3J0IHtofSBmcm9tICdwcmVhY3QnXG5pbXBvcnQge1xuICAgIEJ1dHRvbixcbiAgICBGaWVsZENoZWNrYm94LFxuICAgIEZpZWxkQ2hlY2tib3hHcm91cCxcbiAgICBGaWVsZFNlbGVjdCxcbiAgICBGaWVsZFRleHQsXG4gICAgRmllbGRVcGxvYWQsXG4gICAgSWNvbixcbiAgICBOb3RpZmljYXRpb25zLFxuICAgIFByb2dyZXNzLFxufSBmcm9tICdAZ2FyYWdlNDQvY29tbW9uL2NvbXBvbmVudHMnXG5pbXBvcnQge2RlZXBTaWduYWx9IGZyb20gJ2RlZXBzaWduYWwnXG5pbXBvcnQge0NvbXBvbmVudERlbW99IGZyb20gJy4uL2NvbXBvbmVudC1kZW1vJ1xuXG5jb25zdCBzdGF0ZSA9IGRlZXBTaWduYWwoe1xuICAgIG1vZGVsOiAndGVzdCcsXG59KVxuXG5leHBvcnQgY29uc3QgQ29tcG9uZW50cyA9ICgpID0+IChcbiAgICA8ZGl2IGNsYXNzPVwic3R5bGVndWlkZV9fcGFnZVwiPlxuICAgICAgICA8aDE+Q29tcG9uZW50czwvaDE+XG4gICAgICAgIDxwPkFsbCBhdmFpbGFibGUgY29tcG9uZW50cyBmcm9tIEBnYXJhZ2U0NC9jb21tb248L3A+XG5cbiAgICAgICAgey8qIDxDb21wb25lbnREZW1vIHRpdGxlPVwiQnV0dG9uXCIgY29tcG9uZW50PVwiQnV0dG9uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVtby1ncmlkXCI+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBsYWJlbD1cIkRlZmF1bHQgQnV0dG9uXCIgLz5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGxhYmVsPVwiUHJpbWFyeSBCdXR0b25cIiB0eXBlPVwicHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBsYWJlbD1cIlNlY29uZGFyeSBCdXR0b25cIiB0eXBlPVwic2Vjb25kYXJ5XCIgLz5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGxhYmVsPVwiRGFuZ2VyIEJ1dHRvblwiIHR5cGU9XCJkYW5nZXJcIiAvPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gaWNvbj1cInNldHRpbmdzXCIgbGFiZWw9XCJXaXRoIEljb25cIiAvPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gaWNvbj1cInNldHRpbmdzXCIgLz5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGxhYmVsPVwiRGlzYWJsZWRcIiBkaXNhYmxlZCAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQ29tcG9uZW50RGVtbz5cblxuICAgICAgICA8Q29tcG9uZW50RGVtbyB0aXRsZT1cIkljb25cIiBjb21wb25lbnQ9XCJJY29uXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVtby1ncmlkXCI+XG4gICAgICAgICAgICAgICAgPEljb24gbmFtZT1cInNldHRpbmdzXCIgLz5cbiAgICAgICAgICAgICAgICA8SWNvbiBuYW1lPVwiY2xvc2VcIiAvPlxuICAgICAgICAgICAgICAgIDxJY29uIG5hbWU9XCJjaGV2cm9uX2xlZnRcIiAvPlxuICAgICAgICAgICAgICAgIDxJY29uIG5hbWU9XCJjaGV2cm9uX3JpZ2h0XCIgLz5cbiAgICAgICAgICAgICAgICA8SWNvbiBuYW1lPVwiZXllXCIgLz5cbiAgICAgICAgICAgICAgICA8SWNvbiBuYW1lPVwiZXllX29mZlwiIC8+XG4gICAgICAgICAgICAgICAgPEljb24gbmFtZT1cImxvYWRpbmdcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQ29tcG9uZW50RGVtbz5cblxuICAgICAgICA8Q29tcG9uZW50RGVtbyB0aXRsZT1cIlByb2dyZXNzXCIgY29tcG9uZW50PVwiUHJvZ3Jlc3NcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZW1vLWdyaWRcIj5cbiAgICAgICAgICAgICAgICA8UHJvZ3Jlc3MgYm91bmRhcmllcz17MH0gbG9hZGluZz17ZmFsc2V9IHBlcmNlbnRhZ2U9ezB9IGlzbzYzOTE9XCJlblwiIC8+XG4gICAgICAgICAgICAgICAgPFByb2dyZXNzIGJvdW5kYXJpZXM9ezB9IGxvYWRpbmc9e2ZhbHNlfSBwZXJjZW50YWdlPXswLjI1fSBpc282MzkxPVwiZW5cIiAvPlxuICAgICAgICAgICAgICAgIDxQcm9ncmVzcyBib3VuZGFyaWVzPXswfSBsb2FkaW5nPXtmYWxzZX0gcGVyY2VudGFnZT17MC41fSBpc282MzkxPVwiZW5cIiAvPlxuICAgICAgICAgICAgICAgIDxQcm9ncmVzcyBib3VuZGFyaWVzPXswfSBsb2FkaW5nPXtmYWxzZX0gcGVyY2VudGFnZT17MC43NX0gaXNvNjM5MT1cImVuXCIgLz5cbiAgICAgICAgICAgICAgICA8UHJvZ3Jlc3MgYm91bmRhcmllcz17MH0gbG9hZGluZz17ZmFsc2V9IHBlcmNlbnRhZ2U9ezF9IGlzbzYzOTE9XCJlblwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Db21wb25lbnREZW1vPlxuXG4gICAgICAgIDxDb21wb25lbnREZW1vIHRpdGxlPVwiRmllbGQgVGV4dFwiIGNvbXBvbmVudD1cIkZpZWxkVGV4dFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlbW8tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxGaWVsZFRleHQgbGFiZWw9XCJCYXNpYyBJbnB1dFwiIG1vZGVsPVwidGVzdFwiIC8+XG4gICAgICAgICAgICAgICAgPEZpZWxkVGV4dCBsYWJlbD1cIldpdGggUGxhY2Vob2xkZXJcIiBwbGFjZWhvbGRlcj1cIkVudGVyIHRleHQuLi5cIiBtb2RlbD1cInRlc3RcIiAvPlxuICAgICAgICAgICAgICAgIDxGaWVsZFRleHQgbGFiZWw9XCJSZXF1aXJlZCBGaWVsZFwiIHJlcXVpcmVkIG1vZGVsPVwidGVzdFwiIC8+XG4gICAgICAgICAgICAgICAgPEZpZWxkVGV4dCBsYWJlbD1cIkRpc2FibGVkXCIgZGlzYWJsZWQgbW9kZWw9XCJ0ZXN0XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbXBvbmVudERlbW8+XG5cbiAgICAgICAgPENvbXBvbmVudERlbW8gdGl0bGU9XCJGaWVsZCBDaGVja2JveFwiIGNvbXBvbmVudD1cIkZpZWxkQ2hlY2tib3hcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZW1vLWdyaWRcIj5cbiAgICAgICAgICAgICAgICA8RmllbGRDaGVja2JveCBsYWJlbD1cIkJhc2ljIENoZWNrYm94XCIgbW9kZWw9XCJ0ZXN0XCIgLz5cbiAgICAgICAgICAgICAgICA8RmllbGRDaGVja2JveCBsYWJlbD1cIkNoZWNrZWRcIiBjaGVja2VkIG1vZGVsPVwidGVzdFwiIC8+XG4gICAgICAgICAgICAgICAgPEZpZWxkQ2hlY2tib3ggbGFiZWw9XCJEaXNhYmxlZFwiIGRpc2FibGVkIG1vZGVsPVwidGVzdFwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Db21wb25lbnREZW1vPlxuXG4gICAgICAgIDxDb21wb25lbnREZW1vIHRpdGxlPVwiRmllbGQgU2VsZWN0XCIgY29tcG9uZW50PVwiRmllbGRTZWxlY3RcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZW1vLWdyaWRcIj5cbiAgICAgICAgICAgICAgICA8RmllbGRTZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJCYXNpYyBTZWxlY3RcIlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAgICAgICAgICAgICAgICB7aWQ6ICdvcHRpb24xJywgbmFtZTogJ09wdGlvbiAxJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7aWQ6ICdvcHRpb24yJywgbmFtZTogJ09wdGlvbiAyJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7aWQ6ICdvcHRpb24zJywgbmFtZTogJ09wdGlvbiAzJ30sXG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbXBvbmVudERlbW8+XG5cbiAgICAgICAgPENvbXBvbmVudERlbW8gdGl0bGU9XCJGaWVsZCBDaGVja2JveCBHcm91cFwiIGNvbXBvbmVudD1cIkZpZWxkQ2hlY2tib3hHcm91cFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlbW8tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxGaWVsZENoZWNrYm94R3JvdXBcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJNdWx0aXBsZSBDaG9pY2VcIlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAgICAgICAgICAgICAgICB7aWQ6ICdpdGVtMScsIG5hbWU6ICdJdGVtIDEnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpZDogJ2l0ZW0yJywgbmFtZTogJ0l0ZW0gMid9LFxuICAgICAgICAgICAgICAgICAgICAgICAge2lkOiAnaXRlbTMnLCBuYW1lOiAnSXRlbSAzJ30sXG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbXBvbmVudERlbW8+XG5cbiAgICAgICAgPENvbXBvbmVudERlbW8gdGl0bGU9XCJGaWVsZCBVcGxvYWRcIiBjb21wb25lbnQ9XCJGaWVsZFVwbG9hZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlbW8tZ3JpZFwiPlxuICAgICAgICAgICAgICAgIDxGaWVsZFVwbG9hZCBsYWJlbD1cIkZpbGUgVXBsb2FkXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbXBvbmVudERlbW8+XG5cbiAgICAgICAgPENvbXBvbmVudERlbW8gdGl0bGU9XCJOb3RpZmljYXRpb25zXCIgY29tcG9uZW50PVwiTm90aWZpY2F0aW9uc1wiPlxuICAgICAgICAgICAgPE5vdGlmaWNhdGlvbnMgLz5cbiAgICAgICAgPC9Db21wb25lbnREZW1vPiAqL31cbiAgICA8L2Rpdj5cbikiLAogICAgImltcG9ydHtjcmVhdGVDb250ZXh0IGFzIG4sQ29tcG9uZW50IGFzIHQsdG9DaGlsZEFycmF5IGFzIHIsY2xvbmVFbGVtZW50IGFzIGksaCBhcyBvfWZyb21cInByZWFjdFwiO2ltcG9ydHt1c2VDb250ZXh0IGFzIGUsdXNlU3RhdGUgYXMgdSx1c2VFZmZlY3QgYXMgZn1mcm9tXCJwcmVhY3QvaG9va3NcIjt2YXIgYT17fTtmdW5jdGlvbiBjKG4sdCl7Zm9yKHZhciByIGluIHQpbltyXT10W3JdO3JldHVybiBufWZ1bmN0aW9uIHMobix0LHIpe3ZhciBpLG89Lyg/OlxcPyhbXiNdKikpPygjLiopPyQvLGU9bi5tYXRjaChvKSx1PXt9O2lmKGUmJmVbMV0pZm9yKHZhciBmPWVbMV0uc3BsaXQoXCImXCIpLGM9MDtjPGYubGVuZ3RoO2MrKyl7dmFyIHM9ZltjXS5zcGxpdChcIj1cIik7dVtkZWNvZGVVUklDb21wb25lbnQoc1swXSldPWRlY29kZVVSSUNvbXBvbmVudChzLnNsaWNlKDEpLmpvaW4oXCI9XCIpKX1uPWQobi5yZXBsYWNlKG8sXCJcIikpLHQ9ZCh0fHxcIlwiKTtmb3IodmFyIGg9TWF0aC5tYXgobi5sZW5ndGgsdC5sZW5ndGgpLHY9MDt2PGg7disrKWlmKHRbdl0mJlwiOlwiPT09dFt2XS5jaGFyQXQoMCkpe3ZhciBsPXRbdl0ucmVwbGFjZSgvKF46fFsrKj9dKyQpL2csXCJcIikscD0odFt2XS5tYXRjaCgvWysqP10rJC8pfHxhKVswXXx8XCJcIixtPX5wLmluZGV4T2YoXCIrXCIpLHk9fnAuaW5kZXhPZihcIipcIiksVT1uW3ZdfHxcIlwiO2lmKCFVJiYheSYmKHAuaW5kZXhPZihcIj9cIik8MHx8bSkpe2k9ITE7YnJlYWt9aWYodVtsXT1kZWNvZGVVUklDb21wb25lbnQoVSksbXx8eSl7dVtsXT1uLnNsaWNlKHYpLm1hcChkZWNvZGVVUklDb21wb25lbnQpLmpvaW4oXCIvXCIpO2JyZWFrfX1lbHNlIGlmKHRbdl0hPT1uW3ZdKXtpPSExO2JyZWFrfXJldHVybighMD09PXIuZGVmYXVsdHx8ITEhPT1pKSYmdX1mdW5jdGlvbiBoKG4sdCl7cmV0dXJuIG4ucmFuazx0LnJhbms/MTpuLnJhbms+dC5yYW5rPy0xOm4uaW5kZXgtdC5pbmRleH1mdW5jdGlvbiB2KG4sdCl7cmV0dXJuIG4uaW5kZXg9dCxuLnJhbms9ZnVuY3Rpb24obil7cmV0dXJuIG4ucHJvcHMuZGVmYXVsdD8wOmQobi5wcm9wcy5wYXRoKS5tYXAobCkuam9pbihcIlwiKX0obiksbi5wcm9wc31mdW5jdGlvbiBkKG4pe3JldHVybiBuLnJlcGxhY2UoLyheXFwvK3xcXC8rJCkvZyxcIlwiKS5zcGxpdChcIi9cIil9ZnVuY3Rpb24gbChuKXtyZXR1cm5cIjpcIj09bi5jaGFyQXQoMCk/MStcIiorP1wiLmluZGV4T2Yobi5jaGFyQXQobi5sZW5ndGgtMSkpfHw0OjV9dmFyIHA9e30sbT1bXSx5PVtdLFU9bnVsbCxnPXt1cmw6UigpfSxrPW4oZyk7ZnVuY3Rpb24gQygpe3ZhciBuPWUoayk7aWYobj09PWcpe3ZhciB0PXUoKVsxXTtmKGZ1bmN0aW9uKCl7cmV0dXJuIHkucHVzaCh0KSxmdW5jdGlvbigpe3JldHVybiB5LnNwbGljZSh5LmluZGV4T2YodCksMSl9fSxbXSl9cmV0dXJuW24sJF19ZnVuY3Rpb24gUigpe3ZhciBuO3JldHVyblwiXCIrKChuPVUmJlUubG9jYXRpb24/VS5sb2NhdGlvbjpVJiZVLmdldEN1cnJlbnRMb2NhdGlvbj9VLmdldEN1cnJlbnRMb2NhdGlvbigpOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBsb2NhdGlvbj9sb2NhdGlvbjpwKS5wYXRobmFtZXx8XCJcIikrKG4uc2VhcmNofHxcIlwiKX1mdW5jdGlvbiAkKG4sdCl7cmV0dXJuIHZvaWQgMD09PXQmJih0PSExKSxcInN0cmluZ1wiIT10eXBlb2YgbiYmbi51cmwmJih0PW4ucmVwbGFjZSxuPW4udXJsKSxmdW5jdGlvbihuKXtmb3IodmFyIHQ9bS5sZW5ndGg7dC0tOylpZihtW3RdLmNhblJvdXRlKG4pKXJldHVybiEwO3JldHVybiExfShuKSYmZnVuY3Rpb24obix0KXt2b2lkIDA9PT10JiYodD1cInB1c2hcIiksVSYmVVt0XT9VW3RdKG4pOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBoaXN0b3J5JiZoaXN0b3J5W3QrXCJTdGF0ZVwiXSYmaGlzdG9yeVt0K1wiU3RhdGVcIl0obnVsbCxudWxsLG4pfShuLHQ/XCJyZXBsYWNlXCI6XCJwdXNoXCIpLEkobil9ZnVuY3Rpb24gSShuKXtmb3IodmFyIHQ9ITEscj0wO3I8bS5sZW5ndGg7cisrKW1bcl0ucm91dGVUbyhuKSYmKHQ9ITApO3JldHVybiB0fWZ1bmN0aW9uIE0obil7aWYobiYmbi5nZXRBdHRyaWJ1dGUpe3ZhciB0PW4uZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSxyPW4uZ2V0QXR0cmlidXRlKFwidGFyZ2V0XCIpO2lmKHQmJnQubWF0Y2goL15cXC8vZykmJighcnx8ci5tYXRjaCgvXl8/c2VsZiQvaSkpKXJldHVybiAkKHQpfX1mdW5jdGlvbiBiKG4pe3JldHVybiBuLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiYmbi5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSxuLnN0b3BQcm9wYWdhdGlvbiYmbi5zdG9wUHJvcGFnYXRpb24oKSxuLnByZXZlbnREZWZhdWx0KCksITF9ZnVuY3Rpb24gVyhuKXtpZighKG4uY3RybEtleXx8bi5tZXRhS2V5fHxuLmFsdEtleXx8bi5zaGlmdEtleXx8bi5idXR0b24pKXt2YXIgdD1uLnRhcmdldDtkb3tpZihcImFcIj09PXQubG9jYWxOYW1lJiZ0LmdldEF0dHJpYnV0ZShcImhyZWZcIikpe2lmKHQuaGFzQXR0cmlidXRlKFwiZGF0YS1uYXRpdmVcIil8fHQuaGFzQXR0cmlidXRlKFwibmF0aXZlXCIpKXJldHVybjtpZihNKHQpKXJldHVybiBiKG4pfX13aGlsZSh0PXQucGFyZW50Tm9kZSl9fXZhciB3PSExO2Z1bmN0aW9uIEQobil7bi5oaXN0b3J5JiYoVT1uLmhpc3RvcnkpLHRoaXMuc3RhdGU9e3VybDpuLnVybHx8UigpfX1jKEQucHJvdG90eXBlPW5ldyB0LHtzaG91bGRDb21wb25lbnRVcGRhdGU6ZnVuY3Rpb24obil7cmV0dXJuITAhPT1uLnN0YXRpY3x8bi51cmwhPT10aGlzLnByb3BzLnVybHx8bi5vbkNoYW5nZSE9PXRoaXMucHJvcHMub25DaGFuZ2V9LGNhblJvdXRlOmZ1bmN0aW9uKG4pe3ZhciB0PXIodGhpcy5wcm9wcy5jaGlsZHJlbik7cmV0dXJuIHZvaWQgMCE9PXRoaXMuZyh0LG4pfSxyb3V0ZVRvOmZ1bmN0aW9uKG4pe3RoaXMuc2V0U3RhdGUoe3VybDpufSk7dmFyIHQ9dGhpcy5jYW5Sb3V0ZShuKTtyZXR1cm4gdGhpcy5wfHx0aGlzLmZvcmNlVXBkYXRlKCksdH0sY29tcG9uZW50V2lsbE1vdW50OmZ1bmN0aW9uKCl7dGhpcy5wPSEwfSxjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpe3ZhciBuPXRoaXM7d3x8KHc9ITAsVXx8YWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsZnVuY3Rpb24oKXtJKFIoKSl9KSxhZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixXKSksbS5wdXNoKHRoaXMpLFUmJih0aGlzLnU9VS5saXN0ZW4oZnVuY3Rpb24odCl7dmFyIHI9dC5sb2NhdGlvbnx8dDtuLnJvdXRlVG8oXCJcIisoci5wYXRobmFtZXx8XCJcIikrKHIuc2VhcmNofHxcIlwiKSl9KSksdGhpcy5wPSExfSxjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpe1wiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMudSYmdGhpcy51KCksbS5zcGxpY2UobS5pbmRleE9mKHRoaXMpLDEpfSxjb21wb25lbnRXaWxsVXBkYXRlOmZ1bmN0aW9uKCl7dGhpcy5wPSEwfSxjb21wb25lbnREaWRVcGRhdGU6ZnVuY3Rpb24oKXt0aGlzLnA9ITF9LGc6ZnVuY3Rpb24obix0KXtuPW4uZmlsdGVyKHYpLnNvcnQoaCk7Zm9yKHZhciByPTA7cjxuLmxlbmd0aDtyKyspe3ZhciBpPW5bcl0sbz1zKHQsaS5wcm9wcy5wYXRoLGkucHJvcHMpO2lmKG8pcmV0dXJuW2ksb119fSxyZW5kZXI6ZnVuY3Rpb24obix0KXt2YXIgZSx1LGY9bi5vbkNoYW5nZSxhPXQudXJsLHM9dGhpcy5jLGg9dGhpcy5nKHIobi5jaGlsZHJlbiksYSk7aWYoaCYmKHU9aShoWzBdLGMoYyh7dXJsOmEsbWF0Y2hlczplPWhbMV19LGUpLHtrZXk6dm9pZCAwLHJlZjp2b2lkIDB9KSkpLGEhPT0ocyYmcy51cmwpKXtjKGcscz10aGlzLmM9e3VybDphLHByZXZpb3VzOnMmJnMudXJsLGN1cnJlbnQ6dSxwYXRoOnU/dS5wcm9wcy5wYXRoOm51bGwsbWF0Y2hlczplfSkscy5yb3V0ZXI9dGhpcyxzLmFjdGl2ZT11P1t1XTpbXTtmb3IodmFyIHY9eS5sZW5ndGg7di0tOyl5W3ZdKHt9KTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBmJiZmKHMpfXJldHVybiBvKGsuUHJvdmlkZXIse3ZhbHVlOnN9LHUpfX0pO3ZhciBFPWZ1bmN0aW9uKG4pe3JldHVybiBvKFwiYVwiLGMoe29uQ2xpY2s6V30sbikpfSxMPWZ1bmN0aW9uKG4pe3JldHVybiBvKG4uY29tcG9uZW50LG4pfTtleHBvcnR7RSBhcyBMaW5rLEwgYXMgUm91dGUsRCBhcyBSb3V0ZXIsRCBhcyBkZWZhdWx0LHMgYXMgZXhlYyxSIGFzIGdldEN1cnJlbnRVcmwsJCBhcyByb3V0ZSxDIGFzIHVzZVJvdXRlcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3Qtcm91dGVyLm1vZHVsZS5qcy5tYXBcbiIsCiAgICAiaW1wb3J0IHtofSBmcm9tICdwcmVhY3QnXG5pbXBvcnQge3JvdXRlfSBmcm9tICdwcmVhY3Qtcm91dGVyJ1xuaW1wb3J0IHskc30gZnJvbSAnLi4vYXBwJ1xuXG5leHBvcnQgY29uc3QgTmF2aWdhdGlvbiA9ICgpID0+IChcbiAgICA8bmF2IGNsYXNzPVwic3R5bGVndWlkZV9fbmF2XCI+XG4gICAgICAgIDxoMSBjbGFzcz1cInN0eWxlZ3VpZGVfX3RpdGxlXCI+R2FyYWdlNDQgQ29tbW9uPC9oMT5cbiAgICAgICAgPHVsIGNsYXNzPVwic3R5bGVndWlkZV9fbmF2LWxpc3RcIj5cbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgc3R5bGVndWlkZV9fbmF2LWxpbmsgJHskcy5jdXJyZW50Um91dGUgPT09ICcvY29tcG9uZW50cycgPyAnYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzLmN1cnJlbnRSb3V0ZSA9ICcvY29tcG9uZW50cydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlKCcvY29tcG9uZW50cycpXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRzXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9e2BzdHlsZWd1aWRlX19uYXYtbGluayAkeyRzLmN1cnJlbnRSb3V0ZSA9PT0gJy90b2tlbnMnID8gJ2FjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcy5jdXJyZW50Um91dGUgPSAnL3Rva2VucydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlKCcvdG9rZW5zJylcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIERlc2lnbiBUb2tlbnNcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgPC9uYXY+XG4pIiwKICAgICJpbXBvcnQge2h9IGZyb20gJ3ByZWFjdCdcblxuZXhwb3J0IGNvbnN0IFRva2VucyA9ICgpID0+IChcbiAgICA8ZGl2IGNsYXNzPVwic3R5bGVndWlkZV9fcGFnZVwiPlxuICAgICAgICA8aDE+RGVzaWduIFRva2VuczwvaDE+XG4gICAgICAgIDxwPkNvbG9ycywgdHlwb2dyYXBoeSwgc3BhY2luZywgYW5kIG90aGVyIGRlc2lnbiBzeXN0ZW0gdmFsdWVzPC9wPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidG9rZW4tc2VjdGlvblwiPlxuICAgICAgICAgICAgPGgyPkNvbG9yczwvaDI+XG5cbiAgICAgICAgICAgIDxoMz5TdXJmYWNlIChOZXV0cmFsKTwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sb3ItZ3JpZFwiPlxuICAgICAgICAgICAgICAgIHtbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOF0ubWFwKGkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3M9XCJjb2xvci1zd2F0Y2hcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2xvci1zd2F0Y2hfX2NvbG9yXCIgc3R5bGU9e2BiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlLSR7aX0pYH0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sb3Itc3dhdGNoX19sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlPi0tc3VyZmFjZS17aX08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGgzPlByaW1hcnk8L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLWdyaWRcIj5cbiAgICAgICAgICAgICAgICB7WzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdLm1hcChpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzPVwiY29sb3Itc3dhdGNoXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sb3Itc3dhdGNoX19jb2xvclwiIHN0eWxlPXtgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS0ke2l9KWB9PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLXN3YXRjaF9fbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT4tLXByaW1hcnkte2l9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxoMz5TdWNjZXNzPC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2xvci1ncmlkXCI+XG4gICAgICAgICAgICAgICAge1swLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XS5tYXAoaSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzcz1cImNvbG9yLXN3YXRjaFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLXN3YXRjaF9fY29sb3JcIiBzdHlsZT17YGJhY2tncm91bmQ6IHZhcigtLXN1Y2Nlc3MtJHtpfSlgfT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2xvci1zd2F0Y2hfX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGU+LS1zdWNjZXNzLXtpfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8aDM+RGFuZ2VyPC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2xvci1ncmlkXCI+XG4gICAgICAgICAgICAgICAge1swLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XS5tYXAoaSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzcz1cImNvbG9yLXN3YXRjaFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLXN3YXRjaF9fY29sb3JcIiBzdHlsZT17YGJhY2tncm91bmQ6IHZhcigtLWRhbmdlci0ke2l9KWB9PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLXN3YXRjaF9fbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT4tLWRhbmdlci17aX08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGgzPldhcm5pbmc8L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLWdyaWRcIj5cbiAgICAgICAgICAgICAgICB7WzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdLm1hcChpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzPVwiY29sb3Itc3dhdGNoXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sb3Itc3dhdGNoX19jb2xvclwiIHN0eWxlPXtgYmFja2dyb3VuZDogdmFyKC0td2FybmluZy0ke2l9KWB9PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLXN3YXRjaF9fbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT4tLXdhcm5pbmcte2l9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzcz1cInRva2VuLXNlY3Rpb25cIj5cbiAgICAgICAgICAgIDxoMj5UeXBvZ3JhcGh5PC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LXNjYWxlXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR5cG9ncmFwaHktaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHlwb2dyYXBoeS1leGFtcGxlXCIgc3R5bGU9XCJmb250LXNpemU6IHZhcigtLWZvbnQteHhzKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZ1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+LS1mb250LXh4cyAoMC42MXJlbSAvIDEwcHgpPC9jb2RlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR5cG9ncmFwaHktZXhhbXBsZVwiIHN0eWxlPVwiZm9udC1zaXplOiB2YXIoLS1mb250LXhzKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZ1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+LS1mb250LXhzICgwLjc0cmVtIC8gMTJweCk8L2NvZGU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR5cG9ncmFwaHktaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHlwb2dyYXBoeS1leGFtcGxlXCIgc3R5bGU9XCJmb250LXNpemU6IHZhcigtLWZvbnQtcylcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBxdWljayBicm93biBmb3gganVtcHMgb3ZlciB0aGUgbGF6eSBkb2dcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlPi0tZm9udC1zICgwLjhyZW0gLyAxM3B4KTwvY29kZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHlwb2dyYXBoeS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LWV4YW1wbGVcIiBzdHlsZT1cImZvbnQtc2l6ZTogdmFyKC0tZm9udC1kKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZ1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+LS1mb250LWQgKDAuOXJlbSAvIDE0cHgpPC9jb2RlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR5cG9ncmFwaHktZXhhbXBsZVwiIHN0eWxlPVwiZm9udC1zaXplOiB2YXIoLS1mb250LWwpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgcXVpY2sgYnJvd24gZm94IGp1bXBzIG92ZXIgdGhlIGxhenkgZG9nXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Y29kZT4tLWZvbnQtbCAoMS4wNXJlbSAvIDE3cHgpPC9jb2RlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInR5cG9ncmFwaHktZXhhbXBsZVwiIHN0eWxlPVwiZm9udC1zaXplOiB2YXIoLS1mb250LXhsKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZ1xuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGU+LS1mb250LXhsICgxLjNyZW0gLyAyMXB4KTwvY29kZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHlwb2dyYXBoeS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBvZ3JhcGh5LWV4YW1wbGVcIiBzdHlsZT1cImZvbnQtc2l6ZTogdmFyKC0tZm9udC14eGwpXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgcXVpY2sgYnJvd24gZm94IGp1bXBzIG92ZXIgdGhlIGxhenkgZG9nXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Y29kZT4tLWZvbnQteHhsICgzcmVtIC8gNDhweCk8L2NvZGU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidG9rZW4tc2VjdGlvblwiPlxuICAgICAgICAgICAgPGgyPlNwYWNpbmc8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNpbmctc2NhbGVcIj5cbiAgICAgICAgICAgICAgICB7W1xuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJy0tc3BhY2VyLTAyNScsIHZhbHVlOiAnY2FsYyh2YXIoLS1zcGFjZXItMSkgKiAwLjI1KScsIHB4OiAnMnB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1zcGFjZXItMDUnLCB2YWx1ZTogJ2NhbGModmFyKC0tc3BhY2VyLTEpICogMC41KScsIHB4OiAnNHB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1zcGFjZXItMScsIHZhbHVlOiAnOHB4JywgcHg6ICc4cHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLXNwYWNlci0yJywgdmFsdWU6ICdjYWxjKHZhcigtLXNwYWNlci0xKSAqIDIpJywgcHg6ICcxNnB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1zcGFjZXItMycsIHZhbHVlOiAnY2FsYyh2YXIoLS1zcGFjZXItMSkgKiAzKScsIHB4OiAnMjRweCd9LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJy0tc3BhY2VyLTQnLCB2YWx1ZTogJ2NhbGModmFyKC0tc3BhY2VyLTEpICogNCknLCBweDogJzMycHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLXNwYWNlci01JywgdmFsdWU6ICdjYWxjKHZhcigtLXNwYWNlci0xKSAqIDUpJywgcHg6ICc0MHB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1zcGFjZXItNicsIHZhbHVlOiAnY2FsYyh2YXIoLS1zcGFjZXItMSkgKiA2KScsIHB4OiAnNDhweCd9LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJy0tc3BhY2VyLTcnLCB2YWx1ZTogJ2NhbGModmFyKC0tc3BhY2VyLTEpICogNyknLCBweDogJzU2cHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLXNwYWNlci04JywgdmFsdWU6ICdjYWxjKHZhcigtLXNwYWNlci0xKSAqIDgpJywgcHg6ICc2NHB4J30sXG4gICAgICAgICAgICAgICAgXS5tYXAoKHtuYW1lLCB2YWx1ZSwgcHh9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtuYW1lfSBjbGFzcz1cInNwYWNpbmctaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNpbmctdmlzdWFsXCIgc3R5bGU9e2B3aWR0aDogdmFyKCR7bmFtZX0pOyBoZWlnaHQ6IHZhcigke25hbWV9KWB9PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNwYWNpbmctaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlPntuYW1lfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3BhY2luZy12YWx1ZVwiPnt2YWx1ZX0gKHtweH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzPVwidG9rZW4tc2VjdGlvblwiPlxuICAgICAgICAgICAgPGgyPkljb25zPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpY29uLXNjYWxlXCI+XG4gICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWljb24teHMnLCBweDogJzE0cHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWljb24tcycsIHB4OiAnMTZweCd9LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJy0taWNvbi1kJywgcHg6ICcyNHB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1pY29uLWwnLCBweDogJzMycHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWljb24teGwnLCBweDogJzM2cHgnfSxcbiAgICAgICAgICAgICAgICBdLm1hcCgoe25hbWUsIHB4fSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17bmFtZX0gY2xhc3M9XCJpY29uLXNpemUtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb24tc2l6ZS12aXN1YWxcIiBzdHlsZT17YHdpZHRoOiB2YXIoJHtuYW1lfSk7IGhlaWdodDogdmFyKCR7bmFtZX0pYH0+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaWNvbi1zaXplLWluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT57bmFtZX08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImljb24tc2l6ZS12YWx1ZVwiPntweH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJ0b2tlbi1zZWN0aW9uXCI+XG4gICAgICAgICAgICA8aDI+Qm9yZGVyIFJhZGl1czwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmFkaXVzLXNjYWxlXCI+XG4gICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWJvcmRlci1yYWRpdXMteHMnLCBweDogJzRweCd9LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJy0tYm9yZGVyLXJhZGl1cy1zJywgcHg6ICc0cHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWJvcmRlci1yYWRpdXMtZCcsIHB4OiAnOHB4J30sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnLS1ib3JkZXItcmFkaXVzLWwnLCBweDogJzEycHgnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICctLWJvcmRlci1yYWRpdXMteGwnLCBweDogJzE2cHgnfSxcbiAgICAgICAgICAgICAgICBdLm1hcCgoe25hbWUsIHB4fSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17bmFtZX0gY2xhc3M9XCJyYWRpdXMtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJhZGl1cy12aXN1YWxcIiBzdHlsZT17YGJvcmRlci1yYWRpdXM6IHZhcigke25hbWV9KWB9PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJhZGl1cy1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGU+e25hbWV9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyYWRpdXMtdmFsdWVcIj57cHh9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuKSIsCiAgICAiaW1wb3J0IHtDb21wb25lbnRzfSBmcm9tICcuL3BhZ2VzL2NvbXBvbmVudHMnXG5pbXBvcnQge05hdmlnYXRpb259IGZyb20gJy4vbmF2aWdhdGlvbidcbmltcG9ydCB7Um91dGVyfSBmcm9tICdwcmVhY3Qtcm91dGVyJ1xuaW1wb3J0IHtUb2tlbnN9IGZyb20gJy4vcGFnZXMvdG9rZW5zJ1xuXG5leHBvcnQgY29uc3QgTWFpbiA9ICgpID0+IChcbiAgICA8ZGl2IGNsYXNzPVwic3R5bGVndWlkZVwiPlxuICAgICAgICA8TmF2aWdhdGlvbiAvPlxuICAgICAgICA8bWFpbiBjbGFzcz1cInN0eWxlZ3VpZGVfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgIDxSb3V0ZXI+XG4gICAgICAgICAgICAgICAgPENvbXBvbmVudHMgcGF0aD1cIi9jb21wb25lbnRzXCIgLz5cbiAgICAgICAgICAgICAgICA8Q29tcG9uZW50cyBwYXRoPVwiL1wiIGRlZmF1bHQgLz5cbiAgICAgICAgICAgICAgICA8VG9rZW5zIHBhdGg9XCIvdG9rZW5zXCIgLz5cbiAgICAgICAgICAgIDwvUm91dGVyPlxuICAgICAgICA8L21haW4+XG4gICAgPC9kaXY+XG4pIiwKICAgICJpbXBvcnQge1xuICAgIEFwcCxcbiAgICAkcyBhcyBfJHMsXG4gICAgc3RvcmUsXG59IGZyb20gJ0BnYXJhZ2U0NC9jb21tb24vYXBwJ1xuaW1wb3J0IHtoLCByZW5kZXJ9IGZyb20gJ3ByZWFjdCdcbmltcG9ydCB7cGVyc2lzdGFudFN0YXRlLCB2b2xhdGlsZVN0YXRlfSBmcm9tICcuL2xpYi9zdGF0ZSdcbmltcG9ydCB7QnVuY2h5Q2xpZW50fSBmcm9tICdAZ2FyYWdlNDQvYnVuY2h5L2NsaWVudCdcbmltcG9ydCB7TWFpbn0gZnJvbSAnQC9jb21wb25lbnRzL21haW4nXG5pbXBvcnQgdHlwZSB7U3R5bGVndWlkZVN0YXRlfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHtpMThuRm9ybWF0fSBmcm9tICdAZ2FyYWdlNDQvY29tbW9uL2xpYi9pMThuLnRzJ1xuLy8gRGV2ZWxvcG1lbnQgY2xpZW50IGlzIGluamVjdGVkIGhlcmVcbnByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnICYmIG5ldyBCdW5jaHlDbGllbnQoKVxuXG5jb25zdCAkcyA9IF8kcyBhcyBTdHlsZWd1aWRlU3RhdGVcblxuc3RvcmUubG9hZChwZXJzaXN0YW50U3RhdGUsIHZvbGF0aWxlU3RhdGUpXG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4vLyBTaW1wbGUgbW9jayB0cmFuc2xhdGlvbnMgZm9yIHRoZSBzdHlsZWd1aWRlXG5jb25zdCBtb2NrVHJhbnNsYXRpb25zID0ge1xuICAgICduYXYuY29tcG9uZW50cyc6ICdDb21wb25lbnRzJyxcbiAgICAnbmF2LnRva2Vucyc6ICdEZXNpZ24gVG9rZW5zJyxcbiAgICAnc3R5bGVndWlkZS5jb21wb25lbnRzJzogJ0NvbXBvbmVudHMnLFxuICAgICdzdHlsZWd1aWRlLnRpdGxlJzogJ0dhcmFnZTQ0IENvbW1vbiBTdHlsZWd1aWRlJyxcbiAgICAnc3R5bGVndWlkZS50b2tlbnMnOiAnRGVzaWduIFRva2VucycsXG59XG5cbmFwcC5pbml0KE1haW4sIHJlbmRlciwgaCwgbW9ja1RyYW5zbGF0aW9ucylcblxuZXhwb3J0IHtcbiAgICAkcyxcbiAgICBhcHAsXG59IgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBT0MsUUFBUyxHQUFHO0FBQUEsSUFHWixJQUFJLFNBQVMsQ0FBQyxFQUFFO0FBQUEsSUFFaEIsU0FBUyxVQUFXLEdBQUc7QUFBQSxNQUN0QixJQUFJLFVBQVU7QUFBQSxNQUVkLFNBQVMsSUFBSSxFQUFHLElBQUksVUFBVSxRQUFRLEtBQUs7QUFBQSxRQUMxQyxJQUFJLE1BQU0sVUFBVTtBQUFBLFFBQ3BCLElBQUksS0FBSztBQUFBLFVBQ1IsVUFBVSxZQUFZLFNBQVMsV0FBVyxHQUFHLENBQUM7QUFBQSxRQUMvQztBQUFBLE1BQ0Q7QUFBQSxNQUVBLE9BQU87QUFBQTtBQUFBLElBR1IsU0FBUyxVQUFXLENBQUMsS0FBSztBQUFBLE1BQ3pCLElBQUksT0FBTyxRQUFRLFlBQVksT0FBTyxRQUFRLFVBQVU7QUFBQSxRQUN2RCxPQUFPO0FBQUEsTUFDUjtBQUFBLE1BRUEsSUFBSSxPQUFPLFFBQVEsVUFBVTtBQUFBLFFBQzVCLE9BQU87QUFBQSxNQUNSO0FBQUEsTUFFQSxJQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFBQSxRQUN2QixPQUFPLFdBQVcsTUFBTSxNQUFNLEdBQUc7QUFBQSxNQUNsQztBQUFBLE1BRUEsSUFBSSxJQUFJLGFBQWEsT0FBTyxVQUFVLGFBQWEsSUFBSSxTQUFTLFNBQVMsRUFBRSxTQUFTLGVBQWUsR0FBRztBQUFBLFFBQ3JHLE9BQU8sSUFBSSxTQUFTO0FBQUEsTUFDckI7QUFBQSxNQUVBLElBQUksVUFBVTtBQUFBLE1BRWQsU0FBUyxPQUFPLEtBQUs7QUFBQSxRQUNwQixJQUFJLE9B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QUFBLEVBQUc7QUFBQSxFQUFDLElBQUcsV0FBYztBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUksT0FBTyxVQUFVLE1BQU07QUFBQTtBQUFFLFNBQVMsUUFBUSxDQUFDLE1BQUssSUFBRztBQUFBLEVBQUMsSUFBRyxXQUFXLElBQUksR0FBRSxXQUFXLEVBQUUsR0FBRSxTQUFPO0FBQUEsSUFBRyxPQUFNO0FBQUEsRUFBRyxJQUFHLE9BQUssUUFBUSxJQUFJLEdBQUUsS0FBRyxRQUFRLEVBQUUsR0FBRSxTQUFPO0FBQUEsSUFBRyxPQUFNO0FBQUEsRUFBRyxJQUFJLFlBQVU7QUFBQSxFQUFFLE1BQUssWUFBVSxLQUFLLFVBQVM7QUFBQSxJQUFVLElBQUcsS0FBSyxXQUFXLFNBQVMsTUFBSTtBQUFBLE1BQUc7QUFBQSxFQUFNLElBQUksVUFBUSxLQUFLLFFBQU8sVUFBUSxVQUFRLFdBQVUsVUFBUTtBQUFBLEVBQUUsTUFBSyxVQUFRLEdBQUcsVUFBUztBQUFBLElBQVEsSUFBRyxHQUFHLFdBQVcsT0FBTyxNQUFJO0FBQUEsTUFBRztBQUFBLEVBQU0sSUFBSSxRQUFNLEdBQUcsUUFBTyxRQUFNLFFBQU0sU0FBUSxTQUFPLFVBQVEsUUFBTSxVQUFRLE9BQU0sZ0JBQWMsSUFBRyxLQUFFO0FBQUEsRUFBRSxNQUFLLE1BQUcsVUFBUyxJQUFFO0FBQUEsSUFBQyxJQUFHLE9BQUksUUFBTztBQUFBLE1BQUMsSUFBRyxRQUFNLFFBQU87QUFBQSxRQUFDLElBQUcsR0FBRyxXQUFXLFVBQVEsRUFBQyxNQUFJO0FBQUEsVUFBRyxPQUFPLEdBQUcsTUFBTSxVQUFRLEtBQUUsQ0FBQztBQUFBLFFBQU8sU0FBRyxPQUFJO0FBQUEsVUFBRSxPQUFPLEdBQUcsTUFBTSxVQUFRLEVBQUM7QUFBQSxNQUFDLEVBQU0sU0FBRyxVQUFRLFFBQU87QUFBQSxRQUFDLElBQUcsS0FBSyxXQUFXLFlBQVUsRUFBQyxNQUFJO0FBQUEsVUFBRyxnQkFBYztBQUFBLFFBQU8sU0FBRyxPQUFJO0FBQUEsVUFBRSxnQkFBYztBQUFBLE1BQUM7QUFBQSxNQUFDO0FBQUEsSUFBSztBQUFBLElBQUMsSUFBSSxXQUFTLEtBQUssV0FBVyxZQUFVLEVBQUMsR0FBRSxTQUFPLEdBQUcsV0FBVyxVQUFRLEVBQUM7QUFBQSxJQUFFLElBQUcsYUFBVztBQUFBLE1BQU87QUFBQSxJQUFXLFNBQUcsYUFBVztBQUFBLE1BQUcsZ0JBQWM7QUFBQSxFQUFDO0FBQUEsRUFBQyxJQUFJLE1BQUk7QUFBQSxFQUFHLEtBQUksS0FBRSxZQUFVLGdCQUFjLEVBQUUsTUFBRyxXQUFVO0FBQUEsSUFBRSxJQUFHLE9BQUksV0FBUyxLQUFLLFdBQVcsRUFBQyxNQUFJO0FBQUEsTUFBRyxJQUFHLElBQUksV0FBUztBQUFBLFFBQUUsT0FBSztBQUFBLE1BQVU7QUFBQSxlQUFLO0FBQUEsRUFBTSxJQUFHLElBQUksU0FBTztBQUFBLElBQUUsT0FBTyxNQUFJLEdBQUcsTUFBTSxVQUFRLGFBQWE7QUFBQSxFQUFNO0FBQUEsSUFBQyxJQUFHLFdBQVMsZUFBYyxHQUFHLFdBQVcsT0FBTyxNQUFJO0FBQUEsUUFBSztBQUFBLElBQVEsT0FBTyxHQUFHLE1BQU0sT0FBTztBQUFBO0FBQUE7QUFBRyxTQUFTLFNBQVMsQ0FBQyxNQUFLO0FBQUEsRUFBQyxPQUFPO0FBQUE7QUFBSyxTQUFTLE9BQU8sQ0FBQyxNQUFLO0FBQUEsRUFBQyxJQUFHLFdBQVcsSUFBSSxHQUFFLEtBQUssV0FBUztBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUksSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDLEdBQUUsVUFBUSxTQUFPLElBQUcsTUFBSSxJQUFHLGVBQWE7QUFBQSxFQUFHLFNBQVEsS0FBRSxLQUFLLFNBQU8sRUFBRSxNQUFHLEtBQUk7QUFBQSxJQUFFLElBQUcsT0FBSyxLQUFLLFdBQVcsRUFBQyxHQUFFLFNBQU8sSUFBRztBQUFBLE1BQUMsS0FBSSxjQUFhO0FBQUEsUUFBQyxNQUFJO0FBQUEsUUFBRTtBQUFBLE1BQUs7QUFBQSxJQUFDLEVBQU07QUFBQSxxQkFBYTtBQUFBLEVBQUcsSUFBRyxRQUFNO0FBQUEsSUFBRyxPQUFPLFVBQVEsTUFBSTtBQUFBLEVBQUksSUFBRyxXQUFTLFFBQU07QUFBQSxJQUFFLE9BQU07QUFBQSxFQUFLLE9BQU8sS0FBSyxNQUFNLEdBQUUsR0FBRztBQUFBO0FBQUUsU0FBUyxRQUFRLENBQUMsTUFBSyxLQUFJO0FBQUEsRUFBQyxJQUFHLFFBQVcsYUFBRyxPQUFPLFFBQU07QUFBQSxJQUFTLE1BQU0sSUFBSSxVQUFVLGlDQUFpQztBQUFBLEVBQUUsV0FBVyxJQUFJO0FBQUEsRUFBRSxJQUFJLFFBQU0sR0FBRSxNQUFJLElBQUcsZUFBYSxNQUFHO0FBQUEsRUFBRSxJQUFHLFFBQVcsYUFBRyxJQUFJLFNBQU8sS0FBRyxJQUFJLFVBQVEsS0FBSyxRQUFPO0FBQUEsSUFBQyxJQUFHLElBQUksV0FBUyxLQUFLLFVBQVEsUUFBTTtBQUFBLE1BQUssT0FBTTtBQUFBLElBQUcsSUFBSSxTQUFPLElBQUksU0FBTyxHQUFFLG1CQUFpQjtBQUFBLElBQUcsS0FBSSxLQUFFLEtBQUssU0FBTyxFQUFFLE1BQUcsS0FBSSxJQUFFO0FBQUEsTUFBQyxJQUFJLE9BQUssS0FBSyxXQUFXLEVBQUM7QUFBQSxNQUFFLElBQUcsU0FBTyxJQUFHO0FBQUEsUUFBQyxLQUFJLGNBQWE7QUFBQSxVQUFDLFFBQU0sS0FBRTtBQUFBLFVBQUU7QUFBQSxRQUFLO0FBQUEsTUFBQyxFQUFLO0FBQUEsUUFBQyxJQUFHLHFCQUFtQjtBQUFBLFVBQUcsZUFBYSxPQUFHLG1CQUFpQixLQUFFO0FBQUEsUUFBRSxJQUFHLFVBQVE7QUFBQSxVQUFFLElBQUcsU0FBTyxJQUFJLFdBQVcsTUFBTSxHQUFFO0FBQUEsWUFBQyxNQUFLLFdBQVM7QUFBQSxjQUFHLE1BQUk7QUFBQSxVQUFDLEVBQU07QUFBQSxxQkFBTyxJQUFHLE1BQUk7QUFBQTtBQUFBLElBQWlCO0FBQUEsSUFBQyxJQUFHLFVBQVE7QUFBQSxNQUFJLE1BQUk7QUFBQSxJQUFzQixTQUFHLFFBQU07QUFBQSxNQUFHLE1BQUksS0FBSztBQUFBLElBQU8sT0FBTyxLQUFLLE1BQU0sT0FBTSxHQUFHO0FBQUEsRUFBQyxFQUFLO0FBQUEsSUFBQyxLQUFJLEtBQUUsS0FBSyxTQUFPLEVBQUUsTUFBRyxLQUFJO0FBQUEsTUFBRSxJQUFHLEtBQUssV0FBVyxFQUFDLE1BQUksSUFBRztBQUFBLFFBQUMsS0FBSSxjQUFhO0FBQUEsVUFBQyxRQUFNLEtBQUU7QUFBQSxVQUFFO0FBQUEsUUFBSztBQUFBLE1BQUMsRUFBTSxTQUFHLFFBQU07QUFBQSxRQUFHLGVBQWEsT0FBRyxNQUFJLEtBQUU7QUFBQSxJQUFFLElBQUcsUUFBTTtBQUFBLE1BQUcsT0FBTTtBQUFBLElBQUcsT0FBTyxLQUFLLE1BQU0sT0FBTSxHQUFHO0FBQUE7QUFBQTtBQUFHLFNBQVMsT0FBTyxDQUFDLE1BQUs7QUFBQSxFQUFDLFdBQVcsSUFBSTtBQUFBLEVBQUUsSUFBSSxXQUFTLElBQUcsWUFBVSxHQUFFLE1BQUksSUFBRyxlQUFhLE1BQUcsY0FBWTtBQUFBLEVBQUUsU0FBUSxLQUFFLEtBQUssU0FBTyxFQUFFLE1BQUcsS0FBSSxJQUFFO0FBQUEsSUFBQyxJQUFJLE9BQUssS0FBSyxXQUFXLEVBQUM7QUFBQSxJQUFFLElBQUcsU0FBTyxJQUFHO0FBQUEsTUFBQyxLQUFJLGNBQWE7QUFBQSxRQUFDLFlBQVUsS0FBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsTUFBQztBQUFBLElBQVE7QUFBQSxJQUFDLElBQUcsUUFBTTtBQUFBLE1BQUcsZUFBYSxPQUFHLE1BQUksS0FBRTtBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsYUFBVztBQUFBLFFBQUcsV0FBUztBQUFBLE1BQU8sU0FBRyxnQkFBYztBQUFBLFFBQUUsY0FBWTtBQUFBLElBQUMsRUFBTSxTQUFHLGFBQVc7QUFBQSxNQUFHLGNBQVk7QUFBQSxFQUFFO0FBQUEsRUFBQyxJQUFHLGFBQVcsTUFBSSxRQUFNLE1BQUksZ0JBQWMsS0FBRyxnQkFBYyxLQUFHLGFBQVcsTUFBSSxLQUFHLGFBQVcsWUFBVTtBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUcsT0FBTyxLQUFLLE1BQU0sVUFBUyxHQUFHO0FBQUE7QUFBRSxTQUFTLE1BQU0sQ0FBQyxZQUFXO0FBQUEsRUFBQyxJQUFHLGVBQWEsUUFBTSxPQUFPLGVBQWE7QUFBQSxJQUFTLE1BQU0sSUFBSSxVQUFVLHFFQUFtRSxPQUFPLFVBQVU7QUFBQSxFQUFFLE9BQU8sUUFBUSxLQUFJLFVBQVU7QUFBQTtBQUFFLFNBQVMsS0FBSyxDQUFDLE1BQUs7QUFBQSxFQUFDLFdBQVcsSUFBSTtBQUFBLEVBQUUsSUFBSSxNQUFJLEVBQUMsTUFBSyxJQUFHLEtBQUksSUFBRyxNQUFLLElBQUcsS0FBSSxJQUFHLE1BQUssR0FBRTtBQUFBLEVBQUUsSUFBRyxLQUFLLFdBQVM7QUFBQSxJQUFFLE9BQU87QUFBQSxFQUFJLElBQUksT0FBSyxLQUFLLFdBQVcsQ0FBQyxHQUFFLGNBQVksU0FBTyxJQUFHO0FBQUEsRUFBTSxJQUFHO0FBQUEsSUFBWSxJQUFJLE9BQUssS0FBSSxRQUFNO0FBQUEsRUFBTztBQUFBLFlBQU07QUFBQSxFQUFFLElBQUksV0FBUyxJQUFHLFlBQVUsR0FBRSxNQUFJLElBQUcsZUFBYSxNQUFHLEtBQUUsS0FBSyxTQUFPLEdBQUUsY0FBWTtBQUFBLEVBQUUsTUFBSyxNQUFHLFNBQVEsSUFBRTtBQUFBLElBQUMsSUFBRyxPQUFLLEtBQUssV0FBVyxFQUFDLEdBQUUsU0FBTyxJQUFHO0FBQUEsTUFBQyxLQUFJLGNBQWE7QUFBQSxRQUFDLFlBQVUsS0FBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsTUFBQztBQUFBLElBQVE7QUFBQSxJQUFDLElBQUcsUUFBTTtBQUFBLE1BQUcsZUFBYSxPQUFHLE1BQUksS0FBRTtBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsYUFBVztBQUFBLFFBQUcsV0FBUztBQUFBLE1BQU8sU0FBRyxnQkFBYztBQUFBLFFBQUUsY0FBWTtBQUFBLElBQUMsRUFBTSxTQUFHLGFBQVc7QUFBQSxNQUFHLGNBQVk7QUFBQSxFQUFFO0FBQUEsRUFB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QU8sV0FBRSxNQUFHLE1BQUcsS0FBRSxJQUFHLEtBQUssS0FBSSxLQUFFLENBQUMsR0FBRSxLQUFFLENBQUMsR0FBRSxHQUFFLFNBQU8sS0FBRSxFQUFFLENBQUMsR0FBRSxFQUFDLEdBQUcsTUFBSSxHQUFFLE1BQUksR0FBRSxFQUFFLFNBQU8sRUFBRSxNQUFNLEVBQUMsR0FBRSxFQUFFLEdBQUUsS0FBSSxJQUFFLElBQUUsR0FBRSxLQUFJLEdBQUUsSUFBSSxjQUFhLEtBQUcsR0FBRSxNQUFJLENBQUMsRUFBQyxJQUFFLE1BQUssSUFBUSxNQUFOLE9BQVEsRUFBRSxFQUFDLElBQUUsT0FBSyxLQUFHLEdBQUUsTUFBSyxFQUFDLEdBQUUsR0FBRSxNQUFJLEdBQUUsS0FBSSxHQUFFLEdBQUcsSUFBSSxHQUFFLE9BQUssSUFBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsR0FBRSxPQUFLLE1BQUcsRUFBRSxFQUFDO0FBQUEsRUFBSSxFQUFFLE1BQUk7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsSUFBSSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxLQUFFLE1BQUcsR0FBRSxPQUFLLEdBQUUsS0FBRSxHQUFFO0FBQUEsRUFBTyxLQUFJLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUMsR0FBRSxLQUFFLEVBQUUsS0FBRSxJQUFFO0FBQUEsS0FBVyxLQUFFLEdBQUUsSUFBSSxRQUFmLFNBQXFCLEtBQU0sR0FBRSxPQUFOLEtBQVUsSUFBRSxHQUFFLEdBQUUsUUFBTSxHQUFFLEdBQUUsTUFBSSxJQUFFLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxHQUFFLEtBQUksR0FBRSxPQUFLLEdBQUUsT0FBSyxHQUFFLFFBQU0sR0FBRSxPQUFLLEVBQUUsR0FBRSxLQUFJLE1BQUssRUFBQyxH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LEtBQUksR0FBRSxNQUFJLE9BQUcsTUFBRyxHQUFFLEVBQUMsR0FBRSxLQUFFLEdBQUUsT0FBTyxHQUFFLE9BQU0sR0FBRSxPQUFNLEdBQUUsT0FBTyxHQUFFLEtBQUUsRUFBRSxLQUFFLEdBQUUsSUFBSSxRQUFPO0FBQUEsWUFBSSxHQUFFLElBQUksS0FBSyxHQUFFLElBQUksR0FBRTtBQUFBLFVBQUUsR0FBRSxNQUFJLENBQUM7QUFBQSxRQUFDLEVBQU07QUFBQSxhQUFFO0FBQUEsWUFBQyxHQUFFLE1BQUksT0FBRyxNQUFHLEdBQUUsRUFBQyxHQUFFLEtBQUUsR0FBRSxPQUFPLEdBQUUsT0FBTSxHQUFFLE9BQU0sR0FBRSxPQUFPLEdBQUUsR0FBRSxRQUFNLEdBQUU7QUFBQSxVQUFHLFNBQU8sR0FBRSxTQUFPLEtBQUU7QUFBQSxRQUFJLEdBQUUsUUFBTSxHQUFFLEtBQVUsR0FBRSxtQkFBUixTQUEwQixLQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUUsRUFBQyxHQUFFLEdBQUUsZ0JBQWdCLENBQUMsSUFBRyxPQUFJLE1BQVMsR0FBRSwyQkFBUixTQUFrQyxLQUFFLEdBQUUsd0JBQXdCLElBQUUsRUFBQyxJQUFHLEtBQUUsSUFBUSxNQUFOLFFBQVMsR0FBRSxTQUFPLEtBQVMsR0FBRSxPQUFSLFNBQWMsS0FBRSxFQUFFLEdBQUUsTUFBTSxRQUFRLElBQUcsS0FBRSxFQUFFLElBQUUsRUFBRSxFQUFDLElBQUUsS0FBRSxDQUFDLEVBQUMsR0FBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQyxHQUFFLEdBQUUsT0FBSyxHQUFFLEtBQUksR0FBRSxPQUFLLE1BQUssR0FBRSxJQUFJLFVBQVEsR0FBRSxLQUFLLEVBQUMsR0FBRSxPQUFJLEdBQUUsTUFBSSxHQUFFLEtBQUc7QUFBQSxRQUFNLE9BQU0sSUFBRTtBQUFBLFFBQUMsSUFBRyxHQUFFLE1BQUksTUFBSyxNQUFTLE1BQU47QUFBQSxVQUFRLElBQUcsR0FBRSxNQUFLO0FBQUEsWUFBQyxLQUFJLEdBQUUsT0FBSyxLQUFFLE1BQUksSUFBSSxNQUFNLEdBQUUsWUFBTCxLQUFlLEdBQUU7QUFBQSxjQUFhLEtBQUUsR0FBRTtBQUFBLFlBQVksR0FBRSxHQUFFLFFBQVEsRUFBQyxLQUFHLE1BQUssR0FBRSxNQUFJO0FBQUEsVUFBQyxFQUFNO0FBQUEsaUJBQUksS0FBRSxHQUFFLE9BQU87QUFBQSxjQUFLLEVBQUUsR0FBRSxHQUFFO0FBQUEsUUFBTztBQUFBLGFBQUUsTUFBSSxHQUFFLEtBQUksR0FBRSxNQUFJLEdBQUU7QUFBQSxRQUFJLEVBQUUsSUFBSSxJQUFFLElBQUUsRUFBQztBQUFBO0FBQUEsSUFBTztBQUFBLE1BQU0sTUFBTixRQUFTLEdBQUUsT0FBSyxHQUFFLE9BQUssR0FBRSxNQUFJLEdBQUUsS0FBSSxHQUFFLE1BQUksR0FBRSxPQUFLLEtBQUUsR0FBRSxNQUFJLEVBQUUsR0FBRSxLQUFJLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLEVBQUUsUUFBTyxLQUFFLEVBQUUsV0FBUyxHQUFFLEVBQUMsR0FBRSxNQUFJLEdBQUUsTUFBUyxZQUFFO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsU0FBUSxLQUFFLEVBQUUsS0FBRSxHQUFFLFFBQU87QUFBQSxJQUFJLEVBQUUsR0FBRSxLQUFHLEdBQUUsRUFBRSxLQUFHLEdBQUUsRUFBRSxHQUFFO0FBQUEsRUFBRSxFQUFFLE9BQUssRUFBRSxJQUFJLElBQUUsRUFBQyxHQUFFLEdBQUUsS0FBSyxRQUFRLENBQUMsSUFBRTtBQUFBLElBQUMsSUFBRztBQUFBLE1BQUMsS0FBRSxHQUFFLEtBQUksR0FBRSxNQUFJLENBQUMsR0FBRSxHQUFFLEtBQUssUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLEdBQUUsS0FBSyxFQUFDO0FBQUEsT0FBRTtBQUFBLE1BQUUsT0FBTSxJQUFFO0FBQUEsTUFBQyxFQUFFLElBQUksSUFBRSxHQUFFLEdBQUc7QUFBQTtBQUFBLEdBQUc7QUFBQTtBQUFFLFNBQVMs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O0FBQXdxQyxTQUFTLEVBQUMsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLElBQUksS0FBRSxHQUFFLE1BQUksQ0FBQztBQUFBLEVBQUUsT0FBTyxHQUFFLEdBQUUsS0FBSSxFQUFDLE1BQUksR0FBRSxLQUFHLEdBQUUsR0FBRSxHQUFFLE1BQUksSUFBRSxHQUFFLE1BQUksS0FBRyxHQUFFO0FBQUE7QUFBdWlCLFNBQVMsRUFBQyxHQUFFO0FBQUEsRUFBQyxTQUFRLEdBQUUsS0FBRSxHQUFFLE1BQU07QUFBQSxJQUFHLElBQUcsR0FBRSxPQUFLLEdBQUU7QUFBQSxNQUFJLElBQUc7QUFBQSxRQUFDLEdBQUUsSUFBSSxJQUFJLFFBQVEsRUFBQyxHQUFFLEdBQUUsSUFBSSxJQUFJLFFBQVEsRUFBQyxHQUFFLEdBQUUsSUFBSSxNQUFJLENBQUM7QUFBQSxRQUFFLE9BQU0sSUFBRTtBQUFBLFFBQUMsR0FBRSxJQUFJLE1BQUksQ0FBQyxHQUFFLEdBQUUsSUFBSSxJQUFFLEdBQUUsR0FBRztBQUFBO0FBQUE7QUFBRyxHQUFFLE1BQUksUUFBUSxDQUFDLElBQUU7QUFBQSxFQUFDLEtBQUUsTUFBSyxNQUFHLEdBQUUsRUFBQztBQUFBLEdBQUcsR0FBRSxLQUFHLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQUcsR0FBRSxPQUFLLEdBQUUsSUFBSSxRQUFNLEdBQUUsTUFBSSxHQUFFLElBQUksTUFBSyxNQUFHLEdBQUUsSUFBRSxFQUFDO0FBQUEsR0FBRyxHQUFFLE1BQUksUUFBUSxDQUFDLElBQUU7QUFBQSxFQUFDLE1BQUcsR0FBRSxFQUFDLEdBQUUsS0FBRTtBQUFBLEVBQUUsSUFBSSxNQUFHLEtBQUUsR0FBRSxLQUFLO0FBQUEsRUFBSSxPQUFJLE9BQUksTUFBRyxHQUFFLE1BQUksQ0FBQyxHQUFFLEdBQUUsTUFBSSxDQUFDLEdBQUUsR0FBRSxHQUFHLFFBQVEsUUFBUSxDQUFDLElBQUU7QUFBQSxJQUFDLEdBQUUsUUFBTSxHQUFFLEtBQUcsR0FBRSxNQUFLLEdBQUUsSUFBRSxHQUFFLE1BQVM7QUFBQSxHQUFFLE1BQUksR0FBRSxJQUFJLFFBQVEsRUFBQyxHQUFFLEdBQUUsSUFBSSxRQUFRLEVBQUMsR0FBRSxHQUFFLE1BQUksQ0FBQyxHQUFFLEtBQUUsS0FBSSxLQUFFO0FBQUEsR0FBRyxHQUFFLFNBQU8sUUFBUSxDQUFDLElBQUU7QUFBQSxFQUFDLE1BQUcsR0FBRSxFQUFDO0FBQUEsRUFBRSxJQUFJLEtBQUUsR0FBRTtBQUFBLEVBQUksTUFBRyxHQUFFLFFBQU0sR0FBRSxJQUFJLElBQUksV0FBYSxHQUFFLEtBQUssRUFBQyxNQUFaLEtBQWUsT0FBSSxHQUFFLDJCQUF5QixLQUFFLEdBQUUsMEJBQXdCLElBQUcsRUFBQyxJQUFHLEdBQUUsSUFBSSxHQUFHLFFBQVEsUUFBUSxDQUFDLElBQUU7QUFBQSxJQUFDLEdBQUUsTUFBSSxHQUFFLE1BQUksR0FBRSxJQUFHLEdBQUUsSUFBTztBQUFBLEdBQUUsSUFBRyxLQUFFLEtBQUU7QUFBQSxHQUFNLEdBQUUsTUFBSSxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsRUFBQyxHQUFFLEtBQUssUUFBUSxDQUFDLElBQUU7QUFBQSxJQUFDLElBQUc7QUFBQSxNQUFDLEdBQUUsSUFBSSxRQUFRLEVBQUMsR0FBRSxHQUFFLE1BQUksR0FBRSxJQUFJLE9BQU8sUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLFFBQU8sR0FBRSxNQUFJLEdBQUUsRUFBQztBQUFBLE9BQUU7QUFBQSxNQUFFLE9BQU0sSUFBRTtBQUFBLE1BQUMsR0FBRSxLQUFLLFFBQVEsQ0FBQyxJQUFFO0FBQUEsUUFBQyxHQUFFLFFBQU0sR0FBRSxNQUFJLENBQUM7QUFBQSxPQUFHLEdBQUUsS0FBRSxDQUFDLEdBQUUsR0FBRSxJQUFJLElBQUUsR0FBRSxHQUFHO0FBQUE7QUFBQSxHQUFHLEdBQUUsTUFBRyxHQUFFLElBQUUsRUFBQztBQUFBLEdBQUcsR0FBRSxVQUFRLFFBQVEsQ0FBQyxJQUFFO0FBQUEsRUFBQyxNQUFHLEdBQUUsRUFBQztBQUFBLEVBQUUsSUFBSSxJQUFFLEtBQUUsR0FBRTtB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QUFBLE1BQUUsR0FBRSxJQUFFO0FBQUEsTUFBRSxHQUFFLElBQUU7QUFBQSxNQUFFLElBQUcsS0FBRyxHQUFFO0FBQUEsUUFBRSxHQUFFLEVBQUUsRUFBQztBQUFBLE1BQUUsT0FBTztBQUFBLElBQUMsRUFBTSxTQUFRLEdBQUUsTUFBUCxJQUFTO0FBQUEsTUFBQyxHQUFFLElBQUU7QUFBQSxNQUFFLElBQVksR0FBRSxNQUFOLFdBQVE7QUFBQSxRQUFDLEdBQUUsRUFBRSxJQUFFLEdBQUU7QUFBQSxRQUFFLElBQVksR0FBRSxNQUFOO0FBQUEsVUFBUSxHQUFFLEVBQUUsSUFBRSxHQUFFO0FBQUEsUUFBRSxHQUFFLElBQUUsR0FBRTtBQUFBLFFBQUUsR0FBRSxJQUFPO0FBQUEsUUFBRSxHQUFFLEVBQUUsSUFBRTtBQUFBLFFBQUUsR0FBRSxJQUFFO0FBQUEsTUFBQztBQUFBLE1BQUMsT0FBTztBQUFBLElBQUM7QUFBQSxFQUFDO0FBQUE7QUFBRSxTQUFTLEVBQUMsQ0FBQyxJQUFFO0FBQUEsRUFBQyxLQUFLLElBQUU7QUFBQSxFQUFFLEtBQUssSUFBRTtBQUFBLEVBQUUsS0FBSyxJQUFPO0FBQUEsRUFBRSxLQUFLLElBQU87QUFBQTtBQUFFLEdBQUUsVUFBVSxRQUFNO0FBQUUsR0FBRSxVQUFVLElBQUUsUUFBUSxHQUFFO0FBQUEsRUFBQyxPQUFNO0FBQUE7QUFBSSxHQUFFLFVBQVUsSUFBRSxRQUFRLENBQUMsSUFBRTtBQUFBLEVBQUMsSUFBRyxLQUFLLE1BQUksTUFBWSxHQUFFLE1BQU4sV0FBUTtBQUFBLElBQUMsR0FBRSxJQUFFLEtBQUs7QUFBQSxJQUFFLElBQVksS0FBSyxNQUFUO0FBQUEsTUFBVyxLQUFLLEVBQUUsSUFBRTtBQUFBLElBQUUsS0FBSyxJQUFFO0FBQUEsRUFBQztBQUFBO0FBQUcsR0FBRSxVQUFVLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxFQUFDLElBQVksS0FBSyxNQUFULFdBQVc7QUFBQSxJQUFDLE1BQVEsR0FBSixJQUFVLEdBQUosT0FBRTtBQUFBLElBQUksSUFBWSxPQUFKLFdBQU07QUFBQSxNQUFDLEdBQUUsSUFBRTtBQUFBLE1BQUUsR0FBRSxJQUFPO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBWSxPQUFKLFdBQU07QUFBQSxNQUFDLEdBQUUsSUFBRTtBQUFBLE1BQUUsR0FBRSxJQUFPO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBRyxPQUFJLEtBQUs7QUFBQSxNQUFFLEtBQUssSUFBRTtBQUFBLEVBQUM7QUFBQTtBQUFHLEdBQUUsVUFBVSxZQUFVLFFBQVEsQ0FBQyxJQUFFO0FBQUEsRUFBQyxJQUFJLEtBQUU7QUFBQSxFQUFLLE9BQU8sR0FBRSxRQUFRLEdBQUU7QUFBQSxJQUFDLElBQUksS0FBRSxHQUFFLE9BQU0sS0FBRTtBQUFBLElBQUUsS0FBTztBQUFBLElBQUUsSUFBRztBQUFBLE1BQUMsR0FBRSxFQUFDO0FBQUEsY0FBRTtBQUFBLE1BQVEsS0FBRTtBQUFBO0FBQUEsR0FBRztBQUFBO0FBQUcsR0FBRSxVQUFVLFVBQVEsUUFBUSxHQUFFO0FBQUEsRUFBQyxPQUFPLEtBQUs7QUFBQTtBQUFPLEdBQUUsVUFBVSxXQUFTLFFBQVEsR0FBRTtBQUFBLEVBQUMsT0FBTyxLQUFLLFFBQU07QUFBQTtBQUFJLEdBQUUsVUFBVSxTQUFPLFFBQVEsR0FBRTtBQUFBLEVBQUMsT0FBTyxLQUFLO0FBQUE7QUFBTyxHQUFFLFVBQVUsT0FBSyxRQUFRLEdBQUU7QUFBQSxFQUFDLElBQUksS0FBRTtBQUFBLEVBQUUsS0FBTztBQUFBLEVBQUUsSUFBRztBQUFBLElBQUMsT0FBTyxLQUFLO0FBQUEsWUFBTTtBQUFBLElBQVEsS0FBRTtBQUFBO0FBQUE7QUFBSSxPQUFPLGVBQWUsR0FBRSxXQUFVLFNBQVEsRUFBQyxLQUFJLFFBQVEsR0FBRTtBQUFBLEVBQUMsSUFBSSxLQUFFLEdBQUUsSUFBSTtBQUFBLEVBQUUsSUFBWSxPQUFKO0FBQUEsSUFBTSxHQUFFLElBQUUsS0FBSztBQUFBLEVBQUUsT0FBTyxLQUFLO0FBQUEsR0FBRyxLQUFJLFFBQVEsQ0FBQyxJQUFFO0FBQUEsRUFBQyxJQUFHLE9BQUksS0FBSyxHQUFFO0FBQUEsSUFBQyxJQUFHLEtBQUU7QUFBQSxNQUFJLE1BQU0sSUFBSSxNQUFNLGdCQUFnQjtBQUFBLElBQUUsS0FBSyxJQUFFO0FBQUEsSUFBRSxLQUFLO0FBQUEsSUFBSTtBQUFBLElBQUk7QUFBQSxJQUFJLElBQUc7QUFBQSxNQUFDLFNBQVEsS0FBRSxLQUFLLEVBQVcsT0FBSixXQUFNLEtBQUUsR0FBRTtBQUFBLFFBQUUsR0FBRSxFQUFFLEVBQUU7QUFBQSxjQUFFO0FBQUEsTUFBUSxHQUFFO0FBQUE7QUFBQSxFQUFFO0FBQUEsRUFBRSxDQUFDO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsT0FBTyxJQUFJLEdBQUUsRUFBQztBQUFBO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsU0FBUSxLQUFFLEdBQUUsRUFBVyxPQUFKLFdBQU0sS0FBRSxHQUFFO0FBQUEsSUFBRSxJQUFHLEdBQUUsRUFBRSxNQUFJLEdBQUUsTUFBSSxHQUFFLEVBQUUsRUFBRSxLQUFHLEdBQUUsRUFBRSxNQUFJLEdBQUU7QUFBQSxNQUFFLE9BQU07QUFBQSxFQUFHLE9BQU07QUFBQTtBQUFHLFNBQVMsRUFBQyxDQUFDLElBQUU7QUFBQSxFQUFDLFNBQVEsS0FBRSxHQUFFLEVBQVcsT0FBSixXQUFNLEtBQUUsR0FBRSxHQUFFO0FBQUEsSUFBQyxJQUFJLEtBQUUsR0FBRSxFQUFFO0FBQUEsSUFBRSxJQUFZLE9BQUo7QUFBQSxNQUFNLEdBQUUsSUFBRTtBQUFBLElBQUUsR0FBRSxFQUFFLElBQUU7QUFBQSxJQUFFLEdBQUUsSUFBRTtBQUFBLElBQUcsSUFBWSxHQUFFLE1BQU4sV0FBUTtBQUFBLE1BQUMsR0FBRSxJQUFFO0FBQUEsTUFBRTtBQUFBLElBQUs7QUFBQSxFQUFDO0FBQUE7QUFBRSxTQUFTLEVBQUMsQ0FBQyxJQUFFO0FBQUEsRUFBQyxJQUFJLEtBQUUsR0FBRSxHQUFFLEtBQU87QUFBQSxFQUFFLE9BQWUsT0FBSixXQUFNO0FBQUEsSUFBQyxJQUFJLEtBQUUsR0FBRTtBQUFBLElBQUUsSUFBUSxHQUFFLE1BQVAsSUFBUztBQUFBLE1BQUMsR0FBRSxFQUFFLEVBQUUsRUFBQztBQUFBLE1BQUUsSUFBWSxPQUFKO0FBQUEsUUFBTSxHQUFFLElBQUUsR0FBRTtBQUFBLE1BQUUsSUFBWSxHQUFFLE1BQU47QUFBQSxRQUFRLEdBQUUsRUFBRSxJQUFFO0FBQUEsSUFBQyxFQUFNO0FBQUEsV0FBRTtBQUFBLElBQUUsR0FBRSxFQUFFLElBQUUsR0FBRTtBQUFBLElBQUUsSUFBWSxHQUFFLE1BQU47QUFBQSxNQUFRLEdBQUUsSUFBTztBQUFBLElBQUUsS0FBRTtBQUFBLEVBQUM7QUFBQSxFQUFDLEdBQUUsSUFBRTtBQUFBO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsR0FBRSxLQUFLLE1BQVUsU0FBQztBQUFBLEVBQUUsS0FBSyxJQUFFO0FBQUEsRUFBRSxLQUFLLElBQU87QUFBQSxFQUFFLEtBQUssSUFBRSxLQUFFO0FBQUEsRUFBRSxLQUFLLElBQUU7QUFBQTtBQUFBLENBQUcsR0FBRSxZQUFVLElBQUksSUFBRyxJQUFFLFFBQVEsR0FBRTtBQUFBLEVBQUMsS0FBSyxLQUFHO0FBQUEsRUFBRyxJQUFHLElBQUUsS0FBSztBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUcsS0FBUSxLQUFHLEtBQUssTUFBYjtBQUFBLElBQWdCLE9BQU07QUFBQSxFQUFHLEtBQUssS0FBRztBQUFBLEVBQUcsSUFBRyxLQUFLLE1BQUk7QUFBQSxJQUFFLE9BQU07QUFBQSxFQUFHLEtBQUssSUFBRTtBQUFBLEVBQUUsS0FBSyxLQUFHO0FBQUEsRUFBRSxJQUFHLEtBQUssSUFBRSxNQUFJLEdBQUUsSUFBSSxHQUFFO0FBQUEsSUFBQyxLQUFLLEtBQUc7QUFBQSxJQUFHLE9BQU07QUFBQSxFQUFFO0FBQUEsRUFBQyxJQUFJLEtBQUU7QUFBQSxFQUFFLElBQUc7QUFBQSxJQUFDLEdBQUUsSUFBSTtBQUFBLElBQUUsS0FBRTtBQUFBLElBQUssSUFBSSxLQUFFLEtBQUssRUFBRTtBQUFBLElBQUUsSUFBRyxLQUFHLEtBQUssS0FBRyxLQUFLLE1BQUksTUFBTyxLQUFLLE1BQVQsR0FBVztBQUFBLE1BQUMsS0FBSyxJQUFFO0FBQUEsTUFBRSxLQUFLLEtBQUc7QUFBQSxNQUFJLEtBQUs7QUFBQSxJQUFHO0FBQUEsSUFBRSxPQUFNLElBQUU7QUFBQSxJQUFDLEtBQUssSUFBRTtBQUFBLElBQUUsS0FBSyxLQUFHO0FBQUEsSUFBRyxLQUFLO0FBQUE7QUFBQSxFQUFJLEtBQUU7QUFBQSxFQUFFLEdBQUUsSUFBSTtBQUFBLEVBQUUsS0FBSyxLQUFHO0FBQUEsRUFBRyxPQUFNO0FBQUE7QUFBSSxHQUFFLFVBQVUsSUFBRSxRQUFRLENBQUMsSUFBRTtBQUFBLEVBQUMsSUFBWSxLQUFLLE1BQVQsV0FBVztBQUFBLElBQUMsS0FBSyxLQUFHO0FBQUEsSUFBRyxTQUFRLEtBQUUsS0FBSyxFQUFXLE9BQUosV0FBTSxLQUFFLEdBQUU7QUFBQSxNQUFFLEdBQUUsRUFBRSxFQUFFLEVBQUM7QUFBQSxFQUFDO0FBQUEsRUFBQyxHQUFFLFVBQVUsRUFBRSxLQUFLLE1BQUssRUFBQztBQUFBO0FBQUcsR0FBRSxVQUFVLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxFQUFDLElBQVksS0FBSyxNQUFULFdBQVc7QUFBQSxJQUFDLEdBQUUsVUFBVSxFQUFFLEtBQUssTUFBSyxFQUFDO0FBQUEsSUFBRSxJQUFZLEtBQUssTUFBVCxXQUFXO0FBQUEsTUFBQyxLQUFLLEtBQUc7QUFBQSxNQUFJLFNBQVEsS0FBRSxLQUFLLEVBQVcsT0FBSixXQUFNLEtBQUUsR0FBRTtBQUFBLFFBQUUsR0FBRSxFQUFFLEVBQUUsRUFBQztBQUFBLElBQUM7QUFBQSxFQUFDO0FBQUE7QUFBRyxHQUFFLFVBQVUsSUFBRSxRQUFRLEdBQUU7QUFBQSxFQUFDLE1BQUssSUFBRSxLQUFLLElBQUc7QUFBQSxJQUFDLEtBQUssS0FBRztBQUFBLElBQUUsU0FBUSxLQUFFLEtBQUssRUFBVyxPQUFKLFdBQU0sS0FBRSxHQUFFO0FBQUEsTUFBRSxHQUFFLEVBQUUsRUFBRTtBQUFBLEVBQUM7QUFBQTtBQUFHLE9BQU8sZUFBZSxHQUFFLFdBQVUsU0FBUSxFQUFDLEtBQUksUUFBUSxHQUFFO0FBQUEsRUFBQyxJQUFHLElBQUUsS0FBSztBQUFBLElBQUUsTUFBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQUEsRUFBRSxJQUFJLEtBQUUsR0FBRSxJQUFJO0FBQUEsRUFBRSxLQUFLLEVBQUU7QUFBQSxFQUFFLElBQVksT0FBSjtBQUFBLElBQU0sR0FBRSxJQUFFLEtBQUs7QUFBQSxFQUFFLElBQUcsS0FBRyxLQUFLO0FBQUEsSUFBRSxNQUFNLEtBQUs7QUFBQSxFQUFFLE9BQU8sS0FBSztBQUFBLEVBQUUsQ0FBQztBQUFFLFNBQVMsRUFBQyxDQUFDLElBQUU7QUFBQSxFQUFDLE9BQU8sSUFBSSxHQUFFLEVBQUM7QUFBQTtBQUFFLFNBQVMsRUFBQyxDQUFDLElBQUU7QUFBQSxFQUFDLElBQUksS0FBRSxHQUFFO0FBQUEsRUFBRSxHQUFFLElBQU87QUFBQSxFQUFFLElBQWUsT0FBTyxNQUFuQixZQUFxQjtBQUFBLElBQUM7QUFBQSxJQUFJLElBQUksS0FBRTtBQUFBLElBQUUsS0FBTztBQUFBLElBQUUsSUFBRztBQUFBLE1BQUMsR0FBRTtBQUFBLE1BQUUsT0FBTSxJQUFFO0FBQUEsTUFBQyxHQUFFLEtBQUc7QUFBQSxNQUFHLEdBQUUsS0FBRztBQUFBLE1BQUUsR0FBRSxFQUFDO0FBQUEsTUFBRSxNQUFNO0FBQUEsY0FBRTtBQUFBLE1BQVEsS0FBRTtBQUFBLE1BQUUsR0FBRTtBQUFBO0FBQUEsRUFBRTtBQUFBO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsU0FBUSxLQUFFLEdBQUUsRUFBVyxPQUFKLFdBQU0sS0FBRSxHQUFFO0FBQUEsSUFBRSxHQUFFLEVBQUUsRUFBRSxFQUFDO0FBQUEsRUFBRSxHQUFFLElBQU87QUFBQSxFQUFFLEdBQUUsSUFBTztBQUFBLEVBQUUsR0FBRSxFQUFDO0FBQUE7QUFBRSxTQUFTLEVBQUMsQ0FBQyxJQUFFO0FBQUEsRUFBQyxJQUFHLE9BQUk7QUFBQSxJQUFLLE1BQU0sSUFBSSxNQUFNLHFCQUFxQjtBQUFBLEVBQUUsR0FBRSxJQUFJO0FBQUEsRUFBRSxLQUFFO0FBQUEsRUFBRSxLQUFLLEtBQUc7QUFBQSxFQUFHLElBQUcsSUFBRSxLQUFLO0FBQUEsSUFBRSxHQUFFLElBQUk7QUFBQSxFQUFFLEdBQUU7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUU7QUFBQSxFQUFDLEtBQUssSUFBRTtBQUFBLEVBQUUsS0FBSyxJQUFPO0FBQUEsRUFBRSxLQUFLLElBQU87QUFBQSxFQUFFLEtBQUssSUFBTztBQUFBLEVBQUUsS0FBSyxJQUFFO0FBQUE7QUFBRyxFQUFFLFVBQVUsSUFBRSxRQUFRLEdBQUU7QUFBQSxFQUFDLElBQUksS0FBRSxLQUFLLEVBQUU7QUFBQSxFQUFFLElBQUc7QUFBQSxJQUFDLElBQUcsSUFBRSxLQUFLO0FBQUEsTUFBRTtBQUFBLElBQU8sSUFBWSxLQUFLLE1BQVQ7QUFBQSxNQUFXO0FBQUEsSUFBTyxJQUFJLEtBQUUsS0FBSyxFQUFFO0FBQUEsSUFBRSxJQUFlLE9BQU8sTUFBbkI7QUFBQSxNQUFxQixLQUFLLElBQUU7QUFBQSxZQUFFO0FBQUEsSUFBUSxHQUFFO0FBQUE7QUFBQTtBQUFJLEVBQUUsVUFBVSxJQUFFLFFBQVEsR0FBRTtBQUFBLEVBQUMsSUFBRyxJQUFFLEtBQUs7QUFBQSxJQUFFLE1BQU0sSUFBSSxNQUFNLGdCQUFnQjtBQUFBLEVBQUUsS0FBSyxLQUFHO0FBQUEsRUFBRSxLQUFLLEtBQUc7QUFBQSxFQUFHLEdBQUUsSUFBSTtBQUFBLEVBQUUsR0FBRSxJQUFJO0FBQUEsRUFBRTtBQUFBLEVBQUksSUFBSSxLQUFFO0FBQUEsRUFBRSxLQUFFO0FBQUEsRUFBSyxPQUFPLEdBQUUsS0FBSyxNQUFLLEVBQUM7QUFBQTtBQUFHLEVBQUUsVUFBVSxJQUFFLFFBQVEsR0FBRTtBQUFBLEVBQUMsTUFBSyxJQUFFLEtBQUssSUFBRztBQUFBLElBQUMsS0FBSyxLQUFHO0FBQUEsSUFBRSxLQUFLLElBQUU7QUFBQSxJQUFFLEtBQUU7QUFBQSxFQUFJO0FBQUE7QUFBRyxFQUFFLFVBQVUsSUFBRSxRQUFRLEdBQUU7QUFBQSxFQUFDLEtBQUssS0FBRztBQUFBLEVBQUUsTUFBSyxJQUFFLEtBQUs7QUFBQSxJQUFHLEdBQUUsSUFBSTtBQUFBO0FBQUcsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsSUFBSSxLQUFFLElBQUksRUFBRSxFQUFDO0FBQUEsRUFBRSxJQUFHO0FBQUEsSUFBQyxHQUFFLEVBQUU7QUFBQSxJQUFFLE9BQU0sSUFBRTtBQUFBLElBQUMsR0FBRSxFQUFFO0FBQUEsSUFBRSxNQUFNO0FBQUE7QUFBQSxFQUFFLE9BQU8sR0FBRSxFQUFFLEtBQUssRUFBQztBQUFBOzs7QUNBNXNILElBQUk7QUFBSixJQUFNO0FBQU4sSUFBUTtBQUFSLElBQWUsS0FBRSxDQUFDO0FBQUUsR0FBRSxRQUFRLEdBQUU7QUFBQSxFQUFDLEtBQUUsS0FBSztBQUFBLENBQUUsRUFBRTtBQUFFLFNBQVMsRUFBQyxDQUFDLElBQUUsSUFBRTtBQUFBLEVBQUMsRUFBRSxNQUFHLEdBQUUsS0FBSyxNQUFLLEVBQUUsT0FBSSxRQUFRLEdBQUUsRUFBRTtBQUFBO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsSUFBRztBQUFBLElBQUUsR0FBRTtBQUFBLEVBQUUsS0FBRSxNQUFHLEdBQUUsRUFBRTtBQUFBO0FBQUUsU0FBUyxFQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsSUFBSSxLQUFFLE1BQUssS0FBRSxHQUFFLE1BQUssS0FBRSxVQUFVLEVBQUM7QUFBQSxFQUFFLEdBQUUsUUFBTTtBQUFBLEVBQUUsSUFBSSxLQUFFLEdBQUUsUUFBUSxHQUFFO0FBQUEsSUFBQyxJQUFJLEtBQUUsSUFBRSxLQUFFLEdBQUU7QUFBQSxJQUFJLE9BQU0sS0FBRSxHQUFFO0FBQUEsTUFBRyxJQUFHLEdBQUUsS0FBSTtBQUFBLFFBQUMsR0FBRSxJQUFJLFFBQU07QUFBQSxRQUFFO0FBQUEsTUFBSztBQUFB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QUFDLElBQUcsR0FBRSxLQUFLLElBQUksR0FBRSxNQUFJLEtBQUssSUFBRSxFQUFFLE9BQU8sUUFBUSxDQUFDLElBQUU7QUFBQSxJQUFDLElBQUksS0FBRSxHQUFFLFlBQVU7QUFBQSxJQUFFLEdBQUUsUUFBUSxNQUFJLEdBQUUsWUFBVSxPQUFLLEdBQUUsVUFBUSxHQUFHO0FBQUEsR0FBRSxJQUFHLEtBQUssSUFBRTtBQUFBLEdBQUksc0JBQXFCLFFBQVEsR0FBRTtBQUFBLEVBQWEsT0FBTyxLQUFLLEtBQXhCLGNBQTJCLEtBQUssRUFBRSxHQUFFLEdBQUUsT0FBTyxHQUFFLFFBQVEsSUFBSSxHQUFFLENBQUM7QUFBQSxHQUFHLHFCQUFvQixRQUFRLEdBQUU7QUFBQSxFQUFDLEtBQUssSUFBRTtBQUFBLEdBQUksb0JBQW1CLFFBQVEsR0FBRTtBQUFBLEVBQUMsS0FBSyxJQUFFO0FBQUEsR0FBSSxHQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLEtBQUUsR0FBRSxPQUFPLEVBQUMsRUFBRSxLQUFLLEVBQUM7QUFBQSxFQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxRQUFPLE1BQUk7QUFBQSxJQUFDLElBQUksS0FBRSxHQUFFLEtBQUcsS0FBRSxHQUFFLElBQUUsR0FBRSxNQUFNLE1BQUssR0FBRSxLQUFLO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLENBQUMsSUFBRSxFQUFDO0FBQUEsRUFBQztBQUFBLEdBQUcsUUFBTyxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsRUFBQyxJQUFJLElBQUUsSUFBRSxLQUFFLEdBQUUsVUFBUyxLQUFFLEdBQUUsS0FBSSxLQUFFLEtBQUssR0FBRSxLQUFFLEtBQUssRUFBRSxFQUFFLEdBQUUsUUFBUSxHQUFFLEVBQUM7QUFBQSxFQUFFLElBQUcsT0FBSSxLQUFFLEVBQUUsR0FBRSxJQUFHLEdBQUUsR0FBRSxFQUFDLEtBQUksSUFBRSxTQUFRLEtBQUUsR0FBRSxHQUFFLEdBQUUsRUFBQyxHQUFFLEVBQUMsS0FBUyxXQUFFLEtBQVMsVUFB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TSxzQkFBc0IsSUFBSSxNQUFLO0FBQUEsWUFDdEMsRUFBQyxNQUFNLHFCQUFxQixJQUFJLE1BQUs7QUFBQSxZQUNyQyxFQUFDLE1BQU0scUJBQXFCLElBQUksTUFBSztBQUFBLFlBQ3JDLEVBQUMsTUFBTSxxQkFBcUIsSUFBSSxPQUFNO0FBQUEsWUFDdEMsRUFBQyxNQUFNLHNCQUFzQixJQUFJLE9BQU07QUFBQSxVQUMzQyxFQUFFLElBQUksR0FBRSxNQUFNLHlCQUNWLEdBTUUsT0FORjtBQUFBLFlBQWdCLE9BQU07QUFBQSxZQUF0QixVQU1FO0FBQUEsOEJBTEUsR0FBbUUsT0FBbkU7QUFBQSxnQkFBSyxPQUFNO0FBQUEsZ0JBQWdCLE9BQU8sc0JBQXNCO0FBQUEsaUJBQXhELGlDQUFtRTtBQUFBLDhCQUNuRSxHQUdFLE9BSEY7QUFBQSxnQkFBSyxPQUFNO0FBQUEsZ0JBQVgsVUFHRTtBQUFBLGtDQUZFLEdBQWMsUUFBZDtBQUFBLDhCQUFPO0FBQUEscUJBQVAsaUNBQWM7QUFBQSxrQ0FDZCxHQUFnQyxPQUFoQztBQUFBLG9CQUFLLE9BQU07QUFBQSxvQkFBWCxVQUEyQjtBQUFBLHFCQUEzQixpQ0FBZ0M7QUFBQTtBQUFBLGlCQUZwQyxnQ0FHRTtBQUFBO0FBQUEsYUFMSSxNQUFWLHFCQU1FLENBQ0w7QUFBQSxXQWZMLGlDQWdCRTtBQUFBO0FBQUEsT0FsQk4sZ0NBbUJFO0FBQUE7QUFBQSxHQXRMTixnQ0F1TEU7OztBQ3JMQyxJQUFNLE9BQU8sc0JBQ2hCLEdBU0UsT0FURjtBQUFBLEVBQUssT0FBTTtBQUFBLEVBQVgsVUFTRTtBQUFBLG9CQVJFLEdBQUMsWUFBRCxxQ0FBWTtBQUFBLG9CQUNaLEdBTUUsUUFORjtBQUFBLE1BQU0sT0FBTTtBQUFBLE1BQVosMEJBQ0ksR0FJRSxJQUpGO0FBQUEsa0JBSUU7QUFBQSwwQkFIRSxHQUFDLFlBQUQ7QUFBQSxZQUFZLE1BQUs7QUFBQSxhQUFqQixpQ0FBK0I7QUFBQSwwQkFDL0IsR0FBQyxZQUFEO0FBQUEsWUFBWSxNQUFLO0FBQUEsWUFBSSxTQUFPO0FBQUEsYUFBNUIsaUNBQTZCO0FBQUEsMEJBQzdCLEdBQUMsUUFBRDtBQUFBLFlBQVEsTUFBSztBQUFBLGFBQWIsaUNBQXVCO0FBQUE7QUFBQSxTQUgzQixnQ0FJRTtBQUFBLE9BTE4saUNBTUU7QUFBQTtBQUFBLEdBUk4sZ0NBU0U7OztBQ0hvQyxJQUFJO0FBRTlDLElBQU0sTUFBSztBQUVYLE1BQU0sS0FBSyxpQkFBaUIsY0FBYTtBQUV6QyxJQUFNLE1BQU0sSUFBSTtBQUdoQixJQUFNLG1CQUFtQjtBQUFBLEVBQ3JCLGtCQUFrQjtBQUFBLEVBQ2xCLGNBQWM7QUFBQSxFQUNkLHlCQUF5QjtBQUFBLEVBQ3pCLG9CQUFvQjtBQUFBLEVBQ3BCLHFCQUFxQjtBQUN6QjtBQUVBLElBQUksS0FBSyxNQUFNLEdBQVEsR0FBRyxnQkFBZ0I7IiwKICAiZGVidWdJZCI6ICJCREIyNzZBNUMwN0NFMUQ5NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
