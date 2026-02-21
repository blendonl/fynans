import { useState } from "react";
import { Alert } from "react-native";
import { storeControllerFindAll, storeControllerCreate } from '../../../api/generated/endpoints/store/store';
import type { StoreResponseDto } from '../../../api/generated/model';

type Store = StoreResponseDto;

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeInput, setStoreInput] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStores = async (search: string) => {
    try {
      const { data: response } = await storeControllerFindAll({ search });
      setStores(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const handleStoreInputChange = (text: string) => {
    setStoreInput(text);
    setShowStoreDropdown(true);
    if (text.length > 0) {
      fetchStores(text);
    } else {
      setStores([]);
    }
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setStoreInput(store.name);
    setStoreLocation(store.location);
    setStores([]);
    setShowStoreDropdown(false);
  };

  const handleOpenAddStoreModal = () => {
    setNewStoreName(storeInput);
    setNewStoreLocation("");
    setShowStoreDropdown(false);
    setShowAddStoreModal(true);
  };

  const handleCreateNewStore = async () => {
    if (!newStoreName.trim()) {
      Alert.alert("Error", "Please enter store name");
      return;
    }
    if (!newStoreLocation.trim()) {
      Alert.alert("Error", "Please enter store location");
      return;
    }

    try {
      setLoading(true);
      const { data: created } = await storeControllerCreate({
        name: newStoreName.trim(),
        location: newStoreLocation.trim(),
      });

      const newStore: Store = {
        id: created.id,
        name: created.name,
        location: created.location,
      };

      setSelectedStore(newStore);
      setStoreInput(newStore.name);
      setStoreLocation(newStore.location);
      setShowAddStoreModal(false);
      setNewStoreName("");
      setNewStoreLocation("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  const clearStore = () => {
    setSelectedStore(null);
    setStoreInput("");
    setStoreLocation("");
    setShowStoreDropdown(true);
  };

  return {
    stores,
    selectedStore,
    storeInput,
    storeLocation,
    showStoreDropdown,
    showAddStoreModal,
    newStoreName,
    newStoreLocation,
    loading,
    handleStoreInputChange,
    handleStoreSelect,
    handleOpenAddStoreModal,
    handleCreateNewStore,
    clearStore,
    setShowAddStoreModal,
    setNewStoreName,
    setNewStoreLocation,
    setShowStoreDropdown,
    setStoreInput,
    setStoreLocation,
  };
}
