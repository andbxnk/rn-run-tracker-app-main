import { supabase } from "@/services/supa";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditRun() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [runDate, setRunDate] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  useEffect(() => {
    fetchRunData();
  }, [id]);

  const fetchRunData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("runs_tb")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Error fetching run data", error.message);
    } else if (data) {
      setLocation(data.location || "");
      setDistance(data.distance?.toString() || "");
      setTimeOfDay(data.timeOfDay || data.time_of_day || "");
      setRunDate(data.run_date || "");
      setExistingImageUrl(data.imageurl || data.image_url || null);
    }
    setLoading(false);
  };
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("โปรดอนุญาติการเข้าถึงกล้องเพื่อถ่ายภาพ");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  const saveChanges = async () => {
    if (!location || !distance) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setSaving(true);

    let imageurl = existingImageUrl;

    if (base64Image) {
      const filename = `run_${Date.now()}.jpg`;
      const bytecharactor = atob(base64Image);
      const bytenumber = new Array(bytecharactor.length);
      for (let i = 0; i < bytecharactor.length; i++) {
        bytenumber[i] = bytecharactor.charCodeAt(i);
      }
      const byteArray = new Uint8Array(bytenumber);
      const { error: uploadError } = await supabase.storage
        .from("run-img-bk")
        .upload(filename, byteArray, {
          contentType: "image/jpeg",
        });
      if (uploadError) {
        Alert.alert("เกิดข้อผิดพลาดในการอัปโหลดภาพ", uploadError.message);
        setSaving(false);
        return;
      }
      imageurl = supabase.storage.from("run-img-bk").getPublicUrl(filename)
        .data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("runs_tb")
      .update({
        location: location,
        distance: parseFloat(distance),
        timeOfDay: timeOfDay,
        imageurl: imageurl,
      })
      .eq("id", id);

    if (updateError) {
      Alert.alert("Error", updateError.message);
      setSaving(false);
      return;
    }

    Alert.alert("แก้ไขข้อมูลเรียบร้อย");
    setSaving(false);
    router.back();
  };

  const deleteRun = async () => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบข้อมูลการวิ่งนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          // ลบรูปภาพจาก storage ก่อน
          const imageUrl = existingImageUrl;
          if (imageUrl) {
            const filename = imageUrl.split("/").pop();
            if (filename) {
              await supabase.storage.from("run-img-bk").remove([filename]);
            }
          }

          const { error } = await supabase
            .from("runs_tb")
            .delete()
            .eq("id", id);

          if (error) {
            Alert.alert("Error", error.message);
          } else {
            Alert.alert("ลบข้อมูลเรียบร้อย");
            router.back();
          }
        },
      },
    ]);
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1889da" />
      </View>
    );
  }

  const displayImage = imageUri || existingImageUrl;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1 }} bounces={false}>
        <TouchableOpacity activeOpacity={0.8} onPress={takePhoto}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="camera-outline" size={40} color="#b6b6b6" />
              <Text style={styles.heroPlaceholderText}>กดเพื่อถ่ายภาพ</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>สถานที่</Text>
          <TextInput
            placeholder="เช่น สวนลุมพินี"
            placeholderTextColor="#aaa"
            style={styles.fieldInput}
            value={location}
            onChangeText={setLocation}
          />
          <View style={styles.fieldDivider} />

          <Text style={styles.fieldLabel}>ระยะทาง (กม.)</Text>
          <TextInput
            placeholder="เช่น 5.2"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            style={styles.fieldInput}
            value={distance}
            onChangeText={setDistance}
          />
          <View style={styles.fieldDivider} />

          <Text style={styles.fieldLabel}>ช่วงเวลา</Text>
          <View style={styles.todRow}>
            <TouchableOpacity
              style={[
                styles.todBtn,
                timeOfDay === "เช้า" && styles.todbtnactive,
              ]}
              onPress={() => setTimeOfDay("เช้า")}
            >
              <Text
                style={[
                  styles.todbtntxt,
                  timeOfDay === "เช้า" && styles.todbtntxtactive,
                ]}
              >
                เช้า
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.todBtn,
                timeOfDay === "เย็น" && styles.todbtnactive,
              ]}
              onPress={() => setTimeOfDay("เย็น")}
            >
              <Text
                style={[
                  styles.todbtntxt,
                  timeOfDay === "เย็น" && styles.todbtntxtactive,
                ]}
              >
                เย็น
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={saveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>บันทึกการแก้ไข</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={deleteRun}>
            <Ionicons
              name="trash-outline"
              size={18}
              color="#e53935"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.deleteBtnText}>ลบรายการนี้</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ===== Header ===== */
  header: {
    backgroundColor: "#e91e90",
    paddingTop:
      Platform.OS === "ios"
        ? 50
        : StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 40,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Krub_700Bold",
  },

  /* ===== Hero Image ===== */
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#e0e0e0",
  },
  heroPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroPlaceholderText: {
    fontFamily: "Krub_400Regular",
    color: "#b6b6b6",
    marginTop: 6,
  },

  /* ===== Form Card ===== */
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: 400,
  },

  /* ===== Fields ===== */
  fieldLabel: {
    fontFamily: "Krub_700Bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  fieldInput: {
    fontFamily: "Krub_400Regular",
    fontSize: 16,
    color: "#1889da",
    paddingVertical: 8,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 18,
  },

  /* ===== Time of Day ===== */
  todRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 30,
  },
  todBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  todbtnactive: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  todbtntxt: {
    color: "#333",
    fontFamily: "Krub_400Regular",
    fontSize: 14,
  },
  todbtntxtactive: {
    color: "#fff",
  },

  /* ===== Save Button ===== */
  saveBtn: {
    paddingVertical: 16,
    backgroundColor: "#1889da",
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontFamily: "Krub_700Bold",
    color: "#fff",
    fontSize: 16,
  },

  /* ===== Delete Button ===== */
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 10,
  },
  deleteBtnText: {
    fontFamily: "Krub_700Bold",
    color: "#e53935",
    fontSize: 14,
  },
});
