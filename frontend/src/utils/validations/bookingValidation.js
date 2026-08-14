export const validateBooking = (values) => {
  const errors = {};

  if (!values.date) {
    errors.date = 'Reservation date is required.';
  } else {
    const selectedDate = new Date(values.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.date = 'The date cannot be in the past.';
    }
  }

  if (!values.time || values.time.trim() === '') {
    errors.time = 'The time of the reservation is required.';
  }

  return errors;
};
