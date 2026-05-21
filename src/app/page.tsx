import Header from '@/components/header/Header'
import Hero from '@/components/hero/Hero'
import CV from '@/components/cv/CV'
import Contact from '@/components/contact/Contact'
import FadeUp from '@/components/ui/FadeUp'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FadeUp>
          <CV />
        </FadeUp>
        <FadeUp>
          <Contact />
        </FadeUp>
        {/* Projects section — Phase 3 */}
      </main>
    </>
  )
}
