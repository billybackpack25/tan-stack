import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import { createUpdateEvent, queryClient } from '../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('../');
    // Immediate re-fetch query to update all events
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  // useMutation optimised for data changing
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createUpdateEvent,
    onSuccess: handleSuccess,
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={handleSuccess}>
      <EventForm onSubmit={handleSubmit}>
        <>
          {!isPending && (
            <Link to='../' className='button-text'>
              Cancel
            </Link>
          )}
          <button type='submit' className='button' disabled={isPending}>
            {isPending ? 'Submitting...' : 'Create'}
          </button>
        </>
      </EventForm>
      {isError && (
        <ErrorBlock
          title='Failed to create event'
          message={
            error.info?.message ??
            'Failed to create event. Please check your inputs and try again later.'
          }
        />
      )}
    </Modal>
  );
}
