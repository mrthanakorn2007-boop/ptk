'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConductMe, getConductStudent, createConductLog, getConductTerms, CreateConductLogRequest } from './conduct'

export const useConductMe = (termId?: string) => {
    return useQuery({
        queryKey: ['conduct', 'me', termId],
        queryFn: () => getConductMe(termId),
    })
}

export const useConductStudent = (studentId: string, termId?: string) => {
    return useQuery({
        queryKey: ['conduct', 'student', studentId, termId],
        queryFn: () => getConductStudent(studentId, termId),
        enabled: !!studentId,
    })
}

export const useConductTerms = () => {
    return useQuery({
        queryKey: ['conduct', 'terms'],
        queryFn: getConductTerms,
    })
}

export const useCreateConductLog = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (data: CreateConductLogRequest) => createConductLog(data),
        onSuccess: () => {
            // Invalidate and refetch conduct queries
            queryClient.invalidateQueries({ queryKey: ['conduct'] })
        },
    })
}
