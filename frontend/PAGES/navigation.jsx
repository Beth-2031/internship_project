import {useContext, createContext} from 'react';

const NavigationContext = createContext();


export const NavigationProvider = ({ children }) => {
    const Navigate = useNavigate();
    const goToHome = () => Navigate('/');
    const goToStudentDashboard = () => Navigate('/student/dashboard');
    const goToSupervisorDashboard = () => Navigate('/supervisor/dashboard');
    const goToAcademicDashboard = () => Navigate('/academic/dashboard');
    const goToAdminDashboard = () => Navigate('/admin/dashboard');
}

return (
    <NavigationContext.Provider value={{ goToHome, goToStudentDashboard, goToSupervisorDashboard, goToAcademicDashboard, goToAdminDashboard }}>
        {children}
    </NavigationContext.Provider>
);


export function useNavigation (){
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
}