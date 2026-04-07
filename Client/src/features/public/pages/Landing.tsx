import { ArrowRight, BarChart3, CheckCircle2, LayoutDashboard, Shuffle, Shield, Users, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border/50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded-md">
                <Shuffle className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Syncro</span>
            </div>
            <div className="hidden md:flex gap-6 items-center">
               <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
               <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it Works</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded hover:opacity-90 transition-opacity shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="text-center relative z-10 max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/20">
              Syncro 2.0 is now live
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              The modern workspace for <span className="text-primary">agile teams</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Unify your company's sprints, streamline task backlogs, and elevate developer performance without the bloated interfaces of legacy software.
            </p>
            <div className="flex justify-center gap-3 flex-col sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all shadow-sm"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-foreground bg-card border border-border rounded-md hover:bg-secondary transition-colors"
              >
                Access Dashboard
              </Link>
            </div>
          </div>

          {/* Abstract Dashboard Mockup */}
          <div className="mt-16 mx-auto max-w-4xl relative rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur p-2">
             <div className="rounded-lg bg-background border border-border/50 overflow-hidden shadow-sm">
                <div className="flex items-center px-4 py-2 border-b border-border bg-muted/30 gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-destructive/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="p-4 grid grid-cols-4 gap-4 h-64">
                   <div className="col-span-1 border-r border-border space-y-3 pr-4">
                     <div className="h-2 bg-muted rounded w-2/3"></div>
                     <div className="h-2 bg-muted rounded w-1/2"></div>
                     <div className="h-2 bg-muted rounded w-3/4"></div>
                     <div className="h-2 bg-primary/20 rounded w-full mt-4"></div>
                     <div className="h-2 bg-muted rounded w-2/3"></div>
                   </div>
                   <div className="col-span-3 space-y-4">
                     <div className="flex gap-4">
                        <div className="h-20 flex-1 bg-card border border-border rounded-md p-3">
                           <div className="h-2 bg-muted rounded w-1/3 mb-4"></div>
                           <div className="h-6 bg-primary/10 rounded w-1/4"></div>
                        </div>
                        <div className="h-20 flex-1 bg-card border border-border rounded-md p-3">
                           <div className="h-2 bg-muted rounded w-1/3 mb-4"></div>
                           <div className="h-6 bg-primary/10 rounded w-1/4"></div>
                        </div>
                        <div className="h-20 flex-1 bg-card border border-border rounded-md p-3">
                           <div className="h-2 bg-muted rounded w-1/3 mb-4"></div>
                           <div className="h-6 bg-primary/10 rounded w-1/4"></div>
                        </div>
                     </div>
                     <div className="h-24 bg-card border border-border rounded-md"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Everything you need to ship faster</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Replace your entire stack of disjointed management tools with one unified, blazing fast agile workspace.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: LayoutDashboard, title: "Sprint Tracking", desc: "Build cycles, assign tickets, and hit deadlines gracefully." },
              { icon: CheckCircle2, title: "Backlog Pruning", desc: "Keep ideas structured and instantly deploy them to sprints." },
              { icon: BarChart3, title: "Performance Metrics", desc: "Automated insights mapping your team's velocity and efficiency." },
              { icon: Users, title: "Team Management", desc: "Granular roles, secure permissions, and dynamic assignments." },
              { icon: Workflow, title: "Workflow Automation", desc: "Move statuses and trigger actions without lifting a finger." },
              { icon: Shield, title: "Enterprise Security", desc: "Encrypted data, strict access levels, and role integrity." }
            ].map((Feature, i) => (
              <div key={i} className="bg-card p-5 rounded-lg border border-border hover:border-primary/50 transition-colors shadow-sm">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center mb-4">
                  <Feature.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{Feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Seamless integration in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-border"></div>
             {[
               { step: "1", title: "Create Workspace", desc: "Sign up and establish your company's secure environment instantly." },
               { step: "2", title: "Invite Teams", desc: "Onboard employees and logically group them into agile squads." },
               { step: "3", title: "Deploy Sprints", desc: "Draft backlogs and push code faster than ever before." },
             ].map((item, i) => (
               <div key={i} className="relative text-center z-10 px-4">
                  <div className="w-14 h-14 mx-auto bg-background border border-border rounded-full flex items-center justify-center mb-4 shadow-sm relative text-lg font-bold text-primary">
                    <span className="absolute inset-0 bg-card rounded-full -z-10 blur-sm"></span>
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to unify your workflow?</h2>
          <p className="text-sm text-muted-foreground mb-8">Join the growing list of developers managing logic, not tickets.</p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all shadow-sm"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Syncro</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
             <Link to="#" className="hover:text-foreground">Privacy Policy</Link>
             <Link to="#" className="hover:text-foreground">Terms of Service</Link>
             <Link to="#" className="hover:text-foreground">Contact</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Syncro Inc.</p>
        </div>
      </footer>
    </div>
  );
}
