import { ShieldCheck, RotateCcw, Truck, CreditCard, Scale } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Conditions Générales de Vente — MAISON NIANG",
  description: "Consultez les Conditions Générales de Vente de Maison Niang : commandes, paiements, livraison et retours.",
}

export default function CGVPage() {
  return (
    <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">Conditions Générales de Vente</h1>
        <p className="text-muted-foreground text-sm mb-12">Dernière mise à jour : Mars 2026</p>

        <div className="space-y-10 text-sm text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Scale size={18} /> Article 1 — Objet
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site 
              <strong> www.maison-niang.fr</strong> exploité par Maison Niang, marque de mode contemporaine basée à Saint-Louis, Sénégal.
            </p>
            <p className="mt-2">
              Toute commande passée sur le site implique l&apos;acceptation pleine et entière de ces CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <CreditCard size={18} /> Article 2 — Commandes et Paiement
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Les prix sont affichés en <strong>Francs CFA (FCFA)</strong>.</li>
              <li>La commande est validée dès réception du paiement ou confirmation de paiement à la livraison.</li>
              <li>Moyens de paiement acceptés : <strong>Wave, Orange Money, PayPal, Paiement à la livraison</strong> (Dakar uniquement).</li>
              <li>En cas de paiement par mobile money (Wave/Orange Money), le client doit transférer le montant exact au numéro indiqué sur la page de confirmation.</li>
              <li>La commande est automatiquement annulée si le paiement n&apos;est pas reçu sous 48h.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Truck size={18} /> Article 3 — Livraison
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dakar :</strong> Livraison sous 24h à 72h ouvrées.</li>
              <li><strong>Sénégal (hors Dakar) :</strong> Livraison sous 3 à 7 jours ouvrés.</li>
              <li><strong>International :</strong> Livraison sous 7 à 15 jours ouvrés. Des frais de douane peuvent s&apos;appliquer selon le pays de destination.</li>
              <li>Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement contractuel.</li>
              <li>Un numéro WhatsApp de suivi est fourni pour chaque commande.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <RotateCcw size={18} /> Article 4 — Retours et Échanges
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Les retours sont acceptés dans un délai de <strong>7 jours</strong> après réception.</li>
              <li>Les articles doivent être retournés dans leur <strong>état d&apos;origine</strong> (non portés, étiquettes attachées).</li>
              <li>Les frais de retour sont à la charge du client sauf en cas d&apos;erreur de notre part.</li>
              <li>Le remboursement est effectué sous 7 jours ouvrés après réception et vérification de l&apos;article retourné.</li>
              <li>Les articles en promotion ou personnalisés ne sont ni repris ni échangés.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShieldCheck size={18} /> Article 5 — Protection des données
            </h2>
            <p>
              Vos données personnelles (nom, email, téléphone, adresse) sont collectées uniquement pour le traitement de vos commandes.
              Elles ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.
            </p>
            <p className="mt-2">
              Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez d&apos;un droit d&apos;accès,
              de rectification et de suppression de vos données en nous contactant via WhatsApp ou email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-3">
              Article 6 — Contact
            </h2>
            <p>
              Pour toute question, contactez-nous :
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>WhatsApp : <strong>+221 78 173 79 59</strong></li>
              <li>Email : <strong>contact@maison-niang.fr</strong></li>
              <li>Site : <strong>www.maison-niang.fr</strong></li>
            </ul>
          </section>

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
