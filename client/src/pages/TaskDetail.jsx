import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskAPI, submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUpload, FiCheck, FiX, FiClock, FiUser, FiFile, FiImage, FiPaperclip, FiSave, FiTrash2 } from 'react-icons/fi';

const TaskDetail = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressFiles, setProgressFiles] = useState([]);
  const [progressNote, setProgressNote] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitFiles, setSubmitFiles] = useState([]);
  const [submitNotes, setSubmitNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAssigned = task?.assignedTo?._id === user?._id;
  const canApprove = task?.group?.leader === user?._id;

  useEffect(() => {
    fetchTaskData();
  }, [taskId]);

  const fetchTaskData = async () => {
    try {
      const [taskRes, submissionsRes] = await Promise.all([
        taskAPI.getById(taskId),
        submissionAPI.getByTask(taskId)
      ]);
      setTask(taskRes.data.data.task);
      setSubmissions(submissionsRes.data.data.submissions);
    } catch (error) {
      toast.error('Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  // Handle progress update with file/evidence
  const handleProgressFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProgressFiles(prev => [...prev, ...files]);
  };

  const removeProgressFile = (index) => {
    setProgressFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (progressFiles.length === 0 && !progressNote.trim()) {
      toast.error('Vui lòng thêm file hoặc ghi chú làm bằng chứng');
      return;
    }
    if (progressPercent <= task.progress) {
      toast.error('Tiến độ mới phải lớn hơn tiến độ hiện tại');
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('progress', progressPercent);
      formData.append('note', progressNote);
      progressFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await taskAPI.updateProgress(taskId, formData);
      setTask(response.data.data.task);
      toast.success('Cập nhật tiến độ thành công!');
      setShowProgressModal(false);
      setProgressFiles([]);
      setProgressNote('');
      setProgressPercent(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật tiến độ');
    } finally {
      setUpdating(false);
    }
  };

  const openProgressModal = () => {
    setProgressPercent(Math.min(task.progress + 10, 100));
    setShowProgressModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmitFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('notes', submitNotes);
    
    submitFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await submissionAPI.create(formData);
      toast.success('Nộp bài thành công!');
      setShowSubmitModal(false);
      setSubmitFiles([]);
      setSubmitNotes('');
      fetchTaskData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await taskAPI.approve(taskId);
      toast.success('Đã duyệt công việc!');
      fetchTaskData();
    } catch (error) {
      toast.error('Không thể duyệt công việc');
    }
  };

  const handleReject = async () => {
    const feedback = prompt('Nhập lý do từ chối:');
    if (feedback === null) return;
    
    try {
      await taskAPI.reject(taskId, feedback);
      toast.success('Đã từ chối công việc');
      fetchTaskData();
    } catch (error) {
      toast.error('Không thể từ chối công việc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!task) {
    return <div>Công việc không tồn tại</div>;
  }

  const statusLabels = {
    todo: { label: 'To Do', color: 'bg-gray-100 text-gray-600' },
    in_progress: { label: 'Đang làm', color: 'bg-blue-100 text-blue-600' },
    pending_review: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-600' },
    done: { label: 'Hoàn thành', color: 'bg-green-100 text-green-600' }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to={-1} className="text-primary-600 hover:underline mb-2 inline-block">
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className={`badge ${statusLabels[task.status]?.color}`}>
            {statusLabels[task.status]?.label}
          </span>
          {task.group && (
            <Link to={`/groups/${task.group._id}`} className="text-sm text-primary-600 hover:underline">
              {task.group.name}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Mô tả</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {task.description || 'Không có mô tả'}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tiến độ</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600">{task.progress}%</span>
                <button
                  onClick={openProgressModal}
                  disabled={!isAssigned || task.status === 'done' || updating}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave size={16} />
                  Cập nhật
                </button>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  task.progress === 100 ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>

            {task.progressHistory && task.progressHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cập nhật gần nhất:</h4>
                {task.progressHistory.slice(-1).map((h, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary-600">{h.progress}%</span>
                      <span className="text-sm text-gray-500">
                        {new Date(h.updatedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {h.note && <p className="text-sm text-gray-600">{h.note}</p>}
                    {h.evidence && h.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {h.evidence.map((file, i) => (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary-600 hover:underline bg-white px-2 py-1 rounded border"
                          >
                            <FiFile size={12} />
                            {file.originalName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {task.progress === 100 && isAssigned && task.status !== 'done' && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
              >
                <FiUpload size={18} />
                Nộp bài hoàn thành
              </button>
            )}
          </div>

          {canApprove && task.status === 'pending_review' && (
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-4">Phê duyệt</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="btn-success flex-1 flex items-center justify-center gap-2"
                >
                  <FiCheck size={18} />
                  Duyệt
                </button>
                <button
                  onClick={handleReject}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <FiX size={18} />
                  Từ chối
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Người nhận</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {task.assignedTo?.name?.charAt(0)}
                    </span>
                  </div>
                  <span>{task.assignedTo?.name || 'Chưa giao'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Người tạo</p>
                <p className="mt-1">{task.createdBy?.name}</p>
              </div>

              {task.deadline && (
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className={`mt-1 ${
                    new Date(task.deadline) < new Date() && task.status !== 'done'
                      ? 'text-red-600 font-medium'
                      : ''
                  }`}>
                    {new Date(task.deadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {task.estimatedHours > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Ước lượng</p>
                  <p className="mt-1">{task.estimatedHours} giờ</p>
                </div>
              )}

              {task.difficulty && (
                <div>
                  <p className="text-sm text-gray-500">Độ khó</p>
                  <span className={`badge mt-1 ${
                    task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {task.difficulty === 'easy' ? 'Dễ' :
                     task.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {task.progressHistory && task.progressHistory.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Lịch sử tiến độ</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {task.progressHistory.slice().reverse().map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{new Date(h.updatedAt).toLocaleDateString('vi-VN')}</span>
                    <span className="font-medium">{h.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật tiến độ</h3>
            <form onSubmit={handleProgressSubmit} className="space-y-4">
              {/* Progress Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiến độ: <span className="text-primary-600 font-bold">{progressPercent}%</span>
                </label>
                <input
                  type="range"
                  min={task.progress + 1}
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{task.progress}% (hiện tại)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Quick Buttons */}
              <div className="flex gap-2">
                {[25, 50, 75, 100].filter(p => p > task.progress).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProgressPercent(p)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      progressPercent === p 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File/Ảnh bằng chứng
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleProgressFileChange}
                    className="hidden"
                    id="progress-file-input"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c"
                  />
                  <label htmlFor="progress-file-input" className="cursor-pointer">
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">Click để chọn file</p>
                    <p className="text-xs text-gray-400 mt-1">Ảnh, PDF, Word, Excel, Code...</p>
                  </label>
                </div>

                {/* Preview Files */}
                {progressFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {progressFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <FiImage className="text-green-500" size={16} />
                          ) : (
                            <FiPaperclip className="text-blue-500" size={16} />
                          )}
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProgressFile(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú tiến độ
                </label>
                <textarea
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Mô tả tiến độ đã làm được: đã hoàn thành phần nào, đang làm gì..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressFiles([]);
                    setProgressNote('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating || (progressFiles.length === 0 && !progressNote.trim())}
                  className="btn-primary flex-1"
                >
                  {updating ? 'Đang lưu...' : 'Lưu tiến độ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nộp bài</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File đính kèm
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: PDF, Word, PowerPoint, Excel, hình ảnh, code
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Thêm ghi chú nếu cần..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || submitFiles.length === 0}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
