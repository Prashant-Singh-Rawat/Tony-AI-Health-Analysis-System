import { useState } from 'react';

export function useFormValidation(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {  
    const { name, type, checked, value } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    const newValues = { ...values, [name]: finalValue };
    setValues(newValues);

    if (validateFn) {
      const validationErrors = validateFn(newValues);
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] || '' }));
    }
  };

  const validate = (fieldName, fieldValue) => {
    if (!validateFn) return;
    const newValues = { ...values, [fieldName]: fieldValue };
    const validationErrors = validateFn(newValues);
    setErrors((prev) => ({ ...prev, [fieldName]: validationErrors[fieldName] || '' }));
  };

  const validateAll = () => {
    if (!validateFn) return true;
    const validationErrors = validateFn(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const reset = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    validateAll,
    setValues,
    reset,
  };
}
