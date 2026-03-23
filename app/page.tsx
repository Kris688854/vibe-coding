import Link from "next/link";
import type { Route } from "next";

const cards = [
  {
    href: "/exercises" as Route,
    title: "动作图谱",
    description:
      "按训练部位浏览动作库，并在 3D 人体模型上查看主肌群与次肌群高亮覆盖。",
  },
  {
    href: "/nutrition" as Route,
    title: "营养规划",
    description:
      "输入基础信息后，生成结构化的热量、营养素、解释逻辑与日常饮食示例。",
  },
  {
    href: "/plan" as Route,
    title: "训练计划",
    description:
      "根据目标、训练频率、器械条件和限制项生成一周训练安排，并保存到数据库。",
  },
  {
    href: "/history" as Route,
    title: "历史记录",
    description:
      "集中查看营养方案、训练计划和身体数据，方便复盘与长期追踪。",
  },
  {
    href: "/dashboard" as Route,
    title: "趋势看板",
    description:
      "查看本周肌群覆盖热力、近期体重变化，以及营养目标的趋势调整。",
  },
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="rounded-[32px] border border-white/25 bg-hero-grid px-8 py-10 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-200">
            FitForge
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            健身动作、营养规划与训练安排的一体化工作台
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            基于 Next.js App Router、Drizzle ORM 和 React Three Fiber，
            将动作浏览、饮食规划、训练计划和历史追踪整合到同一个项目中。
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-panel transition hover:-translate-y-1 hover:border-orange-200"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
                Explore
              </p>
              <h2 className="mt-3 text-2xl font-bold text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {card.description}
              </p>
              <div className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition group-hover:bg-orange-50 group-hover:text-orange-700">
                进入页面
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
