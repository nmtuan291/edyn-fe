import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Realm", "User", "Comment", "Notification", "Conversation", "Thread", "ThreadList", "ForumMembers", "JoinedForums", "Messages", "ForumPermission"],
    endpoints: builder => ({
        // --- Home Feed ---
        getHomeFeed: builder.query({
            query: ({ page = 1, pageSize = 20 }: { page?: number, pageSize?: number } = {}) => `/feed?page=${page}&pageSize=${pageSize}`,
            providesTags: ["ThreadList"],
        }),

        // --- Auth ---
        login: builder.mutation({
            query: body => ({ url: "/auth/login", method: "POST", body })
        }),
        register: builder.mutation({
            query: body => ({ url: "/auth/register", method: "POST", body })
        }),
        verifyEmail: builder.query({
            query: (email: string) => `/auth/verify-email?email=${encodeURIComponent(email)}`
        }),
        verifyUserName: builder.query({
            query: (userName: string) => `/auth/verify-user?username=${encodeURIComponent(userName)}`,
        }),

        // --- User Profile ---
        getUserProfile: builder.query({
            query: (accountId: string) => `/users/${accountId}`,
            providesTags: (_result, _error, id) => [{ type: "User", id }],
        }),

        // --- Forum ---
        getAllForums: builder.query({
            query: () => "/forum",
            providesTags: ["Realm"],
        }),
        getRealm: builder.query({
            query: (name: string) => `/forum/${name}`,
            providesTags: (_result, _error, name) => [{ type: "Realm", id: name }],
        }),
        createForum: builder.mutation({
            query: body => ({ url: "/forum", method: "POST", body }),
            invalidatesTags: ["Realm", "JoinedForums"],
        }),
        joinForum: builder.mutation({
            query: (forumId: string) => ({ url: `/forum/join/${forumId}`, method: "POST" }),
            invalidatesTags: ["JoinedForums", "ForumPermission"],
        }),
        getForumPermissions: builder.query({
            query: (forumId: string) => `/forum/${forumId}/permissions`,
            providesTags: (_result, _error, forumId) => [{ type: "ForumPermission", id: forumId }],
        }),
        getJoinedForums: builder.query({
            query: () => "/forum/joined",
            providesTags: ["JoinedForums"],
        }),
        getForumMembers: builder.query({
            query: (forumId: string) => `/forum/${forumId}/members`,
            providesTags: (_result, _error, forumId) => [{ type: "ForumMembers", id: forumId }],
        }),
        setMemberRole: builder.mutation({
            query: ({ forumId, targetUserId, role }: { forumId: string, targetUserId: string, role: number }) => ({
                url: `/forum/${forumId}/members/${targetUserId}/role`,
                method: "PUT",
                body: { role },
            }),
            invalidatesTags: (_result, _error, { forumId }) => [{ type: "ForumMembers", id: forumId }],
        }),
        removeMember: builder.mutation({
            query: ({ forumId, targetUserId }: { forumId: string, targetUserId: string }) => ({
                url: `/forum/${forumId}/members/${targetUserId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { forumId }) => [{ type: "ForumMembers", id: forumId }],
        }),

        // --- Threads ---
        createThread: builder.mutation({
            query: body => ({ url: "/forumthread", method: "POST", body }),
            invalidatesTags: ["ThreadList"],
        }),
        getThreads: builder.query({
            query: (id: string) => `/forumthread/${id}`,
            providesTags: (result, _error, realmId) =>
                result
                    ? [...result.map((t: any) => ({ type: "Thread" as const, id: t.id })), { type: "ThreadList", id: realmId }]
                    : [{ type: "ThreadList", id: realmId }],
        }),
        getThread: builder.query({
            query: (id: string) => `/forumthread/thread/${id}`,
            providesTags: (result) => result ? [{ type: "Thread", id: result.id }] : [],
        }),

        // --- Comments ---
        createComment: builder.mutation({
            query: body => ({ url: "/forumthread/comment/create", method: "POST", body }),
            invalidatesTags: ["Comment"],
        }),
        getComments: builder.query({
            query: (threadId: string) => `/forumthread/${threadId}/comments`,
            providesTags: ["Comment"],
        }),

        // --- Voting ---
        voteThread: builder.mutation({
            query: body => ({ url: "/forumthread/thread/vote", method: "POST", body }),
            invalidatesTags: (result) => result ? [{ type: "Thread", id: result.id }, "ThreadList"] : [],
        }),
        voteComment: builder.mutation({
            query: body => ({ url: "/forumthread/comment/vote", method: "POST", body }),
            invalidatesTags: ["Comment"],
        }),

        // --- Notifications ---
        getNotification: builder.query({
            query: () => "/notifications",
            providesTags: ["Notification"],
        }),
        updateNotification: builder.mutation({
            query: (notificationId: string) => ({
                url: `/notifications?notificationId=${notificationId}`,
                method: "POST",
            }),
            invalidatesTags: ["Notification"],
        }),

        // --- Chat ---
        getConversation: builder.query({
            query: () => "/chat/conversation",
            providesTags: ["Conversation"],
        }),
        getMessages: builder.query({
            query: (conversationId: string) => `/chat/conversation/${conversationId}/messages`,
            providesTags: (_result, _error, id) => [{ type: "Messages", id }],
        }),
        sendMessage: builder.mutation({
            query: body => ({ url: "/chat/conversation/add", method: "POST", body }),
            invalidatesTags: ["Conversation", "Messages"],
        }),

        // --- Image Upload ---
        uploadImage: builder.mutation({
            query: ({ body, cloudName }) => ({
                url: `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                method: "POST",
                body,
            })
        }),
    })
})

export default apiSlice;
