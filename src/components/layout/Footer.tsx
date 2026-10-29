import React from 'react';
import { Link } from 'react-router-dom';
import { brand } from '../../config/brand';
import { ROUTES } from '../../config/routes';
import { RESOURCE_TYPES } from '../../config/constants';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E7E3DA] bg-[#FAF8F4] text-[#5C5955] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand identity column */}
        <div className="md:col-span-1 space-y-3">
          <Logo variant="full" size="sm" />
          <p className="text-xs text-[#5C5955] leading-relaxed">
            {brand.description}
          </p>
          <p className="text-[11px] text-[#87837B]">
            {brand.institutionDisclaimer}
          </p>
        </div>

        {/* Academic Collections */}
        <div>
          <h4 className="text-xs font-semibold text-[#141413] uppercase tracking-wider mb-3">
            Academic Archives
          </h4>
          <ul className="space-y-2 text-xs">
            {RESOURCE_TYPES.slice(0, 4).map((type) => (
              <li key={type.id}>
                <Link
                  to={ROUTES.CATEGORY(type.id)}
                  className="hover:text-[#183B32] transition-colors"
                >
                  {type.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Examination & Practical */}
        <div>
          <h4 className="text-xs font-semibold text-[#141413] uppercase tracking-wider mb-3">
            Exam Prep & Labs
          </h4>
          <ul className="space-y-2 text-xs">
            {RESOURCE_TYPES.slice(4).map((type) => (
              <li key={type.id}>
                <Link
                  to={ROUTES.CATEGORY(type.id)}
                  className="hover:text-[#183B32] transition-colors"
                >
                  {type.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to={ROUTES.EXAM_PREP} className="hover:text-[#183B32] transition-colors">
                Personal Exam Countdown
              </Link>
            </li>
          </ul>
        </div>

        {/* System & Access */}
        <div>
          <h4 className="text-xs font-semibold text-[#141413] uppercase tracking-wider mb-3">
            Repository & Access
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to={ROUTES.LIBRARY} className="hover:text-[#183B32] transition-colors">
                Complete Catalog
              </Link>
            </li>
            <li>
              <Link to={ROUTES.SAVED} className="hover:text-[#183B32] transition-colors">
                Saved Resources
              </Link>
            </li>
            <li>
              <Link to={ROUTES.ADMIN_UPLOAD} className="hover:text-[#183B32] transition-colors">
                Upload Study Material
              </Link>
            </li>
            <li>
              <Link to={ROUTES.ADMIN} className="hover:text-[#183B32] transition-colors">
                Curator Portal
              </Link>
            </li>
            <li>
              <Link to={ROUTES.SETUP} className="hover:text-[#183B32] transition-colors">
                Database Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-[#E7E3DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#87837B] gap-4">
        <p>
          © {brand.establishedYear} {brand.name}. Handcrafted academic repository. All rights reserved.
        </p>
        <p className="text-[11px]">
          Row Level Security & PostgreSQL enforced.
        </p>
      </div>
    </footer>
  );
};
