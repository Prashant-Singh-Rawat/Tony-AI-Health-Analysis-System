export const validateAuth = (values) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.email || values.email.trim() === '') {
    errors.email = 'User email is required.';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Invalid email format.';
  }

  if ('name' in values) {
    if (!values.name || values.name.trim() === '') {
      errors.name = 'User name is required.';
    } else if (values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
  }

  if ('password' in values) {
    if (!values.password || values.password.trim() === '') {
      errors.password = 'Password is required.';
    } else if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
  }

  if ('agreed' in values && !values.agreed) {
    errors.agreed = 'You must accept the terms and conditions.';
  }

  return errors;
};
