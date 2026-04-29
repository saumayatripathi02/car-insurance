import { useState, useEffect } from 'react'
import { GiHamburgerMenu, CgProfile, MdDirectionsCar, MdVerifiedUser, MdSupportAgent, IoArrowForward } from '../utils/icons'
import Login from './Login'
import Quotes from './Quotes'
import Menu from './Menu'
import MyPolicies from './MyPolicies'
import Notifications from './Notifications'
import { usePageMeta } from '../hooks/usePageMeta'
import { seoConfig } from '../utils/seoConfig'

const carData = {
  toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
  honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  ford: ['F-150', 'Mustang', 'Explorer', 'Edge', 'Focus'],
  tesla: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  bmw: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
  chevrolet: ['Silverado', 'Equinox', 'Bolt', 'Traverse', 'Tahoe'],
  audi: ['A3', 'A4', 'Q3', 'Q5', 'A6'],
  volkswagen: ['Golf', 'Passat', 'Jetta', 'Tiguan', 'Atlas'],
}

const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i)

export default function Home() {
  const [carMake, setCarMake] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showQuotes, setShowQuotes] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeMenuSection, setActiveMenuSection] = useState(null)
  const [user, setUser] = useState(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const availableModels = carMake ? carData[carMake.toLowerCase()] || [] : []

  // Determine which SEO config to use based on current view
  const currentSeoConfig = activeMenuSection === 'policies' 
    ? seoConfig.myPolicies
    : activeMenuSection === 'notifications'
    ? seoConfig.notifications
    : showQuotes
    ? seoConfig.quotes
    : showLoginModal
    ? seoConfig.login
    : seoConfig.home

  // Update SEO based on current view
  usePageMeta(currentSeoConfig)

  const handleGetQuote = () => {
    if (carMake && carModel && carYear) {
      setShowQuotes(true)
    } else {
      alert('Please select car make, model, and year')
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const handleMenuItemClick = (section) => {
    setActiveMenuSection(section)
    setIsMenuOpen(false)
  }

  if (activeMenuSection === 'policies') {
    return (
      <MyPolicies
        user={user}
        onBack={() => setActiveMenuSection(null)}
      />
    )
  }

  if (activeMenuSection === 'notifications') {
    return (
      <Notifications
        user={user}
        onBack={() => setActiveMenuSection(null)}
      />
    )
  }

  if (activeMenuSection === 'about') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-surface-light dark:bg-surface-dark/95 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setActiveMenuSection(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth font-medium text-text-primary dark:text-white"
            >
              <IoArrowForward size={20} className="rotate-180" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">About InsuracePro</h1>
            <div className="w-20" />
          </div>
        </div>

        {/* Content */}
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Hero */}
            <div className="text-center space-y-4 pt-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary dark:text-white">
                About <span className="bg-gradient-primary bg-clip-text text-transparent">InsuracePro</span>
              </h1>
              <p className="text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
                We're revolutionizing car insurance by making it transparent, affordable, and hassle-free
              </p>
            </div>

            {/* Mission */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text-primary dark:text-white">Our Mission</h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 leading-relaxed">
                At InsuracePro, we believe car insurance should be simple and transparent. Our mission is to empower drivers with instant, accurate quotes and help them make informed decisions about their coverage without the confusion or hidden costs. We partner with top insurance providers to bring you the best rates and service.
              </p>
            </div>

            {/* Why Choose Us */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-text-primary dark:text-white">Why Choose Us?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-base p-6 space-y-3">
                  <div className="text-3xl">⚡</div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white">Instant Quotes</h3>
                  <p className="text-text-secondary dark:text-gray-400">Get your insurance quotes in just 2 minutes. No lengthy forms, no waiting.</p>
                </div>
                <div className="card-base p-6 space-y-3">
                  <div className="text-3xl">🛡️</div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white">Best Rates</h3>
                  <p className="text-text-secondary dark:text-gray-400">Compare quotes from top providers and save up to 40% on your premium.</p>
                </div>
                <div className="card-base p-6 space-y-3">
                  <div className="text-3xl">💯</div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white">Transparent</h3>
                  <p className="text-text-secondary dark:text-gray-400">No hidden fees, no surprises. Everything upfront and clear.</p>
                </div>
                <div className="card-base p-6 space-y-3">
                  <div className="text-3xl">🤝</div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white">Expert Support</h3>
                  <p className="text-text-secondary dark:text-gray-400">Our 24/7 team is here to help you with any questions or concerns.</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-primary/10 rounded-2xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-text-primary dark:text-white text-center">Our Impact</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">50K+</p>
                  <p className="text-text-secondary dark:text-gray-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">₹500Cr+</p>
                  <p className="text-text-secondary dark:text-gray-400">Claims Processed</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">4.8⭐</p>
                  <p className="text-text-secondary dark:text-gray-400">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8 pb-4">
              <button
                onClick={() => {
                  setActiveMenuSection(null)
                  setTimeout(() => {
                    const element = document.getElementById('calculator')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                Get Your Quote Today
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showQuotes) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
        {/* TopAppBar */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-[#0d141b] dark:text-white flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
          >
            <GiHamburgerMenu size={24} />
          </button>
          <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            InsuracePro
          </h2>
          <div className="flex w-12 items-center justify-end">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-primary dark:text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:opacity-80 transition-opacity"
                title={user.email}
              >
                <CgProfile size={24} />
                <span className="text-xs">✕</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#0d141b] dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
              >
                <CgProfile size={24} />
              </button>
            )}
          </div>
        </div>

        <Quotes
          carYear={carYear}
          carMake={carMake}
          carModel={carModel}
          onBack={() => setShowQuotes(false)}
          user={user}
        />

        {/* Menu Drawer */}
        <Menu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onMenuItemClick={handleMenuItemClick}
        />

        {/* Login Modal */}
        {showLoginModal && (
          <Login
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-surface-light dark:bg-surface-dark/95 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <MdDirectionsCar size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InsuracePro
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => handleMenuItemClick('notifications')}
                  className="px-4 py-2 text-text-primary dark:text-white hover:text-primary transition-colors font-medium"
                >
                  Notifications
                </button>
                <button 
                  onClick={() => handleMenuItemClick('policies')}
                  className="px-4 py-2 text-text-primary dark:text-white hover:text-primary transition-colors font-medium"
                >
                  My Policies
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleMenuItemClick('about')}
                className="px-4 py-2 text-text-primary dark:text-white hover:text-primary transition-colors font-medium"
              >
                About
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-smooth font-medium"
                title={user.email}
              >
                <CgProfile size={20} />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-smooth font-medium"
              >
                <CgProfile size={20} />
                <span className="hidden sm:inline text-sm">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-0 bg-gradient-to-b from-background-light dark:from-background-dark via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-24">
            {/* Left Column - Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    ⚡ Get Your Quote in 2 Minutes
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-primary dark:text-white leading-tight tracking-[-0.02em]">
                  Smart Car Insurance,
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Smarter Prices</span>
                </h1>
                <p className="text-xl text-text-secondary dark:text-gray-400 leading-relaxed max-w-lg">
                  Calculate your perfect insurance premium instantly. Compare quotes, choose coverage, and get protected — all without the hassle.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div>
                  <p className="text-3xl font-bold text-primary">50K+</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">4.8⭐</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Average Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Live Support</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    const element = document.getElementById('calculator');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary px-8 py-4 text-lg font-semibold flex items-center gap-3 hover:shadow-glow-lg group"
                >
                  <span>Start Your Quote</span>
                  <IoArrowForward size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-96 bg-gradient-primary rounded-3xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <MdDirectionsCar size={120} className="mx-auto mb-4 opacity-80 animate-float" />
                    <p className="text-2xl font-bold">Your Car, Protected</p>
                    <p className="text-white/80 mt-2">With our comprehensive coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div id="calculator" className="py-16 lg:py-24 bg-surface-light dark:bg-surface-dark/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-text-primary dark:text-white mb-4">
              Calculate Your Premium
            </h2>
            <p className="text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
              Tell us about your vehicle and we'll show you instant quotes from top providers
            </p>
          </div>

          {/* Form Card */}
          <div className="card-base p-8 lg:p-12 shadow-xl">
            <div className="space-y-6">
              {/* Form Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Car Make */}
                <div className="flex flex-col">
                  <label className="text-text-primary dark:text-white text-sm font-semibold mb-3 flex items-center gap-2">
                    <MdDirectionsCar size={18} className="text-primary" />
                    Car Make
                  </label>
                  <div className="relative">
                    <select
                      value={carMake}
                      onChange={(e) => {
                        setCarMake(e.target.value)
                        setCarModel('')
                      }}
                      className="input-primary appearance-none w-full h-12"
                    >
                      <option value="">Select Make</option>
                      {Object.keys(carData).map((make) => (
                        <option key={make} value={make}>
                          {make.charAt(0).toUpperCase() + make.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Car Model */}
                <div className="flex flex-col">
                  <label className="text-text-primary dark:text-white text-sm font-semibold mb-3 flex items-center gap-2">
                    <MdDirectionsCar size={18} className="text-primary" />
                    Car Model
                  </label>
                  <div className="relative">
                    <select
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      disabled={!carMake}
                      className="input-primary appearance-none w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Model</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Car Year */}
                <div className="flex flex-col">
                  <label className="text-text-primary dark:text-white text-sm font-semibold mb-3 flex items-center gap-2">
                    📅 Year
                  </label>
                  <div className="relative">
                    <select
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      className="input-primary appearance-none w-full h-12"
                    >
                      <option value="">Select Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGetQuote}
                className="btn-primary w-full h-14 flex items-center justify-center gap-2 text-lg font-semibold hover:shadow-glow-lg transition-all"
              >
                <span>Get Free Quote</span>
                <IoArrowForward size={24} />
              </button>

              <p className="text-center text-sm text-text-secondary dark:text-gray-400">
                ✓ No commitment • ✓ Instant results • ✓ Compare & save
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-text-primary dark:text-white mb-4">
              Why Choose InsuracePro?
            </h2>
            <p className="text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
              We make car insurance simple, transparent, and affordable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Get quotes in under 2 minutes',
              },
              {
                icon: '🛡️',
                title: 'Secure',
                desc: '256-bit encryption & data protection',
              },
              {
                icon: '💰',
                title: 'Best Rates',
                desc: 'Compare & save up to 40%',
              },
              {
                icon: '🎯',
                title: 'Expert Support',
                desc: '24/7 customer assistance',
              },
            ].map((feature, idx) => (
              <div key={idx} className="card-base p-8 text-center hover:shadow-lg transition-all group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16 lg:py-24 bg-surface-light dark:bg-surface-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-primary dark:bg-gradient-dark rounded-3xl p-12 lg:p-16 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Join 50,000+ customers who trust InsuracePro for their car insurance needs
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-2">
                <p className="text-4xl font-bold">50K+</p>
                <p className="text-white/80">Active Users</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">₹500Cr+</p>
                <p className="text-white/80">Claims Paid</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold">4.8★</p>
                <p className="text-white/80">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Login
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Menu Drawer */}
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMenuItemClick={handleMenuItemClick}
      />
    </div>
  )
}
