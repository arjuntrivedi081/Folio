import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { Button } from '../components/ui/button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page Not Found');

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8F4] border border-[#E7E3DA] text-[#87837B] mx-auto">
        <Compass className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono text-[#87837B]">ERROR 404</span>
        <h1 className="text-2xl font-serif-heading font-semibold text-[#141413]">
          Document or Page Not Found
        </h1>
        <p className="text-xs text-[#5C5955] leading-relaxed">
          The requested curriculum archive, resource index, or route does not exist.
        </p>
      </div>

      <div className="pt-2">
        <Button asChild variant="primary" size="sm" className="gap-1.5">
          <Link to={ROUTES.HOME}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Repository</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
