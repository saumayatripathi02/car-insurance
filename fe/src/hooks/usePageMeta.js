/**
 * Custom Hook for Page SEO Management
 * Automatically updates meta tags when component mounts
 */

import { useEffect } from 'react'
import { updatePageMeta } from '../utils/seoConfig'

/**
 * Hook to update SEO meta tags for a page
 * @param {object} seoData - SEO data object with title, description, keywords, etc.
 * 
 * @example
 * usePageMeta(seoConfig.home)
 */
export const usePageMeta = (seoData) => {
  useEffect(() => {
    if (seoData && typeof seoData === 'object') {
      updatePageMeta(seoData)
      
      // Smooth scroll to top when page changes
      window.scrollTo(0, 0)
    }
  }, [seoData])
}

export default usePageMeta
