import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-[80vh] bg-background text-foreground pt-12 pb-24">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center pt-10 pb-16">
        <p className="text-[#c9a84c] text-sm font-bold tracking-[0.3em] uppercase mb-4">Service Client</p>
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-[-0.02em] mb-6">
          Contactez-nous
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Une question sur une taille, un suivi de commande ou une création sur-mesure ? L'équipe Maison Niang est à votre disposition.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-16">
        
        {/* Contact Info */}
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold uppercase mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c9a84c] inline-block" />
              Nos coordonnées
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Maison Mère</h3>
                  <p className="text-muted-foreground">Saint-Louis Balacoss<br/>Rue Abba Mbaye, Sénégal</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Téléphone & WhatsApp</h3>
                  <p className="text-muted-foreground">+221 78 173 79 59</p>
                  <p className="text-xs text-muted-foreground mt-1">Du Lundi au Samedi, 9h00 - 18h00</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-1">Email</h3>
                  <p className="text-muted-foreground">eniang68@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-secondary/30 p-8 md:p-10 rounded-xl border border-border">
          <h2 className="text-xl font-bold uppercase mb-6">Envoyez-nous un message</h2>
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prénom</label>
                <input type="text" className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nom</label>
                <input type="text" className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <input type="email" className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Numéro de commande (Optionnel)</label>
              <input type="text" className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea rows={5} className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors resize-none" required></textarea>
            </div>
            <button type="submit" className="w-full bg-foreground text-background py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#c9a84c] transition-colors duration-300">
              Envoyer la demande
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
