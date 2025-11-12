import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Target, Mail, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Queen Mama
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Pay Only For
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {' '}Qualified Leads
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
                B2B lead generation made simple. We handle the outreach, you only pay for leads that respond positively.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No Setup Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Qualified Leads Only</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24 bg-secondary/20">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose Queen Mama?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                Focus on closing deals, not prospecting. We handle the entire outreach process.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-purple-600 mb-2" />
                  <CardTitle>Fast Setup</CardTitle>
                  <CardDescription>
                    Define your ICP in minutes and launch your campaign within 24 hours.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Quality Guaranteed</CardTitle>
                  <CardDescription>
                    Only pay for leads that show genuine interest in your offer.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
                  <CardTitle>Scale With Confidence</CardTitle>
                  <CardDescription>
                    Predictable pricing based on results, not efforts.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container py-24">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                Three simple steps to start generating qualified leads
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-xl">
                      1
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>Define Your ICP</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tell us about your ideal customer: industry, company size, location, and decision-maker titles.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xl">
                      2
                    </div>
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>We Handle Outreach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our team finds prospects, crafts personalized emails, and manages follow-ups automatically.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-xl">
                      3
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>Get Qualified Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive only leads that responded positively. Pay per qualified lead, not per email sent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container py-24 bg-secondary/20">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                Choose the plan that fits your growth stage
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Per Lead</CardTitle>
                  <CardDescription>Perfect for testing the waters</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€60</span>
                    <span className="text-muted-foreground">/lead</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>No monthly fee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Pay only for results</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Cancel anytime</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full" variant="outline">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-500 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                  <CardDescription>For scaling teams</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€299</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">+ €25/lead</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Lower cost per lead</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced analytics</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Scale</CardTitle>
                  <CardDescription>For enterprise teams</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€999</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">+ €20/lead</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Lowest cost per lead</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full" variant="outline">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Scale Your Outreach?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
              Join hundreds of B2B companies generating qualified leads on autopilot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Queen Mama
              </span>
              <p className="text-sm text-muted-foreground">
                B2B lead generation platform that delivers qualified leads through automated cold emailing.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#how-it-works">How It Works</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Queen Mama. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
