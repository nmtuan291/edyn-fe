export interface Realm {
    id: string,
    name: string,
    description: string,
    forumBanner: string,
    forumImage: string
}

export interface Thread {
    id: string,
    createdAt: string,
    content: string,
    title: string,
    creatorId: string,
    forumId: string,
    images: string[],
    upvote: number,
    vote: number
}

export interface Comment {
    id: string,
    ownerId: string,
    deleted: boolean,
    createdAt: string,
    content: string,
    parentId: string | null,
    updateAt: string | null,
    threadId: string
    childrenComments: Comment[],
    ownerName: string
    upvote: number
}