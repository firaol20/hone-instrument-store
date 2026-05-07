import { Metadata } from 'next';
import { Header } from "@/components/Header";
import { ShieldCheck, RotateCcw, Truck, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: 'Return Policy - Hone Musical Instruments',
  description: 'Read our 7-day return policy. We ensure a smooth return process for all our musical instruments and gear.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4">
            Return <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-slate-500 font-medium">Last updated: May 7, 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-sm mb-2">7-Day Window</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Return any eligible item within 7 days of purchase.</p>
          </div>    
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-sm mb-2">Full Refund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Receive a full refund if the item is in its original condition.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase text-sm mb-2">Easy Process</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Drop off at our showroom or ship it back to us.</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="text-orange-600">01.</span> Eligibility for Returns
            </h2>
            <p className="text-slate-600 leading-relaxed">
              To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You must initiate the return within 7 days of purchase. You’ll also need the receipt or proof of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="text-orange-600">02.</span> Non-Returnable Items
            </h2>
            <div className="bg-orange-50/50 border-l-4 border-orange-600 p-6 rounded-r-2xl">
              <p className="text-slate-700 text-sm font-medium mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Certain types of items cannot be returned:
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm space-y-2">
                <li>Consumable items (e.g., guitar strings, drumsticks, reeds) if opened.</li>
                <li>Earphones or microphones (for hygiene reasons).</li>
                <li>Digital downloads or activated software.</li>
                <li>Custom-made or personalized instruments.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="text-orange-600">03.</span> Damaged or Incorrect Items
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="text-orange-600">04.</span> Refunds
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days.
            </p>
          </section>

          <section className="bg-slate-950 text-white p-10 rounded-[2.5rem] mt-20">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Need Help?</h2>
            <p className="text-slate-400 text-sm mb-8">If you have any questions about our return policy, our team is here to assist you.</p>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+251982616263" className="px-6 py-3 bg-orange-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-orange-700 transition-colors">
                Call Us
              </a>
              <a href="/contact" className="px-6 py-3 bg-white/10 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/20 transition-colors">
                Contact Support
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
