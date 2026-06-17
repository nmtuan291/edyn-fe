export interface Realm {
    id: string,
    name: string,
    creatorId?: string,
    shortName?: string,
    description: string,
    forumBanner: string,
    forumImage: string,
    createdAt?: string,
}

export interface Thread {
    id: string,
    forumId: string,
    creatorId: string,
    title: string,
    isPinned?: boolean,
    tags?: ForumTag[],
    pollItems?: PollItem[],
    images: string[],
    videos?: string[],
    content: string,
    slug?: string,
    upvote: number,
    createdAt: string,
    lastUpdatedAt?: string,
    vote: number,
    userPollVote?: string,
    forumName?: string,
    forumImage?: string,
    creatorName?: string,
    creatorAvatar?: string,
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PollItem {
    pollContent: string,
    voteCount: number,
}

export interface ForumTag {
    id: number,
    forumId?: string,
    name: string,
    color: string,
}

export interface Comment {
    id: string,
    threadId: string,
    ownerId: string,
    ownerName: string,
    content: string,
    upvote: number,
    parentId: string | null,
    childrenComments: Comment[],
    updatedAt: string | null,
    createdAt: string,
    deleted: boolean,
    vote: number,
}

export interface UserProfile {
    accountId: string,
    userName: string,
    birthday?: string,
    avatar: string,
    bio?: string,
    gender?: number,
}

export interface ForumUser {
    forumId: string,
    name: string,
    forumImage: string,
    role: number,
}

export interface ForumMember {
    id: string,
    username: string,
    avatar: string,
    bio: string,
    birthDay?: string,
    gender?: number | null,
    /** ForumRole: Admin=0, SuperModerator=1, Moderator=2, Member=3 */
    role: number,
    effectivePermissions: number,
    permissionOverrides?: number | null,
}

export interface MemberPermission {
    userId: string,
    forumId: string,
    role: number,
    effectivePermissions: number,
    permissionOverrides?: number,
}

export interface ChatMessage {
    id?: string,
    conversationId?: string,
    senderId?: string,
    receiverId: string,
    content: string,
    createdAt?: string,
    editedAt?: string,
    isDeleted: boolean,
    isRead: boolean,
    readAt?: string,
}

export interface Conversation {
    id: string,
    user1Id: string,
    user2Id: string,
    createdAt: string,
    lastMessageAt?: string,
    lastMessageId?: string,
    lastMessage?: ChatMessage,
    messages: ChatMessage[],
}

export interface Notification {
    id: string,
    recipientId?: string,
    createdAt: string,
    message: string,
    isRead?: boolean,
}

// ---- Enums ----

export const ForumRole = {
    Admin: 0,
    SuperModerator: 1,
    Moderator: 2,
    Member: 3,
} as const;

export const ForumPermissionType = {
    None: 0,
    ManageForumInfo: 1,
    ManageRoles: 2,
    DeleteForum: 4,
    PinThread: 8,
    LockThread: 16,
    DeleteThread: 32,
    EditAnyThread: 64,
    DeleteComment: 128,
    EditAnyComment: 256,
    BanMember: 512,
    ManageTags: 1024,
    CreateThread: 2048,
    CreateComment: 4096,
    Vote: 8192,
    All: 16383,
} as const;
export type ForumPermissionType = (typeof ForumPermissionType)[keyof typeof ForumPermissionType];

export const SortBy = {
    Latest: 0,
    Hot: 1,
    Top: 2,
} as const;
export type SortBy = (typeof SortBy)[keyof typeof SortBy];

export const SortDate = {
    Day: 0,
    Month: 1,
    Year: 2,
    All: 3,
} as const;
export type SortDate = (typeof SortDate)[keyof typeof SortDate];

export const VoteStatus = {
    UpVote: 1,
    DownVote: -1,
    NoVote: 0,
} as const;
export type VoteStatus = (typeof VoteStatus)[keyof typeof VoteStatus];

// ---- Helpers ----

/** Check if a user has a specific permission using bitwise flags. */
export function hasPermission(effectivePermissions: number, permission: ForumPermissionType): boolean {
    return (effectivePermissions & permission) === permission;
}

/** Read numeric role from API JSON (camelCase or PascalCase). */
export function readRoleFromApi(obj: unknown): number | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    const o = obj as Record<string, unknown>;
    const r = o.role ?? o.Role;
    return typeof r === "number" && !Number.isNaN(r) ? r : undefined;
}

/** Only Admin, SuperModerator, or Moderator may use forum management UI (not regular members). */
export function canAccessForumManagement(role: number | undefined | null): boolean {
    if (role === undefined || role === null) return false;
    return role === ForumRole.Admin
        || role === ForumRole.SuperModerator
        || role === ForumRole.Moderator;
}
