// Offline detection and connection status for NGINE
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useNgineStore } from './store'

export function useOfflineDetection() {
  const setIsOnline = useNgineStore((state) => state.setIsOnline)

  useEffect(() => {
    // Check initial connection
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false)
    })

    // Subscribe to connection changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false)
    })

    return () => {
      unsubscribe()
    }
  }, [setIsOnline])
}

