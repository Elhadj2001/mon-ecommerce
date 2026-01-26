import { Facebook, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Marque */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-black tracking-tighter uppercase">MONSOON</span>
            <p className="text-xs text-gray-500 tracking-widest mt-1">EST. 2024 — PARIS · DAKAR</p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            &copy; {currentYear} Monsoon Inc. Tous droits réservés.
          </p>

          {/* Icônes Sociales */}
          <div className="flex space-x-6">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              className="text-gray-400 hover:text-blue-600 transition-transform hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              className="text-gray-400 hover:text-pink-600 transition-transform hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="mailto:contact@monsoon.com" 
              className="text-gray-400 hover:text-black transition-transform hover:scale-110"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  )
}