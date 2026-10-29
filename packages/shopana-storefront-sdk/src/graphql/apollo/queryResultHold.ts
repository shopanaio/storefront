import { ApolloLink, Observable } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

/**
 * Holds the results of queries back from the Apollo cache while a page comes in: the query
 * goes to the network at once, its result is written (and renders) once the hold is over.
 * A closed DataGate holds (see DataGate), so a response arriving while the screen animates in
 * neither writes the cache nor renders in the middle of the animation. Mutations are never
 * held. Browser only: nothing holds on the server.
 */

/** How many holds are on; results wait while any is. */
let holds = 0;
/** What waits for the holds to end, in the order it arrived. */
let waiting: Array<() => void> = [];

/**
 * Holds the results of queries until the returned release is called, or `maxMs` at the
 * latest: a hold never outlives what it waits for by more than that.
 */
export function holdQueryResults(maxMs: number): () => void {
  holds += 1;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    clearTimeout(timer);
    holds -= 1;
    if (holds > 0) return;
    const run = waiting;
    waiting = [];
    run.forEach((next) => next());
  };
  const timer = setTimeout(release, maxMs);
  return release;
}

/** Runs `next` once no hold is on: at once without one. */
function whenReleased(next: () => void) {
  if (holds === 0) next();
  else waiting.push(next);
}

const isQuery = (operation: ApolloLink.Operation) => {
  const definition = getMainDefinition(operation.query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'query'
  );
};

/**
 * Delivers the results (and errors) of queries once no hold is on, in the order they came;
 * the request itself goes on at once.
 */
export function createQueryResultHoldLink(): ApolloLink {
  return new ApolloLink((operation, forward) => {
    if (!isQuery(operation)) return forward(operation);
    return new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => whenReleased(() => observer.next(result)),
        error: (error: unknown) => whenReleased(() => observer.error(error)),
        complete: () => whenReleased(() => observer.complete()),
      });
      return () => subscription.unsubscribe();
    });
  });
}
