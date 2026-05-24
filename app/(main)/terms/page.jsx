import styles from './terms.module.css'

export const metadata = {
  title: 'Terms of Service — APIverse',
  description: 'APIverse Terms of Service — rules and responsibilities for using the platform.',
}

const TOC = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'use', label: 'Use of Service' },
  { id: 'accounts', label: 'User Accounts' },
  { id: 'api-usage', label: 'API Usage' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'law', label: 'Governing Law' },
]

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroHeading}>Terms of Service</h1>
        <span className={styles.lastUpdated}>Last updated: May 2026</span>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
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
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of APIverse, operated by the
              APIverse team (&quot;we&quot;, &quot;us&quot;). By accessing or using the platform, you agree to be bound by
              these Terms. Please read them carefully.
            </p>
          </div>

          <div id="acceptance" className={styles.section}>
            <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
            <p>
              By creating an account or using any part of APIverse, you confirm that you are at least 13 years
              of age (or 16 in the EEA), that you have read and understood these Terms, and that you agree to
              be legally bound by them.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the platform following
              notification of changes constitutes your acceptance of the updated Terms.
            </p>
          </div>

          <div id="use" className={styles.section}>
            <h2 className={styles.sectionTitle}>Use of Service</h2>
            <p>You agree to use APIverse only for lawful purposes and in a manner that does not infringe the rights of others. Prohibited activities include:</p>
            <ul>
              <li>Attempting to gain unauthorized access to any part of the platform or connected systems</li>
              <li>Using automated tools to scrape, crawl, or stress-test the platform without written permission</li>
              <li>Submitting malicious code, exploits, or content intended to harm other users</li>
              <li>Impersonating any person or entity, or misrepresenting your affiliation</li>
              <li>Using the platform to facilitate illegal activity of any kind</li>
            </ul>
          </div>

          <div id="accounts" className={styles.section}>
            <h2 className={styles.sectionTitle}>User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity that occurs under your account. Notify us immediately at{' '}
              <a href="mailto:kushwahaalok956@gmail.com">kushwahaalok956@gmail.com</a> if you suspect unauthorized access.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, engage in abusive
              behavior, or pose a security risk to the platform or its users.
            </p>
          </div>

          <div id="api-usage" className={styles.section}>
            <h2 className={styles.sectionTitle}>API Usage</h2>
            <p>
              APIverse aggregates and indexes publicly available API data for informational purposes. The health
              data, pricing, and feature descriptions shown on the platform are provided as-is and may not
              reflect the current state of third-party APIs.
            </p>
            <p>
              When you use the Playground to make live API requests, you are responsible for complying with
              the terms and rate limits of the target API provider. APIverse acts as a proxy and is not
              responsible for any costs, bans, or consequences arising from your API usage.
            </p>
          </div>

          <div id="ip" className={styles.section}>
            <h2 className={styles.sectionTitle}>Intellectual Property</h2>
            <p>
              The APIverse platform, including its design, code, and content, is open source and available
              under the MIT License. You are free to fork, modify, and self-host the platform in accordance
              with that license.
            </p>
            <p>
              Third-party API names, logos, and trademarks remain the property of their respective owners.
              APIverse is not affiliated with any of the APIs listed on the platform unless explicitly stated.
            </p>
          </div>

          <div id="disclaimers" className={styles.section}>
            <h2 className={styles.sectionTitle}>Disclaimers</h2>
            <div className={styles.warning}>
              <p>
                APIverse is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not
                guarantee the accuracy, completeness, or uptime of any data shown on the platform.
              </p>
            </div>
            <p>
              Health scores, uptime percentages, and breaking change alerts are generated automatically and
              may contain errors. Do not rely solely on APIverse data for production-critical decisions without
              independently verifying the information.
            </p>
          </div>

          <div id="liability" className={styles.section}>
            <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, APIverse and its contributors shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages — including
              loss of revenue, data, or goodwill — arising from your use of or inability to use the platform.
            </p>
            <p>
              Our total aggregate liability to you for any claims under these Terms shall not exceed the
              amount you paid to use APIverse in the twelve months preceding the claim. As the platform is
              currently free, this limit is zero.
            </p>
          </div>

          <div id="law" className={styles.section}>
            <h2 className={styles.sectionTitle}>Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the jurisdiction in
              which the primary maintainer of APIverse is located, without regard to conflict of law principles.
            </p>
            <p>
              Any disputes arising under these Terms shall first be attempted to be resolved through good-faith
              negotiation. If resolution cannot be reached, disputes shall be submitted to binding arbitration
              or the courts of the applicable jurisdiction.
            </p>
            <p>
              If you have questions about these Terms, contact us at{' '}
              <a href="mailto:kushwahaalok956@gmail.com">kushwahaalok956@gmail.com</a> or via the{' '}
              <a href="/contact">contact form</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
