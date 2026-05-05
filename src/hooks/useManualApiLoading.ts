import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { apiRequestFinished, apiRequestStarted } from "../store/ui";

/**
 * Shows the global API loading overlay while `active` is true.
 * Use for non-RTK requests or to cover a coordinated multi-step flow; RTK Query calls are counted automatically in baseQuery.
 */
export function useManualApiLoading(active: boolean): void {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        if (!active) return;
        dispatch(apiRequestStarted());
        return () => {
            dispatch(apiRequestFinished());
        };
    }, [active, dispatch]);
}
