"use client";

import { useEffect } from "react";

/**
 * ヘッダーの名前（ワードマーク）の出し入れ。
 * HERO の h1（#site-title）が画面内にある間は隠し、画面外に出たら出す（Art Direction §3.1）。
 * 見た目の切り替えは CSS（.js .site-header__name / .is-visible）。JS が無いときは常に表示される。
 */
export function HeaderNameObserver() {
  useEffect(() => {
    const name = document.querySelector(".site-header__name");
    const title = document.getElementById("site-title");
    if (!name) return;
    if (!title) {
      name.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => name.classList.toggle("is-visible", !entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  return null;
}
