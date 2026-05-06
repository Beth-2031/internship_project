// @vitest-environment jsdom
import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import SupervisorDashboard from '../pages/supervisor/Dashboard'
import { getCourseCompletion, getMyPlacement, getSupervisorSafetyReports, getSupervisorStudents, verifyLog } from '../api/client'

vi.mock('../api/client', async (imprtOriginal) => ({
    getSupervisorStudents: vi.fn(() => Promise.resolve([])),
    getPendingLogs: vi.fn(() => Promise.resolve([])),
    getSupervisorSafetyReports: vi.fn(() => Promise.resolve([])),
    verifyLog: vi.fn(() => Promise.resolve({})),
}))

describe('SupervisorDahboard', () => {
    it('render without crashing', () => {
        render(
            <MemoryRouter>
                <SupervisorDashboard />
            </MemoryRouter>
        )
        expect(document.body).toBeTruthy()
    })
})