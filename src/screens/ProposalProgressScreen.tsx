import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchFavoriteEditais, getProposalStateForEdital } from '../utils/api';
import { Edital } from '../types/Edital';
import { globalStyles } from '../styles/global';

export default function ProposalProgressScreen() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState('');
  const [proposalState, setProposalState] = useState<Record<string, { checklist: Record<string, boolean>; documents: Record<string, boolean> }>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFavoriteEditais();
      const states = await Promise.all(data.map(async edital => {
        const state = await getProposalStateForEdital(edital.id);
        return [edital.id, state] as const;
      }));
      setEditais(data);
      setProposalState(Object.fromEntries(states));
      if (data.length === 0) {
        setLoadMessage('Favorite um edital na aba Editais para acompanhar a proposta aqui.');
      } else {
        setLoadMessage(data.some(item => item.source === 'mock') ? 'Progresso calculado com editais demonstrativos favoritados enquanto o armazenamento/backend não responde.' : '');
      }
    } catch (error) {
      console.warn('Falha inesperada ao carregar progresso:', error);
      setLoadMessage('Não foi possível carregar o acompanhamento de propostas neste momento.');
      setEditais([]);
      setProposalState({});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const progressList = useMemo(() => {
    return editais.map(edital => {
      const state = proposalState[edital.id] ?? { checklist: {}, documents: {} };
      const checklistCount = edital.requirements.length;
      const checklistDone = edital.requirements.filter(item => state.checklist[item.id]).length;
      const documentsCount = edital.documents.length;
      const documentsDone = edital.documents.filter(doc => state.documents[doc.id]).length;
      const checklistRate = checklistCount > 0 ? Math.round((checklistDone / checklistCount) * 100) : 0;
      const documentsRate = documentsCount > 0 ? Math.round((documentsDone / documentsCount) * 100) : 0;
      const overall = Math.round((checklistRate + documentsRate) / 2);
      return {
        id: edital.id,
        title: edital.title,
        checklistRate,
        documentsRate,
        overall,
        due: edital.deadline,
        source: edital.source,
      };
    });
  }, [editais, proposalState]);

  const overallAverage = useMemo(() => {
    if (progressList.length === 0) return 0;
    return Math.round(progressList.reduce((sum, item) => sum + item.overall, 0) / progressList.length);
  }, [progressList]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Acompanhamento de propostas</Text>
        <Text style={styles.subtitle}>Visão geral apenas dos editais favoritados.</Text>
      </View>

      {loadMessage ? <Text style={styles.infoBanner}>{loadMessage}</Text> : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={globalStyles.primaryColor} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Progresso médio dos favoritos</Text>
            <Text style={styles.summaryValue}>{overallAverage}%</Text>
          </View>

          <FlatList
            data={progressList}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>Ainda não há editais favoritados para acompanhar.</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Prazo: {item.due}</Text>
                {item.source === 'mock' ? <Text style={styles.cardMeta}>Origem: dados demonstrativos</Text> : null}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Checklist</Text>
                  <Text style={styles.progressValue}>{item.checklistRate}%</Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Documentos</Text>
                  <Text style={styles.progressValue}>{item.documentsRate}%</Text>
                </View>
                <View style={styles.progressRow}> 
                  <Text style={styles.progressLabel}>Operacional</Text>
                  <Text style={styles.progressValue}>{item.overall}%</Text>
                </View>
              </View>
            )}
          />
        </View>
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
    marginTop: 4,
    color: '#E8EAF6',
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
  body: {
    flex: 1,
    padding: 16,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 240,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  summaryLabel: {
    color: '#616161',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  list: {
    paddingBottom: 32,
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
    marginTop: 24,
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    color: '#424242',
    fontWeight: '600',
  },
  progressValue: {
    fontWeight: '700',
    color: '#212121',
  },
});
