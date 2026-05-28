import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchFavoriteEditais, getProposalStateForEdital, toggleDocumentStatus } from '../utils/api';
import { Edital } from '../types/Edital';
import { globalStyles } from '../styles/global';

export default function DocumentsScreen() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadMessage, setLoadMessage] = useState('');
  const [proposalState, setProposalState] = useState<Record<string, Record<string, boolean>>>({});

  const loadDocuments = useCallback(async () => {
    const data = await fetchFavoriteEditais();
    const states = await Promise.all(data.map(async edital => {
      const state = await getProposalStateForEdital(edital.id);
      return [edital.id, state.documents] as const;
    }));
    setEditais(data);
    setProposalState(Object.fromEntries(states));
    if (data.length === 0) {
      setLoadMessage('Favorite um edital na aba Editais para organizar os documentos aqui.');
    } else {
      setLoadMessage(data.some(item => item.source === 'mock') ? 'Exibindo documentos dos editais demonstrativos favoritados.' : '');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          await loadDocuments();
        } catch (error) {
          console.warn('Falha inesperada ao carregar documentos:', error);
          setLoadMessage('Não foi possível carregar os documentos neste momento.');
          setEditais([]);
          setProposalState({});
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [loadDocuments])
  );

  const refresh = async () => {
    try {
      setRefreshing(true);
      await loadDocuments();
    } catch (error) {
      console.warn('Falha inesperada ao atualizar documentos:', error);
      setLoadMessage('Não foi possível atualizar os documentos neste momento.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggle = async (editalId: string, documentId: string) => {
    await toggleDocumentStatus(editalId, documentId);
    const state = await getProposalStateForEdital(editalId);
    setProposalState(prev => ({ ...prev, [editalId]: state.documents }));
  };

  const renderDocument = (edital: Edital) => ({ item }: { item: Edital['documents'][number] }) => {
    const uploaded = proposalState[edital.id]?.[item.id];
    return (
      <View style={styles.documentRow}>
        <View style={styles.documentInfo}>
          <Text style={styles.documentLabel}>{item.label}</Text>
          <Text style={styles.documentText}>{item.description}</Text>
        </View>
        <TouchableOpacity onPress={() => handleToggle(edital.id, item.id)} style={styles.documentButton}>
          <Text style={styles.documentButtonText}>{uploaded ? 'Marcar pendente' : 'Marcar enviado'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documentos de habilitação</Text>
        <Text style={styles.subtitle}>Organize os arquivos exigidos apenas para editais favoritados.</Text>
      </View>

      {loadMessage ? <Text style={styles.infoBanner}>{loadMessage}</Text> : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={globalStyles.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={editais}
          keyExtractor={item => item.id}
          onRefresh={refresh}
          refreshing={refreshing}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum edital favoritado disponível.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>Região: {item.region}</Text>
              <Text style={styles.cardMeta}>Modalidade: {item.cnae}</Text>
              <View style={styles.divider} />
              <FlatList
                data={item.documents}
                keyExtractor={document => document.id}
                renderItem={renderDocument(item)}
                scrollEnabled={false}
              />
            </View>
          )}
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
    fontWeight: '700',
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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 240,
  },
  emptyText: {
    marginTop: 20,
    color: '#757575',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  cardMeta: {
    marginTop: 6,
    color: '#616161',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 14,
  },
  documentRow: {
    marginBottom: 14,
  },
  documentInfo: {
    marginBottom: 8,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  documentText: {
    marginTop: 4,
    color: '#616161',
    fontSize: 13,
  },
  documentButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  documentButtonText: {
    color: '#424242',
    fontWeight: '700',
  },
});
