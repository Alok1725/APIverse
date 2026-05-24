import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'

const PRODUCT_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Observatory', href: '/observatory' },
  { label: 'Playground', href: '/playground' },
  { label: 'Compose', href: '/compose' },
  { label: 'Radar', href: '/radar' },
]

const RESOURCE_LINKS = [
  { label: 'Documentation', href: '/docs' },
  { label: 'API Reference', href: '/docs/api' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Status', href: '/status' },
  { label: 'Blog', href: '/blog' },
]

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'GitHub', href: 'https://github.com/Alok1725', external: true },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image src="/logo.png" alt="APIverse" width={110} height={32} className={styles.logoImg} />
            </Link>
            <p className={styles.tagline}>
              The intelligence layer for the API economy. Discover, test, monitor, and compose APIs — powered by AI.
            </p>
            <div className={styles.aiBadge}>
              <span className={styles.aiBadgeDot} />
              Built with AI · Gemini · Groq · Ollama
            </div>
          </div>

          {/* Product links */}
          <div className={styles.linkColumn}>
            <p className={styles.columnTitle}>Product</p>
            {PRODUCT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.footerLink}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Resources links */}
          <div className={styles.linkColumn}>
            <p className={styles.columnTitle}>Resources</p>
            {RESOURCE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.footerLink}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Company links */}
          <div className={styles.linkColumn}>
            <p className={styles.columnTitle}>Company</p>
            {COMPANY_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {currentYear} <a href="/">APIverse</a>. Open source under MIT License.
          </p>

          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Privacy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms</Link>
            <Link href="/cookies" className={styles.bottomLink}>Cookies</Link>
          </div>

          <div className={styles.socialLinks}>
            {/* GitHub */}
            <a
              href="https://github.com/Alok1725"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a
              href="https://x.com/Eren17Alok"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="X"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
