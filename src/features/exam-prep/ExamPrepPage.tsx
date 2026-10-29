import React, { useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2, Calendar, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { Link } from 'react-router-dom';

export const ExamPrepPage: React.FC = () => {
  useDocumentTitle('Exam Preparation & Revision Shortlist');
  const {
    countdowns,
    shortlist,
    addCountdown,
    removeCountdown,
    addToShortlist,
    toggleReviewed,
    removeShortlistItem,
  } = useCountdown();

  // Form states for new countdown
  const [showAddForm, setShowAddForm] = useState(false);
  const [examName, setExamName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Shortlist manual entry
  const [showAddShortlist, setShowAddShortlist] = useState(false);
  const [shortlistTitle, setShortlistTitle] = useState('');
  const [shortlistSubject, setShortlistSubject] = useState('');
  const [shortlistCategory, setShortlistCategory] = useState('Lecture Notes');

  const handleAddCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !courseCode || !targetDate) return;
    addCountdown({
      examName,
      courseCode,
      targetDate,
      notes: notes || undefined,
    });
    setExamName('');
    setCourseCode('');
    setTargetDate('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleAddShortlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortlistTitle || !shortlistSubject) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    addToShortlist({
      resourceId: `manual_${id}`,
      title: shortlistTitle,
      subjectName: shortlistSubject,
      categoryLabel: shortlistCategory,
    });
    setShortlistTitle('');
    setShortlistSubject('');
    setShowAddShortlist(false);
  };

  const calculateDaysLeft = (targetDateIso: string) => {
    const target = new Date(targetDateIso).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#E7E3DA]">
        <h1 className="text-2xl sm:text-3xl font-serif-heading font-semibold text-[#141413]">
          Personal Examination Preparation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#5C5955]">
          Configure your personal exam timetables and track a focused checklist of revision materials.
        </p>
        <p className="mt-1.5 text-[11px] text-[#87837B]">
          Saved on this browser only · No account required
        </p>
      </div>

      {/* Section 1: User-Configured Countdowns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
          <div>
            <h2 className="text-lg font-serif-heading font-semibold text-[#141413]">
              Examination Timers
            </h2>
            <p className="text-xs text-[#5C5955]">
              Active countdown timers entered by you. No dates are pre-assumed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Target Exam'}</span>
          </Button>
        </div>

        {/* Add Countdown Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddCountdown}
            className="p-5 rounded-[var(--radius-md)] border border-[#183B32]/30 bg-white space-y-4 shadow-sm"
          >
            <h3 className="text-xs font-semibold text-[#183B32] uppercase tracking-wider">
              New Examination Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Examination Name *
                </label>
                <Input
                  placeholder="e.g. End Semester Theory Examination"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Subject / Course Code *
                </label>
                <Input
                  placeholder="e.g. CS501 Database Systems"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Exam Date *
                </label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5955] mb-1">
                Preparation Notes (Optional)
              </label>
              <Input
                placeholder="e.g. Focus on B-Trees, Transaction Isolation, and SQL joins"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Exam Timer
              </Button>
            </div>
          </form>
        )}

        {/* Countdown Cards Grid */}
        {countdowns.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#E7E3DA] rounded-[var(--radius-md)] bg-white text-xs text-[#5C5955]">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-[#87837B]" />
            <p className="font-medium text-[#141413] mb-0.5">No upcoming exam timers added yet</p>
            <p>Add your mid-term or end-term syllabus dates to keep deadlines in perspective.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countdowns.map((item) => {
              const daysLeft = calculateDaysLeft(item.targetDate);
              const isOverdue = daysLeft < 0;
              const isToday = daysLeft === 0;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-[var(--radius-md)] border border-[#E7E3DA] bg-white flex flex-col justify-between shadow-hairline"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-[#87837B]">
                        {item.courseCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCountdown(item.id)}
                        className="text-[#87837B] hover:text-[#9E2B25] p-1"
                        aria-label={`Remove timer for ${item.examName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-serif-heading font-medium text-[#141413]">
                      {item.examName}
                    </h3>

                    {item.notes && (
                      <p className="mt-1 text-xs text-[#5C5955] line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E7E3DA] flex items-center justify-between text-xs">
                    <span className="text-[#87837B] tabular-numbers">
                      {new Date(item.targetDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <span
                      className={`font-semibold tabular-numbers ${
                        isOverdue
                          ? 'text-[#87837B]'
                          : daysLeft <= 3
                          ? 'text-[#9E2B25]'
                          : 'text-[#183B32]'
                      }`}
                    >
                      {isOverdue ? 'Completed' : isToday ? 'Today' : `${daysLeft} days remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Revision Shortlist with checkmarks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E3DA]">
          <div>
            <h2 className="text-lg font-serif-heading font-semibold text-[#141413]">
              Revision Material Shortlist
            </h2>
            <p className="text-xs text-[#5C5955]">
              Target lecture sets, test papers, and formula guides to review before examinations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddShortlist(!showAddShortlist)}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic / Note</span>
            </Button>
            <Button asChild variant="secondary" size="sm" className="text-xs">
              <Link to={ROUTES.LIBRARY}>Browse Library</Link>
            </Button>
          </div>
        </div>

        {/* Add custom topic form */}
        {showAddShortlist && (
          <form
            onSubmit={handleAddShortlist}
            className="p-5 rounded-[var(--radius-md)] border border-[#183B32]/30 bg-white space-y-4 shadow-sm"
          >
            <h3 className="text-xs font-semibold text-[#183B32] uppercase tracking-wider">
              Add Item to Shortlist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Topic or Document Title *
                </label>
                <Input
                  placeholder="e.g. Unit 3 Dynamic Programming Proofs"
                  value={shortlistTitle}
                  onChange={(e) => setShortlistTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Subject *
                </label>
                <Input
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={shortlistSubject}
                  onChange={(e) => setShortlistSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5955] mb-1">
                  Category
                </label>
                <Input
                  placeholder="e.g. Lecture Notes, MST Paper, Formula Sheet"
                  value={shortlistCategory}
                  onChange={(e) => setShortlistCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddShortlist(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save to Shortlist
              </Button>
            </div>
          </form>
        )}

        {/* Shortlist Items */}
        {shortlist.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#E7E3DA] rounded-[var(--radius-md)] bg-white text-xs text-[#5C5955]">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#87837B]" />
            <p className="font-medium text-[#141413] mb-0.5">Your study shortlist is empty</p>
            <p>Add specific topics or bookmark materials directly from the library to plan your revision session.</p>
          </div>
        ) : (
          <div className="space-y-2 border border-[#E7E3DA] rounded-[var(--radius-md)] bg-white p-3 divide-y divide-[#E7E3DA]">
            {shortlist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 transition-colors ${
                  item.reviewed ? 'opacity-60 bg-[#FAF8F4]' : 'hover:bg-[#FAF8F4]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={item.reviewed}
                    onCheckedChange={() => toggleReviewed(item.id)}
                  />
                  <div>
                    <span
                      className={`text-sm font-medium block ${
                        item.reviewed ? 'line-through text-[#87837B]' : 'text-[#141413]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-[#5C5955]">
                      {item.subjectName} · {item.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {item.reviewed && (
                    <span className="inline-flex items-center gap-1 text-[#1C5436] font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeShortlistItem(item.id)}
                    className="p-1 text-[#87837B] hover:text-[#9E2B25] transition-colors"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
