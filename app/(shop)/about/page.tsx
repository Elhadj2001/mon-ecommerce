import { CustomImage } from "@/components/ui/CustomImage"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-12 pb-24">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <CustomImage
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
            alt="Atelier de mode"
            fill
            className="object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-[#c9a84c] text-sm font-bold tracking-[0.3em] uppercase mb-4">Maison Niang</p>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-[-0.02em] mb-6">Notre Histoire</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Née de la rencontre entre le savoir-faire artisanal sénégalais et l'élégance parisienne, Maison Niang est plus qu'une marque : c'est un héritage.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mt-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a84c] inline-block" />
              L'Origine
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Fondée en 2024, Maison Niang puise ses racines dans les rues colorées de Saint-Louis du Sénégal et s'inspire de la mode sophistiquée de Paris. Notre créateur, passionné par les étoffes nobles, a voulu créer un pont entre deux cultures.
              </p>
              <p>
                Chaque pièce raconte une histoire, tissant des liens profonds entre tradition et modernité. Nous sélectionnons rigoureusement nos matières pour vous offrir un vêtement qui traverse le temps avec élégance et caractère.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border">
            <CustomImage
              src="https://images.unsplash.com/photo-1558769132-cb1fac0840c2?q=80&w=2574&auto=format&fit=crop"
              alt="Matières nobles"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse" style={{ direction: 'rtl' }}>
          <div style={{ direction: 'ltr' }}>
            <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a84c] inline-block" />
              Notre Engagement
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                La mode de demain doit être responsable. Nous nous engageons à réduire notre empreinte carbone en favorisant des circuits de production courts et des matériaux durables.
              </p>
              <p>
                Nos ateliers partenaires garantissent des conditions de travail justes et équitables. En choisissant Maison Niang, vous soutenez non seulement la mode indépendante, mais également le savoir-faire éthique.
              </p>
            </div>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden border border-border" style={{ direction: 'ltr' }}>
            <CustomImage
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2572&auto=format&fit=crop"
              alt="Artisan cousant"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
