import { Middleware } from "redux";

// Map to track promises by unique ID
const pendingPromises: Record<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }
> = {};

// Generate a unique ID for each promise
let nextPromiseId = 1;

// Middleware to track promises
export const promiseTrackingMiddleware: Middleware =
  () => (next) => (action: any) => {
    // Check if this is a promise-tracked action
    if (action.meta && action.meta.promiseId) {
      const { promiseId } = action.meta;

      // If the action has a promise ID, find the pending promise
      const pendingPromise = pendingPromises[promiseId];

      if (pendingPromise) {
        // For resolved actions, resolve the promise
        if (action.meta.status === "fulfilled") {
          pendingPromise.resolve(action.payload);
        }
        // For rejected actions, reject the promise
        else if (action.meta.status === "rejected") {
          pendingPromise.reject(action.error);
        }

        // Clean up the promise reference
        delete pendingPromises[promiseId];
      }
    }

    // Continue the action through the middleware chain
    return next(action);
  };

// Function to create a tracked promise for an action
export const createTrackedPromise = <T>(
  actionCreator: Function,
  ...args: any[]
): Promise<T> => {
  // Create a new promise
  return new Promise<T>((resolve: any, reject) => {
    // Generate a unique ID for this promise
    const promiseId = String(nextPromiseId++);

    // Store the promise callbacks
    pendingPromises[promiseId] = { resolve, reject };

    // Create the action with the promise ID in meta
    const actionWithMeta = actionCreator(...args);

    // Add the promise tracking metadata
    if (!actionWithMeta.meta) {
      actionWithMeta.meta = {};
    }

    actionWithMeta.meta.promiseId = promiseId;

    // Dispatch the action (needs to be done by the caller)
    return actionWithMeta;
  });
};
