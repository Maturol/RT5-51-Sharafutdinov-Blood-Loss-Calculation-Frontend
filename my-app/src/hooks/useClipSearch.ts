import { useState, useEffect } from 'react';
import { ClipSearchService, cosineSimilarity } from '../modules/clipSearch';
import { type HandlerOperation } from '../api/Api';

export interface SearchResult {
    operation: HandlerOperation;
    similarity: number;
}

export const useClipSearch = (operations: HandlerOperation[]) => {
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [textEmbeddings, setTextEmbeddings] = useState<Map<number, number[]>>(new Map());
    const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Инициализация модели
    useEffect(() => {
        const initModel = async () => {
            try {
                await ClipSearchService.init((msg: any) => {
                    if (msg.status === 'progress') {
                        setProgress(msg.progress);
                    }
                });
                
                // Генерация эмбеддингов для описаний операций
                const descriptions = operations.map(op => {
                    // Создаем описание на английском для CLIP
                    return `${op.title} - ${op.description || 'surgical procedure'}. Average blood loss: ${op.avg_blood_loss}ml.`;
                });
                
                const embeddings = await ClipSearchService.generateTextEmbeddings(descriptions);
                
                const embeddingsMap = new Map<number, number[]>();
                operations.forEach((op, index) => {
                    embeddingsMap.set(op.id!, embeddings[index]);
                });
                
                setTextEmbeddings(embeddingsMap);
                setReady(true);
            } catch (error) {
                console.error('Failed to initialize CLIP model:', error);
            }
        };

        if (operations.length > 0) {
            initModel();
        }
    }, [operations]);

    // Поиск по изображению
    const searchByImage = async (imageFile: File): Promise<SearchResult[]> => {
        if (!ready || !textEmbeddings.size) {
            throw new Error('CLIP model not ready');
        }

        setIsSearching(true);
        try {
            // Генерация эмбеддинга для загруженного изображения
            const imgEmbedding = await ClipSearchService.generateImageEmbedding(imageFile);
            setImageEmbedding(imgEmbedding);

            // Расчет сходства для каждой операции
            const results: SearchResult[] = [];
            
            operations.forEach(op => {
                const textEmbedding = textEmbeddings.get(op.id!);
                if (!textEmbedding) {
                    return;
                }

                const similarity = cosineSimilarity(imgEmbedding, textEmbedding);
                // Гарантируем неотрицательное значение
                const normalizedSimilarity = Math.max(0, similarity);
                
                // Добавляем только если сходство > 0.01 (1%)
                if (normalizedSimilarity > 0.01) {
                    results.push({ 
                        operation: op, 
                        similarity: normalizedSimilarity 
                    });
                }
            });

            // Сортировка по сходству
            results.sort((a, b) => b.similarity - a.similarity);
            
            // Применяем небольшой буст для лучших результатов
            if (results.length > 0) {
                const maxSimilarity = results[0].similarity;
                if (maxSimilarity > 0) {
                    results.forEach(result => {
                        // Немного увеличиваем значения для лучшей визуализации
                        result.similarity = Math.min(1, result.similarity * 1.2);
                    });
                }
            }
            
            setSearchResults(results);
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        } finally {
            setIsSearching(false);
        }
    };

    // Сброс поиска
    const resetSearch = () => {
        setImageEmbedding(null);
        setSearchResults([]);
    };

    return {
        ready,
        progress,
        searchByImage,
        resetSearch,
        searchResults,
        isSearching,
        imageEmbedding
    };
};