import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { incomeControllerFindAll } from '../api/generated/endpoints/income/income';
import type { IncomeResponseDto } from '../api/generated/model';
import { GlassScreenLayout } from '../components/layout/GlassScreenLayout';
import { Card } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';

export default function IncomesScreen() {
    const [incomes, setIncomes] = useState<IncomeResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const { data } = await incomeControllerFindAll();
            setIncomes(data.data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch incomes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <GlassScreenLayout>
                <View style={styles.centered}>
                    <Card glass style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.loadingText}>Loading incomes...</Text>
                    </Card>
                </View>
            </GlassScreenLayout>
        );
    }

    return (
        <GlassScreenLayout>
            <Card glass style={styles.headerCard}>
                <View style={styles.headerContent}>
                    <MaterialCommunityIcons name="cash-multiple" size={32} color="#FFFFFF" />
                    <View style={styles.headerText}>
                        <Text style={styles.headerLabel}>Total Income</Text>
                        <Text style={styles.headerValue}>
                            ${incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </Card>

            {error ? (
                <View style={styles.centered}>
                    <Card glass style={styles.errorCard}>
                        <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
                        <Text style={styles.error}>{error}</Text>
                        <Button title="Retry" onPress={fetchIncomes} variant="glass" />
                    </Card>
                </View>
            ) : (
                <FlatList
                    data={incomes}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => (
                        <Card glass style={styles.item}>
                            <View style={styles.itemContent}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemText}>{item.description || 'Income'}</Text>
                                    <Text style={styles.itemDate}>
                                        {item.date ? new Date(item.date).toLocaleDateString() : 'No date'}
                                    </Text>
                                </View>
                                <Text style={styles.itemAmount}>+${item.amount}</Text>
                            </View>
                        </Card>
                    )}
                    ListEmptyComponent={
                        <Card glass style={styles.emptyCard}>
                            <MaterialCommunityIcons name="inbox" size={48} color="rgba(255, 255, 255, 0.5)" />
                            <Text style={styles.emptyText}>No incomes found</Text>
                        </Card>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </GlassScreenLayout>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 16,
    },
    headerCard: {
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    headerText: {
        marginLeft: 16,
        flex: 1,
    },
    headerLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
    headerValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    errorCard: {
        padding: 32,
        alignItems: 'center',
    },
    error: {
        color: '#ff6b6b',
        fontSize: 16,
        marginVertical: 16,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 16,
    },
    item: {
        marginBottom: 12,
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    itemAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
    emptyCard: {
        padding: 48,
        alignItems: 'center',
        marginTop: 32,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
    },
});
