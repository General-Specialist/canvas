import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Tag, Plus } from '@phosphor-icons/react';
import { TAG_COLORS } from '../../types/focus';
import { useFocus } from '../../context/FocusContext';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({ isOpen, onClose }) => {
  const { tags, createMultipleTags, updateTag, deleteTag } = useFocus();
  const [tagInput, setTagInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [editingColorTagId, setEditingColorTagId] = useState<string | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setEditingColorTagId(null);
      }
    };
    if (editingColorTagId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingColorTagId]);

  if (!isOpen) return null;

  const parsedTagNames = tagInput
    .split(/[,;\n]/)
    .map((s) => s.trim().replace(/^#/, ''))
    .filter(Boolean);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedTagNames.length > 0) {
      createMultipleTags(parsedTagNames, selectedColor);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#58CC02]" weight="bold" />
            <h3 className="text-sm font-bold text-[var(--text-hover)]">Manage Tags</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-light)] hover:text-[var(--text-normal)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Create Tags Form */}
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)]">
                Tag Name(s)
              </label>
              <span className="text-[10px] text-[var(--text-light)]">
                Separate with commas
              </span>
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. Studying, Exercise, Admin, Reading"
              autoFocus
              className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-normal)] placeholder:text-[var(--text-light)]/50 focus:outline-none focus:border-[#58CC02] transition-colors"
            />

            {/* Live parsed previews when typing multiple tags */}
            {parsedTagNames.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-[var(--text-light)] mr-0.5">Creating {parsedTagNames.length} tags:</span>
                {parsedTagNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-hover)]"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          i === 0
                            ? selectedColor
                            : TAG_COLORS[(tags.length + i) % TAG_COLORS.length],
                      }}
                    />
                    #{name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)] mb-1.5 block">
              {parsedTagNames.length > 1 ? 'Primary Color' : 'Color'}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer hover:scale-110"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check size={12} className="text-white" weight="bold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={parsedTagNames.length === 0}
            className="w-full py-2 rounded-lg bg-[#58CC02] text-white text-xs font-semibold hover:bg-[#46A302] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            <span>
              {parsedTagNames.length > 1
                ? `Create ${parsedTagNames.length} Tags`
                : 'Create Tag'}
            </span>
          </button>
        </form>

        {/* Existing Tags List */}
        <div className="pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)]">
              Existing Tags ({tags.length})
            </label>
            <span className="text-[10px] text-[var(--text-light)]">Click color dot to change</span>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg border border-[var(--border-color)] text-xs transition-colors relative"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Interactive Color Switcher Dot */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingColorTagId(editingColorTagId === tag.id ? null : tag.id)
                      }
                      className="w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ring-2 ring-[var(--border-color)]"
                      style={{ backgroundColor: tag.color }}
                      title="Click to change tag color"
                    />

                    {/* Inline Color Palette Popover */}
                    {editingColorTagId === tag.id && (
                      <div
                        ref={colorPickerRef}
                        className="absolute left-0 top-full mt-2 p-2 bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 flex items-center gap-1.5 flex-wrap w-44 animate-fadeIn"
                      >
                        {TAG_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              updateTag(tag.id, { color: c });
                              setEditingColorTagId(null);
                            }}
                            className="w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer hover:scale-125"
                            style={{ backgroundColor: c }}
                            title={c}
                          >
                            {tag.color === c && (
                              <Check size={10} className="text-white" weight="bold" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="font-medium text-[var(--text-normal)] truncate">
                    #{tag.name}
                  </span>
                </div>

                {tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteTag(tag.id)}
                    className="text-[var(--text-light)] hover:text-[#FF4B4B] p-1 transition-colors cursor-pointer"
                    title="Delete tag"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
