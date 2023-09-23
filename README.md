# React Query a.k.a Tan Stack

This is a useful package for data fetching.

# How to run

1. Clone the repo
2. Run the backend

   - `cd backend`
   - `npm i`
   - `npm start`

3. Run the frontend
   - `cd frontend`
   - `npm i`
   - `yarn dev`

> Make sure to have both running at the same time

## Fetch data

The `useQuery` hook can be used to fetch data.
`queryFn` is the function used to fetch the data and `queryKey` is the key used to cache the data.
`useQuery` returns a load of useful [properties](https://tanstack.com/query/latest/docs/react/reference/useQuery).

There's a lot `useQuery` can offer, like re-fetching data when switching tabs, [check them out](https://tanstack.com/query/latest/docs/react/overview).

```js
import { useQuery } from '@tanstack/react-query';
...

const { data, isError, error, isPending } = useQuery({
  queryKey: ['events', { max: 3 }], // Cache data using key
  queryFn: fetchEvents, // Return promise which fetches the data
});

// useQuery queryFn get passed signal, queryKey and meta
export async function fetchEvents({ signal, queryKey }) {
  let url = new URL('http://localhost:3000/events');

  // queryKey = ['events', { max: 3} ]
  const { max, searchTerm } = queryKey[1];

  // add search params with easy URL constructor
  if (searchTerm) url.searchParams.set('search', searchTerm);
  if (max) url.searchParams.set('max', max);

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the events');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();
  return events;
}
```

## Optimistic updating - Mutate (update) data

The `useMutation` hook is used when doing a mutation e.g. POST, PUT, ...
This should be used instead of `useQuery` since `useQuery` will run the first time the component is loaded, and we don't want to mutate data when the component loads.

It returns the `mutate` function which can be executed to run the `mutationFn`.

In order to clear stale data after a mutation, you can run an `onSuccess` function, with `queryClient.invalidateQueries`.

Optimistic loading of data can be used to provide instant feedback to the user, for e.g. if they were to edit an event and click `save`, they would see their changes before seeing a response from the backend.

In order to roll back for an error, we can use `onError` with `queryClient.setQueryData`.

```js
const { mutate } = useMutation({
  mutationFn: createUpdateEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['events', id],
      exact: true,
    });
  },
  onMutate: async (data) => {
    // Fetch event
    const event = data.event;

    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['events', id] });

    // Get pre-updated data in case the API fails to update
    const previousEvent = queryClient.getQueryData(['events', id]);

    // Optimistic update
    queryClient.setQueryData(['events', id], event);

    // This object becomes the context in onError
    return { previousEvent };
  },
  onError: (error, data, context) => {
    // Rollback if it went wrong
    queryClient.setQueryData(['events', id], context.previousEvent);
  },
  onSettled: () => {
    // Failed/Success this will always run

    // Make sure frontend data matches backend
    // Just in case it's out of sync
    queryClient.invalidateQueries(['events', id]);
  },
});

const handleSubmit = (formData) => {
  mutate({ event: formData, id });
  navigate('../');
};
```
