import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ 
        baseUrl: "http://localhost:5057",
        prepareHeaders: headers => {
            const token = localStorage.getItem("jwt");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        }
     }),
    tagTypes: ["Realm", "User", "Comment"],
    endpoints: builder => ({
        getRealm: builder.query({
            query: name => `/forum/${name}`,
            providesTags: (result, error, name) => [{type: "Realm", name}],
        }),
        register: builder.mutation({
            query: body => ({
                url: "/auth/register",
                method: "POST",
                body
            })
        }),
        verifyEmail: builder.query({
            query: (email: string) => `/auth/verify-email?email=${encodeURIComponent(email)}`
        }),
        verifyUserName: builder.query({
            query: (userName: string) => `/auth/verify-user?username=${encodeURIComponent(userName)}`,
        }),
        login: builder.mutation({
            query: body => ({
                url: "/auth/login",
                method: "POST",
                body
            })
        }),
        // Create threads(posts)
        uploadImage: builder.mutation({
            query: ({ body, cloudName }) => ({
                url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                method: "POST",
                body,
            }) 
        }),
        createThread: builder.mutation({
            query: body => ({
                url: "/forumthread",
                method: "POST",
                body
            })
        }),
        getThreads: builder.query({
            query: id => `/forumthread/${id}`,
        }),
        getThread: builder.query({
            query: id => `/forumthread/thread/${id}`
        }),
        //Comment
        createComment: builder.mutation({
            query: body => ({
                url: "/forumthread/comment/create",
                method: "POST",
                body
            }),
            invalidatesTags: ["Comment"]
        }),
        getComments: builder.query({
            query: threadId => `/forumthread/${threadId}/comments`,
            providesTags: ["Comment"]
        })
    })
})

export default apiSlice;

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const apiSlice = createApi({
//   reducerPath: 'api',
//   baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
//   tagTypes: ['Item'],  // For cache invalidation (optional but recommended)
//   endpoints: (builder) => ({
//     // GET (READ): Fetch all items
//     getItems: builder.query({
//       query: () => '/items',
//       providesTags: (result) =>
//         result ? [...result.map(({ id }) => ({ type: 'Item', id })), { type: 'Item', id: 'LIST' }] : [{ type: 'Item', id: 'LIST' }],
//     }),

//     // GET (READ): Fetch by ID
//     getItem: builder.query({
//       query: (id) => `/items/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Item', id }],
//     }),

//     // POST (CREATE)
//     createItem: builder.mutation({
//       query: (newItem) => ({
//         url: '/items',
//         method: 'POST',
//         body: newItem,
//       }),
//       invalidatesTags: [{ type: 'Item', id: 'LIST' }],
//     }),

//     // PUT or PATCH (UPDATE)
//     updateItem: builder.mutation({
//       query: ({ id, ...updatedFields }) => ({
//         url: `/items/${id}`,
//         method: 'PUT',  // Use PATCH if only updating some fields
//         body: updatedFields,
//       }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'Item', id }],
//     }),

//     // DELETE
//     deleteItem: builder.mutation({
//       query: (id) => ({
//         url: `/items/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: [{ type: 'Item', id: 'LIST' }],
//     }),
//   }),
// });
