import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSession } from '../../contexts/SessionContext'
import { useApi } from '../../contexts/ApiContext'

/**
 * Component to manage logout behavior without UI component
 */
export const LogoutAction = (props) => {
  const {
    UIComponent,
    handleSuccessLogout,
    token,
    useDefualtSessionManager
  } = props

  const [ordering] = useApi()
  const [formState, setFormState] = useState({ loading: false, result: { error: false } })

  const [data, dispatchSession] = useSession()

  /**
   * Default fuction for logout workflow
   */
  const handleLogoutClick = async () => {
    try {
      setFormState({ ...formState, loading: true })
      const accessToken = token || data.token
      const response = await ordering.setAccessToken(accessToken).users().logout()
      setFormState({
        result: response.content,
        loading: false
      })
      if (!response.content.error) {
        if (useDefualtSessionManager) {
          dispatchSession({ type: 'logout' })
        }
        if (handleSuccessLogout) {
          handleSuccessLogout()
        }
      }
    } catch (err) {
      setFormState({
        result: {
          error: true,
          result: err.message
        },
        loading: false
      })
    }
  }

  return (
    <>
      {UIComponent && (
        <UIComponent
          {...props}
          formState={formState}
          handleLogoutClick={handleLogoutClick}
        />
      )}
    </>
  )
}

LogoutAction.propTypes = {
  /**
   * UI Component, this must be containt all graphic elements and use parent props
   */
  UIComponent: PropTypes.elementType,
  /**
   * Function to get logout success event
   */
  handleSuccessLogout: PropTypes.func,
  /**
   * Function to get logout error event
   */
  handleErrorLogout: PropTypes.func,
  /**
   * Provide token if you use custom session manager
   */
  token: PropTypes.string,
  /**
   * Enable/Disable default session manager
   * Remove user and token with default session manager
   */
  useDefualtSessionManager: PropTypes.bool
}

LogoutAction.defaultProps = {
  useDefualtSessionManager: true
}
