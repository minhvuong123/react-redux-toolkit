import {
  createReducer,
  createAction,
  current,
  PayloadAction,
  nanoid,
  createSlice,
  createAsyncThunk,
  AsyncThunk
} from '@reduxjs/toolkit'
import { initalPostList } from 'constants/blog'
import { Post } from 'types/blog.type'
import http from 'utils/http'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
  currentRequestId: undefined | string
}

const initialState: BlogState = {
  postList: [],
  editingPost: null,
  loading: false,
  currentRequestId: undefined
}

// export const addPost = createAction<Post>('blog/addPost')

// export const modifiedAction = createAction('blog/modifiedAction', function prepare(post: Omit<Post, 'id'>) {
//   return {
//     payload: {
//       ...post,
//       id: nanoid()
//     }
//   }
// })

// export const deletePost = createAction<string>('blog/deletePost')

// export const startEditingPost = createAction<string>('blog/startEditingPost')

// export const cancelEditingPost = createAction('blog/cancelEditingPost')

// export const finishEditingPost = createAction<Post>('blog/finishEditingPost')

// matcher
// const actionMatcher = (action: { type: string }) => {
//   return action.type.includes('cancel')
// }

// const blogReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(addPost, (state, action) => {
//       // immer.js => help changing subData in object
//       const post = action.payload
//       state.postList.push(post)
//     })
//     .addCase(deletePost, (state, action) => {
//       const postId = action.payload
//       const foundPostIndex = state.postList.findIndex((post) => post.id === postId)

//       if (foundPostIndex !== -1) {
//         state.postList.splice(foundPostIndex, 1)
//       }
//     })
//     .addCase(startEditingPost, (state, action) => {
//       const postId = action.payload
//       const foundPost = state.postList.find((post) => post.id === postId) || null

//       state.editingPost = foundPost
//     })
//     .addCase(cancelEditingPost, (state) => {
//       state.editingPost = null
//     })
//     .addCase(finishEditingPost, (state, action) => {
//       const postId = action.payload.id
//       state.postList.some((post, index) => {
//         if (post.id === postId) {
//           state.postList[index] = action.payload
//           return true
//         }

//         return false
//       })

//       state.editingPost = null
//     })
//     .addMatcher(actionMatcher, (state, action) => {
//       console.log('matcher cancel')
//       console.log(state) // proxy of immer.js
//       console.log(current(state))
//     })
//     .addDefaultCase((state, action) => {
//       // same as defaut of switch case
//     })
// })

// const blogReducer = createReducer(
//   initialState,
//   {
//     [addPost.type]: (state, action: PayloadAction<Post>) => {}
//   },
//   [
//     {
//       matcher: actionMatcher as any,
//       reducer(state, action) {}
//     }
//   ],
//   (state) => {
//     // default
//   }
// )

// export default blogReducer

// use slice
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkApi) => {
  const response = await http.get<Post[]>('posts', { signal: thunkApi.signal })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkApi) => {
  try {
    const response = await http.post<Post>('posts', body, { signal: thunkApi.signal })
    return response.data
  } catch (error: any) {
    if (error.name === 'AxiosError' && error.response.status === 422) {
      return thunkApi.rejectWithValue(error.response.data)
    }

    throw error
  }
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkApi) => {
    try {
      const response = await http.put<Post>(`posts/${postId}`, body, { signal: thunkApi.signal })
      return response.data
    } catch (error: any) {
      if (error.name === 'AxiosError' && error.response.status === 422) {
        return thunkApi.rejectWithValue(error.response.data)
      }

      throw error
    }
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkApi) => {
  const response = await http.delete<Post>(`posts/${postId}`, { signal: thunkApi.signal })
  return response.data
})

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // addPost: (state, action: PayloadAction<Post>) => {
    //   // immer.js => help changing subData in object
    //   const post = action.payload
    //   state.postList.push(post)
    // },
    modifiedAction: {
      prepare: (post: Omit<Post, 'id'>) => {
        return {
          payload: {
            ...post,
            id: nanoid()
          }
        }
      },
      reducer: (state, action: PayloadAction<Post>) => {
        // immer.js => help changing subData in object
        const post = action.payload
        state.postList.push(post)
      }
    },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null

      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    },
    finishEditingPost: (state, action: PayloadAction<Post>) => {
      const postId = action.payload.id
      state.postList.some((post, index) => {
        if (post.id === postId) {
          state.postList[index] = action.payload
          return true
        }

        return false
      })

      state.editingPost = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        const post = action.payload
        state.postList.push(post)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload

            return true
          }

          return false
        })

        state.editingPost = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg
        const deletePostIndex = state.postList.findIndex((post) => post.id === postId)

        if (deletePostIndex !== -1) {
          state.postList.splice(deletePostIndex, 1)
        }
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          console.log(action)
          state.loading = true
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<RejectedAction>(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          console.log(action)
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
      .addMatcher<FulfilledAction>(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          console.log(action)
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
      .addDefaultCase((state, action) => {
        // same as defaut of switch case
        console.log('default case', action.type)
      })
  }
})

export const { cancelEditingPost, finishEditingPost, startEditingPost } = blogSlice.actions

const blogReducer = blogSlice.reducer

export default blogReducer
