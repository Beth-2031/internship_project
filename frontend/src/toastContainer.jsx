import {createPortal} from 'react-dom';
import { useNotification } from './Notification';
import './STYLES/toastContainer.css';

export default function ToastContainer({notifications ,onDismiss}) {
    return createPortal(
        <div className="toast-container">
            {notifications.map(notification => (
                <div key={notification.id} className={`toast ${notification.type}`}>
                    {notification.message}
                    <button onClick={() => onDismiss(notification.id)}>X</button>
                </div>
            ))}
        </div>,
        document.getElementById('toast-root')
    );
}
