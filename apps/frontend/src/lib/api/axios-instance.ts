import axios from 'axios'
import { createClient } from '@/lib/supabase/client'

const AXIOS_INSTANCE = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
})

AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const supabase = createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
})

export const customInstance = <T>(
    url: string,
    options: Record<string, unknown>
): Promise<T> => {
    const source = axios.CancelToken.source()
    const promise = AXIOS_INSTANCE({
        url,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data) as Promise<T> & { cancel?: () => void }

    promise.cancel = () => {
        source.cancel('Query was cancelled')
    }

    return promise
}
