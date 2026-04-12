import { io, Socket } from 'socket.io-client';

// The URL of your Groovra Jam Server (WebSocket)
// In a real production app, this would be an environment variable
const SOCKET_URL = process.env.NEXT_PUBLIC_JAM_SERVER_URL || 'http://localhost:3001';

class SocketService {
  public socket: Socket | null = null;
  private roomId: string | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Groovra Jam Server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Jam Server');
    });

    // Listen for sync events
    this.socket.on('sync_track', (data) => {
      console.log('🎵 Syncing track:', data);
      // Here you would call usePlayerStore.getState().play(data.track)
    });

    this.socket.on('sync_play_state', (data) => {
      console.log('⏯️ Syncing play state:', data);
      // Here you would call usePlayerStore.getState().togglePlay(data.isPlaying)
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket) this.connect();
    this.roomId = roomId;
    this.socket?.emit('join_room', { roomId });
    console.log(`🏠 Joined Jam Room: ${roomId}`);
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket?.emit('leave_room', { roomId: this.roomId });
      this.roomId = null;
    }
  }

  emitTrackChange(track: any) {
    if (this.roomId && this.socket) {
      this.socket.emit('change_track', { roomId: this.roomId, track });
    }
  }

  emitPlayState(isPlaying: boolean, currentTime: number) {
    if (this.roomId && this.socket) {
      this.socket.emit('play_state', { roomId: this.roomId, isPlaying, currentTime });
    }
  }
}

export const socketService = new SocketService();
