import type { RequestHandler } from '@sveltejs/kit';
import { POST as generatePDF } from '../+server';

export const POST: RequestHandler = async (event) => {
  return generatePDF(event);
};
