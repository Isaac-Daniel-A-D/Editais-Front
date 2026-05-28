import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import {
  fetchEditalById,
  getProposalStateForEdital,
  isEditalFavorite,
  toggleChecklistItem,
  toggleFavoriteEdital,
} from '../utils/api';
import { Edital, ProposalState } from '../types/Edital';
import { globalStyles } from '../styles/global';

type RouteProps = RouteProp<HomeStackParamList, 'EditalDetail'>;

export default function EditalDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { editalId } = route.params;
  const [edital, setEdital] = useState<Edital | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState('');
  const [proposalState, setProposalState] = useState<ProposalState>({ checklist: {}, documents: {} });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const selected = await fetchEditalById(editalId);
        const state = await getProposalStateForEdital(editalId);
        const favorite = await isEditalFavorite(editalId);
        setEdital(selected ?? null);
        setIsFavorite(favorite);
        setLoadMessage(selected?.source === 'mock' ? 'Este edital vem dos dados demonstrativos de contingência.' : '');
        setProposalState({ checklist: { [editalId]: state.checklist }, documents: { [editalId]: state.documents } });
      } catch (error) {
        console.warn('Falha inesperada ao carregar detalhe do edital:', error);
        setLoadMessage('Não foi possível carregar o edital neste momento.');
        setEdital(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editalId]);

  const checklist = edital?.requirements ?? [];
  const checkedCount = checklist.filter(item => proposalState.checklist[editalId]?.[item.id]).length;
  const checklistRate = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;
  const documents = edital?.documents ?? [];
  const uploadedDocsCount = documents.filter(doc => proposalState.documents[editalId]?.[doc.id]).length;

  const eligibilityText = checklistRate === 100 ? 'Aprovação provável' : 'Revisar requisitos pendentes';
  const eligibilityColor = checklistRate === 100 ? '#2E7D32' : '#F57C00';

  const handleToggle = async (itemId: string) => {
    await toggleChecklistItem(editalId, itemId);
    const state = await getProposalStateForEdital(editalId);
    setProposalState({ checklist: { [editalId]: state.checklist }, documents: { [editalId]: state.documents } });
  };

  const handleToggleFavorite = async () => {
    const nextIsFavorite = await toggleFavoriteEdital(editalId);
    setIsFavorite(nextIsFavorite);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={globalStyles.primaryColor} />
        </View>
      ) : edital ? (
        <>
          {loadMessage ? <Text style={styles.infoBanner}>{loadMessage}</Text> : null}

          <View style={styles.header}>
            <Text style={styles.title}>{edital.title}</Text>
            <Text style={styles.subtitle}>{edital.region} • {edital.cnae}</Text>
            <Text style={styles.subtitle}>Prazo: {edital.deadline}</Text>
            {edital.orgao ? <Text style={styles.subtitle}>Órgão: {edital.orgao}</Text> : null}
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            >
              <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
                {isFavorite ? 'Remover dos favoritos' : 'Favoritar edital'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <Text style={[styles.statusLabel, { color: eligibilityColor }]}>{eligibilityText}</Text>
            <Text style={styles.statusValue}>{checklistRate}% requisitos concluídos</Text>
            <Text style={styles.statusSmall}>{uploadedDocsCount}/{documents.length} documentos organizados</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes do edital</Text>
            <Text style={styles.sectionText}>{edital.description}</Text>
            <Text style={styles.detailLine}>Valor estimado: {edital.valueRange}</Text>
            {edital.modalidade ? <Text style={styles.detailLine}>Modalidade: {edital.modalidade}</Text> : null}
            {edital.uf ? <Text style={styles.detailLine}>UF: {edital.uf}</Text> : null}
            {edital.municipio ? <Text style={styles.detailLine}>Município: {edital.municipio}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist de habilitação</Text>
            {checklist.map(item => {
              const checked = proposalState.checklist[editalId]?.[item.id];
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleToggle(item.id)}
                  style={[styles.checkItem, checked && styles.checkItemCompleted]}
                >
                  <View style={styles.checkTextBox}>
                    <Text style={[styles.checkLabel, checked && styles.checkLabelCompleted]}>{item.label}</Text>
                    <Text style={styles.checkReference}>{item.reference}</Text>
                  </View>
                  <Text style={styles.checkIcon}>{checked ? 'OK' : 'Pendente'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos necessários</Text>
            {documents.map(doc => {
              const uploaded = proposalState.documents[editalId]?.[doc.id];
              return (
                <View key={doc.id} style={styles.documentRow}>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentLabel}>{doc.label}</Text>
                    <Text style={styles.documentText}>{doc.description}</Text>
                  </View>
                  <Text style={[styles.documentStatus, uploaded ? styles.documentStatusDone : styles.documentStatusPending]}>
                    {uploaded ? 'Enviado' : 'Pendente'}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Documentos')}> 
            <Text style={styles.actionText}>Ir para Documentos</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {loadMessage ? <Text style={styles.infoBanner}>{loadMessage}</Text> : null}
          <Text style={styles.emptyText}>Edital não encontrado.</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  infoBanner: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    color: '#5D4037',
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    marginBottom: 14,
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
    borderWidth: 1,
    borderColor: '#F9A825',
  },
  favoriteText: {
    color: '#424242',
    fontWeight: '700',
  },
  favoriteTextActive: {
    color: '#F57F17',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    marginTop: 6,
    color: '#616161',
  },
  statusCard: {
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
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  statusSmall: {
    marginTop: 6,
    color: '#424242',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#212121',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#424242',
  },
  detailLine: {
    marginTop: 6,
    color: '#616161',
    fontSize: 13,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  checkItemCompleted: {
    backgroundColor: '#E8F5E9',
  },
  checkTextBox: {
    flex: 1,
    marginRight: 8,
  },
  checkLabel: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  checkLabelCompleted: {
    color: '#2E7D32',
  },
  checkReference: {
    marginTop: 4,
    color: '#757575',
    fontSize: 12,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
  },
  documentRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
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
    fontSize: 13,
    color: '#616161',
  },
  documentStatus: {
    fontWeight: '700',
  },
  documentStatusDone: {
    color: '#2E7D32',
  },
  documentStatusPending: {
    color: '#F57C00',
  },
  actionButton: {
    backgroundColor: globalStyles.primaryColor,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
    marginTop: 40,
  },
});
