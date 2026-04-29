import { useState, Suspense, lazy } from 'react'
import { IoArrowBack, MdDirectionsCar, MdCalendarToday, MdShield } from '../utils/icons'
const Payment = lazy(() => import('./Payment'))
import PolicyDetails from './PolicyDetails'
import { usePageMeta } from '../hooks/usePageMeta'
import { seoConfig } from '../utils/seoConfig'

// Loading fallback for Payment component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin inline-block mb-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
      <p className="text-[#4c739a] dark:text-gray-400">Loading payment...</p>
    </div>
  </div>
)

const generateQuotes = (carYear, carMake, carModel) => {
  const basePrices = [15000, 18000, 22000, 25000, 28000]
  const insuranceTypes = [
    { type: 'Basic Coverage', coverage: 'Third Party Liability' },
    { type: 'Standard Coverage', coverage: 'Third Party + Own Damage' },
    { type: 'Comprehensive', coverage: 'Full Coverage with Add-ons' },
    { type: 'Premium Plus', coverage: 'Comprehensive + Roadside Assist' },
    { type: 'Elite Coverage', coverage: 'Full + Personal Accident + Legal' },
  ]

  return basePrices.map((basePrice, index) => ({
    id: index + 1,
    type: insuranceTypes[index].type,
    coverage: insuranceTypes[index].coverage,
    price: basePrice + Math.floor(Math.random() * 10000),
    validity: '12 months',
    carYear,
    carMake,
    carModel,
  }))
}

export default function Quotes({ carYear, carMake, carModel, onBack, user }) {
  // Update SEO for quotes page
  usePageMeta(seoConfig.quotes)

  const [quotes, setQuotes] = useState(() =>
    generateQuotes(carYear, carMake, carModel)
  )
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [purchasedPolicy, setPurchasedPolicy] = useState(null)

  const handleBuyQuote = (quote) => {
    setSelectedQuote(quote)
  }

  const handlePaymentSuccess = (policy) => {
    setPurchasedPolicy(policy)
  }

  if (purchasedPolicy) {
    return (
      <PolicyDetails
        policy={purchasedPolicy}
        onBack={() => {
          setPurchasedPolicy(null)
          setSelectedQuote(null)
        }}
      />
    )
  }

  if (selectedQuote) {
    return (
      <div className="px-4 py-6">
        <Suspense fallback={<LoadingFallback />}>
          <Payment
            quote={selectedQuote}
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setSelectedQuote(null)}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 pb-10 min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark/95 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth flex-shrink-0"
        >
          <IoArrowBack size={24} className="text-primary" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white">
            Available Quotes
          </h2>
          <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">
            {carYear} {carMake} {carModel}
          </p>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            className="card-base card-hover overflow-hidden group"
          >
            {/* Card Header */}
            <div className="bg-gradient-primary dark:bg-gradient-dark p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-white/90 transition-colors">
                    {quote.type}
                  </h3>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <MdShield size={16} />
                    {quote.coverage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-3xl mb-1">
                    ₹{quote.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-white/80 text-xs">per year</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4">
              {/* Car Details */}
              <div className="flex items-center gap-3 text-text-primary dark:text-white">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MdDirectionsCar size={18} className="text-primary" />
                </div>
                <span className="font-medium">
                  {quote.carYear} {quote.carMake} {quote.carModel}
                </span>
              </div>

              {/* Validity */}
              <div className="flex items-center gap-3 text-text-primary dark:text-white">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MdCalendarToday size={18} className="text-primary" />
                </div>
                <span className="font-medium">Validity: {quote.validity}</span>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-primary-subtle rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-text-primary dark:text-white uppercase tracking-wide mb-3">
                  ✨ Benefits Included
                </p>
                <ul className="text-sm text-text-primary dark:text-gray-300 space-y-2">
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Emergency roadside assistance</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Cashless claim settlement</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> 24/7 customer support</li>
                  {quote.id > 2 && <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Personal accident cover</li>}
                  {quote.id > 3 && <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Loan protection coverage</li>}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-border-light dark:border-border-dark p-5 bg-gray-50 dark:bg-gray-900/50">
              <button
              onClick={() => user ? handleBuyQuote(quote) : onBack()}
              className="btn-primary w-full h-11 text-base font-semibold"
              >
              {user ? '🛡️ Buy This Quote' : 'Login to Purchase'}
              </button>
            </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 space-y-2 text-center">
          <p className="text-sm text-text-secondary dark:text-gray-400">
            💡 Prices are indicative and may vary based on additional factors
          </p>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            ✓ All quotes come with our 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}
