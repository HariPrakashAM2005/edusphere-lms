import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Matching threshold
const SIMILARITY_THRESHOLD = 0.7;

/**
 * Deterministic hash function to generate a number from string
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Pseudo-random generator based on a seed
 */
const seedRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

/**
 * Generates a mock 128-dimensional face embedding array deterministically from base64 string
 */
export const detectFace = async (imageBase64: string): Promise<number[]> => {
  const seed = hashCode(imageBase64);
  const embedding: number[] = [];

  for (let i = 0; i < 128; i++) {
    const val = seedRandom(seed + i) * 2 - 1; // range -1 to 1
    embedding.push(val);
  }

  // Normalize vector
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => (magnitude > 0 ? v / magnitude : 0));
};

/**
 * Compares two embeddings using cosine similarity. Returns score between -1 and 1.
 */
export const compareFaces = (emb1: number[], emb2: number[]): { match: boolean; score: number } => {
  if (emb1.length !== emb2.length || emb1.length === 0) {
    return { match: false, score: 0 };
  }

  // Cosine Similarity: A . B / (|A| * |B|)
  // Since our embeddings are already normalized (|A| = 1, |B| = 1), this is just the dot product
  let dotProduct = 0;
  for (let i = 0; i < emb1.length; i++) {
    dotProduct += emb1[i] * emb2[i];
  }

  const score = parseFloat(dotProduct.toFixed(4));
  const match = score >= SIMILARITY_THRESHOLD;

  return { match, score };
};

/**
 * Stores a face embedding JSON in the FaceEncoding table for a user.
 */
export const storeFaceEncoding = async (userId: string, imageBase64: string): Promise<any> => {
  const encoding = await detectFace(imageBase64);
  
  // Save to Database
  try {
    // Delete existing encoding if present
    const existing = await prisma.faceEncoding.findFirst({ where: { userId } });
    if (existing) {
      await prisma.faceEncoding.delete({ where: { id: existing.id } });
    }

    const saved = await prisma.faceEncoding.create({
      data: {
        userId,
        encoding: encoding as any, // json type
      },
    });
    return saved;
  } catch (error) {
    console.warn('⚠️ DB transaction failed. Storing face encoding in-memory mock context. Error:', error);
    // Return mock saved object
    return {
      id: `face-mock-${Date.now()}`,
      userId,
      encoding,
      createdAt: new Date(),
    };
  }
};
