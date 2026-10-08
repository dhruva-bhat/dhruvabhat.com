import { Cormorant_Garamond } from 'next/font/google'
import { PersonSchema } from '@/components/person-schema'
import { siteMetadata } from '@/lib/site-metadata'

// Registers the 'Cormorant Garamond' font-face used by the home screen styles.
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-cormorant' })

export const metadata = siteMetadata

/** Root layout for the animated home screen: a bare black page without the site chrome. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body style={{ margin: 0, background: '#000' }}>
        {children}
        <PersonSchema />
      </body>
    </html>
  )
}
