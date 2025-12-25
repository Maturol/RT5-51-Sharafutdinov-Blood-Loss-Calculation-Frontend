import { 
    env, 
    AutoTokenizer, 
    AutoProcessor, 
    SiglipTextModel, 
    SiglipVisionModel,
    RawImage 
} from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;

const MODEL_ID = 'Xenova/siglip-base-patch16-224';

export class ClipSearchService {
    static tokenizer: any = null;
    static processor: any = null;
    static textModel: any = null;
    static visionModel: any = null;

    static async init(progress_callback?: (data: any) => void) {
        if (!this.tokenizer) {
            const options = { device: 'wasm', dtype: 'q8' } as const;

            this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
            this.processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback });
            this.textModel = await SiglipTextModel.from_pretrained(MODEL_ID, {...options, progress_callback });
            this.visionModel = await SiglipVisionModel.from_pretrained(MODEL_ID, {...options, progress_callback });
        }
    }

    static async generateTextEmbeddings(descriptions: string[]): Promise<number[][]> {
        const text_inputs = await this.tokenizer(descriptions, { 
            padding: 'max_length', 
            truncation: true,
        });

        const { pooler_output: textOutput } = await this.textModel(text_inputs);
        const embeddingSize = 768;
        const embeddings: number[][] = [];

        for (let i = 0; i < descriptions.length; i++) {
            const start = i * embeddingSize;
            const end = start + embeddingSize;
            const textVector = textOutput.data.slice(start, end);
            embeddings.push(Array.from(textVector));
        }

        return embeddings;
    }

    static async generateImageEmbedding(imageFile: File): Promise<number[]> {
        const imageUrl = URL.createObjectURL(imageFile);
        const image = await RawImage.read(imageUrl);
        const imageInputs = await this.processor(image);
        const { pooler_output } = await this.visionModel(imageInputs);
        
        URL.revokeObjectURL(imageUrl);
        return Array.from(pooler_output.data);
    }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
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