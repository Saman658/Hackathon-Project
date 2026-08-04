"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { Avatar } from "../ui/avatar"

interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  className?: string
}

function TestimonialsInner({ testimonials, className }: TestimonialsProps) {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <section id="testimonials" className={cn("py-24", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by industry leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about working with Nexus.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-border bg-surface p-8 md:p-12 shadow-lg">
            <div className="absolute top-6 left-8 text-6xl text-accent/10 font-serif">&ldquo;</div>
            <div className="relative z-10">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={cn(
                    "transition-all duration-500",
                    index === active ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
                  )}
                >
                  <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-center">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fallback={testimonial.author.split(" ").map((n) => n[0]).join("")}
                      size="md"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === active ? "w-8 bg-accent" : "w-2 bg-border hover:bg-muted"
                )}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const defaultTestimonials = [
  {
    quote: "Nexus transformed how we operate. The insights we get are incredible, and the platform is a joy to use every day.",
    author: "Sarah Chen",
    role: "VP of Operations",
    company: "TechCorp",
    avatar: "",
  },
  {
    quote: "We reduced our operational overhead by 35% in the first quarter. The ROI was immediate and substantial.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "GrowthLabs",
    avatar: "",
  },
  {
    quote: "The best investment we made this year. Our team is more aligned and productive than ever before.",
    author: "Elena Rodriguez",
    role: "CEO",
    company: "StartupXYZ",
    avatar: "",
  },
]

export { TestimonialsInner as Testimonials, defaultTestimonials }
