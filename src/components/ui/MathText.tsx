import { memo, useMemo, type ReactNode } from 'react';
import { Text, View, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '@/constants/theme';
import { hasMath, splitMath, type MathSegment } from '@/utils/mathParse';
import { renderTex } from '@/utils/mathRender';

interface MathTextProps {
  /** Text that may contain LaTeX: $inline$, $$display$$, \(inline\), \[display\]. */
  children?: string | null;
  style?: StyleProp<TextStyle>;
}

/**
 * Drop-in replacement for <Text> for question / option / explanation text.
 *
 * - No math in the string -> renders a plain <Text> (zero extra cost, so
 *   all existing Nepali / English questions behave exactly as before).
 * - With math -> words stay native <Text> (Devanagari etc. render with the
 *   system font), formulas are drawn as SVG, laid out in a wrapping row.
 */
function MathTextImpl({ children, style }: MathTextProps) {
  const text = children ?? '';
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = (flat.fontSize as number) || 14;
  const color = (flat.color as string) || colors.text;
  const lineHeight = (flat.lineHeight as number) || Math.round(fontSize * 1.4);

  const segments = useMemo<MathSegment[] | null>(() => (hasMath(text) ? splitMath(text) : null), [text]);

  // Fast path: nothing to render as math.
  if (!segments || !segments.some((s) => s.type === 'math')) {
    return <Text style={style}>{segments ? segments.map((s) => s.value).join('') : text}</Text>;
  }

  const exPx = fontSize * 0.5 * 1.08; // 1ex in px; tiny boost makes formulas read as large as the text
  const rows: ReactNode[] = [];
  let inline: ReactNode[] = [];
  let keyN = 0;

  const flushInline = () => {
    if (inline.length) {
      rows.push(
        <View key={`r${keyN++}`} style={styles.inlineRow}>
          {inline}
        </View>
      );
      inline = [];
    }
  };

  const renderFormula = (tex: string, display: boolean, k: string) => {
    const r = renderTex(tex, display);
    if (!r) {
      // Could not parse: show the raw source instead of hiding content.
      return (
        <Text key={k} style={[style, { fontFamily: 'monospace' }]}>
          {tex}
        </Text>
      );
    }
    return (
      <SvgXml
        key={k}
        xml={r.xml.replace(/currentColor/g, color)}
        width={r.widthEx * exPx}
        height={r.heightEx * exPx}
      />
    );
  };

  segments.forEach((seg, si) => {
    if (seg.type === 'math') {
      if (seg.display) {
        flushInline();
        rows.push(
          <View key={`d${si}`} style={styles.displayRow}>
            {renderFormula(seg.value, true, `m${si}`)}
          </View>
        );
      } else {
        inline.push(
          <View key={`m${si}`} style={styles.formulaWrap}>
            {renderFormula(seg.value, false, `f${si}`)}
          </View>
        );
      }
      return;
    }

    // Text: one <Text> per word so the row can wrap naturally around formulas.
    // Whitespace (incl. newlines) is kept as a trailing space on the word.
    seg.value.split(/(\s+)/).forEach((tok, ti) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) {
        if (tok.includes('\n')) {
          flushInline();
        } else if (inline.length) {
          // attach the space to the previous token by adding a narrow spacer
          inline.push(<View key={`s${si}-${ti}`} style={{ width: fontSize * 0.28 }} />);
        }
        return;
      }
      inline.push(
        <Text key={`t${si}-${ti}`} style={[style, { lineHeight }]}>
          {tok}
        </Text>
      );
    });
  });
  flushInline();

  return <View>{rows}</View>;
}

export const MathText = memo(MathTextImpl);

const styles = StyleSheet.create({
  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  formulaWrap: { marginHorizontal: 1, marginVertical: 1 },
  displayRow: { alignItems: 'center', marginVertical: 6 },
});