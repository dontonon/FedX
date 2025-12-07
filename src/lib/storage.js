// Local Storage utilities with future Supabase support

const STORAGE_KEYS = {
  POSITIONS: 'fedx_positions',
  SNAPSHOTS: 'fedx_snapshots',
  SETTINGS: 'fedx_settings',
  LAST_SYNC: 'fedx_last_sync',
};

// Check if localStorage is available
function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Generic storage operations
export const storage = {
  get(key) {
    if (!isLocalStorageAvailable()) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },

  set(key, value) {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },

  remove(key) {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },

  clear() {
    if (!isLocalStorageAvailable()) return false;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  },
};

// Position-specific operations
export const positionStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.POSITIONS) || [];
  },

  saveAll(positions) {
    return storage.set(STORAGE_KEYS.POSITIONS, positions);
  },

  add(position) {
    const positions = this.getAll();
    positions.push(position);
    return this.saveAll(positions);
  },

  update(id, updates) {
    const positions = this.getAll();
    const index = positions.findIndex(p => p.id === id);
    if (index === -1) return false;
    positions[index] = { ...positions[index], ...updates };
    return this.saveAll(positions);
  },

  remove(id) {
    const positions = this.getAll();
    const filtered = positions.filter(p => p.id !== id);
    return this.saveAll(filtered);
  },
};

// Snapshot operations for historical tracking
export const snapshotStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.SNAPSHOTS) || [];
  },

  save(snapshot) {
    const snapshots = this.getAll();
    snapshots.push({
      ...snapshot,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });

    // Keep only last 100 snapshots
    const trimmed = snapshots.slice(-100);
    return storage.set(STORAGE_KEYS.SNAPSHOTS, trimmed);
  },

  getLatest() {
    const snapshots = this.getAll();
    return snapshots[snapshots.length - 1] || null;
  },

  clear() {
    return storage.set(STORAGE_KEYS.SNAPSHOTS, []);
  },
};

// Settings operations
export const settingsStorage = {
  get() {
    return storage.get(STORAGE_KEYS.SETTINGS) || {
      walletAddress: '',
      theme: 'dark',
      currency: 'USD',
      refreshInterval: 60000, // 1 minute
    };
  },

  save(settings) {
    return storage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  update(updates) {
    const current = this.get();
    return this.save({ ...current, ...updates });
  },
};

// Export/Import functionality
export const dataExport = {
  exportAll() {
    const data = {
      positions: positionStorage.getAll(),
      snapshots: snapshotStorage.getAll(),
      settings: settingsStorage.get(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fedx-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  async importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);

          if (data.positions) {
            positionStorage.saveAll(data.positions);
          }
          if (data.snapshots) {
            storage.set(STORAGE_KEYS.SNAPSHOTS, data.snapshots);
          }
          if (data.settings) {
            settingsStorage.save(data.settings);
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Invalid export file format'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
