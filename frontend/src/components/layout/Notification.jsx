import {createContext, useContext, useReducer,useCallback} from 'react';

const NotificationContext = createContext();

function notificationReducer(state, action) {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return [...state, action.payload];
        case 'REMOVE_NOTIFICATION':
            return state.filter(notification => notification.id !== action.payload);
        default:
            return state;
    }
}

export function NotificationProvider({ children }) {
    const [notifications, dispatch] = useReducer(notificationReducer, []);
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id, message, type } });
        setTimeout(() => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        }, 5000); // Remove notification after 5 seconds
    }, [dispatch]);

    const value = { notifications, addNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}