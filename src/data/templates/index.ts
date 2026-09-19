import { JourneyTemplate } from '@/domain/journey/types';
import vehicleLoanJson from './vehicle-loan.json';
import personalLoanJson from './personal-loan.json';
import msmeLoanJson from './msme-loan.json';

export const TEMPLATES: JourneyTemplate[] = [
  vehicleLoanJson as unknown as JourneyTemplate,
  personalLoanJson as unknown as JourneyTemplate,
  msmeLoanJson as unknown as JourneyTemplate,
];

export function getTemplateById(id: string): JourneyTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
