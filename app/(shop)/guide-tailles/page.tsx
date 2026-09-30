import Link from "next/link"

export const metadata = {
  title: "Guide des Tailles — MAISON NIANG",
  description: "Trouvez votre taille idéale avec le guide des tailles Maison Niang.",
}

export default function SizeGuidePage() {
  return (
    <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">Guide des Tailles</h1>
        <p className="text-muted-foreground text-sm mb-12">Trouvez votre taille parfaite parmi nos collections.</p>

        <div className="space-y-10">

          {/* HAUTS */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-secondary/40 px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">Hauts &amp; Robes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/20 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Taille</th>
                    <th className="px-6 py-3 text-center font-bold">Tour de Poitrine</th>
                    <th className="px-6 py-3 text-center font-bold">Tour de Taille</th>
                    <th className="px-6 py-3 text-center font-bold">EU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XS</td><td className="px-6 py-3 text-center">80-84 cm</td><td className="px-6 py-3 text-center">60-64 cm</td><td className="px-6 py-3 text-center">34</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">S</td><td className="px-6 py-3 text-center">85-89 cm</td><td className="px-6 py-3 text-center">65-69 cm</td><td className="px-6 py-3 text-center">36</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">M</td><td className="px-6 py-3 text-center">90-94 cm</td><td className="px-6 py-3 text-center">70-74 cm</td><td className="px-6 py-3 text-center">38</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">L</td><td className="px-6 py-3 text-center">95-99 cm</td><td className="px-6 py-3 text-center">75-79 cm</td><td className="px-6 py-3 text-center">40</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XL</td><td className="px-6 py-3 text-center">100-104 cm</td><td className="px-6 py-3 text-center">80-84 cm</td><td className="px-6 py-3 text-center">42</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XXL</td><td className="px-6 py-3 text-center">105-110 cm</td><td className="px-6 py-3 text-center">85-90 cm</td><td className="px-6 py-3 text-center">44</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BAS */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-secondary/40 px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">Pantalons &amp; Jupes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/20 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold">Taille</th>
                    <th className="px-6 py-3 text-center font-bold">Tour de Taille</th>
                    <th className="px-6 py-3 text-center font-bold">Tour de Hanches</th>
                    <th className="px-6 py-3 text-center font-bold">EU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XS</td><td className="px-6 py-3 text-center">60-64 cm</td><td className="px-6 py-3 text-center">84-88 cm</td><td className="px-6 py-3 text-center">34</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">S</td><td className="px-6 py-3 text-center">65-69 cm</td><td className="px-6 py-3 text-center">89-93 cm</td><td className="px-6 py-3 text-center">36</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">M</td><td className="px-6 py-3 text-center">70-74 cm</td><td className="px-6 py-3 text-center">94-98 cm</td><td className="px-6 py-3 text-center">38</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">L</td><td className="px-6 py-3 text-center">75-79 cm</td><td className="px-6 py-3 text-center">99-103 cm</td><td className="px-6 py-3 text-center">40</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XL</td><td className="px-6 py-3 text-center">80-84 cm</td><td className="px-6 py-3 text-center">104-108 cm</td><td className="px-6 py-3 text-center">42</td></tr>
                  <tr className="hover:bg-secondary/30 transition-colors"><td className="px-6 py-3 font-bold">XXL</td><td className="px-6 py-3 text-center">85-90 cm</td><td className="px-6 py-3 text-center">109-114 cm</td><td className="px-6 py-3 text-center">44</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CONSEILS */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">Comment bien se mesurer ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-foreground/80">
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">📏</p>
                <p className="font-bold text-foreground text-xs uppercase tracking-wide mb-1">Tour de Poitrine</p>
                <p className="text-xs">Mesurez autour de la partie la plus large de la poitrine.</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">📐</p>
                <p className="font-bold text-foreground text-xs uppercase tracking-wide mb-1">Tour de Taille</p>
                <p className="text-xs">Mesurez à l&apos;endroit le plus étroit de la taille, au niveau du nombril.</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">📏</p>
                <p className="font-bold text-foreground text-xs uppercase tracking-wide mb-1">Tour de Hanches</p>
                <p className="text-xs">Mesurez autour de la partie la plus large des hanches.</p>
              </div>
            </div>
          </div>

          {/* EN CAS DE DOUTE */}
          <div className="bg-secondary/20 border border-border rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Vous hésitez entre deux tailles ?</strong> Contactez-nous sur WhatsApp au
              <strong> +221 78 173 79 59</strong> avec vos mesures, nous vous conseillerons la taille idéale !
            </p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <Link href="/" className="text-sm text-muted-foreground underline hover:text-foreground transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
