/**
 * Splits a string into plain-text and LaTeX segments.
 *
 * Supported delimiters:
 *   $...$      inline math
 *   $$...$$    display (centered, own line) math
 *   \(...\)    inline math
 *   \[...\]    display math
 *   \$         a literal dollar sign (use this for currency: "Rs \$500")
 *
 * `$` is only treated as an opener when the next character isn't whitespace,
 * and as a closer when the previous character isn't whitespace and the next
 * one isn't a digit - so ordinary text like "costs $5 or $10" stays text.
 */
export type MathSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean };

const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c);
const isDigit = (c: string | undefined) => c !== undefined && c >= '0' && c <= '9';

export function hasMath(input: string | undefined | null): boolean {
  if (!input) return false;
  return input.includes('$') || input.includes('\\(') || input.includes('\\[');
}

export function splitMath(input: string): MathSegment[] {
  const out: MathSegment[] = [];
  let buf = '';
  let i = 0;
  const n = input.length;

  const flush = () => {
    if (buf) out.push({ type: 'text', value: buf });
    buf = '';
  };

  while (i < n) {
    const ch = input[i];

    // Escaped dollar -> literal $
    if (ch === '\\' && input[i + 1] === '$') {
      buf += '$';
      i += 2;
      continue;
    }

    // \( ... \)  and  \[ ... \]
    if (ch === '\\' && (input[i + 1] === '(' || input[i + 1] === '[')) {
      const close = input[i + 1] === '(' ? '\\)' : '\\]';
      const end = input.indexOf(close, i + 2);
      if (end !== -1) {
        const body = input.slice(i + 2, end).trim();
        if (body) {
          flush();
          out.push({ type: 'math', value: body, display: input[i + 1] === '[' });
          i = end + 2;
          continue;
        }
      }
    }

    if (ch === '$') {
      // $$ ... $$
      if (input[i + 1] === '$') {
        const end = input.indexOf('$$', i + 2);
        if (end !== -1) {
          const body = input.slice(i + 2, end).trim();
          if (body) {
            flush();
            out.push({ type: 'math', value: body, display: true });
            i = end + 2;
            continue;
          }
        }
      } else if (!isSpace(input[i + 1])) {
        // $ ... $
        let j = i + 1;
        let found = -1;
        while (j < n) {
          const c = input[j];
          if (c === '\\') {
            j += 2; // skip escaped char (\$ inside math, \\ etc.)
            continue;
          }
          if (c === '$' && !isSpace(input[j - 1]) && !isDigit(input[j + 1])) {
            found = j;
            break;
          }
          j++;
        }
        if (found !== -1) {
          flush();
          out.push({ type: 'math', value: input.slice(i + 1, found), display: false });
          i = found + 1;
          continue;
        }
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}