import { Calculator, Lightbulb, TriangleAlert } from "lucide-react";
import type { Block } from "@/content/academy";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";

const CALLOUT = {
  tip: { icon: Lightbulb, cls: "border-forest/20 bg-mist", iconCls: "bg-forest text-neon" },
  warning: { icon: TriangleAlert, cls: "border-warning/40 bg-warning-soft", iconCls: "bg-warning text-ink" },
  example: { icon: Calculator, cls: "border-line bg-paper", iconCls: "bg-ink text-neon" },
} as const;

export function ArticleBlocks({ blocks, idPrefix }: { blocks: Block[]; idPrefix: string }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-pretty">
                <RichText text={block.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={`${idPrefix}-${block.id}`} className="scroll-mt-28 text-balance">
                {block.text}
              </h2>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={i}>
                {block.items.map((item, j) => (
                  <li key={j} className="relative pl-9">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-[0.2em] inline-flex items-center justify-center rounded-full text-[0.7em] font-bold",
                        block.ordered ? "size-[1.55em] bg-ink text-neon" : "mt-[0.45em] ml-[0.45em] size-[0.55em] bg-forest",
                      )}
                    >
                      {block.ordered ? j + 1 : null}
                    </span>
                    <RichText text={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "callout": {
            const c = CALLOUT[block.tone];
            const Icon = c.icon;
            return (
              <aside key={i} className={cn("flex gap-4 rounded-3xl border p-5 text-[0.92em] sm:p-6", c.cls)}>
                <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", c.iconCls)}>
                  <Icon className="size-[1.1rem]" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-ink">{block.title}</p>
                  <p className="mt-1.5 leading-relaxed">
                    <RichText text={block.text} />
                  </p>
                </div>
              </aside>
            );
          }
          case "figures":
            return (
              <figure key={i} className="surface-dark overflow-hidden rounded-3xl bg-ink text-[0.92em] text-white">
                <figcaption className="border-b border-white/[0.08] px-5 py-4 font-bold sm:px-6">{block.title}</figcaption>
                <table className="w-full">
                  <tbody className="divide-y divide-dashed divide-white/[0.1]">
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        <th scope="row" className="px-5 py-3 text-left font-medium text-sage-200 sm:px-6">
                          {row.label}
                        </th>
                        <td
                          className={cn(
                            "px-5 py-3 text-right font-bold whitespace-nowrap tabular-nums sm:px-6",
                            row.emphasis ? "text-neon" : "text-white",
                          )}
                        >
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.note ? <p className="border-t border-white/[0.08] px-5 py-3 text-[0.82em] leading-relaxed text-sage sm:px-6">{block.note}</p> : null}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={i} className="relative border-l-4 border-neon py-1 pl-6">
                <p className="text-[1.25em] font-semibold leading-snug tracking-[-0.02em] text-ink">« {block.text} »</p>
                {block.source ? <footer className="mt-2 text-sm text-muted">— {block.source}</footer> : null}
              </blockquote>
            );
        }
      })}
    </>
  );
}
