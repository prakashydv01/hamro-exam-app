/**
 * LaTeX -> SVG using MathJax (pure JS, no WebView, no network).
 *
 * MathJax is loaded lazily the first time a formula is rendered, so apps
 * and screens that never show math pay nothing at startup. Results are
 * cached per (display, tex) so re-renders and revisiting a question are free.
 */

export interface RenderedMath {
  /** SVG markup with width/height/style stripped from the root tag and `currentColor` left in place. */
  xml: string;
  /** Intrinsic size in "ex" units (MathJax's unit). 1ex = fontSize * 0.5 at render time. */
  widthEx: number;
  heightEx: number;
}

type Engine = { doc: any; adaptor: any };
let engine: Engine | null = null;
const cache = new Map<string, RenderedMath | null>();
const MAX_CACHE = 400;

function getEngine(): Engine {
  if (engine) return engine;

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { mathjax } = require('mathjax-full/js/mathjax.js');
  const { TeX } = require('mathjax-full/js/input/tex.js');
  const { SVG } = require('mathjax-full/js/output/svg.js');
  const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
  const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
  // Requiring a package's Configuration file registers it. Only load what we
  // need - AllPackages pulls in a lot more and slows down first render.
  require('mathjax-full/js/input/tex/base/BaseConfiguration.js');
  require('mathjax-full/js/input/tex/ams/AmsConfiguration.js');
  require('mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js');
  require('mathjax-full/js/input/tex/noundefined/NoUndefinedConfiguration.js');
  require('mathjax-full/js/input/tex/mhchem/MhchemConfiguration.js'); // \ce{H2O}
  require('mathjax-full/js/input/tex/cancel/CancelConfiguration.js'); // \cancel{x}
  /* eslint-enable @typescript-eslint/no-var-requires */

  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const doc = mathjax.document('', {
    InputJax: new TeX({ packages: ['base', 'ams', 'newcommand', 'noundefined', 'mhchem', 'cancel'] }),
    // fontCache 'none' = every glyph is an inline <path>; no <defs>/<use>, which react-native-svg handles best.
    OutputJax: new SVG({ fontCache: 'none' }),
  });
  engine = { doc, adaptor };
  return engine;
}

/** Warm up MathJax (e.g. when a math exam starts) so the first question doesn't pay the load cost. */
export function warmUpMath() {
  try {
    renderTex('x', false);
  } catch {
    /* ignore */
  }
}

export function renderTex(tex: string, display: boolean): RenderedMath | null {
  const key = (display ? 'D|' : 'I|') + tex;
  if (cache.has(key)) return cache.get(key)!;

  let result: RenderedMath | null = null;
  try {
    const { doc, adaptor } = getEngine();
    const svg: string = adaptor.innerHTML(doc.convert(tex, { display }));
    const root = /<svg\b[^>]*>/.exec(svg)?.[0];
    const w = root && /\bwidth="([\d.]+)ex"/.exec(root);
    const h = root && /\bheight="([\d.]+)ex"/.exec(root);
    if (root && w && h) {
      const cleanRoot = root
        .replace(/\s(width|height|style|role|focusable)="[^"]*"/g, '')
        .replace(/\sdata-[\w-]+="[^"]*"/g, '');
      const body = svg
        .slice(root.length)
        .replace(/\sdata-[\w-]+="[^"]*"/g, '');
      result = { xml: cleanRoot + body, widthEx: parseFloat(w[1]), heightEx: parseFloat(h[1]) };
    }
  } catch (e) {
    if (__DEV__) console.warn('[math] could not render:', tex, e);
    result = null;
  }

  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  cache.set(key, result);
  return result;
}