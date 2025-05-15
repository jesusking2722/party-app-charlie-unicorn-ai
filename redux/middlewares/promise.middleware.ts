// redux/middleware/promiseMiddleware.ts
import { Middleware } from "redux";

// A map to store pending promises
const pendingActions: Record<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }[]
> = {};

// Middleware to track Redux actions and resolve promises when they complete
export const promiseMiddleware: Middleware = () => (next) => (action: any) => {
  // Check if the action has a _promise field
  if (action._promise) {
    const { type } = action;

    // Store the promise callbacks
    if (!pendingActions[type]) {
      pendingActions[type] = [];
    }

    pendingActions[type].push({
      resolve: action._promise.resolve,
      reject: action._promise.reject,
    });

    // Remove the _promise field before passing action to the reducer
    const newAction = { ...action };
    delete newAction._promise;

    // Process the action normally
    const result = next(newAction);

    // Resolve all promises waiting for this action type
    if (pendingActions[type]) {
      pendingActions[type].forEach(({ resolve }) => resolve(result));
      pendingActions[type] = [];
    }

    return result;
  }

  return next(action);
};

// Helper function to dispatch an action and get a promise
export const createPromiseAction = (action: any): [any, Promise<unknown>] => {
  // Initialize the resolve and reject functions with dummy implementations
  // that will be replaced in the Promise constructor
  let resolvePromise: (value: unknown) => void = () => {};
  let rejectPromise: (reason?: any) => void = () => {};

  const promise = new Promise<unknown>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const actionWithPromise = {
    ...action,
    _promise: {
      resolve: resolvePromise,
      reject: rejectPromise,
    },
  };

  return [actionWithPromise, promise];
};
