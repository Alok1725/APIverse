import styles from './privacy.module.css'

export const metadata = {
  title: 'Privacy Policy — APIverse',
  description: 'How APIverse collects, uses, and protects your personal data.',
}

const TOC = [
  { id: 'collect', label: 'Data We Collect' },
  { id: 'use', label: 'How We Use Your Data' },
  { id: 'storage', label: 'Data Storage' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact Us' },
]

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroHeading}>Privacy Policy</h1>
        <span className={styles.lastUpdated}>Last updated: January 2025</span>
      </div>

      <div className={styles.layout}>
        {/* Sidebar TOC */}
        <aside className={styles.sidebar}>
          <div className={styles.tocTitle}>Contents</div>
          <ul className={styles.tocList}>
            {TOC.map((item) => (
              <li key={item.id} className={styles.tocItem}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <p>
              This Privacy Policy explains how APIverse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and
              protects information about you when you use our platform. We are committed to being
              transparent about our data practices and giving you meaningful control over your information.
            </p>
          </div>

          <div id="collect" className={styles.section}>
            <h2 className={styles.sectionTitle}>Data We Collect</h2>
            <p>We collect information you provide directly, and information generated as you use the platform:</p>
            <ul>
              <li>Account information — name, email address, and password hash when you register</li>
              <li>Usage data — which APIs you search for, view, test, or add to watchlists</li>
              <li>Playground requests — API requests you make through the Playground (not stored beyond your session)</li>
              <li>Technical data — browser type, IP address, and device information for security and analytics</li>
              <li>Communication — any messages you send via the contact form</li>
            </ul>
            <p>We do not collect payment information — APIverse is currently free to use.</p>
          </div>

          <div id="use" className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Use Your Data</h2>
            <p>Your data is used solely to operate, improve, and secure the platform:</p>
            <ul>
              <li>Providing and personalizing APIverse features (search history, watchlists)</li>
              <li>Sending important service notifications — downtime alerts, breaking change radar emails</li>
              <li>Diagnosing bugs and improving platform performance</li>
              <li>Preventing abuse and enforcing our Terms of Service</li>
              <li>Responding to your support requests</li>
            </ul>
            <div className={styles.highlight}>
              <p>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</p>
            </div>
          </div>

          <div id="storage" className={styles.section}>
            <h2 className={styles.sectionTitle}>Data Storage</h2>
            <p>
              Your account data is stored in a PostgreSQL database hosted on managed infrastructure within the
              European Economic Area (EEA). Redis is used for session storage and ephemeral job queues — this
              data is not persisted long-term.
            </p>
            <p>
              We retain your account data for as long as your account is active. Upon account deletion, your
              personal data is purged within 30 days. Anonymized usage analytics may be retained indefinitely.
            </p>
          </div>

          <div id="third-party" className={styles.section}>
            <h2 className={styles.sectionTitle}>Third-Party Services</h2>
            <p>APIverse integrates with the following third-party services:</p>
            <ul>
              <li>Google Gemini API — used to summarize API responses in the Playground</li>
              <li>Groq — used as an alternative AI inference provider (opt-in)</li>
              <li>Vercel — platform hosting and edge network</li>
              <li>GitHub OAuth — optional login provider</li>
            </ul>
            <p>
              When you use AI-powered features, query content may be sent to the selected AI provider.
              We recommend reviewing their respective privacy policies if this is a concern.
            </p>
          </div>

          <div id="cookies" className={styles.section}>
            <h2 className={styles.sectionTitle}>Cookies</h2>
            <p>We use a minimal set of cookies to operate the platform:</p>
            <ul>
              <li>Session cookies — required to keep you logged in securely</li>
              <li>Preference cookies — remember your theme and Playground settings</li>
              <li>Analytics cookies — anonymized usage data to improve the platform (can be declined)</li>
            </ul>
            <p>
              You can manage cookie preferences at any time via the{' '}
              <a href="/cookies">Cookie Settings</a> page.
            </p>
          </div>

          <div id="rights" className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
              <li>Right to access — request a copy of all data we hold about you</li>
              <li>Right to rectification — correct inaccurate data</li>
              <li>Right to erasure — request deletion of your account and associated data</li>
              <li>Right to portability — export your data in a machine-readable format</li>
              <li>Right to object — opt out of certain processing activities</li>
            </ul>
            <p>To exercise any of these rights, contact us at the address below.</p>
          </div>

          <div id="contact" className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>
              If you have questions, concerns, or requests related to this Privacy Policy, please reach out:
            </p>
            <ul>
              <li>Email: <a href="mailto:privacy@apiverse.dev">privacy@apiverse.dev</a></li>
              <li>Contact form: <a href="/contact">apiverse.dev/contact</a></li>
              <li>GitHub Issues: <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com/apiverse</a></li>
            </ul>
            <p>We aim to respond to all privacy-related inquiries within 5 business days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
