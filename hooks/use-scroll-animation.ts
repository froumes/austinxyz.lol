"use client"

import { useEffect, useRef, useState } from "react"

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
    delay = 0,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const hasBeenVisibleRef = useRef(false) // Persistent ref that never resets

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Check if element is already in viewport on mount
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const windowWidth = window.innerWidth || document.documentElement.clientWidth
      
      // More lenient check - element is in viewport if any part is visible
      const isInViewport = 
        rect.top < windowHeight + 100 && // Add buffer
        rect.bottom > -100 && // Add buffer
        rect.left < windowWidth + 100 &&
        rect.right > -100

      if (isInViewport && !hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true // Mark as seen immediately
        if (delay > 0) {
          setTimeout(() => {
            setIsVisible(true)
            if (triggerOnce) {
              setHasAnimated(true)
            }
          }, delay)
        } else {
          setIsVisible(true)
          if (triggerOnce) {
            setHasAnimated(true)
          }
        }
        return true
      }
      return false
    }

    // Check immediately with multiple attempts to catch elements already in viewport
    const attemptCheck = (attempt = 0) => {
      if (checkInitialVisibility()) {
        return // Success, element is visible
      }
      
      // Try again if not visible yet (max 3 attempts)
      if (attempt < 2) {
        setTimeout(() => {
          attemptCheck(attempt + 1)
        }, attempt === 0 ? 50 : 100)
      }
    }
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      attemptCheck()
    })
    
    // Also check after a short delay to catch any layout shifts
    setTimeout(() => {
      checkInitialVisibility()
    }, 150)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisibleRef.current) {
            hasBeenVisibleRef.current = true // Mark as seen immediately
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true)
                if (triggerOnce) {
                  setHasAnimated(true)
                }
              }, delay)
            } else {
              setIsVisible(true)
              if (triggerOnce) {
                setHasAnimated(true)
              }
            }
          }
          // Never set isVisible to false if triggerOnce is true
          // This ensures elements stay visible once they've appeared
        })
      },
      {
        threshold: 0, // Trigger as soon as any part is visible
        rootMargin: "300px 0px 300px 0px", // Very aggressive - trigger 300px before element enters viewport
      }
    )

    observer.observe(element)
    
    // Manually trigger IntersectionObserver callback for elements already in viewport
    // by creating a fake entry
    const rect = element.getBoundingClientRect()
    const isAlreadyVisible = 
      rect.top < (window.innerHeight || document.documentElement.clientHeight) + 200 &&
      rect.bottom > -200
    
    if (isAlreadyVisible && !hasBeenVisibleRef.current) {
      hasBeenVisibleRef.current = true // Mark as seen immediately
      
      // Trigger the callback manually
      observer.takeRecords() // This will process any pending observations
      
      // Also manually call our handler
      if (delay > 0) {
        setTimeout(() => {
          setIsVisible(true)
          if (triggerOnce) {
            setHasAnimated(true)
          }
        }, delay)
      } else {
        setIsVisible(true)
        if (triggerOnce) {
          setHasAnimated(true)
        }
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated])

  // Once visible, always return true (never go back to false)
  const finalIsVisible = triggerOnce 
    ? (hasBeenVisibleRef.current || hasAnimated || isVisible)
    : isVisible

  return {
    ref: elementRef,
    isVisible: finalIsVisible,
  }
}

