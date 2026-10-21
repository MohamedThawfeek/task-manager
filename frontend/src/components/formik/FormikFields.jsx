import { useFormik } from "formik";

const Formhandel = ({
  initialValue,
  schema,
  submitFunction,
  enableReinitialize = false,
}) => {
  const {
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    touched,
    isSubmitting,
    errors,
    setFieldValue,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: initialValue,
    validationSchema: schema,
    onSubmit: submitFunction,
    enableReinitialize,
  });

  return {
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    touched,
    isSubmitting,
    errors,
    setFieldValue,
    setValues,
    resetForm,
  };
};

export default Formhandel;
