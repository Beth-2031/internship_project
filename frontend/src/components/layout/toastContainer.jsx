import {createPortal} from 'react-dom';
import { useNotification } from './Notification';
//import './STYLES/toastContainer.css';

export default function ToastContainer() {
    const { notifications } = useNotification();
    return createPortal(
        <div className="toast-container">
            {notifications.map(notification => (
                <div key={notification.id} className={`toast ${notification.type}`}>
                    {notification.message}
                </div>
            ))}
        </div>,
        document.getElementById('toast-root')
    );
}
