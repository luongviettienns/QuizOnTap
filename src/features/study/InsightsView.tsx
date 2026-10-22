import { useState, useEffect } from 'react';
import type { StudyProgress } from '@/domain/contracts';
import { quizDb } from '@/db/quizDb';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { BarChart2, Play, Award, Calendar } from 'lucide-react';

interface InsightsViewProps {
  onSelectSession: (session: StudyProgress) => void;
  onStartNew: () => void;
}

export function InsightsView({ onSelectSession, onStartNew }: InsightsViewProps) {
  const [sessions, setSessions] = useState<StudyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const list = await quizDb.studyProgress.orderBy('startedAt').reverse().toArray();
        setSessions(list);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử ôn tập:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, []);

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const inProgressSessions = sessions.filter((s) => s.status === 'in-progress');

  const totalAttempts = sessions.reduce((acc, s) => acc + s.attemptCount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            <span>Thống kê tiến trình học tập</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi sự thành thạo 178 câu Kinh tế học & Môi trường qua từng phiên học.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onStartNew}
          leftIcon={<Play className="w-4 h-4 ml-0.5" />}
        >
          Lượt ôn tập mới
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Tổng số phiên</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {sessions.length}
          </div>
          <div className="text-[11px] text-slate-400">Lịch sử được ghi nhận</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs text-emerald-600 font-medium">Phiên hoàn thành</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {completedSessions.length}
          </div>
          <div className="text-[11px] text-emerald-700/70">Đạt 178/178 câu</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs text-indigo-600 font-medium">Đang dở dang</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            {inProgressSessions.length}
          </div>
          <div className="text-[11px] text-indigo-700/70">Có thể tiếp tục</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Tổng lượt làm</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {totalAttempts}
          </div>
          <div className="text-[11px] text-slate-400">Bao gồm cả ôn lại</div>
        </Card>
      </div>

      {/* Sessions History List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Lịch sử các phiên ôn tập
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Đang tải dữ liệu lịch sử...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chưa có phiên ôn tập nào được ghi nhận
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Hãy bắt đầu lượt ôn tập đầu tiên để trải nghiệm lộ trình thông minh và xây dựng biểu đồ tiến trình của bạn!
            </p>
            <div className="pt-2">
              <Button variant="primary" onClick={onStartNew} leftIcon={<Play className="w-4 h-4 ml-0.5" />}>
                Bắt đầu học ngay
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, idx) => {
              const isComp = s.status === 'completed';
              const durationMin = s.completedAt
                ? Math.round((s.completedAt - s.startedAt) / 60000)
                : Math.round((Date.now() - s.startedAt) / 60000);

              return (
                <Card
                  key={s.sessionId}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        #{sessions.length - idx}
                      </span>
                      {isComp ? (
                        <Badge variant="verified">Hoàn thành 178/178</Badge>
                      ) : (
                        <Badge variant="suggested">Đang học ({s.mainCursor}/178)</Badge>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.startedAt).toLocaleDateString('vi-VN')} {new Date(s.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap pt-0.5">
                      <span>Nắm vững: <strong className="text-emerald-600">{s.masteredIds.length}</strong> / 178</span>
                      <span>Tổng lần làm: <strong>{s.attemptCount}</strong></span>
                      <span>Lô ôn 5 câu: <strong>{s.reviewBatchCount}</strong></span>
                      <span>Thời lượng: <strong>{durationMin} phút</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant={isComp ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => onSelectSession(s)}
                      leftIcon={isComp ? <Award className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    >
                      {isComp ? 'Xem báo cáo' : 'Tiếp tục học'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
