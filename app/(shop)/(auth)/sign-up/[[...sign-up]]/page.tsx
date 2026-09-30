import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">
            Créer un compte
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Rejoignez notre communauté et profitez d'offres exclusives
          </p>
        </div>
        <div className="flex items-center justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card border border-border shadow-xl rounded-3xl p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-border rounded-xl font-bold text-sm h-11",
                formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-wider h-11",
                formFieldInput: "bg-background border-border rounded-xl h-11",
                footerActionLink: "text-foreground font-bold",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
