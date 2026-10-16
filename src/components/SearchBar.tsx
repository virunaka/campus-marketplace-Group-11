import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function SearchBar({
  value,
  onChangeText,
  onClear,
  totalResults,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  totalResults: number;
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.search}>
        <Text style={styles.icon}>⌕</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search items by name..."
          placeholderTextColor="#87918C"
          style={styles.input}
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>
      {value.trim().length > 0 && (
        <Text style={styles.counter}>
          Found {totalResults} {totalResults === 1 ? "result" : "results"} for "{value.trim()}"
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  search: {
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E6E9E2",
  },
  icon: { color: "#49635A", fontSize: 24, marginRight: 8 },
  input: { flex: 1, color: "#173C34", fontSize: 14 },
  clearButton: { padding: 6 },
  clearText: { color: "#87918C", fontSize: 14, fontWeight: "700" },
  counter: { color: "#23775D", fontSize: 12, fontWeight: "600", marginTop: 6, marginLeft: 4 },
});