import { Camera, CameraOff, Loader2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import type { HandTrackingResult } from '../hooks/useHandTracking'
import type { TranslationKey } from '../data/translations'

interface CameraPanelProps {
  tracking: HandTrackingResult
  instructionKey: TranslationKey
  showTips?: boolean
}

export default function CameraPanel({ tracking, instructionKey, showTips = true }: CameraPanelProps) {
  const { t } = useSettings()
  const { status, supported, videoRef, fingerTips, indexTip, enable, disable } = tracking

  if (!supported) return null

  return (
    <div className="mb-5 flex w-full flex-col items-center gap-2">
      <button
        onClick={status === 'running' ? disable : enable}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${
          status === 'running' ? 'bg-brand-navy text-white' : 'bg-white/90 text-brand-navy'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'running' ? (
          <CameraOff className="h-4 w-4" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        {status === 'running' ? t('camera.disable') : t('camera.enable')}
      </button>

      {status === 'denied' && <p className="max-w-xs text-center text-xs font-semibold text-brand-navy/60">{t('camera.denied')}</p>}
      {status === 'error' && <p className="max-w-xs text-center text-xs font-semibold text-brand-navy/60">{t('camera.denied')}</p>}

      {/* The <video> must stay mounted from 'loading' onward so the ref is ready the instant the
          camera stream resolves — unmounting it while loading would strand the stream with nowhere to attach. */}
      {(status === 'loading' || status === 'running') && (
        <div className="relative mt-1 w-full max-w-xs overflow-hidden rounded-2xl bg-brand-navy shadow-lg">
          <video
            ref={videoRef}
            muted
            playsInline
            className={`aspect-[4/3] w-full scale-x-[-1] object-cover transition-opacity duration-300 ${
              status === 'running' ? 'opacity-90' : 'opacity-0'
            }`}
          />
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
              <p className="text-xs font-semibold text-white/80">{t('camera.loading')}</p>
            </div>
          )}
          {status === 'running' && (
            <>
              {showTips &&
                fingerTips.map(
                  (tip, i) =>
                    tip && (
                      <span
                        key={i}
                        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow ring-2 ring-white"
                        style={{ left: `${tip.x * 100}%`, top: `${tip.y * 100}%` }}
                      />
                    ),
                )}
              {!showTips && indexTip && (
                <span
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-pink ring-2 ring-white"
                  style={{ left: `${indexTip.x * 100}%`, top: `${indexTip.y * 100}%` }}
                />
              )}
              <p className="absolute inset-x-0 bottom-0 bg-brand-navy/70 px-3 py-1.5 text-center text-[11px] font-semibold text-white">
                {t(instructionKey)}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
