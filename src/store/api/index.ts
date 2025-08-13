import type { Message } from "@mui/icons-material";
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
    tagTypes: ["Realm", "User", "Comment", "Notification", "Conversation"],
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
        }),
        // Notification
        getNotification: builder.query({
            query: () => "/notifications",
            providesTags: ["Notification"]
        }),
        updateNotification: builder.mutation({
            query: body => ({
                url: "/notifications",
                method: "POST",
                body
            }),
            invalidatesTags: ["Notification"]
        }),
        // Chat
        getConversation: builder.query({
            query: () => "/chat/conversation",
            providesTags: ["Conversation"]
        }),
        sendMessage: builder.mutation({
            query: body => ({
                url: "/chat/conversation/add",
                method: "POST",
                body
            }),
            invalidatesTags: ["Conversation"]
        })
    })
})

export default apiSlice;