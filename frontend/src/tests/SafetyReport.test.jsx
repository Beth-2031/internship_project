// @vitest-environment jsdom
import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import SafetyReport from '../pages/student/SafetyReport'
import { getSafetyReports } from '../api/client'

vi.mock('../api/client', () => ({
    getSafetyReports: vi.fn(() => Promise.resolve([])),
}))

describe('SafetyReport', () => {
    it('render without crashing', () => {
        render(
            <MemoryRouter>
                <SafetyReport />
            </MemoryRouter>
        )
        expect(document.body).toBeTruthy()
    })
})