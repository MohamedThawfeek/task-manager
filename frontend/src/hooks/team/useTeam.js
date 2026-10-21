import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { selectLoader, setLoader } from '../../redux/slice/initialLoader'
import { selectTeamState, setTeamError, setTeamRows } from '../../redux/slice/team'
import { createUser, deleteUser, getUsers, updateUser } from '../../service/user'
import toast from 'react-hot-toast'

export default function useTeam() {
  const dispatch = useAppDispatch()
  const { rows, error } = useAppSelector(selectTeamState)
  const isLoading = useAppSelector(selectLoader('teamList'))
  const isSubmitting = useAppSelector(selectLoader('teamSubmit'))
  const isDeleting = useAppSelector(selectLoader('teamDelete'))
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const loadTeam = useCallback(async () => {
    dispatch(setLoader({ key: 'teamList', value: true }))
    dispatch(setTeamError(''))
    try {
      const users = await getUsers()
      dispatch(setTeamRows(users))
      return users
    } catch (error) {
      dispatch(setTeamError(error.message || 'Unable to load users'))
      throw error
    } finally {
      dispatch(setLoader({ key: 'teamList', value: false }))
    }
  }, [dispatch])

  useEffect(() => {
    loadTeam().catch(() => undefined)
  }, [loadTeam])

  const closeModal = () => {
    setModal(false)
    setEditing(null)
  }
  const openCreate = () => {
    setEditing(null)
    setModal(true)
  }
  const openEdit = (member) => {
    setEditing(member)
    setModal(true)
  }
  const saveMember = async (data) => {
    dispatch(setLoader({ key: 'teamSubmit', value: true }))
    dispatch(setTeamError(''))
    try {
      let result
      if (editing) {
        const payload = { id: editing.id, ...data }
        if (!payload.password) delete payload.password
        result = await updateUser(payload)
      } else {
        result = await createUser(data)
      }
      await loadTeam()
      toast.success(result.message || (editing ? 'User updated successfully' : 'User created successfully'))
      closeModal()
    } catch (error) {
      dispatch(setTeamError(error.message || 'Unable to save user'))
      toast.error(error.message || 'Unable to save user')
    } finally {
      dispatch(setLoader({ key: 'teamSubmit', value: false }))
    }
  }
  const removeMember = async () => {
    if (!deleting) return
    dispatch(setLoader({ key: 'teamDelete', value: true }))
    dispatch(setTeamError(''))
    try {
      const result = await deleteUser(deleting.id)
      await loadTeam()
      toast.success(result.message || 'User deleted successfully')
    } catch (error) {
      dispatch(setTeamError(error.message || 'Unable to delete user'))
      toast.error(error.message || 'Unable to delete user')
    } finally {
      dispatch(setLoader({ key: 'teamDelete', value: false }))
    }
  }

  return {
    team: rows,
    error,
    isLoading,
    isSubmitting,
    isDeleting,
    isMutating: isSubmitting || isDeleting,
    modal,
    editing,
    deleting,
    setDeleting,
    loadTeam,
    openCreate,
    openEdit,
    closeModal,
    saveMember,
    removeMember,
  }
}
