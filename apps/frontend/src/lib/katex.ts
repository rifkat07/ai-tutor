import katex from 'katex';

export function renderLatexInText(text: string): string {
  if (!text) return '';

  let raw = text;

  // 1. Авто-конвертация LaTeX разделителей \(...\) и \[...\] в $...$ и $$...$$
  raw = raw.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  raw = raw.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 2. Авто-форматирование заголовков ###
  raw = raw.replace(/###\s*(.*?)(?=\n|$)/g, '<br/><strong className="text-blue-400 font-bold block my-1">$1</strong>');

  // 3. Авто-обертка сырого \begin{cases}
  if (raw.includes('\\begin{') && !raw.includes('$$')) {
    raw = raw.replace(/(\\begin\{[a-z]+\}[\s\S]*?\\end\{[a-z]+\})/g, '$$$1$$');
  }

  // 4. Блочные формулы $$ ... $$
  let parsed = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  });

  // 5. Строчные формулы $ ... $
  parsed = parsed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  return parsed;
}