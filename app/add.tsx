import { supabase } from "@/services/supa";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
export default function Add() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [location, setLocation] = useState('')
  const [distance, setDistance] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("โปรดอนุญาติการเข้าถึงกล้องเพื่อถ่ายภาพ");
      return;
    }

    //เปิดกล้องเพื่อถ่ายภาพ
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    //หลักจากถ่ายเรียยบร้อยแล้ว เอาไปกับ state ที่เตรียมไว้
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  const photoSavedatatodb = async () => {
    if (!location || !distance || !base64Image) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    const filename = `run_${Date.now()}.jpg`;
    const bytecharactor = atob(base64Image);
    const bytenumber = new Array(bytecharactor.length);
    for (let i = 0; i < bytecharactor.length; i++) {
      bytenumber[i] = bytecharactor.charCodeAt(i);
    }
    const byteArray = new Uint8Array(bytenumber);
    const { error: uploadError } = await supabase.storage
      .from('run_bk')
      .upload(filename, byteArray, {
        contentType: 'image/jpeg',
      });
    if (uploadError) {
      Alert.alert("เกิดข้อผิดพลาดในการอัปโหลดภาพ" + uploadError.message);
      return;
    }
    let image_url = supabase.storage
      .from('run_bk')
      .getPublicUrl(filename).data.publicUrl;
    const { error: insertError } = await supabase.from('runs_tb').insert({
      location: location,
      distance: parseFloat(distance),
      time_of_day: timeOfDay,
      run_date: new Date().toISOString().split('T')[0],
      image_url: image_url,
    });
    if (insertError) {
      // ถ้าบันทึกลง table ไม่สำเร็จ ให้ลบรูปภาพที่เพิ่งอัปโหลดไปเพื่อป้องกันไฟล์ขยะ
      await supabase.storage.from('run_bk').remove([filename]);
      Alert.alert("Error", insertError.message);
      return;
    }
    Alert.alert("บันทึกข้อมูลเรียยบร้อย");
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* ป้อนสถานที่วิ่ง */}
        <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
        <TextInput placeholder="เช่น สวนลุมพินี" style={styles.inputValue} value={location} onChangeText={setLocation} />

        {/* ป้อนระยะทาง */}
        <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          placeholder="เช่น 5.2"
          keyboardType="numeric"
          style={styles.inputValue}
          value={distance}
          onChangeText={setDistance}
        />

        {/* เลือกช่วงเวลา */}
        <Text style={styles.titleShow}>ช่วงเวลา</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <TouchableOpacity style={[styles.todBtn, timeOfDay === 'เช้า' && styles.todbtnactive]} onPress={() => setTimeOfDay('เช้า')}>
            <Text style={[styles.todbtntxt, timeOfDay === 'เช้า' && styles.todbtntxtactive]}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.todBtn, timeOfDay === 'เย็น' && styles.todbtnactive]} onPress={() => setTimeOfDay('เย็น')}>
            <Text style={[styles.todbtntxt, timeOfDay === 'เย็น' && styles.todbtntxtactive]}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        {/* ปุ่มเปิดกล้องถ่ายภาพ */}
        <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
        <TouchableOpacity style={styles.takePhotoBtn} onPress={takePhoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="camera-outline" size={30} color="#b6b6b6" />
              <Text style={{ fontFamily: "Krub_400Regular", color: "#b6b6b6" }}>
                กดเพื่อถ่ายภาพ
              </Text>
            </View>
          )}</TouchableOpacity>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity style={styles.saveBtn} onPress={photoSavedatatodb}>
          <Text style={{ fontFamily: "Krub_700Bold", color: "#fff" }}>
            บันทึกข้อมูล
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  todBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#bdbdbdff",
  },
  todbtnactive: {
    backgroundColor: "#001affff",
  },
  todbtntxt: {
    color: "#000000ff",
    fontFamily: "Krub_400Regular",
  },
  todbtntxtactive: {
    color: "#ffffffff",
  },
  saveBtn: {
    padding: 15,
    backgroundColor: "#1889da",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  takePhotoBtn: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inputValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontFamily: "Krub_400Regular",
    backgroundColor: "#EFEFEF",
  },
  titleShow: {
    fontFamily: "Krub_700Bold",
    marginBottom: 10,
  },
});