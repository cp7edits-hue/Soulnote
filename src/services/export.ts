import { jsPDF } from 'jspdf';
import { EmotionEntry, ReflectionEntry } from '../types';

export interface ExportStatistics {
  totalEntries: number;
  totalReflections: number;
  averageIntensity: string;
  mostRecordedEmotion: string;
  dateRange: string;
  emotionCounts: Record<string, number>;
}

export function calculateStatistics(entries: EmotionEntry[], reflections: ReflectionEntry[]): ExportStatistics {
  const totalEntries = entries.length;
  const totalReflections = reflections.length;

  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      totalReflections,
      averageIntensity: 'N/A',
      mostRecordedEmotion: 'None',
      dateRange: 'No entries recorded',
      emotionCounts: {},
    };
  }

  // Average intensity
  const totalIntensity = entries.reduce((acc, e) => acc + e.intensity, 0);
  const avgIntensity = (totalIntensity / totalEntries).toFixed(1);

  // Emotion counts & most recorded
  const emotionCounts: Record<string, number> = {};
  for (const entry of entries) {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
  }

  let mostRecorded = '';
  let maxCount = -1;
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostRecorded = `${emotion} (${count} ${count === 1 ? 'entry' : 'entries'})`;
    }
  }

  // Date range (entries are typically newest first)
  const timestamps = entries.map((e) => e.createdAt).sort((a, b) => a - b);
  const firstDate = new Date(timestamps[0]).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const lastDate = new Date(timestamps[timestamps.length - 1]).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const dateRange = timestamps.length === 1 ? firstDate : `${firstDate} – ${lastDate}`;

  return {
    totalEntries,
    totalReflections,
    averageIntensity: `${avgIntensity} / 5`,
    mostRecordedEmotion: mostRecorded,
    dateRange,
    emotionCounts,
  };
}

/**
 * Formats a clean, human-readable TXT file containing the user's real stored data.
 */
export function generateTxtExport(entries: EmotionEntry[], reflections: ReflectionEntry[]): string {
  const exportDate = new Date().toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const lines: string[] = [];

  lines.push('SOULNOTE');
  lines.push('My Emotional Journal');
  lines.push('--------------------');
  lines.push('');
  lines.push(`Export Date: ${exportDate}`);
  lines.push('');

  if (entries.length === 0 && reflections.length === 0) {
    lines.push('No SoulNote entries or reflections are currently available.');
    lines.push('Start journaling in SoulNote to capture your daily emotions and thoughts.');
    lines.push('');
    return lines.join('\n');
  }

  // 1. Emotional History
  lines.push('==================================================');
  lines.push('EMOTIONAL HISTORY');
  lines.push('==================================================');
  lines.push('');

  if (entries.length === 0) {
    lines.push('No emotional check-ins recorded yet.');
    lines.push('');
  } else {
    // Sort chronological: oldest first for a readable journal flow
    const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      lines.push(`[${entryDate}]`);
      lines.push(`Emotion: ${entry.emotion}`);
      lines.push(`Intensity: ${entry.intensity}/5`);
      lines.push(`Context: ${entry.tags && entry.tags.length > 0 ? entry.tags.join(', ') : 'None specified'}`);
      if (entry.note && entry.note.trim().length > 0) {
        lines.push(`Note: ${entry.note.trim()}`);
      } else {
        lines.push('Note: (None recorded)');
      }
      lines.push('--------------------------------------------------');
      lines.push('');
    }
  }

  // 2. Reflections
  lines.push('');
  lines.push('==================================================');
  lines.push('REFLECTIONS');
  lines.push('==================================================');
  lines.push('');

  if (reflections.length === 0) {
    lines.push('No reflections recorded yet.');
    lines.push('');
  } else {
    const sortedReflections = [...reflections].sort((a, b) => a.createdAt - b.createdAt);

    for (const refl of sortedReflections) {
      const reflDate = new Date(refl.createdAt).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      lines.push(`[${reflDate}]`);
      lines.push(`Prompt: ${refl.prompt}`);
      lines.push(`Reflection: ${refl.content.trim()}`);
      lines.push('--------------------------------------------------');
      lines.push('');
    }
  }

  // 3. Summary
  const stats = calculateStatistics(entries, reflections);
  lines.push('');
  lines.push('==================================================');
  lines.push('SUMMARY');
  lines.push('==================================================');
  lines.push('');
  lines.push(`Total Entries: ${stats.totalEntries}`);
  lines.push(`Total Reflections: ${stats.totalReflections}`);
  lines.push(`Most Recorded Emotion: ${stats.mostRecordedEmotion}`);
  lines.push(`Average Intensity: ${stats.averageIntensity}`);
  lines.push(`Date Range: ${stats.dateRange}`);

  if (Object.keys(stats.emotionCounts).length > 0) {
    lines.push('');
    lines.push('Emotion Breakdown:');
    const sortedEmotions = Object.entries(stats.emotionCounts).sort((a, b) => b[1] - a[1]);
    for (const [emotion, count] of sortedEmotions) {
      const percentage = Math.round((count / stats.totalEntries) * 100);
      lines.push(`  • ${emotion}: ${count} (${percentage}%)`);
    }
  }

  lines.push('');
  lines.push('--------------------');
  lines.push('Generated locally and privately by SoulNote.');

  return lines.join('\n');
}

/**
 * Triggers a browser download of the TXT file.
 */
export function downloadTxtExport(entries: EmotionEntry[], reflections: ReflectionEntry[]): void {
  const content = generateTxtExport(entries, reflections);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStamp = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `soulnote_journal_${dateStamp}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Generates and downloads a clean, multi-page, printer-friendly PDF journal.
 */
export function downloadPdfExport(entries: EmotionEntry[], reflections: ReflectionEntry[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const exportDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = calculateStatistics(entries, reflections);

  // Helper to ensure proper pagination without clipping
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 5;
    }
  };

  // --- 1. COVER / HEADER ---
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 28);
  doc.text('SoulNote', margin, y + 8);
  y += 15;

  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(110, 108, 103);
  doc.text('My Emotional Journal', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(140, 138, 133);
  doc.text(`Exported on ${exportDate}`, margin, y);
  y += 7;

  // Thin separator rule
  doc.setDrawColor(220, 218, 210);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // If no data
  if (entries.length === 0 && reflections.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90, 88, 83);
    doc.text('No journal entries or reflections have been recorded in SoulNote yet.', margin, y + 6);
    y += 16;
    doc.setFontSize(9);
    doc.setTextColor(140, 138, 133);
    doc.text('Check in daily to build your private emotional journey.', margin, y);

    addFooters(doc, pageWidth, pageHeight, margin);
    const dateStamp = new Date().toISOString().split('T')[0];
    doc.save(`soulnote_journal_${dateStamp}.pdf`);
    return;
  }

  // --- 2. SUMMARY BOX ---
  if (entries.length > 0) {
    checkPageBreak(45);

    // Summary Box Container
    doc.setFillColor(248, 247, 244);
    doc.setDrawColor(230, 228, 222);
    doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 28);
    doc.text('JOURNAL OVERVIEW', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 78, 73);

    const col1X = margin + 6;
    const col2X = margin + contentWidth / 2;

    doc.text(`Total Check-Ins: ${stats.totalEntries}`, col1X, y + 16);
    doc.text(`Reflections Saved: ${stats.totalReflections}`, col2X, y + 16);

    doc.text(`Average Intensity: ${stats.averageIntensity}`, col1X, y + 23);
    doc.text(`Primary Emotion: ${stats.mostRecordedEmotion}`, col2X, y + 23);

    doc.text(`Date Range: ${stats.dateRange}`, col1X, y + 30);

    y += 46;
  }

  // --- 3. EMOTIONAL HISTORY ---
  checkPageBreak(25);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 28);
  doc.text('Emotional History', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 118, 113);
  doc.text('Chronological record of your emotional check-ins, intensity, and context notes.', margin, y);
  y += 8;

  const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const entryDate = new Date(entry.createdAt).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Prepare note lines if note exists
    const noteLines = entry.note && entry.note.trim().length > 0
      ? doc.splitTextToSize(entry.note.trim(), contentWidth - 12)
      : [];

    const noteHeight = noteLines.length * 4.5;
    const itemHeight = 22 + (noteLines.length > 0 ? noteHeight + 4 : 0);

    checkPageBreak(itemHeight + 6);

    // Entry container box
    doc.setFillColor(252, 252, 250);
    doc.setDrawColor(235, 233, 227);
    doc.roundedRect(margin, y, contentWidth, itemHeight, 2, 2, 'FD');

    // Left accent bar
    doc.setFillColor(60, 58, 55);
    doc.rect(margin, y, 2.5, itemHeight, 'F');

    // Date & Time
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 38);
    doc.text(entryDate, margin + 6, y + 6);

    // Emotion & Intensity
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 28);
    const intensityDots = '●'.repeat(entry.intensity) + '○'.repeat(5 - entry.intensity);
    doc.text(`Emotion: ${entry.emotion}   •   Intensity: ${intensityDots} (${entry.intensity}/5)`, margin + 6, y + 12);

    // Tags
    const tagsText = entry.tags && entry.tags.length > 0 ? entry.tags.join(', ') : 'None specified';
    doc.setFontSize(8.5);
    doc.setTextColor(110, 108, 103);
    doc.text(`Context: ${tagsText}`, margin + 6, y + 17);

    // Note
    if (noteLines.length > 0) {
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 48);
      doc.text(noteLines, margin + 8, y + 23);
    }

    y += itemHeight + 5;
  }

  // --- 4. REFLECTIONS SECTION ---
  if (reflections.length > 0) {
    checkPageBreak(30);
    y += 6;

    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 28);
    doc.text('Reflections', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 118, 113);
    doc.text('Personal thoughts and responses to introspective prompts.', margin, y);
    y += 8;

    const sortedReflections = [...reflections].sort((a, b) => a.createdAt - b.createdAt);

    for (const refl of sortedReflections) {
      const reflDate = new Date(refl.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const promptLines = doc.splitTextToSize(`"${refl.prompt}"`, contentWidth - 14);
      const contentLines = doc.splitTextToSize(refl.content.trim(), contentWidth - 14);

      const promptHeight = promptLines.length * 4.5;
      const contentHeight = contentLines.length * 4.5;
      const boxHeight = 16 + promptHeight + contentHeight;

      checkPageBreak(boxHeight + 6);

      doc.setFillColor(250, 249, 246);
      doc.setDrawColor(235, 233, 227);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

      // Date
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 118, 113);
      doc.text(reflDate, margin + 6, y + 6);

      // Prompt
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 28);
      doc.text(promptLines, margin + 6, y + 12);

      // Response
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 48);
      doc.text(contentLines, margin + 6, y + 14 + promptHeight);

      y += boxHeight + 5;
    }
  }

  // Add clean page numbers and footers across all pages
  addFooters(doc, pageWidth, pageHeight, margin);

  const dateStamp = new Date().toISOString().split('T')[0];
  doc.save(`soulnote_journal_${dateStamp}.pdf`);
}

function addFooters(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 148, 143);

    // Left footer
    doc.text('SoulNote • Personal Emotional Journal', margin, pageHeight - margin + 8);

    // Right footer (page X of Y)
    const pageStr = `Page ${i} of ${totalPages}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - margin + 8);

    // Top subtle divider on pages after cover if content is continuous
    if (i > 1) {
      doc.setDrawColor(240, 238, 232);
      doc.setLineWidth(0.2);
      doc.line(margin, margin - 6, pageWidth - margin, margin - 6);
    }
  }
}
