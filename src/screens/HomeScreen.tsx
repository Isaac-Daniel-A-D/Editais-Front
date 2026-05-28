import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchEditais, loadFavoriteEditalIds, toggleFavoriteEdital } from '../utils/api';
import { Edital } from '../types/Edital';
import { HomeStackParamList } from '../navigation/AppNavigator';
import { globalStyles } from '../styles/global';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Home'>>();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [loadMessage, setLoadMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [data, favorites] = await Promise.all([fetchEditais(), loadFavoriteEditalIds()]);
      setEditais(data);
      setFavoriteIds(favorites);
      setLoadMessage(data.some(item => item.source === 'mock') ? 'Exibindo dados demonstrativos porque o armazenamento do backend ou a API pública não respondeu.' : '');
    } catch (error) {
      console.warn('Falha inesperada ao carregar editais:', error);
      setLoadMessage('Não foi possível carregar os editais neste momento.');
      setEditais([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleToggleFavorite = async (event: GestureResponderEvent, editalId: string) => {
    event.stopPropagation();
    const nextIsFavorite = await toggleFavoriteEdital(editalId);
    setFavoriteIds(prev => nextIsFavorite ? [...prev, editalId] : prev.filter(id => id !== editalId));
  };

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(editais.map(edital => edital.region).filter(Boolean)));
    return ['Todas', ...uniqueRegions];
  }, [editais]);

  const filtered = useMemo(() => {
    return editais.filter(edital => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        edital.title.toLowerCase().includes(query) ||
        edital.cnae.toLowerCase().includes(query) ||
        edital.region.toLowerCase().includes(query) ||
        (edital.orgao ?? '').toLowerCase().includes(query);
      const matchesRegion = regionFilter === 'Todas' || edital.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [editais, search, regionFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editais para MEIs</Text>
        <Text style={styles.subtitle}>Filtre, favorite e acompanhe propostas com checklist e documentos.</Text>
      </View>

      {loadMessage ? <Text style={styles.infoBanner}>{loadMessage}</Text> : null}

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título, órgão, modalidade ou região"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterRow}>
        {regions.map(region => (
          <TouchableOpacity
            key={region}
            onPress={() => setRegionFilter(region)}
            style={[
              styles.filterChip,
              regionFilter === region && styles.filterChipActive,
            ]}
          >
            <Text style={[styles.filterText, regionFilter === region && styles.filterTextActive]}>{region}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={globalStyles.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum edital encontrado.</Text>}
          renderItem={({ item }) => {
            const isFavorite = favoriteIds.includes(item.id);
            return (
              <TouchableOpacity
                style={[styles.card, isFavorite && styles.cardFavorite]}
                onPress={() => navigation.navigate('EditalDetail', { editalId: item.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardStatus}>{item.source === 'mock' ? 'Mock' : 'Aberto'}</Text>
                </View>
                <Text style={styles.cardMeta}>{item.region} • {item.cnae}</Text>
                <Text style={styles.cardMeta}>{item.valueRange} • Prazo {item.deadline}</Text>
                {item.orgao ? <Text style={styles.cardMeta}>Órgão: {item.orgao}</Text> : null}
                <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
                <TouchableOpacity
                  onPress={event => handleToggleFavorite(event, item.id)}
                  style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                >
                  <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
                    {isFavorite ? 'Remover dos favoritos' : 'Favoritar edital'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
  },
  header: {
    padding: 16,
    backgroundColor: globalStyles.primaryColor,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#E8EAF6',
    marginTop: 4,
  },
  infoBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    color: '#5D4037',
    fontSize: 13,
    lineHeight: 18,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#212121',
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: globalStyles.primaryColor,
  },
  filterText: {
    color: '#424242',
  },
  filterTextActive: {
    color: globalStyles.primaryColor,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardFavorite: {
    borderWidth: 1,
    borderColor: '#F9A825',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  cardStatus: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  cardMeta: {
    marginTop: 6,
    color: '#616161',
    fontSize: 13,
  },
  cardDescription: {
    marginTop: 10,
    color: '#424242',
    fontSize: 14,
    lineHeight: 20,
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF8E1',
  },
  favoriteText: {
    color: '#424242',
    fontWeight: '700',
  },
  favoriteTextActive: {
    color: '#F57F17',
  },
});
