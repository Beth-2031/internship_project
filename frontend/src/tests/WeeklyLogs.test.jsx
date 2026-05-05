// @vitest-environment jsdom
import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import WeeklyLogs from '../pages/student/WeeklyLogs'

vi.mock('../api/client', () => ({
    getWeeklyLogs: vi.fn(() => Promise.resolve([])),
}))

describe('WeeklyLogs', () => {
    it('render without crashing', () => {
        render(
            <MemoryRouter>
                <WeeklyLogs />
            </MemoryRouter>
        )
        expect(document.body).toBeTruthy()
    })
})