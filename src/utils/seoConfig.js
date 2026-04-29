/**
 * SEO Configuration and Utilities
 * Defines meta tags for all pages and provides helper functions
 */

export const seoConfig = {
  home: {
    title: 'Car Insurance Premium Calculator | Get Quotes Online',
    description: 'Calculate car insurance premiums instantly. Compare quotes, choose your perfect insurance plan, and get coverage today.',
    keywords: 'car insurance, auto insurance, insurance quotes, car insurance calculator, insurance premiums',
    ogTitle: 'Car Insurance Premium Calculator',
    ogDescription: 'Calculate and compare car insurance quotes online',
    ogImage: 'https://yourdomain.com/og-image.jpg',
    canonicalUrl: 'https://yourdomain.com/',
  },
  quotes: {
    title: 'Car Insurance Quotes | Compare Plans Online',
    description: 'Get instant car insurance quotes. Choose from Basic, Standard, Premium, and Comprehensive plans tailored to your needs.',
    keywords: 'car insurance quotes, insurance plans, comprehensive coverage, car insurance comparison',
    ogTitle: 'Get Instant Car Insurance Quotes',
    ogDescription: 'Compare and choose the best insurance plan for your vehicle',
    ogImage: 'https://yourdomain.com/og-quotes.jpg',
    canonicalUrl: 'https://yourdomain.com/quotes',
  },
  login: {
    title: 'Login | Car Insurance Portal',
    description: 'Login to your car insurance account. Manage your policies, track payments, and view notifications.',
    keywords: 'insurance login, car insurance account, policy management',
    ogTitle: 'Login to Your Insurance Account',
    ogDescription: 'Access your car insurance policies and account details',
    ogImage: 'https://yourdomain.com/og-login.jpg',
    canonicalUrl: 'https://yourdomain.com/login',
  },
  myPolicies: {
    title: 'My Policies | Car Insurance Account',
    description: 'View and manage your active car insurance policies. Track coverage, renewal dates, and policy details.',
    keywords: 'my policies, car insurance policies, policy management, insurance coverage',
    ogTitle: 'Your Car Insurance Policies',
    ogDescription: 'Manage your active insurance policies and coverage',
    ogImage: 'https://yourdomain.com/og-policies.jpg',
    canonicalUrl: 'https://yourdomain.com/my-policies',
  },
  notifications: {
    title: 'Notifications | Car Insurance',
    description: 'View your car insurance notifications. Stay updated on policy updates, payment reminders, and important alerts.',
    keywords: 'notifications, policy updates, payment reminders, insurance alerts',
    ogTitle: 'Your Insurance Notifications',
    ogDescription: 'View important updates and alerts for your policies',
    ogImage: 'https://yourdomain.com/og-notifications.jpg',
    canonicalUrl: 'https://yourdomain.com/notifications',
  },
  payment: {
    title: 'Secure Payment | Car Insurance',
    description: 'Complete your car insurance payment securely. Fast, safe, and encrypted transactions.',
    keywords: 'insurance payment, secure payment, car insurance checkout',
    ogTitle: 'Complete Your Insurance Payment',
    ogDescription: 'Secure payment processing for car insurance',
    ogImage: 'https://yourdomain.com/og-payment.jpg',
    canonicalUrl: 'https://yourdomain.com/payment',
  },
  policyDetails: {
    title: 'Policy Details | Car Insurance',
    description: 'View complete details of your car insurance policy including coverage, terms, and benefits.',
    keywords: 'policy details, insurance coverage, policy terms, insurance benefits',
    ogTitle: 'Your Policy Details',
    ogDescription: 'Complete information about your insurance policy',
    ogImage: 'https://yourdomain.com/og-policy-details.jpg',
    canonicalUrl: 'https://yourdomain.com/policy-details',
  },
}

/**
 * Update page meta tags
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {string} keywords - Page keywords
 * @param {string} canonicalUrl - Canonical URL
 * @param {string} ogTitle - Open Graph title (social sharing)
 * @param {string} ogDescription - Open Graph description
 * @param {string} ogImage - Open Graph image URL
 */
export const updatePageMeta = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
}) => {
  // Update title
  if (title) {
    document.title = title
    updateMetaTag('og:title', ogTitle || title)
  }

  // Update description
  if (description) {
    updateMetaTag('description', description)
    updateMetaTag('og:description', ogDescription || description)
  }

  // Update keywords
  if (keywords) {
    updateMetaTag('keywords', keywords)
  }

  // Update canonical URL
  if (canonicalUrl) {
    updateCanonicalUrl(canonicalUrl)
  }

  // Update Open Graph image
  if (ogImage) {
    updateMetaTag('og:image', ogImage)
  }

  // Standard Open Graph tags
  updateMetaTag('og:type', 'website')
  updateMetaTag('og:locale', 'en_US')

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', ogTitle || title)
  updateMetaTag('twitter:description', ogDescription || description)
  updateMetaTag('twitter:image', ogImage)
}

/**
 * Update or create meta tag
 * @param {string} name - Meta tag name
 * @param {string} content - Meta tag content
 */
const updateMetaTag = (name, content) => {
  if (!content) return

  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    // Use property for og: tags, name for others
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name)
    } else {
      element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/**
 * Update canonical URL
 * @param {string} url - Canonical URL
 */
const updateCanonicalUrl = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)
}

/**
 * Add structured data (JSON-LD)
 * @param {object} data - Structured data object
 */
export const addStructuredData = (data) => {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export default {
  seoConfig,
  updatePageMeta,
  addStructuredData,
}
