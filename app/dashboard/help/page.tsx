"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Rocket,
  LayoutDashboard,
  UserCircle,
  Settings,
  LogIn,
  HelpCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  ExternalLink,
} from "lucide-react"

const faqs = [
  {
    question: "How do I sign up for an account?",
    answer:
      "Click the 'Get Started' button on the landing page or navigate to /login. You can sign up with your email and password, or use Google or GitHub OAuth for faster registration.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "On the login page, click 'Forgot password?' and enter your email. We'll send you a reset link. Follow the instructions in the email to set a new password.",
  },
  {
    question: "Can I change my email address?",
    answer:
      "Yes. Go to Settings > Account Email, enter your new email address, and click 'Update Email'. You will receive a verification email to confirm the change.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "You can update your profile by clicking your avatar in the top-right corner and selecting 'Profile', or by going to Settings > Profile Information.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use Supabase for authentication and Row Level Security (RLS) ensures that you can only access your own data. All data is encrypted in transit and at rest.",
  },
  {
    question: "How do I log out?",
    answer:
      "Click your avatar in the top-right corner and select 'Log out', or use the Log out button in the sidebar or Settings page.",
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-border-light transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

const gettingStartedSteps = [
  {
    icon: LogIn,
    title: "Create an Account",
    description: "Sign up using your email and password, or use Google/GitHub OAuth for one-click registration.",
  },
  {
    icon: UserCircle,
    title: "Complete Your Profile",
    description: "After signing up, add your full name and business name so we can personalize your experience.",
  },
  {
    icon: LayoutDashboard,
    title: "Explore the Dashboard",
    description: "Navigate through Dashboard, Customers, Orders, Products, and Problems to manage your business.",
  },
  {
    icon: Settings,
    title: "Configure Settings",
    description: "Visit Settings to update your profile, change your email, or update your password.",
  },
]

const helpCards = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "The Dashboard gives you an overview of your business. View analytics cards, revenue charts, traffic sources, and recent orders all in one place.",
    items: [
      "Analytics cards show key metrics at a glance",
      "Revenue Overview chart tracks monthly performance",
      "Traffic Sources shows where your visitors come from",
      "Recent Orders table displays your latest transactions",
    ],
  },
  {
    icon: UserCircle,
    title: "Profile & Settings",
    description:
      "Manage your personal information and account preferences from the Settings page.",
    items: [
      "Update your full name and business name",
      "Change your email address (requires verification)",
      "Update your password securely",
      "Log out from any device",
    ],
  },
  {
    icon: LogIn,
    title: "Authentication",
    description:
      "We support multiple secure sign-in methods to make access easy and safe.",
    items: [
      "Email and password authentication",
      "Google OAuth for one-click sign-in",
      "GitHub OAuth for developers",
      "Password reset via email",
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
              <p className="text-muted-foreground mt-2 text-base">
                Find guides, answers, and resources to help you get the most out of Nexus.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  Search the Knowledge Base
                </CardTitle>
                <CardDescription>
                  Try searching for topics like &quot;profile&quot;, &quot;password&quot;, or &quot;orders&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Search for help..."
                    className="max-w-xl"
                  />
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-muted-foreground" />
                Getting Started
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {gettingStartedSteps.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-xl bg-border-light p-2">
                          <step.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Dashboard Usage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {helpCards.map((card, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <card.icon className="h-5 w-5 text-muted-foreground" />
                        {card.title}
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {card.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <FaqItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Contact Support
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Get in Touch</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>support@nexus.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span>Documentation Portal</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Send us a message</h3>
                      <div className="space-y-3">
                        <Input type="text" placeholder="Your name" />
                        <Input type="email" placeholder="Your email" />
                        <Input type="text" placeholder="Subject" />
                        <textarea
                          placeholder="How can we help?"
                          className="w-full rounded-xl border border-border bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-all min-h-[100px]"
                        />
                        <Button className="w-full">Send Message</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
