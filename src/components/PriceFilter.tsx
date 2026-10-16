import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PriceRange = "all" | "under30" | "30to70" | "over70";

export function PriceFilter({
  selected,
  onSelect,
}: {
  selected: PriceRange;
  onSelect: (range: PriceRange) => void;
}) {
  const options: { label: string; value: PriceRange }[] = [
    { label: "All Prices", value: "all" },
    { label: "< $30", value: "under30" },
    { label: "$30 - $70", value: "30to70" },
    { label: "> $70", value: "over70" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Price:</Text>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.chip, selected === opt.value && styles.activeChip]}
          onPress={() => onSelect(opt.value)}
        >
          <Text
            style={[
              styles.chipText,
              selected === opt.value && styles.activeChipText,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  label: { fontSize: 12, fontWeight: "700", color: "#65766D", marginRight: 2 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#ECEFE9",
    borderWidth: 1,
    borderColor: "#E2E7DF",
  },
  activeChip: { backgroundColor: "#1F5D4C", borderColor: "#1F5D4C" },
  chipText: { fontSize: 11, fontWeight: "600", color: "#4B5A53" },
  activeChipText: { color: "#FFF" },
});