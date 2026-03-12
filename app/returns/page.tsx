import { ArrowLeftRight, CheckCircle2, ShieldCheck, Truck } from "lucide-react"
import Link from "next/link"

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-12 pb-24">
      {/* Header simple et élégant */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center pt-10 pb-16">
        <p className="text-[#c9a84c] text-sm font-bold tracking-[0.3em] uppercase mb-4">Maison Niang</p>
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-[-0.02em] mb-6">
          Politique de Retour <br/> et Échanges
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Votre satisfaction est notre priorité absolue. Découvrez nos conditions de retour simples, rapides et transparentes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Avantages */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: ShieldCheck, title: "14 Jours pour changer d'avis", desc: "À compter de la réception de votre commande." },
            { icon: ArrowLeftRight, title: "Échanges Faciles", desc: "Taille inadaptée ? Nous l'échangeons sans frais supplémentaires." },
            { icon: Truck, title: "Retours Sécurisés", desc: "Étiquette pré-payée fournie sur demande via le service client." }
          ].map((item, i) => (
            <div key={i} className="p-6 border border-border bg-secondary/30 rounded-lg text-center flex flex-col items-center">
              <item.icon className="w-10 h-10 text-[#c9a84c] mb-4" />
              <h3 className="font-bold uppercase text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Sections de texte */}
        <div className="space-y-12 max-w-3xl border-t border-border pt-12">
          
          <section>
            <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-3">
              <span className="w-4 h-px bg-[#c9a84c] inline-block" />
              Conditions d'éligibilité
            </h2>
            <div className="text-muted-foreground space-y-3 leading-relaxed">
              <p>Pour qu'un retour soit accepté, l'article doit respecter les conditions suivantes :</p>
              <ul className="space-y-2 mt-4 ml-4">
                {[
                  "L'article doit être neuf, non porté et non lavé.",
                  "Toutes les étiquettes Maison Niang d'origine doivent être fixées.",
                  "L'article doit être retourné dans son emballage d'origine intact.",
                  "Les articles personnalisés ou sur-mesure ne sont ni repris ni échangés."
                ].map((text, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-[#c9a84c] shrink-0 mt-1" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-3">
              <span className="w-4 h-px bg-[#c9a84c] inline-block" />
              Comment effectuer un retour ?
            </h2>
            <div className="text-muted-foreground space-y-4 leading-relaxed">
              <p>
                <strong>1. Demande de retour :</strong> Connectez-vous à votre compte client, accédez à la section "Mes Commandes", puis sélectionnez la commande concernée et cliquez sur "Effectuer un retour".
              </p>
              <p>
                <strong>2. Préparation du colis :</strong> Replacez l'article dans son emballage d'origine. Imprimez le bon de retour fourni et glissez-le à l'intérieur. Collez l'étiquette prépayée sur le carton.
              </p>
              <p>
                <strong>3. Expédition :</strong> Déposez le colis dans un bureau de poste ou un point relais partenaire dans un délai de 7 jours après la demande.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-3">
              <span className="w-4 h-px bg-[#c9a84c] inline-block" />
              Remboursements
            </h2>
            <div className="text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Une fois votre retour reçu et inspecté par notre atelier, nous vous enverrons un email pour confirmer l'approbation ou le rejet de votre remboursement.
              </p>
              <p>
                Si approuvé, le remboursement sera traité et un crédit sera automatiquement appliqué à votre carte de crédit ou à votre méthode originale de paiement dans un délai de 5 à 10 jours ouvrables. Les frais de livraison initiaux ne sont pas remboursables.
              </p>
            </div>
          </section>

        </div>

        <div className="mt-16 text-center">
           <Link 
             href="/contact" 
             className="inline-block bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-opacity"
           >
             Besoin d'aide ? Contactez-nous
           </Link>
        </div>

      </div>
    </div>
  )
}
