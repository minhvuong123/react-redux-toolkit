import { configureStore } from '@reduxjs/toolkit'
import blogReducer from 'pages/blog/blog.reducer'
import { useDispatch } from 'react-redux'

export const store = configureStore({
  reducer: {
    blog: blogReducer
  }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

// use when dispatch a thunk Api
export const useAppDispatch = () => useDispatch<AppDispatch>()
