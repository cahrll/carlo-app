export interface UserProfile {
    id: string
    name: string | null
    email: string | null
    image_url: string | null
    created_at: string
    updated_at: string
}

export interface Organization {
    id: string
    name: string
    owner_id: string
    created_at: string
    updated_at: string
}

export interface Board {
    id: string
    title: string
    description?: string
    org_id: string
    creator_id: string
    creator_name?: string
    task_count?: number
    done_count?: number
    created_at: string
    updated_at: string
}

export interface Section {
    id: string
    title: string
    sort_order: number
    board_id: string
    creator_id: string
    created_at: string
}

export interface Task {
    id: string
    title: string
    description?: string
    section_id: string
    sort_order: number
    creator_id: string
    creator_name?: string
    assignee_id?: string
    assignee_name?: string
    due_date?: string
    priority?: string
    comment_count?: number
    created_at: string
    updated_at: string
}

export interface TaskComment {
    id: string
    task_id: string
    author_id: string
    text: string
    created_at: string
    author: { id: string; name: string | null; image_url: string | null } | null
}

export interface SectionWithTasks extends Section {
    tasks: Task[]
}

export interface Member {
    member_id: string
    org_id: string
    role: string
    status: string
    created_at: string
    user_profile: {
        id: string
        name: string | null
        image_url: string | null
    }
}

export interface Invitation {
    id: string
    org_id: string
    email: string
    role: string
    status: string
    invited_by: string
    created_at: string
    accepted_at: string | null
    expires_at: string | null
    invited_by_profile: {
        id: string
        name: string | null
        image_url: string | null
    }
}

export interface ChatRoom {
    id: string
    org_id: string
    name: string
    creator_id: string
    created_at: string
}

export interface ChatRoomWithLatest extends ChatRoom {
    latest_message: {
        text: string
        created_at: string
        author: { id: string; name: string | null } | null
    } | null
    members: {
        member_id: string
        role: string
        user_profile: { id: string; name: string | null; image_url: string | null }
    }[]
}

export interface ChatMessage {
    id: string
    chat_room_id: string
    author_id: string
    text: string
    created_at: string
    author: { id: string; name: string | null; image_url: string | null } | null
}

// from getInvitationsByUser
export interface UserInvitation {
    id: string
    org_id: string
    email: string
    role: string
    status: string
    invited_by: string
    created_at: string
    accepted_at: string | null
    expires_at: string | null
    // null when org RLS hides the org from a not-yet-member invitee
    organization: {
        id: string
        name: string
    } | null
}