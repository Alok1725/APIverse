import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '72px' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
