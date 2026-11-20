import { z } from 'zod';
import { text } from './fields';

export const postSchema = z.object({ content: text('La publication', 2000) });

export const commentSchema = z.object({ content: text('Le commentaire', 1000) });
