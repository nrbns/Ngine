// Comprehensive realtime hook for NGINE
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../api/supabase'
import { useNgineStore } from '../store'
import { getTodayStatus } from '../utils/realtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  resolutionId?: string
  userId?: string
  enabled?: boolean
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    resolutionId,
    userId,
    enabled = true,
  } = options

  const {
    userId: storeUserId,
    activeResolution,
    setTodayStatus,
    addCheckin,
    updateCheckin,
    addResolution,
    updateResolution,
    addProof,
    setIsOnline,
    setLastSync,
  } = useNgineStore()

  const channelRef = useRef<RealtimeChannel | null>(null)
  const effectiveUserId = userId || storeUserId

  // Update today status when check-ins change
  const refreshTodayStatus = useCallback(async () => {
    if (!activeResolution || !effectiveUserId) return

    try {
      const status = await getTodayStatus(activeResolution.id, effectiveUserId)
      setTodayStatus(status)
      setLastSync(new Date())
    } catch (error) {
      console.error('Error refreshing today status:', error)
    }
  }, [activeResolution, effectiveUserId, setTodayStatus, setLastSync])

  useEffect(() => {
    if (!enabled) return

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
      setIsOnline(false)
      return
    }

    setIsOnline(true)

    // Create a unique channel for this hook instance
    const channelName = `ngine-${effectiveUserId || 'anonymous'}-${resolutionId || 'global'}`
    const channel = supabase.channel(channelName)

    // Subscribe to check-ins changes
    if (resolutionId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkins',
          filter: `resolution_id=eq.${resolutionId}`,
        },
        (payload) => {
          console.log('Realtime check-in update:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT' && payload.new) {
            addCheckin(payload.new as any)
            refreshTodayStatus()
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            updateCheckin(payload.new.id, payload.new as any)
            refreshTodayStatus()
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Handle deletion if needed
            refreshTodayStatus()
          }
        }
      )
    }

    // Subscribe to resolutions changes (for active resolution)
    if (effectiveUserId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resolutions',
          filter: `user_id=eq.${effectiveUserId}`,
        },
        (payload) => {
          console.log('Realtime resolution update:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT' && payload.new) {
            addResolution(payload.new as any)
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            updateResolution(payload.new.id, payload.new as any)
          }
        }
      )
    }

    // Subscribe to proofs changes
    if (resolutionId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal_proofs',
          filter: `resolution_id=eq.${resolutionId}`,
        },
        (payload) => {
          console.log('Realtime proof update:', payload.eventType, payload.new)

          if (payload.eventType === 'INSERT' && payload.new) {
            addProof(payload.new as any)
          }
        }
      )
    }

    // Subscribe to connection status
    channel.on('system', {}, (payload) => {
      if (payload.status === 'SUBSCRIBED') {
        setIsOnline(true)
        setLastSync(new Date())
      } else if (payload.status === 'CHANNEL_ERROR') {
        setIsOnline(false)
      }
    })

    channel.subscribe((status) => {
      console.log('Realtime channel status:', status)
      if (status === 'SUBSCRIBED') {
        setIsOnline(true)
        setLastSync(new Date())
        // Initial refresh
        refreshTodayStatus()
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsOnline(false)
      }
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [enabled, resolutionId, effectiveUserId, addCheckin, updateCheckin, addResolution, updateResolution, addProof, setIsOnline, setLastSync, refreshTodayStatus])

  return {
    isOnline: useNgineStore((state) => state.isOnline),
    lastSync: useNgineStore((state) => state.lastSync),
    refreshTodayStatus,
  }
}

