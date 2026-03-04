'use client'

import { createContext, useContext } from 'react'

export type AdminCtx = { token: string; logout: () => void }
export const AdminContext = createContext<AdminCtx | null>(null)
export const useAdmin = () => useContext(AdminContext)!
