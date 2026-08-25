import katex from 'katex';

function safeKatexRender(math: string, displayMode: boolean): string {
  try {
    let cleanMath = math.trim();

    cleanMath = cleanMath.replace(/\t/g, ' \\quad ');
    cleanMath = cleanMath.replace(/\\t(?![A-Za-z])/g, ' \\quad ');

    cleanMath = cleanMath.replace(/\bext\s*\(/g, '\\text{(');
    cleanMath = cleanMath.replace(/\bext\s*\{/g, '\\text{');

    cleanMath = cleanMath.replace(/\(([А-Яа-яЁё\s\-_.,:=]+)\)/g, (match, textInside) => {
      if (textInside.includes('text{')) return match;
      return `\\text{(${textInside})}`;
    });

    for (let i = 0; i < 3; i++) {
      cleanMath = cleanMath.replace(/\\text\{\s*\\text\{([^{}]+)\}\s*\}/g, '\\text{$1}');
    }

    cleanMath = cleanMath.replace(
      /(?<!\\)\b(triangle|angle|theta|text|frac|sqrt|cdot|quad|pm|sin|cos|tan|cot|log|ln|exp|lim|sum|int|Delta|lambda|alpha|beta|gamma|pi|infty|le|ge|ne|times|left|right)\b/g,
      '\\$1'
    );

    cleanMath = cleanMath.replace(
      /\\{2,}(triangle|angle|theta|text|frac|sqrt|cdot|quad|pm|sin|cos|tan|cot|log|ln|exp|lim|sum|int|Delta|lambda|alpha|beta|gamma|pi|infty|le|ge|ne|times|left|right)/g,
      '\\$1'
    );

    cleanMath = cleanMath
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/√\(([^()]+)\)/g, '\\sqrt{$1}')
      .replace(/√/g, '\\sqrt{}')
      .replace(/±/g, '\\pm ')
      .replace(/≤/g, '\\le ')
      .replace(/≥/g, '\\ge ')
      .replace(/≠/g, '\\ne ')
      .replace(/·/g, '\\cdot ')
      .replace(/π/g, '\\pi ')
      .replace(/∞/g, '\\infty ');

    const rendered = katex.renderToString(cleanMath, {
      displayMode,
      throwOnError: false,
    });

    if (rendered.includes('katex-error')) {
      return `<span class="font-mono text-indigo-300 font-semibold">${math.trim()}</span>`;
    }

    return rendered;
  } catch {
    return `<span class="font-mono text-indigo-300 font-semibold">${math.trim()}</span>`;
  }
}

export function renderLatexInText(text: string): string {
  if (!text) return '';

  let raw = text;

  // 1. Авто-конвертация LaTeX разделителей \(...\) и \[...\] в $...$ и $$...$$
  raw = raw.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  raw = raw.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 2. Авто-форматирование заголовков ###
  raw = raw.replace(/###\s*(.*?)(?=\n|$)/g, '<br/><strong class="text-indigo-400 font-bold block my-1">$1</strong>');

  // 3. Авто-обертка сырого \begin{cases}...\end{cases}
  if (raw.includes('\\begin{') && !raw.includes('$$')) {
    raw = raw.replace(/(\\begin\{[a-z]+\}[\s\S]*?\\end\{[a-z]+\})/g, '$$$1$$');
  }

  // 4. Блочные формулы $$ ... $$
  let parsed = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return safeKatexRender(math, true);
  });

  // 5. Строчные формулы $ ... $
  parsed = parsed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    return safeKatexRender(math, false);
  });

  return parsed;
}