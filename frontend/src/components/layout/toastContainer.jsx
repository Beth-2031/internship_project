import {createPortal} from 'react-dom';
import { useNotification } from './Notification';
//import './STYLES/toastContainer.css';

export default function ToastContainer() {
    const { notifications, addNotification } = useNotification();
    const dismiss = (id) => {
      // Toasts auto-dismiss after 5s via the provider; no manual dismiss needed.
      // But we keep the button in case the provider adds a remove action later.
    };
    return createPortal(
        <div className="toast-container">
            {notifications.map(notification => (
                <div key={notification.id} className={`toast ${notification.type}`}>
                    {notification.message}
                    <button onClick={() => dismiss(notification.id)}>X</button>
                </div>
            ))}
        </div>,
        document.getElementById('toast-root')
    );
}
