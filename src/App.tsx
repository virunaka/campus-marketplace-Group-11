import { StatusBar } from "expo-status-bar";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LoginModal } from "./components/LoginModal";
import { PriceRange } from "./components/PriceFilter";
import { seedListings } from "./data";
import { auth, db, firebaseConfigured } from "./firebase";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { ExplorePage } from "./pages/ExplorePage";
import { MessagesPage } from "./pages/MessagesPage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { StudentPanelPage } from "./pages/StudentPanelPage";
import { Listing, MockUser, Tab } from "./types";

const initialStudents: MockUser[] = [
  {
    id: "s_1",
    name: "Chamudika Sandharuwan",
    email: "chamudika@campus.edu",
    campus: "North Campus",
    role: "student",
  },
  {
    id: "s_2",
    name: "Virunaka Dewmin",
    email: "virunaka@campus.edu",
    campus: "West Village",
    role: "student",
  },
  {
    id: "s_3",
    name: "Samantha K.",
    email: "samantha@campus.edu",
    campus: "East Quad",
    role: "student",
  },
];

async function registerUser(user: User) {
  if (!db) return;
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName:
        user.displayName || user.email?.split("@")[0] || "Campus student",
      email: user.email || "",
      photoURL: user.photoURL || null,
      campus: "North Campus",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Explore");
  const [items, setItems] = useState<Listing[]>(seedListings);
  const [queryText, setQueryText] = useState("");
  const [category, setCategory] = useState("All items");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Listing | null>(null);

  // Role and Mock User State
  const [students, setStudents] = useState<MockUser[]>(initialStudents);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(
    initialStudents[0],
  );
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Firebase Auth state
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) return;
    const handleUser = (nextUser: User | null) => {
      setUser(nextUser);
      if (nextUser)
        registerUser(nextUser)
          .then(() => setProfileReady(true))
          .catch((error) =>
            setAuthError(
              error instanceof Error
                ? error.message
                : "Could not create profile.",
            ),
          );
      else setProfileReady(false);
    };
    let unsubscribe: () => void = () => undefined;
    setPersistence(firebaseAuth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onAuthStateChanged(firebaseAuth, handleUser);
        return getRedirectResult(firebaseAuth);
      })
      .then((result) => {
        if (result?.user) handleUser(result.user);
      })
      .catch((error) =>
        setAuthError(
          error instanceof Error
            ? error.message
            : "Google sign-in could not be completed.",
        ),
      );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const listingsQuery = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      listingsQuery,
      (snapshot) =>
        setItems(
          snapshot.empty
            ? seedListings
            : snapshot.docs.map(
                (entry) => ({ id: entry.id, ...entry.data() }) as Listing,
              ),
        ),
      () => setItems(seedListings),
    );
  }, []);

  // Filter items by category, query, and price range
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        category === "All items" || item.category === category;
      const matchesQuery = item.title
        .toLowerCase()
        .includes(queryText.toLowerCase());

      let matchesPrice = true;
      if (priceRange === "under30") {
        matchesPrice = item.price < 30;
      } else if (priceRange === "30to70") {
        matchesPrice = item.price >= 30 && item.price <= 70;
      } else if (priceRange === "over70") {
        matchesPrice = item.price > 70;
      }

      return matchesCategory && matchesQuery && matchesPrice;
    });
  }, [category, items, priceRange, queryText]);

  const myListings = useMemo(() => {
    const activeName = currentUser?.name || user?.displayName || "You";
    return items.filter(
      (item) =>
        item.seller === activeName ||
        (user && item.sellerId === user.uid) ||
        (currentUser && item.sellerId === currentUser.id),
    );
  }, [items, user, currentUser]);

  const toggleSaved = (id: string) =>
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  // Toggle "Mark as Sold" feature
  const toggleSold = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isSold: !item.isSold } : item,
      ),
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, isSold: !prev.isSold } : prev));
  };

  // Role login handlers
  const handleRoleLogin = (mockUser: MockUser) => {
    setCurrentUser(mockUser);
    setLoginModalOpen(false);
    if (mockUser.role === "admin") {
      setTab("AdminPanel");
    } else {
      setTab("StudentPanel");
    }
  };

  const handleSignOutRole = () => {
    setCurrentUser(null);
    setLoginModalOpen(true);
  };

  // Admin Dashboard actions
  const handleAdminAddListing = (title: string, price: number, cat: string) => {
    const newListing: Listing = {
      id: "admin_" + Date.now(),
      title,
      price,
      category: cat,
      seller: currentUser?.name || "Campus Administrator",
      sellerId: currentUser?.id || "admin_1",
      campus: "Admin Office",
      condition: "Brand new",
      image: seedListings[0].image,
      description: "Official listing posted by campus administration.",
      isSold: false,
    };
    setItems((prev) => [newListing, ...prev]);
  };

  const handleAdminDeleteListing = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdminRegisterStudent = (
    name: string,
    email: string,
    campus: string,
  ) => {
    const newStudent: MockUser = {
      id: "s_" + Date.now(),
      name,
      email,
      campus,
      role: "student",
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleAdminDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthError("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (Platform.OS === "web") {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        await registerUser(result.user);
        setUser(result.user);
        setProfileReady(true);
        setAuthOpen(false);
      } else {
        await signInAnonymously(auth);
        setAuthOpen(false);
      }
    } catch (error) {
      const code =
        error instanceof Error ? error.message : "Google sign-in failed.";
      if (
        Platform.OS === "web" &&
        /popup|cancelled-popup-request/i.test(code)
      ) {
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      }
      setAuthError(code);
      Alert.alert("Google sign-in failed", code);
    }
  };

  const publish = async (
    title: string,
    price: string,
    listingCategory: string,
  ) => {
    const activeSellerName =
      currentUser?.name || user?.displayName || user?.email || "Campus Student";
    const activeSellerId = currentUser?.id || user?.uid || "mock_seller";

    const newListing: Listing = {
      id: "lst_" + Date.now(),
      title,
      price: Number(price) || 0,
      category: listingCategory,
      seller: activeSellerName,
      sellerId: activeSellerId,
      campus: currentUser?.campus || "North Campus",
      condition: "Good condition",
      image: seedListings[0].image,
      description: "New listing from a campus seller.",
      isSold: false,
    };

    setItems((prev) => [newListing, ...prev]);

    // Reset search query, category, and price filters so the new listing is immediately visible at the top!
    setQueryText("");
    setCategory("All items");
    setPriceRange("all");

    // Automatically navigate to Explore tab
    setTab("Explore");
    setSellOpen(false);
  };

  const contactSeller = () => {
    setSelected(null);
    setTab("Messages");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {tab === "Explore" && (
        <ExplorePage
          items={filteredItems}
          query={queryText}
          category={category}
          priceRange={priceRange}
          savedIds={savedIds}
          currentUser={currentUser}
          onQueryChange={setQueryText}
          onCategoryChange={setCategory}
          onPriceRangeChange={setPriceRange}
          onSave={toggleSaved}
          onOpen={setSelected}
          onProfile={() => setTab("Profile")}
          onOpenRoleSwitch={() => setLoginModalOpen(true)}
        />
      )}

      {tab === "Saved" && (
        <SavedPage
          items={items.filter((item) => savedIds.includes(item.id))}
          onSave={toggleSaved}
          onOpen={setSelected}
        />
      )}

      {tab === "Messages" && (
        <MessagesPage onBrowse={() => setTab("Explore")} />
      )}

      {tab === "MyListings" && (
        <MyListingsPage
          items={myListings}
          onOpen={setSelected}
          onSell={() => setSellOpen(true)}
        />
      )}

      {tab === "StudentPanel" && (
        <StudentPanelPage
          user={currentUser || initialStudents[0]}
          listingCount={myListings.length}
          onGoToSell={() => setSellOpen(true)}
          onSignOut={handleSignOutRole}
        />
      )}

      {tab === "AdminPanel" && (
        <AdminPanelPage
          listings={items}
          students={students}
          onAddListing={handleAdminAddListing}
          onDeleteListing={handleAdminDeleteListing}
          onRegisterStudent={handleAdminRegisterStudent}
          onDeleteStudent={handleAdminDeleteStudent}
        />
      )}

      {tab === "Profile" && (
        <ProfilePage
          user={user}
          savedCount={savedIds.length}
          listingCount={myListings.length}
          firebaseConfigured={firebaseConfigured}
          profileReady={profileReady}
          error={authError}
          onMyListings={() => setTab("MyListings")}
          onSaved={() => setTab("Saved")}
          onSignIn={() => setLoginModalOpen(true)}
          onSignOut={() => {
            if (auth) signOut(auth);
            setCurrentUser(null);
          }}
        />
      )}

      <BottomNav
        tab={tab}
        savedCount={savedIds.length}
        currentUserRole={currentUser?.role || "student"}
        onChange={setTab}
        onSell={() => setSellOpen(true)}
      />

      <ListingModal
        item={selected}
        user={user}
        onClose={() => setSelected(null)}
        onContact={contactSeller}
        onToggleSold={toggleSold}
      />

      <AuthModal
        visible={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={signInWithGoogle}
        error={authError}
      />

      <LoginModal
        visible={loginModalOpen}
        students={students}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleRoleLogin}
      />

      <SellModal
        visible={sellOpen}
        onClose={() => setSellOpen(false)}
        onSubmit={publish}
      />
    </SafeAreaView>
  );
}

function BottomNav({
  tab,
  savedCount,
  currentUserRole,
  onChange,
  onSell,
}: {
  tab: Tab;
  savedCount: number;
  currentUserRole: "student" | "admin";
  onChange: (tab: Tab) => void;
  onSell: () => void;
}) {
  return (
    <View style={styles.nav}>
      <NavItem
        label="Explore"
        icon="⌂"
        active={tab === "Explore"}
        onPress={() => onChange("Explore")}
      />
      <NavItem
        label="Saved"
        icon="♡"
        active={tab === "Saved"}
        badge={savedCount}
        onPress={() => onChange("Saved")}
      />
      <NavItem
        label="Messages"
        icon="□"
        active={tab === "Messages"}
        onPress={() => onChange("Messages")}
      />
      {currentUserRole === "admin" ? (
        <NavItem
          label="Admin"
          icon="🛡️"
          active={tab === "AdminPanel"}
          onPress={() => onChange("AdminPanel")}
        />
      ) : (
        <NavItem
          label="Portal"
          icon="🎓"
          active={tab === "StudentPanel"}
          onPress={() => onChange("StudentPanel")}
        />
      )}
      <Pressable style={styles.sellButton} onPress={onSell}>
        <Text style={styles.sellPlus}>＋</Text>
        <Text style={styles.sellText}>Sell</Text>
      </Pressable>
    </View>
  );
}

function NavItem({
  label,
  icon,
  active,
  badge,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <View>
        <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}

function ListingModal({
  item,
  user,
  onClose,
  onContact,
  onToggleSold,
}: {
  item: Listing | null;
  user: User | null;
  onClose: () => void;
  onContact: () => void;
  onToggleSold: (id: string) => void;
}) {
  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {item && (
        <View style={styles.backdrop}>
          <View style={styles.detail}>
            <Image source={{ uri: item.image }} style={styles.detailImage} />
            <Pressable style={styles.close} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
            <View style={styles.detailBody}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.detailCategory}>
                  {item.category.toUpperCase()}
                </Text>
                {item.isSold && (
                  <View style={styles.soldBadgeInModal}>
                    <Text style={styles.soldBadgeInModalText}>SOLD</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.detailTitle, item.isSold && styles.soldTitleText]}>
                {item.title}
              </Text>
              <Text style={[styles.detailPrice, item.isSold && styles.soldPriceText]}>
                ${item.price}
              </Text>
              <Text style={styles.muted}>
                {item.condition} · {item.campus} · {item.seller}
              </Text>
              <Text style={styles.description}>{item.description}</Text>

              {/* Action Buttons: Message + Mark as Sold */}
              <Pressable style={styles.primary} onPress={onContact}>
                <Text style={styles.primaryText}>
                  {`Message ${item.seller}`}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.soldToggleBtn,
                  item.isSold && styles.soldToggleBtnActive,
                ]}
                onPress={() => onToggleSold(item.id)}
              >
                <Text
                  style={[
                    styles.soldToggleBtnText,
                    item.isSold && styles.soldToggleBtnActiveText,
                  ]}
                >
                  {item.isSold ? "✓ Item Marked as Sold (Click to Re-list)" : "🏷 Mark as Sold"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

function AuthModal({
  visible,
  onClose,
  onSignIn,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  error: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.auth}>
          <Text style={styles.formTitle}>Welcome to campus marketplace</Text>
          <Text style={styles.authMessage}>
            Sign in to save listings, message sellers, and publish your own
            items.
          </Text>
          {error ? <Text style={styles.authError}>{error}</Text> : null}
          <Pressable style={styles.googleButton} onPress={onSignIn}>
            <Text style={styles.googleMark}>G</Text>
            <Text style={styles.outlineText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.outline} onPress={onClose}>
            <Text style={styles.outlineText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SellModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, price: string, category: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Textbooks");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Sell an item</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>What are you selling?</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Organic Chemistry textbook"
            style={styles.field}
          />
          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
            style={styles.field}
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.catPicker}>
            {["Textbooks", "Tech", "Furniture", "Fashion"].map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.catOption,
                  category === cat && styles.activeCatOption,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.catOptionText,
                    category === cat && styles.activeCatOptionText,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            disabled={!title || !price}
            style={[styles.primary, (!title || !price) && styles.disabled]}
            onPress={() => {
              onSubmit(title, price, category);
              setTitle("");
              setPrice("");
            }}
          >
            <Text style={styles.primaryText}>Publish listing</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F4" },
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EBE5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center", minWidth: 54 },
  navIcon: { color: "#83918A", fontSize: 20 },
  navLabel: { color: "#83918A", fontSize: 10, marginTop: 3 },
  navActive: { color: "#1D6B54", fontWeight: "700" },
  badge: {
    position: "absolute",
    right: -12,
    top: -3,
    backgroundColor: "#C3535B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  sellButton: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6F0E6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 4,
  },
  sellPlus: { color: "#247055", fontSize: 18 },
  sellText: { color: "#247055", fontWeight: "800", fontSize: 12 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,40,33,.45)",
    justifyContent: "flex-end",
  },
  detail: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  detailImage: { width: "100%", height: 230 },
  close: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#173C34", fontSize: 26 },
  detailBody: { padding: 24 },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldBadgeInModal: {
    backgroundColor: "#C3535B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soldBadgeInModalText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  detailCategory: {
    color: "#23775D",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  detailTitle: {
    color: "#173C34",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  soldTitleText: { textDecorationLine: "line-through", color: "#87918C" },
  detailPrice: {
    color: "#1C7057",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },
  soldPriceText: { color: "#87918C" },
  muted: { color: "#87918C", fontSize: 12, marginTop: 4 },
  description: {
    color: "#66736D",
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 16,
  },
  primary: {
    height: 48,
    backgroundColor: "#1F5D4C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: { color: "#FFF", fontWeight: "800" },
  soldToggleBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C3535B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#FFF",
  },
  soldToggleBtnActive: {
    backgroundColor: "#FDF1F2",
  },
  soldToggleBtnText: {
    color: "#C3535B",
    fontWeight: "700",
    fontSize: 13,
  },
  soldToggleBtnActiveText: {
    color: "#993B42",
  },
  auth: { backgroundColor: "#FFF", borderRadius: 20, padding: 24, margin: 20 },
  form: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formTitle: { color: "#173C34", fontSize: 22, fontWeight: "800" },
  authMessage: { color: "#87918C", lineHeight: 20, marginTop: 10 },
  authError: {
    color: "#B64950",
    backgroundColor: "#FBECEE",
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    marginTop: 16,
  },
  googleButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7DDD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 10,
  },
  googleMark: { color: "#4285F4", fontSize: 18, fontWeight: "800" },
  outline: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BCD0C3",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  outlineText: { color: "#1F5D4C", fontWeight: "800" },
  label: {
    color: "#365B4C",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 7,
  },
  field: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDE4DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#173C34",
  },
  disabled: { opacity: 0.45 },
  catPicker: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 10,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#ECEFE9",
    borderWidth: 1,
    borderColor: "#E2E7DF",
  },
  activeCatOption: {
    backgroundColor: "#1F5D4C",
    borderColor: "#1F5D4C",
  },
  catOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64736C",
  },
  activeCatOptionText: {
    color: "#FFF",
  },
});
