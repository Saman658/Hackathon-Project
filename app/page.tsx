"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/landing/hero"
import { Features, defaultFeatures } from "@/components/landing/features"
import { Benefits, defaultBenefits } from "@/components/landing/benefits"
import { Pricing, defaultPlans } from "@/components/landing/pricing"
import { Testimonials, defaultTestimonials } from "@/components/landing/testimonials"
import { FAQ, defaultFAQs } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { LoginModal } from "@/components/auth/login-modal"

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => setLoginModalOpen(true)} />
      <main>
        <Hero onLoginClick={() => setLoginModalOpen(true)} />
        <Features features={defaultFeatures} />
        <Benefits benefits={defaultBenefits} />
        <Pricing plans={defaultPlans} />
        <Testimonials testimonials={defaultTestimonials} />
        <FAQ faqs={defaultFAQs} />
        <CTA onLoginClick={() => setLoginModalOpen(true)} />
      </main>
      <Footer />
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  )
}
