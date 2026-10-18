import { motion } from 'framer-motion'
import { PlayCircle } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import Mascot from './Mascot'
import SpeechBubble from './SpeechBubble'
import { playClick } from '../utils/sound'

export default function HeroSection({ onStart }: { onStart: () => void }) {
  const { t, sound } = useSettings()

  return (
    <section className="relative rounded-[2rem] bg-white/55 p-6 shadow-[0_12px_40px_-14px_rgba(32,58,135,0.35)] ring-1 ring-white/70 sm:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-lg font-bold text-brand-navy/80 sm:text-xl"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-brand-navy/70 sm:text-base"
          >
            {t('home.hero.description')}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => {
              playClick(sound)
              onStart()
            }}
            className="mt-7 flex items-center gap-2 rounded-full bg-brand-navy px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-brand-navy/20 transition-transform hover:scale-105 active:scale-95 sm:text-lg"
          >
            <PlayCircle className="h-6 w-6" />
            {t('home.hero.cta')}
          </motion.button>
        </div>

        <div className="relative flex items-end justify-center self-end">
          <Mascot className="h-64 w-auto translate-y-6 drop-shadow-xl sm:h-80 sm:translate-y-10 md:h-96" />
          <div className="absolute -right-2 top-2 w-44 sm:w-52">
            <SpeechBubble>{t('home.hero.speech')}</SpeechBubble>
          </div>
        </div>
      </div>
    </section>
  )
}
