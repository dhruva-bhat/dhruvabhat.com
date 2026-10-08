import { Cormorant_Garamond } from 'next/font/google'
import { PersonSchema, siteMetadata } from '@/components/site-meta'
const cormorant=Cormorant_Garamond({subsets:['latin'],weight:['500','600'],variable:'--font-cormorant'})
export const metadata=siteMetadata
export default function HomeLayout({children}:{children:React.ReactNode}){return <html lang="en" className={cormorant.variable}><body style={{margin:0,background:'#000'}}>{children}<PersonSchema/></body></html>}
