import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MockUser } from "../types";

export function StudentPanelPage({
  user,
  listingCount,
  onGoToSell,
  onSignOut,
}: {
  user: MockUser;
  listingCount: number;
  onGoToSell: () => void;
  onSignOut: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Student Portal</Text>
      <Text style={styles.subtitle}>Welcome back, {user.name}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Account Info</Text>
        <Text style={styles.info}>Email: {user.email}</Text>
        <Text style={styles.info}>Campus: {user.campus}</Text>
        <Text style={styles.info}>Role: Student</Text>
        <Text style={styles.info}>Active Listings: {listingCount}</Text>
      </View>

      <Pressable style={styles.primary} onPress={onGoToSell}>
        <Text style={styles.primaryText}>+ Post New Listing</Text>
      </Pressable>

      <Pressable style={styles.signout} onPress={onSignOut}>
        <Text style={styles.signoutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 110 },
  title: { color: "#173C34", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#87918C", fontSize: 13, marginBottom: 20 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E9ECE6", gap: 6, marginBottom: 16 },
  label: { color: "#23775D", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  info: { color: "#173C34", fontSize: 14 },
  primary: { height: 46, backgroundColor: "#1F5D4C", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  primaryText: { color: "#FFF", fontWeight: "700" },
  signout: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: "#BCD0C3", justifyContent: "center", alignItems: "center", marginTop: 12 },
  signoutText: { color: "#1F5D4C", fontWeight: "700" },
});