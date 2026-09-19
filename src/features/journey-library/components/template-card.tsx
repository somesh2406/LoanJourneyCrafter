import { Layers, ArrowRight, Car, UserCheck, Building2 } from 'lucide-react';
import { JourneyTemplate } from '@/domain/journey/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface TemplateCardProps {
  template: JourneyTemplate;
  onUseTemplate: (templateId: string) => void;
}

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const getIcon = () => {
    switch (template.badge) {
      case 'Automotive':
        return <Car className="h-5 w-5 text-blue-600" />;
      case 'Unsecured':
        return <UserCheck className="h-5 w-5 text-cyan-600" />;
      case 'Business':
        return <Building2 className="h-5 w-5 text-purple-600" />;
      default:
        return <Layers className="h-5 w-5 text-blue-600" />;
    }
  };

  const stageCount = template.journey.nodes.filter((n) => n.type === 'STAGE').length;
  const nodeCount = template.journey.nodes.length;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
            {getIcon()}
          </div>
          <Badge variant="default">{template.badge}</Badge>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[32px]">
            {template.description}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {stageCount} Stages · {nodeCount} Nodes
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onUseTemplate(template.id)}
          className="gap-1 text-xs cursor-pointer hover:border-blue-600 hover:text-blue-600"
        >
          <span>Use Template</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
