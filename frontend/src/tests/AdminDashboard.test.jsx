// @vitest-environment jsdom
import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AdminDashboard from '../pages/admin/Dashboard'

vi.mock('../api/client', async (imprtOriginal) => ({
    getAllPlacements: vi.fn(() => Promise.resolve([])),
    getAllSafetyReports: vi.fn(() => Promise.resolve([])),
    getAdminStats: vi.fn(() => Promise.resolve({})),
    exportdata: vi.fn(() => Promise.resolve({})),
    adminApprovedPlacement: vi.fn(() => Promise.resolve({})),
    adminDenyPlacement: vi.fn(() => Promise.resolve({})),
    resolveReport: vi.fn(() => Promise.resolve({})),
}))

describe('AdminDashboard', () => {
    it('render without crashing', () => {
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        )
        expect(document.body).toBeTruthy()
    })
})