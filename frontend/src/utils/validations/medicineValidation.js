export const validateMedicine = (values) => {
  const errors = {};

  if (!values.medicineName || values.medicineName.trim() === '') {
    errors.medicineName = 'Medicine name is required.';
  } else if (values.medicineName.trim().length < 2) {
    errors.medicineName = 'Medicine name must be at least 2 characters.';
  }

  if (!values.reminderTime || values.reminderTime.trim() === '') {
    errors.reminderTime = 'Reminder time is required.';
  } else {
    const [hours, minutes] = values.reminderTime.split(':').map(Number);
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      errors.reminderTime = 'Please enter a valid time.';
    }
  }

  return errors;
};
