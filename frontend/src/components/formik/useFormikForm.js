import { useFormik } from 'formik'

export default function useFormikForm({
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize = false,
}) {
  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize,
  })
}
