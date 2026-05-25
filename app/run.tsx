import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Image, Text, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { supabase } from "@/services/supa";

export default function Run() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("runs_tb")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      Alert.alert("Error fetching runs", error.message);
    } else {
      setRuns(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageurl || item.image_url }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardTextGroup}>
          <Text style={styles.cardTitle}>{item.location}</Text>
          <Text style={styles.cardDate}>{item.run_date}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardDistance}>{item.distance} km</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ส่วนแสดงรูป Logo */}
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.runlogo}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#00f" style={styles.loader} />
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ยังไม่มีข้อมูลการวิ่ง</Text>
          }
        />
      )}

      {/* ส่วนแสดงปุ่มเปิดไปหน้าจอ /add */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  runlogo: {
    width: 125,
    height: 125,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    margin: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingRight: 4,
  },
  cardTextGroup: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Krub_700Bold",
    color: "#222",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    fontFamily: "Krub_400Regular",
    color: "#999",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDistance: {
    fontSize: 15,
    fontFamily: "Krub_700Bold",
    color: "#1889da",
    marginRight: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
    fontFamily: "Krub_400Regular",
  },
  addBtn: {
    position: "absolute",
    bottom: 70,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: "#1889da",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});