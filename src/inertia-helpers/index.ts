/* eslint-disable @typescript-eslint/no-explicit-any */
export async function resolvePageComponent<T>(path: string|string[], pages: Record<string, Promise<T> | (() => Promise<T>)>): Promise<T> {
    for (const p of (Array.isArray(path) ? path : [path])) {
        const page = pages[p]

        if (typeof page === 'undefined') {
            continue
        }

        return typeof page === 'function' ? page() : page
    }

    throw new Error(`Page not found: ${path}`)
}

declare global {
    // eslint-disable-next-line no-var
    var routes: { [key: string]: string };
  }
globalThis.routes = globalThis.routes || {}
export function route(routeName: string, ...args: any[]): string {
    let url = globalThis.routes[routeName];
    if (!url) {
      throw new Error("URL " + routeName + " was not found.");
    }

    const argTokens = url.match(/<(\w+:?)?\w+>/g);

    if (!argTokens && args.length > 0) {
      throw new Error(
        "Invalid URL lookup: URL " + routeName + " does not expect any arguments."
      );
    }

    if (typeof args[0] === "object" && !Array.isArray(args[0])) {
      argTokens?.forEach((token) => {
        let argName = token.slice(1, -1);
        if (argName.includes(":")) {
          argName = argName.split(":")[1];
        }

        const argValue = (args[0] as { [key: string]: any })[argName];
        if (argValue === undefined) {
          throw new Error(
            "Invalid URL lookup: Argument " + argName + " was not provided."
          );
        }

        url = url.replace(token, argValue.toString());
      });
    } else {
      const argsArray = Array.isArray(args[0])
        ? args[0]
        : Array.prototype.slice.call(args);

      if (argTokens && argTokens.length !== argsArray.length) {
        throw new Error(
          "Invalid URL lookup: Wrong number of arguments; expected " +
            argTokens.length.toString() +
            " arguments."
        );
      }

      argTokens?.forEach((token, i) => {
        const argValue = argsArray[i];
        url = url.replace(token, argValue.toString());
      });
    }

    return url;
  }
