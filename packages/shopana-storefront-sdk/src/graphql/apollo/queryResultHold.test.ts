import { ApolloLink, gql, Observable } from '@apollo/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryResultHoldLink, holdQueryResults } from './queryResultHold';

const QUERY = gql`
  query Product {
    product {
      id
    }
  }
`;
const MUTATION = gql`
  mutation AddToCart {
    addToCart {
      id
    }
  }
`;

/** The results the link delivers for `query`, the network answering at once. */
function run(query: typeof QUERY) {
  const results: unknown[] = [];
  const network = new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.next({ data: { answered: true } });
        observer.complete();
      })
  );
  const link = ApolloLink.from([createQueryResultHoldLink(), network]);
  ApolloLink.execute(link, { query }, { client: {} as never }).subscribe({
    next: (result) => results.push(result),
  });
  return results;
}

describe('queryResultHold', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('delivers a query result at once without a hold', () => {
    expect(run(QUERY)).toHaveLength(1);
  });

  it('holds a query result until the hold is released', () => {
    const release = holdQueryResults(10_000);
    const results = run(QUERY);
    expect(results).toHaveLength(0);

    release();
    expect(results).toHaveLength(1);
  });

  it('never holds a mutation', () => {
    const release = holdQueryResults(10_000);
    expect(run(MUTATION)).toHaveLength(1);
    release();
  });

  it('releases on its own after maxMs', () => {
    vi.useFakeTimers();
    holdQueryResults(200);
    const results = run(QUERY);

    vi.advanceTimersByTime(199);
    expect(results).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(results).toHaveLength(1);
  });

  it('waits for every hold', () => {
    const first = holdQueryResults(10_000);
    const second = holdQueryResults(10_000);
    const results = run(QUERY);

    first();
    expect(results).toHaveLength(0);
    second();
    expect(results).toHaveLength(1);
  });
});
