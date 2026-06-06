import Header from '@/components/header/Header'
import Hero from '@/components/hero/Hero'
import CV from '@/components/cv/CV'
import Philosophy from '@/components/philosophy/Philosophy'
import Projects from '@/components/projects/Projects'
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
          <Philosophy />
        </FadeUp>
        <FadeUp>
          <Projects />
        </FadeUp>
        <FadeUp>
          <Contact />
        </FadeUp>
      </main>
    </>
  )
}
