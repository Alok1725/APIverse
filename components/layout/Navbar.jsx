'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Observatory', href: '/observatory' },
  { label: 'Playground', href: '/playground' },
  { label: 'Compose', href: '/compose' },
  { label: 'Radar', href: '/radar' },
]

function UserMenu({ session }) {
  const [open, setOpen] = useState(false)
  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'
  const image = session?.user?.image
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className={styles.userMenu}>
      <button className={styles.avatarBtn} onClick={() => setOpen(!open)} aria-label="User menu">
        {image ? (
          <img src={image} alt={name} className={styles.avatarImg} referrerPolicy="no-referrer" />
        ) : (
          <div className={styles.avatarInitial}>{initial}</div>
        )}
        <span className={styles.avatarName}>{name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className={styles.menuOverlay} onClick={() => setOpen(false)} />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{name}</div>
              <div className={styles.dropdownEmail}>{session?.user?.email}</div>
            </div>
            <div className={styles.dropdownDivider} />
            <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </Link>
            <div className={styles.dropdownDivider} />
            <button
              className={`${styles.dropdownItem} ${styles.signOutItem}`}
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Image src="/logo.png" alt="APIverse" width={120} height={36} className={styles.logoImg} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname?.startsWith(link.href) ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSearch} className={styles.searchContainer}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search APIs"
              />
            </form>
          </div>

          {/* Right */}
          <div className={styles.rightSection}>
            {/* Auth state */}
            {status === 'loading' ? (
              <div className={styles.authSkeleton} />
            ) : status === 'authenticated' ? (
              <UserMenu session={session} />
            ) : (
              <>
                <Link href="/signin" className={styles.signInBtn}>Sign In</Link>
                <Link href="/signup" className={styles.signUpBtn}>Get Started</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.mobileNavLink}>{link.label}</Link>
        ))}
        <div className={styles.mobileDivider} />
        <div className={styles.mobileActions}>
          <form onSubmit={handleSearch} className={styles.searchContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {status === 'authenticated' ? (
            <button
              className={styles.signOutMobile}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </button>
          ) : (
            <Link href="/signin" className={styles.signInBtn} style={{ justifyContent: 'center' }}>Sign In</Link>
          )}
        </div>
      </div>
    </>
  )
}
