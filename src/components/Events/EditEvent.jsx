import { Link, useNavigate, useNavigation, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, createUpdateEvent } from '../utils/http.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

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

  const handleClose = () => navigate('../');

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to='../' className='button-text'>
          Cancel
        </Link>
        <button type='submit' className='button'>
          Update
        </button>
      </EventForm>
    </Modal>
  );
}

// Only show edit event route, once it's loaded
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}
