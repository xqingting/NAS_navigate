import React, { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogViewerModalProps {
  logId: string;
  onClose: () => void;
  fetchLogContent: (logId: string) => Promise<{ content: string }>;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({
  logId,
  onClose,
  fetchLogContent,
}) => {
  const [logContent, setLogContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLogContent(logId);
        setLogContent(data.content);
      } catch (err) {
        console.error("Failed to fetch log:", err);
        setError(`加载日志失败: ${err instanceof Error ? err.message : String(err)}`);
        setLogContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [logId, fetchLogContent]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#1a1e2b] rounded-lg shadow-xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              日志预览：{logId}
            </h3>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto font-mono text-xs text-white/80 bg-black/20 rounded-b-lg scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {loading && <div className="text-center text-white/50 py-10">加载中...</div>}
            {error && <div className="text-red-400 whitespace-pre-wrap">{error}</div>}
            {logContent && !loading && (
              <pre className="whitespace-pre-wrap break-words">{logContent}</pre>
            )}
            {!logContent && !loading && !error && (
                <div className="text-center text-white/50 py-10">日志内容为空。</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
