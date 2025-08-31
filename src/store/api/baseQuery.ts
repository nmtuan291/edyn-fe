import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';


const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:5057",
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
    console.log("begin query");

    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        const jwt = localStorage.getItem("jwt");

        const refreshResult = await baseQuery({
            url: "/auth/refresh-token",
            method: "POST",
            body: { 
                expiredToken: jwt,  
                refreshToken
            } 
        }, api, extraOptions);

        if (refreshResult.data) {
            console.log("token refreshed");
            const tokens: any = refreshResult.data;
            if (tokens.accessToken !== "" && tokens.refreshToken !== "") {
                localStorage.setItem("jwt", tokens.accessToken);
                localStorage.setItem("refreshToken", tokens.refreshToken);
                
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
}

export { baseQueryWithReauth };