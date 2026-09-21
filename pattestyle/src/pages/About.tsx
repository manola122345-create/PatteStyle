import React from 'react';
import { PawPrint, Heart, ShieldCheck, Truck, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
          <PawPrint className="w-4 h-4" /> Notre Histoire
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          À propos de PatteStyle Europe
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Née de la passion pour le bien-être animal, PatteStyle est la boutique européenne dédiée aux accessoires d'exception pour chiens et chats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-3xl overflow-hidden shadow-xl aspect-4/3 bg-stone-200">
          <img src="/images/dog-bed-1.jpg" alt="PatteStyle team" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Notre Mission : Allier esthétique, durabilité et ergonomie
          </h3>
          <p>
            En 2024, nous avons fait un constat simple : trop d'accessoires sur le marché étaient soit de mauvaise qualité, soit inesthétiques dans nos intérieurs.
          </p>
          <p>
            Nous avons donc imaginé PatteStyle : une gamme restreinte et exigeante, développée avec des vétérinaires et des spécialistes du comportement animal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-2">
          <ShieldCheck className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-stone-900 text-sm">Contrôle Qualité Strict</h4>
          <p className="text-xs text-stone-600">Tous les matériaux sont testés pour résister aux griffes, à l'eau et aux lavages fréquents.</p>
        </div>
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-2">
          <Truck className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-stone-900 text-sm">Expédition depuis l'Europe</h4>
          <p className="text-xs text-stone-600">Stock géré en interne avec envoi Colissimo / Chronopost suivi pour toute l'Europe.</p>
        </div>
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-2">
          <Users className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-stone-900 text-sm">Service Client Réactif</h4>
          <p className="text-xs text-stone-600">Une équipe passionnée basée en France à votre écoute 7 jours sur 7.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
