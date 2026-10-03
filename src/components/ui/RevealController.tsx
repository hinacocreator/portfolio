"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveal（.reveal / .reveal-photo）を観察して、画面に入ったら `is-in` を付ける。
 * ページに1つだけ置く（layout.tsx）。画面には何も描画しない。
 * ルートが変わったとき（pathname）に観察をやり直す。
 *
 * ・IntersectionObserver: threshold 0.12 / rootMargin "0px 0px -8% 0px"。一度出たら unobserve。
 * ・アンカー（#about など）へ飛ぶとき、行き先のセクションの中身を先に出し始める。
 *   スムーススクロールの移動中にフェードが終わるので、着地した瞬間に白く抜けない。
 * ・<html data-ready> を立てる。これが立たないまま4秒たつと、head のスクリプトが
 *   初期非表示を解除する（JS が壊れても本文が消えたままにならない）。
 */
const SELECTOR = ".reveal, .reveal-photo";

function revealWithin(root: Element) {
  const targets = root.matches(SELECTOR) ? [root] : [];
  targets.push(...root.querySelectorAll(SELECTOR));
  for (const el of targets) el.classList.add("is-in");
}

function revealHashTarget(hash: string) {
  if (hash.length < 2) return;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // そのまま使う
  }
  const target = document.getElementById(id);
  if (target) revealWithin(target);
}

export function RevealController() {
  // ページ遷移（トップ ⇄ 詳細ページ。クライアント遷移）のたびに、新しいページの Reveal を観察し直す
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (!el.classList.contains("is-in")) observer.observe(el);
    });

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (anchor) revealHashTarget(anchor.getAttribute("href") ?? "");
    };
    const onHashChange = () => revealHashTarget(window.location.hash);

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    revealHashTarget(window.location.hash);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname]);

  return null;
}
