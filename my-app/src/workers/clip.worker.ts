import { ClipSearchService } from '../modules/clipSearch';

self.onmessage = async (e) => {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'init':
        await ClipSearchService.init((progressData) => {
          self.postMessage({ type: 'progress', data: progressData });
        });
        self.postMessage({ type: 'ready' });
        break;
        
      case 'processImage':
        const { imageFile, operations } = data;
        const imageEmbedding = await ClipSearchService.generateImageEmbedding(imageFile);
        
        // Получение текстовых эмбеддингов для операций
        const descriptions = operations.map((op: any) => 
          `${op.title} - ${op.description || 'surgical procedure'}. Average blood loss: ${op.avg_blood_loss}ml.`
        );
        
        const textEmbeddings = await ClipSearchService.generateTextEmbeddings(descriptions);
        
        // Расчет сходства
        const results = operations.map((op: any, index: number) => ({
          operation: op,
          similarity: cosineSimilarity(imageEmbedding, textEmbeddings[index])
        }));
        
        results.sort((a: any, b: any) => b.similarity - a.similarity);
        
        self.postMessage({ 
          type: 'results', 
          data: { results, imageEmbedding } 
        });
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'error', data: error });
  }
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}