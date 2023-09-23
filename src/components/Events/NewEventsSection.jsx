import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../utils/http.js';

export default function NewEventsSection() {
  const { data, isError, error, isPending } = useQuery({
    queryKey: ['events', { max: 3 }], // ? Cache data using key
    queryFn: fetchEvents, // ? Return promise which fetches the data
    staleTime: 1, // ? Send request for updated data if cached data, default 0. always update.
    // gcTime: 300, // ? Keep cache for half minute. Default 5 minutes
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An error occurred'
        message={error.info?.message ?? 'Failed to fetch events'}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className='content-section' id='new-events-section'>
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
