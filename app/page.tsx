"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  baseOpacity: number
  twinkleSpeed: number
  twinkleOffset: number
  color: string
}

const featureCards = [
  {
    icon: "bolt",
    title: "Level 8 Execution",
    body: "Optimized bytecode translation ensures zero-latency performance across all environments.",
    delay: "0.1s",
  },
  {
    icon: "security",
    title: "Advanced Undetected",
    body: "Advanced polymorphic obfuscation and active anti-tamper mechanisms keep you invisible.",
    delay: "0.2s",
  },
  {
    icon: "support_agent",
    title: "24/7 Stability",
    body: "Direct access to our engineering team via secure channels for immediate resolution.",
    delay: "0.3s",
  },
  {
    icon: "cloud_sync",
    title: "Cloud Scripts",
    body: "Seamlessly sync your custom profiles and scripts across all your devices instantly.",
    delay: "0.4s",
  },
] as const

const installationSteps = [
  {
    number: "01",
    title: "Acquire",
    body: "Download the latest secure client and prepare for DLL initialization.",
    delay: "0.1s",
  },
  {
    number: "02",
    title: "Auth",
    body: "Input cryptographic license key.",
    delay: "0.2s",
  },
  {
    number: "03",
    title: "Execute",
    body: "Select target and initiate secure injection for script execution.",
    delay: "0.3s",
  },
] as const

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseGlowRef = useRef<HTMLDivElement | null>(null)
  const scrollProgressRef = useRef<HTMLDivElement | null>(null)
  const heroVisualRef = useRef<HTMLDivElement | null>(null)
  const heroOrbitsRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const canvas = canvasRef.current
    const mouseGlow = mouseGlowRef.current
    const scrollProgress = scrollProgressRef.current
    const heroVisual = heroVisualRef.current
    const heroOrbits = heroOrbitsRef.current

    if (!canvas || !mouseGlow || !scrollProgress) return

    if (prefersReducedMotion) {
      canvas.style.display = "none"
      mouseGlow.style.display = "none"
      scrollProgress.style.display = "none"
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let particles: Particle[] = []
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let glowX = mouseX
    let glowY = mouseY
    let frameId = 0
    let scrollFrameId = 0

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35 - 0.12,
      opacity: Math.random() * 0.45 + 0.08,
      baseOpacity: Math.random() * 0.45 + 0.08,
      twinkleSpeed: Math.random() * 1.8 + 0.6,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.28 ? "rgba(255, 140, 66," : "rgba(39, 49, 64,",
    })

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = []
      const particleCount = Math.max(72, Math.min(180, Math.floor((canvas.width * canvas.height) / 9000)))

      for (let index = 0; index < particleCount; index += 1) {
        particles.push(createParticle())
      }
    }

    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      scrollProgress.style.transform = `scaleX(${progress})`
      scrollProgress.style.opacity = `${0.25 + progress * 0.75}`
    }

    const updateParallax = (clientX: number, clientY: number) => {
      const normalizedX = clientX / window.innerWidth - 0.5
      const normalizedY = clientY / window.innerHeight - 0.5
      const heroX = normalizedX * 24
      const heroY = normalizedY * 18
      const orbitX = normalizedX * -18
      const orbitY = normalizedY * -14

      if (heroVisual) {
        heroVisual.style.setProperty("--hero-parallax-x", `${heroX}px`)
        heroVisual.style.setProperty("--hero-parallax-y", `${heroY}px`)
      }

      if (heroOrbits) {
        heroOrbits.style.setProperty("--hero-parallax-x", `${orbitX}px`)
        heroOrbits.style.setProperty("--hero-parallax-y", `${orbitY}px`)
      }
    }

    const animateParticles = () => {
      const time = performance.now() * 0.001
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        const deltaX = particle.x - mouseX
        const deltaY = particle.y - mouseY
        const distance = Math.max(Math.hypot(deltaX, deltaY), 0.001)

        if (distance < 260) {
          const force = (1 - distance / 260) * 0.38
          particle.speedX += (deltaX / distance) * force * 0.02
          particle.speedY += (deltaY / distance) * force * 0.02
        }

        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.speedX *= 0.996
        particle.speedY *= 0.996

        if (
          particle.y < -20 ||
          particle.x < -20 ||
          particle.x > canvas.width + 20 ||
          particle.y > canvas.height + 20
        ) {
          Object.assign(particle, createParticle())
          if (particle.speedY < 0) particle.y = canvas.height
        }

        const twinkle = 0.55 + Math.sin(time * particle.twinkleSpeed + particle.twinkleOffset) * 0.45
        const alpha = Math.min(0.72, particle.baseOpacity * twinkle + 0.05)

        ctx.fillStyle = `${particle.color}${alpha})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        if (particle.size > 1.45) {
          ctx.fillStyle = `${particle.color}${alpha * 0.22})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      glowX += (mouseX - glowX) * 0.1
      glowY += (mouseY - glowY) * 0.1
      mouseGlow.style.left = `${glowX}px`
      mouseGlow.style.top = `${glowY}px`

      frameId = window.requestAnimationFrame(animateParticles)
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observerInstance.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.15,
      },
    )

    document.querySelectorAll<HTMLElement>(".reveal-element").forEach((element) => {
      observer.observe(element)
    })

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      mouseGlow.style.opacity = "1"
      updateParallax(event.clientX, event.clientY)
    }

    const handleMouseLeave = () => {
      mouseGlow.style.opacity = "0"
      updateParallax(window.innerWidth / 2, window.innerHeight / 2)
    }

    const handleScroll = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = window.requestAnimationFrame(() => {
        updateScrollProgress()
      })
    }

    const handleResize = () => {
      resizeCanvas()
      updateScrollProgress()
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    resizeCanvas()
    updateScrollProgress()
    updateParallax(mouseX, mouseY)
    animateParticles()

    return () => {
      window.cancelAnimationFrame(frameId)
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
      observer.disconnect()
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <>
      <div ref={scrollProgressRef} className="scroll-progress" aria-hidden="true" />
      <div className="grain-overlay" />
      <div className="hero-scanline" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[-1] opacity-60"
        aria-hidden="true"
        id="particles-canvas"
      />
      <div
        ref={mouseGlowRef}
        className="fixed w-[600px] h-[600px] pointer-events-none z-[-1] opacity-0 mix-blend-screen hidden lg:block"
        aria-hidden="true"
        id="mouse-glow"
      />

      <nav className="fixed top-0 w-full z-50 mix-blend-difference">
        <div className="nav-surface flex justify-between items-center w-full px-margin-mobile md:px-gutter max-w-container-max mx-auto h-24">
          <div className="font-headline-lg text-2xl tracking-tighter text-primary">
            nozomi<span className="italic font-light text-primary-container">Reborn</span>
          </div>

          <div className="hidden md:flex gap-8 items-center border-b border-primary/20 pb-1">
            <a
              className="font-label-sm text-xs text-primary hover:text-white transition-colors duration-300 uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
              href="#"
            >
              Status
            </a>
            <a
              className="font-label-sm text-xs text-primary hover:text-white transition-colors duration-300 uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
              href="#"
            >
              Documentation
            </a>
            <a
              className="font-label-sm text-xs text-primary hover:text-white transition-colors duration-300 uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
              href="#"
            >
              Access
            </a>
            <a
              className="font-label-sm text-xs text-primary hover:text-white transition-colors duration-300 uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-primary hover:after:w-full after:transition-all after:duration-300"
              href="#"
            >
              Discord
            </a>
          </div>

          <button className="md:hidden text-primary" type="button" aria-label="Search">
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            className="hidden md:block text-primary hover:text-white transition-colors ml-4"
            type="button"
            aria-label="Search"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </nav>

      <main>
        <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="hero-orb hero-orb-three" aria-hidden="true" />

          <div className="absolute top-24 left-0 w-full z-20 px-4 md:px-12 pointer-events-none">
            <h1
              className="font-display-xl text-[15vw] md:text-[12vw] text-primary leading-none uppercase text-center hero-title-overlap mix-blend-plus-lighter"
              style={{ textShadow: "0 0 40px rgba(255, 182, 141, 0.4)" }}
            >
              nozomi<span className="italic text-primary-container">Reborn</span>
            </h1>

            <div
              className="flex justify-between items-end mt-4 px-8 max-w-7xl mx-auto reveal-element is-visible"
              style={{ transitionDelay: "0.5s" }}
            >
              <div>
                <p className="font-body-md text-xl text-primary mb-4">
                  The Ultimate Execution Environment.
                </p>
                <button
                  className="border border-primary/50 text-primary px-6 py-2 rounded-full font-label-sm text-[10px] uppercase tracking-[0.2em] hover:bg-primary/10 hover:shadow-[0_0_25px_rgba(255,182,141,0.4)] hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(255,182,141,0.2)] pointer-events-auto"
                  type="button"
                >
                  Get Access
                </button>
              </div>
            </div>
          </div>

          <div ref={heroVisualRef} className="hero-parallax absolute inset-0 z-0 flex justify-center items-center mt-32 md:mt-48 px-4 md:px-0">
            <div className="w-full max-w-4xl aspect-[4/5] md:aspect-square relative overflow-hidden">
              <div className="hero-frame-glow absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <img
                alt="Crystal Lotus Abstract"
                className="w-full h-full object-contain duotone-img opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTX8AWEYZ06CKUg9kJql777lShgVvfNUXxrlEv0JiwfYdnGdX5NGE6hgSScp10UL9nFPSXh7dMgPr68x0aCtesEWXnEqjztVjdJpSb2BNVb8LD9Wf1C2KY7tbyWhDiKuAJlutLZaCYEHadkH1C38gn0UEyIQsH8Y3VtiqBibISGzt95WYo-md6vWdET6Ra9s3y4D0VbdMYPd-1ApUy5q-GZm-xb41GJRQQPP3ixEdV5UWxB7BevVe-68arraCfz3TzKU7rhKlueEY"
              />
            </div>
          </div>

          <div ref={heroOrbitsRef} className="hero-orbit-stack absolute right-8 top-1/3 z-10 hidden lg:flex flex-col gap-12 pointer-events-none reveal-element is-visible" style={{ transitionDelay: "0.8s" }}>
            <svg className="stroke-primary/40 fill-none stroke-[0.5] wireframe-sphere" height="100" viewBox="0 0 100 100" width="100" aria-hidden="true">
              <circle cx="50" cy="50" r="45" />
              <ellipse cx="50" cy="50" rx="45" ry="15" />
              <ellipse cx="50" cy="50" rx="15" ry="45" />
              <line x1="5" x2="95" y1="50" y2="50" />
            </svg>
            <svg
              className="stroke-primary/40 fill-none stroke-[0.5] wireframe-sphere"
              height="100"
              style={{ animationDelay: "-15s" }}
              viewBox="0 0 100 100"
              width="100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" />
              <ellipse cx="50" cy="50" rx="45" ry="15" />
              <ellipse cx="50" cy="50" rx="15" ry="45" />
              <line x1="5" x2="95" y1="50" y2="50" />
            </svg>
            <svg
              className="stroke-primary/40 fill-none stroke-[0.5] wireframe-sphere"
              height="100"
              style={{ animationDelay: "-30s" }}
              viewBox="0 0 100 100"
              width="100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" />
              <ellipse cx="50" cy="50" rx="45" ry="15" />
              <ellipse cx="50" cy="50" rx="15" ry="45" />
              <line x1="5" x2="95" y1="50" y2="50" />
            </svg>
            <svg
              className="stroke-primary/40 fill-none stroke-[0.5] wireframe-sphere"
              height="100"
              style={{ animationDelay: "-45s" }}
              viewBox="0 0 100 100"
              width="100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" />
              <ellipse cx="50" cy="50" rx="45" ry="15" />
              <ellipse cx="50" cy="50" rx="15" ry="45" />
              <line x1="5" x2="95" y1="50" y2="50" />
            </svg>
          </div>
        </section>

        <section className="py-section-gap relative z-10">
          <div className="px-margin-mobile md:px-gutter max-w-container-max mx-auto">
            <div className="mb-24 text-center md:text-left reveal-element is-visible">
              <h2 className="font-headline-lg text-5xl md:text-7xl text-primary mb-6 tracking-tighter uppercase opacity-80 mix-blend-plus-lighter">
                Superiority
              </h2>
              <p className="font-label-sm text-xs text-primary/70 uppercase tracking-widest">
                Architected for the modern landscape.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="border border-primary/20 p-8 hover-glow-card group reveal-element is-visible"
                  style={{ transitionDelay: card.delay }}
                >
                  <span
                    className="material-symbols-outlined text-primary text-2xl mb-12 opacity-50 group-hover:opacity-100 group-hover:scale-110 group-hover:text-primary-container transition-all duration-300"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {card.icon}
                  </span>
                  <h3 className="font-headline-lg text-xl text-primary mb-4 tracking-tight group-hover:text-primary-fixed">
                    {card.title}
                  </h3>
                  <p className="font-body-md text-sm text-primary/60 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap relative z-10 border-t border-primary/10">
          <div className="px-margin-mobile md:px-gutter max-w-container-max mx-auto">
            <div className="flex flex-col lg:flex-row gap-24 items-start">
              <div className="lg:w-1/3">
                <div className="reveal-element is-visible">
                  <h2 className="font-headline-lg text-5xl md:text-7xl text-primary mb-6 tracking-tighter uppercase opacity-80 mix-blend-plus-lighter">
                    Protocol
                  </h2>
                  <p className="font-label-sm text-xs text-primary/70 uppercase tracking-widest mb-16 leading-relaxed">
                    Initiate the integration process. Secure injection handled.
                  </p>
                </div>

                <div className="space-y-12">
                  {installationSteps.map((step) => (
                    <div
                      key={step.number}
                      className="flex gap-6 items-start reveal-element hover-glow-card p-4 -ml-4 rounded-lg group is-visible"
                      style={{ transitionDelay: step.delay }}
                    >
                      <div className="font-headline-lg text-2xl text-primary opacity-50 italic group-hover:opacity-100 group-hover:text-primary-container transition-all">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="font-headline-lg text-xl text-primary mb-2 tracking-tight group-hover:text-primary-fixed transition-colors">
                          {step.title}
                        </h4>
                        <p className="font-body-md text-sm text-primary/60">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-2/3 w-full reveal-element is-visible" style={{ transitionDelay: "0.4s" }}>
                <div className="border border-primary/20 p-1 lg:p-4 bg-background/50 backdrop-blur-sm hover:border-primary/40 transition-colors duration-500">
                  <div className="bg-surface-variant/30 border border-primary/10 p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="font-label-sm text-xs text-primary/40 mb-8 uppercase tracking-widest border-b border-primary/10 pb-4 relative z-10">
                      Terminal Session
                    </div>
                    <div className="font-label-sm text-sm text-primary/80 leading-loose relative z-10">
                      <pre>
                        <code>
                          <span className="text-primary/50"># Initialize nozomiReborn environment</span>
                          {"\n"}$ nozomi-cli --start
                          {"\n\n"}
                          <span className="text-primary/50"># Locate target process</span>
                          {"\n"}$ Finding Roblox process...
                          {"\n"}
                          <span className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            [OK] Process located (RobloxPlayerBeta.exe).
                          </span>
                          {"\n\n"}
                          <span className="text-primary/50"># Inject to target process</span>
                          {"\n"}$ Injecting DLL...
                          {"\n"}
                          <span className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            [OK] Loaded nozomiReborn. API ready for script execution.
                          </span>
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-primary/10 mt-24 relative z-10 mix-blend-difference">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-gutter max-w-container-max mx-auto">
          <div className="font-label-sm text-[10px] uppercase tracking-widest text-primary/70">
            ) 2024 nozomiReborn
          </div>
          <div className="flex gap-4">
            <a className="text-primary/70 hover:text-primary hover:scale-110 transition-all duration-300" href="#">
              <span className="material-symbols-outlined text-sm">language</span>
            </a>
            <a className="text-primary/70 hover:text-primary hover:scale-110 transition-all duration-300" href="#">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </a>
            <a className="text-primary/70 hover:text-primary hover:scale-110 transition-all duration-300" href="#">
              <span className="material-symbols-outlined text-sm">music_note</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
