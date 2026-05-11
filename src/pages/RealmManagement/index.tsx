import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import apiSlice from "../../store/api";
import Loader from "../../components/Loader";
import type { ForumMember } from "../../interfaces/interfaces";
import { ForumRole, canAccessForumManagement, readRoleFromApi } from "../../interfaces/interfaces";
import type { RootState } from "../../store";
import Avatar from "../../components/Avatar";

const ROLE_LABELS: Record<number, string> = {
    [ForumRole.Admin]: "Admin",
    [ForumRole.SuperModerator]: "Super Mod",
    [ForumRole.Moderator]: "Moderator",
    [ForumRole.Member]: "Thành viên",
};

const ROLE_COLORS: Record<number, string> = {
    [ForumRole.Admin]: "bg-danger/10 text-danger",
    [ForumRole.SuperModerator]: "bg-amber-100 text-amber-700",
    [ForumRole.Moderator]: "bg-brand-100 text-brand-700",
    [ForumRole.Member]: "bg-surface-100 text-surface-600",
};

function memberRoleLabel(role: number): string {
    return ROLE_LABELS[role] ?? `Vai trò (${role})`;
}

function memberRoleBadgeClass(role: number): string {
    return ROLE_COLORS[role] ?? "bg-surface-100 text-surface-600";
}

function isPlaceholderBirthday(d?: string | null): boolean {
    if (!d) return true;
    return d.startsWith("0001-01-01");
}

function memberSubtitle(m: ForumMember): string {
    const bio = m.bio?.trim();
    if (bio) return bio;
    if (typeof m.effectivePermissions === "number") {
        return `Quyền hiệu lực: ${m.effectivePermissions}`;
    }
    return "";
}

const ALL_ASSIGNABLE_ROLES = [
    ForumRole.Member,
    ForumRole.Moderator,
    ForumRole.SuperModerator,
    ForumRole.Admin,
] as const;

/** Lower numeric value = more privilege (Admin=0). Actor may only assign roles at or below their own. */
function rolesActorMayAssign(actorRole: number): readonly number[] {
    return ALL_ASSIGNABLE_ROLES.filter((r) => r >= actorRole);
}

/** Actor may change a member's role only if that member is not above the actor in the hierarchy. */
function actorMayManageMember(actorRole: number | undefined, member: ForumMember, currentUserId: string): boolean {
    if (actorRole === undefined) return false;
    if (currentUserId !== "" && member.id === currentUserId) return false;
    return member.role >= actorRole;
}

const RealmManagement: React.FC = () => {
    const { name } = useParams();
    const location = useLocation();
    const currentUserId = useSelector((s: RootState) => s.user.id);
    const [currentTab, setCurrentTab] = useState<"member" | "mod" | "settings">("member");
    const [roleChangeTarget, setRoleChangeTarget] = useState<string | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    const { data: realmData, isLoading: realmLoading } = apiSlice.useGetRealmQuery(name!);
    const forumId = realmData?.id;

    const {
        data: forumPerm,
        isLoading: permLoading,
        isError: permError,
    } = apiSlice.useGetForumPermissionsQuery(forumId!, { skip: !forumId });

    const { data: membersRaw, isLoading: membersLoading } = apiSlice.useGetForumMembersQuery(forumId!, { skip: !forumId });
    const [setMemberRole] = apiSlice.useSetMemberRoleMutation();
    const [removeMember] = apiSlice.useRemoveMemberMutation();

    const members = useMemo((): ForumMember[] => {
        if (!Array.isArray(membersRaw)) return [];
        return membersRaw.map((row: unknown) => {
            const r = row as Record<string, unknown>;
            const role = readRoleFromApi(row) ?? ForumRole.Member;
            return {
                id: String(r.id ?? ""),
                username: String(r.username ?? r.id ?? ""),
                avatar: String(r.avatar ?? ""),
                bio: String(r.bio ?? ""),
                birthDay: r.birthDay != null ? String(r.birthDay) : undefined,
                gender: (r.gender as number | null | undefined) ?? null,
                role,
                effectivePermissions: typeof r.effectivePermissions === "number" ? r.effectivePermissions : 0,
                permissionOverrides: r.permissionOverrides as number | null | undefined,
            };
        });
    }, [membersRaw]);

    const sortedMembers = useMemo(
        () => [...members].sort((a, b) => a.role - b.role || a.username.localeCompare(b.username)),
        [members]
    );

    const moderatorTeam = useMemo(
        () => sortedMembers.filter((m) => m.role <= ForumRole.Moderator),
        [sortedMembers]
    );

    const permRole = readRoleFromApi(forumPerm);

    const assignableRoles = useMemo(
        () => (permRole === undefined ? [] : rolesActorMayAssign(permRole)),
        [permRole]
    );

    useEffect(() => {
        if (!roleChangeTarget || permRole === undefined) return;
        const m = members.find((x) => x.id === roleChangeTarget);
        if (!m || !actorMayManageMember(permRole, m, currentUserId)) setRoleChangeTarget(null);
    }, [roleChangeTarget, members, permRole, currentUserId]);

    const tabs = [
        { id: "member" as const, label: "Thành viên", count: sortedMembers.length },
        { id: "mod" as const, label: "Kiểm duyệt viên", count: moderatorTeam.length },
        { id: "settings" as const, label: "Cài đặt" },
    ];

    const handleRoleChange = async (targetUserId: string, role: number) => {
        if (!forumId || permRole === undefined) return;
        if (currentUserId !== "" && targetUserId === currentUserId) return;
        if (role < permRole) return;
        const targetMember = members.find((m) => m.id === targetUserId);
        if (targetMember && targetMember.role < permRole) return;
        try {
            await setMemberRole({ forumId, targetUserId, role }).unwrap();
            setRoleChangeTarget(null);
        } catch (error) {
            console.error("Failed to change role:", error);
        }
    };

    const handleRemoveMember = async (targetUserId: string) => {
        if (!forumId || permRole === undefined) return;
        if (currentUserId !== "" && targetUserId === currentUserId) return;
        const targetMember = members.find((m) => m.id === targetUserId);
        if (targetMember && targetMember.role < permRole) return;
        try {
            await removeMember({ forumId, targetUserId }).unwrap();
            setConfirmRemove(null);
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    if (realmLoading || (forumId && permLoading)) return <Loader />;

    if (
        realmData &&
        forumId &&
        !permLoading &&
        (permError || !canAccessForumManagement(permRole))
    ) {
        const forumBase = location.pathname.startsWith("/realm/")
            ? `/realm/${name}`
            : `/r/${name}`;
        return <Navigate to={forumBase} replace />;
    }

    const renderMemberRows = (list: ForumMember[]) => (
        <div className="divide-y divide-surface-100">
            {list.map((member) => {
                const isSelf = currentUserId !== "" && member.id === currentUserId;
                const canChangeRole = actorMayManageMember(permRole, member, currentUserId);
                const subtitle = memberSubtitle(member);
                const showBirth = !isPlaceholderBirthday(member.birthDay);

                return (
                    <div key={member.id} className="flex flex-col gap-2 px-5 py-4 hover:bg-surface-50 transition-colors sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <Avatar 
                                src={member.avatar?.trim() ? member.avatar : null}
                                name={member.username}
                                className="w-10 h-10"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-surface-900 truncate">{member.username}</p>
                                {subtitle && (
                                    <p className="text-xs text-surface-500 truncate mt-0.5">{subtitle}</p>
                                )}
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-surface-400">
                                    <span>ID: {member.id}</span>
                                    {showBirth && <span>Sinh: {member.birthDay?.slice(0, 10)}</span>}
                                    {member.gender != null && <span>Giới tính: {member.gender}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
                            {roleChangeTarget === member.id && canChangeRole ? (
                                <div className="flex flex-wrap items-center gap-1">
                                    {assignableRoles.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={`px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-opacity hover:opacity-90 ${memberRoleBadgeClass(role)}`}
                                            onClick={() => handleRoleChange(member.id, role)}
                                        >
                                            {memberRoleLabel(role)}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="px-2 py-1 text-xs text-surface-400 hover:text-surface-600 cursor-pointer"
                                        onClick={() => setRoleChangeTarget(null)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${memberRoleBadgeClass(member.role)}`}>
                                        {memberRoleLabel(member.role)}
                                    </span>
                                    {canChangeRole && assignableRoles.length > 0 ? (
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
                                            title="Đổi vai trò"
                                            onClick={() => setRoleChangeTarget(member.id)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>
                                    ) : !isSelf ? (
                                        <span className="text-[11px] text-surface-400 px-1 max-w-[140px] text-right" title="Không thể đổi vai trò người trên cấp bạn hoặc chính bạn">
                                            —
                                        </span>
                                    ) : null}

                                    {canChangeRole && confirmRemove === member.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                className="px-2.5 py-1 text-xs font-medium text-white bg-danger rounded-full cursor-pointer hover:opacity-90"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                Xác nhận
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-xs text-surface-400 hover:text-surface-600 cursor-pointer"
                                                onClick={() => setConfirmRemove(null)}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    ) : canChangeRole ? (
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg text-surface-400 hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Xóa thành viên"
                                            onClick={() => setConfirmRemove(member.id)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                            </svg>
                                        </button>
                                    ) : isSelf ? (
                                        <span className="text-[11px] text-surface-400 px-1">Bạn</span>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Avatar 
                    src={realmData?.forumImage}
                    name={realmData?.name}
                    className="w-10 h-10 rounded-xl"
                />
                <div>
                    <h1 className="text-xl font-bold text-surface-900">Quản lý {realmData?.name}</h1>
                    <p className="text-xs text-surface-400">Quản lý thành viên và quyền hạn</p>
                </div>
            </div>

            <div className="flex gap-1 mb-6 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                            currentTab === tab.id
                                ? "bg-brand-100 text-brand-700"
                                : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                        }`}
                        onClick={() => setCurrentTab(tab.id)}
                    >
                        {tab.label}
                        {"count" in tab && tab.count !== undefined && (
                            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
                        )}
                    </button>
                ))}
            </div>

            {currentTab === "member" && (
                <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                    {membersLoading ? (
                        <div className="p-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sortedMembers.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-surface-400 text-sm">Chưa có thành viên</p>
                        </div>
                    ) : (
                        renderMemberRows(sortedMembers)
                    )}
                </div>
            )}

            {currentTab === "mod" && (
                <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                    {membersLoading ? (
                        <div className="p-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : moderatorTeam.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-surface-400 text-sm">Chưa có admin hoặc kiểm duyệt viên</p>
                        </div>
                    ) : (
                        renderMemberRows(moderatorTeam)
                    )}
                </div>
            )}

            {currentTab === "settings" && (
                <div className="space-y-6">
                    {/* Forum Info Section */}
                    <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-100">
                            <h3 className="font-bold text-surface-900">Thông tin cộng đồng</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Tên hiển thị</label>
                                <input 
                                    type="text" 
                                    defaultValue={realmData?.name}
                                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Mô tả</label>
                                <textarea 
                                    defaultValue={realmData?.description}
                                    className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                                />
                            </div>
                            <button className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-all">
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>

                    {/* Tag Management Section */}
                    <TagManagement forumId={forumId!} />
                </div>
            )}
        </div>
    );
};

interface TagManagementProps {
    forumId: string;
}

const TagManagement: React.FC<TagManagementProps> = ({ forumId }) => {
    const { data: tags, isLoading } = apiSlice.useGetForumTagsQuery(forumId);
    const [createTag, { isLoading: isCreating }] = apiSlice.useCreateForumTagMutation();
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#6366f1");

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await createTag({ forumId, name: newTagName, color: newTagColor }).unwrap();
            setNewTagName("");
        } catch (error) {
            console.error("Failed to create tag:", error);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100">
                <h3 className="font-bold text-surface-900">Quản lý Thẻ (Tags)</h3>
            </div>
            <div className="p-6">
                <div className="flex items-end gap-3 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Tên thẻ mới</label>
                        <input 
                            type="text" 
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                            placeholder="Ví dụ: Thảo luận, Hỏi đáp..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Màu sắc</label>
                        <input 
                            type="color" 
                            value={newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value)}
                            className="h-9 w-16 p-1 bg-surface-50 border border-surface-200 rounded-xl cursor-pointer"
                        />
                    </div>
                    <button 
                        onClick={handleCreateTag}
                        disabled={isCreating || !newTagName.trim()}
                        className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-all disabled:opacity-50 h-9"
                    >
                        Thêm thẻ
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags?.map((tag: any) => (
                            <div 
                                key={tag.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-200"
                                style={{ backgroundColor: `${tag.color}10`, color: tag.color, borderColor: `${tag.color}30` }}
                            >
                                <span className="text-sm font-medium">{tag.name}</span>
                                <button className="hover:text-danger transition-colors cursor-pointer">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {tags?.length === 0 && (
                            <p className="text-sm text-surface-400">Chưa có thẻ nào được tạo.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RealmManagement;
