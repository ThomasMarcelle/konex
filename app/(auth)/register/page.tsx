import Link from "next/link";
import { Hexagon } from "lucide-react";
import SignUpForm from "@/components/auth/signup-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-[-10%] left-0 right-0 h-[500px] bg-[radial-gradient(circle_800px_at_50%_-200px,#1d4ed8,transparent)] opacity-20 pointer-events-none"></div>
       
      <div className="w-full max-w-md bg-[#0A0C10] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center">
              <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/10 stroke-[1.5]" />
            </div>
            <span className="text-xl font-normal tracking-tight text-white">Konex</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-medium text-white text-center mb-2">Créer un compte</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Rejoignez la marketplace B2B</p>

        <SignUpForm />

        <div className="mt-6 text-center">
             <p className="text-slate-500 text-xs">
                Déjà inscrit ? <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Se connecter</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
