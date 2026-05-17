import { ActivityIndicator, StyleSheet, Text, View,Image } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function index() {

  const router = useRouter()

  const LoadingScreen = () => {
    setTimeout(() => {
      router.replace('/run')
    }, 3000)
  }

  useEffect(() => {
    LoadingScreen()
  }, [])

  return (
    <View style={styles.container}>
      <Image source={ require('@/assets/images/logo.png')} style={styles.runlogo} />
      <Text style={styles.runtitle1}>Run Tracker</Text>
      <Text style={styles.runtitle2}>วิ่งเพื่อสุขภาพ</Text>
      <ActivityIndicator size="large" color="#1619ec" style={{marginTop: 20}} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  runlogo: {
    width: 100,
    height: 100
  },
  runtitle1: {
    fontSize: 32,
    color: "#505050",
    fontFamily: "Krub_400Regular"
  },
  runtitle2: {
    fontSize: 24,
    color: "#1619ec",
    fontFamily: "Krub_700Regular"
  }
})