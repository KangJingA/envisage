// https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
// ui that is shared between multiple routes

import React from 'react'
import SideBar from '@/components/shared/SideBar'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='root'>
            <SideBar />
            <div className='root-container'>
                <div className='wrapper'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout