import { View, StyleSheet } from 'react-native';
import { OptionButton } from './OptionButton';
import type { ExamOption } from '@/types/api';

interface OptionListProps {
  options: ExamOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  /** Coloring per option once the answer is revealed; omit while the question is still open. */
  getReviewState?: (optionId: string) => 'correct' | 'incorrect' | 'none';
}

export function OptionList({ options, selectedOptionId, onSelect, getReviewState }: OptionListProps) {
  // Pure-image options (mirror images, sequences, matrices) are laid out as a
  // 2-column grid so all of them fit on screen at once; anything containing
  // text keeps the normal full-width list.
  const isGrid = options.length > 1 && options.every((o) => !!o.imageUrl && !o.text);

  return (
    <View style={isGrid ? styles.grid : undefined}>
      {options.map((option) => (
        <View key={option.id} style={isGrid ? styles.gridItem : undefined}>
          <OptionButton
            option={option}
            selected={selectedOptionId === option.id}
            onPress={() => onSelect(option.id)}
            reviewState={getReviewState ? getReviewState(option.id) : undefined}
            compact={isGrid}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48.5%' },
});