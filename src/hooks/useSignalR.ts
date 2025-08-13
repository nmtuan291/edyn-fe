import { useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";

interface SignalRConfig {
    hub: string,
    accessTokenFactory: () => string | null,
    method: string
    autoReconnect?: boolean
}

interface SignalRState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

export const useSignalR = (config: SignalRConfig) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const [state, setState] = useState<SignalRState>({
        isConnected: false,
        isConnecting: false,
        error: null
    })

    const onMessage = useCallback((callback: (message: string) => void) => {
        if (connectionRef.current && state.isConnected) {
            connectionRef.current.off(config.method, callback);
            connectionRef.current.on(config.method, callback);

            return () => connectionRef.current?.off(config.method, callback);
        } else {
            console.log("SignalR is not connected");
        }
    }, [state.isConnected, config.method]);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5057/hubs/${config.hub}`, {
            accessTokenFactory: () => config.accessTokenFactory() || ""
        })
        .withAutomaticReconnect()
        .build();

        connectionRef.current = connection;

        const startConnection = async () => {
            try {
                setState(prev => ({...prev, isConnecting: true}))
                await connection.start();
                setState(prev => ({...prev, isConnecting: false, isConnected: true}))
            } catch (err) {
                setState(prev => ({...prev, error: "Error while connecting"}))
            }
        };

        startConnection();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [])
    
    return {
        ...state,
        onMessage
    }
}
