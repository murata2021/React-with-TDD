import React from 'react'
import {render} from '@testing-library/react'
import AuthContextWrapper from '../state/AuthContextWrapper'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from "react-redux";
import createStore from "../state/store"


// const RootWrapper = ({children}) => {
//   return (
//     <BrowserRouter>
//       <AuthContextWrapper>
//         {children}
//       </AuthContextWrapper>
//     </BrowserRouter>
//   )
// }

// const customRender = (ui, options) =>
//   render(ui, {wrapper: RootWrapper, ...options})

// // re-export everything
// export * from '@testing-library/react'

// // override render method
// export {customRender as render}

const RootWrapper = ({children}) => {
    return (
      <BrowserRouter>
        <Provider store={createStore()}>
          {children}
        </Provider>
      </BrowserRouter>
    )
  }
  
  const customRender = (ui, options) =>
    render(ui, {wrapper: RootWrapper, ...options})
  
  // re-export everything
  export * from '@testing-library/react'
  
  // override render method
  export {customRender as render}