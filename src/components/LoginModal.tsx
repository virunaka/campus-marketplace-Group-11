import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MockUser, UserRole } from "../types";

export function LoginModal({
  visible,
  students,
  onClose,
  onLogin,
}: {
  visible: boolean;
  students: MockUser[];
  onClose: () => void;
  onLogin: (user: MockUser) => void;
}) {
  const [role, setRole] = useState<UserRole>("student");
  const [studentName, setStudentName] = useState("");

  const handleStudentLogin = (student?: MockUser) => {
    if (student) {
      onLogin(student);
    } else if (studentName.trim()) {
      onLogin({
        id: "s_" + Date.now(),
        name: studentName.trim(),
        email: `${studentName.trim().toLowerCase().replace(/\s+/g, "")}@campus.edu`,
        campus: "North Campus",
        role: "student",
      });
    }
  };

  const handleAdminLogin = () => {
    onLogin({
      id: "admin_1",
      name: "Campus Administrator",
      email: "admin@campus.edu",
      campus: "Admin Office",
      role: "admin",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Campus Sign In</Text>
          <Text style={styles.subtitle}>Select your role to access features</Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, role === "student" && styles.activeTab]}
              onPress={() => setRole("student")}
            >
              <Text style={[styles.tabText, role === "student" && styles.activeTabText]}>Student</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, role === "admin" && styles.activeTab]}
              onPress={() => setRole("admin")}
            >
              <Text style={[styles.tabText, role === "admin" && styles.activeTabText]}>Admin</Text>
            </Pressable>
          </View>

          {role === "student" ? (
            <View>
              <Text style={styles.label}>Quick switch to registered student:</Text>
              {students.slice(0, 3).map((st) => (
                <Pressable key={st.id} style={styles.quickUser} onPress={() => handleStudentLogin(st)}>
                  <Text style={styles.quickUserName}>{st.name}</Text>
                  <Text style={styles.quickUserEmail}>({st.email})</Text>
                </Pressable>
              ))}

              <Text style={[styles.label, { marginTop: 12 }]}>Or enter new student name:</Text>
              <TextInput
                value={studentName}
                onChangeText={setStudentName}
                placeholder="e.g. Alex Green"
                style={styles.input}
              />
              <Pressable
                disabled={!studentName.trim()}
                style={[styles.primaryButton, !studentName.trim() && styles.disabled]}
                onPress={() => handleStudentLogin()}
              >
                <Text style={styles.primaryButtonText}>Continue as Student</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.infoText}>Log in with full administrator permissions to manage all listings and students.</Text>
              <Pressable style={styles.primaryButton} onPress={handleAdminLogin}>
                <Text style={styles.primaryButtonText}>Enter Admin Panel</Text>
              </Pressable>
            </View>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,40,33,0.45)", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#FFF", borderRadius: 20, padding: 24 },
  title: { color: "#173C34", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "#87918C", fontSize: 13, marginBottom: 16 },
  tabs: { flexDirection: "row", backgroundColor: "#ECEFE9", borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#1F5D4C" },
  tabText: { color: "#64736C", fontWeight: "700", fontSize: 13 },
  activeTabText: { color: "#FFF" },
  label: { color: "#365B4C", fontSize: 12, fontWeight: "700", marginBottom: 6 },
  quickUser: { padding: 10, backgroundColor: "#F5F7F4", borderRadius: 8, marginBottom: 6, flexDirection: "row", justifyContent: "space-between" },
  quickUserName: { color: "#173C34", fontWeight: "600", fontSize: 13 },
  quickUserEmail: { color: "#87918C", fontSize: 12 },
  input: { height: 44, borderWidth: 1, borderColor: "#DDE4DC", borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  primaryButton: { height: 46, backgroundColor: "#1F5D4C", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  disabled: { opacity: 0.5 },
  infoText: { color: "#66736D", fontSize: 13, marginVertical: 12, lineHeight: 18 },
  cancelButton: { height: 40, justifyContent: "center", alignItems: "center", marginTop: 8 },
  cancelText: { color: "#66736D", fontWeight: "600" },
});