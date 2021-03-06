import React from 'react'

export const UpsellingPageUI = (props) => {
  const { upsellingProducts, handleAddProductUpselling } = props
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {
        <>
          {!upsellingProducts.error ? upsellingProducts?.products.map(product => (
            <div key={product.id} style={{ display: 'flex', flexDirection: 'column', width: '20%', textAlign: 'center', alignItems: 'center', margin: '10px' }}>
              <img src={product.images} width='100px' />
              <p>{product.name}</p>
              <p>${product.price}</p>
              <button onClick={() => handleAddProductUpselling(product)}>Add</button>
            </div>
          )
          ) : (
            <p>
              {upsellingProducts.message}
            </p>
          )}
        </>
      }
    </div>
  )
}
