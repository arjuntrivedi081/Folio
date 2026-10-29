import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../../services/admin.service';
import type { AdminStats } from '../../types/domain';
import { ROUTES } from '../../config/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAdminSession } from '../../lib/adminSession';
import { formatBytes, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { CountUp } from '../../components/common/CountUp';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  HardDrive,
  Eye,
  Download,
  FolderTree,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useRealtimeSync, useRealtimeStatus } from '../../hooks/useRealtimeSync';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Administrator Dashboard');
  const { logout } = useAdminSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status: realtimeStatus } = useRealtimeStatus();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query database statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Listen for realtime resource changes
  useRealtimeSync({
    table: 'resources',
    onEvent: () => {
      loadStats();
    },
  });

  return (
    <div className="space-y-8">
      {/* Top Header with quiet Live indicator & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E3DA] gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
              Curator Administration
            </h1>

            {/* Quiet Realtime Status Indicator (Static dot, not pulsing) */}
            {realtimeStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#183B32] bg-[#EFF4F2] px-2 py-0.5 rounded-[var(--radius-xs)] border border-[#9CB2A9]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#183B32]" />
                Live
              </span>
            ) : realtimeStatus === 'reconnecting' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#946300] bg-[#FFF9ED] px-2 py-0.5 rounded-[var(--radius-xs)] border border-[#946300]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#946300]" />
                Reconnecting…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#87837B] bg-[#F4F1EA] px-2 py-0.5 rounded-[var(--radius-xs)] border border-[#E7E3DA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#87837B]" />
                Sync Ready
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#5C5955]">
            Real-time repository telemetry, publishing status, and curriculum records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to={ROUTES.ADMIN_MANAGE}>Manage Catalog</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to={ROUTES.ADMIN_TAXONOMY}>Manage Subjects</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="text-xs gap-1.5">
            <Link to={ROUTES.ADMIN_UPLOAD}>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Material</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs gap-1.5 text-[#9E2B25] hover:bg-[#FDF2F1]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-[var(--radius-md)] border border-[#9E2B25]/20 bg-[#FDF2F1] text-xs text-[#9E2B25] space-y-3">
          <p className="font-medium text-sm">Database telemetry query note</p>
          <p className="leading-relaxed">{error}</p>
          <Button variant="outline" size="sm" onClick={loadStats} className="h-7 text-xs gap-1.5 bg-white">
            <RefreshCw className="w-3 h-3" />
            <span>Retry Connection</span>
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-[var(--radius-md)]" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[var(--radius-md)]" />
        </div>
      ) : stats ? (
        <>
          {/* Key Metric Cards with CountUp */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-1 shadow-hairline">
              <div className="flex items-center justify-between text-xs text-[#87837B]">
                <span>Total Materials</span>
                <FileText className="w-4 h-4 text-[#183B32]" />
              </div>
              <div className="text-2xl font-serif-heading font-semibold text-[#141413]">
                <CountUp value={stats.totalResources} />
              </div>
              <div className="text-[11px] text-[#5C5955]">
                {stats.publishedResources} published · {stats.draftResources} drafts
              </div>
            </div>

            <div className="p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-1 shadow-hairline">
              <div className="flex items-center justify-between text-xs text-[#87837B]">
                <span>Total Read Views</span>
                <Eye className="w-4 h-4 text-[#183B32]" />
              </div>
              <div className="text-2xl font-serif-heading font-semibold text-[#141413]">
                <CountUp value={stats.totalViews} />
              </div>
              <div className="text-[11px] text-[#5C5955]">Direct student access</div>
            </div>

            <div className="p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-1 shadow-hairline">
              <div className="flex items-center justify-between text-xs text-[#87837B]">
                <span>Total Downloads</span>
                <Download className="w-4 h-4 text-[#183B32]" />
              </div>
              <div className="text-2xl font-serif-heading font-semibold text-[#141413]">
                <CountUp value={stats.totalDownloads} />
              </div>
              <div className="text-[11px] text-[#5C5955]">PDF & syllabus packages</div>
            </div>

            <div className="p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-1 shadow-hairline">
              <div className="flex items-center justify-between text-xs text-[#87837B]">
                <span>Storage Footprint</span>
                <HardDrive className="w-4 h-4 text-[#183B32]" />
              </div>
              <div className="text-2xl font-serif-heading font-semibold text-[#141413]">
                {formatBytes(stats.totalSizeBytes)}
              </div>
              <div className="text-[11px] text-[#5C5955]">Private Supabase bucket</div>
            </div>
          </div>

          {/* Breakdown & Recent Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution */}
            <div className="p-6 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-4 shadow-hairline">
              <h3 className="text-xs font-semibold text-[#87837B] uppercase tracking-wider">
                Distribution by Category
              </h3>
              {stats.byCategory.length === 0 ? (
                <p className="text-xs text-[#87837B] py-6 text-center">
                  No materials recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.byCategory.map((cat) => (
                    <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                      <span className="text-[#5C5955] truncate max-w-[160px]">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#FAF8F4] rounded-full overflow-hidden border border-[#E7E3DA]">
                          <div
                            className="h-full bg-[#183B32]"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((cat.count / Math.max(1, stats.totalResources)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[#141413] w-6 text-right">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Uploads Table */}
            <div className="lg:col-span-2 p-6 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white space-y-4 shadow-hairline">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#87837B] uppercase tracking-wider">
                  Latest Repository Additions
                </h3>
                <Link
                  to={ROUTES.ADMIN_MANAGE}
                  className="text-xs text-[#183B32] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {stats.recentUploads.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#87837B]">
                  No resources uploaded yet. Click &quot;Upload Material&quot; to add notes or exam papers.
                </div>
              ) : (
                <div className="divide-y divide-[#E7E3DA]">
                  {stats.recentUploads.map((res) => (
                    <div
                      key={res.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-[#FAF8F4] -mx-2 px-2 rounded-[var(--radius-xs)] transition-colors"
                    >
                      <div className="min-w-0">
                        <Link
                          to={ROUTES.RESOURCE_DETAIL(res.id)}
                          className="font-medium text-[#141413] hover:text-[#183B32] truncate block"
                        >
                          {res.title}
                        </Link>
                        <div className="text-[11px] text-[#87837B] mt-0.5">
                          {formatDate(res.created_at)} · {formatBytes(res.file_size_bytes)} · {res.status}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                          <Link to={ROUTES.ADMIN_EDIT(res.id)}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
