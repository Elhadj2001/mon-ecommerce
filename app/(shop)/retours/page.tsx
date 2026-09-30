import { RotateCcw, Mail, Phone, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Politique de Retour — MAISON NIANG",
  description: "Politique de retour et d'échange Maison Niang. Retours acceptés sous 7 jours.",
}

export default function RetourPage() {
  return (
    <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">Politique de Retour</h1>
        <p className="text-muted-foreground text-sm mb-12">Votre satisfaction est notre priorité.</p>

        <div className="space-y-8">

          {/* Délai */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> Retours acceptés sous 7 jours
            </h2>
            <p className="text-sm text-green-700/80 dark:text-green-300/80">
              Vous avez <strong>7 jours</strong> après la réception de votre commande pour nous retourner un article
              qui ne vous convient pas. L&apos;article doit être en parfait état, non porté et avec ses étiquettes d&apos;origine.
            </p>
          </div>

          {/* Comment faire */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <RotateCcw size={18} /> Comment effectuer un retour ?
            </h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/80">
              <li>
                Contactez-nous sur <strong>WhatsApp</strong> au <strong>+221 78 173 79 59</strong> ou par email en indiquant
                votre numéro de commande et le motif du retour.
              </li>
              <li>
                Notre équipe vous confirmera l&apos;éligibilité au retour et vous indiquera la marche à suivre.
              </li>
              <li>
                Emballez soigneusement l&apos;article dans son emballage d&apos;origine si possible.
              </li>
              <li>
                Le remboursement sera effectué sous <strong>7 jours ouvrés</strong> après réception et vérification
                de l&apos;article (via le même moyen de paiement utilisé).
              </li>
            </ol>
          </div>

          {/* Exceptions */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} /> Articles non retournables
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-amber-700/80 dark:text-amber-300/80">
              <li>Articles en promotion ou soldés</li>
              <li>Articles personnalisés ou sur mesure</li>
              <li>Sous-vêtements et maillots de bain (pour raisons d&apos;hygiène)</li>
              <li>Articles portés, lavés ou modifiés</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <h2 className="text-lg font-bold text-foreground mb-3">Une question ?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="https://wa.me/221781737959" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#20bd5a] transition-colors">
                <Phone size={16} /> WhatsApp
              </a>
              <a href="mailto:contact@maison-niang.fr"
                className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                <Mail size={16} /> Email
              </a>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <Link href="/cgv" className="text-sm text-muted-foreground underline hover:text-foreground transition-colors mr-4">
            CGV
          </Link>
          <Link href="/" className="text-sm text-muted-foreground underline hover:text-foreground transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
