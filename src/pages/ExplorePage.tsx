import React from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ListingCard } from "../components/ListingCard";
import { PriceFilter, PriceRange } from "../components/PriceFilter";
import { SearchBar } from "../components/SearchBar";
import { categories } from "../data";
import { Listing, MockUser } from "../types";

export function ExplorePage({
  items,
  query,
  category,
  priceRange,
  savedIds,
  currentUser,
  onQueryChange,
  onCategoryChange,
  onPriceRangeChange,
  onSave,
  onOpen,
  onProfile,
  onOpenRoleSwitch,
}: {
  items: Listing[];
  query: string;
  category: string;
  priceRange: PriceRange;
  savedIds: string[];
  currentUser: MockUser | null;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  onSave: (id: string) => void;
  onOpen: (item: Listing) => void;
  onProfile: () => void;
  onOpenRoleSwitch: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CAMPUS MARKETPLACE</Text>
          <Text style={styles.heading}>
            Find your next{"\n"}favorite thing.
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.avatar} onPress={onProfile}>
            <Text style={styles.avatarText}>
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </Pressable>
          <Pressable style={styles.roleTag} onPress={onOpenRoleSwitch}>
            <Text style={styles.roleTagText}>
              {currentUser?.role === "admin"
                ? "🛡️ Admin"
                : `🎓 ${currentUser?.name.split(" ")[0] || "Student"}`} ▾
            </Text>
          </Pressable>
        </View>
      </View>

      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        onClear={() => onQueryChange("")}
        totalResults={items.length}
      />

      <View style={styles.section}>
        <View>
          <Text style={styles.sectionTitle}>Browse near you</Text>
          <Text style={styles.muted}>Good finds, close by</Text>
        </View>
        <Text style={styles.seeAll}>{items.length} items</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {categories.map((value) => (
          <Pressable
            key={value}
            onPress={() => onCategoryChange(value)}
            style={[
              styles.category,
              category === value && styles.activeCategory,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === value && styles.activeText,
              ]}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Price Filtering Component */}
      <PriceFilter
        selected={priceRange}
        onSelect={onPriceRangeChange}
      />

      <FlatList
        data={items}
        scrollEnabled={false}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={styles.empty}>No items match your search or filter yet.</Text>
        }
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            saved={savedIds.includes(item.id)}
            onSave={() => onSave(item.id)}
            onOpen={() => onOpen(item)}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: "flex-start",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  eyebrow: {
    color: "#65766D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  heading: {
    color: "#173C34",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D6E5D7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#225347", fontWeight: "800", fontSize: 16 },
  roleTag: {
    backgroundColor: "#E2ECE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5D8CB",
  },
  roleTagText: {
    color: "#173C34",
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#173C34",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 2,
  },
  muted: { color: "#87918C", fontSize: 12 },
  seeAll: { color: "#23775D", fontWeight: "700", fontSize: 12 },
  categories: { gap: 8, paddingBottom: 10 },
  category: {
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#ECEFE9",
  },
  activeCategory: { backgroundColor: "#1F5D4C" },
  categoryText: { color: "#64736C", fontSize: 12, fontWeight: "700" },
  activeText: { color: "#FFF" },
  grid: { gap: 14 },
  columns: { gap: 14 },
  empty: { textAlign: "center", color: "#87918C", padding: 30 },
});
