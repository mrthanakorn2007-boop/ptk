import { customInstance } from './axios-instance'

export interface ConductLog {
    id: string
    studentId: string
    teacherId: string
    scoreChange: number
    reason: string
    termId?: string | null
    createdAt: string
}

export interface ConductScoreResponse {
    studentId: string
    studentName: string
    totalScore: number
    history: ConductLog[]
}

export interface CreateConductLogRequest {
    studentId: string
    scoreChange: number
    reason: string
}

export interface AcademicTerm {
    id: string
    name: string
    startDate: string
    endDate: string
    type: 'term1' | 'term2' | 'summer' | 'other'
}

export interface TermListResponse {
    terms: AcademicTerm[]
}

export const getConductMe = async (termId?: string): Promise<ConductScoreResponse> => {
    const params = termId ? `?termId=${termId}` : ''
    return customInstance<ConductScoreResponse>(`/conduct/me${params}`, {
        method: 'GET',
    })
}

export const getConductStudent = async (studentId: string, termId?: string): Promise<ConductScoreResponse> => {
    const params = termId ? `?termId=${termId}` : ''
    return customInstance<ConductScoreResponse>(`/conduct/student/${studentId}${params}`, {
        method: 'GET',
    })
}

export const createConductLog = async (data: CreateConductLogRequest): Promise<ConductLog> => {
    return customInstance<ConductLog>('/conduct/logs', {
        method: 'POST',
        data,
    })
}

export const getConductTerms = async (): Promise<TermListResponse> => {
    return customInstance<TermListResponse>('/conduct/terms', {
        method: 'GET',
    })
}
