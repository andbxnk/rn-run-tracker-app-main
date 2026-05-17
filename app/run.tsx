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
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageurl || item.image_url }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.location}</Text>
        <Text style={styles.cardText}>ระยะทาง: {item.distance} กม.</Text>
        <Text style={styles.cardText}>
          ช่วงเวลา: {item.timeOfDay || item.time_of_day}
        </Text>
        <Text style={styles.cardText}>วันที่: {item.run_date}</Text>
      </View>
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Krub_700Bold",
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontFamily: "Krub_400Regular",
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
