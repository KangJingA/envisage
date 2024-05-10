// https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
// ui that is shared between multiple routes

import React from 'react'
import SideBar from '@/components/shared/SideBar'
import MobileNav from '@/components/shared/MobileNav'
import { Toaster } from '@/components/ui/toaster'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='root'>
            <SideBar />
            <MobileNav />
            <div className='root-container'>
                <div className='wrapper'>
                    {children}
                </div>
            </div>
            <Toaster />
        </main>
    )
}

export default Layout