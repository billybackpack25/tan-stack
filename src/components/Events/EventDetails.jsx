import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent({ id }),
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none', // don't try to re-fetch event id before navigating away
      });
      navigate('../');
    },
  });

  const handleDeleteEvent = () => mutate({ id });

  const handleStartDelete = () => setIsDeleting(true);
  const handleCancelDelete = () => setIsDeleting(false);

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event, cannot be undone!</p>
          <div className='form-actions'>
            <button onClick={handleCancelDelete} className='button-text'>
              Cancel
            </button>
            <button onClick={handleDeleteEvent} className='button'>
              Delete
            </button>
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to='/events' className='nav-item'>
          View all Events
        </Link>
      </Header>
      <div className='center'>
        {isPending && <LoadingIndicator />}
        {isError && (
          <ErrorBlock
            title='Error fetching event'
            message={error.info?.message ?? 'Could not fetch event'}
          />
        )}
      </div>
      <article id='event-details'>
        {data && (
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to='edit'>Edit</Link>
            </nav>
          </header>
        )}
        {data && (
          <div id='event-details-content'>
            <img src={'http://localhost:3000/' + data.image} alt={data.title} />
            <div id='event-details-info'>
              <div>
                <p id='event-details-location'>{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {new Date(data.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  - {data.time}
                </time>
              </div>
              <p id='event-details-description'>{data.description}</p>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
