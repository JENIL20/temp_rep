# Redux Persist Implementation Guide

## 🎯 Overview

Your Redux store is now configured with **Redux Persist**, which automatically saves your application state to `localStorage` and restores it when the page refreshes. This prevents data loss and improves user experience.

## 📦 What Was Installed

```bash
npm install redux-persist
```

## 🔧 Configuration Details

### 1. Store Configuration (`src/store/index.ts`)

The store has been updated with the following key changes:

- **Combined Reducers**: All reducers are combined using `combineReducers`
- **Persist Config**: Defines what to persist and where to store it
- **Persisted Reducer**: Wraps the root reducer with persistence capabilities
- **Persistor**: Creates a persistor instance to manage rehydration

```typescript
const persistConfig = {
  key: 'root',                    // Key in localStorage
  storage,                        // Uses localStorage by default
  whitelist: ['auth'],            // Only persist auth reducer
  // blacklist: [],               // Add reducers you DON'T want to persist
};
```

### 2. App Component (`src/App.tsx`)

The app is now wrapped with `PersistGate`:

```typescript
<Provider store={store}>
  <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
    <AuthInitializer>
      <AppRoutes />
    </AuthInitializer>
  </PersistGate>
</Provider>
```

**PersistGate** delays rendering until the persisted state is retrieved from storage.

### 3. Auth Slice (`src/features/auth/authSlice.ts`)

Removed manual `localStorage` handling since Redux Persist handles it automatically:

- ✅ No more `localStorage.setItem()` in reducers
- ✅ No more `localStorage.getItem()` in initial state
- ✅ Cleaner, more maintainable code

## 🚀 How It Works

### Automatic Persistence

1. **On State Change**: Whenever your Redux state changes, Redux Persist automatically saves it to localStorage
2. **On Page Load**: When the app loads, Redux Persist retrieves the saved state from localStorage
3. **Rehydration**: The state is "rehydrated" (restored) before your app renders

### Storage Location

Open your browser's DevTools → Application → Local Storage → `http://localhost:3000`

You'll see a key called `persist:root` containing your persisted state.

## 📝 Adding More Reducers to Persist

To persist additional reducers, update the `whitelist` in `src/store/index.ts`:

```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'settings'], // Add more reducers here
};
```

## 🚫 Excluding Reducers from Persistence

To exclude specific reducers, use the `blacklist`:

```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  blacklist: ['ui', 'temp'], // These won't be persisted
};
```

## 🧹 Clearing Persisted State

### Programmatically

```typescript
import { persistor } from './store';

// Clear all persisted state
persistor.purge();

// Or pause persistence
persistor.pause();

// Resume persistence
persistor.persist();
```

### Manually

In browser DevTools:
1. Application → Local Storage
2. Delete the `persist:root` key

## 🔄 Migration Between Versions

If you change your state structure, you may need to handle migrations:

```typescript
import { createMigrate } from 'redux-persist';

const migrations = {
  0: (state) => {
    // Migration for version 0
    return state;
  },
  1: (state) => {
    // Migration for version 1
    return {
      ...state,
      newField: 'default value',
    };
  },
};

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  migrate: createMigrate(migrations, { debug: false }),
  whitelist: ['auth'],
};
```

## 🎨 Customizing the Loading Screen

Update the `loading` prop in `PersistGate`:

```typescript
<PersistGate 
  loading={
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  } 
  persistor={persistor}
>
  {/* Your app */}
</PersistGate>
```

## 🐛 Debugging

### Enable Debug Mode

```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  debug: true, // Enable debug logging
};
```

### Check Rehydration Status

```typescript
import { useEffect } from 'react';
import { useAppSelector } from './store';

function MyComponent() {
  const isRehydrated = useAppSelector((state) => state._persist?.rehydrated);
  
  useEffect(() => {
    console.log('Rehydration complete:', isRehydrated);
  }, [isRehydrated]);
}
```

## ⚡ Performance Tips

1. **Selective Persistence**: Only persist what you need (use whitelist)
2. **Throttle Writes**: For frequently changing state, consider throttling
3. **Nested Persistence**: Persist only specific parts of large reducers

### Example: Nested Persistence

```typescript
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['profile', 'preferences'], // Only persist these fields
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: persistReducer(userPersistConfig, userReducer),
});
```

## 🔒 Security Considerations

1. **Sensitive Data**: Don't persist sensitive data like passwords or credit card info
2. **Token Expiry**: Implement token refresh logic for expired tokens
3. **Encryption**: For sensitive data, consider encrypting before persisting

### Example: Encrypted Storage

```bash
npm install redux-persist-transform-encrypt
```

```typescript
import { encryptTransform } from 'redux-persist-transform-encrypt';

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    encryptTransform({
      secretKey: 'your-secret-key',
      onError: (error) => {
        console.error('Encryption error:', error);
      },
    }),
  ],
  whitelist: ['auth'],
};
```

## ✅ Testing

Your Redux Persist setup is working if:

1. ✅ Login to your app
2. ✅ Refresh the page (F5 or Cmd+R)
3. ✅ You remain logged in
4. ✅ All your state is preserved

## 📚 Additional Resources

- [Redux Persist Documentation](https://github.com/rt2zz/redux-persist)
- [Redux Toolkit with Persist](https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist)
- [Storage Engines](https://github.com/rt2zz/redux-persist#storage-engines)

## 🎉 Summary

Your app now has:
- ✅ Automatic state persistence to localStorage
- ✅ State restoration on page refresh
- ✅ Clean, maintainable code without manual localStorage calls
- ✅ Configurable persistence options
- ✅ Loading state during rehydration

**No more data loss on refresh!** 🚀
