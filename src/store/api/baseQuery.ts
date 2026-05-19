import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { apiRequestFinished, apiRequestStarted } from "../ui";

/** Chat and notification traffic is frequent; skip full-screen ApiLoadingOverlay for them. */
function shouldSkipGlobalLoading(args: string | FetchArgs): boolean {
    const raw = typeof args === "string" ? args : args.url;
    if (!raw) return false;
    try {
        const path = raw.startsWith("http") ? new URL(raw).pathname : raw;
        return path.includes("/chat/") || path.includes("/notifications");
    } catch {
        return raw.includes("/chat/") || raw.includes("/notifications");
    }
}

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_EDYN_API_URL || "http://localhost:5057",
    prepareHeaders: headers => {
        const token = localStorage.getItem("jwt");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
})

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs, 
    unknown, 
    FetchBaseQueryError
> = async (args, api , extraOptions) => {
    const skipOverlay = shouldSkipGlobalLoading(args);
    if (!skipOverlay) {
        api.dispatch(apiRequestStarted());
    }
    try {
        let result = await baseQuery(args, api, extraOptions);

        if (result.error && result.error.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");
            const jwt = localStorage.getItem("jwt");

            if (!jwt?.trim() || !refreshToken?.trim()) {
                localStorage.removeItem("jwt");
                localStorage.removeItem("refreshToken");
                return result;
            }

            const refreshResult = await baseQuery({
                url: "/auth/refresh-token",
                method: "POST",
                body: {
                    ExpiredToken: jwt ?? "",
                    RefreshToken: refreshToken ?? "",
                },
            }, api, extraOptions);

            if (refreshResult.data) {
                const tokens = refreshResult.data as Record<string, string | undefined>;
                const accessToken = tokens.accessToken ?? tokens.AccessToken ?? "";
                const newRefreshToken = tokens.refreshToken ?? tokens.RefreshToken ?? "";
                if (accessToken !== "" && newRefreshToken !== "") {
                    localStorage.setItem("jwt", accessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);

                    result = await baseQuery(args, api, extraOptions);
                } else {
                    localStorage.removeItem("jwt");
                    localStorage.removeItem("refreshToken");
                }
            } else {
                localStorage.removeItem("jwt");
                localStorage.removeItem("refreshToken");
            }
        }

        return result;
    } finally {
        if (!skipOverlay) {
            api.dispatch(apiRequestFinished());
        }
    }
}

export { baseQueryWithReauth };
