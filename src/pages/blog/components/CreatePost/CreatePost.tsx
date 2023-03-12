import { unwrapResult } from '@reduxjs/toolkit'
import { addPost, cancelEditingPost, updatePost } from 'pages/blog/blog.reducer'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from 'stores'
import { Post } from 'types/blog.type'

interface ErrorForm {
  publishDate: string
}

const initalState: Post = {
  title: '',
  description: '',
  publishDate: '',
  id: '',
  featuredImage: '',
  published: false
}

export default function CreatePost() {
  const [formData, setFormData] = useState<Post>(initalState)
  const [errorForm, setErrorForm] = useState<null | ErrorForm>(initalState)
  const dispatch = useAppDispatch()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (editingPost) {
      dispatch(
        updatePost({
          postId: editingPost.id,
          body: formData
        })
      )
        .unwrap()
        .then((res) => {
          setFormData(initalState)

          if (errorForm) {
            setErrorForm(null)
          }
        })
        .catch((err) => {
          setErrorForm(err.error)
        })
    } else {
      try {
        const res = await dispatch(addPost(formData))
        unwrapResult(res)
        setFormData(initalState)

        if (errorForm) {
          setErrorForm(null)
        }
      } catch (error: any) {
        setErrorForm(error.error)
      }
    }
  }

  const editingPost = useSelector((state: RootState) => state.blog.editingPost)
  useEffect(() => {
    setFormData(editingPost || initalState)
  }, [editingPost])

  const handleCancelEditingPost = () => {
    dispatch(cancelEditingPost())
  }

  return (
    <div>
      <form onSubmit={handleSubmit} onReset={handleCancelEditingPost}>
        <div className='mb-6'>
          <label htmlFor='title' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'>
            Title
          </label>
          <input
            type='text'
            id='title'
            className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            placeholder='Title'
            required={false}
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
          />
        </div>
        <div className='mb-6'>
          <label htmlFor='featuredImage' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'>
            Featured Image
          </label>
          <input
            type='text'
            id='featuredImage'
            className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
            placeholder='Url image'
            required={false}
            value={formData.featuredImage}
            onChange={(event) => setFormData((prev) => ({ ...prev, featuredImage: event.target.value }))}
          />
        </div>
        <div className='mb-6'>
          <div>
            <label htmlFor='description' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400'>
              Description
            </label>
            <textarea
              id='description'
              rows={3}
              className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
              placeholder='Your description...'
              required={false}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            ></textarea>
          </div>
        </div>
        <div className='mb-6'>
          <label
            htmlFor='publishDate'
            className={`mb-2 block text-sm font-medium dark:text-gray-300 ${
              errorForm?.publishDate ? 'text-red-700' : 'text-grey-900'
            }`}
          >
            Publish Date
          </label>
          <input
            type='datetime-local'
            id='publishDate'
            className={`block w-56 rounded-lg border  p-2.5 text-sm  focus:outline-none ${
              errorForm?.publishDate
                ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder='Title'
            required={false}
            value={formData.publishDate}
            onChange={(event) => setFormData((prev) => ({ ...prev, publishDate: event.target.value }))}
          />
          {errorForm?.publishDate && (
            <p className='mt-2 text-sm text-red-600'>
              <span className='font-medium'>{errorForm.publishDate}</span>
            </p>
          )}
        </div>
        <div className='mb-6 flex items-center'>
          <input
            id='publish'
            type='checkbox'
            className='h-4 w-4 focus:ring-2 focus:ring-blue-500'
            checked={formData.published}
            onChange={(event) => setFormData((prev) => ({ ...prev, published: event.target.checked }))}
          />
          <label htmlFor='publish' className='ml-2 text-sm font-medium text-gray-900'>
            Publish
          </label>
        </div>
        <div>
          {!editingPost && (
            <button
              className='group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800'
              type='submit'
            >
              <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                Publish Post
              </span>
            </button>
          )}
          {editingPost && (
            <>
              <button
                type='submit'
                className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-200 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 dark:focus:ring-lime-800'
              >
                <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                  Update Post
                </span>
              </button>
              <button
                type='reset'
                className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 dark:focus:ring-red-400'
              >
                <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                  Cancel
                </span>
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
