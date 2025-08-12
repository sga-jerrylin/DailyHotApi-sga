import { load } from "cheerio";

// 从网页内容中提取一个简短摘要（纯前端轻量方案，避免引入复杂解析）
export const extractSummary = (html: string, maxLen: number = 120): string | undefined => {
  try {
    const $ = load(html);
    // 优先取文章摘要/描述性内容
    const candidates = [
      $('meta[name="description"]').attr("content"),
      $('meta[property="og:description"]').attr("content"),
      $("article p").first().text(),
      $("p").first().text(),
    ].filter(Boolean) as string[];
    const text = candidates[0] || $.text();
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return undefined;
    return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + "…" : cleaned;
  } catch {
    return undefined;
  }
};


