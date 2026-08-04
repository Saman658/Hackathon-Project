"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { ChevronDown } from "lucide-react"

interface FAQ {
  question: string
  answer: string
}

interface FAQProps {
  faqs: FAQ[]
  className?: string
}

function FAQInner({ faqs, className }: FAQProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <section id="faq" className={cn("py-24 bg-surface", className)}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Nexus. Can&apos;t find what you&apos;re looking for?
            <a href="#" className="text-accent hover:underline ml-1">Contact us</a>.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200 hover:border-accent/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultFAQs = [
  {
    question: "How does the free trial work?",
    answer: "You get full access to all features for 14 days, no credit card required. At the end of your trial, you can choose a plan or continue with limited features.",
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we prorate any differences.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-grade AES-256 encryption, SOC 2 Type II compliance, and regular security audits to keep your data safe.",
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes, all plans include email support. Professional and Enterprise plans get priority support with faster response times and dedicated channels.",
  },
  {
    question: "Can I integrate with my existing tools?",
    answer: "Nexus integrates with over 100 popular tools including Slack, Salesforce, HubSpot, and more. Our API also allows custom integrations.",
  },
]

export { FAQInner as FAQ, defaultFAQs }
