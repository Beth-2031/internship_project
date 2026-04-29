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
