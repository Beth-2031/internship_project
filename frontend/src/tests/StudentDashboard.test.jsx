// @vitest-environment jsdom
import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import StudentDashboard from '../pages/student/Dashboard'
import { getCourseCompletion, getMyPlacement } from '../api/client'

vi.mock('../api/client', () => ({
    getMyPlacement: vi.fn(() => Promise.resolve(null)),
    getWeeklyLogs: vi.fn(() => Promise.resolve([])),
    getSafetyReports: vi.fn(() => Promise.resolve([])),
    getCourseCompletion: vi.fn(() => Promise.resolve(null)),
}))

describe('StudentDashboard', () => {
    it('render without crashing', () => {
        render(
            <MemoryRouter>
                <StudentDashboard />
            </MemoryRouter>
        )
        expect(document.body).toBeTruthy()
    })
})