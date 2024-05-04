// https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
// ui that is shared between multiple routes

import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='auth'>{children}</main>
    )
}

export default Layout