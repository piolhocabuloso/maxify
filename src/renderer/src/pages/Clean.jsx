import { useState, useEffect, useRef, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import RootDiv from "@/components/rootdiv"
import { invoke } from "@/lib/electron"
import {
  RefreshCw,
  Trash2,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  HardDrive,
  Shield,
  Database,
  Clock,
  XCircle,
  Sparkles,
  ChevronRight,
  Activity,
  Search,
  SlidersHorizontal,
  Layers3,
  Zap,
  Cpu,
  Eraser,
  ScanLine,
  Gauge,
  TerminalSquare,
  CircleDot,
  Check,
  Play,
} from "lucide-react"
import { notify as toast } from "../lib/notify"
import log from "electron-log/renderer"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/button"
import Toggle from "@/components/ui/toggle"
import CleanIcon from "../../../../resources/maxifylogo.png"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { cleanupIconMap, categoryIconMap } from "@/utils/cleanupIcons"

const BackgroundGlow = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(59,130,246,0.25),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_45%_105%,rgba(37,99,235,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.30)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.035)_45%,transparent_70%)]" />
    </>
  )
}

const SectionTitle = ({ icon: Icon, label, title, children }) => {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5 shadow-lg shadow-blue-500/10">
          <Icon className="h-5 w-5 text-blue-300" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
            {label}
          </p>
          <h2 className="text-lg font-black text-maxify-text">{title}</h2>
        </div>

        <div className="hidden h-px min-w-[120px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent lg:block" />
      </div>

      {children}
    </div>
  )
}

const MiniStat = ({ icon: Icon, label, value, active }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border p-4 transition-all ${active
          ? "border-blue-500/35 bg-blue-500/15 shadow-lg shadow-blue-500/10"
          : "border-maxify-border bg-maxify-bg/30"
        }`}
    >
      {active && (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_55%)]"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 flex items-center gap-3">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
          <Icon size={17} className="text-blue-300" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold text-maxify-text-secondary">{label}</p>
          <p className="truncate text-lg font-black text-maxify-text">{value}</p>
        </div>
      </div>
    </div>
  )
}

function CleaningDisk({ estaLimpando, espacoLiberado, selecionados, totalRotinas }) {
  const cleanLevel =
    totalRotinas > 0
      ? Math.min(100, Math.round((Object.keys(espacoLiberado || {}).length / totalRotinas) * 100))
      : 0

  const status = estaLimpando ? "Limpando" : cleanLevel > 0 ? "Disco limpo" : "Disco sujo"

  const isClean = cleanLevel > 0
  const dust = useMemo(() => Array.from({ length: 52 }), [])
  const stars = useMemo(() => Array.from({ length: 26 }), [])
  const particles = useMemo(() => Array.from({ length: 18 }), [])

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
      <BackgroundGlow />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative z-10 flex h-full min-h-[382px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-blue-300">
              Maxify Cleaner Drive
            </p>

            <h2 className="mt-2 text-3xl font-black text-maxify-text">
              Disco do sistema
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-maxify-text-secondary">
              Visual isométrico de HD com sujeira, scanner e animação de limpeza em tempo real.
            </p>
          </div>

          <div
            className={`rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] ${estaLimpando
                ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                : isClean
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-yellow-500/25 bg-yellow-500/10 text-yellow-300"
              }`}
          >
            {status}
          </div>
        </div>

        <div className="relative mx-auto mt-2 flex h-[322px] w-full max-w-[440px] items-center justify-center overflow-visible">
          {stars.map((_, index) => (
            <motion.span
              key={index}
              className="absolute bg-white/60"
              style={{
                width: index % 5 === 0 ? "8px" : index % 3 === 0 ? "4px" : "2px",
                height: index % 5 === 0 ? "8px" : index % 3 === 0 ? "4px" : "2px",
                left: `${4 + ((index * 29) % 92)}%`,
                top: `${5 + ((index * 41) % 88)}%`,
                borderRadius: index % 5 === 0 ? "0px" : "999px",
                clipPath:
                  index % 5 === 0
                    ? "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)"
                    : "none",
              }}
              animate={{
                opacity: [0.18, 0.75, 0.18],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + (index % 4) * 0.4,
                repeat: Infinity,
                delay: index * 0.08,
              }}
            />
          ))}

          <motion.div
            className="absolute bottom-[22px] h-[48px] w-[330px] rotate-[-12deg] rounded-full bg-black/45 blur-xl"
            animate={{
              opacity: estaLimpando ? [0.28, 0.52, 0.28] : 0.34,
              scaleX: estaLimpando ? [0.88, 1.08, 0.88] : 1,
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />

          <motion.div
            className="relative h-[292px] w-[370px]"
            animate={{
              y: estaLimpando ? [0, -5, 0] : [0, -2, 0],
              scale: estaLimpando ? [1, 1.012, 1] : 1,
            }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute left-[24px] top-[14px] h-[225px] w-[280px] rotate-[-14deg] scale-[1.13]">
              {/* sombra base */}
              <div className="absolute left-[22px] top-[39px] h-[218px] w-[256px] skew-x-[-14deg] rounded-[28px] bg-[#06113f] shadow-[18px_18px_0_rgba(3,7,18,0.52)]" />

              {/* parte traseira melhorada */}
              <div className="absolute left-[13px] top-[27px] h-[220px] w-[268px] skew-x-[-14deg] rounded-[30px] bg-[linear-gradient(145deg,#0f2a76_0%,#10215f_42%,#07133a_75%,#020617_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.12),inset_-10px_-12px_24px_rgba(0,0,0,0.35)]" />

              <div className="absolute left-[20px] top-[34px] h-[194px] w-[252px] skew-x-[-14deg] rounded-[25px] border border-blue-300/10 bg-[radial-gradient(circle_at_24%_18%,rgba(96,165,250,0.22),transparent_30%),linear-gradient(145deg,rgba(30,64,175,0.78),rgba(15,23,42,0.92))]" />

              {/* detalhes de circuito na traseira */}
              <div className="absolute left-[48px] top-[52px] z-10 h-[2px] w-[72px] skew-x-[-14deg] rounded-full bg-blue-300/20" />
              <div className="absolute left-[63px] top-[66px] z-10 h-[2px] w-[52px] skew-x-[-14deg] rounded-full bg-cyan-300/18" />
              <div className="absolute left-[46px] top-[80px] z-10 h-[2px] w-[38px] skew-x-[-14deg] rounded-full bg-blue-300/16" />

              <div className="absolute right-[48px] top-[146px] z-10 h-[2px] w-[62px] skew-x-[-14deg] rounded-full bg-blue-300/18" />
              <div className="absolute right-[68px] top-[160px] z-10 h-[2px] w-[44px] skew-x-[-14deg] rounded-full bg-cyan-300/16" />

              {[0, 1, 2, 3].map((item) => (
                <span
                  key={item}
                  className="absolute z-10 h-2 w-2 rounded-full border border-blue-200/25 bg-blue-400/20 shadow-[0_0_8px_rgba(96,165,250,0.25)]"
                  style={{
                    left: `${95 + item * 22}px`,
                    top: "42px",
                  }}
                />
              ))}

              {/* base principal azul */}
              <div className="absolute left-[2px] top-[12px] h-[218px] w-[268px] skew-x-[-14deg] rounded-[28px] border border-blue-200/30 bg-[linear-gradient(145deg,#93c5fd_0%,#3b82f6_28%,#1d4ed8_62%,#172554_100%)] shadow-[inset_0_3px_0_rgba(255,255,255,0.28),0_20px_45px_rgba(0,0,0,0.38)]" />

              {/* recorte interno azul escuro */}
              <div className="absolute left-[21px] top-[30px] h-[174px] w-[226px] skew-x-[-14deg] rounded-[22px] bg-[linear-gradient(145deg,#111f61,#07163f_70%,#020617)] shadow-[inset_0_0_26px_rgba(0,0,0,0.55)]" />

              {/* lateral frontal com profundidade */}
              <div className="absolute left-[2px] top-[168px] h-[60px] w-[268px] skew-x-[-14deg] rounded-b-[26px] bg-[linear-gradient(180deg,rgba(37,99,235,0.25),rgba(15,23,42,0.58))]" />
              <div className="absolute left-[16px] top-[188px] h-[42px] w-[34px] skew-x-[-14deg] rounded-bl-[22px] bg-[linear-gradient(180deg,#60a5fa,#1e3a8a)] opacity-70" />
              <div className="absolute right-[18px] top-[186px] h-[45px] w-[32px] skew-x-[-14deg] rounded-br-[22px] bg-[linear-gradient(180deg,#1e40af,#0f172a)] opacity-80" />

              <div className="absolute left-[20px] top-[208px] h-[14px] w-[44px] skew-x-[-14deg] rounded-t-md bg-[#172554]" />
              <div className="absolute left-[106px] top-[213px] h-[12px] w-[32px] skew-x-[-14deg] rounded-t-md bg-[#172554]" />

              {/* pinos laterais */}
              {[0, 1, 2, 3, 4].map((item) => (
                <span
                  key={item}
                  className="absolute right-[15px] h-2.5 w-2.5 rounded-full bg-[#07163f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.24)]"
                  style={{ top: `${58 + item * 29}px` }}
                />
              ))}

              {/* placa laranja direita */}
              <div className="absolute right-[32px] top-[38px] z-20 h-[86px] w-[116px] skew-x-[-14deg] rounded-[18px] border border-orange-200/30 bg-[linear-gradient(145deg,#fb923c,#f97316_55%,#c2410c)] shadow-[0_7px_0_rgba(124,45,18,0.7),inset_0_2px_0_rgba(255,255,255,0.22)]">
                {[0, 1, 2, 3, 4].map((item) => (
                  <span
                    key={item}
                    className="absolute h-2 w-2 rounded-full bg-orange-900/35"
                    style={{
                      left: `${20 + (item % 3) * 32}px`,
                      top: `${18 + Math.floor(item / 3) * 34}px`,
                    }}
                  />
                ))}
              </div>

              {/* blocos laranja superiores */}
              <div className="absolute left-[76px] top-[39px] z-20 h-[24px] w-[72px] skew-x-[-14deg] rounded-md bg-[linear-gradient(145deg,#fb923c,#ea580c)] shadow-[0_6px_0_rgba(124,45,18,0.65)]" />
              <div className="absolute left-[66px] top-[64px] z-20 h-[25px] w-[82px] skew-x-[-14deg] rounded-md bg-[linear-gradient(145deg,#f97316,#c2410c)] shadow-[0_5px_0_rgba(124,45,18,0.65)]" />
              <div className="absolute left-[112px] top-[91px] z-20 h-[18px] w-[57px] skew-x-[-14deg] rounded-md bg-[linear-gradient(145deg,#fb923c,#ea580c)]" />

              {/* aro laranja atrás do prato */}
              <div className="absolute left-[154px] top-[98px] z-20 h-[125px] w-[58px] rounded-r-full bg-[linear-gradient(180deg,#fb923c,#ea580c,#9a3412)] shadow-[6px_8px_0_rgba(15,23,42,0.3)]" />

              {/* prato branco grande */}
              <div className="absolute left-[22px] top-[82px] z-30 h-[154px] w-[188px]">
                <div className="absolute inset-[6px] rounded-full bg-black/28 blur-md" />
                <div className="absolute inset-0 rounded-full border border-slate-200/45 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_58%,rgba(15,23,42,0.18)_100%)] shadow-[0_11px_0_rgba(15,23,42,0.52),0_18px_28px_rgba(0,0,0,0.36)]" />

                <motion.div
                  className="absolute inset-[7px] rounded-full border border-slate-100/75 bg-[radial-gradient(circle_at_34%_30%,#ffffff_0%,#f8fafc_34%,#eef2f7_62%,#cbd5e1_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.88),inset_0_-10px_18px_rgba(148,163,184,0.32)]"
                  animate={{ rotate: estaLimpando ? 360 : 18 }}
                  transition={{
                    duration: estaLimpando ? 1.35 : 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="absolute inset-[16px] rounded-full border border-slate-200/35" />
                  <div className="absolute inset-[28px] rounded-full border border-slate-300/20" />
                  <div className="absolute left-[22px] top-[18px] h-[38px] w-[76px] rounded-full bg-white/30 blur-[10px]" />

                  <div className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-[radial-gradient(circle,#ffffff,#dbe3ea_70%,#94a3b8)] shadow-[inset_0_2px_0_rgba(255,255,255,0.8),0_5px_10px_rgba(0,0,0,0.18)]">
                    <div className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-400 bg-white" />

                    {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
                      <span
                        key={item}
                        className="absolute h-2 w-2 rounded-full bg-slate-400/55"
                        style={{
                          left: `${26 + Math.cos((item / 8) * Math.PI * 2) * 18}px`,
                          top: `${26 + Math.sin((item / 8) * Math.PI * 2) * 18}px`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* braço leitor */}
              <motion.div
                className="absolute right-[55px] top-[90px] z-50 h-[27px] w-[122px] origin-right rounded-full bg-[linear-gradient(180deg,#ffffff,#dbeafe_48%,#94a3b8)] shadow-[0_6px_10px_rgba(15,23,42,0.35),inset_0_2px_0_rgba(255,255,255,0.9)]"
                animate={{
                  rotate: estaLimpando ? [3, -14, 5, -9, 3] : [3, 7, 3],
                }}
                transition={{
                  duration: estaLimpando ? 1.3 : 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute -left-[18px] top-[9px] h-[7px] w-[78px] rounded-full bg-[linear-gradient(90deg,#f8fafc,#cbd5e1,#94a3b8)]" />
                <div className="absolute -left-[33px] top-[12px] h-[4px] w-[37px] rounded-full bg-slate-500" />

                <div className="absolute -right-[17px] top-1/2 h-[50px] w-[50px] -translate-y-1/2 rounded-full border border-slate-300 bg-[radial-gradient(circle,#ffffff_0%,#dbeafe_55%,#64748b_100%)] shadow-[0_5px_14px_rgba(0,0,0,0.28)]">
                  <div className="absolute left-1/2 top-1/2 h-[21px] w-[21px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-400 bg-white" />
                </div>
              </motion.div>

              {/* parafusos */}
              {[
                ["31px", "34px"],
                ["231px", "36px"],
                ["32px", "190px"],
                ["225px", "196px"],
                ["154px", "42px"],
                ["244px", "113px"],
              ].map(([left, top], index) => (
                <div
                  key={index}
                  className="absolute z-[60] h-4 w-4 rounded-full border border-slate-100/70 bg-[radial-gradient(circle,#f8fafc,#94a3b8_60%,#475569)] shadow-[0_2px_5px_rgba(0,0,0,0.32)]"
                  style={{ left, top }}
                >
                  <div className="absolute left-1/2 top-1/2 h-[2px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-slate-600" />
                </div>
              ))}

              {/* brilhos */}
              <div className="absolute left-[2px] top-[202px] z-[70] h-3 w-3 rotate-45 bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <div className="absolute right-[20px] top-[28px] z-[70] h-2 w-2 rotate-45 bg-white/60" />

              {/* camada de sujeira */}
              <motion.div
                className="absolute left-[2px] top-[12px] z-[80] h-[218px] w-[268px] skew-x-[-14deg] rounded-[28px] bg-[radial-gradient(circle_at_25%_38%,rgba(120,113,108,0.55),transparent_18%),radial-gradient(circle_at_70%_42%,rgba(87,83,78,0.48),transparent_17%),radial-gradient(circle_at_45%_72%,rgba(68,64,60,0.52),transparent_22%),linear-gradient(125deg,rgba(120,113,108,0.12),transparent_50%,rgba(68,64,60,0.18))]"
                animate={{
                  opacity: estaLimpando ? 0.16 : isClean ? 0.02 : 0.68,
                }}
                transition={{ duration: 0.8 }}
              />

              {/* scanner azul */}
              <motion.div
                className="absolute top-[12px] z-[90] h-[218px] w-[86px] skew-x-[-14deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.36),rgba(59,130,246,0.24),transparent)] blur-[1px]"
                animate={{
                  x: estaLimpando ? [-100, 305] : -130,
                  opacity: estaLimpando ? [0, 1, 0.82, 0] : 0,
                }}
                transition={{
                  duration: 1.08,
                  repeat: estaLimpando ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* poeira */}
              {dust.map((_, index) => (
                <motion.span
                  key={index}
                  className="absolute z-[100] rounded-full bg-stone-300/75 shadow-[0_0_8px_rgba(120,113,108,0.35)]"
                  style={{
                    width: `${2 + (index % 4)}px`,
                    height: `${2 + (index % 4)}px`,
                    left: `${8 + ((index * 19) % 82)}%`,
                    top: `${10 + ((index * 31) % 74)}%`,
                  }}
                  animate={{
                    opacity: estaLimpando
                      ? [0.72, 0.25, 0]
                      : isClean
                        ? 0
                        : [0.28, 0.82, 0.28],
                    scale: estaLimpando ? [1, 0.58, 0.12] : [0.8, 1.14, 0.8],
                    y: estaLimpando ? [0, -12, -28] : [0, 1, 0],
                    x: estaLimpando ? [0, Math.sin(index) * 18] : 0,
                  }}
                  transition={{
                    duration: estaLimpando ? 1.15 : 2.5,
                    repeat: Infinity,
                    delay: index * 0.025,
                  }}
                />
              ))}

              {/* partículas de limpeza */}
              {particles.map((_, index) => (
                <motion.span
                  key={index}
                  className="absolute z-[110] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)]"
                  style={{
                    left: `${15 + ((index * 29) % 68)}%`,
                    top: `${18 + ((index * 23) % 58)}%`,
                  }}
                  animate={
                    estaLimpando
                      ? {
                        opacity: [0, 1, 0],
                        scale: [0.2, 1.15, 0.15],
                        y: [0, -18, -36],
                      }
                      : { opacity: 0 }
                  }
                  transition={{
                    duration: 1.05,
                    repeat: Infinity,
                    delay: index * 0.055,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            className="absolute right-2 top-2 rounded-[22px] border border-blue-500/25 bg-[#07111f]/85 p-3 backdrop-blur-xl shadow-xl shadow-black/20"
            animate={{ y: estaLimpando ? [0, -8, 0] : [0, -4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {estaLimpando ? (
              <RefreshCw className="animate-spin text-blue-300" size={28} />
            ) : isClean ? (
              <CheckCircle2 className="text-cyan-300" size={30} />
            ) : (
              <Trash2 className="text-yellow-300" size={28} />
            )}
          </motion.div>

          <motion.div
            className="absolute left-2 bottom-4 rounded-[22px] border border-maxify-border bg-maxify-card/80 px-4 py-3 backdrop-blur-xl"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
              Selecionadas
            </p>
            <p className="text-2xl font-black text-maxify-text">{selecionados}</p>
          </motion.div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat icon={ScanLine} label="Estado" value={status} active={estaLimpando} />
          <MiniStat icon={Layers3} label="Rotinas" value={totalRotinas} />
          <MiniStat icon={Shield} label="Modo" value="Seguro" />
        </div>
      </div>
    </div>
  )
}

function ExecutionConsole({ logs, estaLimpando }) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-maxify-border bg-[#050914]/80 p-0 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
            <TerminalSquare size={18} className="text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-black text-maxify-text">Console de execução</h3>
            <p className="text-xs text-maxify-text-secondary">Logs em tempo real das rotinas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
          <CircleDot size={12} className={estaLimpando ? "animate-pulse" : ""} />
          {estaLimpando ? "Rodando" : "Pronto"}
        </div>
      </div>

      <div className="max-h-[520px] min-h-[220px] overflow-y-auto p-4 font-mono text-xs">
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.slice(-30).map((item, index) => (
              <div key={index} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2">
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${item.type === "success"
                      ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.75)]"
                      : item.type === "error"
                        ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.65)]"
                        : "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.65)]"
                    }`}
                />
                <p className="leading-5 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[180px] flex-col items-center justify-center text-center">
            <TerminalSquare size={38} className="mb-3 text-blue-300/70" />
            <p className="font-sans text-sm font-bold text-maxify-text">Nenhum log ainda</p>
            <p className="mt-1 font-sans text-xs text-maxify-text-secondary">
              Ao executar uma limpeza, os detalhes aparecem aqui.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

function Limpeza() {
  const [cleanups, setCleanups] = useState([])
  const [categories, setCategories] = useState([])
  const [buscaLimpeza, setBuscaLimpeza] = useState("")
  const [selecionados, setSelecionados] = useState([])
  const [filaCarregando, setFilaCarregando] = useState([])
  const [ultimaLimpeza, setUltimaLimpeza] = useState(
    localStorage.getItem("ultima-limpeza") || "Ainda não limpo."
  )
  const [estaLimpando, setEstaLimpando] = useState(false)
  const [resultados, setResultados] = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState("all")
  const [historicoLimpezas, setHistoricoLimpezas] = useState([])
  const [logsExecucao, setLogsExecucao] = useState([])

  const [estatisticas, setEstatisticas] = useState({
    totalLiberado: 0,
    totalExecucoes: 0,
    limpezasHoje: 0,
    autoCleansExecuted: 0,
    totalAutoCleanSpace: 0,
  })

  const [performanceData, setPerformanceData] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    async function loadModule() {
      const mod = await import("@/data/cleanups")

      setCleanups(mod.cleanups || [])
      const categoriasSemDuplicar = (mod.categories || []).filter(
        (categoria) => categoria.id !== "all"
      )

      setCategories([
        { id: "all", label: "Todas", icon: "sparkles" },
        ...categoriasSemDuplicar,
      ])
      setDataLoaded(true)
    }

    loadModule()
  }, [])

  useEffect(() => {
    const historico = JSON.parse(localStorage.getItem("maxify:historico-limpezas") || "[]")
    setHistoricoLimpezas(historico)

    const stats = JSON.parse(localStorage.getItem("maxify:estatisticas-limpeza") || "{}")
    setEstatisticas({
      totalLiberado: stats.totalLiberado || 0,
      totalExecucoes: stats.totalExecucoes || 0,
      limpezasHoje: stats.limpezasHoje || 0,
      autoCleansExecuted: stats.autoCleansExecuted || 0,
      totalAutoCleanSpace: stats.totalAutoCleanSpace || 0,
    })

    const resultadosAnteriores = JSON.parse(
      localStorage.getItem("maxify:resultados-limpeza") || "{}"
    )

    const resultadosSanitizados = Object.fromEntries(
      Object.entries(resultadosAnteriores)
        .map(([key, value]) => [key, normalizarBytes(value, { explicito: true })])
        .filter(([, value]) => value >= 0)
    )

    setResultados(resultadosSanitizados)
    localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(resultadosSanitizados))
  }, [])

  const addLog = (text, type = "info") => {
    const time = new Date().toLocaleTimeString()
    setLogsExecucao((prev) => [...prev, { text: `[${time}] ${text}`, type }].slice(-60))
  }

  const normalizarBytes = (valor, { explicito = false } = {}) => {
    const numero = Number(valor)

    if (!Number.isFinite(numero) || numero <= 0) return 0

    const bytes = Math.floor(numero)
    const limiteSeguro = 2 * 1024 * 1024 * 1024 * 1024

    if (bytes > limiteSeguro) return 0

    // Quando o script não manda uma marcação clara, valores muito pequenos
    // geralmente são contadores/status do PowerShell, não espaço real liberado.
    if (!explicito && bytes < 4096) return 0

    return bytes
  }

  const formatarBytes = (bytes) => {
    const valorSeguro = normalizarBytes(bytes, { explicito: true })

    if (valorSeguro === 0) return "0 B"

    const tamanhos = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.min(
      tamanhos.length - 1,
      Math.floor(Math.log(valorSeguro) / Math.log(1024))
    )

    return `${(valorSeguro / Math.pow(1024, i)).toFixed(2)} ${tamanhos[i]}`
  }

  const extrairBytesLiberados = (result) => {
    const raw = [result?.output, result?.stdout, result?.stderr]
      .filter(Boolean)
      .join("\n")
      .toString()
      .trim()

    if (!raw) return 0

    // Melhor formato para os scripts retornarem:
    // MAXIFY_CLEANED_BYTES=123456
    const marcador = raw.match(
      /(?:MAXIFY_CLEANED_BYTES|MAXIFY_BYTES|BYTES_LIBERADOS|LIBERADO_BYTES)\s*[:=]\s*(\d+)/i
    )

    if (marcador) {
      return normalizarBytes(marcador[1], { explicito: true })
    }

    // Aceita JSON caso algum script/API retorne { bytes: 123 } ou { cleanedBytes: 123 }.
    try {
      const jsonStart = raw.indexOf("{")
      const jsonEnd = raw.lastIndexOf("}")

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
        const valorJson = parsed.cleanedBytes ?? parsed.bytes ?? parsed.espacoLiberado

        if (valorJson !== undefined) {
          return normalizarBytes(valorJson, { explicito: true })
        }
      }
    } catch (_) {
      // Ignora JSON inválido e tenta fallback seguro abaixo.
    }

    // Fallback: pega apenas a última linha que seja 100% numérica.
    // Isso evita parseInt pegar números falsos no meio de logs, datas, códigos e nomes.
    const linhasNumericas = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^\d+$/.test(line))

    if (linhasNumericas.length === 0) return 0

    return normalizarBytes(linhasNumericas[linhasNumericas.length - 1])
  }

  const executarScriptComTimeout = async (script, timeout = 60000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout: A operação demorou muito tempo")), timeout)
    })

    const scriptPromise = invoke({
      channel: "run-powershell",
      payload: {
        script,
        name: `limpeza-${Date.now()}`,
      },
    }).catch((err) => {
      console.error("Invoke error:", err)
      return null
    })

    return Promise.race([scriptPromise, timeoutPromise])
  }

  useEffect(() => {
    let interval

    if (isCollecting && estaLimpando) {
      const collectPerformanceData = () => {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const espacoLiberado = Object.values(resultados).reduce((acc, curr) => acc + curr, 0)

        setPerformanceData((prev) => {
          const newData = [
            ...prev,
            {
              time: `${currentTime}s`,
              espaco: Number((espacoLiberado / (1024 * 1024)).toFixed(2)),
              operacoes: Object.keys(resultados).length,
              selecionados: selecionados.length,
            },
          ]

          return newData.slice(-15)
        })
      }

      interval = setInterval(collectPerformanceData, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCollecting, estaLimpando, resultados, selecionados])

  const alternarLimpeza = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selecionarCategoria = (categoriaId) => {
    setCategoriaAtiva(categoriaId)
  }

  const getTextoStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "Executando..."
    if (resultado !== undefined) {
      return resultado > 0 ? `${formatarBytes(resultado)} liberados` : "Concluído"
    }

    return "Pendente"
  }

  const getCorStatus = (limpezaId) => {
    const estaCarregando = filaCarregando.includes(limpezaId)
    const resultado = resultados[limpezaId]

    if (estaCarregando) return "text-blue-400"
    if (resultado !== undefined) {
      return resultado > 0 ? "text-cyan-400" : "text-slate-400"
    }

    return "text-slate-400"
  }

  async function executarLimpezas() {
    if (selecionados.length === 0) {
      toast.warning("Selecione pelo menos uma limpeza.")
      return
    }

    setEstaLimpando(true)
    setFilaCarregando([...selecionados])
    setPerformanceData([])
    setLogsExecucao([])
    startTimeRef.current = Date.now()
    setIsCollecting(true)
    addLog(`Iniciando ${selecionados.length} rotina(s) de limpeza...`)

    let algumaSucesso = false
    let totalErros = 0
    let novosResultados = { ...resultados }
    let totalLiberadoNestaExecucao = 0
    const inicioLimpeza = new Date().toISOString()

    for (const limpeza of cleanups) {
      if (!selecionados.includes(limpeza.id)) continue

      addLog(`Executando: ${limpeza.label}`)

      try {
        const result = await executarScriptComTimeout(limpeza.script, 60000)

        const espacoLiberado = extrairBytesLiberados(result)

        novosResultados[limpeza.id] = espacoLiberado
        totalLiberadoNestaExecucao += espacoLiberado

        addLog(`${limpeza.label} concluído • ${formatarBytes(espacoLiberado)} liberados`, "success")
        algumaSucesso = true
      } catch (err) {
        novosResultados[limpeza.id] = 0
        totalErros += 1

        addLog(`Falha em ${limpeza.label}: ${err.message || "Erro desconhecido"}`, "error")
        log.error(`Falha ao executar ${limpeza.id}: ${err.message || err}`)
      } finally {
        setFilaCarregando((q) => q.filter((id) => id !== limpeza.id))
        setResultados({ ...novosResultados })
      }
    }

    if (algumaSucesso) {
      const agora = new Date().toLocaleString()

      setUltimaLimpeza(agora)
      localStorage.setItem("ultima-limpeza", agora)
      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))

      const novoHistorico = [
        {
          timestamp: inicioLimpeza,
          totalLiberado: totalLiberadoNestaExecucao,
          selecionados: selecionados.length,
        },
        ...historicoLimpezas.slice(0, 9),
      ]

      setHistoricoLimpezas(novoHistorico)
      localStorage.setItem("maxify:historico-limpezas", JSON.stringify(novoHistorico))

      const hoje = new Date().toDateString()
      const ultimaExecucao = historicoLimpezas[0]
        ? new Date(historicoLimpezas[0].timestamp).toDateString()
        : null

      const stats = {
        totalLiberado: (estatisticas.totalLiberado || 0) + totalLiberadoNestaExecucao,
        totalExecucoes: (estatisticas.totalExecucoes || 0) + 1,
        limpezasHoje: hoje === ultimaExecucao ? (estatisticas.limpezasHoje || 0) + 1 : 1,
        autoCleansExecuted: estatisticas.autoCleansExecuted || 0,
        totalAutoCleanSpace: estatisticas.totalAutoCleanSpace || 0,
      }

      setEstatisticas(stats)
      localStorage.setItem("maxify:estatisticas-limpeza", JSON.stringify(stats))
      addLog(`Limpeza finalizada • Total liberado: ${formatarBytes(totalLiberadoNestaExecucao)}`, "success")

      toast.success(
        totalErros > 0
          ? `Todas as limpezas possíveis foram concluídas. ${formatarBytes(totalLiberadoNestaExecucao)} liberados. ${totalErros} item(ns) tiveram aviso.`
          : `Todas as limpezas foram concluídas. ${formatarBytes(totalLiberadoNestaExecucao)} liberados no total.`,
        {
          autoClose: 5000,
        }
      )
    } else {
      toast.error(
        totalErros > 0
          ? `A limpeza terminou, mas nenhum item foi concluído. ${totalErros} item(ns) tiveram erro.`
          : "Nenhuma limpeza foi executada.",
        { autoClose: 5000 }
      )
    }

    setEstaLimpando(false)
    setIsCollecting(false)
    setDataLoaded(true)
  }

  const resetarLimpeza = (limpezaId) => {
    setResultados((prev) => {
      const novosResultados = { ...prev }

      delete novosResultados[limpezaId]

      localStorage.setItem("maxify:resultados-limpeza", JSON.stringify(novosResultados))

      return novosResultados
    })

    toast.info(`${cleanups.find((l) => l.id === limpezaId)?.label} resetado.`)
  }

  const selecionarTodosDaCategoria = () => {
    if (categoriaAtiva === "all") {
      setSelecionados(cleanups.map((limpeza) => limpeza.id))
    } else {
      const limpezasDaCategoria = cleanups
        .filter((limpeza) => limpeza.category === categoriaAtiva)
        .map((limpeza) => limpeza.id)

      setSelecionados(limpezasDaCategoria)
    }
  }

  const selecionarRecomendadas = () => {
    const recomendadas = cleanups
      .filter((limpeza) => !limpeza.warning)
      .slice(0, 12)
      .map((limpeza) => limpeza.id)

    setSelecionados(recomendadas)
    toast.info("Seleção inteligente aplicada.")
  }

  const desmarcarTodos = () => {
    setSelecionados([])
  }

  const limpezasFiltradas = useMemo(() => {
    let lista = cleanups

    if (categoriaAtiva !== "all") {
      lista = lista.filter((limpeza) => limpeza.category === categoriaAtiva)
    }

    if (buscaLimpeza.trim()) {
      const termo = buscaLimpeza.toLowerCase().trim()

      lista = lista.filter((limpeza) => {
        return (
          limpeza.label?.toLowerCase().includes(termo) ||
          limpeza.description?.toLowerCase().includes(termo) ||
          limpeza.category?.toLowerCase().includes(termo) ||
          limpeza.id?.toLowerCase().includes(termo)
        )
      })
    }

    return lista
  }, [categoriaAtiva, cleanups, buscaLimpeza])

  const espacoTotalLiberado = useMemo(() => {
    return Object.values(resultados).reduce((acc, curr) => acc + curr, 0)
  }, [resultados])

  const totalHistoricoLiberado = useMemo(() => {
    return historicoLimpezas.reduce((acc, curr) => acc + curr.totalLiberado, 0)
  }, [historicoLimpezas])

  const progressoExecucao = useMemo(() => {
    if (!estaLimpando && selecionados.length === 0) return 0
    if (!estaLimpando && selecionados.length > 0) return 100

    const executadas = selecionados.length - filaCarregando.length
    return selecionados.length > 0 ? Math.round((executadas / selecionados.length) * 100) : 0
  }, [estaLimpando, selecionados.length, filaCarregando.length])

  const dadosCategorias = useMemo(() => {
    return categories
      .filter((cat) => cat.id !== "all")
      .map((cat) => {
        const limpezasCategoria = cleanups.filter((l) => l.category === cat.id)

        const espacoCategoria = limpezasCategoria.reduce(
          (acc, limpeza) => acc + (resultados[limpeza.id] || 0),
          0
        )

        return {
          name: cat.label,
          value: espacoCategoria / (1024 * 1024),
          categoria: cat.id,
        }
      })
      .filter((item) => item.value > 0)
  }, [categories, cleanups, resultados])

  const COLORS = [
    "#2563eb",
    "#3b82f6",
    "#0ea5e9",
    "#06b6d4",
    "#38bdf8",
    "#60a5fa",
    "#1d4ed8",
  ]

  const topStats = [
    {
      title: "Espaço liberado",
      value: formatarBytes(espacoTotalLiberado),
      icon: <HardDrive size={18} />,
      text: "text-cyan-300",
    },
    {
      title: "Histórico total",
      value: formatarBytes(totalHistoricoLiberado),
      icon: <Database size={18} />,
      text: "text-blue-300",
    },
    {
      title: "Execuções",
      value: estatisticas.totalExecucoes,
      icon: <Activity size={18} />,
      text: "text-sky-300",
    },
    {
      title: "Última limpeza",
      value: ultimaLimpeza === "Ainda não limpo." ? "Nunca" : "Feita",
      icon: estaLimpando ? (
        <RefreshCw className="animate-spin" size={18} />
      ) : (
        <CheckCircle2 size={18} />
      ),
      text: estaLimpando ? "text-blue-300" : "text-cyan-300",
    },
  ]

  return (
    <RootDiv>
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 p-4 pb-16 md:p-6">
        <div className="relative overflow-hidden rounded-[38px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5 md:p-8">
          <BackgroundGlow />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-300">
                <Sparkles size={15} />
                Central de limpeza inteligente
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-[28px] border border-blue-500/20 bg-blue-500/10 p-4 shadow-xl shadow-blue-500/10">
                  <Eraser className="text-blue-300" size={34} />
                </div>

                <div>
                  <h1 className="text-4xl font-black leading-[0.96] text-maxify-text md:text-6xl">
                    Limpeza do {" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                      Sistema
                    </span>
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-maxify-text-secondary md:text-base">
                    Uma central visual para limpar cache, arquivos temporários e resíduos do Windows com animação de disco, console em tempo real e histórico de resultados.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <MiniStat icon={Database} label="Rotinas" value={cleanups.length} />
                    <MiniStat icon={CheckCircle2} label="Selecionadas" value={selecionados.length} active={selecionados.length > 0} />
                    <MiniStat icon={Gauge} label="Progresso" value={`${progressoExecucao}%`} active={estaLimpando} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {topStats.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[28px] border border-maxify-border bg-maxify-card p-5 shadow-xl shadow-black/5 transition-all hover:-translate-y-1 hover:border-blue-500/25"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_55%)] opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative z-10 flex items-center justify-between mb-3">
                    <span className={`${item.text}`}>{item.icon}</span>
                    <ChevronRight size={16} className="text-maxify-text-secondary opacity-60" />
                  </div>

                  <p className={`relative z-10 text-xl font-black md:text-2xl ${item.text}`}>{item.value}</p>
                  <p className="relative z-10 mt-1 text-sm text-maxify-text-secondary">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <CleaningDisk
            estaLimpando={estaLimpando}
            espacoLiberado={resultados}
            selecionados={selecionados.length}
            totalRotinas={cleanups.length}
          />

          <div className="grid gap-6">


            <ExecutionConsole logs={logsExecucao} estaLimpando={estaLimpando} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
            <SectionTitle icon={Shield} label="Controle" title="Rotinas de limpeza">
              <div className="flex flex-wrap gap-2">
                <Button onClick={selecionarRecomendadas} disabled={estaLimpando} variant="outline" size="sm">
                  Seleção inteligente
                </Button>

                <Button onClick={selecionarTodosDaCategoria} disabled={estaLimpando} variant="outline" size="sm">
                  Selecionar todos
                </Button>

                <Button onClick={desmarcarTodos} disabled={estaLimpando} variant="outline" size="sm">
                  Limpar seleção
                </Button>
              </div>
            </SectionTitle>

            <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-maxify-text-secondary" size={18} />
                <input
                  value={buscaLimpeza}
                  onChange={(e) => setBuscaLimpeza(e.target.value)}
                  placeholder="Pesquisar limpeza, cache, app, navegador..."
                  className="h-13 w-full rounded-2xl border border-maxify-border bg-maxify-border/10 py-4 pl-12 pr-4 text-sm text-maxify-text outline-none transition-all placeholder:text-maxify-text-secondary focus:border-blue-500/40"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-maxify-border bg-maxify-border/10 px-4 text-sm text-maxify-text-secondary">
                <SlidersHorizontal size={17} className="text-blue-300" />
                {limpezasFiltradas.length} encontradas
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              {categories.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => selecionarCategoria(categoria.id)}
                  disabled={estaLimpando}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${categoriaAtiva === categoria.id
                      ? "border-blue-500/30 bg-blue-500/15 text-blue-300 shadow-xl shadow-blue-500/10"
                      : "border-maxify-border bg-maxify-bg/30 text-maxify-text-secondary hover:border-blue-500/25 hover:bg-blue-500/10 hover:text-blue-300"
                    } ${estaLimpando ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {categoria.id === "all" ? <Sparkles size={16} /> : categoryIconMap[categoria.icon]}
                  {categoria.label}
                </button>
              ))}
            </div>

            <div className="max-h-[820px] overflow-y-auto pr-2 custom-clean-scroll">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AnimatePresence>
                  {limpezasFiltradas.map((limpeza) => {
                    const estaSelecionado = selecionados.includes(limpeza.id)
                    const estaCarregando = filaCarregando.includes(limpeza.id)
                    const resultado = resultados[limpeza.id]

                    return (
                      <motion.div
                        key={limpeza.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        onClick={() => {
                          if (!estaLimpando && !estaCarregando) {
                            alternarLimpeza(limpeza.id)
                          }
                        }}
                        className={`group relative cursor-pointer overflow-hidden rounded-[24px] border p-4 transition-all ${estaSelecionado
                            ? "border-blue-500/40 bg-blue-500/10 shadow-xl shadow-blue-500/10"
                            : "border-maxify-border bg-maxify-card hover:border-blue-500/25 hover:bg-blue-500/10"
                          } ${estaCarregando ? "opacity-85" : ""}`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_48%)] opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div
                              className={`mt-0.5 shrink-0 rounded-2xl border p-2.5 ${limpeza.warning
                                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                                  : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                }`}
                            >
                              {cleanupIconMap[limpeza.icon]}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[15px] font-black text-maxify-text">{limpeza.label}</span>

                                {limpeza.warning && (
                                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">
                                    Cuidado
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-maxify-text-secondary">
                                {limpeza.description}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`text-sm font-black ${getCorStatus(limpeza.id)}`}>
                                  {getTextoStatus(limpeza.id)}
                                </span>

                                <span className="rounded-full border border-maxify-border bg-maxify-border/20 px-2 py-0.5 text-[11px] text-maxify-text-secondary">
                                  {limpeza.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {resultado !== undefined && (
                              <button
                                onClick={() => resetarLimpeza(limpeza.id)}
                                className="rounded-lg p-1.5 text-maxify-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-400"
                                title="Resetar"
                                disabled={estaLimpando}
                              >
                                <XCircle size={16} />
                              </button>
                            )}

                            <Toggle
                              checked={estaSelecionado}
                              onChange={() => alternarLimpeza(limpeza.id)}
                              disabled={estaLimpando || estaCarregando}
                            />
                          </div>
                        </div>

                        {estaCarregando && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-maxify-card/75 backdrop-blur-[3px]">
                            <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
                              <RefreshCw className="animate-spin text-blue-400" size={16} />
                              <span className="text-sm font-bold text-blue-300">Executando...</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            {limpezasFiltradas.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-maxify-border p-8 text-center">
                <p className="font-semibold text-maxify-text">Nenhuma limpeza encontrada</p>
                <p className="mt-1 text-sm text-maxify-text-secondary">Tente pesquisar outro nome ou trocar a categoria.</p>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                  <Zap className="text-blue-300" size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-maxify-text">Painel de execução</h2>
                  <p className="text-sm text-maxify-text-secondary">Resumo atual da limpeza</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Selecionados</p>
                  <p className="mt-1 text-3xl font-black text-blue-300">{selecionados.length}</p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Liberado nesta base</p>
                  <p className="mt-1 text-3xl font-black text-cyan-300">{formatarBytes(espacoTotalLiberado)}</p>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-maxify-text-secondary">Progresso</p>
                    <p className="text-sm font-black text-blue-300">{progressoExecucao}%</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-maxify-border/40">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                      animate={{ width: `${progressoExecucao}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                  <p className="text-sm text-maxify-text-secondary">Última limpeza</p>
                  <p className="mt-1 break-words text-sm font-bold text-maxify-text">{ultimaLimpeza}</p>
                </div>
              </div>

              <Button
                onClick={executarLimpezas}
                disabled={estaLimpando || selecionados.length === 0}
                size="lg"
                variant="primary"
                className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl text-base font-black"
              >
                {estaLimpando ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>Limpando...</span>
                  </>
                ) : (
                  <>
                    <Play size={19} />
                    <span>Executar limpeza</span>
                  </>
                )}
              </Button>
            </Card>


            {historicoLimpezas.length > 0 && (
              <Card className="rounded-[34px] border border-maxify-border bg-maxify-card p-6 shadow-xl shadow-black/5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <Clock className="text-blue-300" size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-maxify-text">Histórico</h2>
                    <p className="text-sm text-maxify-text-secondary">Últimas limpezas</p>
                  </div>
                </div>

                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {historicoLimpezas.slice(0, 5).map((historico, index) => (
                    <div key={index} className="rounded-2xl border border-maxify-border bg-maxify-border/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-maxify-text">
                            {new Date(historico.timestamp).toLocaleString()}
                          </p>
                          <p className="mt-1 text-xs text-maxify-text-secondary">
                            {historico.selecionados} operação(ões)
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-cyan-300">{formatarBytes(historico.totalLiberado)}</p>
                          <p className="text-xs text-maxify-text-secondary">liberados</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RootDiv>
  )
}

export default Limpeza
