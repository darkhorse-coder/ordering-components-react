import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { useOrder } from '../../contexts/OrderContext'
import { useApi } from '../../contexts/ApiContext'

/**
 * Component to manage payment options behavior without UI component
 */
export const PaymentOptions = (props) => {
  const {
    paymethods,
    businessId,
    onPaymentChange,
    UIComponent
  } = props

  const [ordering] = useApi()
  const [orderState] = useOrder()
  const orderTotal = orderState.carts[`businessId:${businessId}`]?.total || 0

  const [paymethodsList, setPaymethodsList] = useState({ paymethods: [], loading: true, error: null })
  const [paymethodSelected, setPaymethodsSelected] = useState(null)
  const [paymethodData, setPaymethodData] = useState({})

  const parsePaymethods = (paymethods) => {
    const _paymethods = paymethods.filter(credentials => !['paypal_express', 'authorize'].includes(credentials.paymethod.gateway)).map(credentials => {
      const { data, sandbox } = credentials
      const paymethod = credentials.paymethod
      paymethod.sandbox = sandbox
      paymethod.credentials = data
      return paymethod
    })
    return _paymethods
  }

  /**
   * Method to get payment options from API
   */
  const getPaymentOptions = async () => {
    try {
      // setPaymethodsList({ ...paymethodsList, loading: true })
      const { content: { error, result } } = await ordering.businesses(businessId).get()
      if (!error) {
        paymethodsList.paymethods = parsePaymethods(result.paymethods)
      }
      setPaymethodsList({
        ...paymethodsList,
        error: error ? result : null,
        loading: false
      })
    } catch (error) {
      setPaymethodsList({
        ...paymethodsList,
        loading: false,
        error: [error.message]
      })
    }
  }

  /**
   * Method to set payment option selected by user
   * @param {Object} val object with information of payment method selected
   */
  const handlePaymethodClick = (paymethod) => {
    setPaymethodsSelected(paymethod)
    handlePaymethodDataChange({})
  }

  const handlePaymethodDataChange = (data) => {
    setPaymethodData(data)
    if (paymethodSelected) {
      onPaymentChange && onPaymentChange({
        paymethodId: paymethodSelected.id,
        gateway: paymethodSelected.gateway,
        paymethod: paymethodSelected,
        data
      })
    } else {
      onPaymentChange && onPaymentChange(null)
    }
  }

  useEffect(() => {
    if (['card_delivery', 'cash', 'stripe_redirect'].includes(paymethodSelected?.gateway)) {
      onPaymentChange && onPaymentChange({
        paymethodId: paymethodSelected.id,
        gateway: paymethodSelected.gateway,
        paymethod: paymethodSelected,
        data: {}
      })
    } else if (paymethodSelected === null && onPaymentChange) {
      onPaymentChange(null)
    }
  }, [paymethodSelected])

  useEffect(() => {
    if (paymethods) {
      setPaymethodsList({
        ...paymethodsList,
        loading: false,
        paymethods: parsePaymethods(paymethods)
      })
    } else {
      getPaymentOptions()
    }
  }, [])

  return (
    <>
      {UIComponent && (
        <UIComponent
          {...props}
          orderTotal={orderTotal}
          paymethodsList={paymethodsList}
          paymethodSelected={paymethodSelected}
          paymethodData={paymethodData}
          handlePaymethodClick={handlePaymethodClick}
          handlePaymethodDataChange={handlePaymethodDataChange}
        />
      )}
    </>
  )
}

PaymentOptions.propTypes = {
  /**
   * UI Component, this must be containt all graphic elements and use parent props
   */
  UIComponent: PropTypes.elementType,
  /**
   * Options, this must be containt an array of payment options
   */
  paymethods: PropTypes.array,
  /**
   * businessId, this must be contains business id to fetch business from API
   */
  businessId: PropTypes.number,
  /**
   * Get option selected
   */
  onPaymentChange: PropTypes.func,
  /**
   * Components types before Payment Options
   * Array of type components, the parent props will pass to these components
   */
  beforeComponents: PropTypes.arrayOf(PropTypes.elementType),
  /**
   * Components types after Payment Options
   * Array of type components, the parent props will pass to these components
   */
  afterComponents: PropTypes.arrayOf(PropTypes.elementType),
  /**
   * Elements before Payment Options
   * Array of HTML/Components elements, these components will not get the parent props
   */
  beforeElements: PropTypes.arrayOf(PropTypes.element),
  /**
   * Elements after Payment Options
   * Array of HTML/Components elements, these components will not get the parent props
   */
  afterElements: PropTypes.arrayOf(PropTypes.element)
}

PaymentOptions.defaultProps = {
  beforeComponents: [],
  afterComponents: [],
  beforeElements: [],
  afterElements: []
}
