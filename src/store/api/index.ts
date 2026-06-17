import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Realm", "User", "Comment", "Notification", "Conversation", "Thread", "ThreadList", "ForumMembers", "JoinedForums", "Messages", "ForumPermission", "ForumTags", "UnreadCount"],
    endpoints: builder => ({
        // --- Home Feed ---
        getHomeFeed: builder.query({
            query: ({ page = 1, pageSize = 20, sort = "Hot", date = "All" }: { page?: number, pageSize?: number, sort?: "Hot" | "Latest" | "Top", date?: "Day" | "Month" | "Year" | "All" } = {}) => `/feed?page=${page}&pageSize=${pageSize}&sort=${sort}&date=${date}`,
            providesTags: ["ThreadList"],
        }),

        // --- Auth ---
        login: builder.mutation({
            query: body => ({ url: "/auth/login", method: "POST", body })
        }),
        oauthLogin: builder.mutation({
            query: body => ({ url: "/auth/oauth-login", method: "POST", body })
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
        logout: builder.mutation({
            query: (refreshToken: string) => ({
                url: "/auth/logout",
                method: "POST",
                body: { refreshToken },
            }),
        }),
        changePassword: builder.mutation({
            query: (body: { currentPassword: string; newPassword: string; newPasswordVerify: string }) => ({
                url: "/auth/change-password",
                method: "POST",
                body,
            }),
        }),
        revokeAllSessions: builder.mutation({
            query: () => ({ url: "/auth/revoke-all-sessions", method: "POST" }),
        }),

        // --- User Profile ---
        getUserProfile: builder.query({
            query: (accountId: string) => `/users/${accountId}`,
            providesTags: (_result, _error, id) => [{ type: "User", id }],
        }),
        updateUserProfile: builder.mutation({
            query: (body: { bio?: string | null; avatar?: string | null; birthday?: string | null; gender?: number }) => ({
                url: "/users/profile",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["User"],
        }),

        // --- Forum ---
        getAllForums: builder.query({
            query: () => "/forum",
            providesTags: ["Realm"],
        }),
        searchForums: builder.query({
            query: (q: string) => `/forum/search?q=${encodeURIComponent(q)}`,
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
        leaveForum: builder.mutation({
            query: (forumId: string) => ({ url: `/forum/leave/${forumId}`, method: "POST" }),
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
        getRecentForums: builder.query({
            query: () => "/forum/recent",
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
        setMemberPermissions: builder.mutation({
            query: ({ forumId, targetUserId, permissions }: { forumId: string, targetUserId: string, permissions: number }) => ({
                url: `/forum/${forumId}/members/${targetUserId}/permissions`,
                method: "PUT",
                body: { permissions },
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

        // --- Forum Tags ---
        getForumTags: builder.query({
            query: (forumId: string) => `/forum/${forumId}/tags`,
            providesTags: (_result, _error, forumId) => [{ type: "ForumTags", id: forumId }],
        }),
        createForumTag: builder.mutation({
            query: ({ forumId, name, color }: { forumId: string, name: string, color?: string }) => ({
                url: `/forum/${forumId}/tags`,
                method: "POST",
                body: { name, color },
            }),
            invalidatesTags: (_result, _error, { forumId }) => [{ type: "ForumTags", id: forumId }],
        }),

        // --- Threads ---
        createThread: builder.mutation({
            query: body => ({ url: "/forumthread", method: "POST", body }),
            invalidatesTags: ["ThreadList"],
        }),
        getThreads: builder.query({
            query: ({ forumId, page = 1, pageSize = 10, sortBy = 1, sortDate = 3 }: { forumId: string, page?: number, pageSize?: number, sortBy?: number, sortDate?: number }) =>
                `/forumthread/${forumId}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortDate=${sortDate}`,
            providesTags: (result, _error, { forumId }) =>
                result?.items
                    ? [...result.items.map((t: any) => ({ type: "Thread" as const, id: t.id })), { type: "ThreadList", id: forumId }]
                    : [{ type: "ThreadList", id: forumId }],
        }),
        searchThreads: builder.query({
            query: ({ q, page = 1, pageSize = 10 }: { q: string, page?: number, pageSize?: number }) =>
                `/forumthread/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`,
        }),
        getThread: builder.query({
            query: (id: string) => `/forumthread/thread/${id}`,
            providesTags: (result) => result ? [{ type: "Thread", id: result.id }] : [],
        }),
        editThread: builder.mutation({
            query: ({ threadId, title, content, videos }: { threadId: string, title?: string, content?: string, videos?: string[] }) => ({
                url: `/forumthread/thread/${threadId}`,
                method: "PUT",
                body: { title, content, videos },
            }),
            invalidatesTags: (result) => result ? [{ type: "Thread", id: result.id }, "ThreadList"] : [],
        }),
        deleteThread: builder.mutation({
            query: (threadId: string) => ({
                url: `/forumthread/thread/${threadId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ThreadList"],
        }),
        pinThread: builder.mutation({
            query: ({ threadId, isPinned }: { threadId: string, isPinned: boolean }) => ({
                url: `/forumthread/thread/${threadId}/pin`,
                method: "PUT",
                body: { isPinned },
            }),
            invalidatesTags: (result) => result ? [{ type: "Thread", id: result.id }, "ThreadList"] : ["ThreadList"],
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
        editComment: builder.mutation({
            query: ({ commentId, content }: { commentId: string, content: string }) => ({
                url: `/forumthread/comment/${commentId}`,
                method: "PUT",
                body: { content },
            }),
            invalidatesTags: ["Comment"],
        }),
        deleteComment: builder.mutation({
            query: (commentId: string) => ({
                url: `/forumthread/comment/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Comment"],
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
        votePoll: builder.mutation({
            query: (body: { threadId: string, pollContent: string }) => ({ url: "/forumthread/thread/poll-vote", method: "POST", body }),
            invalidatesTags: (result) => result ? [{ type: "Thread", id: result.id }] : [],
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
            invalidatesTags: ["Notification", "UnreadCount"],
        }),
        markAllNotificationsRead: builder.mutation({
            query: () => ({
                url: "/notifications/mark-all-read",
                method: "POST",
            }),
            invalidatesTags: ["Notification", "UnreadCount"],
        }),
        getUnreadNotificationCount: builder.query({
            query: () => "/notifications/unread-count",
            providesTags: ["UnreadCount"],
        }),
        deleteNotification: builder.mutation({
            query: (notificationId: string) => ({
                url: `/notifications/${notificationId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notification", "UnreadCount"],
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
