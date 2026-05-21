import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  CheckCircle2,
  Keyboard,
  Monitor,
  MousePointer2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
  Cpu,
  Waves,
  Radar,
  Gauge,
  Power,
  FlaskConical,
} from "lucide-react"

import RootDiv from "@/components/rootdiv"
import Button from "@/components/ui/button"
import { invoke } from "@/lib/electron"
import { notify as toast } from "@/lib/notify"

const STORAGE_KEY = "maxify:input-lag:applied"
const DEVICES_STORAGE_KEY = "maxify:input-lag:devices"

const deviceInfoScript = "maxify-premium://mx_aa1c9f4027d84e65b301"

const modules = [
  {
    id: "mouse",
    label: "Mouse",
    title: "Mouse Precision Engine",
    subtitle: "Sensor, resposta e suavidade de clique",
    icon: MousePointer2,
    type: "mouse",
    checkScript: "maxify-premium://mx_b6a4a50e9cc64296b6f1",
    applyScript: "maxify-premium://mx_cde12b9dcf344f418a77",
    restoreScript: "maxify-premium://mx_14a9e62adbd54922a76d",
  },
  {
    id: "keyboard",
    label: "Teclado",
    title: "Keyboard Response Core",
    subtitle: "Delay mínimo e repetição acelerada",
    icon: Keyboard,
    type: "keyboard",
    checkScript: "maxify-premium://mx_a8f4cb61f7444d588ef4",
    applyScript: "maxify-premium://mx_2ecf2ccfa1f54615b937",
    restoreScript: "maxify-premium://mx_73c9226c72fa4d14ad7b",
  },
  {
    id: "monitor",
    label: "Monitor",
    title: "Display Latency Sync",
    subtitle: "Hz, resolução e resposta visual",
    icon: Monitor,
    type: "monitor",
    checkScript: "maxify-premium://mx_6b05e70ac8bc4d4bb922",
    applyScript: "maxify-premium://mx_8dd5be7fcfb5477ea2f0",
    restoreScript: "maxify-premium://mx_f2b1de5d112b4fefb022",
  },
]

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function displayValue(value, fallback = "Aguardando leitura") {
  const text = String(value || "").trim()
  if (!text || text.toLowerCase() === "n/a") return fallback
  return text
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 16 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-blue-400/35"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 23) % 100}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.1, 0.55, 0.1],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 3 + (index % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.12,
          }}
        />
      ))}
    </div>
  )
}

function ScanLines({ active }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
      <motion.div
        className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent"
        animate={{ y: active ? ["-30%", "430%"] : ["-30%", "250%"] }}
        transition={{
          duration: active ? 2.4 : 4.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

function BetaWarning() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="relative overflow-hidden rounded-[24px] border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 shadow-lg shadow-yellow-500/5"
    >
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(250,204,21,0.14),transparent)]"
        animate={{ x: ["-120%", "120%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border border-yellow-400/25 bg-yellow-400/15 p-2 text-yellow-300">
          <FlaskConical size={18} />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-yellow-300">
            Recurso em beta
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-maxify-text-secondary">
            Esta página ainda está em testes. Algumas leituras ou otimizações podem mudar nas próximas atualizações.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MouseVisual({ active }) {
<<<<<<< HEAD
  const rgbDots = useMemo(() => Array.from({ length: 18 }), [])
=======
  const dust = useMemo(() => Array.from({ length: 24 }), [])
  const lights = useMemo(() => Array.from({ length: 10 }), [])
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e

  return (
    <motion.div
      className="relative flex h-[310px] w-full items-center justify-center"
      initial={false}
      animate={{
        y: active ? [0, -5, 0] : [0, -2, 0],
<<<<<<< HEAD
        rotateZ: active ? [-7, -6.2, -7] : -7,
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-8 h-10 w-[245px] rotate-[-7deg] rounded-full bg-black/55 blur-xl" />

      <div className="relative h-[255px] w-[270px] rotate-[-11deg]">
        <div className="absolute left-[52px] top-[48px] h-[190px] w-[142px] rounded-[56%_56%_43%_43%] bg-black/55 blur-[2px]" />

        <div className="absolute left-[48px] top-[32px] h-[190px] w-[150px] overflow-hidden rounded-[58%_58%_44%_44%] border border-white/10 bg-[linear-gradient(145deg,#2f343c_0%,#111827_35%,#05070b_72%,#020305_100%)] shadow-[0_28px_55px_rgba(0,0,0,0.58),inset_0_2px_0_rgba(255,255,255,0.18),inset_-18px_-22px_35px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-[9px] rounded-[55%_55%_42%_42%] border border-white/8 bg-[radial-gradient(circle_at_32%_18%,rgba(255,255,255,0.23),transparent_19%),linear-gradient(140deg,rgba(255,255,255,0.08),transparent_34%,rgba(0,0,0,0.38))]" />

          <div className="absolute left-1/2 top-0 h-[94px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/35 via-white/15 to-transparent" />
          <div className="absolute left-[18px] top-[18px] h-[82px] w-[52px] rounded-[75%_18%_28%_14%] border-r border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.03))]" />
          <div className="absolute right-[18px] top-[18px] h-[82px] w-[52px] rounded-[18%_75%_14%_28%] border-l border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))]" />

          <motion.div
            className="absolute left-1/2 top-[30px] h-[40px] w-[14px] -translate-x-1/2 rounded-full border border-white/25 bg-[linear-gradient(180deg,#eeeeee,#a8adb7_45%,#171b22)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_0_16px_rgba(255,255,255,0.18)]"
            animate={{ y: active ? [0, -1.5, 0] : 0 }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />

          <div className="absolute bottom-[56px] left-1/2 h-[44px] w-[82px] -translate-x-1/2 rounded-[50%] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.12),rgba(0,0,0,0.05)_36%,rgba(0,0,0,0.42))]" />

          <motion.div
            className="absolute bottom-8 left-1/2 h-[3px] w-[92px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#ef4444,#f97316,#22c55e,#06b6d4,#8b5cf6)] shadow-[0_0_18px_rgba(255,255,255,0.35)]"
            animate={{
              opacity: active ? [0.55, 1, 0.55] : [0.28, 0.55, 0.28],
              scaleX: active ? [0.75, 1.1, 0.75] : [0.9, 1, 0.9],
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(255,255,255,0.30),transparent_18%)]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
        </div>

        <div className="absolute left-[82px] top-[211px] h-8 w-[80px] rounded-b-[28px] bg-[linear-gradient(180deg,#111827,#020617)] shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]" />

        {rgbDots.map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              background:
                index % 5 === 0
                  ? "#ef4444"
                  : index % 5 === 1
                    ? "#f97316"
                    : index % 5 === 2
                      ? "#22c55e"
                      : index % 5 === 3
                        ? "#06b6d4"
                        : "#8b5cf6",
              left: `${58 + ((index * 19) % 92)}px`,
              top: `${80 + ((index * 31) % 105)}px`,
              boxShadow: "0 0 12px currentColor",
            }}
            animate={
              active
                ? { opacity: [0, 0.9, 0], scale: [0.2, 1.15, 0.2], y: [0, -12, -22] }
                : { opacity: 0 }
            }
            transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.06 }}
=======
        rotateZ: active ? [-2, -1, -2] : -2,
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-9 h-12 w-[230px] rotate-[-8deg] rounded-full bg-black/45 blur-xl" />

      <div className="relative h-[250px] w-[250px] rotate-[-14deg]">
        <div className="absolute left-[54px] top-[52px] h-[180px] w-[128px] rounded-[58%_58%_45%_45%] bg-[#020617] shadow-[18px_22px_0_rgba(2,6,23,0.55)]" />

        <div className="absolute left-[45px] top-[35px] h-[182px] w-[142px] overflow-hidden rounded-[58%_58%_45%_45%] border border-blue-300/25 bg-[linear-gradient(145deg,#dbeafe_0%,#60a5fa_18%,#1d4ed8_48%,#0f172a_100%)] shadow-[0_28px_55px_rgba(0,0,0,0.45),inset_0_3px_0_rgba(255,255,255,0.35)]">
          <div className="absolute inset-[10px] rounded-[55%_55%_43%_43%] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(15,23,42,0.22)_35%,rgba(2,6,23,0.55))]" />

          <div className="absolute left-1/2 top-4 h-[68px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-slate-100/70 to-transparent" />

          <div className="absolute left-[17px] top-[22px] h-[72px] w-[50px] rounded-[70%_20%_26%_14%] border-r border-white/15 bg-white/10" />
          <div className="absolute right-[17px] top-[22px] h-[72px] w-[50px] rounded-[20%_70%_14%_26%] border-l border-white/15 bg-white/10" />

          <motion.div
            className="absolute left-1/2 top-[25px] h-[38px] w-[14px] -translate-x-1/2 rounded-full border border-blue-100/50 bg-[linear-gradient(180deg,#ffffff,#93c5fd,#2563eb)] shadow-[0_0_18px_rgba(96,165,250,0.8)]"
            animate={{
              opacity: active ? [0.55, 1, 0.55] : [0.35, 0.65, 0.35],
              y: active ? [0, -1, 0] : 0,
            }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />

          <motion.div
            className="absolute bottom-9 left-1/2 h-[3px] w-20 -translate-x-1/2 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
            animate={{
              opacity: active ? [0.25, 1, 0.25] : [0.2, 0.45, 0.2],
              scaleX: active ? [0.7, 1.1, 0.7] : [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.3, repeat: Infinity }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.38),transparent_18%)]" />

          {dust.map((_, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-stone-300/65"
              style={{
                width: `${2 + (index % 3)}px`,
                height: `${2 + (index % 3)}px`,
                left: `${14 + ((index * 23) % 72)}%`,
                top: `${20 + ((index * 31) % 64)}%`,
              }}
              animate={{
                opacity: active ? [0.7, 0.2, 0] : [0.25, 0.7, 0.25],
                y: active ? [0, -12, -24] : [0, 1, 0],
                scale: active ? [1, 0.55, 0.1] : [0.8, 1.15, 0.8],
              }}
              transition={{
                duration: active ? 1.15 : 2.4,
                repeat: Infinity,
                delay: index * 0.04,
              }}
            />
          ))}
        </div>

        <div className="absolute left-[83px] top-[211px] h-8 w-[70px] rounded-b-[26px] bg-[linear-gradient(180deg,#1d4ed8,#020617)]" />

        {lights.map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)]"
            style={{
              left: `${55 + ((index * 17) % 90)}px`,
              top: `${70 + ((index * 29) % 110)}px`,
            }}
            animate={
              active
                ? {
                    opacity: [0, 1, 0],
                    scale: [0.2, 1.2, 0.2],
                    y: [0, -16, -30],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.08,
            }}
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
          />
        ))}
      </div>
    </motion.div>
  )
}

function KeyboardVisual({ active }) {
  const keys = [
    "ESC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "BK",
    "TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "DEL",
    "CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", "ENTER",
    "SHIFT", "Z", "X", "C", "V", "B", "N", "M", "SHIFT",
    "CTRL", "WIN", "ALT", "SPACE", "ALT", "FN", "←", "↓", "→",
  ]

  return (
    <motion.div
      className="relative flex h-[310px] w-full items-center justify-center"
      initial={false}
      animate={{
        y: active ? [0, -5, 0] : [0, -2, 0],
<<<<<<< HEAD
        rotateZ: active ? [-5, -4.3, -5] : -5,
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-8 h-12 w-[390px] rotate-[-5deg] rounded-full bg-black/55 blur-xl" />

      <div className="relative w-[94%] max-w-[505px] rotate-[-5deg]">
        <div className="absolute left-6 top-7 h-[178px] w-full skew-x-[-9deg] rounded-[30px] bg-black/55 blur-[1px]" />

        <div className="relative skew-x-[-9deg] rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,#333942_0%,#171b22_38%,#07090d_78%,#020304_100%)] p-5 shadow-[0_30px_65px_rgba(0,0,0,0.58),inset_0_3px_0_rgba(255,255,255,0.16),inset_-20px_-20px_40px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-[10px] rounded-[24px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(0,0,0,0.34))]" />
          <div className="absolute left-7 right-7 top-4 h-2 rounded-full bg-[linear-gradient(90deg,#ef4444,#f59e0b,#22c55e,#06b6d4,#8b5cf6)] opacity-70 blur-[1px]" />

          <div className="relative z-10 grid grid-cols-12 gap-1.5 pt-2">
=======
        rotateZ: active ? [-4, -3.4, -4] : -4,
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-8 h-12 w-[360px] rotate-[-5deg] rounded-full bg-black/45 blur-xl" />

      <div className="relative w-[92%] max-w-[485px] rotate-[-5deg]">
        <div className="absolute left-5 top-7 h-[180px] w-full skew-x-[-10deg] rounded-[30px] bg-[#020617] shadow-[18px_18px_0_rgba(2,6,23,0.52)]" />

        <div className="relative skew-x-[-10deg] rounded-[30px] border border-blue-300/25 bg-[linear-gradient(145deg,#60a5fa_0%,#2563eb_28%,#1e3a8a_62%,#020617_100%)] p-5 shadow-[0_30px_65px_rgba(0,0,0,0.45),inset_0_3px_0_rgba(255,255,255,0.25)]">
          <div className="absolute inset-[10px] rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(15,23,42,0.38))]" />

          <div className="relative z-10 grid grid-cols-12 gap-1.5">
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
            {keys.map((key, index) => {
              const wide =
                key === "SPACE"
                  ? "col-span-4"
                  : key === "SHIFT" || key === "ENTER" || key === "CAPS"
                    ? "col-span-2"
                    : "col-span-1"

<<<<<<< HEAD
              const rgb =
                index % 6 === 0
                  ? "rgba(239,68,68,0.72)"
                  : index % 6 === 1
                    ? "rgba(245,158,11,0.72)"
                    : index % 6 === 2
                      ? "rgba(34,197,94,0.72)"
                      : index % 6 === 3
                        ? "rgba(6,182,212,0.72)"
                        : index % 6 === 4
                          ? "rgba(139,92,246,0.72)"
                          : "rgba(255,255,255,0.55)"

              return (
                <motion.div
                  key={`${key}-${index}`}
                  className={`${wide} flex h-8 items-center justify-center rounded-[9px] border border-white/8 bg-[linear-gradient(180deg,#20252d,#080a0f)] text-[8px] font-black text-zinc-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_0_rgba(0,0,0,0.46)]`}
                  animate={{
                    y: active && index % 7 === 0 ? [0, -3, 0] : 0,
                    boxShadow:
                      active && index % 5 === 0
                        ? [
                            "inset 0 1px 0 rgba(255,255,255,0.12),0 4px 0 rgba(0,0,0,0.46),0 0 0 rgba(255,255,255,0)",
                            `inset 0 1px 0 rgba(255,255,255,0.16),0 4px 0 rgba(0,0,0,0.46),0 0 18px ${rgb}`,
                            "inset 0 1px 0 rgba(255,255,255,0.12),0 4px 0 rgba(0,0,0,0.46),0 0 0 rgba(255,255,255,0)",
                          ]
                        : "inset 0 1px 0 rgba(255,255,255,0.12),0 4px 0 rgba(0,0,0,0.46)",
                  }}
                  transition={{ duration: 1.15, repeat: Infinity, delay: index * 0.022 }}
=======
              return (
                <motion.div
                  key={`${key}-${index}`}
                  className={`${wide} flex h-8 items-center justify-center rounded-[9px] border border-white/10 bg-[linear-gradient(180deg,#0f172a,#020617)] text-[8px] font-black text-blue-100/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_0_rgba(0,0,0,0.42)]`}
                  animate={{
                    y: active && index % 6 === 0 ? [0, -3, 0] : 0,
                    boxShadow:
                      active && index % 5 === 0
                        ? [
                            "inset 0 1px 0 rgba(255,255,255,0.14),0 4px 0 rgba(0,0,0,0.42),0 0 0 rgba(59,130,246,0)",
                            "inset 0 1px 0 rgba(255,255,255,0.18),0 4px 0 rgba(0,0,0,0.42),0 0 18px rgba(59,130,246,0.75)",
                            "inset 0 1px 0 rgba(255,255,255,0.14),0 4px 0 rgba(0,0,0,0.42),0 0 0 rgba(59,130,246,0)",
                          ]
                        : "inset 0 1px 0 rgba(255,255,255,0.14),0 4px 0 rgba(0,0,0,0.42)",
                    color: active && index % 5 === 0 ? ["#bfdbfe", "#67e8f9", "#bfdbfe"] : "#bfdbfe",
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: index * 0.025,
                  }}
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
                >
                  {key}
                </motion.div>
              )
            })}
          </div>

          <motion.div
<<<<<<< HEAD
            className="absolute inset-y-5 z-20 w-[80px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] blur-[1px]"
            animate={{ x: active ? [-90, 540] : -120, opacity: active ? [0, 0.9, 0] : 0 }}
            transition={{ duration: 1.35, repeat: active ? Infinity : 0, ease: "easeInOut" }}
=======
            className="absolute inset-y-4 z-20 w-[80px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.26),transparent)] blur-[1px]"
            animate={{
              x: active ? [-90, 520] : -120,
              opacity: active ? [0, 1, 0.7, 0] : 0,
            }}
            transition={{
              duration: 1.25,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
          />
        </div>
      </div>
    </motion.div>
  )
}

function MonitorVisual({ active }) {
<<<<<<< HEAD
  const pixels = useMemo(() => Array.from({ length: 18 }), [])
=======
  const stars = useMemo(() => Array.from({ length: 16 }), [])
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e

  return (
    <motion.div
      className="relative flex h-[310px] w-full items-center justify-center"
      initial={false}
<<<<<<< HEAD
      animate={{ y: active ? [0, -6, 0] : [0, -2, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-5 h-12 w-[340px] rounded-full bg-black/55 blur-xl" />

      <div className="relative">
        <div className="absolute left-5 top-6 h-[178px] w-[316px] rounded-[28px] bg-black/55 blur-[1px]" />

        <div className="relative h-[192px] w-[340px] overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,#3b414b,#141922_42%,#05070b)] p-3 shadow-[0_32px_70px_rgba(0,0,0,0.58),inset_0_2px_0_rgba(255,255,255,0.16),inset_-18px_-18px_34px_rgba(0,0,0,0.48)]">
          <div className="relative h-full overflow-hidden rounded-[22px] border border-black/60 bg-[#05070b]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(56,189,248,0.72),transparent_22%),radial-gradient(circle_at_78%_28%,rgba(168,85,247,0.60),transparent_25%),radial-gradient(circle_at_50%_78%,rgba(34,197,94,0.38),transparent_26%),linear-gradient(135deg,#050816_0%,#0b1225_48%,#111827_100%)]" />
            <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.40)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_8%,rgba(255,255,255,0.42),transparent_18%)]" />

            {pixels.map((_, index) => (
              <motion.span
                key={index}
                className="absolute rounded-full"
=======
      animate={{
        y: active ? [0, -6, 0] : [0, -2, 0],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute bottom-5 h-12 w-[320px] rounded-full bg-black/45 blur-xl" />

      <div className="relative">
        <div className="absolute left-5 top-6 h-[178px] w-[315px] rounded-[28px] bg-[#020617] shadow-[18px_18px_0_rgba(2,6,23,0.55)]" />

        <div className="relative h-[190px] w-[335px] overflow-hidden rounded-[30px] border border-blue-300/25 bg-[linear-gradient(145deg,#60a5fa,#1d4ed8_45%,#020617)] p-4 shadow-[0_32px_70px_rgba(0,0,0,0.48),inset_0_3px_0_rgba(255,255,255,0.26)]">
          <div className="relative h-full overflow-hidden rounded-[21px] border border-blue-300/15 bg-[#020617]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.44),transparent_44%),linear-gradient(135deg,rgba(14,165,233,0.20),transparent_42%)]" />

            <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:24px_24px]" />

            {stars.map((_, index) => (
              <motion.span
                key={index}
                className="absolute rounded-full bg-cyan-200/70"
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
                style={{
                  width: index % 4 === 0 ? "5px" : "2px",
                  height: index % 4 === 0 ? "5px" : "2px",
                  left: `${8 + ((index * 29) % 84)}%`,
                  top: `${10 + ((index * 37) % 76)}%`,
<<<<<<< HEAD
                  background:
                    index % 4 === 0
                      ? "rgba(255,255,255,0.80)"
                      : index % 4 === 1
                        ? "rgba(34,197,94,0.75)"
                        : index % 4 === 2
                          ? "rgba(6,182,212,0.75)"
                          : "rgba(168,85,247,0.75)",
                }}
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.25, 0.8] }}
                transition={{ duration: 1.8 + index * 0.04, repeat: Infinity, delay: index * 0.08 }}
=======
                }}
                animate={{
                  opacity: [0.2, 0.9, 0.2],
                  scale: [0.8, 1.25, 0.8],
                }}
                transition={{
                  duration: 1.8 + index * 0.04,
                  repeat: Infinity,
                  delay: index * 0.08,
                }}
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
              />
            ))}

            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/25 to-transparent"
<<<<<<< HEAD
              animate={{ x: active ? [-100, 365] : [-100, 245] }}
              transition={{ duration: active ? 1.45 : 4, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
              animate={{
                scale: active ? [0.75, 1.55, 0.75] : [1, 1.06, 1],
                opacity: active ? [0.10, 0.50, 0.10] : [0.07, 0.18, 0.07],
=======
              animate={{ x: active ? [-100, 360] : [-100, 240] }}
              transition={{
                duration: active ? 1.45 : 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <motion.div
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/35"
              animate={{
                scale: active ? [0.75, 1.55, 0.75] : [1, 1.06, 1],
                opacity: active ? [0.12, 0.55, 0.12] : [0.08, 0.2, 0.08],
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />

<<<<<<< HEAD
            <div className="absolute bottom-4 left-5 right-5 h-2 rounded-full bg-black/45">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ef4444,#f97316,#22c55e,#06b6d4,#8b5cf6)]"
                animate={{ width: active ? ["20%", "88%", "20%"] : ["30%", "54%", "30%"] }}
=======
            <div className="absolute bottom-4 left-5 right-5 h-2 rounded-full bg-blue-400/20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-500"
                animate={{ width: active ? ["20%", "86%", "20%"] : ["30%", "50%", "30%"] }}
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="mx-auto h-12 w-16 bg-[linear-gradient(180deg,#232a34,#090b10)] shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]" />
        <div className="mx-auto h-5 w-52 rounded-[100%] border border-white/10 bg-[linear-gradient(145deg,#3b414b,#080a0f)] shadow-[0_12px_25px_rgba(0,0,0,0.45)]" />
=======
        <div className="mx-auto h-11 w-14 bg-[linear-gradient(180deg,#1e40af,#020617)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />
        <div className="mx-auto h-5 w-48 rounded-[100%] border border-blue-300/20 bg-[linear-gradient(145deg,#2563eb,#020617)] shadow-[0_12px_25px_rgba(0,0,0,0.35)]" />
>>>>>>> 7a6c323f8bfa1d6be6c824dc99da66ca500ae14e
      </div>
    </motion.div>
  )
}

function DeviceVisual({ type, active }) {
  return (
    <div className="relative min-h-[350px] overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(59,130,246,0.20),transparent_45%),radial-gradient(circle_at_left,rgba(14,165,233,0.10),transparent_45%)]" />

      <ScanLines active={active} />

      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle,rgba(96,165,250,0.70)_1px,transparent_1.5px)] [background-size:46px_46px]" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[285px] w-[285px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10"
        animate={{
          rotate: 360,
          scale: active ? [0.9, 1.06, 0.9] : [0.96, 1, 0.96],
          opacity: active ? [0.28, 0.5, 0.28] : [0.14, 0.22, 0.14],
        }}
        transition={{
          rotate: { duration: 14, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.5, repeat: Infinity },
          opacity: { duration: 2.5, repeat: Infinity },
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          opacity: active ? [0.18, 0.45, 0.18] : [0.10, 0.2, 0.10],
          scale: active ? [0.9, 1.1, 0.9] : [1, 1.03, 1],
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.94, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.35 }}
          >
            {type === "keyboard" ? (
              <KeyboardVisual active={active} />
            ) : type === "monitor" ? (
              <MonitorVisual active={active} />
            ) : (
              <MouseVisual active={active} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-maxify-border bg-maxify-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <motion.span
            className={`h-2.5 w-2.5 rounded-full ${
              active ? "bg-emerald-400" : "bg-blue-400"
            }`}
            animate={{
              boxShadow: active
                ? [
                    "0 0 0 rgba(52,211,153,0)",
                    "0 0 18px rgba(52,211,153,0.9)",
                    "0 0 0 rgba(52,211,153,0)",
                  ]
                : "0 0 12px rgba(96,165,250,0.45)",
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />

          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-maxify-text-secondary">
            {active ? "Calibrado" : "Standby"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-blue-300">
          <Radar size={15} />
          <span className="text-[10px] font-black uppercase tracking-[0.20em]">
            Live Scan
          </span>
        </div>
      </div>
    </div>
  )
}

function getDeviceFields(devices, activeId, applied) {
  if (activeId === "keyboard") {
    return [
      {
        label: "Dispositivo",
        value: devices?.keyboard?.name,
        fallback: "Teclado não detectado",
        hint: "Nome real detectado pelo Windows",
      },
      {
        label: "Status",
        value: devices?.keyboard?.status,
        fallback: "Desconhecido",
        hint: "Estado do dispositivo",
      },
      {
        label: "Delay",
        value: applied.keyboard ? "0" : "Padrão",
        fallback: "Padrão",
        hint: "Atraso de repetição aplicado no Windows",
      },
      {
        label: "Speed",
        value: applied.keyboard ? "31" : "Auto",
        fallback: "Auto",
        hint: "Velocidade de repetição do Windows",
      },
    ]
  }

  if (activeId === "monitor") {
    return [
      {
        label: "Monitor",
        value: devices?.monitor?.name,
        fallback: "Monitor não detectado",
        hint: "Tela principal detectada",
      },
      {
        label: "Taxa",
        value: devices?.monitor?.refreshRate,
        fallback: "Hz não detectado",
        hint: "Frequência atual do monitor",
      },
      {
        label: "Resolução",
        value: devices?.monitor?.resolution,
        fallback: "Resolução não detectada",
        hint: "Modo ativo da tela",
      },
      {
        label: "GPU",
        value: devices?.monitor?.gpu,
        fallback: "GPU não detectada",
        hint: "Adaptador de vídeo ativo",
      },
    ]
  }

  return [
    {
      label: "Mouse",
      value: devices?.mouse?.name,
      fallback: "Mouse não detectado",
      hint: "Nome real detectado pelo Windows",
    },
    {
      label: "Status",
      value: devices?.mouse?.status,
      fallback: "Desconhecido",
      hint: "Estado do dispositivo",
    },
    {
      label: "Polling rate",
      value: devices?.mouse?.pollingRate || "Indisponível",
      fallback: "Indisponível",
      hint: "Windows normalmente não informa isso",
    },
    {
      label: "DPI",
      value: devices?.mouse?.dpi || "Indisponível",
      fallback: "Indisponível",
      hint: "DPI real depende do driver do mouse",
    },
  ]
}

export default function InputLagSystem() {
  const [devices, setDevices] = useState(null)
  const [loadingDevices, setLoadingDevices] = useState(true)

  const [applied, setApplied] = useState(() =>
    safeParse(localStorage.getItem(STORAGE_KEY), {})
  )

  const [activeId, setActiveId] = useState("mouse")
  const [runningId, setRunningId] = useState("")
  const [progress, setProgress] = useState(0)

  const activeModule = modules.find((item) => item.id === activeId) || modules[0]
  const activeApplied = Boolean(applied[activeId])
  const appliedCount = Object.values(applied).filter(Boolean).length
  const systemActive = appliedCount === modules.length
  const progressPercent = Math.round((appliedCount / modules.length) * 100)

  const fields = useMemo(
    () => getDeviceFields(devices, activeId, applied),
    [activeId, applied, devices]
  )

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true)

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: deviceInfoScript,
          name: "inputlag-device-info",
        },
      })

      if (!result?.success) {
        throw new Error(result?.error || "Falha ao detectar dispositivos.")
      }

      const parsedDevices = safeParse(result.output, null)

      if (!parsedDevices) {
        throw new Error("A leitura dos dispositivos veio vazia.")
      }

      setDevices(parsedDevices)
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(parsedDevices))
    } catch (error) {
      const cachedDevices = safeParse(
        localStorage.getItem(DEVICES_STORAGE_KEY),
        null
      )

      if (cachedDevices) {
        setDevices(cachedDevices)
        toast.info("Usando última leitura salva dos dispositivos.")
      } else {
        setDevices(null)
        toast.error(error.message || "Não foi possível carregar os dispositivos.")
      }
    } finally {
      setLoadingDevices(false)
    }
  }, [])

  const checkAppliedStates = useCallback(async () => {
    const states = {}

    await Promise.all(
      modules.map(async (item) => {
        try {
          const result = await invoke({
            channel: "run-powershell",
            payload: {
              script: item.checkScript,
              name: `inputlag-check-${item.id}`,
            },
          })

          states[item.id] =
            result?.success && result.output.trim().toLowerCase() === "true"
        } catch {
          states[item.id] = false
        }
      })
    )

    setApplied(states)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  }, [])

  useEffect(() => {
    const cachedDevices = safeParse(
      localStorage.getItem(DEVICES_STORAGE_KEY),
      null
    )

    if (cachedDevices) {
      setDevices(cachedDevices)
    }

    loadDevices()
    checkAppliedStates()
  }, [loadDevices, checkAppliedStates])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applied))
  }, [applied])

  async function runAction(item, mode = "apply") {
    setRunningId(item.id)

    try {
      const result = await invoke({
        channel: "run-powershell",
        payload: {
          script: mode === "apply" ? item.applyScript : item.restoreScript,
          name: `inputlag-${mode}-${item.id}`,
        },
      })

      if (!result?.success) {
        throw new Error(result?.error || "Falha ao executar otimização.")
      }

      setApplied((prev) => ({ ...prev, [item.id]: mode === "apply" }))

      toast.success(
        mode === "apply"
          ? `${item.label} otimizado com sucesso.`
          : `${item.label} revertido com sucesso.`
      )
    } catch (error) {
      toast.error(error.message || `Falha em ${item.label}.`)
    } finally {
      setRunningId("")
    }
  }

  async function applyAll() {
    setProgress(0)

    for (let index = 0; index < modules.length; index += 1) {
      await runAction(modules[index], "apply")
      setProgress(Math.round(((index + 1) / modules.length) * 100))
    }

    toast.success("Sistema de input lag aplicado por completo.")
  }

  async function restoreAll() {
    setProgress(0)

    for (let index = 0; index < modules.length; index += 1) {
      await runAction(modules[index], "restore")
      setProgress(Math.round(((index + 1) / modules.length) * 100))
    }

    toast.info("Sistema de input lag revertido.")
  }

  return (
    <RootDiv>
      <div className="mx-auto max-w-[1920px] px-6 pb-16">
        <section className="relative mt-8 min-h-[calc(100vh-120px)] overflow-hidden rounded-[30px] border border-maxify-border bg-maxify-card p-7 text-maxify-text shadow-xl shadow-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(14,165,233,0.10),transparent_25%),radial-gradient(circle_at_70%_88%,rgba(37,99,235,0.08),transparent_28%)]" />

          <FloatingParticles />

          {(runningId || progress > 0) && progress < 100 && (
            <div className="absolute inset-x-0 top-0 z-20">
              <motion.div
                className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                style={{ width: `${progress || 35}%` }}
                layout
              />
            </div>
          )}

          <div className="relative z-10">
            <header className="mb-8 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-start">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />

                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-300">
                      Maxify input laboratory
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-yellow-300 shadow-lg shadow-yellow-500/5">
                    <FlaskConical size={14} />
                    Beta
                  </div>
                </div>

                <h1 className="text-4xl font-black uppercase tracking-tight text-maxify-text md:text-5xl">
                  Input Lag
                  <span className="ml-3 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    System
                  </span>
                </h1>

                <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-maxify-text-secondary">
                  Central de resposta para mouse, teclado e monitor com leitura
                  local dos dispositivos, visualização animada e aplicação rápida
                  dos ajustes de baixa latência.
                </p>

                <div className="mt-5 max-w-3xl">
                  <BetaWarning />
                </div>
              </motion.div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="rounded-[24px] border border-maxify-border bg-maxify-card p-1.5 shadow-sm">
                  <div className="flex gap-1">
                    {modules.map((item) => {
                      const Icon = item.icon
                      const active = activeId === item.id

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveId(item.id)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative flex min-h-[50px] min-w-[125px] items-center justify-center gap-2 overflow-hidden rounded-[19px] px-4 text-xs font-black uppercase tracking-wide transition ${
                            active
                              ? "text-white shadow-lg shadow-blue-500/15"
                              : "text-maxify-text-secondary hover:bg-blue-500/10 hover:text-blue-300"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="moduleActivePill"
                              className="absolute inset-0 rounded-[19px] bg-blue-500"
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 34,
                              }}
                            />
                          )}

                          <span className="relative z-10">
                            <Icon size={15} />
                          </span>
                          <span className="relative z-10">{item.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={loadDevices}
                  disabled={loadingDevices || Boolean(runningId)}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex min-h-[54px] items-center gap-3 rounded-[22px] border border-blue-500/20 bg-blue-500/10 px-6 text-sm font-black uppercase tracking-wide text-blue-300 transition hover:bg-blue-500/15 disabled:opacity-60"
                >
                  <Activity
                    size={17}
                    className={loadingDevices ? "animate-pulse" : ""}
                  />
                  {loadingDevices ? "Detectando..." : "Atualizar leitura"}
                </motion.button>
              </motion.div>
            </header>

            <div className="grid gap-7 xl:grid-cols-[430px_1fr]">
              <motion.aside
                className="rounded-[30px] border border-maxify-border bg-maxify-card p-5 shadow-lg shadow-black/5"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <DeviceVisual
                  type={activeModule.type}
                  active={activeApplied || runningId === activeId}
                />

                <div className="mt-5 rounded-[26px] border border-maxify-border bg-maxify-card p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-300">
                        Device modules
                      </p>

                      <p className="mt-1 text-xs font-bold text-maxify-text-secondary">
                        Escolha o equipamento
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300">
                      <Gauge size={18} />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {modules.map((item, index) => {
                      const Icon = item.icon
                      const active = activeId === item.id
                      const isApplied = Boolean(applied[item.id])

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveId(item.id)}
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.32,
                            delay: 0.2 + index * 0.05,
                          }}
                          className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-blue-500/35 bg-blue-500/10"
                              : "border-maxify-border bg-maxify-card hover:border-blue-500/20"
                          }`}
                        >
                          {active && (
                            <motion.div
                              className="absolute inset-y-0 left-0 w-1 bg-blue-400"
                              layoutId="sideActiveLine"
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between">
                            <span className="flex items-center gap-3">
                              <span
                                className={`rounded-2xl border p-2 ${
                                  active
                                    ? "border-blue-500/25 bg-blue-500/15 text-blue-300"
                                    : "border-maxify-border bg-maxify-card text-maxify-text-secondary"
                                }`}
                              >
                                <Icon size={17} />
                              </span>

                              <span>
                                <span className="block text-sm font-black text-maxify-text">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-maxify-text-secondary">
                                  {isApplied ? "otimizado" : "aguardando"}
                                </span>
                              </span>
                            </span>

                            <span
                              className={
                                isApplied
                                  ? "text-emerald-400"
                                  : active
                                    ? "text-blue-300"
                                    : "text-maxify-text-secondary"
                              }
                            >
                              {isApplied ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <Activity size={17} />
                              )}
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.aside>

              <motion.main
                className="rounded-[30px] border border-maxify-border bg-maxify-card p-6 shadow-lg shadow-black/5"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-4 text-blue-300 shadow-lg shadow-blue-500/10"
                      animate={{
                        rotate: runningId === activeId ? 360 : 0,
                        scale: activeApplied ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        rotate: {
                          duration: 1.5,
                          repeat: runningId === activeId ? Infinity : 0,
                          ease: "linear",
                        },
                        scale: { duration: 1.5, repeat: Infinity },
                      }}
                    >
                      <ShieldCheck size={24} />
                    </motion.div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.34em] text-blue-300">
                        Input reduct engine
                      </p>

                      <h2 className="mt-2 text-2xl font-black uppercase tracking-wide text-maxify-text">
                        {activeModule.title}
                      </h2>

                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-maxify-text-secondary">
                        {activeModule.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => runAction(activeModule, "apply")}
                      disabled={Boolean(runningId)}
                      className="min-h-[48px] justify-center gap-2 rounded-2xl px-7 text-sm font-black uppercase tracking-wide"
                    >
                      {runningId === activeId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Zap size={16} />
                      )}
                      Input reduct
                    </Button>

                    <button
                      type="button"
                      onClick={() =>
                        activeApplied
                          ? runAction(activeModule, "restore")
                          : runAction(activeModule, "apply")
                      }
                      disabled={Boolean(runningId)}
                      className={`flex min-h-[48px] min-w-[160px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-black uppercase tracking-wide transition ${
                        activeApplied
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-maxify-border bg-maxify-card text-maxify-text-secondary hover:border-blue-500/25 hover:text-blue-300"
                      }`}
                    >
                      {runningId === activeId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : activeApplied ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Power size={16} />
                      )}

                      {activeApplied ? "Ativado" : "Ativar"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-4">
                  {[
                    {
                      label: "Sistema",
                      value: systemActive ? "Full" : "Parcial",
                      icon: Cpu,
                    },
                    {
                      label: "Módulos",
                      value: `${appliedCount}/${modules.length}`,
                      icon: Sparkles,
                    },
                    {
                      label: "Leitura",
                      value: loadingDevices ? "Scan" : "Online",
                      icon: Radar,
                    },
                    {
                      label: "Perfil",
                      value: activeApplied ? "Low" : "Stock",
                      icon: Waves,
                    },
                  ].map((item, index) => {
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.label}
                        className="rounded-[24px] border border-maxify-border bg-maxify-card p-4 transition-all hover:border-blue-500/20"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.25 + index * 0.05,
                        }}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-maxify-text-secondary">
                            {item.label}
                          </p>

                          <Icon size={16} className="text-blue-300" />
                        </div>

                        <p className="text-2xl font-black uppercase text-maxify-text">
                          {item.value}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-[28px] border border-maxify-border bg-maxify-card p-5">
                  <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.30em] text-maxify-text-secondary">
                        Dados detectados
                      </p>

                      <p className="mt-2 text-sm font-medium text-maxify-text-secondary">
                        Informações lidas direto do Windows ou salvas no último
                        scan.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                      {loadingDevices ? "Escaneando" : "Leitura pronta"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                      {fields.map((item, index) => (
                        <motion.div
                          key={`${activeId}-${item.label}`}
                          layout
                          initial={{
                            opacity: 0,
                            y: 16,
                            scale: 0.96,
                            filter: "blur(8px)",
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                          }}
                          exit={{
                            opacity: 0,
                            y: -12,
                            scale: 0.96,
                            filter: "blur(8px)",
                          }}
                          transition={{
                            duration: 0.32,
                            delay: index * 0.04,
                          }}
                          className="group relative overflow-hidden rounded-[24px] border border-maxify-border bg-maxify-card p-5 transition-all hover:border-blue-500/20"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-300/0 via-blue-400/60 to-blue-300/0 opacity-0 transition group-hover:opacity-100" />

                          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-maxify-text-secondary">
                            {item.label}
                          </p>

                          <p className="mt-3 truncate text-xl font-black text-maxify-text">
                            {loadingDevices
                              ? "Detectando..."
                              : displayValue(item.value, item.fallback)}
                          </p>

                          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-maxify-text-secondary/70">
                            {item.hint}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="rounded-[26px] border border-blue-500/20 bg-blue-500/10 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <span className="block text-sm font-black uppercase tracking-[0.20em] text-maxify-text">
                          Sistema completo
                        </span>

                        <span className="mt-1 block text-xs font-medium text-maxify-text-secondary">
                          Progresso dos módulos aplicados
                        </span>
                      </div>

                      <motion.span
                        className="text-3xl font-black text-blue-300"
                        animate={{ scale: runningId ? [1, 1.08, 1] : 1 }}
                        transition={{
                          duration: 0.8,
                          repeat: runningId ? Infinity : 0,
                        }}
                      >
                        {progressPercent}%
                      </motion.span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-maxify-border p-[2px]">
                      <motion.div
                        className="h-full rounded-full bg-blue-500"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.45 }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={restoreAll}
                      variant="outline"
                      disabled={Boolean(runningId) || appliedCount === 0}
                      className="min-h-[46px] justify-center gap-2 rounded-2xl"
                    >
                      <RotateCcw size={16} />
                      Reverter tudo
                    </Button>

                    <Button
                      onClick={applyAll}
                      disabled={Boolean(runningId)}
                      className="min-h-[46px] justify-center gap-2 rounded-2xl"
                    >
                      {runningId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      Aplicar tudo
                    </Button>
                  </div>
                </div>

                <motion.div
                  className="mt-5 rounded-[24px] border border-maxify-border bg-maxify-card p-4"
                  animate={{
                    borderColor: systemActive
                      ? "rgba(16,185,129,0.35)"
                      : "rgba(59,130,246,0.12)",
                  }}
                >
                  <p className="text-sm leading-relaxed text-maxify-text-secondary">
                    {systemActive
                      ? "Mouse, teclado e monitor estão calibrados no perfil de baixa latência. O sistema está pronto para jogo competitivo."
                      : "Escolha um módulo acima ou aplique tudo para reduzir atrasos de entrada sem trocar drivers ou firmware."}
                  </p>
                </motion.div>
              </motion.main>
            </div>
          </div>
        </section>
      </div>
    </RootDiv>
  )
}